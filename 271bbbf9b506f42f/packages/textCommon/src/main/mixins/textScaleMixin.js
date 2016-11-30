define(['lodash', 'skins', 'fonts', 'santaProps', 'siteUtils', 'core'], function (_, skins, fonts, santaProps, siteUtils, core) {
    'use strict';

    var fontUtils = fonts.fontUtils;

    function getMobileFontSize(desktopFontSize, scale) {
        return siteUtils.mobileUtils.convertFontSizeToMobile(desktopFontSize, scale);
    }

    function getFontFromExports() {
        var exports = skins.skins[this.props.skin] && skins.skins[this.props.skin].exports;
        var exportWithFont = _.find(exports, function (singleExport) {
            var skinName = singleExport.skin;
            return !_.isUndefined(this.getParamFromSkin('fnt', skinName).value);
        }, this);

        return exportWithFont && this.getParamFromSkin('fnt', exportWithFont.skin).value;
    }

    return {
        mixins: [core.compMixins.skinInfo],

        propTypes: {
            structure: santaProps.Types.Component.structure,
            compTheme: santaProps.Types.Component.theme,
            skin: santaProps.Types.Component.skin,
            isMobileView: santaProps.Types.isMobileView,
            fontsMap: santaProps.Types.Fonts.fontsMap
        },

        componentWillReceiveProps: function () {
            this.lastScale = _.get(this, 'props.structure.layout.scale') || 1;
        },

        fontGetter: function (fontClassName) {
            var fontNumber = fontClassName.split('_')[1];
            return this.props.fontsMap[fontNumber];
        },

        getFontSize: function () {
            var fontStyle = {};
            if (this.props.isMobileView) {
                var desktopFontSize = this.getDesktopFontSize();
                if (desktopFontSize) {
                    fontStyle.fontSize = getMobileFontSize(desktopFontSize, this.props.structure.layout.scale) + 'px';
                }
            }
            return fontStyle;
        },

        getDesktopFontSize: function () {
            var style = this.props.compTheme;

            var fontClassName = _.get(style, ['style', 'properties', 'fnt']) ||
                _.get(skins, ['skins', this.props.skin, 'paramsDefaults', 'fnt']) ||
                getFontFromExports.call(this);
            if (fontClassName) {
                var font = this.fontGetter(fontClassName) || fontClassName;
                return parseInt(fontUtils.parseFontStr(font).size, 10);
            }
        }
    };
});
