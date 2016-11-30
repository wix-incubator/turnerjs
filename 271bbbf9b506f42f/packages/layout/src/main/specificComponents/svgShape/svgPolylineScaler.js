/**
 * Created by eitanr on 6/24/14.
 */
define(['lodash',
    'layout/specificComponents/svgShape/svgBasicScaler',
    'layout/specificComponents/svgShape/svgPolylineParser'], function (_, basic, parser) {
    'use strict';

    return {
        scale: function (polygonElement, scaleX, scaleY) {
            var parsedPolygonPoints = parser.getParsedPoints(polygonElement.getAttribute('points'));

            parsedPolygonPoints = _.map(parsedPolygonPoints, function (polygonPoint) {
                return _.map(polygonPoint, function (coord, index) {
                    return basic.scaleSingleValue(coord, index ? scaleY : scaleX);
                });
            });

            polygonElement.setAttribute('points', parser.stringifyPoints(parsedPolygonPoints));
        }
    };
});