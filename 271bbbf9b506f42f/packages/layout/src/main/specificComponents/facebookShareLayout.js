define(['layout/util/layout'], function (layout) {
    'use strict';
    function facebookShareMeasure(id, measureMap, nodesMap) {
        var facebookNode = nodesMap[id].children[0];
        if (facebookNode) {
            measureMap.height[id] = Math.max(measureMap.height[id], facebookNode.offsetHeight);
            measureMap.width[id] = Math.max(measureMap.width[id], facebookNode.offsetWidth);
        }
    }

    layout.registerCustomMeasure("wysiwyg.viewer.components.FacebookShare", facebookShareMeasure);
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.FacebookShare");
});