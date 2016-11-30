/**
 * Created by eitanr on 6/24/14.
 */
define(['layout/specificComponents/svgShape/svgScalerUtils'], function (utils) {
    'use strict';

    var scaleSingleValue = function (value, scale) {
            return utils.round(parseFloat(value) * scale);
        },
        scalePairString = function (pairString, scaleX, scaleY) {
            var commandValues = pairString.split(/[\s,]+/);
            return scaleSingleValue(commandValues[0], scaleX) + ' ' + scaleSingleValue(commandValues[1], scaleY);
        },
        scaleMultiplePairStrings = function (multiplePairStrings, scaleX, scaleY) {
            if (multiplePairStrings === '') {
                return '';
            }
            var commandValues = multiplePairStrings.split(',').map(function (val) {
                return scalePairString(utils.trim(val), scaleX, scaleY);
            });
            return commandValues.join(',');
        },
        scaleMultipleSingleStrings = function (multiplePairStrings, scale) {
            if (multiplePairStrings === '') {
                return '';
            }
            var commandValues = multiplePairStrings.split(/[\s,]+/).map(function (val) {
                return scaleSingleValue(utils.trim(val), scale);
            });
            return commandValues.join(',');
        };

    return {
        scaleSingleValue: scaleSingleValue,
        scalePairString: scalePairString,
        scaleMultiplePairStrings: scaleMultiplePairStrings,
        scaleMultipleSingleStrings: scaleMultipleSingleStrings
    };

});
