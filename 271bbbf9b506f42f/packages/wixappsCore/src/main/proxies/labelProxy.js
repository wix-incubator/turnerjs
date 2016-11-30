define(["siteUtils", "wixappsCore/proxies/mixins/textProxy", "wixappsCore/core/typesConverter"], function (siteUtils, textProxy, /** wixappsCore.typesConverter */typesConverter) {
    'use strict';

    var COMPONENT_TYPE = "wysiwyg.viewer.components.WRichText";

    /**
     * @class proxies.Label
     * @extends proxies.mixins.textProxy
     */
    return {
        mixins: [textProxy],
        statics: {
            componentType: COMPONENT_TYPE
        },
        renderProxy: function () {
            var data = this.proxyData;

            var elementTag = this.getCompProp("elementTag");
            var formattedText = this.createFormattedText(data, elementTag);

            var props = this.getRichTextChildCompProps(COMPONENT_TYPE);

            props.compData = typesConverter.richText(formattedText, data.links, this.props.viewProps.siteData);

            return siteUtils.compFactory.getCompClass(COMPONENT_TYPE)(props);
        }
    };
});
