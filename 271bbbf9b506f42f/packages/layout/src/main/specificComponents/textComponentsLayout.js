define(["lodash", "layout/util/layout"], function (_, /** layout.layout */layout) {
    'use strict';

    function measureTextAreaInput(id, measureMap, nodesMap) {
        var textarea = nodesMap[id + 'textarea'];
        measureMap.height[id] = textarea.offsetHeight;
        measureMap.width[id] = textarea.offsetWidth;
    }

    function measureTextInput(id, measureMap, nodesMap) {
        var input = nodesMap[id + 'input'];
        measureMap.height[id] = input.offsetHeight;
        measureMap.width[id] = input.offsetWidth;
    }

    function patchTextComponent(id, patchers, measureMap) {
        patchers.css(id, {
            height: measureMap.height[id],
            width: measureMap.width[id]
        });
    }

    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.inputs.TextInput', [['input']]);
    layout.registerCustomMeasure("wysiwyg.viewer.components.inputs.TextInput", measureTextInput);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.inputs.TextInput", patchTextComponent);

    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.inputs.TextAreaInput', [['textarea']]);
    layout.registerCustomMeasure("wysiwyg.viewer.components.inputs.TextAreaInput", measureTextAreaInput);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.inputs.TextAreaInput", patchTextComponent);

});
