define(['lodash', 'testUtils', 'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/constants/constants',
        'documentServices/structure/structureUtils'], function (_, testUtils,
                                                                privateServicesHelper,
                                                                constants, structureUtils) {
        'use strict';


        var privateServices;

        function prepareTest(pagesData, measureMap) {
            var siteData = privateServicesHelper.getSiteDataWithPages(pagesData).addMeasureMap(measureMap);
            privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            privateServices.siteAPI.getSiteAspect = function() {
                return {
                    getComponentsActiveModes: function () {
                        return ['myCoolModeId'];
                    }
                };
            };
        }

        function getCompPointer(compId) {
            var pagePointer = privateServices.pointers.components.getPage('mainPage', constants.VIEW_MODES.DESKTOP);
            var compPointer = privateServices.pointers.components.getComponent(compId, pagePointer);
            return compPointer;
        }

        describe('structureUtils', function () {

            describe('getBoundingLayout, getLayoutFromBoundingLayout', function () {
                var layout, boundingLayout;

                beforeEach(function () {
                    layout = {
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 300,
                        rotationInDegrees: 90
                    };

                    boundingLayout = {
                        x: -50,
                        y: 50,
                        width: 300,
                        height: 200
                    };
                });

                it('getBoundingLayout(layout) -> should return the bounding layout from a regular layout ', function () {
                    expect(structureUtils.getBoundingLayout({}, layout)).toEqual(boundingLayout);
                });

                it('getLayoutFromBoundingLayout(boundingLayout, angle) -> should return the regular layout from a bounding layout with the current angle', function () {
                    var currentAngle = 90;

                    expect(structureUtils.getLayoutFromBoundingLayout({}, boundingLayout, currentAngle)).toEqual(layout);
                });
            });


            it('canMoveDataItemToAnotherPage', function () {
                expect(structureUtils.canMoveDataItemToAnotherPage('MAIN_MENU')).toBeFalsy();
                expect(structureUtils.canMoveDataItemToAnotherPage('CUSTOM_MENUS')).toBeFalsy();
                expect(structureUtils.canMoveDataItemToAnotherPage('CUSTOM_MAIN_MENU')).toBeFalsy();
                expect(structureUtils.canMoveDataItemToAnotherPage('masterPage')).toBeFalsy();
                expect(structureUtils.canMoveDataItemToAnotherPage('BLA_BLA')).toBeTruthy();
            });

            describe('getComponentLayout', function () {

                it('should convert layout with docked data to layout with x, y, width and height instead', function () {
                    var measureMap = {
                        width: {'container': 100, 'childA': 100},
                        height: {'container': 100, 'childA': 100},
                        left: {'container': 100, 'childA': 12},
                        top: {'container': 100, 'childA': 10}
                    };

                    prepareTest({
                        'mainPage': {
                            components: [
                                {
                                    id: 'container',
                                    layout: {x: 100, y: 100, width: 100, height: 100},
                                    children: [
                                        {
                                            id: 'childA',
                                            layout: {
                                                y: 10,
                                                width: 100,
                                                height: 100,
                                                rotationInDegrees: 0,
                                                docked: {left: {px: 12}}
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }, measureMap);

                    var compPointer = getCompPointer('childA');
                    var componentLayout = structureUtils.getComponentLayout(privateServices, compPointer);

                    expect(componentLayout).toContain({
                        x: 12,
                        y: 10,
                        width: 100,
                        height: 100
                    });
                });
            });
        });
    });
