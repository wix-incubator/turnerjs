define(['lodash', 'componentsPreviewLayer/skinsRenderPlugins/hideTextComponentPlugin', 'testUtils'], function(_, hideTextComponentPlugin, testUtils){
    'use strict';

    describe('hideTextComponentPlugin tests ', function () {

        var refData;
        var props;

        beforeEach(function(){
            refData = {"": {style: {}}};
            var siteData = testUtils.mockFactory.mockSiteData();
            props = {
                renderRealtimeConfig: siteData.renderRealtimeConfig
            };
        });


        it('Should do nothing when hideTextComponent is empty', function () {

            var originalRefData = _.cloneDeep(refData);

            hideTextComponentPlugin(refData, null, null, props);

            expect(refData).toEqual(originalRefData);
        });

        it('Should set visibility hidden when hideTextComponent equal to the component id', function () {

            var componentId = 'mockCompId';
            props.renderRealtimeConfig.hideTextComponent = componentId;
            props.id = componentId;

            hideTextComponentPlugin(refData, null, null, props);

            expect(refData[""].style.visibility).toEqual('hidden');
        });

        it('Should do nothing when hideTextComponent value is not equal to the comp id', function () {

            var originalRefData = _.cloneDeep(refData);
            props.id = 'mockCompId';
            props.renderRealtimeConfig.hideTextComponent = 'differentMockCompId';

            hideTextComponentPlugin(refData, null, null, props);

            expect(refData).toEqual(originalRefData);
        });

    });

});
