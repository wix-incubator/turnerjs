define(['core', 'lodash', 'experiment', 'react'], function (/** core */core, _, experiment) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * Note that this is run by using runValidators.apply, in order to use the right context
     * @returns {string}
     */
    function runValidators() {
        var validators = this.props.validators || [];
        var value = this.state.value;

        var errorMessage = '';
        _.forEach(validators, function (validator) {
            if (errorMessage) {
                return false;
            }
            errorMessage = validator(value);
        });
        this.setState({error: errorMessage});
        this.hasError = !!errorMessage;

        return errorMessage;
    }

    function getRelevantErrorMsg(errorMessageClassName, noErrorParams) {
        var res;
        if (this.state.error) {
            res = {className: errorMessageClassName, children: this.state.error};
        } else if (this.props.asyncErrorMessage) {
            res = {className: errorMessageClassName, children: this.props.asyncErrorMessage};
        } else {
            res = noErrorParams;
        }
        return res;
    }

    /**
     * @class components.InputWithValidation
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "InputWithValidation",
        mixins: [mixins.skinBasedComp],

        getInitialState: function () {
            return {
                value: this.props.defaultValue || '',
                error: false
            };
        },

        onChange: function (e) {
            e.persist();

            this.setState({value: e.target.value});
            if (this.props.onChange) {
                this.props.onChange(e);
            }
            this.debouncedOnChange(e);
            if (this.props.lazyValidation) {
                this.setState({error: false});
            }
        },
        debouncedOnChange: _.debounce(function () {
            if (!this.props.lazyValidation) {
                this.validate();
            }
        }, 200),

        getValue: function () {
            return this.state.value;
        },
        getSkinProperties: function () {
            var errorClass = this.props.styleId + '_error';
            var errorMessageClassName = errorClass;
            var inputClassName = (this.state.error || this.props.asyncErrorMessage ? errorClass : '');
            var extraInputProps = {};
            var noErrorParams = {};
            if (experiment.isOpen('newLoginScreens')) {
                var newClass = this.props.styleId + '_new';
                errorMessageClassName += (' ' + newClass);
                inputClassName += (' ' + newClass);
                extraInputProps = {
                    onFocus: this.onFocus,
                    onBlur: this.onBlur
                };
                noErrorParams = {className: newClass};
            }

            if (this.props.siteData.isMobileView()) {
                inputClassName += (' ' + this.props.styleId + '_mobile');
                errorMessageClassName += (' ' + this.props.styleId + '_mobile');
            }

            return {
                label: this.props.label ? {children: this.props.label} : {},
                input: _.merge({
                    className: inputClassName,
                    value: this.state.value,
                    placeholder: (this.state.noPlaceHolder ? '' : this.props.placeholder),
                    onChange: this.onChange,
                    type: this.props.type || 'text'
                }, extraInputProps),
                errorMessage: getRelevantErrorMsg.bind(this)(errorMessageClassName, noErrorParams)
            };
        },
        isValid: function () {
            return !this.hasError;
        },
        validate: function () {
            return !(runValidators.apply(this));
        },
        onFocus: function() {
            this.setState({noPlaceHolder: true});
        },
        onBlur: function() {
            this.setState({noPlaceHolder: false});
        }
    };
});
















