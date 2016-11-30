define(["siteUtils", "wixappsCore/core/typesConverter", "wixappsCore/proxies/mixins/baseProxy"], function (siteUtils, /** wixappsCore.typesConverter */typesConverter, baseProxy) {
    'use strict';

    var componentType = "wysiwyg.viewer.components.Video";

    /**
     * @class proxies.Video
     * @extends proxies.mixins.baseProxy
     */
    return {
        mixins: [baseProxy],
        statics: {
            componentType: componentType
        },
        renderProxy: function () {
            var data = this.proxyData;
            var props = this.getChildCompProps(componentType);
            props.compData = typesConverter.video(data);
            props.compProp = {
                showControls: this.getCompProp('showControls'),
                autoplay: this.getCompProp('autoplay'),
                loop: this.getCompProp('loop'),
                showinfo: this.getCompProp('showinfo'),
                lightTheme: this.getCompProp('lightTheme')
            };

            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
