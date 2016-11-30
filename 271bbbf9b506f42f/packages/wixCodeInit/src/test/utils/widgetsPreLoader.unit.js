define([
    'wixCodeInit/utils/widgetsPreLoader',
    'testUtils',
    'utils',
    'lodash',
    'widgets',
    'wixCode/utils/messageBuilder',
    'wixCode/utils/wixCodeWidgetService'
], function(widgetsPreLoader, testUtils, utils, _, widgets, messageBuilder, wixCodeWidgetService) {
    'use strict';

    describe('widgetsPreLoader', function() {

        beforeEach(function() {
            this.testPageId = 'testPageId';
            this.mockSiteModel = testUtils.mockFactory.mockSiteModel()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                .addPageWithDefaults(this.testPageId);
            this.testUrl = 'http://test.wix.com/testSite/testPageName';
            var self = this;
            spyOn(utils.wixUrlParser, 'parseUrl').and.callFake(function(siteData, url) {
                if (url === self.testUrl) {
                    return {
                        pageId: 'testPageId'
                    };
                }
            });
        });

        describe('asyncGetPreLoadMessage', function() {
            function withoutUrl(result) {
                return _.map(result, _.partialRight(_.omit, 'url'));
            }
            it('should execute the given callback with a load_widgets message for client spec map with wixCode', function(done) {
                var routerConfig = testUtils.mockFactory.routerMocks.routerConfig('somePrefix', 'dataBinding');
                this.mockSiteModel
                    .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                    .addRouterConfig(routerConfig);
                this.mockSiteModel.setPagePlatformApp(this.testPageId, 'wixCode', true);
                this.mockSiteModel.setPagePlatformApp('masterPage', 'wixCode', true);
                var pageDisplayName = this.mockSiteModel.getData(this.testPageId).title;
                var wixCodeApp = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Page', this.testPageId, pageDisplayName);
                var wixCodeMasterPageApp = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('masterPage', this.testPageId);
                var dataBindingApp = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Application', 'dataBinding', 'Data Binding');
                var widgetsToLoad = [dataBindingApp, wixCodeApp, wixCodeMasterPageApp];
                var expectedPreLoadMessage = widgets.messageBuilder.loadWidgetsMessage(widgetsToLoad, _.get(this.mockSiteModel, 'rendererModel.routers.configMap'), [this.testPageId]);
                var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteModel.rendererModel.clientSpecMap);
                var siteData = new utils.SiteData(this.mockSiteModel);
                expectedPreLoadMessage = messageBuilder.getExtendedMessage(expectedPreLoadMessage, this.mockSiteModel.rendererModel.wixCodeModel, wixCodeSpec, siteData);

                var callback = function(message) {
                    expect(_.omit(message, 'widgets')).toEqual(_.omit(expectedPreLoadMessage, 'widgets'));
                    expect(withoutUrl(message.widgets)).toEqual(withoutUrl(expectedPreLoadMessage.widgets));
                    expect(_(message.widgets).chain().find('url').get('url')).toMatch(/http:\/\/static\.parastorage\.com\/services\/dbsm-viewer-app\/\d+\.\d+\.\d+\/app\.js/);
                    done();
                };

                widgetsPreLoader.asyncGetPreLoadMessage(this.mockSiteModel, this.testUrl, callback);
            });

           it('should execute the given callback with an empty widget array if client spec map contains no platform app', function(done){
                var routerConfig = testUtils.mockFactory.routerMocks.routerConfig('somePrefix', 'dataBinding');
                var siteModel = testUtils.mockFactory.mockSiteModel()
                    .addPageWithDefaults(this.testPageId)
                    .addRouterConfig(routerConfig);
                var expectedPreLoadMessage = testUtils.mockFactory.widgetMocks.messages.mockLoadMessage([], _.get(siteModel, 'rendererModel.routers.configMap'), [this.testPageId]);
                var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteModel.rendererModel.clientSpecMap);
                var siteData = new utils.SiteData(this.mockSiteModel);
                expectedPreLoadMessage = messageBuilder.getExtendedMessage(expectedPreLoadMessage, siteModel.rendererModel.wixCodeModel, wixCodeSpec, siteData);
                var callback = function(message) {
                    expect(message).toEqual(expectedPreLoadMessage);
                    done();
                };

                widgetsPreLoader.asyncGetPreLoadMessage(siteModel, this.testUrl, callback);
            });

            it('should execute the given callback with an empty routersMap if there are no routers', function(done){
                var siteModel = testUtils.mockFactory.mockSiteModel()
                    .addPageWithDefaults(this.testPageId);

                var callback = function(message) {
                    expect(message.routersMap).toEqual({});
                    done();
                };

                widgetsPreLoader.asyncGetPreLoadMessage(siteModel, this.testUrl, callback);
            });

            xit('should execute the given callback with a load_widgets message for client spec map with both wixCode and platform apps', function(done){
                var ecomCSMDef = {
                    type: 'newEcom',
                    applicationId: 30,
                    appDefinitionId: 'someAppId',
                    url: 'http://wix.com/ecomUrl'
                };
                var blogCSMDef = {
                    type: 'newBlog',
                    applicationId: 31,
                    addDefinitionId: 'anotherAppId',
                    url: 'http://wix.com/blogUrl'
                };
                this.mockSiteModel.updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode({apps: [ecomCSMDef, blogCSMDef]}));

                var widgetMessagesMocks = testUtils.mockFactory.widgetMocks.messages;
                var expectedPreLoadMessage = widgetMessagesMocks.mockLoadMessage([
                    widgetMessagesMocks.mockAppWidgetDef(ecomCSMDef.applicationId, ecomCSMDef.url),
                    widgetMessagesMocks.mockAppWidgetDef(blogCSMDef.applicationId, blogCSMDef.url)
                ]);
                var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteModel.rendererModel.clientSpecMap);
                expectedPreLoadMessage = messageBuilder.getExtendedMessage(expectedPreLoadMessage, this.mockSiteModel.rendererModel.wixCodeModel, wixCodeSpec);

                var callback = function(message) {
                    expect(message).toEqual(expectedPreLoadMessage);
                    done();
                };

                widgetsPreLoader.asyncGetPreLoadMessage(this.mockSiteModel, this.testUrl, callback);
            });
        });

        describe('asyncGetPreInitMessage', function() {
            beforeEach(function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData(this.mockSiteModel);
            });
            it('should execute the given callback with a init_widgets message for client spec map with wixCode', function(done) {
                testUtils.mockFactory.mockComponent('platform.components.AppController', this.mockSiteData, this.testPageId);
                var mockControllersData = _.zipObject([this.testPageId], [widgets.widgetService.getControllersToInit(this.mockSiteData, this.testPageId)]);
                var expectedPreInitMessage = testUtils.mockFactory.widgetMocks.messages.mockInitMessage(mockControllersData);
                var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteModel.rendererModel.clientSpecMap);
                expectedPreInitMessage = messageBuilder.getExtendedMessage(expectedPreInitMessage, this.mockSiteModel.rendererModel.wixCodeModel, wixCodeSpec);

                var callback = function(message) {
                    expect(message).toEqual(expectedPreInitMessage);
                    done();
                };

                widgetsPreLoader.asyncGetPreInitMessage(this.mockSiteData, this.testUrl, callback);
            });

            it('should execute the given callback with an empty widget array if client spec map contains no platform app', function(done){
                var expectedPreInitMessage = testUtils.mockFactory.widgetMocks.messages.mockInitMessage(_.zipObject([this.testPageId], [{}]));
                var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteModel.rendererModel.clientSpecMap);
                expectedPreInitMessage = messageBuilder.getExtendedMessage(expectedPreInitMessage, this.mockSiteModel.rendererModel.wixCodeModel, wixCodeSpec);
                var callback = function(message) {
                    expect(message).toEqual(expectedPreInitMessage);
                    done();
                };

                widgetsPreLoader.asyncGetPreInitMessage(this.mockSiteData, this.testUrl, callback);
            });
        });

        describe('filterPreLoadedWidgets', function() {

            it('should filter pre-loaded widgets from a load_widgets message', function() {
                var rootIds = ['preloadedPage', 'preloadedPopup'];
                var preloadedPageWidget = {
                    type: 'Page',
                    id: 'preloadedPage'
                };
                var preloadedPopupWidget = {
                    type: 'Popup',
                    id: 'preloadedPopup'
                };
                var preLoadMessage = widgets.messageBuilder.loadWidgetsMessage([preloadedPageWidget, preloadedPopupWidget], null, rootIds);

                var newWidget = {
                    type: 'Page',
                    id: 'notPreloaded'
                };
                var loadMessage = widgets.messageBuilder.loadWidgetsMessage([preloadedPageWidget, preloadedPopupWidget, newWidget], null, rootIds);

                var filteredMessage = widgetsPreLoader.filterPreLoadedWidgets(preLoadMessage, loadMessage);

                expect(filteredMessage).toEqual({
                    type: 'load_widgets',
                    widgets: [newWidget],
                    rootIds: rootIds,
                    routersMap: {}
                });
            });

            it('should return null if after filtering, the load_widgets message is empty', function() {
                var rootIds = ['preloadedPage', 'preloadedPopup'];
                var preloadedPageWidget = {
                    type: 'Page',
                    id: 'preloadedPage'
                };
                var preloadedPopupWidget = {
                    type: 'Popup',
                    id: 'preloadedPopup'
                };
                var preLoadMessage = widgets.messageBuilder.loadWidgetsMessage([preloadedPageWidget, preloadedPopupWidget], null, rootIds);

                var loadMessage = _.cloneDeep(preLoadMessage);

                var filteredMessage = widgetsPreLoader.filterPreLoadedWidgets(preLoadMessage, loadMessage);

                expect(filteredMessage).toEqual(null);
            });

            it('should not alter a load_widgets message that does not contain the pre-loaded widgets', function() {
                var rootIds = ['preloadedPage', 'preloadedPopup'];
                var preloadedPageWidget = {
                    type: 'Page',
                    id: 'preloadedPage'
                };
                var preloadedPopupWidget = {
                    type: 'Popup',
                    id: 'preloadedPopup'
                };
                var preLoadMessage = widgets.messageBuilder.loadWidgetsMessage([preloadedPageWidget, preloadedPopupWidget], null, rootIds);

                var newWidget = {
                    type: 'Page',
                    id: 'notPreloaded'
                };
                var loadMessage = widgets.messageBuilder.loadWidgetsMessage([newWidget], null, rootIds);


                var filteredMessage = widgetsPreLoader.filterPreLoadedWidgets(preLoadMessage, loadMessage);

                expect(filteredMessage).toEqual(loadMessage);
            });

            it('should not alter a message which is not of type load_widgets', function() {
                var rootIds = ['preloadedPage', 'preloadedPopup'];
                var preloadedPageWidget = {
                    type: 'Page',
                    id: 'preloadedPage'
                };
                var preloadedPopupWidget = {
                    type: 'Popup',
                    id: 'preloadedPopup'
                };
                var preLoadMessage = widgets.messageBuilder.loadWidgetsMessage([preloadedPageWidget, preloadedPopupWidget], null, rootIds);

                var otherMessage = _.cloneDeep(preLoadMessage);
                otherMessage.type = 'other';

                var filteredMessage = widgetsPreLoader.filterPreLoadedWidgets(preLoadMessage, otherMessage);

                expect(filteredMessage).toEqual(otherMessage);
            });

        });

    });

});
