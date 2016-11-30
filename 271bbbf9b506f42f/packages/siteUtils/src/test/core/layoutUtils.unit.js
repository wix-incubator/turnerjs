define(['lodash', 'siteUtils/core/layoutUtils', 'siteUtils/core/positionAndSizeUtils'], function (_, layoutUtils, positionAndSizeUtils) {
    'use strict';

    describe('layoutUtils', function () {
        describe('calcAspectRatio', function () {
            it('should return height / width', function () {
                var result = layoutUtils.calcAspectRatio(20, 80);

                expect(result).toEqual(4);
            });
            it('should return aspectRatio with maximum 5 decimal numbers', function () {
                var result = layoutUtils.calcAspectRatio(90, 20);

                expect(result).toEqual(0.22222);
            });
        });

        describe('isAspectRatioOn', function () {
            it('should return true for layout with aspectRatio defined', function () {
                var layout = {x: 0, y: 0, width: 100, height: 100, aspectRatio: 0.25};
                var result = layoutUtils.isAspectRatioOn(layout);

                expect(result).toEqual(true);
            });
            it('should return false for layout without aspectRatio property', function () {
                var layout = {x: 0, y: 0, width: 100, height: 100};
                var result = layoutUtils.isAspectRatioOn(layout);

                expect(result).toEqual(false);
            });
        });

        describe('stretchInCenteredContainer(containerWidth: number, componentWidth: number): number', function () {
            it('should stretch small component', function () {
                var result = layoutUtils.stretchInCenteredContainer(980, 100);
                expect(result).toEqual({left: 0, width: 980});
            });

            it('should position big component out of left boundary', function () {
                var result = layoutUtils.stretchInCenteredContainer(980, 1920);
                expect(result).toEqual({left: -470, width: 1920});
            });

            it('should return only integers', function () {
                var result = layoutUtils.stretchInCenteredContainer(100, 101);
                expect(result).toEqual({left: -1, width: 101});
            });
        });

        describe('to the screen ("screen height") verb', function(){
            it('should render component with given y', function() {
                var compLayout = {
                    y: 100,
                    docked: {top: {'vh': 0}, bottom: {'vh': 0}}
                };
                this.viewportSize = {
                    width: 1000,
                    height: 1000
                };
                var parentDimensions = {
                    height: 900,
                    width: 1200,
                    x: 0,
                    y: 0
                };
                var compDimensions = positionAndSizeUtils.getPositionAndSize(compLayout, parentDimensions, this.viewportSize, this.fakeSiteWidth);
                expect(compDimensions.y).toBe(100);
                expect(compDimensions.height).toBe(1000);
            });

        });

        describe('functions getting max bottom', function () {
            var getBottomFn,
                measureMap,
                nodesMap,
                siteData;

            var functionGettingMaxBottom = layoutUtils.getPageBottomChildEnd;

            beforeEach(function () {
                measureMap = {width: {}, height: {}};
                nodesMap = {};
                siteData = {isMobileView: _.constant(false)};
                getBottomFn = _.partial(functionGettingMaxBottom, measureMap, nodesMap, siteData);
            });

            it('should return 0 if there are no components in container', function () {
                expect(getBottomFn(emptyStructure())).toBe(0);
                expect(getBottomFn(structureWithChildren([]))).toBe(0);
            });

            it('should return 0 if there are only fixed layout components in container', function () {
                expect(getBottomFn(structureWithFixedChild())).toBe(0);
            });

            it('should return 0 if there is no DOM node for the component', function () {
                expect(getBottomFn(structureWithChild())).toBe(0);
                expect(getBottomFn(structureWithChild('noDomNode'))).toBe(0);
            });

            it('should return 300 if {y=100, h=200}', function () {
                nodesMap.utka = positionateDomElement(0, 100, 100, 200);

                expect(getBottomFn(structureWithChild('utka'))).toBe(300);
            });

            it('should return round(120.7) if {y=0, h=100, a=45deg}', function () {
                nodesMap.utka45 = positionateDomElement(0, 0, 100, 100);

                expect(getBottomFn(structureWithRotatedChild('utka45')))
                    .toBeCloseTo(100 * 0.5 * (1 + Math.sqrt(2)), 0);
            });


            it('should not take in account bottom of grand children', function () {
                nodesMap.child = positionateDomElement(100, 100, 100, 100);

                expect(getBottomFn(veryDeepStructure())).toBe(200);
            });

            // structure helpers

            function positionateDomElement(x, y, width, height) {
                return {
                    offsetLeft: x,
                    offsetTop: y,
                    offsetWidth: width,
                    offsetHeight: height
                };
            }

            function emptyStructure() {
                return {structure: {}};
            }

            function structureWithChildren(components) {
                return {structure: {components: components}};
            }

            function createComponent(id, layout, components) {
                return {
                    id: id,
                    layout: layout || {},
                    components: components
                };
            }

            function structureWithChild(id, layout, components) {
                return structureWithChildren([createComponent(id, layout, components)]);
            }

            function structureWithFixedChild(id) {
                return structureWithChild(id, {fixedPosition: true});
            }

            function structureWithRotatedChild(id) {
                return structureWithChild(id, {rotationInDegrees: 45});
            }

            function veryDeepStructure() {
                function child(level) {
                    return {
                        id: 'child',
                        layout: {},
                        components: level > 0 ? [
                            child(level - 1),
                            child(level - 1),
                            child(level - 1)
                        ] : []
                    };
                }

                return {
                    structure: {
                        components: [
                            child(5),
                            child(6)
                        ]
                    }
                };
            }
        });
    });
});
