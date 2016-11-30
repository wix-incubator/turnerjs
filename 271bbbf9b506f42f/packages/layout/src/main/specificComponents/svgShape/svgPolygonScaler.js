/**
 * Created by eitanr on 6/24/14.
 */
define(['lodash',
    'layout/specificComponents/svgShape/svgBasicScaler',
    'layout/specificComponents/svgShape/svgPolygonParser'], function (_, basic, parser) {
    'use strict';
    return {
        scale: function (polygonElement, scaleX, scaleY) {
            var parsedPolygonPoints = parser.getParsedPoints(polygonElement.getAttribute('points'));

            _.forEach(parsedPolygonPoints, function (polygonPoint) {
                polygonPoint[0] = basic.scaleSingleValue(polygonPoint[0], scaleX);
                polygonPoint[1] = basic.scaleSingleValue(polygonPoint[1], scaleY);
            });

            polygonElement.setAttribute('points', parser.stringifyPoints(parsedPolygonPoints));
        }
    };
});