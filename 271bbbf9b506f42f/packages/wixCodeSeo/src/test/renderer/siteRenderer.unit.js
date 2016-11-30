define([
    'widgets',
    'wixCode',
    'wixCodeSeo/renderer/siteRenderer'
], function(widgets, wixCode, siteRenderer) {
    'use strict';

    describe('siteRenderer', function() {

        describe('render', function() {
            beforeEach(function() {
                this.siteDataMock = jasmine.createSpy('siteData');
                this.viewerPrivateServicesMock = jasmine.createSpy('viewerPrivateServices');
                this.propsMock = jasmine.createSpy('propsMock');
                this.renderedRoots = ['masterPage'];

                this.wixCodePostMessageService = wixCode.wixCodePostMessageService;
                this.widgetService = widgets.widgetService;

                spyOn(this.wixCodePostMessageService, 'registerMessageHandler');
                spyOn(this.wixCodePostMessageService, 'registerMessageModifier');
                spyOn(this.widgetService, 'createAndRegisterWidgetHandler');
                spyOn(this.widgetService, 'syncAppsState');
            });

            it('should run the wix code related site lifecycle', function() {
                siteRenderer.render(this.siteDataMock, this.viewerPrivateServicesMock, this.propsMock, this.renderedRoots);

                expect(this.wixCodePostMessageService.registerMessageHandler).toHaveBeenCalledWith(jasmine.any(Object), this.wixCodePostMessageService.handleMessage);
                expect(this.wixCodePostMessageService.registerMessageModifier).toHaveBeenCalledWith(jasmine.any(Object), this.wixCodePostMessageService.modifyPostMessage);
                expect(this.widgetService.createAndRegisterWidgetHandler).toHaveBeenCalled();
                expect(this.widgetService.syncAppsState).toHaveBeenCalled();
            });

            it('should call the onReadyCallback when the handler was called with a widgetReadyMsg', function() {
                var onReadyCallback = jasmine.createSpy('onReadyCallback');

                siteRenderer.render(this.siteDataMock, this.viewerPrivateServicesMock, this.propsMock, this.renderedRoots, onReadyCallback);

                var widgetReadyMsg = {intent: 'WIX_CODE', type: 'widget_ready'};
                var siteApi = null;

                this.wixCodePostMessageService.registerMessageHandler.calls.first().args[1](siteApi, widgetReadyMsg);

                expect(onReadyCallback).toHaveBeenCalled();
            });
        });
    });
});
