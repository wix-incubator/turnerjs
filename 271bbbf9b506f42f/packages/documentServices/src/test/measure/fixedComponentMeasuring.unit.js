define(['documentServices/measure/fixedComponentMeasuring'], function (fixedComponentMeasuring) {
    'use strict';

    describe('Fixed component measuring tests', function () {
        var TEST_COMP_TYPE = 'test.type';

        it('should register measuring for single type', function () {
            var expectedFunc = jasmine.createSpy();
            fixedComponentMeasuring.setMeasuringForType(TEST_COMP_TYPE, expectedFunc);
            var measuringFunc = fixedComponentMeasuring.getMeasuringByType(TEST_COMP_TYPE);

            expect(measuringFunc).toBe(expectedFunc);
        });

        it('should register measuring for multiple types', function () {
            var expectedFunc = jasmine.createSpy();
            fixedComponentMeasuring.setMeasuringForType(['test.type1', 'test.type2'], expectedFunc);
            var measuringFuncFirst = fixedComponentMeasuring.getMeasuringByType('test.type1');
            var measuringFuncSecond = fixedComponentMeasuring.getMeasuringByType('test.type2');

            expect(measuringFuncFirst).toBe(expectedFunc);
            expect(measuringFuncSecond).toBe(expectedFunc);
        });

        describe('get fixed measurements', function () {
            var compMeasuringInfo, siteMarginBottom, screenSize, measuringFunc;

            beforeEach(function () {
                measuringFunc = jasmine.createSpy();
                compMeasuringInfo = {
                    layout: {
                        width: 10,
                        height: 10
                    },
                    props: {
                        placement: 'TOP_LEFT'
                    },
                    data: {}
                };
                siteMarginBottom = 40;
                screenSize = {
                    width: 100,
                    height: 100
                };
            });

            it('should get fixed component measurements', function () {
                measuringFunc.and.returnValue({
                    top: 0,
                    left: 0
                });

                var position = fixedComponentMeasuring.getFixedComponentMeasurements(measuringFunc, compMeasuringInfo, screenSize, siteMarginBottom);

                expect(position).toEqual({
                    top: 0,
                    left: 0,
                    height: 10,
                    width: 10
                });
            });

            it('should return null because got no measuring func', function () {
                measuringFunc.and.returnValue({
                    left: 0,
                    bottom: 0
                });

                var position = fixedComponentMeasuring.getFixedComponentMeasurements(null, compMeasuringInfo, screenSize, siteMarginBottom);

                expect(position).toEqual(null);
            });
        });
    });
});