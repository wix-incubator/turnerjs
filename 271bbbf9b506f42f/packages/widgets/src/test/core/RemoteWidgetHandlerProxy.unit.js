define([
    'lodash',
    'testUtils',
    'core',
    'widgets/core/RemoteWidgetHandlerProxy',
    'widgets/core/modelBuilder',
    'widgets/core/widgetService'
], function (_, testUtils, core, RemoteWidgetHandlerProxy, modelBuilder, widgetService) {

    'use strict';

    describe('RemoteWidgetHandlerProxy', function () {

        function getMockPagesData() {
            return {
                currentPageId: 'page1',
                baseUrl: 'mockExternalBaseUrl',
                pagesData: [
                    {
                        id: 'currentPage',
                        fullUrl: 'mockExternalBaseUrl#!currentPage/currentPage',
                        title: '',
                        url: '/currentPage',
                        visible: ''
                    },
                    {
                        id: 'page1',
                        fullUrl: 'mockExternalBaseUrl#!pageUriSEO page1/page1',
                        title: 'title page1',
                        url: '/pageUriSEO page1',
                        visible: false
                    }
                ]
            };
        }

        function getMockCompStructure(compId, layout, nickName) {
            var comp = {
                id: compId,
                componentType: compId + 'Type',
                type: 'Component',
                skin: compId + 'skin',
                propertyQuery: compId + 'PropQuery',
                dataQuery: compId + 'DataQuery',
                styleId: compId + 'PropQuery',
                layout: layout || {},
                modes: {
                    overrides: [{
                        modeIds: ['acive-page-mode-1'],
                        layout: {
                            nir: 'likes-beer'
                        }
                    }]
                }
            };

            if (nickName) {
                _.merge(comp, {
                    nickname: nickName
                });
            }

            return comp;
        }

        function buildStopWidgetsMessage(widgetIdArray) {
            return {
                type: 'stop_widgets',
                widgetIds: widgetIdArray
            };
        }

        beforeEach(function () {
            this.mockSiteData = testUtils.mockFactory.mockSiteData({getPagesDataForRmi: getMockPagesData})
                .addPageWithDefaults('page1')
                .setPageComponents([getMockCompStructure('comp-1234', {}, 'btn'),
                    getMockCompStructure('comp-5678', {}, 'img'),
                    getMockCompStructure('comp-1111', {}, 'gallery'),
                    getMockCompStructure('comp-9999', {}, 'anchor')], 'page1');

            this.mockSiteData.setRootNavigationInfo({pageId: 'page1'});
            this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);

        });


        describe('loadWidgets', function () {


            function initData(routerConfig) {
                this.popupPageId = 'popupPageId';
                var siteModel;
                if (routerConfig) {
                    siteModel = testUtils.mockFactory.mockSiteModel({
                        routers: {
                            configMap: {1: routerConfig}
                        }
                    });
                }
                this.mockSiteData = testUtils.mockFactory.mockSiteData(siteModel, true).addPopupPageWithDefaults(this.popupPageId);
                this.pageId = this.mockSiteData.getFocusedRootId();
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                this.remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                this.wixCodeAppApi = this.mockSiteAPI.getWixCodeAppApi();
            }


            it('should send a load_widgets message', function () {

                var routerConfig = testUtils.mockFactory.routerMocks.routerConfig('somePrefix', 'dataBinding');
                initData.call(this, routerConfig);
                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);

                var rootIds = [this.pageId];

                var widgets = [{
                    type: 'type1',
                    id: 'widget1'
                }, {
                    type: 'type2',
                    id: 'widget2'
                }];

                remoteWidgetHandlerProxy.loadWidgets(widgets, rootIds);

                var expectedMessage = {
                    type: 'load_widgets',
                    widgets: widgets,
                    rootIds: rootIds,
                    routersMap: this.mockSiteData.getRouters()
                };
                expect(this.wixCodeAppApi.sendMessage).toHaveBeenCalledWith(expectedMessage);
            });

            it('should send an empty routers map if there are no routers defined', function () {
                initData.call(this);
                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);

                var rootIds = [this.pageId];

                var widgets = [{
                    type: 'type1',
                    id: 'widget1'
                }, {
                    type: 'type2',
                    id: 'widget2'
                }];

                remoteWidgetHandlerProxy.loadWidgets(widgets, rootIds);

                var expectedMessage = {
                    type: 'load_widgets',
                    widgets: widgets,
                    rootIds: rootIds,
                    routersMap: {}
                };
                expect(this.wixCodeAppApi.sendMessage).toHaveBeenCalledWith(expectedMessage);

            });

            it('should mark the loaded widgets as in active', function () {
                initData.call(this);
                this.mockSiteData.setCurrentPage(this.popupPageId);

                var rootIds = [this.pageId, this.popupPageId];

                var widgets = [{
                    type: 'Page',
                    id: this.pageId
                }, {
                    type: 'Popup',
                    id: this.popupPageId
                }];

                this.remoteWidgetHandlerProxy.loadWidgets(widgets, rootIds);
                this.remoteWidgetHandlerProxy.startWidgets([this.pageId, this.popupPageId]);

                expect(this.remoteWidgetHandlerProxy.getActiveWidgetIds()).toEqual([this.pageId, this.popupPageId]);

                this.remoteWidgetHandlerProxy.loadWidgets([{
                    type: 'Page',
                    id: this.pageId
                }]);

                expect(this.remoteWidgetHandlerProxy.getActiveWidgetIds()).toEqual([this.popupPageId]);
            });
        });

        describe('initWidgets', function () {
            it('should send the passed controllers object as value of the rootId', function () {
                var mockSiteData = testUtils.mockFactory.mockSiteData();
                var pageId = mockSiteData.getFocusedRootId();
                testUtils.mockFactory.mockComponent('platform.components.AppController', mockSiteData, pageId);
                var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(mockSiteData);
                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(mockSiteAPI);
                var wixCodeAppApi = mockSiteAPI.getWixCodeAppApi();
                var controllersToInit = _.zipObject([pageId], [widgetService.getControllersToInit(mockSiteData, pageId)]);
                var expectedInitMessage = _.omit(testUtils.mockFactory.widgetMocks.messages.mockInitMessage(controllersToInit), 'intent');

                remoteWidgetHandlerProxy.initWidgets(controllersToInit);

                expect(wixCodeAppApi.sendMessage).toHaveBeenCalledWith(expectedInitMessage);
            });
        });

        describe('startWidgets', function () {
            beforeEach(function () {
                this.popupPageId = 'popupPageId';
                this.mockSiteData = testUtils.mockFactory.mockSiteData().addPopupPageWithDefaults(this.popupPageId);
                this.pageId = this.mockSiteData.getFocusedRootId();
                this.pageComponent = testUtils.mockFactory.mockComponent('mobile.core.components.Container', this.mockSiteData, this.pageId);
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                this.remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                this.wixCodeAppApi = this.mockSiteAPI.getWixCodeAppApi();
            });
            function getExpectedRequest(contextIds, siteInfo) {
                var siteDataDocumentAPI = this.mockSiteAPI.getSiteDataAPI().document;
                var componentsFetcher = siteDataDocumentAPI.getAllCompsUnderRoot.bind(siteDataDocumentAPI);
                var rmis = _.assign({}, modelBuilder.build(this.mockSiteAPI.getRuntimeDal(), this.mockSiteData, contextIds, _.noop, componentsFetcher));
                var contexts = _.mapValues(rmis, function (rmi) {
                    return rmi.toJson();
                });
                return _.omit(testUtils.mockFactory.widgetMocks.messages.mockStartMessage(contexts, siteInfo), 'intent');
            }

            it('should send a start message with the correct widget contexts and siteInfo', function () {
                var contextIds = [this.pageId];
                var siteInfo = {deviceType: 'desktop'};
                var expectedRequest = getExpectedRequest.call(this, contextIds, siteInfo);

                this.remoteWidgetHandlerProxy.startWidgets(contextIds);


                expect(this.wixCodeAppApi.sendMessage).toHaveBeenCalledWith(expectedRequest);
            });

            it('should not send message upon startWidgets in case contextIds array was passed empty', function () {
                this.remoteWidgetHandlerProxy.startWidgets([]);

                expect(this.wixCodeAppApi.sendMessage).not.toHaveBeenCalled();
            });

            it('should not override already started widgets after adding new ones', function () {
                this.mockSiteData.setCurrentPage(this.popupPageId);
                var firstContextIds = [this.popupPageId];
                var secondContextIds = [this.pageId];

                this.remoteWidgetHandlerProxy.startWidgets(firstContextIds);
                this.remoteWidgetHandlerProxy.startWidgets(secondContextIds);

                var activeWidgets = _.sortBy(this.remoteWidgetHandlerProxy.getActiveWidgetIds());
                expect(activeWidgets).toEqual(_.sortBy(firstContextIds.concat(secondContextIds)));
            });
        });

        describe('stopWidgets', function () {

            beforeEach(function () {
                this.dal = this.mockSiteAPI.getRuntimeDal();
            });

            it('should send terminate message upon stopWidgets', function () {
                var wixCodeAppApi = this.mockSiteAPI.getWixCodeAppApi();
                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);

                var contextIds = [this.mockSiteData.getCurrentUrlPageId()];
                remoteWidgetHandlerProxy.stopWidgets(contextIds);
                expect(wixCodeAppApi.sendMessage).toHaveBeenCalledWith({
                    type: 'stop_widgets',
                    widgetIds: contextIds
                });
            });

            it('should not send terminate message when passed contextIds array is empty', function () {
                var wixCodeAppApi = this.mockSiteAPI.getWixCodeAppApi();
                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);

                remoteWidgetHandlerProxy.stopWidgets([]);

                expect(wixCodeAppApi.sendMessage).not.toHaveBeenCalled();
            });

        });

        describe('stopAllWidgets', function () {
            beforeEach(function () {
                this.popupPageId = 'popupPageId';
                this.mockSiteData = testUtils.mockFactory.mockSiteData().addPopupPageWithDefaults(this.popupPageId);
                this.pageId = this.mockSiteData.getFocusedRootId();
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                this.remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                this.wixCodeAppApi = this.mockSiteAPI.getWixCodeAppApi();
            });

            it('should send terminate message with all registered widget ids', function () {
                this.mockSiteData.setCurrentPage(this.popupPageId);
                this.remoteWidgetHandlerProxy.startWidgets([this.pageId, this.popupPageId]);

                this.remoteWidgetHandlerProxy.stopAllWidgets();

                expect(this.wixCodeAppApi.sendMessage).toHaveBeenCalledWith(buildStopWidgetsMessage([this.pageId, this.popupPageId]));
            });

            it('should not terminate message if no widget was started', function () {
                this.remoteWidgetHandlerProxy.stopAllWidgets();

                expect(this.wixCodeAppApi.sendMessage).not.toHaveBeenCalled();
            });
        });

        describe('onCommand', function () {

            var onCommandMessage = {
                intent: 'WIX_CODE',
                type: 'wix_code_iframe_command'
            };

            it('should call RMI.setData in case of dataChanged', function () {
                onCommandMessage.command = 'dataChanged';
                onCommandMessage.compId = 'comp-5678';
                onCommandMessage.contextId = this.mockSiteData.getPrimaryPageId();
                onCommandMessage.data = {
                    foo: 'bar'
                };
                var dal = this.mockSiteAPI.getRuntimeDal();
                spyOn(dal, 'setCompData');

                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);

                remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);
                remoteWidgetHandlerProxy.onCommand(onCommandMessage);

                expect(dal.setCompData).toHaveBeenCalledWith(onCommandMessage.compId, onCommandMessage.data);
            });

            it('should resolve pageId from uri in case of dataChanged for link', function () {
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                onCommandMessage.command = 'dataChanged';
                onCommandMessage.compName = 'btn';
                onCommandMessage.contextId = pageId;
                onCommandMessage.data = testUtils.mockFactory.dataMocks.buttonData({
                    link: {
                        type: 'PageLink',
                        pageId: pageId
                    }
                });

                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);
                remoteWidgetHandlerProxy.onCommand(onCommandMessage);
                expect(onCommandMessage.data.link.pageId.id).toEqual(pageId);
            });

            it('should resolve pageId after it was already resolved', function () {
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                onCommandMessage.command = 'dataChanged';
                onCommandMessage.compId = 'comp-1234';
                onCommandMessage.contextId = pageId;
                onCommandMessage.data = testUtils.mockFactory.dataMocks.buttonData({
                    link: {
                        type: 'PageLink',
                        pageId: pageId
                    }
                });

                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);

                remoteWidgetHandlerProxy.onCommand(onCommandMessage);
                remoteWidgetHandlerProxy.onCommand(onCommandMessage);

                expect(onCommandMessage.data.link.pageId.id).toEqual(pageId);
            });

            it('should resolve pageId in case of dataChanged for a / link (homapage)', function () {
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                onCommandMessage.command = 'dataChanged';
                onCommandMessage.compId = 'comp-1234';
                onCommandMessage.contextId = pageId;
                onCommandMessage.data = testUtils.mockFactory.dataMocks.buttonData({
                    link: {
                        pageId: '#',
                        type: 'PageLink'
                    }
                });

                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);
                remoteWidgetHandlerProxy.onCommand(onCommandMessage);
                expect(onCommandMessage.data.link.pageId.id).toEqual(this.mockSiteData.getCurrentUrlPageId());
            });

            describe('anchors', function () {
                function getPageComps(connectionQuery) {
                    var compStructure = {
                        type: 'Anchor',
                        id: 'comp-id',
                        dataQuery: 'dataItem-someAnchorData'
                    };
                    if (connectionQuery) {
                        compStructure.connectionQuery = connectionQuery;
                    }
                    return [compStructure];
                }

                function getAnchorData() {
                    return {
                        id: 'dataItem-someAnchorData',
                        compId: 'comp-id'
                    };
                }

                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments('connectionsData');
                    var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('anchor1')];
                    this.siteData = testUtils.mockFactory
                        .mockSiteData()
                        .addPageWithDefaults('page-id', getPageComps('connection1'))
                        .setCurrentPage('page-id')
                        .addData(getAnchorData(), 'page-id')
                        .addConnections(testUtils.mockFactory.connectionMocks.connectionList(connections, 'connection1'), 'page-id');

                    this.siteAPI = testUtils.mockFactory.mockSiteAPI(this.siteData);
                });

                it('should resolve pageId and anchorDataId in case of dataChanged for a / link (homepage) with anchor', function () {
                    var pageId = this.siteAPI.getSiteData().getPrimaryPageId();
                    onCommandMessage.command = 'dataChanged';
                    onCommandMessage.compId = 'comp-id';
                    onCommandMessage.contextId = pageId;
                    onCommandMessage.data = testUtils.mockFactory.dataMocks.buttonData({
                        link: {pageId: '#', anchorDataId: 'anchor1', type: 'AnchorLink'}
                    });

                    var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.siteAPI);
                    remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);

                    remoteWidgetHandlerProxy.onCommand(onCommandMessage);

                    expect(onCommandMessage.data.link.pageId.id).toEqual(this.siteData.getCurrentUrlPageId());
                    expect(onCommandMessage.data.link.anchorDataId).toEqual(getAnchorData());
                });

                it('should resolve pageId/anchorDataId in case of component with linkList property', function () {
                    var pageId = this.siteAPI.getSiteData().getPrimaryPageId();
                    onCommandMessage.command = 'dataChanged';
                    onCommandMessage.compId = 'comp-id';
                    onCommandMessage.contextId = pageId;
                    onCommandMessage.data = testUtils.mockFactory.dataMocks.styledTextData({
                        linkList: [
                            {type: 'PageLink', pageId: pageId},
                            {pageId: '#', type: 'PageLink'},
                            {pageId: '#', anchorDataId: 'anchor1', type: 'AnchorLink'}
                        ]
                    });

                    var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.siteAPI);
                    remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);

                    remoteWidgetHandlerProxy.onCommand(onCommandMessage);

                    expect(onCommandMessage.data.linkList[0].pageId.id).toEqual(pageId);
                    expect(onCommandMessage.data.linkList[1].pageId.id).toEqual(this.siteData.getCurrentUrlPageId());
                    expect(onCommandMessage.data.linkList[2].pageId.id).toEqual(this.siteData.getCurrentUrlPageId());
                    expect(onCommandMessage.data.linkList[2].anchorDataId).toEqual(getAnchorData());
                });
            });

            it('should resolve a dynamic page link from uri in case of dataChanged for link', function () {
                testUtils.experimentHelper.openExperiments('sv_dpages');
                var siteModel = testUtils.mockFactory.mockSiteModel({
                    getPagesDataForRmi: getMockPagesData,
                    routers: {
                        configMap: {
                            3: {
                                prefix: 'animals',
                                appId: 99,
                                config: {},
                                pages: {}
                            }
                        }
                    }
                });
                this.mockSiteData = testUtils.mockFactory.mockSiteData(siteModel, true)
                    .addPageWithDefaults('page1')
                    .setPageComponents([getMockCompStructure('comp-1234', {}, 'btn')], 'page1');

                this.mockSiteData.setRootNavigationInfo({pageId: 'page1'});
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);


                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                onCommandMessage.command = 'dataChanged';
                onCommandMessage.compName = 'btn';
                onCommandMessage.contextId = pageId;
                onCommandMessage.data = testUtils.mockFactory.dataMocks.buttonData({
                    link: {
                        type: 'PageLink',
                        pageId: '#animals/lion'
                    }
                });

                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);
                remoteWidgetHandlerProxy.onCommand(onCommandMessage);
                expect(onCommandMessage.data.link).toEqual({
                    type: 'DynamicPageLink',
                    innerRoute: 'lion',
                    routerId: '3'
                });
            });

            it('should override data with empty data from message in case of dataChanged', function () {
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                onCommandMessage.command = 'dataChanged';
                onCommandMessage.compId = 'comp-1111';
                onCommandMessage.contextId = pageId;
                onCommandMessage.data = testUtils.mockFactory.dataMocks.imageList([]);

                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);
                var dal = this.mockSiteAPI.getRuntimeDal();
                spyOn(dal, 'getCompData').and.returnValue({
                    items: [{foo: 1}]
                });

                var RMI = remoteWidgetHandlerProxy._remoteModelInterfaces[pageId];
                spyOn(RMI, 'setData');

                remoteWidgetHandlerProxy.onCommand(onCommandMessage);
                expect(RMI.setData).toHaveBeenCalledWith('comp-1111', {
                    items: null,
                    type: 'ImageList',
                    id: jasmine.any(String)
                });
            });

            it('should call RMI.setProps in case of propsChanged', function () {
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                onCommandMessage.command = 'propsChanged';
                onCommandMessage.compId = 'comp-5678';
                onCommandMessage.contextId = pageId;
                onCommandMessage.data = {
                    foo: 'bar'
                };
                var dal = this.mockSiteAPI.getRuntimeDal();
                spyOn(dal, 'setCompProps');

                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);

                remoteWidgetHandlerProxy.onCommand(onCommandMessage);

                expect(dal.setCompProps).toHaveBeenCalledWith('comp-5678', onCommandMessage.data);
            });

            it('should call RMI.setDesign in case of designChanged', function () {
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                onCommandMessage.command = 'designChanged';
                onCommandMessage.compId = 'comp-5678';
                onCommandMessage.contextId = pageId;
                onCommandMessage.data = {
                    foo: 'bar'
                };
                var dal = this.mockSiteAPI.getRuntimeDal();
                spyOn(dal, 'setCompDesign');

                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);

                remoteWidgetHandlerProxy.onCommand(onCommandMessage);

                expect(dal.setCompDesign).toHaveBeenCalledWith('comp-5678', onCommandMessage.data);
            });

            it('should call RMI.setLayout in case of layoutChanged', function () {
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                onCommandMessage.command = 'layoutChanged';
                onCommandMessage.compId = 'comp-1234';
                onCommandMessage.contextId = pageId;
                onCommandMessage.data = {
                    foo: 'bar'
                };
                var dal = this.mockSiteAPI.getRuntimeDal();
                spyOn(dal, 'updateCompLayout');
                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);

                remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);
                remoteWidgetHandlerProxy.onCommand(onCommandMessage);

                expect(dal.updateCompLayout).toHaveBeenCalledWith('comp-1234', onCommandMessage.data);
            });

            it('should call RMI.registerEvent in case of registerEvent', function () {
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                onCommandMessage.command = 'registerEvent';
                onCommandMessage.compId = 'comp-1234';
                onCommandMessage.contextId = pageId;
                onCommandMessage.data = {
                    contextId: pageId,
                    eventType: 'click',
                    callbackId: 'callbackId'
                };
                var dal = this.mockSiteAPI.getRuntimeDal();
                spyOn(dal, 'addActionsAndBehaviors');
                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);

                remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);
                remoteWidgetHandlerProxy.onCommand(onCommandMessage);

                var expectedActionBehaviorStructure = {
                    action: testUtils.mockFactory.actionMocks.comp('click', 'comp-1234'),
                    behavior: testUtils.mockFactory.behaviorMocks.widget.runCode('comp-1234', 'callbackId', pageId)
                };
                expect(dal.addActionsAndBehaviors).toHaveBeenCalledWith('comp-1234', expectedActionBehaviorStructure);
            });

            it('should call RMI.unregisterAll when an unregisterAll command is received', function () {
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                onCommandMessage.command = 'unregisterAll';
                onCommandMessage.compId = 'comp-1234';
                onCommandMessage.contextId = pageId;
                onCommandMessage.data = {eventType: 'click'};
                var dal = this.mockSiteAPI.getRuntimeDal();
                spyOn(dal, 'removeActionsAndBehaviors');
                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);

                remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);
                remoteWidgetHandlerProxy.onCommand(onCommandMessage);

                expect(dal.removeActionsAndBehaviors).toHaveBeenCalledWith('comp-1234', {action: {name: onCommandMessage.data.eventType}});
            });

            it('should call behaviorHandler in case of executeBehavior and call onUpdateCallback', function () {
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                var behavior = {
                    type: 'comp',
                    compName: 'btn',
                    targetId: 'comp-1234',
                    params: {}
                };
                var callback = _.noop;
                var forceUpdateCb = jasmine.createSpy('onUpdateCallback');
                var behaviorsService = core.behaviorsService;
                spyOn(behaviorsService, 'handleBehaviors').and.callThrough();

                onCommandMessage.command = 'executeBehavior';
                onCommandMessage.compId = 'comp-1234';
                onCommandMessage.contextId = pageId;
                onCommandMessage.data = behavior;

                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI, forceUpdateCb);
                remoteWidgetHandlerProxy.startWidgets([onCommandMessage.contextId]);

                remoteWidgetHandlerProxy.onCommand(onCommandMessage, callback);

                expect(behaviorsService.handleBehaviors).toHaveBeenCalledWith(this.mockSiteAPI, [behavior], {
                    group: 'command',
                    callback: callback
                }, behavior.type);
                expect(forceUpdateCb).toHaveBeenCalled();
            });

            it('should do nothing if widget is not alive anymore', function () {
                var onUpdateCallback = jasmine.createSpy('onUpdateCallback');
                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI, onUpdateCallback);
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                onCommandMessage.contextId = pageId;
                remoteWidgetHandlerProxy.startWidgets([pageId]);
                remoteWidgetHandlerProxy.stopWidgets([pageId]);

                remoteWidgetHandlerProxy.onCommand(onCommandMessage);

                expect(onUpdateCallback).not.toHaveBeenCalled();
            });
        });

        describe('handleEvent', function () {

            it('should post message', function () {
                var wixCodeAppApi = this.mockSiteAPI.getWixCodeAppApi();
                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                var expectedMsg = {
                    intent: 'WIX_CODE',
                    type: 'wix_code_run_user_function',
                    contextId: pageId,
                    callbackId: 'callbackId',
                    compId: 'compId',
                    event: {
                        name: 'mouseOut',
                        x: '1',
                        y: '2',
                        nativeEvent: {
                            x: '1',
                            y: '2'
                        }
                    }
                };
                remoteWidgetHandlerProxy.handleEvent(pageId, 'runCode', {
                    callbackId: 'callbackId',
                    compId: 'compId'
                }, {
                    name: 'mouseOut',
                    x: '1',
                    y: '2',
                    nativeEvent: {
                        x: '1',
                        y: '2'
                    }
                });
                expect(wixCodeAppApi.sendMessage).toHaveBeenCalledWith(expectedMsg);
            });

            it('should remove all non primitive data from the event except of nativeEvent when calling behaviorsAspect.handleAction', function () {

                var onlyPrimitives = {
                    type: 'custom',
                    zero: 0,
                    number: 5,
                    emptyString: '',
                    string: 'shahzu',
                    trueBoolean: true,
                    falseBoolean: false,
                    undefined: undefined,
                    null: null,
                    NaN: NaN,
                    Infinity: Infinity,
                    nativeEvent: {
                        x: '1',
                        y: '1'
                    }
                };

                var Ctor = function () {
                };

                var eventWithNonPrimitives = _.assign({
                    array: [1, 2, 3],
                    object: {},
                    instance: new Ctor(),
                    dom: window.document.createElement('div'),
                    func: Ctor
                }, onlyPrimitives);

                var wixCodeAppApi = this.mockSiteAPI.getWixCodeAppApi();
                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                var expectedMsg = {
                    intent: 'WIX_CODE',
                    type: 'wix_code_run_user_function',
                    contextId: pageId,
                    callbackId: 'callbackId',
                    compId: 'compId',
                    event: onlyPrimitives
                };
                remoteWidgetHandlerProxy.handleEvent(pageId, 'runCode', {
                    callbackId: 'callbackId',
                    compId: 'compId'
                }, eventWithNonPrimitives);

                expect(wixCodeAppApi.sendMessage).toHaveBeenCalledWith(expectedMsg);
            });

            it('should add the nativeEvent offsetX and offsetY properties when calling behaviorsAspect.handleAction', function () {
                var resultEvent = {
                    type: 'custom',
                    zero: 0,
                    number: 5,
                    emptyString: '',
                    string: 'shahzu',
                    trueBoolean: true,
                    falseBoolean: false,
                    nativeEvent: {
                        offsetX: 12,
                        offsetY: 354
                    }
                };

                var Ctor = function () {
                };

                var eventWithNonPrimitives = _.assign({
                    array: [1, 2, 3],
                    object: {},
                    instance: new Ctor(),
                    dom: window.document.createElement('div'),
                    func: Ctor,
                    nativeEvent: {
                        offsetX: 12,
                        offsetY: 354
                    }
                }, resultEvent);

                var wixCodeAppApi = this.mockSiteAPI.getWixCodeAppApi();
                var remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                var pageId = this.mockSiteAPI.getSiteData().getPrimaryPageId();
                var expectedMsg = {
                    intent: 'WIX_CODE',
                    type: 'wix_code_run_user_function',
                    contextId: pageId,
                    callbackId: 'callbackId',
                    compId: 'compId',
                    event: resultEvent
                };
                remoteWidgetHandlerProxy.handleEvent(pageId, 'runCode', {
                    callbackId: 'callbackId',
                    compId: 'compId'
                }, eventWithNonPrimitives);

                expect(wixCodeAppApi.sendMessage).toHaveBeenCalledWith(expectedMsg);
            });
        });

        describe('handleWidgetUpdate', function () {
            beforeEach(function () {
                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.pageId = this.mockSiteData.getFocusedRootId();
                this.compAId = 'compAId';
                this.compBId = 'compBId';
                this.compA = testUtils.mockFactory.mockComponent('someType', this.mockSiteData, this.pageId, null, false, this.compAId);
                this.compB = testUtils.mockFactory.mockComponent('someType', this.mockSiteData, this.pageId, null, false, this.compBId);
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                this.remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                this.wixCodeAppApi = this.mockSiteAPI.getWixCodeAppApi();
            });

            it('should send a message about the update if updated component is under an active root', function () {
                this.remoteWidgetHandlerProxy.startWidgets([this.pageId]);
                this.wixCodeAppApi.sendMessage.calls.reset();

                var compUpdates = {
                    'compAId': {data: {key: 'new data value'}},
                    'compBId': {state: {key: 'new state value'}}
                };
                this.remoteWidgetHandlerProxy.handleWidgetUpdate(_.clone(compUpdates));

                expect(this.wixCodeAppApi.sendMessage).toHaveBeenCalledWith({
                    type: 'update',
                    contextId: this.pageId,
                    updates: compUpdates
                });
            });

            it('should ignore the update if updated component is *not* under an active root', function () {
                var compUpdates = {
                    'compAId': {data: {key: 'new data value'}},
                    'compBId': {state: {key: 'new state value'}}
                };
                this.remoteWidgetHandlerProxy.handleWidgetUpdate(_.clone(compUpdates));

                expect(this.wixCodeAppApi.sendMessage).not.toHaveBeenCalled();
            });

            it('should ignore the update if it was triggered by itself', function () {
                this.remoteWidgetHandlerProxy.startWidgets([this.pageId]);
                this.wixCodeAppApi.sendMessage.calls.reset();
                spyOn(this.remoteWidgetHandlerProxy, 'handleWidgetUpdate').and.callThrough();

                this.mockSiteAPI.getRuntimeDal().registerChangeListener(function (compId, changeObject) {
                    if (compId === this.compAId && _.isEqual(changeObject.value, {key: 'new data value'})) {
                        this.remoteWidgetHandlerProxy.handleWidgetUpdate({'compAId': {data: {key: 'new data value'}}});
                    }
                }.bind(this));

                this.remoteWidgetHandlerProxy.onCommand({
                    contextId: this.pageId,
                    command: 'dataChanged',
                    compId: this.compAId,
                    data: {key: 'new data value'}
                });

                expect(this.remoteWidgetHandlerProxy.handleWidgetUpdate).toHaveBeenCalledWith({
                    'compAId': {
                        data: {key: 'new data value'}
                    }
                });
                expect(this.wixCodeAppApi.sendMessage).not.toHaveBeenCalled();
            });

            it('should ignore the update if widget was stopped', function () {
                this.remoteWidgetHandlerProxy.startWidgets([this.pageId]);
                this.remoteWidgetHandlerProxy.stopAllWidgets();

                var compUpdates = {
                    'compAId': {data: {key: 'new data value'}},
                    'compBId': {state: {key: 'new state value'}}
                };
                this.remoteWidgetHandlerProxy.handleWidgetUpdate(compUpdates);

                function getMessageType(argsArray) {
                    return argsArray[0].type;
                }

                expect(_.map(this.wixCodeAppApi.sendMessage.calls.allArgs(), getMessageType)).not.toContain('update');
            });

        });

        describe('getActiveWidgetIds', function () {
            beforeEach(function () {
                this.popupPageId = 'popupId';
                this.mockSiteData = testUtils.mockFactory.mockSiteData().addPopupPageWithDefaults(this.popupPageId);
                this.pageId = this.mockSiteData.getFocusedRootId();
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                this.remoteWidgetHandlerProxy = new RemoteWidgetHandlerProxy(this.mockSiteAPI);
                this.mockSiteData.setCurrentPage(this.popupPageId);
            });
            it('should return all initiated widgets', function () {
                var contextIds = [this.pageId, this.popupPageId];
                this.remoteWidgetHandlerProxy.startWidgets(contextIds);

                var activeWidgets = _.sortBy(this.remoteWidgetHandlerProxy.getActiveWidgetIds());
                expect(activeWidgets).toEqual(_.sortBy(contextIds));
            });

            it('should return an empty array if no widget was initiated', function () {
                var activeWidgets = this.remoteWidgetHandlerProxy.getActiveWidgetIds();

                expect(activeWidgets).toEqual([]);
            });

            it('should return an empty array if all widgets were stopped', function () {
                this.remoteWidgetHandlerProxy.startWidgets([this.mockSiteData.getCurrentUrlPageId(), this.popupPageId]);
                this.remoteWidgetHandlerProxy.stopAllWidgets();

                var activeWidgets = this.remoteWidgetHandlerProxy.getActiveWidgetIds();
                expect(activeWidgets).toEqual([]);
            });

            it('should return all initiated widgets that were not stopped', function () {
                this.remoteWidgetHandlerProxy.startWidgets([this.pageId, this.popupPageId]);

                this.remoteWidgetHandlerProxy.stopWidgets([this.popupPageId]);

                var activeWidgets = this.remoteWidgetHandlerProxy.getActiveWidgetIds();
                expect(activeWidgets).toEqual([this.pageId]);
            });
        });

        describe('isWidgetReady', function () {

            it('should return true for a widget which was loaded, started and then set ready', function () {
                var mockSiteData = testUtils.mockFactory.mockSiteData();
                var pageId = mockSiteData.getFocusedRootId();
                testUtils.mockFactory.mockComponent('platform.components.AppController', mockSiteData, pageId);
                var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(mockSiteData);
                var handler = new RemoteWidgetHandlerProxy(mockSiteAPI, _.noop);

                handler.loadWidgets([testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Page', pageId)]);

                handler.startWidgets([pageId]);

                handler.handleRemoteMessage({
                    type: 'widget_ready',
                    widgetId: pageId
                });

                expect(handler.isWidgetReady(pageId)).toEqual(true);
            });

            it('should return false for a widget which was not loaded or initialized', function () {
                var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                var handler = new RemoteWidgetHandlerProxy(mockSiteAPI, _.noop);
                expect(handler.isWidgetReady('testWidget')).toEqual(false);
            });

            it('should return false for a widget which was just loaded', function () {
                var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                var handler = new RemoteWidgetHandlerProxy(mockSiteAPI, _.noop);

                handler.loadWidgets([{
                    id: 'testWidget',
                    type: 'widget type'
                }]);

                expect(handler.isWidgetReady('testWidget')).toEqual(false);
            });

            it('should return false for a widget which was just loaded & initialized', function () {
                var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                var handler = new RemoteWidgetHandlerProxy(mockSiteAPI, _.noop);

                handler.loadWidgets([{
                    id: 'testWidget',
                    type: 'widget type'
                }]);

                handler.initWidgets([{
                    contextId: 'testWidget',
                    type: 'widget type',
                    components: [],
                    displayName: 'widget name'
                }]);

                expect(handler.isWidgetReady('testWidget')).toEqual(false);
            });

            it('should return false for a widget which was stopped after it was ready', function () {
                var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                var handler = new RemoteWidgetHandlerProxy(mockSiteAPI, _.noop);

                handler.loadWidgets([{
                    id: 'testWidget',
                    type: 'widget type'
                }]);

                handler.initWidgets([{
                    contextId: 'testWidget',
                    type: 'widget type',
                    components: [],
                    displayName: 'widget name'
                }]);

                handler.handleRemoteMessage({
                    type: 'widget_ready',
                    widgetId: 'testWidget'
                });

                handler.stopWidgets(['testWidget']);

                expect(handler.isWidgetReady('testWidget')).toEqual(false);
            });

            it('should return false for a widget which was re-loaded after it was ready', function () {
                var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                var handler = new RemoteWidgetHandlerProxy(mockSiteAPI, _.noop);

                handler.loadWidgets([{
                    id: 'testWidget',
                    type: 'widget type'
                }]);

                handler.initWidgets([{
                    contextId: 'testWidget',
                    type: 'widget type',
                    components: [],
                    displayName: 'widget name'
                }]);

                handler.handleRemoteMessage({
                    type: 'widget_ready',
                    widgetId: 'testWidget'
                });

                handler.loadWidgets([{
                    id: 'testWidget',
                    type: 'widget type'
                }]);

                expect(handler.isWidgetReady('testWidget')).toEqual(false);
            });

            it('should return false for a widget which was re-initialized after it was ready', function () {
                var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                var handler = new RemoteWidgetHandlerProxy(mockSiteAPI, _.noop);

                handler.loadWidgets([{
                    id: 'testWidget',
                    type: 'widget type'
                }]);

                handler.initWidgets([{
                    contextId: 'testWidget',
                    type: 'widget type',
                    components: [],
                    displayName: 'widget name'
                }]);

                handler.handleRemoteMessage({
                    type: 'widget_ready',
                    widgetId: 'testWidget'
                });

                handler.initWidgets([{
                    contextId: 'testWidget',
                    type: 'widget type',
                    components: [],
                    displayName: 'widget name'
                }]);

                expect(handler.isWidgetReady('testWidget')).toEqual(false);
            });

            it('should return false for a widget that was set ready before it was initialized', function () {
                var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                var handler = new RemoteWidgetHandlerProxy(mockSiteAPI, _.noop);

                handler.loadWidgets([{
                    id: 'testWidget',
                    type: 'widget type'
                }]);

                handler.handleRemoteMessage({
                    type: 'widget_ready',
                    widgetId: 'testWidget'
                });

                expect(handler.isWidgetReady('testWidget')).toEqual(false);

                handler.initWidgets([{
                    contextId: 'testWidget',
                    type: 'widget type',
                    components: [],
                    displayName: 'widget name'
                }]);

                expect(handler.isWidgetReady('testWidget')).toEqual(false);
            });

            describe('handleRemoteMessage', function () {
                it('should call update callback after handling a widget ready message', function () {
                    var mockSiteData = testUtils.mockFactory.mockSiteData();
                    var pageId = mockSiteData.getFocusedRootId();
                    testUtils.mockFactory.mockComponent('platform.components.AppController', mockSiteData, pageId);
                    var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(mockSiteData);
                    var onUpdate = jasmine.createSpy('onUpdate');
                    var handler = new RemoteWidgetHandlerProxy(mockSiteAPI, onUpdate);

                    handler.loadWidgets([testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Page', pageId)]);
                    handler.startWidgets([pageId]);

                    onUpdate.calls.reset();

                    handler.handleRemoteMessage({
                        type: 'widget_ready',
                        widgetId: pageId
                    });

                    expect(onUpdate).toHaveBeenCalled();
                });

                it('should not handle a non-active widget', function () {
                    var mockSiteData = testUtils.mockFactory.mockSiteData();
                    var pageId = mockSiteData.getFocusedRootId();
                    var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(mockSiteData);
                    var onUpdate = jasmine.createSpy('onUpdate');
                    var handler = new RemoteWidgetHandlerProxy(mockSiteAPI, onUpdate);

                    handler.loadWidgets([testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Page', pageId)]);

                    onUpdate.calls.reset();

                    handler.handleRemoteMessage({
                        type: 'widget_ready',
                        widgetId: pageId
                    });

                    expect(onUpdate).not.toHaveBeenCalled();
                });
            });

        });

    });
});
