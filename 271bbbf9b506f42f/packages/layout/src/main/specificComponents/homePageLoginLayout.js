define(['zepto', "layout/util/layout"], function ($, /** layout.layout */ layout) {
    'use strict';

    function measureLoginButton(id, measureMap, nodesMap) {
        var memberNode = $(nodesMap[id + "memberTitle"]);
        var actionNode = $(nodesMap[id + "actionTitle"]);

        measureMap.width[id] = Math.max(memberNode.offset().width, actionNode.offset().width, measureMap.width[id]);
        measureMap.height[id] = Math.max(memberNode.offset().height + actionNode.offset().height, measureMap.height[id]);
    }

    layout.registerCustomMeasure("wysiwyg.viewer.components.wixhomepage.HomePageLogin", measureLoginButton);
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.wixhomepage.HomePageLogin", [["memberTitle"], ["actionTitle"]]);
});
