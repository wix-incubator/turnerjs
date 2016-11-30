define(['layout/util/layout', 'zepto'], function (layout, $) {
    'use strict';

    function customFacebookCommentMeasure(id, measureMap, nodesMap) {
        var iframe = $(nodesMap[id]).find('iframe')[0];
        if (iframe) {
            measureMap.height[id] = Math.max(measureMap.height[id], iframe.offsetHeight);
        }
    }

    layout.registerCustomMeasure("wysiwyg.viewer.components.WFacebookComment", customFacebookCommentMeasure);
});