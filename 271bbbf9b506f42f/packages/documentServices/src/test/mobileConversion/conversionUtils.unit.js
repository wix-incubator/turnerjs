define([
    'lodash',
    'documentServices/mobileConversion/modules/conversionUtils'
], function(_, conversionUtils) {
    'use strict';

    describe('conversionUtils', function () {

        function createMockComponent(compData) {
            return {
                conversionData: {
                    isScreenWidth: compData.isScreenWidth
                },
                layout: {
                    rotationInDegrees: 0,
                    width: compData.width,
                    height: compData.height,
                    x: compData.x,
                    y: compData.y
                }
            };
        }

        describe('hasGreaterArea', function () {

            it('should return false if the first component has a smaller area than the second one', function () {
                var comp1 = createMockComponent({width: 20, height: 10});
                var comp2 = createMockComponent({width: 25, height: 15});
                expect(conversionUtils.hasGreaterArea(comp1, comp2)).toBe(false);
            });

            it('should return false for non screen width components of the same area', function () {
                var comp = createMockComponent({width: 300, height: 20});
                expect(conversionUtils.hasGreaterArea(comp, _.clone(comp))).toBe(false);
            });

            it('should return false if the second component is screen width but the first one is not', function () {
                var comp1 = createMockComponent({width: 200, height: 300});
                var comp2 = createMockComponent({width: 300, height: 100, isScreenWidth: true});
                expect(conversionUtils.hasGreaterArea(comp1, comp2)).toBe(false);
            });

            it('should return true if the first component has a bigger area than the second one', function () {
                var comp1 = createMockComponent({width: 25, height: 15, x: 0, y: 0});
                var comp2 = createMockComponent({width: 20, height: 10, x: 30, y: 20});
                expect(conversionUtils.hasGreaterArea(comp1, comp2)).toBe(true);
                comp1 = createMockComponent({width: 25, height: 15, x: -40, y: -30});
                comp2 = createMockComponent({width: 20, height: 10, x: -30, y: -20});
                expect(conversionUtils.hasGreaterArea(comp1, comp2)).toBe(true);
            });

            it('should return true if the first component is screen width and its height is not less than the height of the second one', function () {
                var comp = createMockComponent({width: 300, height: 20, isScreenWidth: true});
                var comps = _.map([
                    {width: 100, height: 25},
                    {width: 300, height: 10},
                    {width: 300, height: 20, isScreenWidth: true},
                    {width: 300, height: 10, isScreenWidth: true}
                ], createMockComponent);
                _.forEach(comps, function (comp2) {
                    expect(conversionUtils.hasGreaterArea(comp, comp2)).toBe(true);
                });
            });
        });

        describe('overlap calculation', function () {

            describe('axis projections', function () {
                var rangesData = [
                    {range1: [-10, 10], range2: [-20, -5], overlapValue: 5},
                    {range1: [-10, 10], range2: [-15, -10], overlapValue: 0},
                    {range1: [-10, 10], range2: [-5, 5], overlapValue: 10},
                    {range1: [-10, 10], range2: [0, 10], overlapValue: 10},
                    {range1: [-10, 10], range2: [0, 5], overlapValue: 5},
                    {range1: [-10, 10], range2: [5, 10], overlapValue: 5},
                    {range1: [-10, 10], range2: [10, 15], overlapValue: 0},
                    {range1: [0, 20], range2: [0, 20], overlapValue: 20},
                    {range1: [0, 5], range2: [5, 15], overlapValue: 0},
                    {range1: [0, 5], range2: [15, 20], overlapValue: -10},
                    {range1: [0, 5], range2: [1, 5], overlapValue: 4},
                    {range1: [0, 5], range2: [1, 7], overlapValue: 4},
                    {range1: [1, 6], range2: [0, 4], overlapValue: 3},
                    {range1: [1, 6], range2: [0, 6], overlapValue: 5}
                ];

                describe('getXOverlap', function () {

                    function createMockCompByRange(range) {
                        return createMockComponent({x: range[0], width: range[1] - range[0]});
                    }

                    var screenWitdhCompsData = [
                        {
                            comp1: {x: -20, width: 100, isScreenWidth: true},
                            comp2: {x: -20, width: 100},
                            overlapValue: 100
                        },
                        {
                            comp1: {x: 10, width: 50},
                            comp2: {x: -20, width: 100, isScreenWidth: true},
                            overlapValue: 50}
                    ];

                    it('should return width of the non screen width component if one of components is screen width', function () {
                        _.forEach(screenWitdhCompsData, function (screenWitdhCompData) {
                            var comp1 = createMockComponent(screenWitdhCompData.comp1);
                            var comp2 = createMockComponent(screenWitdhCompData.comp2);
                            expect(conversionUtils.getXOverlap(comp1, comp2)).toBe(screenWitdhCompData.overlapValue);
                        });
                    });

                    it('should return intersection of X projections of non screen width components or a negative value they are not intersecting', function () {
                        _.forEach(rangesData, function (rangeData) {
                            var comp1 = createMockCompByRange(rangeData.range1);
                            var comp2 = createMockCompByRange(rangeData.range2);
                            expect(conversionUtils.getXOverlap(comp1, comp2)).toBe(rangeData.overlapValue);
                        });
                    });

                });

                describe('getYOverlap', function () {

                    function createMockCompByRange(range) {
                        return createMockComponent({y: range[0], height: range[1] - range[0]});
                    }

                    it('should return intersection of component bounding rectangles', function () {
                        _.forEach(rangesData, function (rangeData) {
                            var comp1 = createMockCompByRange(rangeData.range1);
                            var comp2 = createMockCompByRange(rangeData.range2);
                            expect(conversionUtils.getYOverlap(comp1, comp2)).toBe(rangeData.overlapValue);
                        });
                    });
                });
            });

            describe('haveSufficientOverlap', function () {

                var overlapAreaToMinCompAreaThresholds = [0, 0.25, 0.75, 1];

                var mockCompsData = [ 
                    {comp1: {x: 10, y: 10, width: 20, height: 20}, comp2: {x: 5, y: 6, width: 10, height: 10}, overlapArea: 30},
                    {comp1: {x: 10, y: 10, width: 10, height: 10}, comp2: {x: 10, y: 10, width: 10, height: 10}, overlapArea: 100}, 
                    {comp1: {x: 10, y: 10, width: 20, height: 20}, comp2: {x: 25, y: 25, width: 10, height: 10}, overlapArea: 25}, 
                    {comp1: {x: 10, y: 10, width: 20, height: 20}, comp2: {x: 30, y: 20, width: 10, height: 40}, overlapArea: 0},
                    {comp1: {x: -10, y: -10, width: 10, height: 10}, comp2: {x: -5, y: -6, width: 20, height: 20}, overlapArea: 30},
                    {comp1: {x: -10, y: 10, width: 25, height: 10}, comp2: {x: 10, y: -10, width: 10, height: 30}, overlapArea: 50},
                    {comp1: {x: -10, y: -10, width: 20, height: 20}, comp2: {x: -30, y: -20, width: 10, height: 40}, overlapArea: 0}
                ];

                it('should return true only if the ration of overlap area and area of the smaller component is greater than the given threshold', function () {
                    _.forEach(mockCompsData, function (mockData) {
                        var comp1 = createMockComponent(mockData.comp1);
                        var comp2 = createMockComponent(mockData.comp2);
                        var minCompArea = Math.min(mockData.comp1.width * mockData.comp1.height, mockData.comp2.width * mockData.comp2.height);
                        _.forEach(overlapAreaToMinCompAreaThresholds, function (ratioThreshold) {
                            expect(conversionUtils.haveSufficientOverlap(comp1, comp2, ratioThreshold)).toBe(mockData.overlapArea > 0 && mockData.overlapArea / minCompArea >= ratioThreshold);
                        });
                    });
                });

            });
        });

        describe('translateComps', function () {

            it('should shift components down / up and left / right depending on the sign of shift values', function () {
                var compPosition = {x: 3, y: 3};
                var shifts = [{x: 5, y: 5}, {x: -5, y: 5}, {x: 5, y: -5}, {x: -5, y: -5}, {x: 5}, {x: -5}, {y: 5}, {y: -5}, {}];
                _.forEach(shifts, function (shift) {
                    var comp = createMockComponent(compPosition);
                    conversionUtils.translateComps([comp], shift.x, shift.y);
                    expect(comp.layout.x).toBe(compPosition.x + (shift.x || 0));
                    expect(comp.layout.y).toBe(compPosition.y + (shift.y || 0));
                });
            });

        });

        describe('getSnugLayout', function () {

            it('should return layout of the bounding rectangle of all components', function () {
                var comps = _.map([
                    {x: -3, y: -2, height: 4, width: 4},
                    {x: 2, y: 3, height: 1, width: 3},
                    {x: 4, y: -3, height: 8, width: 3}
                ], createMockComponent);
                var expectedLayout = {x: -3, y: -3, width: 10, height: 8, rotationInDegrees: 0};
                expect(conversionUtils.getSnugLayout(comps)).toEqual(expectedLayout);
            });

            it('should return nothing if components array is not passed or empty', function () {
                expect(conversionUtils.getSnugLayout()).toBeUndefined();
                expect(conversionUtils.getSnugLayout([])).toBeUndefined();
            });

        });

        describe('unifyGroups', function () {

            it('should set unify groups at first index and remove all non empty groups from the array', function () {
                var groups = [['a', 'b', 'c', 'd'], ['f'], ['f', 'a', 'bb', 'c', 'dd'], ['c'], ['l'], ['d', 'a'], [], ['d', 'cc', 'b', 'aa']];
                conversionUtils.unifyGroups(groups);
                var expectedGroup = [['a', 'b', 'c', 'd', 'f', 'bb', 'dd', 'cc', 'aa'], ['l'], []];
                expect(groups).toEqual(expectedGroup);
            });

            it('should remove all groups if threshold is greater than number of groups', function () {
                var groups = [['a', 'b', 'c', 'd'], [], ['a', 'bb', 'c', 'dd'], ['c', 'd', 'a'], ['d', 'cc', 'b'], ['aa']];
                conversionUtils.unifyGroups(groups, 2);
                expect(groups).toEqual([]);
            });
        });

        describe('canBeNestedTo', function () {
            it('should return false if component is hoverbox', function () {
                var comp = {
                    componentType: 'wysiwyg.viewer.components.HoverBox'
                };

                var res = conversionUtils.canBeNestedTo(comp);

                expect(res).toEqual(false);
            });

            it('should return true if component is columns container with a single child', function () {
                var comp = {
                    conversionData: {
                        category: 'columns'
                    },
                    components: [{
                        id: 'child',
                        componentType: 'button'
                    }]
                };

                var res = conversionUtils.canBeNestedTo(comp);

                expect(res).toEqual(true);
            });

            it('should return false if component is columns container with no children', function () {
                var comp = {
                    conversionData: {
                        category: 'columns'
                    },
                    components: []
                };

                var res = conversionUtils.canBeNestedTo(comp);

                expect(res).toEqual(false);
            });
        });


    });
});
