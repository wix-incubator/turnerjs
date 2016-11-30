define(["wixappsCore/core/typesConverter", "wixappsCore/proxies/mixins/baseImageProxy"], function (/** wixappsCore.typesConverter */typesConverter, baseImageProxy) {
    'use strict';

    /**
     * @class proxies.VideoThumb
     * @extends proxies.mixins.baseImageProxy
     */
    return {
        mixins: [baseImageProxy],

        getProxyCustomCssClass: function () {
            return this.props.viewProps.classSet({"videoIndicator": true});
        },

        getCompData: function () {
            return typesConverter.videoThumb(this.proxyData, this.props.viewProps.resolveImageData, this.props.viewProps.siteData.serviceTopology);
        }
    };
});
