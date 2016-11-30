define(['zepto', 'lodash', 'layout/util/layout'], function ($, _, layout) {
    'use strict';

    function getVerticalPadding(node){
        var computedStyles = window.getComputedStyle(node);

        return parseInt(computedStyles.paddingTop, 10) + parseInt(computedStyles.paddingBottom, 10);
    }

    function getHorizontalMargin(node){
        var computedStyles = window.getComputedStyle(node);
        return parseInt(computedStyles.marginRight, 10) + parseInt(computedStyles.marginLeft, 10);
    }

    function measureButton(id, measureMap, nodesMap) {
        var labelId = id + "label";

        var $node = $(nodesMap[id]);
        var nodeText = $node.text();
        var shouldUseFlex = $node.data('should-use-flex');

        var compMinHeight = window.getComputedStyle(nodesMap[id]).minHeight;
        if (!compMinHeight || !parseInt(compMinHeight, 10)){
            compMinHeight = measureMap.height[labelId];
        }
        measureMap.minHeight[id] = parseInt(compMinHeight, 10);
        if (shouldUseFlex) {
            measureMap.minWidth[id] = measureMap.width[labelId];
        } else {
            measureMap.minWidth[id] = measureMap.width[labelId] + getHorizontalMargin(nodesMap[labelId]);
        }

        var shouldPreventWidthMeasurement = $node.data('shouldPreventWidthMeasurement');
        if (!shouldPreventWidthMeasurement) {
            measureMap.width[id] = didTextContentChange() && hasMinWidthBeenReduced() && wasPrevWidthMinWidth() && measureMap.width[labelId] > 0 ?
                measureMap.minWidth[id] : Math.max(measureMap.width[id], measureMap.minWidth[id]);
        }

        measureMap.height[id] = Math.max(measureMap.height[id], measureMap.minHeight[id]);

        measureMap.custom[id] = {
            align: $node.attr('data-align'),
            margin: parseInt($node.attr('data-margin'), 10),
            shouldPreventWidthMeasurement: shouldPreventWidthMeasurement,
            shouldUseFlex: shouldUseFlex,
            text: nodeText
        };

        measureMap.custom[labelId] = {
            verticalPadding: getVerticalPadding(nodesMap[labelId])
        };

        // if the label and its margin are wider then the component, reduce the margin so they'll fit in the component
        var doesLabelAndMarginOverflow = measureMap.width[labelId] + measureMap.custom[id].margin > measureMap.width[id];
        var textAlignment = measureMap.custom[id].align;

        if (textAlignment !== 'center') {
            // set the margin according to the alignment
            if (shouldUseFlex) {
                measureMap.custom[labelId].margin =
                    doesLabelAndMarginOverflow ? measureMap.width[id] - measureMap.width[labelId] : measureMap.custom[id].margin;
            } else {
                measureMap.custom[labelId]['margin-' + textAlignment] =
                    doesLabelAndMarginOverflow ? measureMap.width[id] - measureMap.width[labelId] : measureMap.custom[id].margin;
            }
        }

        function didTextContentChange() {
            return nodeText !== '' + $node.data('prevText');
        }

        function hasMinWidthBeenReduced() {
            return measureMap.minWidth[id] < $node.data('prevMinWidth');
        }

        function wasPrevWidthMinWidth() {
            return $node.data('prevWidth') === $node.data('prevMinWidth');
        }
    }

    function getLabelNodeCss(id, labelId, measureMap) {
        var labelCss;

        if (measureMap.custom[id].shouldUseFlex) {
            labelCss = {};
            var alignment = measureMap.custom[id].align;
            if (alignment !== 'center' && measureMap.custom[labelId].margin) {
                labelCss['margin-' + alignment] = measureMap.custom[labelId].margin;
            }

            return labelCss;
        }

        labelCss = {
            'line-height' : measureMap.height[id] - measureMap.custom[labelId].verticalPadding + 'px'
        };

        return _.reduce(['margin-left', 'margin-right'], function (labelNodeCss, margin) {
            if (!_.isUndefined(measureMap.custom[labelId][margin])){
                labelNodeCss[margin] = measureMap.custom[labelId][margin];
            }
            return labelNodeCss;
        }, labelCss);
    }

    function patchSiteButton(id, patchers, measureMap) {
        var style = {
            height: measureMap.height[id],
            'min-height': measureMap.minHeight[id]
        };
        if (!measureMap.custom[id].shouldPreventWidthMeasurement) {
            style.width = measureMap.width[id];
        }
        patchers.css(id, style);

        var labelId = id + "label";
        var labelCss = getLabelNodeCss(id, labelId, measureMap);
        patchers.css(labelId, labelCss);

        patchers.data(id, {
            prevText: measureMap.custom[id].text,
            prevMinWidth: measureMap.minWidth[id],
            prevWidth: measureMap.width[id]
        });
    }

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.SiteButton", [
        ["label"]
    ]);

    layout.registerCustomMeasure("wysiwyg.viewer.components.SiteButton", measureButton);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.SiteButton", patchSiteButton);
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.PopupCloseTextButton", [["label"]]);
    layout.registerCustomMeasure("wysiwyg.viewer.components.PopupCloseTextButton", measureButton);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.PopupCloseTextButton", patchSiteButton);

});
