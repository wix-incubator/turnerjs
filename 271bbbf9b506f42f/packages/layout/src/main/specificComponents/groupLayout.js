define([
    'lodash',
    'layout/util/layout',
    'utils'
], function (_, /** layout.layout */ layout, utils) {
    'use strict';

    function measureGroup(id, measureMap, nodesMap, siteData, structureInfo) {
        //TODO - alissa - structureInfo.structure
        var children = utils.dataUtils.getChildrenData(structureInfo.structure, siteData.isMobileView());

        var childrenBorder = calcChildrenBoundingBorder(children, measureMap);
        measureMap.left[id] = structureInfo.layout.x;

        if (children.length > 0) {

            measureMap.width[id] = childrenBorder.right - childrenBorder.left;
            measureMap.height[id] = childrenBorder.bottom - childrenBorder.top;

            //this is useful only during editing
            measureMap.top[id] = structureInfo.layout.y + childrenBorder.top;
            measureMap.left[id] = structureInfo.layout.x + childrenBorder.left;

            //this is useful only during editing
            _.forEach(children, function (child) {
                measureMap.top[child.id] = child.layout.y - childrenBorder.top;
                measureMap.left[child.id] = child.layout.x - childrenBorder.left;
            });
        }
    }

    function calcChildrenBoundingBorder(children, measureMap) {
        var mostLeft, mostRight, mostTop, mostBottom;
        mostLeft = mostTop = Number.MAX_VALUE;
        mostRight = mostBottom = -Number.MAX_VALUE;

        _.forEach(children, function (child) {
            var childLayout = child.layout;
            var childLeft = measureMap.left && measureMap.left[child.id] ? measureMap.left[child.id] : childLayout.x;
            var childWidth = measureMap.width && measureMap.width[child.id] ? measureMap.width[child.id] : childLayout.width;
            var childTop = measureMap.top && measureMap.top[child.id] ? measureMap.top[child.id] : childLayout.y;
            var childHeight = measureMap.height && measureMap.height[child.id] ? measureMap.height[child.id] : childLayout.height;

            var childBoundingLayout = utils.boundingLayout.getBoundingLayout({
                x: childLeft,
                y: childTop,
                width: childWidth,
                height: childHeight,
                rotationInDegrees: childLayout.rotationInDegrees
            });

            mostLeft = Math.min(mostLeft, childBoundingLayout.x);
            mostRight = Math.max(mostRight, childBoundingLayout.x + childBoundingLayout.width);
            mostTop = Math.min(mostTop, childBoundingLayout.y);
            mostBottom = Math.max(mostBottom, childBoundingLayout.y + childBoundingLayout.height);
        });
        return {left: mostLeft, right: mostRight, top: mostTop, bottom: mostBottom};
    }

    function patchGroup(id, patchers, measureMap, structureInfo, siteData) {
        patchers.css(id, {
            width: measureMap.width[id],
            height: measureMap.height[id],
            top: measureMap.top[id],
            left: measureMap.left[id]
        });

        var children = utils.dataUtils.getChildrenData(structureInfo.structure, siteData.isMobileView());
        _.forEach(children, function(child){
           patchers.css(child.id, {
                top: measureMap.top[child.id],
                left: measureMap.left[child.id]
            });
        });
    }

    layout.registerMeasureChildrenFirst("wysiwyg.viewer.components.Group", true);
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.Group");
    layout.registerCustomMeasure("wysiwyg.viewer.components.Group", measureGroup);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.Group", patchGroup);
});
