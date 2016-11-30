define(['core', 'lodash', 'textCommon', 'santaProps'], function (/** core */core, _, textCommon, santaProps) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.TextArea
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "TextArea",
        mixins: [mixins.skinBasedComp, mixins.runTimeCompData, textCommon.textScaleMixin],

        propTypes: {
            compData: santaProps.Types.Component.compData,
            compProp: santaProps.Types.Component.compProp
        },

        statics: {
            useSantaTypes: true
        },

        getInitialState: function () {
            return _.assign(this.getCssState(this.props), {value: this.props.compData.value});
        },

        componentWillReceiveProps: function (nextProps) {
            var newState = this.getCssState(nextProps);
            if (_.has(nextProps.compData, 'value') && nextProps.compData.value !== this.state.value) {
                newState.value = nextProps.compData.value;
            }
            this.setState(newState);
        },

        getCssState: function (props) {
            return {
                '$validation': props.compProp.message ? 'invalid' : 'valid',
                '$label': props.compProp.label ? 'hasLabel' : 'noLabel'
            };
        },

        onClick: function (event) {
            event.stopPropagation();
            if (this.props.compProp.isPreset) {
                event.target.select();
            }
        },

        onKeyDown: function(event){
            event.stopPropagation();
        },

        onKeyUp: function(event) {
            this.handleAction('keyPress', event);
        },

        onChange: function(event) {
            var newValue = event.target.value;
            this.setState({value: newValue}, function(){
                this.updateData({value: newValue});
                this.handleAction('change', event);
            }.bind(this));
        },

        handleFocus: function (event) {
            this.handleAction('focus', event);
        },

        onBlur: function(event) {
            this.handleAction('blur', event);
        },

        getSkinProperties: function () {
            var compProps = this.props.compProp;
            var compData = this.props.compData;
            var displayNone = {style: {display: 'none'}};
            var getMessage = function getMessage() {
                return {children: compProps.message, style: {"whiteSpace": 'normal'}};
            };

            var classSet = {};
            classSet[this.props.compProp.textAlignment + '-direction'] = true;

            var skinProperties = {
                "": {
                    className: this.classSet(classSet)
                },
                label: compProps.label ? {children: compProps.label} : displayNone,
                textarea: {
                    value: this.state.value,
                    maxLength: compData.maxLength,
                    placeholder: compProps.placeholder,
                    onChange: compProps.onChange || this.onChange,
                    onClick: this.onClick,
                    onKeyDown: this.onKeyDown,
                    onKeyUp: this.onKeyUp,
                    onFocus: this.handleFocus,
                    onBlur: compProps.onBlur || this.onBlur,
                    disabled: compProps.isDisabled,
                    required: compProps.required,
                    readOnly: compProps.readOnly,
                    tabIndex: compProps.tabIndex
                },
                errorMessage: compProps.message ? getMessage() : displayNone
            };


            skinProperties.textarea = _.merge({
                style: _.merge(this.getFontSize(this.props), {
                    'paddingLeft': this.props.compProp.textPadding,
                    'paddingRight': this.props.compProp.textPadding
                })
            }, skinProperties.textarea, {
                "data-preview": _.isFunction(this.getComponentPreviewState) && this.getComponentPreviewState()
            });


            return skinProperties;
        }
    };
});
