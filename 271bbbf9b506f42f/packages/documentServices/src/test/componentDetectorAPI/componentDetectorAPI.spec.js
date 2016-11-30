define(['lodash',
        'testUtils',
        'documentServices/componentDetectorAPI/componentDetectorAPI',
        'documentServices/documentMode/documentMode',
        'documentServices/constants/constants',
        'documentServices/mockPrivateServices/privateServicesHelper'],
    function (_, testUtils, componentDetectorAPI, documentMode, constants, privateServicesHelper) {
        'use strict';

        var measureMap,
            privateServices,
            pagesData;

        function initPrivateServices(pages, measure) {
            var siteData = testUtils.mockFactory.mockSiteData()
                .addPage(pages)
                .addMeasureMap(measure)
                .setCurrentPage('mainPage');
            privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        }

        describe('ComponentDetectorAPI', function () {
            beforeEach(function(){
                resetTestData();
                initPrivateServices(pagesData, measureMap);
                spyOn(documentMode, 'getViewMode').and.returnValue(constants.VIEW_MODES.DESKTOP);
            });

            function getCompPointer(ps, compId, pageId){
                var page = ps.pointers.components.getPage((pageId || 'masterPage'), constants.VIEW_MODES.DESKTOP);
                return ps.pointers.components.getComponent(compId, page);
            }

            describe('getComponentsAtXYRelativeToScreen', function(){
                it("Should return container component", function () {
                    var comps = componentDetectorAPI.getComponentsAtXYRelativeToScreen(privateServices, 70, 150);
                    expect(comps[0].id).toBe('i1upd1xy');
                });

                it("Should return image placed in container", function () {
                    var comps = componentDetectorAPI.getComponentsAtXYRelativeToScreen(privateServices, 220, 350);
                    expect(comps[0].id).toBe('WPht1-1c2d');
                });

                it("Should return topmost component", function () {
                    var comps = componentDetectorAPI.getComponentsAtXYRelativeToScreen(privateServices, 220, 350);
                    expect(comps[0].id).toBe('WPht1-1c2d');
                });

                describe('select for rotated component', function(){
                    function setDegreesToComp(compId, pageId, degrees){
                        //var pagePointer = privateServices.pointers.page.getPagePointer(pageId);
                        var compPointer = getCompPointer(privateServices, compId, pageId);// privateServices.pointers.components.getComponent(compId, pagePointer);
                        var rotationInDegreesPointer = privateServices.pointers.getInnerPointer(compPointer, 'layout.rotationInDegrees');

                        privateServices.dal.set(rotationInDegreesPointer, degrees);
                    }

                    it("Should *not* choose rotated component", function () {
                        setDegreesToComp('i1vvjiqt', 'mainPage', 0);
                        var selectedBeforeRotate = componentDetectorAPI.getComponentsAtXYRelativeToScreen(privateServices, 125, 725)[0];

                        setDegreesToComp('i1vvjiqt', 'mainPage', 90);
                        var selectedAfterRotate = componentDetectorAPI.getComponentsAtXYRelativeToScreen(privateServices, 125, 725)[0];

                        expect(selectedBeforeRotate.id).toBe('i1vvjiqt');
                        expect(selectedAfterRotate.id).not.toBe('i1vvjiqt');
                    });

                    it("Should choose rotated component", function () {

                        setDegreesToComp('i1vvjiqt', 'mainPage', 0);
                        var selectedBeforeRotate = componentDetectorAPI.getComponentsAtXYRelativeToScreen(privateServices, 175, 675)[0];

                        setDegreesToComp('i1vvjiqt', 'mainPage', 90);
                        var selectedAfterRotate = componentDetectorAPI.getComponentsAtXYRelativeToScreen(privateServices, 175, 675)[0];

                        expect(selectedBeforeRotate.id).not.toBe('i1vvjiqt');
                        expect(selectedAfterRotate.id).toBe('i1vvjiqt');
                    });
                });

                it("Should return component when margin is passed ", function () {
                    var comps = componentDetectorAPI.getComponentsAtXYRelativeToScreen(privateServices, 200, 100, 50);
                    expect(comps[0].id).toBe('i1upd1xy');
                });

                //TODO Check with Gonchar why these fail on PhantomJS (pass in Chrome)
                xit("Should return fixed position component (glued to the bottom-right)", function () {
                    var comps = componentDetectorAPI.getComponentsAtXYRelativeToScreen(privateServices, 940, 850, 50);
                    expect(comps[0].id).toBe('i42k5em5');
                });

                xit("Should return fixed position component (glued to the top-right)", function () {
                    var comps = componentDetectorAPI.getComponentsAtXYRelativeToScreen(privateServices, 940, 40, 50);
                    expect(comps[0].id).toBe('i6aqcri9');
                });

                describe("with z-index", function() {
                    beforeEach(function() {
                        var pages = {
                            "mainPage": {
                                "structure": {
                                    "type": "Page",
                                    "styleId": "p1",
                                    "id": "mainPage",
                                    "components": [
                                        {
                                            "type": "Container",
                                            "styleId": "c1",
                                            "id": "i1vvko5m",
                                            "components": [],
                                            "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                                            "layout": {
                                                "width": 250,
                                                "height": 370,
                                                "x": 639,
                                                "y": 59,
                                                "scale": 1,
                                                "rotationInDegrees": 0,
                                                "anchors": [
                                                ],
                                                "fixedPosition": false
                                            },
                                            "componentType": "mobile.core.components.Container"
                                        }
                                    ],
                                    "dataQuery": "#mainPage",
                                    "skin": "wysiwyg.viewer.skins.page.TransparentPageSkin",
                                    "layout": {
                                        "width": 980,
                                        "height": 1000,
                                        "x": 0,
                                        "y": 0,
                                        "scale": 1,
                                        "rotationInDegrees": 0,
                                        "anchors": [],
                                        "fixedPosition": false
                                    },
                                    "componentType": "mobile.core.components.Page"
                                }
                            },
                            "masterPage": {
                                "structure": {
                                    "type": "Document",
                                    "documentType": "document",
                                    "componentProperties": {},
                                    "themeData": {},
                                    "children": [
                                        {
                                            "type": "Container",
                                            "styleId": "hc1",
                                            "id": "SITE_HEADER",
                                            "components": [],
                                            "skin": "wysiwyg.viewer.skins.screenwidthcontainer.TransparentScreen",
                                            "layout": {
                                                "width": 980,
                                                "height": 70,
                                                "x": 0,
                                                "y": 0,
                                                "scale": 1,
                                                "rotationInDegrees": 0,
                                                "anchors": [],
                                                "fixedPosition": false
                                            },
                                            "componentType": "wysiwyg.viewer.components.HeaderContainer"
                                        },
                                        {
                                            "type": "Container",
                                            "styleId": "pc1",
                                            "id": "PAGES_CONTAINER",
                                            "components": [
                                            ],
                                            "skin": "wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen",
                                            "layout": {
                                                "width": 980,
                                                "height": 500,
                                                "x": 0,
                                                "y": 70,
                                                "scale": 1,
                                                "rotationInDegrees": 0,
                                                "anchors": [],
                                                "fixedPosition": false
                                            },
                                            "componentType": "wysiwyg.viewer.components.PagesContainer"
                                        },
                                        {
                                            type: "Component",
                                            styleId: "tpagw0",
                                            id: "elementBeforeWithZ",
                                            dataQuery: "#c16i1",
                                            skin: "wysiwyg.viewer.skins.TPAWidgetSkin",
                                            layout: {
                                                width: 200,
                                                height: 200,
                                                x: 0,
                                                y: 0,
                                                scale: 1,
                                                rotationInDegrees: 0,
                                                anchors: [],
                                                fixedPosition: false
                                            },
                                            propertyQuery: "i42k5em5",
                                            componentType: "wysiwyg.viewer.components.tpapps.TPAGluedWidget"
                                        },
                                        {
                                            type: "Component",
                                            styleId: "tpagw0",
                                            id: "elementAfter",
                                            dataQuery: "#c1usm",
                                            skin: "wysiwyg.viewer.skins.TPAWidgetSkin",
                                            layout: {
                                                width: 200,
                                                height: 200,
                                                x: 0,
                                                y: 0,
                                                scale: 1,
                                                rotationInDegrees: 0,
                                                anchors: [],
                                                fixedPosition: false
                                            },
                                            propertyQuery: "i6aqcri9",
                                            componentType: "wysiwyg.viewer.components.tpapps.TPAGluedWidget"
                                        }
                                    ],
                                    "id": "masterPage"
                                },
                                "data": {
                                    component_properties: {
                                        "i6aqcri9": {
                                            "id": "i6aqcri9",
                                            "placement": "TOP_LEFT",
                                            "verticalMargin": 0,
                                            "horizontalMargin": 0,
                                            "type": "TPAGluedProperties",
                                            "metaData": {
                                                "isPreset": false,
                                                "schemaVersion": "1.0",
                                                "isHidden": false
                                            }
                                        },
                                        "i42k5em5": {
                                            "id": "i6aqcri9",
                                            "placement": "TOP_LEFT",
                                            "verticalMargin": 0,
                                            "horizontalMargin": 0,
                                            "type": "TPAGluedProperties",
                                            "metaData": {
                                                "isPreset": false,
                                                "schemaVersion": "1.0",
                                                "isHidden": false
                                            }
                                        }
                                    }
                                }
                            }
                        };

                        var measure = {
                            "clientWidth" : 1000,
                            "width": {
                                masterPage: 980
                            },
                            "zIndex": {
                                "elementBeforeWithZ": 2
                            }
                        };

                        initPrivateServices(pages, measure);
                    });

                    it("should return an element with z-index as top-most even when behind in DOM", function() {
                        var comps = componentDetectorAPI.getComponentsAtXYRelativeToScreen(privateServices, 100, 100);
                        expect(comps[0].id).toBe('elementBeforeWithZ');
                        expect(comps[1].id).toBe('elementAfter');
                    });
                });
            });

            describe('getAllComponents', function(){
                it('should return all the components in the page and masterPage', function(){
                    var comps = componentDetectorAPI.getAllComponents(privateServices, 'mainPage');
                    expect(comps.length).toBe(14); //includes the page
                });

                it('should only return masterPage components when receiving masterPage as pageId', function () {
                    var comps = componentDetectorAPI.getAllComponents(privateServices, 'masterPage');
                    expect(comps.length).toBe(7);
                });
            });

			describe('Get component by type', function() {

				var componentType = 'wysiwyg.viewer.components.WPhoto';
                var anotherComponentType = 'wysiwyg.viewer.components.tpapps.TPAGluedWidget';

				it('Should get all components', function() {
                    spyOn(privateServices.dal, 'isPathExist').and.returnValue(true);
					var comps = componentDetectorAPI.getComponentByType(privateServices, componentType);

					expect(comps.length).toBe(5);
					expect(comps[0].id).toBe('comp-i3plrm1c');
					expect(comps[1].id).toBe('i1uvkqwn');
					expect(comps[3].id).toBe('WPht1-1c2d');
					expect(comps[2].id).toBe('i1vvjiqt');
					expect(comps[4].id).toBe('i1vvko5m_0');

				});
                /*function getCompPointer(ps, compId, pageId){
                    var page = ps.pointers.components.getPage((pageId || 'masterPage'), constants.VIEW_MODES.DESKTOP);
                    return ps.pointers.components.getComponent(compId, page);
                }*/

				it('Should get all components inside a root component', function() {
                    var siteHeader = getCompPointer(privateServices, 'SITE_HEADER');
					var comps = componentDetectorAPI.getComponentByType(privateServices, componentType, siteHeader);

					expect(comps.length).toBe(1);
					expect(comps[0].id).toBe('comp-i3plrm1c');
				});

				it('Should return an empty array if no components found', function() {
                    var siteFooter = getCompPointer(privateServices, 'SITE_FOOTER');
					var comps = componentDetectorAPI.getComponentByType(privateServices, componentType, siteFooter);

					expect(comps.length).toBe(0);
				});

                it('Should return all components of the passed types', function(){
                    var comps = componentDetectorAPI.getComponentByType(privateServices, [componentType, anotherComponentType]);

                    expect(comps.length).toBe(7);
                });
			});
        });

        describe('getComponentsUnderAncestor', function() {
            beforeEach(function() {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('testPage')
                    .addPageWithDefaults('emptyPage');

                var masterPageChild = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.WPhoto', {}, 'masterPageChild');
                testUtils.mockFactory.addCompToPage(siteData, 'masterPage', masterPageChild);

                var testPageChild = testUtils.mockFactory.createStructure('wysiwyg.viewer.components.WPhoto', {}, 'testPageChild');
                var testPageContainer = testUtils.mockFactory.createStructure('mobile.core.components.Container', {components: [testPageChild]}, 'testPageContainer');
                testUtils.mockFactory.addCompToPage(siteData, 'testPage', testPageContainer);
                privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            it('should return all components under page', function() {
                var testPagePointer = privateServices.pointers.components.getPage('testPage', 'DESKTOP');

                var compIds = _.map(componentDetectorAPI.getComponentsUnderAncestor(privateServices, testPagePointer), 'id');

                expect(compIds).toEqual(['testPageContainer', 'testPageChild']);
            });

            it('should return all components under master page', function() {
                var masterPagePointer = privateServices.pointers.components.getPage('masterPage', 'DESKTOP');

                var compIds = _.map(componentDetectorAPI.getComponentsUnderAncestor(privateServices, masterPagePointer), 'id');

                expect(compIds).toEqual(['SITE_HEADER', 'SITE_FOOTER', 'PAGES_CONTAINER', 'masterPageChild', 'SITE_PAGES']);
            });

            it('should return all components under container', function() {
                var testPagePointer = privateServices.pointers.components.getPage('testPage', 'DESKTOP');
                var testPageContainer = privateServices.pointers.components.getComponent('testPageContainer', testPagePointer);

                var compIds = _.map(componentDetectorAPI.getComponentsUnderAncestor(privateServices, testPageContainer), 'id');

                expect(compIds).toEqual(['testPageChild']);
            });

            it('should return an empty array if no components were found', function() {
                var emptyPagePointer = privateServices.pointers.components.getPage('emptyPage', 'DESKTOP');

                var compIds = _.map(componentDetectorAPI.getComponentsUnderAncestor(privateServices, emptyPagePointer), 'id');

                expect(compIds).toEqual([]);
            });
        });


        function resetTestData() {
            // tests data was gotten from http://aleksandrg.wix.com/xytest
            pagesData = {
                "mainPage": {
                    "structure": {
                        "type": "Page",
                        "styleId": "p1",
                        "id": "mainPage",
                        "components": [
                            {
                                "type": "Component",
                                "styleId": "wp2",
                                "id": "i1uvkqwn",
                                "dataQuery": "#cudk",
                                "skin": "wysiwyg.viewer.skins.photo.NoSkinPhoto",
                                "layout": {
                                    "width": 128,
                                    "height": 128,
                                    "x": 24,
                                    "y": 24,
                                    "scale": 1,
                                    "rotationInDegrees": 0,
                                    "anchors": [
                                    ],
                                    "fixedPosition": false
                                },
                                "propertyQuery": "i1uvkqwn",
                                "componentType": "wysiwyg.viewer.components.WPhoto"
                            },
                            {
                                "type": "Container",
                                "styleId": "c1",
                                "id": "i1upd1xy",
                                "components": [
                                    {
                                        "type": "Component",
                                        "styleId": "wp2",
                                        "id": "WPht1-1c2d",
                                        "dataQuery": "#cqll",
                                        "skin": "wysiwyg.viewer.skins.photo.NoSkinPhoto",
                                        "layout": {
                                            "width": 250,
                                            "height": 250,
                                            "x": 150,
                                            "y": 200,
                                            "scale": 1,
                                            "rotationInDegrees": 0,
                                            "anchors": [
                                            ],
                                            "fixedPosition": false
                                        },
                                        "propertyQuery": "WPht1-1c2d",
                                        "componentType": "wysiwyg.viewer.components.WPhoto"
                                    }
                                ],
                                "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                                "layout": {
                                    "width": 400,
                                    "height": 400,
                                    "x": 50,
                                    "y": 70,
                                    "scale": 1,
                                    "rotationInDegrees": 0,
                                    "anchors": [
                                    ],
                                    "fixedPosition": false
                                },
                                "componentType": "mobile.core.components.Container"
                            },
                            {
                                "type": "Component",
                                "styleId": "wp2",
                                "id": "i1vvjiqt",
                                "dataQuery": "#c1931",
                                "skin": "wysiwyg.viewer.skins.photo.NoSkinPhoto",
                                "layout": {
                                    "width": 200,
                                    "height": 100,
                                    "x": 100,
                                    "y": 650,
                                    "scale": 1,
                                    "rotationInDegrees": 0,
                                    "anchors": [
                                        {
                                            "distance": 236,
                                            "topToTop": 1,
                                            "originalValue": 500,
                                            "type": "BOTTOM_PARENT",
                                            "locked": false,
                                            "targetComponent": "mainPage"
                                        }
                                    ],
                                    "fixedPosition": false
                                },
                                "propertyQuery": "c1mo7",
                                "componentType": "wysiwyg.viewer.components.WPhoto"
                            },
                            {
                                "type": "Container",
                                "styleId": "c1",
                                "id": "i1vvko5m",
                                "components": [
                                    {
                                        "type": "Component",
                                        "styleId": "wp2",
                                        "id": "i1vvko5m_0",
                                        "dataQuery": "#c23jb",
                                        "skin": "wysiwyg.viewer.skins.photo.NoSkinPhoto",
                                        "layout": {
                                            "width": 220,
                                            "height": 147,
                                            "x": 93,
                                            "y": 50,
                                            "scale": 1,
                                            "rotationInDegrees": 0,
                                            "anchors": [
                                            ],
                                            "fixedPosition": false
                                        },
                                        "propertyQuery": "c6ju",
                                        "componentType": "wysiwyg.viewer.components.WPhoto"
                                    }
                                ],
                                "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                                "layout": {
                                    "width": 250,
                                    "height": 370,
                                    "x": 639,
                                    "y": 59,
                                    "scale": 1,
                                    "rotationInDegrees": 0,
                                    "anchors": [
                                    ],
                                    "fixedPosition": false
                                },
                                "componentType": "mobile.core.components.Container"
                            }
                        ],
                        "dataQuery": "#mainPage",
                        "skin": "wysiwyg.viewer.skins.page.TransparentPageSkin",
                        "layout": {
                            "width": 980,
                            "height": 1000,
                            "x": 0,
                            "y": 0,
                            "scale": 1,
                            "rotationInDegrees": 0,
                            "anchors": [],
                            "fixedPosition": false
                        },
                        "componentType": "mobile.core.components.Page"
                    }
                },
                "masterPage": {
                    "structure": {
                        "type": "Document",
                        "documentType": "document",
                        "componentProperties": {},
                        "themeData": {},
                        "children": [
                            {
                                "type": "Container",
                                "styleId": "hc1",
                                "id": "SITE_HEADER",
                                "components": [
                                    {
                                        "type": "Component",
                                        "styleId": "wp2",
                                        "id": "comp-i3plrm1c",
                                        "dataQuery": "#c23jb",
                                        "skin": "wysiwyg.viewer.skins.photo.NoSkinPhoto",
                                        "layout": {
                                            "width": 220,
                                            "height": 147,
                                            "x": 93,
                                            "y": 50,
                                            "scale": 1,
                                            "rotationInDegrees": 0,
                                            "anchors": [],
                                            "fixedPosition": false
                                        },
                                        "propertyQuery": "c6ju",
                                        "componentType": "wysiwyg.viewer.components.WPhoto"
                                    }
                                ],
                                "skin": "wysiwyg.viewer.skins.screenwidthcontainer.TransparentScreen",
                                "layout": {
                                    "width": 980,
                                    "height": 70,
                                    "x": 0,
                                    "y": 0,
                                    "scale": 1,
                                    "rotationInDegrees": 0,
                                    "anchors": [],
                                    "fixedPosition": false
                                },
                                "componentType": "wysiwyg.viewer.components.HeaderContainer"
                            },
                            {
                                "type": "Container",
                                "styleId": "fc1",
                                "id": "SITE_FOOTER",
                                "components": [],
                                "skin": "wysiwyg.viewer.skins.screenwidthcontainer.TransparentScreen",
                                "layout": {
                                    "width": 980,
                                    "height": 90,
                                    "x": 0,
                                    "y": 570,
                                    "scale": 1,
                                    "rotationInDegrees": 0,
                                    "anchors": [],
                                    "fixedPosition": false
                                },
                                "componentType": "wysiwyg.viewer.components.FooterContainer"
                            },
                            {
                                "type": "Container",
                                "styleId": "pc1",
                                "id": "PAGES_CONTAINER",
                                "components": [
                                    {
                                        "type": "Container",
                                        "styleId": "null",
                                        "id": "SITE_PAGES",
                                        "components": [],
                                        "skin": "wysiwyg.viewer.skins.PageGroupSkin",
                                        "layout": {
                                            "width": 980,
                                            "height": 500,
                                            "x": 0,
                                            "y": 70,
                                            "scale": 1,
                                            "rotationInDegrees": 0,
                                            "anchors": [],
                                            "fixedPosition": false
                                        },
                                        "propertyQuery": "SITE_PAGES",
                                        "componentType": "wysiwyg.viewer.components.PageGroup"
                                    }
                                ],
                                "skin": "wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen",
                                "layout": {
                                    "width": 980,
                                    "height": 500,
                                    "x": 0,
                                    "y": 70,
                                    "scale": 1,
                                    "rotationInDegrees": 0,
                                    "anchors": [],
                                    "fixedPosition": false
                                },
                                "componentType": "wysiwyg.viewer.components.PagesContainer"
                            },
                            {
                                type: "Component",
                                styleId: "tpagw0",
                                id: "i42k5em5",
                                dataQuery: "#c16i1",
                                skin: "wysiwyg.viewer.skins.TPAWidgetSkin",
                                layout: {
                                    width: 200,
                                    height: 200,
                                    x: 0,
                                    y: 870,
                                    scale: 1,
                                    rotationInDegrees: 0,
                                    anchors: [],
                                    fixedPosition: false
                                },
                                propertyQuery: "i42k5em5",
                                componentType: "wysiwyg.viewer.components.tpapps.TPAGluedWidget"
                            },
                            {
                                type: "Component",
                                styleId: "tpagw0",
                                id: "i6aqcri9",
                                dataQuery: "#c1usm",
                                skin: "wysiwyg.viewer.skins.TPAWidgetSkin",
                                layout: {
                                    width: 40,
                                    height: 106,
                                    x: 1865,
                                    y: 0,
                                    scale: 1,
                                    rotationInDegrees: 0,
                                    anchors: [],
                                    fixedPosition: false
                                },
                                propertyQuery: "i6aqcri9",
                                componentType: "wysiwyg.viewer.components.tpapps.TPAGluedWidget"
                            }
                        ],
                        "id": "masterPage"
                    },
                    data: {
                        component_properties: {
                            "i6aqcri9": {
                                "id": "i6aqcri9",
                                "placement": "TOP_RIGHT",
                                "verticalMargin": 0,
                                "horizontalMargin": 0,
                                "type": "TPAGluedProperties",
                                "metaData": {
                                    "isPreset": false,
                                    "schemaVersion": "1.0",
                                    "isHidden": false
                                }
                            },
                            "i42k5em5": {
                                "id": "i6aqcri9",
                                "placement": "BOTTOM_RIGHT",
                                "verticalMargin": 0,
                                "horizontalMargin": 0,
                                "type": "TPAGluedProperties",
                                "metaData": {
                                    "isPreset": false,
                                    "schemaVersion": "1.0",
                                    "isHidden": false
                                }
                            }
                        }
                    }
                }
            };

            measureMap = {
                "clientWidth" : 1000,
                "width": {
                    masterPage: 980
                }
            };

        }
    });
