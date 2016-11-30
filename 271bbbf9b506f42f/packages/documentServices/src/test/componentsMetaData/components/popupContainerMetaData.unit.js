define(['documentServices/componentsMetaData/components/popupContainerMetaData',
        'documentServices/constants/constants'], function (popupContainerMetaData, constants) {
    'use strict';
    describe('popupContainerMetaData - resizableSides', function() {
        var resizableSides = popupContainerMetaData.resizableSides,
            LEFT = constants.RESIZE_SIDES.LEFT,
            RIGHT = constants.RESIZE_SIDES.RIGHT,
            BOTTOM = constants.RESIZE_SIDES.BOTTOM,
            TOP = constants.RESIZE_SIDES.TOP;

        function createPS(alignmentType, horizontalAlignment, verticalAlignment) {
            return {
                dal: {
                    get: function () {
                        return {
                            horizontalAlignment: horizontalAlignment,
                            verticalAlignment: verticalAlignment,
                            alignmentType: alignmentType
                        };
                    }
                },
                pointers: {
                    data: {
                        getPropertyItem: jasmine.createSpy()
                    }
                }
            };
        }

        function isArraysEqual(result, expected) {
            result.forEach(function (resultItem) {
                expect(expected).toContain(resultItem);
            });
        }

        describe('nineGrid', function () {
            var alignmentType = 'nineGrid';

            describe('vertical align: top', function () {
                var verticalAlignment = 'top';

                it('should return [BOTTOM, RIGHT]       for horizontal align left', function () {
                    var sides = resizableSides(createPS(alignmentType, 'left', verticalAlignment));
                    isArraysEqual(sides, [BOTTOM, RIGHT]);
                });

                it('should return [BOTTOM, RIGHT, LEFT] for horizontal align center', function () {
                    var sides = resizableSides(createPS(alignmentType, 'center', verticalAlignment));
                    isArraysEqual(sides, [BOTTOM, RIGHT, LEFT]);
                });

                it('should return [BOTTOM, LEFT]        for horizontal align right', function () {
                    var sides = resizableSides(createPS(alignmentType, 'right', verticalAlignment));
                    isArraysEqual(sides, [BOTTOM, LEFT]);
                });
            });

            describe('vertical align: center', function () {
                var verticalAlignment = 'center';

                it('should return [BOTTOM, RIGHT]       for horizontal align left', function () {
                    var sides = resizableSides(createPS(alignmentType, 'left', verticalAlignment));
                    isArraysEqual(sides, [TOP, BOTTOM, RIGHT]);
                });

                it('should return [BOTTOM, RIGHT, LEFT] for horizontal align center', function () {
                    var sides = resizableSides(createPS(alignmentType, 'center', verticalAlignment));
                    isArraysEqual(sides, [TOP, BOTTOM, RIGHT, LEFT]);
                });

                it('should return [BOTTOM, LEFT]        for horizontal align right', function () {
                    var sides = resizableSides(createPS(alignmentType, 'right', verticalAlignment));
                    isArraysEqual(sides, [TOP, BOTTOM, LEFT]);
                });
            });

            describe('vertical align: bottom', function () {
                var verticalAlignment = 'bottom';

                it('should return [TOP, RIGHT]       for horizontal align left', function () {
                    var sides = resizableSides(createPS(alignmentType, 'left', verticalAlignment));
                    isArraysEqual(sides, [TOP, RIGHT]);
                });

                it('should return [TOP, RIGHT, LEFT] for horizontal align center', function () {
                    var sides = resizableSides(createPS(alignmentType, 'center', verticalAlignment));
                    isArraysEqual(sides, [TOP, RIGHT, LEFT]);
                });

                it('should return [TOP, LEFT]        for horizontal align right', function () {
                    var sides = resizableSides(createPS(alignmentType, 'right', verticalAlignment));
                    isArraysEqual(sides, [TOP, LEFT]);
                });
            });
        });

        describe('fullHeight', function () {
            var alignmentType = 'fullHeight',
                verticalAlignment = 'dose not matter';

            it('should return [RIGHT]       for horizontal align left', function () {
                var sides = resizableSides(createPS(alignmentType, 'left', verticalAlignment));
                isArraysEqual(sides, [RIGHT]);
            });

            it('should return [RIGHT, LEFT] for horizontal align center', function () {
                var sides = resizableSides(createPS(alignmentType, 'center', verticalAlignment));
                isArraysEqual(sides, [RIGHT, LEFT]);
            });

            it('should return [LEFT]        for horizontal align right', function () {
                var sides = resizableSides(createPS(alignmentType, 'right', verticalAlignment));
                isArraysEqual(sides, [LEFT]);
            });
        });

        describe('fullWidth', function () {
            var alignmentType = 'fullWidth',
                horizontalAlign = 'dose not matter';

            it('should return [BOTTOM]      for vertical align top', function () {
                var sides = resizableSides(createPS(alignmentType, horizontalAlign, 'top'));
                isArraysEqual(sides, [BOTTOM]);
            });

            it('should return [TOP, BOTTOM] for vertical align center', function () {
                var sides = resizableSides(createPS(alignmentType, horizontalAlign, 'center'));
                isArraysEqual(sides, [TOP, BOTTOM]);
            });

            it('should return [TOP]         for vertical align bottom', function () {
                var sides = resizableSides(createPS(alignmentType, horizontalAlign, 'bottom'));
                isArraysEqual(sides, [TOP]);
            });
        });
    });
});
