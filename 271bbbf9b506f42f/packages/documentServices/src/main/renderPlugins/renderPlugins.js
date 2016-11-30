define([
    'lodash',
    'utils'
],
function (
    _,
    utils
) {
    'use strict';

    function setRenderFlag(ps, flagName, value) {
        var renderFlagPointer = ps.pointers.general.getRenderFlag(flagName);
        ps.dal.set(renderFlagPointer, value);
    }

    /**
     * Set value to siteData.compsToHide
     * @param ps
     * @param compIds
     */
    function setCompsToHide(ps, compIds){
        var compsToHidePointer = ps.pointers.general.getRenderRealtimeConfigItem('compsToHide');
        ps.dal.set(compsToHidePointer, compIds);
    }

    /**
     * Set value to siteData.compToShowOnTop
     * @param ps
     * @param compIds
     */
    function setCompsToShowOnTop(ps, compIds){
        var compsToShowOnTopPointer = ps.pointers.general.getRenderRealtimeConfigItem('compsToShowOnTop');
        ps.dal.set(compsToShowOnTopPointer, compIds);
    }

    /**
     * Check value to siteData.compToShowOnTop
     * @param ps
     * @param compIds
     * @returns {Boolean} Is compId different from current siteData.compToShowOnTop
     */
    function checkCompsToShowOnTop(ps, compIds){
        var compsToShowOnTopPointer = ps.pointers.general.getRenderRealtimeConfigItem('compsToShowOnTop');
        return utils.objectUtils.isDifferent(compIds, ps.dal.get(compsToShowOnTopPointer));
    }

    /**
     * Set value to siteData.compToShowOnTop
     * @param ps
     * @param compIds
     */
    function setCompsToShowWithOpacity(ps, compIds, opacity){
        var compsToShowWithOpacity = ps.pointers.general.getRenderRealtimeConfigItem('compsToShowWithOpacity');
        ps.dal.set(compsToShowWithOpacity, {
            opacity: opacity,
            compIds: compIds
        });
    }

    /**
     * Set value to siteData.hideTextComponent
     * @param ps
     * @param compId
     */
    function setHideTextComponent(ps, compId) {
        var hideTextComponentPointer = ps.pointers.general.getRenderRealtimeConfigItem('hideTextComponent');
        ps.dal.set(hideTextComponentPointer, compId);
    }

    /**
     * Check value to siteData.hideTextComponent
     * @param ps
     * @param compId
     * @returns {Boolean} Is compId different from current siteData.hideTextComponent
     */
    function checkHideTextComponent(ps, compId) {
        var hideTextComponentPointer = ps.pointers.general.getRenderRealtimeConfigItem('hideTextComponent');
        return utils.objectUtils.isDifferent(compId, ps.dal.get(hideTextComponentPointer));
    }

    /**
     * Set value to siteData.renderFlags.allowSiteOverflow
     * @param privateApi
     * @param {bool} allow
     */
    function allowSiteOverflow(ps, allow) {
        setRenderFlag(ps, 'allowSiteOverflow', allow);
    }

    /**
     * Set value to siteData.renderFlags.extraSiteHeight
     * @param privateApi
     * @param {number} extraSiteHeight
     */
    function setExtraSiteHeight(ps, extraSiteHeight) {
        setRenderFlag(ps, 'extraSiteHeight', extraSiteHeight);
    }

    function setPreviewTooltipCallback(ps, callback){
        ps.siteAPI.setPreviewTooltipCallback(callback);
    }

    function setBlockingLayer(ps, style) {
        setRenderFlag(ps, 'blockingLayer', style);
    }

    function setBlockingPopupLayer(ps, style) {
        setRenderFlag(ps, 'blockingPopupLayer', style);
    }

    var renderPlugins = {
        setCompsToShowWithOpacity: setCompsToShowWithOpacity,
        setCompsToShowOnTop: setCompsToShowOnTop,
        checkCompsToShowOnTop: checkCompsToShowOnTop,
        setCompsToHide: setCompsToHide,
        setHideTextComponent: setHideTextComponent,
        checkHideTextComponent: checkHideTextComponent,
        allowSiteOverflow: allowSiteOverflow,
        setExtraSiteHeight: setExtraSiteHeight,
        setPreviewTooltipCallback: setPreviewTooltipCallback,
        setBlockingLayer: setBlockingLayer,
        setBlockingPopupLayer: setBlockingPopupLayer
    };

    return renderPlugins;
});
