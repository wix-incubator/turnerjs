define([
    'lodash',
    'utils',
    'experiment',
    'testUtils',
    'documentServices/renderPlugins/renderPlugins',
    'definition!documentServices/renderPlugins/renderPlugins',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (
    _,
    utils,
    experiment,
    testUtils,
    renderPlugins,
    renderPluginsDef,
    privateServicesHelper
) {
    'use strict';
    var ps;

    describe('Document Services - render plugins API', function () {
        var siteData;

        beforeEach(function () {
            siteData = testUtils.mockFactory.mockSiteData();
            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, {siteData: [{
                path: ['renderRealtimeConfig'],
                optional: true
            }]});
        });

        describe('set component to show on top', function () {
            it('should set the value of showOnTopComp prop in the siteDate to the sentParameter', function () {
                var valueToSet = 'someValue';
                siteData.renderRealtimeConfig.compsToShowOnTop = undefined;
                renderPlugins.setCompsToShowOnTop(ps, valueToSet);
                expect(siteData.renderRealtimeConfig.compsToShowOnTop).toBe(valueToSet);
            });

            it('should set the value of hideTextComponent prop in the siteDate to the sentParameter', function () {
                var valueToSet = 'someValue';
                siteData.renderRealtimeConfig.hideTextComponent = undefined;
                renderPlugins.setHideTextComponent(ps, valueToSet);
                expect(siteData.renderRealtimeConfig.hideTextComponent).toBe(valueToSet);
            });
        });

        describe('blocking layer', function () {
           it('should add blocking layer to site data', function () {
                var blockingLayerStyle = {backgroundColor: 'red'};
               renderPlugins.setBlockingLayer(ps, blockingLayerStyle);
               var renderFlagPointer = ps.pointers.general.getRenderFlag('blockingLayer');
               expect(ps.dal.get(renderFlagPointer)).toEqual(blockingLayerStyle);
           });

            it('should add blocking popup layer to site data', function() {
                var blockingPopupLayerStyle = {backgroundColor: 'red'};
                var renderPluginsWithPopups = renderPluginsDef(_, utils, experiment);
                renderPluginsWithPopups.setBlockingPopupLayer(ps, blockingPopupLayerStyle);
                var renderFlagPointer = ps.pointers.general.getRenderFlag('blockingPopupLayer');
                expect(ps.dal.get(renderFlagPointer)).toEqual(blockingPopupLayerStyle);
            });
        });

        describe('set callback to show tooltip from preview', function() {
            it('should set the call back for external links', function() {
                var callback = jasmine.createSpy('external link');

                renderPlugins.setPreviewTooltipCallback(ps, callback);

                expect(siteData.renderRealtimeConfig.previewTooltipCallback).toEqual(callback);
            });

        });
    });
});
