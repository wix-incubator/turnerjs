define(['lodash', 'utils', 'testUtils', 'layout/util/reduceDistancesAlgorithm/createMeasureMapManager'], function (_, utils, testUtils, createMeasureMapManager) {
    'use strict';

    describe('createMeasureMapManager', function () {
        var mockComponents, measuredData, mockMeasureMap;

        beforeEach(function(){
            mockComponents = {
            'comp-1': {
                "type": "Container",
                "id": "comp-1",
                "skin": "wysiwyg.viewer.skins.area.DefaultAreaSkin",
                "layout": {
                    "width": 568,
                    "height": 240,
                    "x": 201,
                    "y": 267,
                    "scale": 1,
                    "rotationInDegrees": 0,
                    "fixedPosition": false
                },
                "componentType": "mobile.core.components.Container",
                "components": []
            },
            'comp-2': {
                "type": "Component",
                "id": "comp-2",
                "skin": "wysiwyg.viewer.skins.button.BasicButton",
                "layout": {
                    "width": 142,
                    "height": 40,
                    "x": 407,
                    "y": 525,
                    "scale": 1,
                    "rotationInDegrees": 0,
                    "fixedPosition": false
                },
                "componentType": "wysiwyg.viewer.components.SiteButton"
            },
            'comp-3': {
                "type": "Component",
                "id": "comp-3",
                "skin": "wysiwyg.viewer.skins.button.BasicButton",
                "layout": {
                    "width": 88,
                    "height": 40,
                    "x": 281,
                    "y": 72,
                    "scale": 1,
                    "rotationInDegrees": 30,
                    "fixedPosition": false
                },
                "componentType": "wysiwyg.viewer.components.SiteButton"
            },
            'comp-4': {
                "type": "Component",
                "id": "comp-4",
                "skin": "wysiwyg.viewer.skins.button.BasicButton",
                "layout": {
                    "width": 196,
                    "height": 41,
                    "x": 472,
                    "y": 162,
                    "scale": 1,
                    "rotationInDegrees": 0,
                    "fixedPosition": false
                },
                "componentType": "wysiwyg.viewer.components.SiteButton"
            }
            };
            measuredData = {
                "height": {
                    "comp-1": 240,
                    "comp-2": 40,
                    "comp-3": 40,
                    "comp-4": 41
                },
                "width": {
                    "comp-1": 568,
                    "comp-2": 142,
                    "comp-3": 88,
                    "comp-4": 196
                },
                "top": {
                    "comp-1": 267,
                    "comp-2": 525,
                    "comp-3": 72,
                    "comp-4": 162
                }
            };
            mockMeasureMap = testUtils.mockFactory.createBlankMeasureMap(measuredData);
        });

        describe('getComponentTop', function(){
            it('should return component top', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentTop('comp-1');

                expect(result).toEqual(measuredData.top['comp-1']);
            });

            it('should return undefined for non existing component', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentTop('comp-5');

                expect(result).not.toBeDefined();
            });

            it('should return bounding rect top (for rotated component)', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentTop('comp-3');

                var compTop = mockMeasureMap.top['comp-3'];
                var compWidth = mockMeasureMap.width['comp-3'];
                var compHeight = mockMeasureMap.height['comp-3'];
                var rotationInDegrees = mockComponents['comp-3'].layout.rotationInDegrees;
                var boundingTop = utils.boundingLayout.getBoundingY({y: compTop, height: compHeight, width: compWidth, rotationInDegrees: rotationInDegrees});
                expect(result).toEqual(boundingTop);
            });
        });

        describe('getComponentHeight', function(){
            it('should return component height', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentHeight('comp-1');

                expect(result).toEqual(measuredData.height['comp-1']);
            });

            it('should return undefined for non existing component', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentHeight('comp-5');

                expect(result).not.toBeDefined();
            });

            it('should return bounding rect height (for rotated component)', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentHeight('comp-3');

                var compWidth = mockMeasureMap.width['comp-3'];
                var compHeight = mockMeasureMap.height['comp-3'];
                var rotationInDegrees = mockComponents['comp-3'].layout.rotationInDegrees;
                var boundingHeight = utils.boundingLayout.getBoundingHeight({height: compHeight, width: compWidth, rotationInDegrees: rotationInDegrees});
                expect(result).toEqual(boundingHeight);
            });

            it('should return 0 for collapsed component', function(){
                mockMeasureMap.collapsed['comp-1'] = true;
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentHeight('comp-1');

                expect(result).toEqual(0);
            });
        });

        describe('getComponentMinHeight', function(){
            it('should return minHeight for component', function(){
                mockMeasureMap.minHeight['comp-1'] = 100;
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentMinHeight('comp-1');

                expect(result).toEqual(100);
            });

            it('should return DEFAULT_MIN_HEIGHT for component without minHeight', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentMinHeight('comp-1');

                expect(result).toEqual(5);
            });

            it('should return DEFAULT_MIN_HEIGHT for component with minHeight smaller then DEFAULT_MIN_HEIGHT', function(){
                mockMeasureMap.minHeight['comp-1'] = 2;
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentMinHeight('comp-1');

                expect(result).toEqual(5);
            });

            it('should return 0 for collapsed component', function(){
                mockMeasureMap.collapsed['comp-1'] = true;
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentMinHeight('comp-1');

                expect(result).toEqual(0);
            });
        });

        describe('isCollapsed', function(){
            it('should return true for collapsed component', function(){
                mockMeasureMap.collapsed['comp-1'] = true;
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.isCollapsed('comp-1');

                expect(result).toEqual(true);
            });

            it('should return false for expanded component', function(){
                mockMeasureMap.collapsed['comp-1'] = false;
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.isCollapsed('comp-1');

                expect(result).toEqual(false);
            });

            it('should return false for collapsed not defined', function(){
                mockMeasureMap.collapsed = {};
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.isCollapsed('comp-1');

                expect(result).toEqual(false);
            });
        });

        describe('isShrinkableContainer', function(){
            it('should return true for shrinkable component', function(){
                mockMeasureMap.shrinkableContainer['comp-1'] = true;
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.isShrinkableContainer('comp-1');

                expect(result).toEqual(true);
            });

            it('should return false for non shrinkable component', function(){
                mockMeasureMap.shrinkableContainer['comp-1'] = false;
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.isShrinkableContainer('comp-1');

                expect(result).toEqual(false);
            });

            it('should return false for shrinkable not defined', function(){
                mockMeasureMap.shrinkableContainer = {};
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.isShrinkableContainer('comp-1');

                expect(result).toEqual(false);
            });
        });

        describe('getComponentWidth', function(){
            it('should return component width', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentWidth('comp-1');

                expect(result).toEqual(measuredData.width['comp-1']);
            });

            it('should return undefined for non existing component', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getComponentWidth('comp-5');

                expect(result).not.toBeDefined();
            });
        });

        describe('getClientSize', function(){
            it('should return client size', function(){
                mockMeasureMap.clientWidth = 1000;
                mockMeasureMap.clientHeight = 800;
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);

                var result = measureMapManager.getClientSize();

                expect(result).toEqual({width: 1000, height: 800});

            });
        });

        describe('setComponentTop', function(){
            it('should update component y', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);
                var newCompTop = 150;

                measureMapManager.setComponentTop('comp-1', newCompTop);

                var currentCompTop = measureMapManager.getComponentTop('comp-1');
                expect(currentCompTop).toEqual(newCompTop);
            });

            it('should update component y considering rotation in degrees', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);
                var newCompTop = 150;

                measureMapManager.setComponentTop('comp-3', newCompTop);

                var currentCompTop = measureMapManager.getComponentTop('comp-3');
                expect(currentCompTop).toEqual(newCompTop);
            });
        });

        describe('setComponentHeight', function(){
            it('should update component height', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);
                var newCompHeight = 300;

                measureMapManager.setComponentHeight('comp-1', newCompHeight);

                var currentCompTop = measureMapManager.getComponentHeight('comp-1');
                expect(currentCompTop).toEqual(newCompHeight);
            });

            it('should update component height considering rotation in degrees', function(){
                var measureMapManager = createMeasureMapManager(mockMeasureMap, mockComponents);
                var newCompHeight = 300;

                measureMapManager.setComponentHeight('comp-3', newCompHeight);

                var currentCompHeight = measureMapManager.getComponentHeight('comp-3');
                expect(currentCompHeight).toEqual(newCompHeight);
            });
        });
    });
});
