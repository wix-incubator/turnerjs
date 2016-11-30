define(['zepto'], function ($) {
    'use strict';

    return {
        measureTPA: function (id, measureMap, nodesMap, sideData, comp){
            var $compNode = $(nodesMap[id]);

            measureMap.custom[id] = {
                hasIframe: Boolean(nodesMap[id + 'iframe'])
            };

            var minHeight = parseInt($compNode.css('min-height'), 10);
            var minWidth = parseInt($compNode.css('min-width'), 10);
            var ignoreAnchors = $compNode.attr('data-ignore-anchors');

            if (minHeight && ignoreAnchors !== 'true') {
                measureMap.minHeight[id] = minHeight;
                measureMap.height[id] = minHeight;
            }

            if (minHeight && ignoreAnchors === 'true') {
                measureMap.minHeight[id] = comp.structure.layout.height;
                measureMap.height[id] = comp.structure.layout.height;
            }

            if (minWidth) {
                measureMap.minWidth[id] = minWidth;
                measureMap.width[id] = minWidth;
            }
        }
    };
});
