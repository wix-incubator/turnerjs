define(['layout/util/layout'], function (layout) {
    'use strict';
    function customContactFormMeasure(id, measureMap, nodesMap) {
        var comp = nodesMap[id];
        if (comp) {
            measureMap.height[id] = comp.offsetHeight;
            measureMap.width[id] = comp.offsetWidth;
        }
    }

    layout.registerCustomMeasure("wysiwyg.viewer.components.VKShareButton", customContactFormMeasure);
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.VKShareButton");

});