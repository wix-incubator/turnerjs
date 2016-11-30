/**
 * Created by eitanr on 6/25/14.
 */
define(['layout/specificComponents/svgShape/svgBasicScaler'], function (basic) {
    'use strict';
    return {
        scale: function (circleElement, scaleX, scaleY) {
            var cxAttribute = circleElement.getAttribute('cx'),
                cyAttribute = circleElement.getAttribute('cy'),
                rAttribute = circleElement.getAttribute('r'),
                actualScale = Math.min(scaleX, scaleY);

            if (cxAttribute && cyAttribute) {
                circleElement.setAttribute('cx', basic.scaleSingleValue(cxAttribute, actualScale));
                circleElement.setAttribute('cy', basic.scaleSingleValue(cyAttribute, actualScale));
                circleElement.setAttribute('r', basic.scaleSingleValue(rAttribute, actualScale));
            }
        }
    };
});