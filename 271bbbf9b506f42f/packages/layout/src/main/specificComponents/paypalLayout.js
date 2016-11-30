define(['layout/util/layout'], function (layout) {
    'use strict';

    layout.registerCustomMeasure('wysiwyg.viewer.components.PayPalButton', function (id, measureMap, nodesMap) {
        measureMap.height[id] = nodesMap[id + 'submitImage'].offsetHeight;
        measureMap.width[id] = nodesMap[id + 'submitImage'].offsetWidth;
    });

    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.PayPalButton', [['submitImage']]);

    return {};
});