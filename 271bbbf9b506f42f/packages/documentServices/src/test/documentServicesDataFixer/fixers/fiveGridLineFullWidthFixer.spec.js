define([
    'lodash',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/structure/utils/componentLayout',
    'testUtils/util/mockFactory',
    'documentServices/dataModel/dataModel',
    'documentServices/documentServicesDataFixer/fixers/fiveGridLineFullWidthFixer'
], function (
    _,
    testUtils,
    privateServicesHelper,
    componentLayout,
    mockFactory,
    dataModel,
    fiveGridLineFullWidthFixer
) {
    'use strict';


    function getSiteDataWithComponents(pageId, components) {
        return testUtils.mockFactory.mockSiteData({}, true).addPageWithDefaults(pageId, components);
    }

    describe('fiveGridLineFullWidthFixer', function () {
        beforeEach(function(){

            spyOn(componentLayout, 'getPositionAndSize').and.returnValue({
                x: 30,
                y: 30,
                width: 100,
                height: 100
            });
        });

        describe('when comp is fiveGridLine in full screen mode ', function() {
            it('should dock the comp to screen and set fullScreenModeOn property to false ', function(){
                var components = [];
                var comp = {
                    "id": 'comp1',
                    "layout": {
                    },
                    "componentType": 'wysiwyg.viewer.components.FiveGridLine',
                    "components": [],
                    "data": null,
                    "propertyQuery": 'comp1Props'

                };
                components.push(comp);
                var compPointer = {id: 'comp1', type: 'DESKTOP'};

                var siteData = getSiteDataWithComponents('pageID', components).addProperties({
                    fullScreenModeOn: true,
                    id: 'comp1Props',
                    type: 'FiveGridLineProperties'
                }, 'pageID');
                var mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                fiveGridLineFullWidthFixer.exec(mockPs);
                var compProperties = dataModel.getPropertiesItem(mockPs, compPointer);
                var layoutPointer = mockPs.pointers.getInnerPointer(compPointer, 'layout');
                var dockedLayout = mockPs.dal.get(layoutPointer).docked;

                expect(dockedLayout.left).toEqual({vw:0});
                expect(dockedLayout.right).toEqual({vw:0});
                expect(compProperties.fullScreenModeOn).toBe(false);
            });
        });



        describe('when comp is fiveGridLine and not in full screen mode ', function() {
            it('should do nothing ', function(){
                var components = [];
                var comp = {
                    "id": 'comp1',
                    "layout": {
                    },
                    "componentType": 'wysiwyg.viewer.components.FiveGridLine',
                    "components": [],
                    "data": null,
                    "propertyQuery": 'comp1Props'
                };
                components.push(comp);
                var compPointer = {id: 'comp1', type: 'DESKTOP'};

                var siteData = getSiteDataWithComponents('pageID', components).addProperties({
                    fullScreenModeOn: false,
                    id: 'comp1Props',
                    type: 'FiveGridLineProperties'
                }, 'pageID');
                var mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                fiveGridLineFullWidthFixer.exec(mockPs);
                var compProperties = dataModel.getPropertiesItem(mockPs, compPointer);
                var layoutPointer = mockPs.pointers.getInnerPointer(compPointer, 'layout');
                var dockedLayout = mockPs.dal.get(layoutPointer).docked;

                expect(dockedLayout).toBe(undefined);
                expect(compProperties.fullScreenModeOn).toBe(false);

            });
        });
    });
});
