define(["lodash", "siteUtils", "wixappsCore/proxies/mixins/textProxy", "wixappsCore/core/typesConverter", "wixappsCore/util/textClipper", "fonts"], function (_, siteUtils, textProxy, /** wixappsCore.typesConverter */typesConverter, textClipper, /** fonts */fonts) {
    'use strict';

    function lineHeightToFloat (lineHeight) {
        var ret = parseFloat(lineHeight);
        if (isNaN(ret) && _.includes(["normal", "initial", "inherit"], lineHeight)) {
            ret = 1.2;
        }
        return ret;
    }

    function getMinHeight(formattedText) {
        var minLines = this.getCompProp("minLines") || (this.getCompProp("singleLine") && 1);
        if (!minLines) {
            return 0;
        }

        var fontClass = fonts.fontUtils.getFontClassName(formattedText);
        var fontStr = this.props.viewProps.siteData.getFont(fontClass);
        var font = fonts.fontUtils.parseFontStr(fontStr);
        var lineHeight = 1.25; // this is the default value (=> line-height:normal)

        // can only be overridden by explicitly setting line-height on the comp
        if (this.getCompProp("line-height")) {
            lineHeight = lineHeightToFloat(this.getCompProp("line-height"));
        }

        return parseInt(font.size, 10) * lineHeight * minLines;
    }

    /**
     * @class proxies.ClippedParagraph
     * @extends proxies.mixins.textProxy
     */
    return {
        mixins: [textProxy],
        renderProxy: function () {
            var data = this.proxyData;

            var formattedText = this.createFormattedText(data);

            var minHeight = getMinHeight.call(this, formattedText);

            var transformSkinProperties = function (refData) {
                refData[''].style = refData[''].style || {};
                refData[''].style.overflow = "hidden";
                if (minHeight) {
                    refData[''].style["min-height"] = minHeight;
                }
                return refData;
            };

            var componentType = "wysiwyg.viewer.components.WRichText";

            var props = this.getRichTextChildCompProps(componentType, transformSkinProperties);

            var maxChars = this.getCompProp("max-chars") || 150;
            var removeAnchors = this.getCompProp("remove-anchors") || false;
            if (removeAnchors) {
                formattedText = formattedText.replace(/(<a[^>]*>)/g, '').replace(/(<\/a>)/g, '');
            }

            formattedText = textClipper.clipText(formattedText, maxChars);

            props.compData = typesConverter.richText(formattedText, data.links, this.props.viewProps.siteData);

            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
