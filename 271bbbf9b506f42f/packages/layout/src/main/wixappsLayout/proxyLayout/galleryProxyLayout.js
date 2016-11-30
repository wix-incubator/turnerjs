define(['zepto', 'lodash', 'layout/wixappsLayout/proxyLayoutRegistrar'], function ($, _, /** layout.proxyLayoutRegistrar */ proxyLayoutRegistrar) {
    "use strict";

    function measure(compNode, siteData, measureMap) {
        var itemsContainerId = compNode.id + 'itemsContainer';
        var comp = $('#' + itemsContainerId);

        var $compNode = $(compNode);

        var columns = Number($compNode.attr("data-total-columns"));
        var rows = Number($compNode.attr("data-total-rows"));
        var gap = Number($compNode.attr("data-gap"));

        var domManipulations = [];

        var children = comp.children();

        if (children.length) {
            var child = children[0];
            var width = child.offsetWidth;
            var height = child.offsetHeight;

            domManipulations = _.map(children, function (childNode) {
                var index = parseInt($(childNode).attr("data-index"), 10);

                var row = Math.floor(index / columns) % rows;
                var topGap = row * gap;

                var col = index % columns;
                var leftGap = col * gap;

                return {
                    node: childNode,
                    funcName: "css",
                    params: {
                        top: (row * height) + topGap,
                        left: (col * width) + leftGap
                    }
                };
            });
        }

        measureMap.height[itemsContainerId] = compNode.offsetHeight;
        measureMap.width[itemsContainerId] = compNode.offsetWidth;

        measureMap.height[compNode.id] = compNode.offsetHeight;
        measureMap.width[compNode.id] = compNode.offsetWidth;

        return {
            domManipulations: domManipulations
        };
    }

    proxyLayoutRegistrar.registerCustomMeasure("GalleryProxy", measure);
});
