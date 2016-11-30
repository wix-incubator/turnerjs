define(['layout/util/layout', 'zepto'], function(/** layout.layout */ layout, $){
    "use strict";

    layout.registerRequestToMeasureDom('wysiwyg.viewer.components.MediaRichText');

    layout.registerCustomMeasure('wysiwyg.viewer.components.MediaRichText', function(id, measureMap, nodesMap){
        var node = $(nodesMap[id]);
        measureMap.custom[id] = {
            prevWidth: node.data('width')
        };
    });

    layout.registerSAFEPatcher('wysiwyg.viewer.components.MediaRichText', function(id, patchers, measureMap){
        var prevWidth = measureMap.custom[id].prevWidth;
        var currentWidth = parseInt(measureMap.width[id], 10);
        if (!prevWidth || parseInt(prevWidth, 10) !== currentWidth){
            patchers.data(id, {'width': currentWidth});
            return true;
        }
        patchers.css(id, {
            height: ''
        });
        return false;
    });
});
