define(['lodash', 'react', 'core', 'santaProps', 'textCommon'], function (_, React, core, santaProps, textCommon) {
    'use strict';

    var mixins = core.compMixins;

    function getOption(opt) {
        return React.DOM.option({value: opt.value, default: opt.default, style: opt.style, ref: opt.ref || opt.value, disabled: opt.disabled, key: opt.key}, opt.text);
    }

    function getComboBoxChildren(options, compProp, defaultValue, placeholderClass) {
        var foundDefault = false;
        var comboBoxOptions = _.map(options, function (opt, i) {
            foundDefault = foundDefault || opt.value === defaultValue;
            return getOption(_.assign({default: opt.value === defaultValue, key: i}, opt));
        });

        var placeholderOption;
        if (compProp.placeholder) {
            placeholderOption = _.assign({default: !foundDefault, style: {display: 'none'}, className: placeholderClass, ref: 'placeholder', key: 'placeholder'}, compProp.placeholder);
        } else {
            placeholderOption = _.assign({default: !foundDefault, style: {display: 'none'}, className: placeholderClass}, {text: '', value: '', ref: 'placeholder', key: 'noPlaceholder'});
        }
        comboBoxOptions.unshift(getOption(placeholderOption));

        return comboBoxOptions;
    }

    function getCssState(props) {
        return {
            '$validity': props.errorMessage ? 'invalid' : 'valid'
        };
    }

    var getPublicState = function (state) {
        return {valid: state ? state.$validity === 'valid' : true};
    };

    /**
     * @class components.ComboBoxInput
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "ComboBoxInput",
        mixins: [mixins.skinBasedComp, mixins.runTimeCompData, textCommon.textScaleMixin, mixins.compStateMixin(getPublicState)],

        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            componentViewMode: santaProps.Types.RenderFlags.componentViewMode,
            onSelectionChange: React.PropTypes.func,
            errorMessage: React.PropTypes.string
        },
        statics: {
            useSantaTypes: true,
            behaviors: {
                change: {methodName: 'validate'}
            }
        },

        validate: function () {
            if (this.props.compProp.required && this.props.compData.options.length > 0) {
                var validValue = _.some(this.props.compData.options, {value: this.state.value});
                var valid = validValue && !this.isPlaceholderSelected();
                this.setState({valid: valid});
                return valid;
            }
            this.handleAction('validate');
            if (!this.state.valid){
                this.setState({valid: true});
            }
            return true;
        },

        getInitialState: function () {
            var initialValue = this.props.compData.value || _.get(this.props.compProp, 'placeholder.value');
            return _.assign(getCssState(this.props), {value: initialValue, defaultValue: this.props.compData.value, valid: true});
        },

        componentWillReceiveProps: function (props) {
            var newState = getCssState(props);

            if (props.compData.value !== this.state.value || this.props.onSelectionChange) {
                _.assign(newState, {value: props.compData.value});
            }

            this.setState(newState);
        },

        onChange: function (event, domID) {
            var value = event.target.value;
            this.updateData({value: value});
            if (this.props.onSelectionChange) {
                event.type = 'selectionChanged';
                event.payload = _.find(this.props.compData.options, {value: value}) || {};
                this.props.onSelectionChange(event, domID);
            } else {
                this.setState({value: value, valid: !!value});
            }
            this.handleAction('change', event);
        },

        onFocus: function(event) {
            this.handleAction('focus', event);
        },

        onBlur: function(event) {
            this.handleAction('blur', event);
        },

        getSkinProperties: function () {
            var selectedClassSet = {};
            selectedClassSet[this.props.compProp.textAlignment + '-direction'] = true;
            var options = this.props.compData.options;
            return {
                "": {
                    onBlur: this.onBlur,
                    className: this.classSet(selectedClassSet),
                    "data-disabled": !!this.props.compProp.isDisabled,
                    "data-error": !this.state.valid && this.props.componentViewMode !== 'editor',
                    "data-preview": _.isFunction(this.getComponentPreviewState) && this.getComponentPreviewState()
                },
                collection: {
                    defaultValue: -1,
                    disabled: !!_.get(this.props, 'compProp.isDisabled'),
                    children: getComboBoxChildren(options, this.props.compProp, this.state.defaultValue, this.classSet({'placeholder-style': true})),
                    value: this.state.value,
                    onChange: this.onChange,
                    onFocus: this.onFocus,
                    style: _.merge({'paddingLeft': this.props.compProp.textPadding, 'paddingRight': this.props.compProp.textPadding}, this.getFontSize(this.props)),
                    className: this.isPlaceholderSelected() ? this.classSet({'placeholder-style': true}) : '',
                    "data-preview": _.isFunction(this.getComponentPreviewState) && this.getComponentPreviewState()
                },
                errorMessage: {
                    children: [this.props.errorMessage]
                }
            };
        },

        isPlaceholderSelected: function() {
            return this.state.value === _.get(this.props.compProp, 'placeholder.value');
        }
    };
});
