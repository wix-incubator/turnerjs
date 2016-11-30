define(['lodash', 'componentsPreviewLayer/skinsRenderPlugins/showCompWithOpacityRenderPlugin', 'testUtils'], function(_, showCompWithOpacityRenderPlugin, testUtils){
    'use strict';

    describe('showCompWithOpacityRenderPlugin tests ', function () {
        it('Should do nothing when compsToShowWithOpacity is not defined', function () {
            var origRefData = {"": {style: {}}};
            var refData = _.cloneDeep(origRefData);

            var siteData = testUtils.mockFactory.mockSiteData();
            var props = {
                renderRealtimeConfig: siteData.renderRealtimeConfig
            };
            showCompWithOpacityRenderPlugin(refData, null, null, props);

            expect(refData).toEqual(origRefData);
        });

        it('should set the component\'s opacity when it exists in the comps list', function () {
            var refData = {};
            var compId = 'compId1';
            var opacity = 0.7;

            var siteData = testUtils.mockFactory.mockSiteData();
            var props = {
                renderRealtimeConfig: siteData.renderRealtimeConfig
            };
            siteData.setCompsToShowWithOpacity([compId], opacity);

            showCompWithOpacityRenderPlugin(refData, null, {id: compId}, props);

            expect(refData[''].style.opacity).toEqual(opacity);
        });

        it('should not the change component\'s opacity if it\'s not in the comps list', function () {
            var refData = {'': {style: {opacity: 1}}};
            var compId = 'compId1';
            var opacity = 0.7;

            var siteData = testUtils.mockFactory.mockSiteData();
            var props = {
                renderRealtimeConfig: siteData.renderRealtimeConfig
            };
            siteData.setCompsToShowWithOpacity([compId], opacity);

            showCompWithOpacityRenderPlugin(refData, null, {id: 'anotherCompId'}, props);

            expect(refData[''].style.opacity).toEqual(1);
        });
    });

});
