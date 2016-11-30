define(['lodash', 'santaProps', 'textCommon', 'utils'], function (_, santaProps, textCommon, utils) {
    'use strict';

    var linkRenderer = utils.linkRenderer;

    /**
     * @class components.WRichText
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */

    return {
        displayName: "WRichText",

        propTypes: {
            structure: santaProps.Types.Component.structure.isRequired,
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp,
            linkRenderInfo: santaProps.Types.Link.linkRenderInfo,
            rootNavigationInfo: santaProps.Types.Component.rootNavigationInfo,
            colorsMap: santaProps.Types.Theme.colorsMap.isRequired,
            fontsMap: santaProps.Types.Fonts.fontsMap.isRequired,
            isMobileView: santaProps.Types.isMobileView
        },

        statics: {
            useSantaTypes: true
        },

        mixins: [textCommon.textCompMixin],
        allowIframes: false,
        fontGetter: function (fontClassName) {
            var fontNumber = fontClassName.split('_')[1];
            return this.props.fontsMap[fontNumber];
        },

        colorGetter: function (colorClassName) {
            var colorNumber = colorClassName.split('_')[1];
            return this.props.colorsMap[colorNumber] || colorClassName;
        },

        convertCompDataTextToHTML: function (props) {
            if (!this._componentHtml) {
                return;
            }

            this._componentHtml = textCommon.textComponentsUtils.convertDataQueryLinksIntoHtmlAnchors(
                this._componentHtml,
                props.compData.linkList,
                linkRenderer.renderLink,
                props.linkRenderInfo,
                props.rootNavigationInfo
            );

            this._componentHtml = textCommon.textComponentsUtils.mobileTextTransformIfNeeded(
                this._componentHtml,
                {
                    brightness: _.get(props, 'compProp.brightness'),
                    isMobileView: props.isMobileView,
                    scale: _.get(props, 'structure.layout.scale'),
                    fontGetter: this.fontGetter,
                    colorGetter: this.colorGetter
                }
            );

            if (!props.noAutoLinkGeneration){
                this._componentHtml = textCommon.textComponentsUtils.createImpliedLinks({
                    htmlContent: this._componentHtml,
                    isMobileView: this.props.isMobileView
                });
            }
        }
    };
});
