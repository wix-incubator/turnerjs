define(['documentServices/hooks/componentHooks/fiveGridLineHooks',
    'lodash',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'testUtils',
    'documentServices/dataModel/dataModel'], function(fiveGridLineHooks, _, privateServicesHelper, testUtils, dataModel) {
    'use strict';

    describe('FiveGridLine fullScreenModeOn Hook', function() {

        var pageId = 'page1';
        var compId = 'fgl-id';
        var propertiesId = 'fgl-properties-id';
        var compPointer = {id: compId, type: 'DESKTOP'};

        function createMockPrivateServices(fullScreenModeOn, noProps) {
            var siteData = testUtils.mockFactory.mockSiteData();
            var fiveGridLineStructure = {
                "id": compId,
                "layout": {
                },
                "componentType": 'wysiwyg.viewer.components.FiveGridLine',
                "components": [],
                "data": null,
                "propertyQuery": propertiesId
            };

            siteData.addPageWithDefaults(pageId, [fiveGridLineStructure]);

            siteData.addMeasureMap({});

            if (!noProps) {
                siteData.addProperties({
                    id: propertiesId,
                    type: 'FiveGridLineProperties',
                    fullScreenModeOn: fullScreenModeOn
                });
            }

            return privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        describe('fullScreenModeOn property is on', function() {

            it('Should turn it off', function() {
                var ps = createMockPrivateServices(true);

                fiveGridLineHooks.replaceFullScreenPropertyWithDocking(ps, compPointer);

                var compProperties = dataModel.getPropertiesItem(ps, compPointer);
                expect(compProperties.fullScreenModeOn).toBe(false);
            });

            it('Should set a docking value of 0vw', function() {
                var ps = createMockPrivateServices(true);

                fiveGridLineHooks.replaceFullScreenPropertyWithDocking(ps, compPointer);

                var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
                var dockedLayout = ps.dal.get(layoutPointer).docked;

                expect(dockedLayout.left).toEqual({vw:0});
                expect(dockedLayout.right).toEqual({vw:0});
            });

        });

        describe('fullScreenModeOn property is off', function() {

            it('Should keep it off', function() {
                var ps = createMockPrivateServices(false);

                fiveGridLineHooks.replaceFullScreenPropertyWithDocking(ps, compPointer);

                var compProperties = dataModel.getPropertiesItem(ps, compPointer);
                expect(compProperties.fullScreenModeOn).toBe(false);
            });

            it('Should not set any new docking values', function() {
                var ps = createMockPrivateServices(false);

                fiveGridLineHooks.replaceFullScreenPropertyWithDocking(ps, compPointer);

                var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
                var dockedLayout = ps.dal.get(layoutPointer).docked;

                expect(dockedLayout).not.toBeDefined();
            });

        });

        describe('component has no properties', function() {

            it('Should keep it off', function() {
                var ps = createMockPrivateServices(false, true);

                fiveGridLineHooks.replaceFullScreenPropertyWithDocking(ps, compPointer);

                var compProperties = dataModel.getPropertiesItem(ps, compPointer);
                expect(compProperties).toBeNull();
            });
        });

    });
});
