define(['layout/util/layout'], function(/** layout.layout */ layout){
    "use strict";

    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.wixhomepage.WixHomepageMenu', [['buttonsContainer']]);

    layout.registerCustomMeasure('wysiwyg.viewer.components.wixhomepage.WixHomepageMenu', function(id, measureMap){
        var minHeight = measureMap.height[id + 'buttonsContainer'];

        measureMap.height[id] = Math.max(measureMap.height[id], minHeight);
        measureMap.minHeight[id] = minHeight;
    });
});