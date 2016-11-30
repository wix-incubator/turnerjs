define(['lodash', 'dataFixer/plugins/addMissingAnchorsOfMasterPage'], function (_, addMissingAnchorsOfMasterPage) {
    'use strict';

    describe('addMissingAnchorsOfMasterPage', function () {
        var test = addMissingAnchorsOfMasterPage.test;
        var layout;

        beforeEach(function () {
            layout = {
                width: 16,
                height: 8
            };
        });

        describe('getBoundingHeight', function () {
            it('no rotation', function () {
                layout.rotationInDegrees = 0;
                var height = test.getBoundingHeight(layout);
                expect(height).toBe(layout.height);
            });

            it('90 deg rotation', function () {
                layout.rotationInDegrees = 90;
                var height = test.getBoundingHeight(layout);
                expect(height).toBe(layout.width);
            });

            it('no rotation', function () {
                layout.rotationInDegrees = 180;
                var height = test.getBoundingHeight(layout);
                expect(height).toBe(layout.height);
            });
        });

        describe('getBoundingY', function () {
            beforeEach(function () {
                layout.y = 32;
            });

            it('no rotation', function () {
                layout.rotationInDegrees = 0;
                var y = test.getBoundingY(layout);
                expect(y).toBe(layout.y);
            });

            it('90 deg rotation', function () {
                layout.rotationInDegrees = 90;
                var y = test.getBoundingY(layout);
                expect(y).toBe(layout.y - (layout.width - layout.height) / 2);
            });

            it('no rotation', function () {
                layout.rotationInDegrees = 180;
                var y = test.getBoundingY(layout);
                expect(y).toBe(layout.y);
            });
        });

        describe('getLowestComp', function () {
            var comps;

            beforeEach(function () {
                comps = [];
                for (var i = 0; i < 3; ++i) {
                    comps.push({
                        layout: _.assign({y: i}, layout)
                    });
                }
            });

            it('find it', function () {
                var lowest = test.getLowestComp(comps);
                expect(lowest).toBe(_.last(comps));
            });
        });
    });
});
