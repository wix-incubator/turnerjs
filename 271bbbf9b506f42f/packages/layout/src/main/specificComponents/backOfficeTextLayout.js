define(['layout/util/layout'], function (layout) {
    'use strict';
    function customMeasure(id, measureMap, nodesMap) {
        var label = nodesMap[id].childNodes[0];
        if (label) {
            measureMap.height[id] = Math.max(measureMap.height[id], label.offsetHeight);
        }
    }

    layout.registerCustomMeasure("wysiwyg.common.components.backofficetext.viewer.BackOfficeText", customMeasure);
});