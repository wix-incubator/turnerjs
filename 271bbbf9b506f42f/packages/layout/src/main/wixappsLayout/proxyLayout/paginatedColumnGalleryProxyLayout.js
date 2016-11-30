define(['zepto', 'lodash', 'layout/wixappsLayout/proxyLayoutRegistrar', 'layout/wixappsLayout/proxyLayout/util/masonryCalculations'], function ($, _, /** layout.proxyLayoutRegistrar */ proxyLayoutRegistrar, /** layout.masonryCalculations */ masonryCalculations) {
    "use strict";

    function getProxyProperties(proxyNode) {
        var columns = parseInt($(proxyNode).attr('data-columns'), 10);
        var direction = $(proxyNode).attr('data-direction');
        var horizontalGap = parseInt($(proxyNode).attr('data-horizontal-gap'), 10);
        var verticalGap = parseInt($(proxyNode).attr('data-vertical-gap'), 10);

        return {
            columns: columns,
            direction: direction,
            horizontalGap: horizontalGap,
            verticalGap: verticalGap
        };
    }

    function getGalleryChildrenHeights(proxyNode) {
        return _.map(proxyNode.childNodes, 'clientHeight');
    }

    function measurePaginatedColumnGalleryProxy(proxyNode) {
        var galleryChildrenHeights = getGalleryChildrenHeights(proxyNode);
        var properties = getProxyProperties(proxyNode);

        var proxyChildren = proxyNode.childNodes;
        var rowsAndColsData = masonryCalculations.getMasonryRowsAndColumns(galleryChildrenHeights, properties.columns);
        var columnWidth = Math.floor(proxyNode.clientWidth / properties.columns);

        var result = {
            domManipulations: [],
            needsRelayout: true //needs to do 2 cycles of layout
        };
        var manipulations = result.domManipulations;

        var newTops = [];

        _.forEach(proxyChildren, function (node, i) {
            var position = rowsAndColsData[i];
            var top = (position.row * properties.verticalGap) + position.topOffset;
            var sidePadding = masonryCalculations.getColumnSidePadding(position.col, properties.columns, properties.horizontalGap, properties.direction);
            var sideOffset = position.col * columnWidth;

            newTops.push(top);
            var cssParams = {
                position: "absolute",
                top: top + "px",
                'padding-right': sidePadding.right + "px",
                'padding-left': sidePadding.left + "px"
            };

            if (properties.direction === "rtl") {
                cssParams.right = sideOffset + "px";
            } else {
                cssParams.left = sideOffset + "px";
            }

            manipulations[i] = {
                node: node,
                funcName: "css",
                params: cssParams
            };
        });

        var height = _(proxyChildren)
            .map(function (node, i) {
                return newTops[i] + galleryChildrenHeights[i];
            })
            .max();

        //patch width and height of the proxyNode itself
        manipulations.push({
            node: proxyNode,
            funcName: "css",
            params: {
                height: height + "px"
            }
        });

        return result;
    }

    proxyLayoutRegistrar.registerCustomMeasure("PaginatedColumnGalleryProxy", measurePaginatedColumnGalleryProxy);
});
