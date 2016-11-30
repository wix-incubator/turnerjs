define(['lodash', 'testUtils', 'utils',
        'definition!documentServices/structure/structure',
        'fake!documentServices/anchors/anchors',
        'documentServices/componentsMetaData/componentsMetaData',
        'fake!documentServices/component/component',
        'documentServices/component/componentModes',
        'documentServices/constants/constants',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/measure/fixedComponentMeasuring',
        'documentServices/structure/structureUtils',
        'documentServices/structure/relativeToScreenPlugins/relativeToScreenPlugins',
        'documentServices/dataModel/dataModel',
        'documentServices/measure/textMeasuring',
        'documentServices/structure/utils/layoutConstraintsUtils',
        'documentServices/hooks/layoutHooksRegistrar',
        'documentServices/hooks/hooks',
        'documentServices/documentMode/documentModeInfo',
        'documentServices/smartBoxes/groupingUtils',
        'documentServices/structure/utils/windowScroll',
        'documentServices/structure/utils/componentLayout',
        'documentServices/bi/events.json',
        'documentServices/page/popupUtils',
        'documentServices/structure/siteGapMap',
        'documentServices/actionsAndBehaviors/actionsAndBehaviors',
        'animations',
        'documentServices/dataModel/ConnectionSchemas.json',
        'experiment',
        'documentServices/structure/utils/layoutValidation'
    ],
    function (_, testUtils, utils, structureDefinition, fakeAnchors, componentsMetaData, fakeComponent, componentModes,
              constants, privateServicesHelper, fixedComponentMeasuring, structureUtils, relativeToScreenPlugins,
              dataModel, textMeasuring, layoutConstraintsUtils, layoutHooksRegistrar, hooks, documentModeInfo, groupingUtils,
              windowScroll, componentLayout, biEvents, popupUtils, siteGapMap, actionsAndBehaviors, animations, connectionSchemas, experiment, layoutValidation) {
        'use strict';

        describe('Component parent methods:', function () {
            function getCompPointer(ps, compId, pageId) {
                var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                return ps.pointers.components.getComponent(compId, page);
            }

            function setFixedPosition(compPointer, isFixed) {
                var compLayoutComponent = privateApi.pointers.getInnerPointer(compPointer, 'layout');
                privateApi.dal.merge(compLayoutComponent, {fixedPosition: isFixed});
            }

            var mockDataSchemas = {
                someType: {
                    properties: {
                        mockRef: 'ref',
                        mockRefList: 'refList'
                    }
                }
            };
            var mockPropertiesSchemas = {};
            var mockDesignSchemas = {};
            var mockBehaviorSchemas = {};

            var structure,
                compObj,
                compParentObj,
                pagesContainer,
                masterPageParent,
                siteData,
                privateApi;

            beforeEach(function () {
                structure = structureDefinition(_,
                    utils,
                    fakeAnchors,
                    componentsMetaData,
                    fakeComponent,
                    componentModes,
                    fixedComponentMeasuring,
                    structureUtils,
                    constants,
                    relativeToScreenPlugins,
                    dataModel,
                    mockDataSchemas,
                    mockPropertiesSchemas,
                    mockDesignSchemas,
                    mockBehaviorSchemas,
                    textMeasuring,
                    connectionSchemas,
                    layoutConstraintsUtils,
                    hooks,
                    documentModeInfo,
                    groupingUtils,
                    windowScroll,
                    componentLayout,
                    layoutValidation,
                    siteGapMap,
                    biEvents,
                    popupUtils,
                    actionsAndBehaviors,
                    animations,
                    experiment);

                compObj = {
                    id: 'first',
                    compType: 'test.comp.type',
                    layout: {
                        x: 50,
                        y: 50,
                        width: 100,
                        height: 100
                    }
                };
                compParentObj = {
                    id: 'compParentObj',
                    layout: {
                        x: 100,
                        y: 50,
                        width: 200,
                        height: 200
                    },
                    components: [compObj],
                    componentType: 'container'
                };
                masterPageParent = {
                    id: 'masterPageParent',
                    layout: {
                        x: 200,
                        y: 10,
                        width: 200,
                        height: 200
                    },
                    components: [],
                    componentType: 'container'
                };
                pagesContainer = {
                    id: 'PAGES_CONTAINER',
                    componentType: 'wysiwyg.viewer.components.PagesContainer',
                    layout: {
                        x: 0,
                        y: 0,
                        width: 200,
                        height: 200
                    }
                };

                siteData = testUtils.mockFactory.mockSiteData();
                siteData.pagesData.masterPage.structure.children = [pagesContainer, masterPageParent];
                siteData.addPageWithDefaults('page1', [compParentObj]);

                privateApi = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                spyOn(componentsMetaData.public, 'isContainable').and.returnValue(true);
                spyOn(fakeAnchors, 'updateAnchors');
            });

            it('Should return the absolute coordinates of a component', function () {
                var mockSiteWidth = 180;
                var compPointer = getCompPointer(privateApi, compObj.id, 'page1');

                setFixedPosition(compPointer, false);
                var clientWidth = 1000;
                siteData.addMeasureMap({
                    clientWidth: clientWidth,
                    width: {},
                    height: {},
                    top: {},
                    left: {}
                });
                spyOn(siteData, 'getSiteWidth').and.returnValue(mockSiteWidth);
                var expectedPosition = {
                    x: compObj.layout.x + compParentObj.layout.x + pagesContainer.layout.x,
                    y: compObj.layout.y + compParentObj.layout.y + pagesContainer.layout.y
                };
                expectedPosition.x += (clientWidth - mockSiteWidth) * 0.5;

                var position = structure.getCompLayoutRelativeToScreen(privateApi, compPointer);

                expect(position.x).toEqual(expectedPosition.x);
                expect(position.y).toEqual(expectedPosition.y);
            });

            it('Should return the relative to screen coordinates of a component with measurer', function () {
                var mockSiteWidth = 180;
                var compPointer = getCompPointer(privateApi, compObj.id, 'page1');

                setFixedPosition(compPointer, true);
                siteData.addMeasureMap({
                    siteMarginBottom: 40
                });
                spyOn(privateApi.siteAPI, 'getScreenSize').and.returnValue({
                    width: mockSiteWidth,
                    height: 300
                });
                spyOn(fixedComponentMeasuring, 'getMeasuringByType').and.returnValue(_.noop);

                spyOn(fixedComponentMeasuring, 'getFixedComponentMeasurements').and.returnValue({
                    top: 100,
                    left: 100,
                    height: 200,
                    width: 200
                });

                var position = structure.getCompLayoutRelativeToScreen(privateApi, compPointer);

                expect(position.x).toEqual(100);
                expect(position.y).toEqual(100);

                fixedComponentMeasuring.getFixedComponentMeasurements.and.returnValue({
                    top: 'auto',
                    left: 100,
                    height: 100,
                    width: 200
                });

                position = structure.getCompLayoutRelativeToScreen(privateApi, compPointer);

                expect(position.x).toEqual(100);
                expect(position.y).toEqual(160);
            });

            it('Should identify if component is in master page', function () {
                var masterPageCompPointer = getCompPointer(privateApi, masterPageParent.id, 'masterPage');
                expect(structure.isShowOnAllPages(privateApi, masterPageCompPointer)).toBeTruthy();
                var compPointer = getCompPointer(privateApi, compObj.id, 'page1');
                expect(structure.isShowOnAllPages(privateApi, compPointer)).toBeFalsy();
            });

            it('Should identify whether a component\'s position is fixed or not', function () {
                var compPointer = getCompPointer(privateApi, compObj.id, 'page1');
                setFixedPosition(compPointer, true);
                expect(structure.isFixedPosition(privateApi, compPointer)).toBeTruthy();

                setFixedPosition(compPointer, false);
                expect(structure.isFixedPosition(privateApi, compPointer)).toBeFalsy();
            });
        });

    });
