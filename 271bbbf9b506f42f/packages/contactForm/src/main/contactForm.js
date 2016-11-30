/**
 * Created by eitanr on 6/15/14.
 */
define(['lodash', 'santaProps', 'utils', 'formCommon', 'reactDOM', 'experiment'], function (_, santaProps, utils, formCommon, ReactDOM, experiment) {
    "use strict";

    var FORM_INPUTS = ['name', 'subject', 'message', 'phone', 'email', 'address'];

    function getLabelsNames(inputs) {
        return _.map(inputs, function (inputName) {
            return 'label_' + inputName;
        });
    }

    function getFieldLabel(fieldName) {
        return fieldName + "FieldLabel";
    }

    function getFieldHidden(fieldName) {
        return 'hidden_' + getFieldLabel(fieldName);
    }

    function getFieldRequired(fieldName) {
        return 'required_' + getFieldLabel(fieldName);
    }

    function createFormInput(fieldLabel, inputState, onInputChange, onInputClick) {
        return {
            name: fieldLabel,
            value: inputState.value,
            className: this.classSet(inputState),
            placeholder: fieldLabel,
            onChange: onInputChange,
            onClick: onInputClick
        };
    }

    function createFormNotifications(notificationsState) {
        return {
            notifications: {
                className: this.classSet({
                    error: notificationsState.error,
                    success: !notificationsState.error
                }),
                children: [
                    notificationsState.message
                ]
            }
        };
    }

    function createFormLabels(fieldName, compData, compProp) {
        var label = getFieldLabel(fieldName);
        var isHidden = !compProp[getFieldHidden(fieldName)];

        return {
            className: this.classSet({
                hidden: isHidden
            }),
            children: [
                compData[label]
            ]
        };
    }

    function validateField(fieldState, fieldName, fieldValue) {
        var validations = utils.validationUtils;
        if (!fieldState.hidden && fieldState.required) {
            return fieldName === 'email' ? validations.isValidEmail(fieldValue) : !_.isEmpty(fieldValue);
        }
        return true;
    }

    function getFormNewState(state, compData, fieldName, fieldValue, isValid) {
        if (isValid) {
            return createValidInputCompState(state, fieldName, fieldValue);
        }
        return createInvalidInputCompState(fieldName, state[fieldName], compData.errorMessage, compData.validationErrorMessage);
    }

    function allInputsValid(state) {
        return _.reduce(_.keys(state), function (result, field) {
            return field === 'notification' ? result : result && field;
        }, true);
    }

    function createValidInputCompState(state, fieldName, fieldValue) {
        var newState = {};
        var fieldState = state[fieldName];

        if (fieldState && fieldState.error) {
            newState[fieldName] = {
                error: true
            };
            if (allInputsValid(state)) {
                newState.notifications = {
                    error: false,
                    message: ""
                };
            }
        }
        newState[fieldName] = _.assign(newState[fieldName] || {}, {
            hidden: fieldState.hidden,
            required: fieldState.required,
            value: fieldValue
        });
        return newState;
    }

    function createInvalidInputCompState(fieldName, fieldState, errorMessage, validationErrorMessage) {
        var newState = {};

        newState[fieldName] = {
            error: true,
            hidden: fieldState.hidden,
            required: fieldState.required,
            value: fieldState.value
        };

        newState.notifications = {
            message: (fieldName === 'email' ? errorMessage : validationErrorMessage),
            error: true
        };

        return newState;
    }

    function onFormInputClick(event) {
        var fieldName = event.target.id.replace(this.props.id, '').replace('Field', '').toLowerCase();

        this.setState(_.assign(this.state[fieldName], {error: false}));
    }

    function onFormInputChange(event) {
        var fieldName = event.target.id.replace(this.props.id, '').replace('Field', '').toLowerCase();

        this.setState(_.assign(this.state[fieldName], {value: event.target.value}));
    }

    var CONTACT_FORM_KEYS = ["nameFieldLabel", "emailFieldLabel", "phoneFieldLabel", "addressFieldLabel", "subjectFieldLabel", "messageFieldLabel", "errorMessage", "successMessage", "validationErrorMessage"];

    function getDefaultData() {
        return _.merge(_.pick(this.translatedKeys, CONTACT_FORM_KEYS), {textDirection: 'left'});
    }

    function getDefaultProps() {
        return {
            "hidden_emailFieldLabel": true,
            "hidden_nameFieldLabel": true,
            "hidden_phoneFieldLabel": false,
            "hidden_addressFieldLabel": false,
            "hidden_subjectFieldLabel": true,
            "hidden_messageFieldLabel": true,
            "required_emailFieldLabel": true,
            "required_nameFieldLabel": true,
            "required_phoneFieldLabel": false,
            "required_addressFieldLabel": false,
            "required_subjectFieldLabel": false,
            "required_messageFieldLabel": false
        };
    }

    function getCompData() {
        return _.defaults(_.clone(this.props.compData), getDefaultData.call(this));
    }

    function getCompProps() {
        return _.isEmpty(this.props.compProp) ? getDefaultProps() : this.props.compProp;
    }

    function getCompNextProps(nextProps) {
        return _.isEmpty(nextProps.compProp) ? getDefaultProps() : nextProps.compProp;
    }

    function createFieldsCSSStates (compProp) {
        return _.reduce(FORM_INPUTS, function (result, inputName) {
            var isFieldHidden = !compProp[getFieldHidden(inputName)];
            result['$' + inputName] = isFieldHidden ? inputName + 'Hidden' : '';
            return result;
        }, {});
    }

    /**
     * @class components.ContactForm
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "ContactForm",
        mixins: [formCommon.formMixin],

        propTypes: {
            compData: santaProps.Types.Component.compData.isRequired,
            compProp: santaProps.Types.Component.compProp.isRequired
        },

        statics: {
            useSantaTypes: true
        },

        componentWillReceiveProps: function (nextProps) {
            var compProp = getCompProps.call(this);
            var nextCompProp = getCompNextProps(nextProps);
            var previousCSSStates = createFieldsCSSStates(compProp);
            var newCSSStates = createFieldsCSSStates(nextCompProp);

            if (!_.isEqual(previousCSSStates, newCSSStates)) {
                this.setState(newCSSStates);
            }
        },

        /*override*/
        getFormInitialState: function () {
            var compProp = getCompProps.call(this);
            var initialState = {
                mailSent: false
            };

            _.forEach(FORM_INPUTS.concat('notifications'), function (field) {
                initialState[field] = {
                    error: false,
                    hidden: !compProp[getFieldHidden(field)],
                    required: !!compProp[getFieldRequired(field)]
                };
            });

            initialState.notifications.message = '';
            var fieldsCSSStates = createFieldsCSSStates(compProp);
            return _.merge(initialState, fieldsCSSStates);
        },

        /*override*/
        getFormInputs: function () {
            return FORM_INPUTS;
        },

        /*override*/
        getActivityName: function () {
            return 'ContactFormActivity';
        },

        /*override*/
        getFormFields: function (nonEmptyOnly, originalFieldNames) {
            return _.reduce(FORM_INPUTS, function (result, inputName) {
                var compProp = getCompProps.call(this);
                var compData = getCompData.call(this);
                var isDisplayed = compProp[getFieldHidden(inputName)];
                if (isDisplayed) {

                    if ((nonEmptyOnly && this.state[inputName].value) || !nonEmptyOnly) {
                        result[originalFieldNames ? inputName : compData[inputName + 'FieldLabel']] = this.state[inputName].value || '';
                    }
                }
                return result;
            }, {}, this);
        },

        /*override*/
        getFieldsForActivityReporting: function () {
            return this.getFormFields(false, true);
        },

        /*override*/
        getFieldLabels: function () {
            var compData = getCompData.call(this);
            return _.reduce(FORM_INPUTS, function (result, inputName) {
               result[inputName] = compData[inputName + 'FieldLabel'];
               return result;
            }, {});
        },

        /*override*/
        isFormValid: function () {
            var state = this.state;
            var compData = getCompData.call(this);
            var newState = _.clone(state);

            var emailValue = this.state.email.value;
            var isEmailValid = validateField(state.email, 'email', emailValue);
            newState = getFormNewState(state, compData, 'email', emailValue, isEmailValid);

            var allFieldsValid;
            if (isEmailValid) {
                allFieldsValid = _.reduce(FORM_INPUTS, function (allFieldsAreValid, fieldName) {
                    var fieldValue = ReactDOM.findDOMNode(this.refs[fieldName + 'Field']).value;
                    var isValidField = validateField(state[fieldName], fieldName.toLowerCase(), fieldValue);
                    newState = _.assign(newState, getFormNewState(state, compData, fieldName, fieldValue, isValidField));
                    return allFieldsAreValid && isValidField;
                }, true, this);
            }


            this.setState(newState);
            return allFieldsValid;
        },

        /*override*/
        getInputName: function () {
          if (experiment.isOpen('sendContactFormEmailsViaPong')) {
            return this.state.name.value || null;
          }

          return this.state.name.value || 'n/a';
        },

        /*override*/
        getLangKeys: function (lang) {
            return utils.translations.contactFormTranslations[lang];
        },

        /*override*/
        getFormSkinProperties: function () {
            var skinProperties = {},
                compData = getCompData.call(this),
                compProp = getCompProps.call(this);

            //create all form inputs
            _.assign(skinProperties, _.zipObject(_.map(FORM_INPUTS, function (val) {
                return val + 'Field';
            }), _.map(FORM_INPUTS, function (inputName) {
                var fieldLabel = compData[getFieldLabel(inputName)];
                var fieldState = this.state[inputName];

                // TODO: hidden and required are calculated in getInitialState based on props -- this is antipattern and should be refactored
                // instead such fields should be calculated here at render phase
                var stateBasedOnProps = {
                    required: !!compProp[getFieldRequired(inputName)],
                    hidden: !compProp[getFieldHidden(inputName)]
                };
               _.merge(fieldState, stateBasedOnProps);

                return createFormInput.call(this, fieldLabel, fieldState, _.bind(onFormInputChange, this), _.bind(onFormInputClick, this));
            }, this)));

            //create all form inputs labels
            _.assign(skinProperties, _.zipObject(getLabelsNames(FORM_INPUTS), _.map(FORM_INPUTS, function (inputName) {
                return createFormLabels.call(this, inputName, compData, getCompProps.call(this));
            }, this)));

            //create notifications:
            _.assign(skinProperties, createFormNotifications.call(this, this.state.notifications));

            return skinProperties;
        }
    };
});
