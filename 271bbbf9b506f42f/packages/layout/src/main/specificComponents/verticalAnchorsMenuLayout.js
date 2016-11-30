define(['zepto', 'lodash', 'layout/util/layout'], function ($, _, layout) {
    'use strict';

    function measureVerticalAnchorsMenu(id, measureMap, nodesMap) {
        var $node = $(nodesMap[id]);
        var $anchorLinks = $node.find('[class*=link]');
        var $labels = $node.find('[class*=label]');
        var $symbols = $node.find('[class*=symbol]');
        var itemsLen = $anchorLinks.length;
        var symbolWidth = $symbols.width();
        var minHeight = Math.ceil($anchorLinks.height() * itemsLen);

        var labelMaxWidth = 0;
        _.forEach($labels, function(label) {
            labelMaxWidth = Math.max(labelMaxWidth, $(label).width());
        });
        var minWidth = labelMaxWidth + symbolWidth;

        measureMap.width[id] = Math.max(measureMap.width[id], minWidth);
        measureMap.height[id] = Math.max(measureMap.height[id], minHeight);

        measureMap.custom[id] = {
            minHeight: minHeight,
            minWidth: minWidth
        };
    }

    function patchVerticalAnchorsMenu(id, patchers, measureMap) {
        patchers.css(id, {
            width: measureMap.width[id],
            height: measureMap.height[id]
        });
    }

    layout.registerCustomMeasure('wysiwyg.common.components.verticalanchorsmenu.viewer.VerticalAnchorsMenu', measureVerticalAnchorsMenu);
    layout.registerSAFEPatcher('wysiwyg.common.components.verticalanchorsmenu.viewer.VerticalAnchorsMenu', patchVerticalAnchorsMenu);
});
