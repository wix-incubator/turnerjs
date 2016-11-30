define([
    'core',
    'react',
    'lodash',
    'utils',
    'santaProps',
    'formCommon',
    'reactDOM'
], function(core, React, _, utils, santaProps, formCommon, ReactDOM) {
    'use strict';

    var DEFAULT_GEO = 'USA';

    var mixins = core.compMixins,
        validationUtils = utils.validationUtils,
        countryCodes = utils.countryCodes,
        validCountryCodes = {};

    var FORM_INPUTS = [
        {
            skinPart: 'firstName',
            inputSkinPart: 'firstName'
        },
        {
            skinPart: 'lastName',
            inputSkinPart: 'lastName'
        },
        {
            skinPart: 'email',
            inputSkinPart: 'email'
        },
        {
            /**
             * This name will be used to generate labels and access component properties
             */
            skinPart: 'phone',

            /**
             * This name will be used to generate input and assign error classes
             * on validation
             */
            inputSkinPart: 'phoneNumber',

            /**
             * This is an array of fields, that will be extracted on submit for validation and email composing
             */
            children: ['countryCodes', 'phoneNumber'],

            validator: validatePhoneNumber
        }
    ];

    _.forEach(countryCodes.countries, function (country, key) {
        if (country.phoneCode) {
            validCountryCodes[key] = country;
        }
    });

    function createRowRefData(input) {
        return {
            className: this.classSet({
                hidden: !this.props.compProp['hidden' + utils.stringUtils.capitalize(input.skinPart) + 'Field']
            })
        };
    }

    function createLabelRefData(input) {
        return {
            optional: true,
            children: [
                this.props.compData[input.skinPart + 'FieldLabel']
            ]
        };
    }

    function onFormInputChange(event) {
        var fieldName = event.target.id.replace(this.props.id, '').replace('Field', '').replace('Number', '');

        this.setState(_.assign(this.state[fieldName], {value: event.target.value}));
    }

    function createInputsRefData(input) {
        return {
            parentConst: React.DOM.input,
            onFocus: _.bind(onInputFieldFocus, this),
            onChange: _.bind(onFormInputChange, this),
            onInput: input.validator,
            placeholder: this.props.compData[input.skinPart + 'FieldLabel'],
            name: input.skinPart,
            value: this.state[input.skinPart].value,
            className: this.classSet({
                error: (this.state[input.skinPart] && this.state[input.skinPart].error)
            })
        };
    }

    function getRowNames() {
        return _.map(FORM_INPUTS, function (item) {
            return item.skinPart + 'Row';
        });
    }

    function getLabelNames() {
        return _.map(FORM_INPUTS, function (item) {
            return item.skinPart + 'FieldLabel';
        });
    }

    function getInputNames() {
        return _.map(FORM_INPUTS, function (item) {
            return item.inputSkinPart + 'Field';
        });
    }

    function createFormNotifications() {
        var messageOutside = this.getFromExports('successMessageOutside'),
            notification = this.state.notifications,
            errorMessage = {
                error: notification.error,
                success: !notification.error && notification.message
            };

        return messageOutside ?
        {
            message: {
                parentConst: React.DOM.div,
                children: notification.message,
                className: this.classSet(errorMessage)
            }
        } : {
            notifications: {
                children: notification.message,
                className: this.classSet(errorMessage)
            }
        };
    }

    function createFormTitle() {
        return {
            formTitle: {
                parentConst: React.DOM.h1,
                children: this.props.compData.subscribeFormTitle
            }
        };
    }

    function onInputFieldFocus(event) {
        var fieldName = event.target.getAttribute('name');
        if (this.state[fieldName].error) {
            var newState = {
                notifications: {
                    message: '',
                    error: false
                }
            };
            newState[fieldName] = {
                error: false,
                value: this.state[fieldName].value
            };
            this.setState(newState);
        }
    }

    function createCountryCodesSelect(countryCode) {
        return {
            countryCodesField: {
                value: countryCode,
                children: _.map(validCountryCodes, function (country) {
                    return React.DOM.option(
                        {value: country.phoneCode},
                            country.countryName + ' ' + country.phoneCode
                    );
                }),
                onChange: _.bind(onCountryCodesChanged, this)
            },
            selected: {
                value: countryCode,
                readOnly: true
            }
        };
    }

    function onCountryCodesChanged(event) {
        this.setState({
            countryCode: event.target.value
        });
    }

    function validatePhoneNumber(event) {
        var input = event.target;
        input.value = input.value.replace(/[^0-9\-]/g, '');
        input.value = input.value.substring(0, Math.min(25, input.value.length));
    }

    /**
     * @class components.SubscribeForm
     * @extends core.skinBasedComp
     */
    var SubscribeForm = {
        displayName: 'SubscribeForm',
        mixins: [formCommon.formMixin, mixins.skinInfo],

        propTypes: {
            id: santaProps.Types.Component.id.isRequired,
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired,
            geo: santaProps.Types.RendererModel.geo
        },

        statics: {
            useSantaTypes: true
        },

        /*override*/
        getFormInitialState: function () {
            var geo = this.props.geo || DEFAULT_GEO;
            var geoCodes = validCountryCodes[geo] || validCountryCodes[DEFAULT_GEO];
            var state = {
                notifications: {
                    message: '',
                    error: false
                },
                countryCode: geoCodes.phoneCode,
                mailSent: false
            };
            _.forEach(FORM_INPUTS, function (field) {
                state[field.skinPart] = {
                    error: false
                };
            });

            return state;
        },

        /**
         *
         * @param event
         * @private
         */
        onMailJustSent: function (event) {
            event.target.removeEventListener('click', this.onMailJustSent);
            this.setState({
                mailSent: false,
                message: {
                    message: '',
                    error: false
                }
            });
        },

        /**
         *
         * @param field
         * @returns {boolean|*}
         */
        isFieldEmpty: function (field) {
            return !field.value || !field.value.replace(/^\s+|\s+$/g, '') || _.includes(field.className, 'isPlaceholder');
        },

        /**
         *
         * @returns {{}}
         * @private
         */
        getVisibleFieldsSpecs: function () {
            return _(this.props.compProp)
                .pick(function (propValue, propKey) {
                    return propValue && _.startsWith(propKey, 'hidden');
                })
                .transform(function (acc, propValue, propKey) {
                    var name = propKey.replace('hidden', '');
                    var fieldName = _.camelCase(name);
                    acc[fieldName] = {
                        isRequire: this.props.compProp['required' + name],
                        fields: this.getInputsFromSkinPart(fieldName)
                    };
                }, {}, this)
                .value();
        },

        /**
         *
         * @param {string} skinPartName
         * @returns {Array<HTMLElement>}
         * @private
         */
        getInputsFromSkinPart: function (skinPartName) {
            var field = _.find(FORM_INPUTS, function (fld) {
                return (fld.skinPart + 'Field') === skinPartName;
            });
            if (field.children) {
                return _.map(field.children, function (item) {
                    return ReactDOM.findDOMNode(this.refs[item + 'Field']);
                }, this);
            }
            return [ReactDOM.findDOMNode(this.refs[field.skinPart + 'Field'])];
        },

        getCleanFormState: function () {
            var newState = {};
            _.forEach(FORM_INPUTS, function (input) {
                newState[input.skinPart] = {
                    error: false,
                    value: this.state[input.skinPart].value
                };
            }, this);

            newState.notifications = {
                error: false,
                message: ''
            };
            return newState;
        },

        getErrorFormState: function (errorFields, message) {
            var newState = {
                notifications: {
                    message: message,
                    error: true
                }
            };

            _.forEach(errorFields, function (badState) {
                newState[badState] = {
                    error: true,
                    value: this.state[badState].value
                };
            }, this);

            return newState;
        },

        createSkinPropertiesContainer: function () {
            return {
                wrapper: {
                    parentConst: React.DOM.div,
                    onClick: this.state.mailSent ? this.onMailJustSent : _.noop
                }
            };
        },

        /*override*/
        getFormInputs: function () {
            return FORM_INPUTS;
        },

        /*override*/
        getActivityName: function () {
            return 'SubscribeFormActivity';
        },

        /*override*/
        getFormFields: function () {
            return _.reduce(FORM_INPUTS, function (result, input) {
                var prop = 'hidden' + input.skinPart.replace(/[a-z]/, function (l) {
                    return l.toUpperCase();
                }) + 'Field';

                if (this.props.compProp[prop]) {
                    var innerHTML = ReactDOM.findDOMNode(this.refs[input.skinPart + 'FieldLabel']).innerHTML;
                    if (!input.children) {
                        result[innerHTML] = ReactDOM.findDOMNode(this.refs[input.skinPart + 'Field']).value;
                    } else {
                        result[innerHTML] = _.reduce(input.children, function (total, current) {
                            return total + ReactDOM.findDOMNode(this.refs[current + 'Field']).value;
                        }, '', this);
                    }
                }
                return result;
            }, {}, this);
        },
        /*override*/
        getFieldsForActivityReporting: function () {
            var fields = {email: this.state.email.value};

            if (this.state.firstName.value) {
                fields.first = this.state.firstName.value;
            }

            if (this.state.lastName.value) {
                fields.last = this.state.lastName.value;
            }

            if (this.state.phone.value) {
                fields.phone = this.state.countryCode + '' + this.state.phone.value;
            }

            return fields;
        },

        /*override*/
        getFieldLabels: function () {
            return {};
        },

        /*override*/
        isFormValid: function () {
            var ok = true, badFields = [],
                newState = {};

            if (!validationUtils.isValidEmail((this.state.email.value || '').replace(/^\s+|\s+$/g, ''))) {
                newState = this.getErrorFormState(['email'], this.props.compData.errorMessage);
                ok = false;
            } else {
                _.forEach(this.getVisibleFieldsSpecs(), function (property, propName) {
                    if (property.isRequire) {
                        for (var i = 0, j = property.fields.length; i < j; i++) {
                            if (this.isFieldEmpty(property.fields[i])) {
                                badFields.push(propName.replace(/Field$/, ''));
                            }
                        }
                    }
                }, this);

                newState = this.getCleanFormState();

                if (!_.isEmpty(badFields)) {
                    ok = false;
                    newState = this.getErrorFormState(badFields, this.props.compData.validationErrorMessage);
                }
            }

            this.setState(newState);

            return ok;
        },

        /*override*/
        getInputName: function () {
            return [this.state.firstName.value || 'n/a', this.state.lastName.value || 'n/a'].join(' ');
        },

        /*override*/
        getLangKeys: function (lang) {
            return utils.translations.subscribeFormTranslations[lang];
        },

        /*override*/
        getFormSkinProperties: function () {
            var skinProperties = this.createSkinPropertiesContainer();

            // create all form rows
            _.assign(skinProperties, _.zipObject(getRowNames(), _.map(FORM_INPUTS, createRowRefData, this)));

            // create all form inputs labels
            _.assign(skinProperties, _.zipObject(getLabelNames(), _.map(FORM_INPUTS, createLabelRefData, this)));

            // create form inputs
            _.assign(skinProperties, _.zipObject(getInputNames(), _.map(FORM_INPUTS, createInputsRefData, this)));

            // create notifications:
            _.assign(skinProperties, createFormNotifications.call(this));

            // create form title
            _.assign(skinProperties, createFormTitle.call(this));

            // create and fill country codes select
            _.assign(skinProperties, createCountryCodesSelect.call(this, this.state.countryCode));

            return skinProperties;
        }
    };

    return SubscribeForm;
});
