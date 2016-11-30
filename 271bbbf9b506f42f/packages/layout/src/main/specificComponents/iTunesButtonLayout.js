define(['layout/util/layout'], function (layout) {
    'use strict';

    function customMeasure(id, measureMap) {
        measureMap.minWidth[id] = 110;
        measureMap.width[id] = Math.min(400, measureMap.width[id]);
        measureMap.height[id] = measureMap.width[id] * 40 / 110;
    }

    layout.registerCustomMeasure("wysiwyg.viewer.components.ItunesButton", customMeasure);
});