/**
 * Created by alexandreroitman on 26/05/2016.
 */
define(['lodash', 'core', 'santaProps', 'textCommon'], function(_, core, santaProps, textCommon) {
    "use strict";

    var radioButtonSkinPart = 'radioButton';

    return {
        displayName: 'RadioGroup',
        mixins: [core.compMixins.skinBasedComp, core.compMixins.runTimeCompData, textCommon.textScaleMixin],

        statics: {
            useSantaTypes: true,

            behaviors: {
                change: {methodName: 'validate'}
            }
        },

        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            isMobileView: santaProps.Types.isMobileView
        },

        getInitialState: function () {
            return {
                $mobile: this.props.isMobileView ? 'mobile' : 'desktop'
            };
        },

        validate: function () {
            this.handleAction('validate');

            var valueFromData = this.props.compData.value || this.props.compData.defaultValue;
            var value = this.state.value || valueFromData;

            return this.props.compProp.required ? Boolean(value) : true;
        },

        setRadioSelected: function(item, index, event) {
            this.setState({
                value: item.value
            }, function () {
                this.updateData({value: item.value});
                this.handleAction('change', event);
            }.bind(this));
        },

        createChildren: function() {
            return _.map(this.props.compData.options, this.createChildRadioButton);
        },

        createChildRadioButton: function (item, index) {
            var numOfOptions = this.props.compData.options.length;
            var lastChild = index === numOfOptions - 1;

            var extraProps = {
                id: this.props.id + 'radio' + index,
                ref: 'radio' + index,
                text: this.props.compData.options[index].label,
                groupName: this.props.id,
                key: 'radio' + index + item.label,
                onChange: this.setRadioSelected.bind(this, item, index),
                buttonSize: this.props.compProp.buttonSize,
                previewState: this.getComponentPreviewState(),
                "data-error": !this.validate(),
                textStyle: this.getFontSize(this.props),
                style: {}
            };

            if (!lastChild) {
                if (this.props.compProp.layout === 'vertical'){
                    extraProps.style.marginBottom = this.props.compProp.buttonsMargin;
                } else {
                    extraProps.style.marginRight = this.props.compProp.buttonsMargin;
                }
            }

            var valueFromData = this.props.compData.value || this.props.compData.defaultValue;
            var value = this.state.value || valueFromData;
            if (value === item.value) {
                extraProps.checked = true;
            }


            return this.createChildComponent(item, 'wysiwyg.viewer.components.inputs.RadioButton', radioButtonSkinPart, extraProps);
        },

        getSkinProperties: function () {
            var rootClassSet = {};
            rootClassSet[this.props.compProp.layout + '-axis'] = true;

            return {
                '': {
                    className: this.classSet(rootClassSet)
                },
                items: {
                    children: this.createChildren()
                }
            };
        }
    };
});
