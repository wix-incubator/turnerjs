define(['lodash', 'core', 'utils', 'buttonCommon'], function (_, core, utils, buttonCommon) {
    'use strict';

    var linkRenderer = utils.linkRenderer;

    function initLinkSkinPart(siteData, compProp, rootNavigationInfo){
        var linkData = {
            type: 'SwitchMobileViewMode',
            dataMobile: false
        };
        var linkSkinPart = linkRenderer.renderLink(linkData, siteData, rootNavigationInfo);
        linkSkinPart.style = {
            'textAlign': compProp.align
        };
        return linkSkinPart;
    }


   return {
        displayName: "ExitMobileModeButton",
        mixins: [core.compMixins.skinBasedComp, buttonCommon.buttonMixin],
        getSkinProperties: function () {
            var compData = this.props.compData;
            var compProp = this.props.compProp;
            var siteData = this.props.siteData;
            var rootNavigationInfo = this.props.rootNavigationInfo;
            var refData = {
                "link": initLinkSkinPart.call(this, siteData, compProp, rootNavigationInfo),
                "label": {
                    children: [compData.label],
                    style: this.getLabelStyle(this.props)
                }
            };
            this.resetMinHeightIfNeeded(refData);

            return refData;
        }
    };
});
