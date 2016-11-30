define(['lodash', 'testUtils', 'utils',
    'definition!documentServices/structure/structure',
    'fake!documentServices/anchors/anchors',
    'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/component/componentStructureInfo',
    'documentServices/component/componentModes',
    'documentServices/constants/constants',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/measure/fixedComponentMeasuring',
    'documentServices/structure/structureUtils',
    'documentServices/structure/relativeToScreenPlugins/relativeToScreenPlugins',
    'documentServices/dataModel/dataModel',
    'documentServices/structure/utils/layoutConstraintsUtils',
    'documentServices/hooks/layoutHooksRegistrar',
    'documentServices/hooks/hooks',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/smartBoxes/groupingUtils',
    'documentServices/structure/utils/windowScroll',
    'documentServices/structure/utils/componentLayout',
    'documentServices/structure/utils/layoutValidation',
    'documentServices/structure/siteGapMap',
    'documentServices/bi/events.json',
    'documentServices/page/popupUtils',
    'documentServices/measure/textMeasuring',
    'documentServices/actionsAndBehaviors/actionsAndBehaviors',
    'animations',
    'experiment',
    'documentServices/dataModel/ConnectionSchemas.json'], function
    (_, testUtils, utils, structureDefinition, fakeAnchors, componentsMetaData, componentStructureInfo, componentModes,
     constants, privateServicesHelper, fixedComponentMeasuring, structureUtils, relativeToScreenPlugins, dataModel,
     layoutConstraintsUtils, layoutHooksRegistrar, hooks, documentModeInfo, groupingUtils, windowScroll, componentLayout,
     layoutValidation, siteGapMap, biEvents, popupUtils, textMeasuring, actionsAndBehaviors, animations, experiment, connectionSchemas) {
    'use strict';


    describe("setContainer", function () {
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

        var structure = structureDefinition(_, utils, fakeAnchors, componentsMetaData, componentStructureInfo,
            componentModes, fixedComponentMeasuring, structureUtils, constants, relativeToScreenPlugins, dataModel,
            mockDataSchemas, mockPropertiesSchemas, mockDesignSchemas, mockBehaviorSchemas, textMeasuring, connectionSchemas, layoutConstraintsUtils, hooks, documentModeInfo,
            groupingUtils, windowScroll, componentLayout, layoutValidation, siteGapMap, biEvents, popupUtils,
            actionsAndBehaviors, animations, experiment);

        function getCompPointer(ps, compId, pageId) {
            var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            return ps.pointers.components.getComponent(compId, page);
        }


        var privateApi, siteData;
        var compObj,
            compPointer,
            oldParentPointer,
            oldParent,
            newParentObj,
            pagesContainer,
            newParentPointer;

        beforeEach(function () {
            compObj = {
                id: 'first',
                layout: {
                    x: 50,
                    y: 50,
                    width: 100,
                    height: 100
                }
            };
            oldParent = {
                id: 'oldParent',
                layout: {
                    x: 100,
                    y: 50,
                    width: 200,
                    height: 200
                },
                components: [compObj],
                componentType: 'container'
            };
            newParentObj = {
                id: 'newParent',
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
                    x: 300,
                    y: 300,
                    width: 200,
                    height: 200
                }
            };


            siteData = testUtils.mockFactory.mockSiteData();
            siteData.pagesData.masterPage.structure.children = [pagesContainer];
            siteData.addPageWithDefaults('page1', [newParentObj, oldParent]);
            var pageWidth = siteData.getSiteWidth();
            var heightMeasureMap = {};
            var widthMeasureMap = {};
            heightMeasureMap[constants.MASTER_PAGE_ID] = 600;
            widthMeasureMap[constants.MASTER_PAGE_ID] = 1000;


            siteData.addMeasureMap({
                clientWidth: pageWidth,
                height: heightMeasureMap,
                width: widthMeasureMap
            });

            spyOn(componentsMetaData.public, 'isContainable').and.returnValue(true);
            spyOn(fakeAnchors, 'updateAnchors');
        });

        describe("same page", function () {
            beforeEach(function () {
                privateApi = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                privateApi.siteAPI.getScroll = function () { return {x: 0, y: 0}; };

                compPointer = getCompPointer(privateApi, 'first', 'page1');
                newParentPointer = getCompPointer(privateApi, 'newParent', 'page1');
                oldParentPointer = getCompPointer(privateApi, 'oldParent', 'page1');
            });

            it('Should delete component from old container components array and add to the new container', function () {

                structure.setContainer(privateApi, {}, compPointer, newParentPointer);

                var newParentComp = privateApi.dal.get(newParentPointer);
                var oldParentComp = privateApi.dal.get(oldParentPointer);

                expect(oldParentComp.components.length).toBe(0);
                expect(newParentComp.components.length).toBe(1);
                expect(newParentComp.components[0].id).toEqual(compObj.id);
                expect(fakeAnchors.updateAnchors.calls.mostRecent().args[1]).not.toBeUndefined();
            });

            it('Should update component layout to be relative to the new container', function () {
                var expectedPosition = {
                    x: compObj.layout.x + oldParent.layout.x - newParentObj.layout.x,
                    y: compObj.layout.y + oldParent.layout.y - newParentObj.layout.y
                };

                structure.setContainer(privateApi, {}, compPointer, newParentPointer);
                var component = privateApi.dal.get(compPointer);

                var actualPosition = _.pick(component.layout, ['x', 'y']);
                expect(actualPosition).toEqual(expectedPosition);
            });


            it('Should notify layout to update anchors and render', function () {
                structure.setContainer(privateApi, {}, compPointer, newParentPointer);

                expect(fakeAnchors.updateAnchors).toHaveBeenCalled();
            });

        });


        describe('When new parent is in a different page', function () {
            beforeEach(function () {
                var newParent2 = _.clone(newParentObj);
                newParent2.id = 'newParent2';
                siteData.pagesData.masterPage.structure.children.push(newParent2);
                siteData.addData([{
                    id: 'someData',
                    type: 'someType',
                    mockRef: '#ref0',
                    mockRefList: [
                        '#ref1',
                        '#ref2'
                    ],
                    emptyKey: null
                }, {id: 'ref0'}, {id: 'ref1'}, {id: 'ref2'}], 'page1');
                siteData.addProperties({id: 'someProperties'}, 'page1');
                compObj.dataQuery = '#someData';
                privateApi = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                privateApi.siteAPI.getScroll = function () { return {x: 0, y: 0}; };

                compPointer = getCompPointer(privateApi, 'first', 'page1');
                newParentPointer = getCompPointer(privateApi, 'newParent2', 'masterPage');
                oldParentPointer = getCompPointer(privateApi, 'oldParent', 'page1');
            });

            function checkDataLocation(ps, dataId, oldPageId, newPageId) {
                var newPagePointer = ps.pointers.page.getPageData(newPageId);
                var oldPagePointer = ps.pointers.page.getPageData(oldPageId);
                var newPageData = ps.dal.get(newPagePointer);
                var oldPageData = ps.dal.get(oldPagePointer);

                expect(newPageData[dataId]).toBeDefined();
                expect(oldPageData[dataId]).toBeUndefined();
            }

            it('Should move component data and properties to the new page', function () {
                structure.setContainer(privateApi, {}, compPointer, newParentPointer);

                checkDataLocation(privateApi, 'someData', 'page1', 'masterPage');
                checkDataLocation(privateApi, 'ref0', 'page1', 'masterPage');
                checkDataLocation(privateApi, 'ref1', 'page1', 'masterPage');
                checkDataLocation(privateApi, 'ref2', 'page1', 'masterPage');
                //TODO: add test for properties
                //checkDataLocation(privateApi, 'someProperties', 'page1', 'masterPage');
            });

            //TODO: this is not a realistic test!! if production worked like thid it would break!!!
            it('should not move data items from the blacklist', function () {
                //important part of the test. otherwise it's the same as the previous test
                spyOn(structureUtils, 'canMoveDataItemToAnotherPage').and.returnValue(false);

                structure.setContainer(privateApi, {}, compPointer, newParentPointer);

                checkDataLocation(privateApi, 'someData', 'masterPage', 'page1');
            });

            //TODO: ask guy why should we remove the data before adding it..?
        });
    });

});
