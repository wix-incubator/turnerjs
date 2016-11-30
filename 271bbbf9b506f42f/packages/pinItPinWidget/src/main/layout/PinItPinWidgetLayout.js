define(['layout'], function (layout) {
    'use strict';

    layout.registerCustomMeasure('wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget', function(id, measureMap, nodesMap){
        measureMap.height[id] = nodesMap[id].offsetHeight;
        measureMap.width[id] = nodesMap[id].offsetWidth;
    });

    return {};
});
