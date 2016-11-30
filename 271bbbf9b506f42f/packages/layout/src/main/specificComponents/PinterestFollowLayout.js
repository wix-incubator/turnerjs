define(['layout/util/layout'], function (layout) {
    'use strict';

    layout.registerCustomMeasure('wysiwyg.viewer.components.PinterestFollow', function (id, measureMap, nodesMap) {
        measureMap.height[id] = nodesMap[id + 'followButtonTag'].offsetHeight;
        measureMap.width[id] = nodesMap[id + 'followButtonTag'].offsetWidth;
    });

    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.PinterestFollow', [['followButtonTag']]);
    return {};
});