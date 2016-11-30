define(['zepto', "layout/util/layout"], function ($, /** layout.layout */ layout) {
    'use strict';

    var MIN_HEIGHT = 17;

    function measureLoginButton(id, measureMap, nodesMap) {
        var labelId = id + "label";
        var labelNode = $(nodesMap[labelId]);
        measureMap.width[id] = Math.max(labelNode.offset().width, measureMap.width[id]);
        measureMap.height[id] = Math.max(MIN_HEIGHT, measureMap.height[id]);

        measureMap.minWidth[id] = labelNode.offset().width;
    }

    layout.registerCustomMeasure("wysiwyg.viewer.components.AdminLoginButton", measureLoginButton);
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.AdminLoginButton", [
        ["label"]
    ]);
});
