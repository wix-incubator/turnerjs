define(['lodash', "siteUtils", "wixappsCore/proxies/mixins/boxProxy", "wixappsCore/core/layoutBasedHelper"], function (_, siteUtils, boxProxy, layoutHelper) {
    'use strict';

    // Inherit flex style
    var flexStyle = {display: 'inherit', 'flex-direction': 'inherit'};

    /**
     * @class proxies.Area
     * @extends proxies.mixins.baseProxy
     */
    return {
        mixins: [boxProxy],
        getChildrenOrientation: function () {
            return this.getCompProp("orientation") || "vertical";
        },

        getComponentName: function () {
            return "wixapps.integration.components.Area";
        },

        getReactClass: function () {
            return siteUtils.compFactory.getCompClass(this.getComponentName());
        },

        transformSkinProperties: function (refData) {
            var proxyStyleDef = this.getStyleDef();
            if (layoutHelper.isLayoutBasedHeight(proxyStyleDef, this.props.orientation)) {
                refData.bg = refData.bg || {};
                refData.bg.style = _.merge({}, refData.bg.style, {height: '100%'});
            }
            refData.inlineContent.style = _.merge({}, refData.inlineContent.style, flexStyle, {position: 'relative', width: '100%'});

            return refData;
        }
    };
});
