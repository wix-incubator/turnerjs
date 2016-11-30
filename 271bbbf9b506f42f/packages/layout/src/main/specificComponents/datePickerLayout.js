define(['zepto', 'layout/util/layout'], function ($, layout) {
    'use strict';

    function measureDatePicker(id, measureMap, nodesMap) {
        var icon = nodesMap[id + 'icon'];
        var input = nodesMap[id + 'input'];
        var inputWrapper = nodesMap[id + 'inputWrapper'];

        var iconWidthWithPadding = 56;
        var iconHeightWithPadding = icon.height.baseVal.value + 16;
        var inputTextLineHeight = parseInt($(input).css('line-height'), 10) || 0;
        var borderWidth = parseInt($(inputWrapper).css('border-width'), 10) || 0;
        var totalBorderSize = borderWidth * 2;

        measureMap.height[id] = Math.max(inputWrapper.offsetHeight, iconHeightWithPadding);
        measureMap.width[id] = Math.max(inputWrapper.offsetWidth, iconWidthWithPadding);
        measureMap.minHeight[id] = Math.max(inputTextLineHeight, iconHeightWithPadding) + totalBorderSize;
        measureMap.minWidth[id] = iconWidthWithPadding + totalBorderSize;
    }

    function patchDatePickerComponent(id, patchers, measureMap) {
        patchers.css(id, {
            height: measureMap.height[id],
            width: measureMap.width[id]
        });
    }

    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.inputs.DatePicker', [['icon'], ['inputWrapper'], ['input']]);
    layout.registerCustomMeasure("wysiwyg.viewer.components.inputs.DatePicker", measureDatePicker);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.inputs.DatePicker", patchDatePickerComponent);
});
