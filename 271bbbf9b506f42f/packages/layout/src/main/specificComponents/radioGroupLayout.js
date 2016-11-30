define(["lodash", "layout/util/layout"], function (_, /** layout.layout */layout) {
    'use strict';



    function measureRadioGroup(id, measureMap, nodesMap) {
        measureMap.height[id] = nodesMap[id + 'items'].offsetHeight;
    }

    function patchRadioGroup(id, patchers, measureMap) {
        patchers.css(id, {
            height: measureMap.height[id]
        });
    }

    function getRadioButtons(siteData, compId, nodesMap, structureInfo) {
        return _.map(structureInfo.dataItem.options, function (item, ind) {
            return {type: 'wysiwyg.viewer.components.inputs.RadioButton', pathArray: ['radio' + ind]};
        }).concat([['items']]);
    }

    layout.registerRequestToMeasureChildren('wysiwyg.viewer.components.inputs.RadioGroup', getRadioButtons);
    layout.registerCustomMeasure("wysiwyg.viewer.components.inputs.RadioGroup", measureRadioGroup);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.inputs.RadioGroup", patchRadioGroup);

});
