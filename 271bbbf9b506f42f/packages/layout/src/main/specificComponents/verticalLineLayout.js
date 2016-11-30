define(["layout/util/layout"], function (layout) {
    "use strict";

    var MAX_HEIGHT = 2000;
    layout.registerCustomMeasure('wysiwyg.viewer.components.VerticalLine', function (id, measureMap) {
        measureMap.height[id] = Math.min(measureMap.height[id], MAX_HEIGHT);
    });
});
