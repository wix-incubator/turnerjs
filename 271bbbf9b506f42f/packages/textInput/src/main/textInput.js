define(['lodash', 'santaProps', 'textCommon'], function (_, santaProps, textCommon) {
    'use strict';

    function getTextInputFontSize() {
        var fontStyle = this.getFontSize();
        if (this.props.isMobileView) {
            var size = _.max([13, Number(fontStyle.fontSize.replace('px', ''))]);
            fontStyle.fontSize = size + 'px';
        }
        return fontStyle;
    }


    /**
     * @class components.TextInput
     * @extends {components.BaseTextInput}
     */
    return {
        displayName: "TextInput",
        mixins: [textCommon.baseTextInput, textCommon.textScaleMixin],
        propTypes: {
            compProp: santaProps.Types.Component.compProp.isRequired,
            isMobileView: santaProps.Types.isMobileView
        },
        statics: {
            useSantaTypes: true
        },
        getSkinProperties: function () {
            var selectedClassSet = {};
            selectedClassSet[this.props.compProp.textAlignment + '-direction'] = true;

            var baseTextInputSkinProperties = this.getBaseTextInputSkinProperties();
            baseTextInputSkinProperties[""] = {
                className: this.classSet(selectedClassSet),
                "data-disabled": !!this.props.compProp.isDisabled,
                "data-error": !this.state.valid,
                "data-preview": _.isFunction(this.getComponentPreviewState) && this.getComponentPreviewState()
            };

            var paddingDirection = 'padding' + _.capitalize(this.props.compProp.textAlignment);

            baseTextInputSkinProperties.input = _.merge({
                style: getTextInputFontSize.call(this)
            }, baseTextInputSkinProperties.input, {
                "data-preview": _.isFunction(this.getComponentPreviewState) && this.getComponentPreviewState()
            });
            baseTextInputSkinProperties.input.style[paddingDirection] = this.props.compProp.textPadding;

            return baseTextInputSkinProperties;

        }
    };
});
