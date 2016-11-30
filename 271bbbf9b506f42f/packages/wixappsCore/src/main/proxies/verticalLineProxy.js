define(["siteUtils", "wixappsCore/proxies/mixins/baseProxy"], function (siteUtils, baseProxy) {
    'use strict';

    /**
     * @class proxies.VerticalLine
     * @extends proxies.mixins.baseProxy
     */
    return {
        mixins: [baseProxy],
        renderProxy: function () {
            var componentType = "wysiwyg.viewer.components.VerticalLine";
            var props = this.getChildCompProps(componentType);
            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
