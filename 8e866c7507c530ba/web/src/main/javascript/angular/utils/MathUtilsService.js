W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    angular.module('utils')
        .factory('mathUtils', function () {
            var percentFromValue = function (min, max, value) {
                var range = max - min,
                    rangeValue = value - min,
                    percent = (rangeValue / range) * 100;

                return percent;
            };

            var valueFromPercent = function (min, max, percent) {
                var range = max - min,
                    rangeValue = range * percent / 100,
                    value = rangeValue + min;

                return value;
            };

            var normalizeNumberToStepAndRange = function (input, step, min, max, noFloats) {
                input = Number(input);
                var num = noFloats ? Math.round(input) : input;
                // Set num to 0 if NaN
                if (isNaN(num)) {
                    return 0;
                }
                // Align number to steps
                if (num % step) {
                    num = Math.round(num / step) * step;
                }

                if (num > max) {
                    num = max;
                }
                else if (num < min) {
                    num = min;
                }
                if (num != Math.round(num)) {
                    num = num.toFixed(2);
                }

                return Number(num);
            };

            return {
                percentFromValue: percentFromValue,
                valueFromPercent: valueFromPercent,
                normalizeNumberToStepAndRange: normalizeNumberToStepAndRange
            };
        });
});