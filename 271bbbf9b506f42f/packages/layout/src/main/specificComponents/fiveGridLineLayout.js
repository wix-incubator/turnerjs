define(["layout/util/layout", 'layout/util/rootLayoutUtils'], function (layout, rootLayoutUtils) {
    "use strict";

    /**
     *
     * @param id
     * @param patchers
     * @param measureMap
     * @param {layout.structureInfo} structureInfo
     * @param siteData
     */
    var patcher = function(id, patchers, measureMap, structureInfo, siteData){
        var screenWidth = measureMap.width.screen,
            siteWidth = rootLayoutUtils.getRootWidth(siteData, measureMap, structureInfo.rootId),
            offsetLeft = 0,
            width = siteWidth,
            compProps = structureInfo.propertiesItem;
        
        if (compProps && compProps.fullScreenModeOn){
            if (screenWidth > siteWidth){
                offsetLeft = -(screenWidth - siteWidth) / 2;
                width = screenWidth;
            }

            patchers.css(id, {
                width: width + 'px',
                left: offsetLeft + 'px'
            });

            //TODO: Remove this.. should not measure during patch!
            measureMap.width[id] = width;
            measureMap.left[id] = offsetLeft;
        }
    };
    
    layout.registerSAFEPatcher('wysiwyg.viewer.components.FiveGridLine', patcher);
    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.FiveGridLine', [['line']]);
    layout.registerRequestToMeasureDom('wysiwyg.viewer.components.FiveGridLine');

    layout.registerCustomMeasure('wysiwyg.viewer.components.FiveGridLine', function(id, measureMap, nodesMap){
        var minHeight = measureMap.height[id + 'line'];
        var computedStyle = window.getComputedStyle(nodesMap[id]);
        var borderBottom = parseFloat(computedStyle.borderBottomWidth);
        measureMap.height[id] = Math.max(5, borderBottom, minHeight);
        measureMap.minHeight[id] = minHeight;
    });
});
