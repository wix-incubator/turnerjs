define([
    'lodash',
    'documentServices/renderPlugins/renderPlugins',
    'documentServices/utils/utils'
], function (
    _,
    renderPlugins,
    dsUtils
) {
    "use strict";

    var plugins = {
        allowSiteOverflow: {dataManipulation: renderPlugins.allowSiteOverflow},
        setCompsToHide: {dataManipulation: renderPlugins.setCompsToHide},
        setCompsToShowOnTop: {dataManipulation: renderPlugins.setCompsToShowOnTop, shouldExecOp: renderPlugins.checkCompsToShowOnTop, isUpdatingAnchors: dsUtils.DONT_CARE, singleComp: true},
        setCompsToShowWithOpacity: {dataManipulation: renderPlugins.setCompsToShowWithOpacity},
        setHideTextComponent: {dataManipulation: renderPlugins.setHideTextComponent, shouldExecOp: renderPlugins.checkHideTextComponent},
        setExtraSiteHeight: {dataManipulation: renderPlugins.setExtraSiteHeight},
        setPreviewTooltipCallback: {dataManipulation: renderPlugins.setPreviewTooltipCallback},
        setBlockingLayer: {dataManipulation: renderPlugins.setBlockingLayer},
        setBlockingPopupLayer: {dataManipulation: renderPlugins.setBlockingPopupLayer}
    };

    return {
        methods: {
            renderPlugins: plugins
        }
    };
});
