define([
    'lodash',
    'documentServices/mobileConversion/modules/structureConverter'
], function(_, structureConverter) {
    'use strict';

    function rescale(comp, width) {
        var compClone = _.cloneDeep(comp);
        structureConverter.rescaleComponent(compClone, width);
        return compClone;
    }

    function newComp(layout, conversionData, components) {
        return {
            layout: {x: layout[0], y: layout[1], width: layout[2], height: layout[3]},
            conversionData: conversionData || {},
            components: components
        };
    }

    describe('Mobile Algorithm Structure Converter', function () {
        describe('single component', function () {
            describe('width', function () {
                it('should equal the given width', function () {
                    expect(rescale(newComp([0, 0, 800, 320]), 200).layout.width).toEqual(200);
                });
            });
            describe('height', function () {
                it('should be proportional', function () {
                    expect(rescale(newComp([0, 0, 800, 320]), 200).layout.height).toEqual(80);
                });

                it('should not be modified if preserveAspectRatio is false', function () {
                    expect(rescale(newComp([0, 0, 800, 320], {preserveAspectRatio: false}), 200).layout.height).toEqual(320);
                });

                it('should be overridden by fixedSize', function () {
                    expect(rescale(newComp([0, 0, 800, 320], {
                        fixedSize: {
                            width: 100,
                            height: 100
                        }
                    }), 200).layout.height).toEqual(100);
                });

                it('should have the height of the average font size for text components', function () {
                    expect(rescale(newComp([0, 0, 800, 320], {
                        category: 'text',
                        averageFontSize: 15
                    }), 200).layout.height).toEqual(15);
                });

                it('should be at least min-height', function () {
                    expect(rescale(newComp([0, 0, 800, 320], {minHeight: 100}), 200).layout.height).toEqual(100);
                });

                it('should not grow from desktop height based on min-height', function () {
                    expect(rescale(newComp([0, 0, 800, 50], {minHeight: 100}), 200).layout.height).toEqual(50);
                });

            });
        });

        describe('proportional rescale', function () {
            it('should ignore metadata', function () {
                expect(rescale(newComp([0, 0, 100, 200], {rescaleMethod: 'proportional'}, [newComp([10, 10, 20, 20], {defaultHeight: 50})]), 50).components[0].layout).toEqual({
                    x: 5, y: 5, height: 10, width: 10
                });
            });
            it('should scale text proportionally', function () {
                expect(rescale(newComp([0, 0, 100, 200], {rescaleMethod: 'proportional'},
                    [newComp([10, 10, 20, 20], {averageFontSize: 16, category: 'text'})]
                ), 50).components[0].layout.scale).toEqual(0.5);
            });
            it('should scale text taking into account viewer transform', function () {
                var result = rescale(newComp([0, 0, 100, 200], {rescaleMethod: 'proportional'}, [newComp([10, 10, 20, 20], {
                    averageFontSize: 64,
                    category: 'text'
                })]), 50);
                expect(result.components[0].layout.scale).toBeGreaterThan(0.5);
                expect(result.components[0].layout.scale).toBeLessThan(0.95);
            });
        });

        describe('background rescale', function () {
            it('should ignore metadata', function () {
                expect(rescale(newComp([0, 0, 100, 200], {rescaleMethod: 'background'}, [newComp([10, 10, 20, 20], {defaultHeight: 50})]), 50).components[0].layout).toEqual({
                    x: 5, y: 5, height: 10, width: 10
                });
            });
            it('should not scale text proportionally', function () {
                expect(rescale(newComp([0, 0, 100, 200], {rescaleMethod: 'background'},
                        [newComp([10, 10, 20, 20], {averageFontSize: 16, category: 'text'})]
                    ), 50).components[0].layout.scale || 1).toEqual(1);
            });

        });

        describe('children organizing', function () {
            function compWithDirectives(comp, o) {
                var directives = {
                    fullWidth: {conversionData: {stretchHorizontally: true}},
                    tight: {conversionData: {isTightContainer: true}},
                    tightBottomMargin: {conversionData: {tightBottomMargin: true}},
                    border: {conversionData: {borderWidth: 5}},
                    transparent: {conversionData: {isTransparentContainer: true}},
                    column: {conversionData: {category: 'column'}},
                    withSiblings: {conversionData: {siblingCount: 1}},
                    noSiblings: {conversionData: {siblingCount: 0}},
                    siteSegment: {conversionData: {category: 'siteSegments'}},
                    hasMarginX: {conversionData: {marginX: 15}},
                    y0: {layout: {y: 0}}
                };

                _.forEach((o || '').split(' '), function (directive) {
                    _.merge(comp, directives[directive]);
                });

                comp.conversionData = comp.conversionData || {};

                return comp;
            }

            describe('top padding', function () {
                function checkTopPadding(object) {
                    var target = compWithDirectives({
                        layout: {x: 0, y: 0, width: 100, height: 100}
                    }, object.target);

                    var structure = compWithDirectives({
                        layout: {x: 0, y: 0, width: 100, height: 100}, conversionData: {componentsOrder: ['a']},
                        components: [compWithDirectives({
                            id: 'a',
                            layout: {x: 10, y: 10, width: 50, height: 80}
                        }, object.first)]
                    }, object.parent);

                    structureConverter.reorganizeChildren(structure, target, 200);
                    return structure.components[0].layout.y;
                }

                it('should be 0 when in a tight container', function () {
                    expect(checkTopPadding({parent: 'tight'})).toEqual(0);
                    expect(checkTopPadding({parent: 'transparent'})).toEqual(0);
                    expect(checkTopPadding({parent: 'tight', target: 'border'})).toEqual(0);
                    expect(checkTopPadding({parent: 'transparent column noSiblings'})).toEqual(0);
                });

                it('should be 0 when the first child is a non-transparent fullWidth and has a y of 0', function () {
                    expect(checkTopPadding({first: 'fullWidth y0'})).toEqual(0);
                    expect(checkTopPadding({first: 'fullWidth y0 transparent'})).toEqual(0);
                });

                it('should add the border width to the top padding', function () {
                    expect(checkTopPadding({target: 'fullWidth border'})).toEqual(25);
                    expect(checkTopPadding({target: 'border'})).toEqual(15);
                });

                it('should be 10 by default', function () {
                    expect(checkTopPadding({})).toEqual(10);
                    expect(checkTopPadding({parent: 'transparent column withSiblings'})).toEqual(10);
                });

                it('should be 20 when the target stretches to screen width or is a site segment', function () {
                    expect(checkTopPadding({target: 'fullWidth'})).toEqual(20);
                });
            });

            describe('horizontal padding', function () {
                function checkHorizontalPadding(object) {
                    var target = compWithDirectives({
                        layout: {x: 0, y: 0, width: 100, height: 100}
                    }, object);

                    var structure = compWithDirectives({
                        layout: {x: 0, y: 0, width: 100, height: 100},
                        conversionData: {componentsOrder: ['a'], naturalAlignment: 'left'},
                        components: [compWithDirectives({id: 'a', layout: {x: 10, y: 10, width: 50, height: 80}})]
                    });

                    structureConverter.reorganizeChildren(structure, target, 200);
                    return structure.components[0].layout.x;
                }

                it('should be 0 for transparent non-column', function () {
                    expect(checkHorizontalPadding('transparent')).toEqual(0);
                });
                it('should be taken from conversionConfig', function () {
                    expect(checkHorizontalPadding('hasMarginX')).toEqual(15);
                });
                it('should be 20 when the target is full width', function () {
                    expect(checkHorizontalPadding('fullWidth')).toEqual(20);
                });
                it('should be 10 by default', function () {
                    expect(checkHorizontalPadding()).toEqual(10);
                });
            });

            describe('parent & child', function () {
                it('should treat screen-width components separately', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: []}, [
                        newComp([0, 0, 60, 100], {stretchHorizontally: true})
                    ]), 180).components[0].layout).toEqual({x: 0, y: 0, width: 180, height: 300});
                });
                it('should treat invisible components separately', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: []}, [
                        newComp([0, 0, 60, 100], {isInvisible: true})
                    ]), 180).components[0].layout).toEqual({x: 0, y: -1, width: 60, height: 100});
                });
                it('should center a component', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: [], naturalAlignment: 'center'}, [
                        newComp([0, 0, 60, 100])]), 320).components[0].layout.x).toEqual(130);
                });
                it('should center a component by default', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: []}, [
                        newComp([0, 0, 60, 100])]), 320).components[0].layout.x).toEqual(130);
                });
                it('should center a component that has fixed size', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: []}, [
                        newComp([0, 0, 60, 100], {
                            fixedSize: {
                                width: 200,
                                height: 100
                            }
                        })]), 320).components[0].layout).toEqual({x: 60, y: 10, width: 200, height: 100});
                });
                it('should scale photos by given factor', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: [], descendantImageScaleFactor: 0.5}, [
                        newComp([0, 0, 60, 100], {category: 'photo'})]), 320).components[0].layout).toEqual({
                        x: 145,
                        y: 10,
                        width: 30,
                        height: 50
                    });
                });
                it('should not scale photos larger than allowed width', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: [], descendantImageScaleFactor: 50}, [
                        newComp([0, 0, 60, 100], {category: 'photo'})]), 320).components[0].layout).toEqual({
                        x: 10,
                        y: 10,
                        width: 300,
                        height: 500
                    });
                });
                it('should handle right alignment', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: [], naturalAlignment: 'right'}, [
                        newComp([0, 0, 60, 100])]), 320).components[0].layout.x).toEqual(250);
                });
                it('should handle left alignment', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: [], naturalAlignment: 'left'}, [
                        newComp([0, 0, 60, 100])]), 320).components[0].layout.x).toEqual(10);
                });
                it('should enlarge components larger than 140px to fit width', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: []}, [
                        newComp([0, 0, 200, 100])]), 320).components[0].layout.width).toEqual(300);
                });
                it('should enlarge components with shouldEnlargeToFitWidth to fit width', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: []}, [
                        newComp([0, 0, 10, 100], {shouldEnlargeToFitWidth: true})]), 320).components[0].layout.width).toEqual(300);
                });
                it('should shrink components larger than available width', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: []}, [
                        newComp([0, 0, 1000, 100], {shouldEnlargeToFitWidth: true})]), 320).components[0].layout.width).toEqual(300);
                });
                it('should be copied as is when there is a preset', function () {
                    expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: []}, [
                        newComp([0, 0, 60, 100], {preset: newComp([1, 2, 3, 4], {}, [newComp([5, 6, 7, 8])])})
                    ]), 180).components[0]).toEqual({
                        layout: {x: 89, y: 10, width: 3, height: 4},
                        conversionData: {},
                        components: [{
                            layout: {x: 5, y: 6, width: 7, height: 8},
                            components: undefined,
                            conversionData: {}
                        }]
                    });
                });

                describe('top right margin', function () {
                    it('should make available space narrower', function() {
                        expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: [], naturalAlignment: 'left', topRightMargin: [80, 100]}, [
                            newComp([0, 0, 60, 100], {shouldEnlargeToFitWidth: true})]), 320).components[0].layout.width).toEqual(230);
                    });
                    it('should affect x when centered', function() {
                        expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: [], naturalAlignment: 'center', topRightMargin: [80, 100]}, [
                            newComp([0, 0, 60, 100], {shouldEnlargeToFitWidth: true})]), 320).components[0].layout).toEqual({x: 80, y: 10, width: 160, height: 267});
                    });
                    it('should increase y when component cannot fit', function() {
                        expect(rescale(newComp([0, 0, 500, 200], {componentsOrder: [], naturalAlignment: 'center', topRightMargin: [80, 100]}, [
                            newComp([0, 0, 60, 100], {fixedSize: {width: 200, height: 100}})]), 320).components[0].layout.y).toEqual(100);

                    });
                });

                describe('bottom padding', function () {
                    function checkBottomPadding(object) {
                        var structure = compWithDirectives({
                            layout: {x: 0, y: 0, width: 100, height: 100},
                            conversionData: {componentsOrder: []},
                            components: [{
                                id: 'a',
                                conversionData: {},
                                layout: {x: 10, y: 10, width: 50, height: 80}
                            }]
                        }, object);

                        structureConverter.rescaleComponent(structure, 320);
                        return structure.layout.height - structure.components[0].layout.height - structure.components[0].layout.y;
                    }

                    it('should be 10 by default', function () {
                        expect(checkBottomPadding('')).toEqual(10);
                        expect(checkBottomPadding('transparent column')).toEqual(10);
                    });

                    it('should be 20 for fullWidth', function () {
                        expect(checkBottomPadding('fullWidth')).toEqual(20);
                        expect(checkBottomPadding('fullWidth border')).toEqual(20);
                    });

                    it('should take border onto account', function () {
                        expect(checkBottomPadding('border')).toEqual(15);
                    });

                    it('should be tight when data applies', function () {
                        expect(checkBottomPadding('tight')).toEqual(0);
                        expect(checkBottomPadding('tightBottomMargin')).toEqual(0);
                    });
                });
            });

            describe('several children', function () {
                it('should take component order onto account', function() {
                    var structure = rescale(newComp([0, 0, 100, 100], {componentsOrder: ['a', 'b']}, [
                        {id: 'b', layout: {x: 10, y: 10, width: 20, height: 20}, conversionData: {}},
                        {id: 'a', layout: {x: 5, y: 5, width: 1, height: 1}, conversionData: {}}
                    ]), 320);
                    expect(_.find(structure.components, {id: 'a'}).layout.y).toBeLessThan(_.find(structure.components, {id: 'b'}).layout.y);
                });

                describe('margins', function () {
                    function testMargins(a, b) {
                        var structure = rescale(newComp([0, 0, 100, 100], {componentsOrder: []}, [
                            newComp([0, 0, 100, 50], a),
                            newComp([0, 120, 50, 50], b)
                        ]), 320);
                        return (structure.components[1].layout.y - structure.components[0].layout.y - structure.components[0].layout.height);
                    }

                    it('should be 10 by default', function () {
                        expect(testMargins({}, {})).toEqual(10);
                    });
                    it('should be 0 for tight siblings', function () {
                        expect(testMargins({}, {tightWithPreviousSibling: true})).toEqual(0);
                    });
                    it('should be 20 between text and non text', function () {
                        expect(testMargins({category: 'text'}, {})).toEqual(20);
                    });
                    it('should be text between non-text and text', function () {
                        expect(testMargins({}, {category: 'text'})).toEqual(10);
                    });
                });
            });
        });
    });
});
