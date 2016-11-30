define(['lodash', 'testUtils', 'documentServices/structure/utils/layoutValidation', 'documentServices/mockPrivateServices/privateServicesHelper'],
function (_, testUtils, layoutValidation, privateServicesHelper) {
    'use strict';

    describe('layoutValidation', function(){
        describe('getValidLayoutToUpdate', function(){
            var ps, compPointer;

            function prepareTestData(compLayout){
                var comp = {
                    id: 'comp-a',
                    layout: compLayout
                };

                var parentComp = {
                    id: 'parent',
                    components: [comp],
                    layout: {
                        width: 500,
                        height: 500,
                        x: 100,
                        y: 100,
                        rotationInDegrees: 0
                    }
                };

                var measureMap = {
                    width: {'parent': parentComp.layout.width},
                    height: {'parent': parentComp.layout.height},
                    left: {'parent': parentComp.layout.x},
                    top: {'parent': parentComp.layout.y}
                };

                var siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('page1', [comp]).addMeasureMap(measureMap);

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                var page = ps.pointers.components.getPage('page1', 'DESKTOP');
                compPointer = ps.pointers.components.getComponent('comp-a', page);
            }

            it('should throw error for fixed component when trying to dock to screen', function(){
                var compLayout = {
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 100,
                    fixedPosition: true
                };
                prepareTestData(compLayout);

                var validateFunc = function(){
                    layoutValidation.getValidLayoutToUpdate(ps, compPointer, {docked: {top: {vh: 0}, bottom: {vh: 0}}});
                };

                expect(validateFunc).toThrow(new Error("Dock to screen component cannot be fixed position"));
            });

            it('should throw error for dock to screen component when trying to toggle fixedPosition', function(){
                var compLayout = {
                    x: 10,
                    y: 10,
                    width: 100,
                    height: 100,
                    docked: {top: {vh: 0}, bottom: {vh: 0}}
                };
                prepareTestData(compLayout);

                var validateFunc = function(){
                    layoutValidation.getValidLayoutToUpdate(ps, compPointer, {fixedPosition: true});
                };

                expect(validateFunc).toThrow(new Error("Dock to screen component cannot be fixed position"));
            });
        });
    });

});
