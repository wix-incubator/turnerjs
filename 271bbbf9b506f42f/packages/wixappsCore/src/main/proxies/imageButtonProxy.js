define(["siteUtils", "wixappsCore/core/typesConverter", "wixappsCore/proxies/mixins/baseProxy"], function (siteUtils, /** wixappsCore.typesConverter */typesConverter, baseProxy) {
    'use strict';

    /**
     * @class proxies.ImageButton
     * @extends proxies.mixins.baseProxy
     */
    return {
        mixins: [baseProxy],
        renderProxy: function () {
            var data = this.proxyData;
            var componentType = "wixapps.integration.components.ImageButton";
            var props = this.getChildCompProps(componentType);
            props.compData = typesConverter.icon(data, this.props.viewProps.resolveImageData, this.props.viewProps.siteData.serviceTopology, this.props.viewProps.packageName);

            props.compProp = {
                isSprite: this.getCompProp('isSprite'),
                spriteDirection: this.getCompProp('spriteDirection'),
                startPositionX: this.getCompProp('startPositionX'),
                startPositionY: this.getCompProp('startPositionY')
            };

            //tooltip is being used only in the editor. Moving on to other features. Jira task CLNT-735
            //props.onMouseOver = function showToolTip(){};
            //props.onMouseOut = function hideToolTip(){};

            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
