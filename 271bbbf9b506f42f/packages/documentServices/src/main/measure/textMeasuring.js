define(['lodash', 'layout'], function (_, layout) {
    'use strict';

    function getOverallBorders(el) {
        var dimensions = el.getBoundingClientRect();
        var children = _.toArray(el.children);
        var initialLeft = dimensions.left;
        var initialTop = dimensions.top;
        dimensions = {
            left: dimensions.right,
            right: dimensions.left,
            top: dimensions.bottom,
            bottom: dimensions.top
        };
        dimensions = getDimensions(children, dimensions);
        return {
            dx: Math.floor(dimensions.left) - initialLeft,
            dy: Math.floor(dimensions.top) - initialTop,
            width: Math.ceil(dimensions.right - dimensions.left),
            height: Math.ceil(dimensions.bottom - dimensions.top)
        };
    }

    function getDimensions(nodes, dims) {
        dims = dims || {
            left: -Number.MAX_VALUE,
            right: Number.MAX_VALUE,
            top: -Number.MAX_VALUE,
            bottom: Number.MAX_VALUE
        };
        var range = window.document.createRange();
        dims = _.reduce(nodes, function (dimensions, node) {
            var rect;
            var textContent = getTextContent(node);
            if (textContent) {
                range.selectNodeContents(node);
                rect = range.getBoundingClientRect();
                if (rect.width && rect.height) {
                    dimensions.left = Math.min(dimensions.left, rect.left);
                    dimensions.top = Math.min(dimensions.top, rect.top);
                    dimensions.right = Math.max(dimensions.right, rect.right);
                    dimensions.bottom = Math.max(dimensions.bottom, rect.bottom);
                }
            } else {
                dimensions = getDimensions(node.children, dimensions);
            }
            return dimensions;
        }, dims);
        return dims;
    }
    function hasText(node) {
        return node.textContent.trim();
    }
    function getTextContent(node) {
        var i;
        var child;
        var childNodes = node.childNodes;
        var textContent = '';
        for (i = 0; i < childNodes.length; i++) {
            child = childNodes[i];
            if (child.nodeType === 3) {
                textContent += child.textContent.trim();
            }
        }
        return textContent;
    }

    function measureTextRuntimeBorders(ps, id, measureMap, nodesMap) {
        if (ps.siteAPI.isMobileView()) {
            return;
        }
        var el = nodesMap[id];
        var overallBordersPointer = ps.pointers.general.getTextRuntimeOverallBorders();
        if (hasText(el)) {
            ps.dal.set(ps.pointers.getInnerPointer(overallBordersPointer, id), getOverallBorders(el));
        }
    }

    return {
        initialize: function (ps) {
            layout.registerAdditionalMeasureFunction('wysiwyg.viewer.components.WRichText', _.partial(measureTextRuntimeBorders, ps));
        }
    };
});
