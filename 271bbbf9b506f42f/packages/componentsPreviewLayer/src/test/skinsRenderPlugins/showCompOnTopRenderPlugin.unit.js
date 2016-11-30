define(['lodash', 'componentsPreviewLayer/skinsRenderPlugins/showCompOnTopRenderPlugin', 'testUtils'], function(_, showCompOnTopRenderPlugin, testUtils){
    'use strict';

    describe('showCompOnTopRenderPlugin tests ', function () {

        var refData;
        var props;

        beforeEach(function(){
            refData = {"": {style: {}}};
            var siteData = testUtils.mockFactory.mockSiteData();
            props = {
                renderRealtimeConfig: siteData.renderRealtimeConfig
            };
        });


        it('Should do nothing when compsToShowOnTop is empty', function () {

            var originalRefData = _.cloneDeep(refData);

            showCompOnTopRenderPlugin(refData, null, null, props);

            expect(refData).toEqual(originalRefData);
        });

        it('Should add z-index prop with maximum value when compsToShowOnTop equal to the component id', function () {

            var MAX_Z_INDEX = Math.pow(2, 31) - 1;
            var componentId = 'mockCompId';
            props.renderRealtimeConfig.compsToShowOnTop = componentId;
            props.id = componentId;

            showCompOnTopRenderPlugin(refData, null, null, props);

            expect(refData[""].style.zIndex).toEqual(MAX_Z_INDEX);
        });

        it('Should do nothing when compsToShowOnTop value is not equal to the comp id', function () {

            var originalRefData = _.cloneDeep(refData);
            props.id = 'mockCompId';
            props.renderRealtimeConfig.compsToShowOnTop = 'differentMockCompId';

            showCompOnTopRenderPlugin(refData, null, null, props);

            expect(refData).toEqual(originalRefData);
        });

    });

});
