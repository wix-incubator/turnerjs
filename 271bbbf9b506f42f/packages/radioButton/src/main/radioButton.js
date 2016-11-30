/**
 * Created by alexandreroitman on 26/05/2016.
 */
define(['react', 'lodash', 'core', 'santaProps'], function(React, _, core, santaProps) {
    "use strict";

    return {
        displayName: 'RadioButton',
        mixins: [core.compMixins.skinBasedComp, core.compMixins.runTimeCompData],

        statics: {
            useSantaTypes: true
        },

        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            groupName: React.PropTypes.string,
            checked: React.PropTypes.bool,
            onChange: React.PropTypes.func,
            text: React.PropTypes.string

        },

        getSkinProperties: function () {
            var rootClassSet = {};
            rootClassSet[this.props.compProp.alignment + '-direction'] = true;

            var marginDirection = 'margin' + _.capitalize(this.props.compProp.alignment);
            var textStyle = this.props.textStyle;
            textStyle[marginDirection] = this.props.compProp.spacing;


           var circleShadowStyle = {
               width: this.props.compProp.buttonSize,
               height: this.props.compProp.buttonSize
           };

            var radioSkin = {
                "": {
                    tabIndex: 0,
                    "data-disabled": !!this.props.compProp.isDisabled,
                    className: this.classSet(rootClassSet)
                },
                'radio-input': {
                    onChange: this.props.onChange,
                    name: this.props.groupName
                },
                'circle-shadow': {
                    style: circleShadowStyle
                },
                'circle': {
                    "data-disabled": !!this.props.compProp.isDisabled,
                    "data-preview": this.getComponentPreviewState() || this.props.previewState,
                    style: circleShadowStyle
                },
                'text': {
                    children: [this.props.compData.label],
                    style: textStyle
                }

            };

            if (this.props.checked) {
                radioSkin['radio-input'].checked = true;
            }

            return radioSkin;
        }
    };
});
