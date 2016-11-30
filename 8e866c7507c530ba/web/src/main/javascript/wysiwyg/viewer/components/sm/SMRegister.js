/** @type wysiwyg.viewer.components.sm.SMRegister */
define.component('wysiwyg.viewer.components.sm.SMRegister', function(componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition ;

    def.inherits('wysiwyg.viewer.components.sm.SMForm') ;

    def.resources(['W.SiteMembers', 'W.Utils']) ;

    def.utilize(['wysiwyg.viewer.components.sm.SMFormValidationHelper']) ;

    def.skinParts({
        'email': { type:'wysiwyg.viewer.components.inputs.TextInput',  hookMethod:"_bindEmailField"},
        'password': { type:'wysiwyg.viewer.components.inputs.TextInput',  hookMethod:"_bindPasswordField"},
        're_password': { type:'wysiwyg.viewer.components.inputs.TextInput', hookMethod:"_bindRePasswordField"}
    }) ;

    def.methods({
        _onAllSkinPartsReady: function(){
            this._emailField = this._skinParts.email;
            this._passwordField = this._skinParts.password;
            this._rePasswordField = this._skinParts.re_password;
        },

        _getEmailInputText: function () {
            return this._emailField._data.get("text");
        },

        _getPasswordInputText: function () {
            return this._passwordField._data.get("text");
        },

        _getRetypedPasswordInputText: function () {
            return this._rePasswordField._data.get("text");
        },

        _validateFields: function(email, password, rePassword) {
            var validator       = new this.imports.SMFormValidationHelper();

            var isEmailValid    = this._validateEmail(validator, email) ;
            var isPasswordValid = this._validatePassword(validator, password, rePassword) ;

            return isEmailValid && isPasswordValid ;
        },

        _validateEmail: function(validator, email) {
            if (validator.isEmailBlank(email)) {
                this._displayErrorOn(this._emailField, 'SMForm_Error_Email_Blank') ;
                return false;
            } else if( !validator.isEmailValid(email) ) {
                this._displayErrorOn(this._emailField, 'SMForm_Error_Email_Invalid') ;
                return false;
            }
            return true ;
        },

        _validatePassword: function(validator, password, rePassword) {
            if (validator.isBlankPassword(password)) {
                this._displayErrorOn(this._passwordField, 'SMForm_Error_Password_Blank') ;
                return false ;
            } else if( !validator._isAsciiOnlyInput(password) ){
                this._displayErrorOn(this._passwordField, 'SMForm_Error_Non_Ascii_Chars') ;
                return false ;
            } else if( !validator.isPasswordLengthValid(password) ) {
                this._displayErrorOn(this._passwordField, 'SMForm_Error_Password_Length' ,[this.PASS_MIN_LEN, this.PASS_MAX_LEN]) ;
                return false ;
            } else if( !validator.doPasswordsMatch(password, rePassword) ) {
                this._displayErrorOn(this._rePasswordField, 'SMForm_Error_Password_Retype') ;
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
            this.closeAndRedirect();
        },

        onCancel: function() {
            this.reportAuthStatusChange(false, { cancel: true });
        },

        getDisplayName: function() {
            return this._keys["SMRegister_sign_up"];
        },

        getButtonLabel: function() {
            return this._keys["SMRegister_GO"];
        },

        getSubHeaderElement: function() {
            var div = new Element('DIV');
            div.set("html", this._keys["SMRegister_Already_Have_User"]+", <a>"+ this._keys["SMRegister_Login"] + "</a>");
            return { el: div, intent: this.INTENTS.LOGIN};
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
            var rePassword = this._rePasswordField._data.get("text");

            if (this._validateFields (email, password, rePassword)) {
                password = this.resources.W.Utils.encodeValue(password) ;
                var initiator = this._getInitiator();
                if (initiator) {
                    this.resources.W.SiteMembers.register( email, password, this._onFormSuccess, this._onFormError, initiator);
                } else {
                    this.resources.W.SiteMembers.register( email, password, this._onFormSuccess, this._onFormError);
                }
            }
        }

    }) ;
});