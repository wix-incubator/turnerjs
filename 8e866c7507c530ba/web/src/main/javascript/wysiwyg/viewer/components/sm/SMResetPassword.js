/** @class wysiwyg.viewer.components.sm.SMResetPassword */
define.component('wysiwyg.viewer.components.sm.SMResetPassword', function(componentDefinition) {

        /** @type core.managers.component.ComponentDefinition */
        var def = componentDefinition ;

        def.inherits('wysiwyg.viewer.components.sm.SMForm') ;

        def.binds(['_onSuccessfulReset', '_onFailedReset']) ;

        def.resources(['W.SiteMembers']) ;

        def.skinParts({
            'formMessage': {type: 'htmlElement'},
            'password': {type: 'wysiwyg.viewer.components.inputs.TextInput', hookMethod: "_bindNewPasswordField"},
            'passwordRetype': {type: 'wysiwyg.viewer.components.inputs.TextInput', hookMethod: "_bindPasswordRetypeField"}
        }) ;

        def.statics({
            CAPTIONS: {
                RESET_PASSWORD_MESSAGE: "To set your new password, please enter it in both fields below. ",
                ENTER_NEW_PASSWORD: "Enter a new password:",
                RETYPE_PASSWORD: "Type again:",
                FORM_TITLE: "Reset Password",
                SUBMIT_BUTTON_LABEL: "GO",
                CONFIRMATION_BUTTON_CAPTION: "Continue"
            },
            MESSAGES: {
                RESET_SUCCESS: "You’ve successfully reset your password.",
                RESET_FAILED: "Password could not have been changed. Try again later."
            }
        }) ;

        def.methods({
            _onAllSkinPartsReady: function() {
                this._formMessage = this._skinParts.formMessage ;
                this._password = this._skinParts.password;
                this._passwordRetype = this._skinParts.passwordRetype;

                this._formMessage.innerText = this._keys["SMResetPass_Message"];
            },

            onSubmit: function () {
                // set validation state of input fields.
                this._password.setValidationState(true);
                this._passwordRetype.setValidationState(true);
                // get entered password
                var enteredPassword = this._getPasswordText() ;
                // validate & submit
                if (this._validatePasswordAndReportError(enteredPassword)) {
                    if(this._doPasswordsMatch()) {
                        this._resetPassword();
                    } else {
                        this._passwordRetype.setValidationState(false);
                    }
                } else {
                    this._password.setValidationState(false);
                }
            },

            _resetPassword: function() {
                var password = this._getPasswordText() ;
                var siteMembers = this.resources.W.SiteMembers ;
                siteMembers.resetPassword(password, this._onSuccessfulReset, this._onFailedReset) ;
            },

            _getCurrentSearchURL: function() {
                return window.location.search ;
            },

            _onSuccessfulReset: function() {
                this._container._setConfirmationOkCaption(this._keys["SMResetPass_Continue"]) ;
                this._container.showConfirmation({message: this._keys["SMResetPass_Reset_Succ"]},
                    this._closeAndRedirectToLogin(), false) ;
            },

            _closeAndRedirectToLogin: function() {
                var self = this ;
                return function() {
                    self.resources.W.SiteMembers.openSiteMembersPopup({
                        'intent': self.INTENTS.LOGIN
                    }) ;
                };
            },

            _onFailedReset: function() {
                this._container.showConfirmation(this._keys["SMResetPass_Reset_Fail"],
                    this._closeSMContainer) ;
            },

            _validatePasswordAndReportError: function(password) {
                if (this._isPasswordBlank(password)) {
                    this._onFormError( { errorCode: 'SMForm_Error_Password_Blank' }, this._password);
                    return false;
                } else if (!this._isPasswordLengthValid(password)) {
                    this._onFormError({
                        errorCode: 'SMForm_Error_Password_Length',
                        errorParams: [this.PASS_MIN_LEN, this.PASS_MAX_LEN] }, this._password);
                    return false;
                }
                return true;
            },

            _isPasswordBlank: function(passwordToValidate) {
                if (passwordToValidate === null || passwordToValidate === undefined || passwordToValidate === "") {
                    return true ;
                }
                return false ;
            },

            _isPasswordLengthValid: function(passwordToValidate) {
                if (passwordToValidate.length < this.PASS_MIN_LEN || passwordToValidate.length > this.PASS_MAX_LEN ) {
                    return false ;
                }
                return true ;
            },

            _doPasswordsMatch: function() {
                var password        = this._getPasswordText() ;
                var retypedPassword = this._getRetypedPasswordText() ;

                if(password !== retypedPassword){
                    this._onFormError({errorCode: 'SMForm_Error_Password_Retype'}, this._passwordRetype);
                    return false;
                }
                return true ;
            },


            _getPasswordText: function () {
                return this._password._data.get("text");
            },

            _getRetypedPasswordText: function () {
                return this._passwordRetype._data.get("text");
            },

            onCancel: function() {
                this.reportAuthStatusChange(false, { cancel: true });
            },

            getDisplayName: function() {
                return this._keys["SMResetPassMail_title"];
            },

            getButtonLabel: function() {
                return this._keys["SMRegister_GO"];
            },

            getSubHeaderElement: function() {
                return null ;
            },

            _bindNewPasswordField: function (definition) {
                return this._bindPasswordField(definition, this._keys["SMResetPass_New_Password"]) ;
            },

            _bindPasswordRetypeField: function (definition) {
                return this._bindPasswordField(definition,this._keys["SMResetPass_Retype_Password"]) ;
            },

            _bindPasswordField: function (definition, fieldLabel) {
                definition.argObject = {
                    label: fieldLabel,
                    passwordField: true
                };

                return this._bindTextDataItem(definition);
            }
        }) ;
    }
);