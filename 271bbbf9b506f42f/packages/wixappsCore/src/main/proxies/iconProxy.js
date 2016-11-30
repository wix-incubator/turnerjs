define(["siteUtils", "wixappsCore/core/typesConverter", "wixappsCore/proxies/mixins/baseProxy"], function (siteUtils, /** wixappsCore.typesConverter */typesConverter, baseProxy) {
    'use strict';

    /**
     * @class proxies.Icon
     * @extends proxies.mixins.baseProxy
     */
    return {
        mixins: [baseProxy],
        renderProxy: function () {
            var data = this.proxyData;
            var componentType = 'wixapps.integration.components.Icon';
            var props = this.getChildCompProps(componentType);
            props.compData = typesConverter.icon(data, this.props.viewProps.resolveImageData, this.props.viewProps.siteData.serviceTopology, this.props.viewProps.packageName);

            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
