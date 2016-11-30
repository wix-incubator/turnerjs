/**
 * Created by eitanr on 6/24/14.
 */
define(['lodash', 'layout/specificComponents/svgShape/svgScalerUtils'], function (_, utils) {
    'use strict';
    return {
        getParsedPath: function (dAttribute) {
            var pathString = utils.trim(dAttribute);

            if (pathString === '') {
                return [];
            }

            var pathSegments = pathString.match(/[a-z][^a-z]*/ig),
                parsedPath = pathSegments.map(function (segment) {
                    segment = segment.replace(/-/g, ' -').replace(/,/g, ' ').replace(/(-?\d*[\.\-]\d+)/g, function (full, match){
                        return ' ' + match;
                    });
                    while (_.includes(segment, '  ')) {
                        segment = segment.replace(/ {2}/g, ' ');
                    }
                    return [segment.substring(0, 1), utils.trim(segment.substring(1))];
                });

            return parsedPath.map(function (segment) {
                var spaceSeparated,
                    joined = [];

                if (!_.includes('QSCL', segment[0].toUpperCase()) || segment[1].split(',').length !== 1) {
                    return segment;
                }

                spaceSeparated = segment[1].split(' ');
                if (spaceSeparated.length % 2 !== 0) {
                    //incorrect command instructions. skip parsing
                    return segment;
                }
                spaceSeparated.forEach(function (coord, index, coords) { //eslint-disable-line wix-editor/prefer-filter
                    if (index % 2 === 0) {
                        joined.push(coord + ' ' + coords[index + 1]);
                    }
                });
                return [segment[0], joined.join(',')];
            });
        },
        stringifyParsedPath: function (parsedPath) {
            var resultString = '';
            parsedPath.forEach(function (valueArr) {
                valueArr.forEach(function (value) {
                    resultString += value;
                });
            });
            return resultString;
        }
    };
});
