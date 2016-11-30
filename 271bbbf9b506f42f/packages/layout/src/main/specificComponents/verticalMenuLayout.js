define(['zepto', 'lodash', 'layout/util/layout', 'utils', 'skins'], function ($, _, /** layout.layout */ layout, utils, skins) {
    "use strict";

    function getParamValues(node) {
        var dataSet = node.dataset;
        return {
            border: dataSet && dataSet.paramBorder ? parseInt(dataSet.paramBorder, 10) : 0,
            separator: dataSet && dataSet.paramSeparator ? parseInt(dataSet.paramSeparator, 10) : 0
        };
    }

    function patchLabel(node, hasOverflow, lineHeight) {
        var css = {
            'line-height': lineHeight + 'px'
        };

        if (hasOverflow) {
            css['text-overflow'] = 'ellipsis';
        }

        $(node).css(css);
    }

    /**
     *
     * @param id
     * @param patchers
     * @param measureMap
     * @param structureInfo
     * @param {core.SiteData} siteData
     */
    function patchVerticalMenu(id, patchers, measureMap, structureInfo, siteData) {
        patchers.css(id, {
            width: measureMap.width[id]
        });

        var siteMenu = utils.menuUtils.getSiteMenuWithoutRenderedLinks(siteData);
        var custom = measureMap.custom[id];
        var skinExports = skins.params.getSkinExports(structureInfo.styleItem.skin);
        var itemsCount = utils.verticalMenuCalculations.getVisibleItemsCount(siteMenu);
        var menuHeight = Math.max(measureMap.minHeight[id], structureInfo.layout.height);
        var itemHeight = utils.verticalMenuCalculations.getItemHeight(menuHeight, custom.params.separator, itemsCount, skinExports);
        var itemLineHeight = utils.verticalMenuCalculations.getLineHeight(itemHeight, custom.params.separator, custom.params.border, skinExports);

        _.forEach(custom.linksInfo, function (link) { //TODO: fix to use safe patchers if possible (remove dom nodes from measureMap)
            patchLabel(link.node, link.hasOverflow, itemLineHeight);
        });

        _.forEach(custom.liNodes, function (liNode) { //TODO: fix to use safe patchers if possible (remove dom nodes from measureMap)
            liNode.style.height = itemHeight + 'px';
        });
    }

    /**
     *
     * @param id
     * @param measureMap
     * @param nodesMap
     */
    function measureVerticalMenuCustom(id, measureMap, nodesMap) {
        var domNode = nodesMap[id];
        var verticalMenuNode = $(domNode);
        var allLabels = verticalMenuNode.find('a.level0');
        var widestLabelWidth = 0;
        var minHeight = 0;

        _.forEach(allLabels, function (labelNode) {
            if (labelNode.offsetWidth > widestLabelWidth) {
                widestLabelWidth = labelNode.offsetWidth;
            }
            minHeight += labelNode.offsetHeight;
        });

        measureMap.custom[id] = {
            linksInfo: _.map(verticalMenuNode.find('a'), function (aNode) {
                return {
                    node: aNode,
                    hasOverflow: aNode.offsetWidth > widestLabelWidth
                };
            }),
            liNodes: verticalMenuNode.find('li'),
            params: getParamValues(domNode)
        };

        var paramBorder = parseInt(domNode.getAttribute('data-param-border') || 0, 10);
        var paramPadding = parseInt(domNode.getAttribute('data-param-padding') || 0, 10);
        var totalWidth = widestLabelWidth + (paramPadding * 2) + (paramBorder * 2);

        if (totalWidth > measureMap.width[id]) {
            measureMap.width[id] = totalWidth;
        }

        measureMap.minHeight[id] = minHeight;
    }

    layout.registerCustomMeasure("wysiwyg.common.components.verticalmenu.viewer.VerticalMenu", measureVerticalMenuCustom);
    layout.registerSAFEPatcher("wysiwyg.common.components.verticalmenu.viewer.VerticalMenu", patchVerticalMenu);

    return {};
});
