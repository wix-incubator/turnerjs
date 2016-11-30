define(['layout/util/layout'], function (layout) {
    'use strict';
    function customMeasure(id, measureMap, nodesMap) {
        measureMap.custom[id] = {
            siteStructureBoundingClientRect: nodesMap.masterPage.getBoundingClientRect()
        };
    }

    function patchBackToTopButton(id, patchers, measureMap) {
        var bgId = id + 'bg';
        patchers.css(bgId, {right: measureMap.custom[id].siteStructureBoundingClientRect.left});
    }

    layout.registerRequestToMeasureChildren("wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton", [["bg"]]);
    layout.registerCustomMeasure("wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton", customMeasure);
    layout.registerSAFEPatcher("wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton", patchBackToTopButton);
});
