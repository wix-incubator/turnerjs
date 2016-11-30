/** @type wysiwyg.viewer.components.sm.SMLogin */
define.component('wysiwyg.viewer.components.sm.SMLogin', function(componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition ;

    def.inherits('wysiwyg.viewer.components.sm.SMForm') ;

    def.resources(['W.Data', 'W.SiteMembers', 'W.Utils']) ;

    def.skinParts({
        'email': { type:'wysiwyg.viewer.components.inputs.TextInput',  hookMethod:"_bindEmailField"},
        'password': { type:'wysiwyg.viewer.components.inputs.TextInput',  hookMethod:"_bindPasswordField"},
        'rememberMe': { type:'wysiwyg.viewer.components.inputs.CheckBoxInput',  hookMethod:"_bindCheckBoxDataItem"},
        'forgotPass': {type: 'htmlElement'}
    });

    def.utilize(['wysiwyg.viewer.components.sm.SMFormValidationHelper']) ;

    def.statics({
        CAPTIONS: {
            FORGOT_PASSWORD: "Forgot your password?",
            LOGIN: "Login",
            GO: "GO",
            SIGN_UP: "Or {0}Sign up{1}"
        }
    }) ;

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args) ;
            this._formData = args && args.formData ;
            this._initEnteredEmail();
        },

        _initEnteredEmail: function () {
            this._enteredEmail = (this._formData && this._formData.enteredEmail) || "" ;
        },

        _onAllSkinPartsReady: function(){
            this._emailField = this._skinParts.email;
            this._passwordField = this._skinParts.password;
            this._rememberMeField = this._skinParts.rememberMe;
            this._forgotPasswordField = this._skinParts.forgotPass ;
            this._forgotPasswordField.innerHTML = this._keys["SMLogin_Forgot_Password"];
            this._forgotPasswordField.addEvent("click", function() {
                this._closeAndRedirectToEmailReset() ;
            }.bind(this)) ;
            this._updateEmailWithUserInput() ;
        },

        _updateEmailWithUserInput: function () {
            var dataItem = this._emailField.getDataItem();
            dataItem._data.text = this._enteredEmail;
            this._emailField.setDataItem(dataItem);
            this._emailField._skinParts.input.value = this._enteredEmail;
        },

        _closeAndRedirectToEmailReset: function() {
            this.resources.W.SiteMembers.openSiteMembersPopup({
                'intent': this.INTENTS.EMAIL_RESET_PASSWORD,
                formData: {enteredEmail: this._getEnteredEmail()},
                'dialogsLanguage':this._container._args.dialogsLanguage
            }) ;
        },

        _getEnteredEmail: function() {
            return this._emailField._data.get("text") ;
        },

        _getInitiator: function() {
            if (this._container._previousContainer && this._container._previousContainer.initiator) {
                return this._container._previousContainer.initiator;
            }

            return this._container._args.initiator;
        },

        onSubmit: function () {
             var email = this._emailField._data.get("text");
             var password = this._passwordField._data.get("text");
             var rememberMe = this._rememberMeField._data.get("value");

             if (this._validateFields( email, password)) {
                 var initiator = this._getInitiator();
                this.resources.W.SiteMembers.login( email, password, rememberMe, this._onFormSuccess, this._onFormError, initiator);
             }
        },

        _resetFieldsValidationState: function () {
            this._passwordField.setValidationState(true);
            this._emailField.setValidationState(true);
        },

        _validateFields: function(email, password) {
            var validator       = new this.imports.SMFormValidationHelper();

            var isEmailValid    = this._validateEmail(validator, email) ;
            var isPasswordValid = this._validatePassword(validator, password) ;

            return isEmailValid && isPasswordValid ;
        },

        _validateEmail: function(validator, email) {
            if (validator.isEmailBlank(email)) {
                this._displayErrorOn(this._emailField, 'SMForm_Error_Email_Blank') ;
                return false;
            } else if(!validator.isEmailValid(email)) {
                this._displayErrorOn(this._emailField, 'SMForm_Error_Email_Invalid') ;
                return false;
            }
            return true ;
        },

        _validatePassword: function(validator, password) {
            if (validator.isBlankPassword(password)) {
                this._displayErrorOn(this._passwordField, 'SMForm_Error_Password_Blank') ;
                return false ;
            } else if( !validator.isPasswordLengthValid(password) ) {
                this._displayErrorOn(this._passwordField, 'SMForm_Error_Password_Length' ,[this.PASS_MIN_LEN, this.PASS_MAX_LEN]) ;
                return false ;
            }
            return true ;
        },

        _displayErrorOn: function(field, errorCode, errorParams) {
            field.setValidationState(false);
            this._onFormError({'errorCode': errorCode, 'errorParams': errorParams}, field);
        },

        _onFormSuccess: function( data ) {
//             this.reportAuthStatusChange(true, data); // <-- This could be used when token will be received without refresh of page
            var url = this._removeResetForgotPasswordParameterIfExists() ;
            this._container.closeAndRedirectTo(url);
            LOG.reportEvent(wixEvents.WEBMASTER_LOGIN_SUCCESS, {c1:data.attributes.name});
        },

        _removeResetForgotPasswordParameterIfExists: function() {
            var url = window.location.href ;
            if(url.indexOf(this.resources.W.SiteMembers.RESET_PASSWORD_KEY_PARAMETER) >= 0) {
                return this._removeParameterFromUrl(url, this.resources.W.SiteMembers.RESET_PASSWORD_KEY_PARAMETER) ;
            }
            return url ;
        },

        _removeParameterFromUrl: function(url, parameterToRemove) {
            if(url && parameterToRemove) {
                var paramBeginIndex = url.indexOf(parameterToRemove) ;
                if(paramBeginIndex >= 0) {
                    var paramEndIndex = url.substr(paramBeginIndex).indexOf("&") ;
                    if(paramEndIndex < 0) {
                        paramEndIndex = url.length ;
                    }
                    return url.slice(0, paramBeginIndex) + url.slice(paramBeginIndex + paramEndIndex + "&".length) ;
                }
            }
            return url ;
        },

        onCancel: function() {
            this.reportAuthStatusChange(false, { cancel: true });
        },

        getDisplayName: function() {
            return this._keys["SMLogin_Login"];
        },

        getButtonLabel: function() {
            return this._keys["SMRegister_GO"];
        },

        getSubHeaderElement: function() {
            var div = new Element('DIV');

            var signUpLabel = this._keys["SMLogin_Sign_UP"];
            signUpLabel = this._formatString(signUpLabel, ["<a>", "</a>"]) ;
            div.set("html", signUpLabel);
            return { el: div, intent: this.INTENTS.REGISTER};
        },

        _formatString: function(stringToFormat, argumentsArray) {
            var i = 0;
            argumentsArray.map(function(item){
                var hook = "{" + i + "}" ;
                stringToFormat = stringToFormat.replace(hook, item) ;
                i++ ;
            }) ;
            return stringToFormat ;
        },

        _bindCheckBoxDataItem: function(definition) {
            definition.dataItem = this.resources.W.Data.createDataItem({'value': 'false', 'type':'Boolean'}, 'Boolean');
            definition.dataItem.setMeta('isPersistent', false);
            definition.argObject = { "label" : this._keys["SMLogin_Remember_Me"]};
            return definition;
        }
    }) ;
});