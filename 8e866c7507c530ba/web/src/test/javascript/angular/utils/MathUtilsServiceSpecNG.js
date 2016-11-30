describe('Unit: MathUtilsService', function () {
    'use strict';

    var mathUtils;

    beforeEach(module('utils'));

    beforeEach(inject(function (_mathUtils_) {
        mathUtils = _mathUtils_;
    }));

    describe('General functionality', function () {
        it('Should convert value to percent in given range', function () {
            var min = 10,
                max = 20,
                value = 12.5,
                result;

            result = mathUtils.percentFromValue(min, max, value);

            expect(result).toEqual(25);
        });

        it('Should convert percent to value in given range', function () {
            var min = 10,
                max = 20,
                percent = 25,
                result;

            result = mathUtils.valueFromPercent(min, max, percent);

            expect(result).toEqual(12.5);
        });

        describe('Should normalize number to step and range', function () {
            it('Should return 0 if input is NaN', function () {
                var min = 10,
                    max = 20,
                    step = 1,
                    noFloats = false,
                    value = 'a',
                    result;

                result = mathUtils.normalizeNumberToStepAndRange(value, step, min, max, noFloats);

                expect(result).toEqual(0);
            });

            it('Should round input if noFloats is true', function () {
                var min = 10,
                    max = 20,
                    step = 0.1,
                    noFloats = true,
                    value = '15.1',
                    result;

                result = mathUtils.normalizeNumberToStepAndRange(value, step, min, max, noFloats);

                expect(result).toEqual(15);
            });

            it('Should round result to closest matched step', function () {
                var min = 10,
                    max = 20,
                    step = 0.2,
                    noFloats = false,
                    value = '15.15',
                    result;

                result = mathUtils.normalizeNumberToStepAndRange(value, step, min, max, noFloats);

                expect(result).toEqual(15.2);
            });

            it('Should keep result equal or greater than minimum', function () {
                var min = 10,
                    max = 20,
                    step = 1,
                    noFloats = false,
                    value = '8',
                    result;

                result = mathUtils.normalizeNumberToStepAndRange(value, step, min, max, noFloats);

                expect(result).toEqual(10);
            });

            it('Should keep result equal or less than minimum', function () {
                var min = 10,
                    max = 20,
                    step = 1,
                    noFloats = false,
                    value = '25',
                    result;

                result = mathUtils.normalizeNumberToStepAndRange(value, step, min, max, noFloats);

                expect(result).toEqual(20);
            });
        });


    });

});