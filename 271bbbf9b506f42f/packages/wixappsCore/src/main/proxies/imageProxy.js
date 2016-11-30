define(["wixappsCore/core/typesConverter", "wixappsCore/proxies/mixins/baseImageProxy"], function (/** wixappsCore.typesConverter */typesConverter, baseImageProxy) {
    'use strict';


    /**
     * @class proxies.Image
     * @extends proxies.mixins.baseImageProxy
     */
    return {
        mixins: [baseImageProxy],

        getCompData: function () {
            return typesConverter.image(
                this.proxyData,
                this.props.viewProps.resolveImageData,
                this.props.viewProps.siteData.serviceTopology,
                this.props.viewProps.packageName,
                this.props.viewProps.siteData.getGlobalImageQuality()
            );
        }
    };
});
