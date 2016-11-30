define(["lodash", "layout/util/layout", 'zepto'], function (_, /** layout.layout */layout, $) {
    'use strict';

    function measureRadioButton(id, measureMap, nodesMap/*, siteData, structureInfo*/) {
        var radioDomId = nodesMap[id].id;
        var span = $('#' + radioDomId + 'circle-shadow')[0];
        var text = $('#' + radioDomId + 'text')[0];
        measureMap.height[id] = Math.max(span.offsetHeight, text.scrollHeight);
        measureMap.width[id] = span.offsetWidth + text.offsetWidth;
    }

    function patchRadioButton(id, patchers, measureMap) {
        patchers.css(id, {
            height: measureMap.height[id],
            width: measureMap.width[id]
        });
    }

    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.inputs.RadioButton', [['circle-shadow'], ['text']]);
    layout.registerCustomMeasure("wysiwyg.viewer.components.inputs.RadioButton", measureRadioButton);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.inputs.RadioButton", patchRadioButton);

});
