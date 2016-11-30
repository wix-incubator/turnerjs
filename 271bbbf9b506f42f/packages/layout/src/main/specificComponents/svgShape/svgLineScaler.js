/**
 * Created by eitanr on 6/25/14.
 */
define(['layout/specificComponents/svgShape/svgBasicScaler'], function (basic) {
    'use strict';
    return {
        scale: function (lineElement, scaleX, scaleY) {
            var x1Attribute = lineElement.getAttribute('x1'),
                y1Attribute = lineElement.getAttribute('y1'),
                x2Attribute = lineElement.getAttribute('x2'),
                y2Attribute = lineElement.getAttribute('y2');

            if (x1Attribute && y1Attribute && x2Attribute && y2Attribute) {
                lineElement.setAttribute('x1', basic.scaleSingleValue(x1Attribute, scaleX));
                lineElement.setAttribute('x2', basic.scaleSingleValue(x2Attribute, scaleX));


                lineElement.setAttribute('y1', basic.scaleSingleValue(y1Attribute, scaleY));
                lineElement.setAttribute('y2', basic.scaleSingleValue(y2Attribute, scaleY));
            }
        }
    };
});