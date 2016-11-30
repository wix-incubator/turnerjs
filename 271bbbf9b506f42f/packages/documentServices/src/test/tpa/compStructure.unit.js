define(['lodash',
    'documentServices/tpa/constants',
    'documentServices/page/page',
    'documentServices/page/pageData',
    'documentServices/tpa/compStructure',
    'documentServices/mockPrivateServices/privateServicesHelper'
], function(_, tpaConstants, page, pageData, compStructure, privateServicesHelper){

    'use strict';

    describe("Document Services - tpa - compStructure", function() {

        var expectedStructure;
        beforeEach(function(){
            expectedStructure = {
                "componentType":"mobile.core.components.Page",
                "type":"Page",
                "styleId": "p2",
                "skin":"skins.core.InlineSkin",
                "layout":{
                    "x":0,
                    "y":0,
                    "width":980,
                    "height":500,
                    "anchors":[]
                },
                "data":{
                    "type":"Page",
                    "metaData": {
                        "isPreset": false,
                        "schemaVersion": "1.0",
                        "isHidden": false
                    },
                    "hideTitle":true,
                    "icon": "",
                    "descriptionSEO":"",
                    "metaKeywordsSEO":"",
                    "pageTitleSEO": "",
                    "pageUriSEO": undefined,
                    "hidePage": undefined,
                    "mobileHidePage": null,
                    "underConstruction":false,
                    "tpaApplicationId": 15,
                    "indexable": true,
                    "tpaPageId": 11,
                    "pageBackgrounds": '',
                    "isLandingPage": false
                },
                "components":[]
            };
        });

        describe('getSectionStructure', function() {
            var mockPs = {};
            beforeEach(function() {
                mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL();
                spyOn(pageData, 'getPageDataWithoutIds').and.returnValue({
                    pageBackgrounds: ''
                });
            });

            var definitionData = {
                applicationId: 15
            };

            describe('indexable', function () {
                it('should return structure with indexable true if indeaxable is not forward as parameter', function () {
                    expect(compStructure.getSectionStructure(mockPs, definitionData, '', 11)).toEqual(expectedStructure);
                });

                it('should return structure with indexable true if indeaxable is forward as true', function () {
                    expect(compStructure.getSectionStructure(mockPs, definitionData, '', 11, undefined, true)).toEqual(expectedStructure);
                });

                it('should return structure with indexable false if indeaxable is forward as false', function () {
                    expectedStructure.data.indexable = false;
                    expect(compStructure.getSectionStructure(mockPs, definitionData, '', 11, undefined, false)).toEqual(expectedStructure);
                });
            });

            describe('isLandingPage', function () {
                it('should return structure with isLandingPage false if isLandingPage is not forward as parameter', function () {
                    expect(compStructure.getSectionStructure(mockPs, definitionData, '', 11)).toEqual(expectedStructure);
                });

                it('should return structure with isLandingPage true if isLandingPage is forward as true', function () {
                    expectedStructure.data.isLandingPage = true;
                    expect(compStructure.getSectionStructure(mockPs, definitionData, '', 11, undefined, true, true)).toEqual(expectedStructure);
                });

                it('should return structure with isLandingPage false if isLandingPage is forward as false', function () {
                    expect(compStructure.getSectionStructure(mockPs, definitionData, '', 11, undefined, true, false)).toEqual(expectedStructure);
                });
            });
        });

        describe('getWidgetStructure', function () {
            var applicationId = 15;
            var widgetId = 'widgetId';
            var layout = {
                width: 562,
                height: 535,
                x: 209,
                y: 85
            };

            beforeEach(function () {
                this.widgetStructure = {
                    "layout": {
                        "width": 562,
                        "height": 535,
                        "x": 209,
                        "y": 85,
                        "anchors": []
                    },
                    data: {
                        widgetId: widgetId,
                        applicationId: '15',
                        type: tpaConstants.DATA_TYPE.TPA_WIDGET,
                        metaData: {
                            isHidden: false,
                            isPreset: true,
                            schemaVersion: '1.0'
                        }
                    },
                    "type": "Component",
                    "skin": tpaConstants.SKINS.TPA_WIDGET,
                    "componentType": tpaConstants.COMP_TYPES.TPA_WIDGET,
                    "style": 'tpaw0'
                };
            });

            describe('styleId', function () {

                it('should return structure with default style if styleId in not passed', function () {
                    var structure = compStructure.getWidgetStructure(applicationId, widgetId, layout);

                    expect(structure).toEqual(this.widgetStructure);
                });

                it('should return structure with default style if styleId is null', function () {
                    var structure = compStructure.getWidgetStructure(applicationId, widgetId, layout, null);

                    expect(structure).toEqual(this.widgetStructure);
                });

                it('should return structure with passed style if styleId is not null', function () {
                    this.widgetStructure.style = 'style1';

                    var structure = compStructure.getWidgetStructure(applicationId, widgetId, layout, 'style1');

                    expect(structure).toEqual(this.widgetStructure);
                });
            });

        });

        describe('getGluedWidgetStructure', function () {
            var applicationId = 15;
            var widgetData = {
                "widgetUrl": "http://back-to-top.appspot.com/app/index.html#/",
                "widgetId": "13a0fde9-7c50-4041-afa1-bad795946dcc",
                "refreshOnWidthChange": true,
                "gluedOptions": {
                    "placement": "BOTTOM_RIGHT",
                    "verticalMargin": 0,
                    "horizontalMargin": 0
                },
                "published": true,
                "mobilePublished": false,
                "seoEnabled": true,
                "defaultWidth": 72,
                "defaultHeight": 93,
                "defaultShowOnAllPages": false,
                "settings": {
                    "height": 580,
                    "width": 600,
                    "url": "http://back-to-top.appspot.com/app/settings.html#/",
                    "version": 1
                },
                "autoAddToSite": false,
                "tpaWidgetId": "back_to_top",
                "canBeStretched": false,
                "shouldBeStretchedByDefault": false
            };
            var layout = {
                "width": 72,
                "height": 93,
                "defaultPosition": {}
            };

            beforeEach(function () {
                this.widgetStructure = {
                    "layout": {
                        "width": 72,
                        "height": 93,
                        "x": 300,
                        "y": 120,
                        "anchors": [],
                        "fixedPosition": true
                    },
                    data: {
                        widgetId: '13a0fde9-7c50-4041-afa1-bad795946dcc',
                        applicationId: '15',
                        type: tpaConstants.DATA_TYPE.TPA_WIDGET,
                        metaData: {
                            isHidden: false,
                            isPreset: true,
                            schemaVersion: "1.0"
                        }
                    },
                    "type": "Component",
                    "skin": tpaConstants.SKINS.TPA_WIDGET,
                    "componentType": tpaConstants.COMP_TYPES.TPA_GLUED_WIDGET,
                    "style": 'tpagw0',
                    "props":  {
                        placement: 'BOTTOM_RIGHT',
                        verticalMargin: 0,
                        horizontalMargin: 0,
                        type: "TPAGluedProperties",
                        metaData: {
                            schemaVersion: "1.0"
                        }
                    }
                };
            });

            describe('styleId', function () {

                it('should return structure with default style if styleId in not passed', function () {
                    var structure = compStructure.getGluedWidgetStructure(applicationId, widgetData, layout);

                    expect(structure).toEqual(this.widgetStructure);
                });

                it('should return structure with default style if styleId is null', function () {
                    var structure = compStructure.getGluedWidgetStructure(applicationId, widgetData, layout, null);

                    expect(structure).toEqual(this.widgetStructure);
                });

                it('should return structure with passed style if styleId is not null', function () {
                    this.widgetStructure.style = 'style1';

                    var structure = compStructure.getGluedWidgetStructure(applicationId, widgetData, layout, 'style1');

                    expect(structure).toEqual(this.widgetStructure);
                });
            });

        });
    });
});
