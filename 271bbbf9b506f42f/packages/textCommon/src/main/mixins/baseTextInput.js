define(['lodash', 'react', 'santaProps', 'core'], function (_, React, santaProps, /** core */core) {
    'use strict';

    var mixins = core.compMixins;
    var displayNone = {style: {display: 'none'}};

    function getCssStateFromProps(props) {
        // TODO: shouldn't keep these values in state
        return {
            '$label': props.compProp.label ? 'hasLabel' : 'noLabel'
        };
    }

    function getInputProps() {
        var compProps = this.props.compProp;
        var compData = this.props.compData;

        // TODO: move the following compProps to an inputMixin ? : required, autoComplete, readOnly, isDisabled, label
        var props = {
            type: compData.textType,
            name: compData.name || this.props.structure.nickname,
            value: this.state.value,
            onChange: this._handleChange,
            onBlur: this._handleBlur,
            onFocus: this._handleFocus,
            onClick: this._handleClick,
            onKeyUp: this._handleKeyUp,
            disabled: compProps.isDisabled,
            required: compProps.required,
            readOnly: compProps.readOnly,
            placeholder: compProps.placeholder,
            tabIndex: compProps.tabIndex
        };

        if (props.type === 'number') {
            _.assign(props, {
                min: compData.min,
                max: compData.max
            });
        }
        if (compData.pattern) {
            _.assign(props, {
                pattern: compData.pattern
            });
        }

        if (compData.maxLength) {
            _.assign(props, {
                maxLength: compData.maxLength
            });
        }

        if (compProps.autoComplete && props.type !== 'password') {
            props.autoComplete = 'on';
        }

        return props;
    }

    var getPublicState = function (state) {
        return {valid: _.get(state, 'valid', true)};
    };

    /**
     * @class components.BaseTextInput
     * @extends {core.skinBasedComp}
     */
    var BaseTextInput = {
        mixins: [mixins.skinBasedComp, mixins.runTimeCompData, mixins.compStateMixin(getPublicState)],
        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            structure: santaProps.Types.Component.structure.isRequired,
            isValid: React.PropTypes.bool,
            isPreset: React.PropTypes.bool,
            onChange: React.PropTypes.func,
            message: React.PropTypes.string
        },
        statics: {
            behaviors: {
                change: {methodName: 'setValidateState'}
            }
        },

        // TODO: add events for editor: keyup, keydown, blur, focus, inputChanged (doesn't include 'enter')

        getInitialState: function () {
            return _.assign(getCssStateFromProps(this.props), {
                valid: !(this.props.isValid === false),
                value: this.props.compData.value
            });
        },

        componentWillReceiveProps: function (nextProps) {
            var nextState = getCssStateFromProps(nextProps);
            if (_.has(nextProps.compData, 'value') && nextProps.compData.value !== this.state.value) {
                nextState.value = nextProps.compData.value;
            }
            this.setState(nextState);
        },

        _handleClick: function (event) {
            if (this.props.isPreset) {
                event.target.select();
            }
        },

        setValidateState: function () {
            this.setState({'valid': !!(this.validate() === 'valid')});
        },

        validate: function () {
            var node = this.refs.input;
            var isEmptyButRequired = this.props.compProp.required ? this.state.value.length === 0 : false;
            this.handleAction('validate');
            return !isEmptyButRequired && node.validity && node.validity.valid ? 'valid' : 'invalid';
        },
        _handleChange: function (event) {
            var newValue = event.target.value;

            this.setState({
                value: newValue
            }, function () {
                this.updateData({value: newValue});
            }.bind(this));
            this.latestChangeEvent = event;
        },

        _handleBlur: function (event) {
            if (this.props.onChange) {
                this.props.onChange(event);
            }
            this.handleAction('blur', event);
            if (this.latestChangeEvent) {
                this.handleAction('change', this.latestChangeEvent);
                this.setValidateState();
                this.latestChangeEvent = null;
            }
        },

        _handleFocus: function (event) {
            this.handleAction('focus', event);
        },

        _handleKeyUp: function (event) {
            this.handleAction('keyPress', event);
        },

        getBaseTextInputSkinProperties: function () {
            var compProps = this.props.compProp;

            return {
                label: compProps.label ? {children: compProps.label} : displayNone,
                input: getInputProps.call(this),
                message: this.props.message ? {
                    children: this.props.message,
                    style: {"whiteSpace": 'normal'}
                } : displayNone
            };
        }
    };

    return BaseTextInput;
});
