define([
    'lodash',
    'core',
    'testUtils',
    'documentServices/mobileConversion/modules/virtualGroupHandler',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function (
    _,
    core,
    testUtils,
    virtualGroupHandlerClass,
    privateServicesHelper
) {
    'use strict';

    function expectCompIsVirtualGroup(groupComp, childrenIds) {
        expect(groupComp.componentType).toBe("VIRTUAL_GROUP");
        var actualChildrenIds = groupComp.components.map(function (c) { return c.id; });
        expect(_.difference(childrenIds, actualChildrenIds).length).toEqual(0);
    }

    xdescribe('virtual group handler', function () {
        var virtualGroupHandler;

        beforeEach(function () {
            virtualGroupHandler = virtualGroupHandlerClass();
        });

        describe('addVirtualGroupsToStructure', function () {
            it('should leaves empty structure unchanged', function () {
                var structure = createEmptyStructure();
                var pagesData = {
                    mainPage: {
                        structure: structure,
                        data: {}
                    }
                };
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPage(pagesData);
                var ps = privateServicesHelper.mockPrivateServices(siteData);
                var modifiedStructure = _.cloneDeep(structure);
                virtualGroupHandler.setup({
                    dat: ps.dal,
                    pageId: 'mainPage',
                    ps: ps
                }).addVirtualGroupsToStructure(modifiedStructure);

                expect(modifiedStructure).toEqual(structure);
            });

            it('should add overlaying components as groups', function () {
                var mainPageData = createPageDataWithImageAndText();
                var structure2 = mainPageData.structure;
                var pagesData = {mainPage: mainPageData};
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPage(pagesData);
                var ps = privateServicesHelper.mockPrivateServices(siteData);
                virtualGroupHandler.setup({
                    dal: ps.dal,
                    pageId: 'mainPage',
                    ps: ps
                }).addVirtualGroupsToStructure(structure2);

                expect(structure2.components.length).toEqual(3);
                expectCompIsVirtualGroup(structure2.components[2], ['i24g34ya', 'WRchTxt3']);
            });
        });

    });

    function createEmptyStructure() {
        return {
            "componentType": "mobile.core.components.Page",
            "type": "Page",
            "id": "mainPage",
            "styleId": "p1",
            "skin": "wysiwyg.viewer.skins.page.TransparentPageSkin",
            "layout": {
                "x": 0,
                "y": 0,
                "width": 980,
                "height": 500,
                "scale": 1,
                "rotationInDegrees": 0,
                "fixedPosition": false,
                "anchors": []
            },
            "dataQuery": "#mainPage",
            "components": []
        };
    }

    function createPageDataWithImageAndText() {
        return {
            "structure": {
                "type": "Page",
                "styleId": "p1",
                "id": "mainPage",
                "components": createStructureWithImageAndText(),
                "dataQuery": "#mainPage",
                "skin": "wysiwyg.viewer.skins.page.TransparentPageSkin",
                "layout": {
                    "width": 980,
                    "height": 1065,
                    "x": 0,
                    "y": 0,
                    "scale": 1,
                    "rotationInDegrees": 0,
                    "anchors": [],
                    "fixedPosition": false
                },
                "componentType": "mobile.core.components.Page"
            },
            "data": {
                "document_data": {
                    "13nv": {
                        "type": "StyledText",
                        "id": "13nv",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "text": "<p class=\"font_7\"><span class=\"color_3\"><b>Text over the image</b></span></p>\n",
                        "stylesMapId": "CK_EDITOR_PARAGRAPH_STYLES",
                        "linkList": []
                    },
                    "c1t87": {
                        "type": "StyledText",
                        "id": "c1t87",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "text": "<p class=\"font_7\"><span style=\"font-weight:bold;\">Text over the panel</span></p>\n",
                        "stylesMapId": "CK_EDITOR_PARAGRAPH_STYLES",
                        "linkList": []
                    },
                    "c1ttq": {
                        "type": "Image",
                        "id": "c1ttq",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "2.0",
                            "isHidden": false
                        },
                        "title": "",
                        "uri": "19a64a_7a827c90c96f4fe898c961ba5412d13c.png",
                        "description": "",
                        "width": 128,
                        "height": 128,
                        "alt": ""
                    },
                    "c9jr": {
                        "type": "StyledText",
                        "id": "c9jr",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "text": "<p class=\"font_7\"><span style=\"font-weight:bold;\">Text inside panel and image</span></p>\n",
                        "stylesMapId": "CK_EDITOR_PARAGRAPH_STYLES",
                        "linkList": []
                    },
                    "cor2": {
                        "type": "Image",
                        "id": "cor2",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "2.0",
                            "isHidden": false
                        },
                        "title": "",
                        "uri": "19a64a_7a827c90c96f4fe898c961ba5412d13c.png",
                        "description": "",
                        "width": 128,
                        "height": 128,
                        "alt": ""
                    },
                    "customBgImg1i1b": {
                        "type": "BackgroundImage",
                        "id": "customBgImg1i1b",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.1",
                            "isHidden": false
                        },
                        "url": "f850b6_517eee0ba796a49562a33d27cfe1acc3.jpg",
                        "positionx": "center",
                        "positiony": "top",
                        "width": "cover",
                        "repeatx": "no_repeat",
                        "repeaty": "no_repeat",
                        "attachment": "fixed",
                        "color": "{color_11}",
                        "imagesizeh": 853,
                        "imagesizew": 1280
                    },
                    "customBgImgwgs": {
                        "type": "BackgroundImage",
                        "id": "customBgImgwgs",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.1",
                            "isHidden": false
                        },
                        "url": "f850b6_517eee0ba796a49562a33d27cfe1acc3.jpg",
                        "positionx": "center",
                        "positiony": "top",
                        "width": "cover",
                        "repeatx": "no_repeat",
                        "repeaty": "no_repeat",
                        "attachment": "fixed",
                        "color": "{color_11}",
                        "imagesizeh": 853,
                        "imagesizew": 1280
                    },
                    "mainPage": {
                        "type": "Page",
                        "id": "mainPage",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "title": "Home",
                        "hideTitle": true,
                        "icon": "",
                        "descriptionSEO": "",
                        "metaKeywordsSEO": "",
                        "pageTitleSEO": "",
                        "pageUriSEO": "home",
                        "hidePage": false,
                        "underConstruction": false,
                        "tpaApplicationId": 0,
                        "pageSecurity": {
                            "requireLogin": false
                        },
                        "indexable": true,
                        "isLandingPage": false,
                        "pageBackgrounds": {
                            "desktop": {
                                "custom": true,
                                "ref": "#customBgImgwgs",
                                "isPreset": false
                            },
                            "mobile": {
                                "custom": true,
                                "ref": "#customBgImg1i1b",
                                "isPreset": true
                            }
                        }
                    }
                },
                "theme_data": {},
                "component_properties": {
                    "c255h": {
                        "type": "WPhotoProperties",
                        "metaData": {
                            "schemaVersion": "1.0"
                        },
                        "displayMode": "fill",
                        "onClickBehavior": "goToLink"
                    },
                    "i24g34ya": {
                        "type": "WPhotoProperties",
                        "metaData": {
                            "schemaVersion": "1.0"
                        },
                        "displayMode": "fill",
                        "onClickBehavior": "goToLink"
                    }
                }
            },
            "title": "Home",
            "pageUriSEO": "home"
        };
    }

    function createStructureWithImageAndText() {
        return [
            {
                "componentType": "wysiwyg.viewer.components.WPhoto",
                "type": "Component",
                "id": "i24g34ya",
                "styleId": "wp2",
                "skin": "wysiwyg.viewer.skins.photo.NoSkinPhoto",
                "layout": {
                    "x": 16,
                    "y": 11,
                    "width": 320,
                    "height": 320,
                    "scale": 1,
                    "rotationInDegrees": 0,
                    "fixedPosition": false,
                    "anchors": [
                        {
                            "type": "TOP_TOP",
                            "targetComponent": "WRchTxt3",
                            "locked": true,
                            "distance": 65,
                            "topToTop": 65,
                            "originalValue": 76
                        },
                        {
                            "type": "BOTTOM_TOP",
                            "targetComponent": "i24h6h7c",
                            "locked": false,
                            "distance": 107,
                            "topToTop": 427,
                            "originalValue": 438
                        }
                    ]
                },
                "dataQuery": "#c1ttq",
                "propertyQuery": "i24g34ya"
            },
            {
                "componentType": "wysiwyg.viewer.components.WRichText",
                "type": "Component",
                "id": "WRchTxt3",
                "styleId": "txtNew",
                "skin": "wysiwyg.viewer.skins.WRichTextNewSkin",
                "layout": {
                    "x": 106,
                    "y": 76,
                    "width": 164.85,
                    "height": 22,
                    "scale": 1,
                    "rotationInDegrees": 0,
                    "fixedPosition": false,
                    "anchors": [
                        {
                            "type": "BOTTOM_TOP",
                            "targetComponent": "i24h6h7c",
                            "locked": false,
                            "distance": 296,
                            "topToTop": 362,
                            "originalValue": 438
                        },
                        {
                            "type": "BOTTOM_BOTTOM",
                            "targetComponent": "i24g34ya",
                            "locked": false,
                            "distance": 189,
                            "topToTop": 65,
                            "originalValue": 320
                        }
                    ]
                },
                "dataQuery": "#13nv",
                "propertyQuery": "WRchTxt3"
            },
            {
                "componentType": "mobile.core.components.Container",
                "type": "Container",
                "id": "i24h6h7c",
                "styleId": "c1",
                "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                "layout": {
                    "x": 51,
                    "y": 438,
                    "width": 250,
                    "height": 250,
                    "scale": 1,
                    "rotationInDegrees": 0,
                    "fixedPosition": false,
                    "anchors": [
                        {
                            "type": "BOTTOM_TOP",
                            "targetComponent": "i24h6koh",
                            "locked": true,
                            "distance": 10,
                            "topToTop": 260,
                            "originalValue": 698
                        }
                    ]
                },
                "components": []
            },
            {
                "componentType": "wysiwyg.viewer.components.WRichText",
                "type": "Component",
                "id": "i24h6koh",
                "styleId": "txtNew",
                "skin": "wysiwyg.viewer.skins.WRichTextNewSkin",
                "layout": {
                    "x": 48,
                    "y": 698,
                    "width": 160.65,
                    "height": 22,
                    "scale": 1,
                    "rotationInDegrees": 0,
                    "fixedPosition": false,
                    "anchors": [
                        {
                            "type": "BOTTOM_PARENT",
                            "targetComponent": "mainPage",
                            "locked": false,
                            "distance": 265,
                            "topToTop": 698,
                            "originalValue": 1029
                        }
                    ]
                },
                "dataQuery": "#c1t87",
                "propertyQuery": "c1bwj"
            }
        ];
    }
});
