/**
 * Created by eitanr on 6/24/14.
 */
define(['lodash', 'layout/specificComponents/svgShape/svgScalerUtils'], function (_, utils) {
    'use strict';
    return {
        getParsedPoints: function (pointsAttribute) {
            var attr = utils.trim(pointsAttribute),
                points = attr.split(/[\s,]+/),
                pointsPairs = [],
                i;

            if (attr === '') {
                return [];
            }

            for (i = 0; i < points.length; i += 2) {
                pointsPairs.push([points[i], points[i + 1]]);
            }
            return pointsPairs;
        },
        stringifyPoints: function (parsedPoints) {
            var resultString = '';
            parsedPoints.forEach(function (pointsPairArr) {
                resultString += pointsPairArr.join(',') + ' ';
            });
            return utils.trim(resultString);
        }
    };
});