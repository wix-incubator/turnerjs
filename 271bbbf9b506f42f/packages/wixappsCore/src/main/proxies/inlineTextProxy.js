define(["siteUtils", "wixappsCore/proxies/mixins/textProxy", "wixappsCore/core/typesConverter", 'react'], function (siteUtils, textProxy, /** wixappsCore.typesConverter */typesConverter, React) {
    'use strict';

    function transformSkinProperties(refData) {
        refData[""].parentConst = React.DOM.span;
        return refData;
    }

    /**
     * @class proxies.InlineText
     * @extends proxies.mixins.textProxy
     */
    return {
        mixins: [textProxy],
        renderProxy: function () {
            var data = this.proxyData;

            var formattedText = this.createFormattedText(data, 'span');

            var componentType = "wysiwyg.viewer.components.WRichText";

            var props = this.getRichTextChildCompProps(componentType, transformSkinProperties);

            props.compData = typesConverter.richText(formattedText, data.links, this.props.viewProps.siteData);

            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
