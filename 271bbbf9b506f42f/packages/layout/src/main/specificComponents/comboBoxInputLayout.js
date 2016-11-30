define(["lodash", "zepto", "layout/util/layout"], function (_, $, /** layout.layout */layout) {
    'use strict';

    function measureComboBoxInput(id, measureMap, nodesMap) {

        var select = _.first($(nodesMap[id]).find('select'));
        measureMap.height[id] = select.offsetHeight;
        measureMap.width[id] = select.offsetWidth;
    }

    function patchComboBoxInput(id, patchers, measureMap) {
        var height = measureMap.height[id];
        var width = measureMap.width[id];
        patchers.css(id, {
            height: height,
            width: width
        });
    }

    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.inputs.ComboBoxInput', [['select']]);
    layout.registerCustomMeasure("wysiwyg.viewer.components.inputs.ComboBoxInput", measureComboBoxInput);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.inputs.ComboBoxInput", patchComboBoxInput);

});
