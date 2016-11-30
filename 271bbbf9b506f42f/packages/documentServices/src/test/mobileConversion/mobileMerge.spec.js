                                             /**
 * Created by noamr on 22/08/2016.
 */
define(['lodash', 'documentServices/mobileConversion/modules/mobileMerge', 'documentServices/mobileConversion/modules/mobileConversion'], function(_, mobileMerge, mobileConversion) {
    "use strict";

    function newComp(id, layout, conversionData, components) {
        if (_.isArray(conversionData)) {
            components = conversionData;
            conversionData = {};
        }
        return {id: id, layout: {x: layout[0], y: layout[1], width: layout[2], height: layout[3], fixedPosition: layout[4] || false}, conversionData: conversionData || {}, components: components || []};
    }

    function getComponentsLayout(root) {
        function reduceComponentsLayout(map, comp) {
            var l = {};
            l[comp.id] = [comp.layout.x, comp.layout.y, comp.layout.width, comp.layout.height];
            _.assign(map, l);
            return _.transform(comp.components || comp.children, reduceComponentsLayout, map);
        }

        return reduceComponentsLayout({}, root);
    }

    function mergeStructureAndGetLayouts(desktopStructure, mobileStructure, explicitlyDeleted) {
        mobileMerge.mergeStructure(desktopStructure, mobileStructure, 'page', explicitlyDeleted);
        return getComponentsLayout(mobileStructure);
    }

    function mergeSiteAndGetLayout(desktopSite, mobileSite, explicitlyDeleted, settings) {
        var results = mobileConversion.mobileConversion({}).execMobileMerge(desktopSite, mobileSite, explicitlyDeleted, settings);
        return _.mapValues(results, getComponentsLayout);
    }

    describe('mobileMerge', function() {
        describe('Structure Merge', function() {
            describe('filterChildrenWhenHidden components', function() {
                it('should remove children of filterChildrenWhenHidden components which are in the hidden components list', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50], {filterChildrenWhenHidden: true}, [newComp('c2', [20, 100, 50, 100])])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], [
                        newComp('c2', [5, 3, 280, 20])
                    ]);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure, ['c1'])).toEqual({p1: [0, 0, 320, 50]});
                });

                it('should not add children of filterChildrenWhenHidden components which are in the hidden components list', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50], {filterChildrenWhenHidden: true}, [newComp('c2', [20, 100, 50, 100])])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], []);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure, ['c1'])).toEqual({p1: [0, 0, 320, 800]});
                });

                it('should add filterChildrenWhenHidden components and their children which are not in the hidden components list', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50], {filterChildrenWhenHidden: true}, [newComp('c2', [20, 100, 50, 100])])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], []);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure)).toEqual({p1: [0, 0, 320, 800], c1: [110, 10, 100, 210], c2: [20, 100, 50, 100]});
                });

                it('should add children of filterChildrenWhenHidden components which are not in the hidden components list', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50], {filterChildrenWhenHidden: true}, [newComp('c2', [20, 100, 50, 100])])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], [
                        newComp('c1', [5, 3, 280, 20])
                    ]);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure)).toEqual({p1: [0, 0, 320, 800], c1: [5, 3, 280, 120], c2: [115, 10, 50, 100]});
                });
            });

            describe('should add a single components', function() {
                it('should not shift upper components and keep distance from the upper block', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50]),
                        newComp('c2', [20, 100, 50, 100])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], [
                        newComp('c1', [5, 3, 280, 20])
                    ]);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure)).toEqual({p1: [0, 0, 320, 800], c1: [5, 3, 280, 20], c2: [135, 33, 50, 100]});
                });

                it('should shift up lower components and keep distance from the top of the page and the lower block', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50]),
                        newComp('c2', [20, 100, 50, 100])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], [
                        newComp('c2', [5, 103, 280, 20])
                    ]);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure)).toEqual({p1: [0, 0, 320, 800], c1: [110, 10, 100, 50], c2: [5, 70, 280, 20]});
                });

                it('should shift up lower components and keep distance from the lower and the upper blocks', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50]),
                        newComp('c2', [20, 100, 50, 100]),
                        newComp('c3', [25, 200, 50, 100])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], [
                        newComp('c1', [5, 103, 280, 20]),
                        newComp('c3', [5, 153, 280, 20])
                    ]);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure)).toEqual({p1: [0, 0, 320, 800], c1: [5, 103, 280, 20], c2: [135, 133, 50, 100], c3: [5, 243, 280, 20]});
                });
            });

            describe('should add a group of components', function() {
                it('to appropriate proportion group', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50], {isSuitableForProportionGrouping: true}),
                        newComp('c2', [20, 100, 50, 200], {isSuitableForProportionGrouping: true}),
                        newComp('c3', [20, 200, 50, 100], {isSuitableForProportionGrouping: true})
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], [
                        newComp('c1', [5, 3, 280, 20])
                    ]);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure)).toEqual({p1: [0, 0, 320, 800], c1: [5, 3, 280, 20], c2: [135, 33, 50, 200], c3: [135, 133, 50, 100]});
                });

                it('should not shift upper components and keep distance from the upper block', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50]),
                        newComp('c2', [20, 100, 50, 200]),
                        newComp('c3', [20, 200, 50, 100])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], [
                        newComp('c1', [5, 3, 280, 20])
                    ]);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure)).toEqual({p1: [0, 0, 320, 800], c1: [5, 3, 280, 20], c2: [135, 33, 50, 200], c3: [135, 243, 50, 100]});
                });

                it('should shift up lower components and keep distance from the top of the page and the lower block', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50]),
                        newComp('c2', [10, 65, 200, 18]),
                        newComp('c3', [20, 100, 50, 100])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], [
                        newComp('c3', [5, 103, 280, 20])
                    ]);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure)).toEqual({p1: [0, 0, 320, 800], c1: [110, 10, 100, 50], c2: [10, 70, 300, 27], c3: [5, 107, 280, 20]});
                });

                it('should shift up lower components and keep distance from the lower and the upper blocks', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50]),
                        newComp('c2', [20, 100, 250, 35]),
                        newComp('c3', [25, 200, 120, 42]),
                        newComp('c4', [20, 300, 50, 100])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], [
                        newComp('c1', [5, 103, 280, 20]),
                        newComp('c4', [5, 153, 280, 20])
                    ]);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure)).toEqual({p1: [0, 0, 320, 800], c1: [5, 103, 280, 20], c2: [10, 133, 300, 42], c3: [100, 185, 120, 42], c4: [5, 237, 280, 20]});
                });

                it('ignoring mobile-hidden components', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50]),
                        newComp('c2', [20, 100, 250, 35]),
                        newComp('c3', [25, 200, 120, 42]),
                        newComp('c4', [20, 300, 50, 100])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], [
                        newComp('c1', [5, 103, 280, 20]),
                        newComp('c4', [5, 153, 280, 20])
                    ]);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure, ['c2'])).toEqual({p1: [0, 0, 320, 800], c1: [5, 103, 280, 20], c3: [100, 133, 120, 42], c4: [5, 185, 280, 20]});
                });

                describe('fixed position components', function() {
                    var IS_FIXED_POSITION_COMP = true;
                    var settings = {keepNotRecommendedMobileComponents: false, keepEmptyTextComponents: false};

                    it('should not affect fixed position components already existing in mobile', function () {
                        var desktopStructure = {p1: newComp('p1', [0, 0, 500, 500], [newComp('p1c1', [10, 10, 100, 50, IS_FIXED_POSITION_COMP])])};
                        var mobileStructure = {p1: newComp('p1', [0, 0, 320, 800], [newComp('p1c1', [10, 10, 100, 50])])};
                        var expectedMobileStructure = {p1: {p1: [0, 0, 320, 800], p1c1: [10, 10, 100, 50]}};
                        expect(mergeSiteAndGetLayout(desktopStructure, mobileStructure, [], settings)).toEqual(expectedMobileStructure);
                    });

                    it('should hide fixed position components by default if ignore components not recommended to mobile is true', function () {
                        var desktopStructure = {p1: newComp('p1', [0, 0, 500, 500], [newComp('p1c1', [10, 10, 100, 50, IS_FIXED_POSITION_COMP])])};
                        var mobileStructure = {p1: newComp('p1', [0, 0, 320, 800])};
                        var expectedMobileStructure = {p1: {p1: [0, 0, 320, 800]}};
                        expect(mergeSiteAndGetLayout(desktopStructure, mobileStructure, [], settings)).toEqual(expectedMobileStructure);
                    });

                    it('should convert fixed position components to absolute if ignore components not recommended to mobile is true and component has corresponding meta data flag', function () {
                        var desktopStructure = {p1: newComp('p1', [0, 0, 500, 500], [newComp('p1c1', [10, 10, 100, 50, IS_FIXED_POSITION_COMP], {convertFixedPositionToAbsolute: true})])};
                        var mobileStructure = {p1: newComp('p1', [0, 0, 320, 800])};
                        var expectedMobileStructure = {p1: {p1: [0, 0, 320, 800], p1c1: [110, 10, 100, 50]}};
                        expect(mergeSiteAndGetLayout(desktopStructure, mobileStructure, [], settings)).toEqual(expectedMobileStructure);
                    });

                    it('should convert fixed position components to absolute if ignore components not recommended to mobile is false', function () {
                        var desktopStructure = {p1: newComp('p1', [0, 0, 500, 500], [newComp('p1c1', [10, 10, 100, 50, IS_FIXED_POSITION_COMP])])};
                        var mobileStructure = {p1: newComp('p1', [0, 0, 320, 800])};
                        var expectedMobileStructure = {p1: {p1: [0, 0, 320, 800], p1c1: [110, 10, 100, 50]}};
                        expect(mergeSiteAndGetLayout(desktopStructure, mobileStructure, [])).toEqual(expectedMobileStructure);

                        desktopStructure = {p1: newComp('p1', [0, 0, 500, 500], [newComp('p1c1', [10, 10, 100, 50, IS_FIXED_POSITION_COMP], {convertFixedPositionToAbsolute: true})])};
                        expect(mergeSiteAndGetLayout(desktopStructure, mobileStructure, [])).toEqual(expectedMobileStructure);
                    });
                });
            });

            describe('removing components', function() {
                it('should not shift upper components', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 100, 50])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], [
                        newComp('c1', [5, 3, 280, 20]),
                        newComp('c2', [135, 33, 50, 100])
                    ]);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure)).toEqual({p1: [0, 0, 320, 50], c1: [5, 3, 280, 20]});
                });
                it('should shift up lower components', function () {
                    var desktopStructure = newComp('p1', [0, 0, 500, 500], [
                        newComp('c2', [10, 10, 100, 50])
                    ]);

                    var mobileStructure = newComp('p1', [0, 0, 320, 800], [
                        newComp('c1', [5, 3, 280, 20]),
                        newComp('c2', [135, 33, 50, 100])
                    ]);

                    expect(mergeStructureAndGetLayouts(desktopStructure, mobileStructure)).toEqual({p1: [0, 0, 320, 800], c2: [135, 3, 50, 100]});
                });

            });
        });

        describe('Site Merge', function() {
            it('should return pages and deleted components', function() {
                var desktopStructure = {
                    p1: newComp('p1', [0, 0, 500, 500], [
                            newComp('p1c2', [10, 10, 100, 50])
                        ]),
                    p2: newComp('p2', [0, 0, 500, 500], [
                        newComp('p2c2', [10, 10, 300, 50])
                    ])
                };

                var mobileStructure = {
                    p1: newComp('p1', [0, 0, 320, 800], [
                        newComp('c1', [5, 3, 280, 20]),
                        newComp('p1c2', [135, 33, 50, 100])
                    ]),
                    p2: newComp('p2', [0, 0, 320, 200], [
                        newComp('p2c2', [10, 10, 111, 32])
                    ])
                };

                expect(mergeSiteAndGetLayout(desktopStructure, mobileStructure)).toEqual({
                    p1: {p1: [0, 0, 320, 800], p1c2: [135, 3, 50, 100]},
                    p2: {p2: [0, 0, 320, 200], p2c2: [10, 10, 111, 32]}
                });
            });

            it('should not return moved components as deleted components', function() {
                var desktopStructure = {
                    p1: newComp('p1', [0, 0, 500, 500], [
                        newComp('p1c2', [10, 10, 100, 50])
                    ]),
                    p2: newComp('p2', [0, 0, 500, 500], [
                        newComp('c1', [10, 10, 300, 50])
                    ])
                };

                var mobileStructure = {
                    p1: newComp('p1', [0, 0, 320, 800], [
                        newComp('c1', [5, 3, 280, 20]),
                        newComp('p1c2', [135, 33, 50, 100])
                    ]),
                    p2: newComp('p2', [0, 0, 320, 200])
                };

                expect(mergeSiteAndGetLayout(desktopStructure, mobileStructure)).toEqual({
                    p1: {p1: [0, 0, 320, 800], p1c2:[135, 3, 50, 100]},
                    p2: {p2: [0, 0, 320, 200], c1: [10, 10, 300, 50]}
                });

            });

            it('should add groups to the structure without changing the position of their original components', function() {
                var desktopStructure = {
                    p1: newComp('p1', [0, 0, 320, 800], [
                        _.assign({componentType: 'wysiwyg.viewer.components.Group'}, newComp('g1', [10, 20, 100, 100], [
                            newComp('c1', [30, 0, 50, 100]),
                            newComp('c2', [50, 100, 50, 100])
                        ]))])
                };

                var mobileStructure = {
                    p1: newComp('p1', [0, 0, 320, 800], [
                            newComp('c1', [20, 20, 50, 100]),
                            newComp('c2', [20, 100, 50, 100])
                        ])
                };

                expect(mergeSiteAndGetLayout(desktopStructure, mobileStructure)).toEqual({
                    p1: {p1: [0, 0, 320, 800], g1:[20, 20, 50, 180], c1: [0, 0, 50, 100], c2: [0, 80, 50, 100]}
                });

            });
        });
    });
});
