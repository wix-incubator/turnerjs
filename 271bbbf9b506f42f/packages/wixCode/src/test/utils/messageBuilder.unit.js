define([
    'lodash',
    'testUtils',
    'wixCode/utils/messageBuilder',
    'wixCode/utils/wixCodeWidgetService',
    'wixCode/services/wixCodeUserScriptsService',
    'widgets'
], function(_,
            testUtils,
            messageBuilder,
            wixCodeWidgetService,
            wixCodeUserScriptsService,
            widgetsModule) {
    'use strict';

    describe('messageBuilder', function() {
        beforeEach(function(){
            this.mockSiteData = testUtils.mockFactory.mockSiteData()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
        });

        describe('getExtendedMessage', function() {

            describe('intent WIX_CODE', function() {
                it('should be added to the given message', function() {
                    var originalMessage = {
                        type: 'my message',
                        key: 'param'
                    };
                    var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteData.rendererModel.clientSpecMap);

                    var returnedMessage = messageBuilder.getExtendedMessage(originalMessage, this.mockSiteData.rendererModel.wixCodeModel, wixCodeSpec, this.mockSiteData);
                    expect(returnedMessage).toEqual(jasmine.objectContaining(originalMessage));
                    expect(returnedMessage.intent).toEqual('WIX_CODE');
                });

                it('should not replace existing intent in the given message', function() {
                    var originalMessage = {
                        type: 'my message',
                        key: 'param',
                        intent: 'EXISTING'
                    };
                    var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteData.rendererModel.clientSpecMap);

                    var returnedMessage = messageBuilder.getExtendedMessage(originalMessage, this.mockSiteData.rendererModel.wixCodeModel, wixCodeSpec, this.mockSiteData);
                    expect(returnedMessage).toEqual(jasmine.objectContaining(originalMessage));
                    expect(returnedMessage.intent).toEqual(originalMessage.intent);
                });
            });

            describe('appConfig', function() {

                describe('load_widgets messages', function(){
                    it('should not be added with there is no wix code spec', function() {
                        this.mockSiteData = this.mockSiteData.overrideClientSpecMap({});
                        var widgets = [{id: 'wixCodeWidgetId', type: 'Page'}];
                        var originalMessage = testUtils.mockFactory.widgetMocks.messages.mockLoadMessage(widgets);

                        var wixCodeModel = this.mockSiteData.rendererModel.wixCodeModel;
                        var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteData.rendererModel.clientSpecMap);
                        var returnedMessage = messageBuilder.getExtendedMessage(originalMessage, wixCodeModel, wixCodeSpec, this.mockSiteData);

                        expect(returnedMessage).toEqual(jasmine.objectContaining(originalMessage));
                        expect(returnedMessage).toEqual(_.assign({}, originalMessage, {intent: 'WIX_CODE'}));
                    });

                    it('should be added to the wixCode widget on load_widgets messages', function() {
                        var widgets = [{id: 'wixCodeWidgetId', type: 'Page'}];
                        var originalMessage = testUtils.mockFactory.widgetMocks.messages.mockLoadMessage(widgets);
                        var wixCodeModel = this.mockSiteData.rendererModel.wixCodeModel;
                        var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteData.rendererModel.clientSpecMap);
                        var returnedMessage = messageBuilder.getExtendedMessage(originalMessage, wixCodeModel, wixCodeSpec, this.mockSiteData);

                        expect(returnedMessage).toEqual(jasmine.objectContaining(originalMessage));
                        expect(returnedMessage.widgets[0].appConfig).toEqual({
                            userScript: wixCodeUserScriptsService.getUserScript(widgets[0], wixCodeModel, wixCodeSpec, this.mockSiteData),
                            scari: wixCodeModel.signedAppRenderInfo
                        });
                    });

                    it('should be added to the dataBinding widget on load_widgets messages', function() {
                        var widgets = [{id: 'dataBinding', type: 'Application'}];
                        var originalMessage = testUtils.mockFactory.widgetMocks.messages.mockLoadMessage(widgets);
                        var wixCodeModel = this.mockSiteData.rendererModel.wixCodeModel;
                        var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteData.rendererModel.clientSpecMap);

                        var returnedMessage = messageBuilder.getExtendedMessage(originalMessage, wixCodeModel, wixCodeSpec, this.mockSiteData);
                        expect(returnedMessage).toEqual(jasmine.objectContaining(originalMessage));
                        expect(returnedMessage.widgets[0].appConfig).toEqual({
                            scari: wixCodeModel.signedAppRenderInfo
                        });
                    });

                    it('should not be added to widgets that are neither wixCode nor dataBinding on load_widgets messages', function(){
                        var widgets = [
                            {id: 'appAInnerId', type: 'Application', url: 'appAUrl'},
                            {id: 'wixCodeWidgetId', type: 'Page'}
                        ];
                        var originalMessage = testUtils.mockFactory.widgetMocks.messages.mockLoadMessage(widgets);
                        var wixCodeModel = this.mockSiteData.rendererModel.wixCodeModel;
                        var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteData.rendererModel.clientSpecMap);

                        var returnedMessage = messageBuilder.getExtendedMessage(originalMessage, wixCodeModel, wixCodeSpec, this.mockSiteData);

                        expect(returnedMessage).toEqual(jasmine.objectContaining(originalMessage));
                        expect(returnedMessage.widgets[1].appConfig).toEqual({
                            userScript: wixCodeUserScriptsService.getUserScript(widgets[1], wixCodeModel, wixCodeSpec, this.mockSiteData),
                            scari: wixCodeModel.signedAppRenderInfo
                        });
                        expect(returnedMessage.widgets[0].appConfig).toBeUndefined();
                    });

                    it('should not be added to any widget in case there are no wixCode or dataBinding widgets on load_widgets messages', function(){
                        var widgets = [
                            {id: 'appAInnerId', type: 'Application', url: 'appAUrl'},
                            {id: 'appBInnerId', type: 'Application', url: 'appBUrl'}
                        ];
                        var originalMessage = testUtils.mockFactory.widgetMocks.messages.mockLoadMessage(widgets);
                        var wixCodeModel = this.mockSiteData.rendererModel.wixCodeModel;
                        var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteData.rendererModel.clientSpecMap);

                        var returnedMessage = messageBuilder.getExtendedMessage(originalMessage, wixCodeModel, wixCodeSpec, this.mockSiteData);

                        expect(returnedMessage).toEqual(jasmine.objectContaining(originalMessage));
                        expect(returnedMessage.widgets[0].appConfig).toBeUndefined();
                        expect(returnedMessage.widgets[1].appConfig).toBeUndefined();
                    });

                    it('should be added to all widgets in case they are all wixCode or DataBinding widgets on load_widgets messages', function(){
                        var widgets = [
                            {id: 'wixCodeWidgetIdA', type: 'Popup'},
                            {id: 'wixCodeWidgetIdB', type: 'Page'},
                            {id: 'dataBinding', type: 'Application'}
                        ];
                        var originalMessage = testUtils.mockFactory.widgetMocks.messages.mockLoadMessage(widgets);
                        var wixCodeModel = this.mockSiteData.rendererModel.wixCodeModel;
                        var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteData.rendererModel.clientSpecMap);

                        var returnedMessage = messageBuilder.getExtendedMessage(originalMessage, wixCodeModel, wixCodeSpec, this.mockSiteData);

                        expect(returnedMessage).toEqual(jasmine.objectContaining(originalMessage));
                        expect(returnedMessage.widgets[0].appConfig).toEqual({
                            userScript: wixCodeUserScriptsService.getUserScript(widgets[0], wixCodeModel, wixCodeSpec, this.mockSiteData),
                            scari: wixCodeModel.signedAppRenderInfo
                        });
                        expect(returnedMessage.widgets[1].appConfig).toEqual({
                            userScript: wixCodeUserScriptsService.getUserScript(widgets[1], wixCodeModel, wixCodeSpec, this.mockSiteData),
                            scari: wixCodeModel.signedAppRenderInfo
                        });
                        expect(returnedMessage.widgets[2].appConfig).toEqual({
                            scari: wixCodeModel.signedAppRenderInfo
                        });
                    });
                });

                describe('init_widgets messages', function(){
                    it('should not be added to any widget on init_widgets messages', function(){
                        var siteData = testUtils.mockFactory.mockSiteData();
                        var controllers = widgetsModule.widgetService.getControllersToInit(siteData, siteData.getPrimaryPageId());
                        var originalMessage = testUtils.mockFactory.widgetMocks.messages.mockInitMessage(controllers);
                        var wixCodeSpec = wixCodeWidgetService.getWixCodeSpec(this.mockSiteData.rendererModel.clientSpecMap);

                        var returnedMessage = messageBuilder.getExtendedMessage(originalMessage, this.mockSiteData.rendererModel.wixCodeModel, wixCodeSpec, siteData);

                        expect(returnedMessage).toEqual(originalMessage);
                    });
                });
            });

        });
    });
});
