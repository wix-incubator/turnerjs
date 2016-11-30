define.component('wysiwyg.common.components.subscribeform.editor.SubscribeFormPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.BaseComponentPanel');

    def.dataTypes(['SubscribeForm']);

    def.resources(['W.Resources', 'W.Data', 'W.Config', 'W.Utils']);

    def.skinParts({
        email: {
            type: Constants.PanelFields.Input.compType,
            argObject: {
                labelText: "SFORM_EMAIL_TO",
                placeholderText: "SFORM_EMAIL_PLACEHOLDER",
                minLength: 0,
                maxLength: 64,
                toolTip: {
                    toolTipId: "SForm_toEmailAddress",
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                }
            },
            hookMethod: '_addEmailValidator',
            bindToData: 'toEmailAddress'
        },
        bbcEmail: {
            type: Constants.PanelFields.Input.compType,
            argObject: {
                labelText: "SFORM_EMAIL_BBC",
                minLength: 0,
                maxLength: 64
            },
            hookMethod: '_addBCCValidator',
            bindToData: 'bccEmailAddress'
        },
        labelText: {
            type: Constants.PanelFields.Label.compType,
            argObject: {
                labelText: "SFORM_DASHBOARD_MESSAGE"
            }
        },
        changeStyle: {
            type: Constants.PanelFields.ButtonField.compType,
            argObject: {
                buttonLabel: 'CHOOSE_STYLE_TITLE'
            }
        },
        addAnimation: {
            type: Constants.PanelFields.ButtonField.compType
        },
        textDirectionLabel: {
            type: Constants.PanelFields.Label.compType,
            argObject: {
                labelText: "SFORM_TEXT_DIRECTION",
                toolTip: {
                    toolTipId: "SForm_textDerection",
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                }
            }
        },
        textDirectionField: {
            type: Constants.PanelFields.RadioImages.compType,
            argObject: {
                presetList: [
                    {value: 'left', image: 'radiobuttons/radio_button_states.png', dimensions: {w: '35px', h: '33px'}, icon: 'radiobuttons/alignment/left.png'},
                    {value: 'right', image: 'radiobuttons/radio_button_states.png', dimensions: {w: '35px', h: '33px'}, icon: 'radiobuttons/alignment/right.png'}
                ]
            },
            bindToData: 'textDirection'
        },
        customizeLabel: {
            type: Constants.PanelFields.Label.compType,
            argObject: {
                labelText: "SFORM_CUSTOMIZE_LABEL",
                toolTip: {
                    toolTipId: "SForm_requiredField",
                    addQuestionMark: true,
                    toolTipGetter: function () {
                        return this._skinParts.label;
                    }
                }
            }
        },
        customizeAnnotationAsterisk:{
            type: Constants.PanelFields.Label.compType,
            argObject:{
                labelText: 'SFORM_DESC_required',
                spriteSrc: 'icons/mandatory-single-icon.png',
                spriteSize: {width: '25px', height: '22px', 'margin-right': '5px'}
            }
        },
        firstNameFieldCheckBox: {
            type: Constants.PanelFields.CheckBox.compType,
            bindToProperty: 'hiddenFirstNameField',
            hideOnMobile: true
        },
        firstNameField:{
            type: Constants.PanelFields.Input.compType,
            argObject: {
                placeholderText: "SFORM_FIRSTNAME_FIELD_LABEL",
                minLength: 0,
                maxLength: 64
            },
            bindToData: 'firstNameFieldLabel',
            enabledCondition: function() {
                return this.enabledCondition('hiddenFirstNameField');
            }
        },
        firstNameFieldAsterisk: {
            type: Constants.PanelFields.CheckBoxImage.compType,
            argObject:{
                image: 'icons/required.png',
                dimensions: {w: '25px', h: '22px'}
            },
            bindToProperty: 'requiredFirstNameField',
            enabledCondition: function() {
                return this.enabledCondition('hiddenFirstNameField');
            },
            hideOnMobile: true
        },
        lastNameFieldCheckBox: {
            type: Constants.PanelFields.CheckBox.compType,
            bindToProperty: 'hiddenLastNameField',
            hideOnMobile: true
        },
        lastNameField:{
            type: Constants.PanelFields.Input.compType,
            argObject: {
                placeholderText: "SFORM_LASTNAME_FIELD_LABEL",
                minLength: 0,
                maxLength: 64
            },
            bindToData: 'lastNameFieldLabel',
            enabledCondition: function() {
                return this.enabledCondition('hiddenLastNameField');
            }
        },
        lastNameFieldAsterisk: {
            type: Constants.PanelFields.CheckBoxImage.compType,
            argObject:{
                image: 'icons/required.png',
                dimensions: {w: '25px', h: '22px'}
            },
            bindToProperty: 'requiredLastNameField',
            enabledCondition: function() {
                return this.enabledCondition('hiddenLastNameField');
            },
            hideOnMobile: true
        },
        emailFieldCheckBox: {
            type: Constants.PanelFields.CheckBox.compType,
            bindToProperty: 'hiddenEmailField',
            enabledCondition: function() { return false;},
            hideOnMobile: true
        },
        emailField:{
            type: Constants.PanelFields.Input.compType,
            argObject: {
                placeholderText: "SFORM_EMAIL_FIELD_LABEL",
                minLength: 0,
                maxLength: 64
            },
            bindToData: 'emailFieldLabel'
        },
        emailFieldAsterisk: {
            type: Constants.PanelFields.CheckBoxImage.compType,
            argObject:{
                image: 'icons/required.png',
                dimensions: {w: '25px', h: '22px'}
            },
            bindToProperty: 'requiredEmailField',
            enabledCondition: function() { return false;},
            hideOnMobile: true
        },
        phoneFieldCheckBox: {
            type: Constants.PanelFields.CheckBox.compType,
            bindToProperty: 'hiddenPhoneField',
            hideOnMobile: true
        },
        phoneField:{
            type: Constants.PanelFields.Input.compType,
            argObject: {
                placeholderText: "SFORM_PHONE_FIELD_LABEL",
                minLength: 0,
                maxLength: 64
            },
            bindToData: 'phoneFieldLabel',
            enabledCondition: function() {
                return this.enabledCondition('hiddenPhoneField');
            }
        },
        phoneFieldAsterisk: {
            type: Constants.PanelFields.CheckBoxImage.compType,
            argObject:{
                image: 'icons/required.png',
                dimensions: {w: '25px', h: '22px'}
            },
            bindToProperty: 'requiredPhoneField',
            enabledCondition: function() {
                return this.enabledCondition('hiddenPhoneField');
            },
            hideOnMobile: true
        },
        subscribeFormTitle: {
            type: Constants.PanelFields.TextArea.compType,
            argObject: {
                labelText: 'SFORM_FORM_TITLE',
                minLength: 2,
                maxLength: 256
            },
            bindToData: 'subscribeFormTitle',
            hookMethod: '_addEmptyFieldValidator'
        },
        buttonText: {
            type: Constants.PanelFields.TextArea.compType,
            argObject: {
                labelText: 'SFORM_BUTTON_TEXT',
                minLength: 2,
                maxLength: 64
            },
            bindToData: 'submitButtonLabel',
            hookMethod: '_addEmptyFieldValidator'
        },
        successMessage: {
            type: Constants.PanelFields.TextArea.compType,
            argObject: {
                labelText: 'SFORM_SUCCESS_MESSAGE',
                minLength: 2,
                maxLength: 256
            },
            bindToData: 'successMessage',
            hookMethod: '_addEmptyFieldValidator'
        },
        errorMessageEmail: {
            type: Constants.PanelFields.TextArea.compType,
            argObject: {
                labelText: 'SFORM_ERROR_MESSAGE',
                minLength: 2,
                maxLength: 256
            },
            bindToData: 'errorMessage',
            hookMethod: '_addEmptyFieldValidator'
        },
        errorMessageMandatory: {
            type: Constants.PanelFields.TextArea.compType,
            argObject: {
                labelText: 'SFORM_VALIDATION_MESSAGE',
                minLength: 2,
                maxLength: 256
            },
            bindToData: 'validationErrorMessage',
            hookMethod: '_addEmptyFieldValidator'
        }
    });

    def.methods({
        _onRender: function(){

        },

        enabledCondition: function(propertyField){
            return this._previewComponent.getComponentProperties().get(propertyField);
        },

        _addEmailValidator: function(definition){
            definition.argObject.validatorArgs = {
                validators: [this._emailValidator.bind(this)]
            };

            return definition;
        },

        _addBCCValidator
            : function(definition){
            definition.argObject.validatorArgs = {
                validators: [this._validateEmailOrLeaveBlank.bind(this)]
            };

            return definition;
        },

        _validateEmailOrLeaveBlank: function(text) {
            if(text !== '') {
                return this._emailValidator(text);
            }
        },

        _emailValidator: function(text){
            if (!this.resources.W.Utils.isValidEmail(text)) {
                return this._translate('SFORM_ERRORS_badMail');
            }
        },

        _addEmptyFieldValidator: function(definition){
            definition.argObject.validatorArgs = {validators: [this._emptyValidator.bind(this)]};
        },

        _emptyValidator: function(text){
            if(!text.length || text.length < 2) return this._translate('SFORM_ERRORS_emptyField');
        },

        _translate: function (key, fallback) {
            return this.resources.W.Resources.get('EDITOR_LANGUAGE', key, fallback);
        }
    });


});
