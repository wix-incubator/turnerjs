/**
 * Created by eitanr on 6/25/14.
 */
define(['layout/specificComponents/svgShape/svgBasicScaler'], function (basic) {
    'use strict';
    return {
        scale: function (ellipseElement, scaleX, scaleY) {
            var cxAttribute = ellipseElement.getAttribute('cx'),
                cyAttribute = ellipseElement.getAttribute('cy'),
                rxAttribute = ellipseElement.getAttribute('rx'),
                ryAttribute = ellipseElement.getAttribute('ry');

            if (cxAttribute && rxAttribute) {
                ellipseElement.setAttribute('cx', basic.scaleSingleValue(cxAttribute, scaleX));
                ellipseElement.setAttribute('rx', basic.scaleSingleValue(rxAttribute, scaleX));
            }

            if (cyAttribute && ryAttribute) {
                ellipseElement.setAttribute('cy', basic.scaleSingleValue(cyAttribute, scaleY));
                ellipseElement.setAttribute('ry', basic.scaleSingleValue(ryAttribute, scaleY));
            }
        }
    };
});