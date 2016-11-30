/** @class wysiwyg.viewer.components.sm.SMResetPasswordEmail */
define.component('wysiwyg.viewer.components.sm.SMResetPasswordEmail', function(componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition ;

    def.inherits('wysiwyg.viewer.components.sm.SMForm') ;

    def.resources(['W.Data', 'W.SiteMembers', 'W.Utils']) ;

    def.statics({
        CAPTIONS: {
            FORM_TITLE: "Reset Password",
            SUBMIT_BUTTON_LABEL: "GO",
            BACK_TO_LOGIN: "Back to Login",
            EMAIL_TITLE: "Please enter your email address",
            CONFIRMATION_TITLE: "Please check your email",
            CONFIRMATION_MSG: "We’ve sent you an email with a link that will allow you to reset your password"
        }
    }) ;

    def.skinParts({
        'email': {type:'wysiwyg.viewer.components.inputs.TextInput', hookMethod:"_bindEmailField"}
    }) ;

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args) ;
            this._enteredEmail = (args && args.formData && args.formData.enteredEmail) || "" ;
        },

        _onAllSkinPartsReady: function(){
            this._email = this._skinParts.email;
            this._updateEmailWithUserInput();
        },

        _updateEmailWithUserInput: function () {
            var dataItem = this._email.getDataItem();
            dataItem._data.text = this._enteredEmail;
            this._email.setDataItem(dataItem);
            this._email._skinParts.input.value = this._enteredEmail;
        },

        _getEmailInput: function () {
            return this._email._data.get("text");
        },

        onSubmit: function () {
            var email = this._getEmailInput();
            if (this._isEmailFieldValid(email)) {
                var siteMembers = this.resources.W.SiteMembers;
                siteMembers.sendUserPasswordResetEmail(email, this._onFormSuccess, this._onFormError);
            }
        },

        _isEmailFieldValid: function(email) {
            this._email.setValidationState(true);

            if (!email) {
                this._email.setValidationState(false);
                this._onFormError({errorCode: 'SMForm_Error_Email_Blank'}, this._email);
                return false;
            }
            else if (!this.resources.W.Utils.isValidEmail(email)) {
                this._email.setValidationState(false);
                this._onFormError({errorCode: 'SMForm_Error_Email_Invalid'}, this._email);
                return false;
            }

            return true;
        },

        _bindEmailField: function (definition) {
            definition.argObject = {
                label: this._keys["SMResetPassMail_Enter_Email"]
            };

            return this._bindTextDataItem(definition);
        },

        _onFormSuccess: function( data ) {
            this._closeAndRedirectToConfirmationDialog();
        },

        _closeAndRedirectToConfirmationDialog: function () {
            this._container.showConfirmation({
                    title:  this._keys["SMResetPassMail_confirmation_title"],
                    message:  this._keys["SMResetPassMail_confirmation_msg"] }
                , this._closeSMContainer) ;
        },

        onCancel: function() {
            this.reportAuthStatusChange(false, { cancel: true });
        },

        getDisplayName: function() {
            return this._keys["SMResetPassMail_title"];
        },

        getButtonLabel: function() {
            return  this._keys["SMRegister_GO"];
        },

        getSubHeaderElement: function() {
            var div = new Element('DIV');

            var backToLogin = this._keys["SMResetPassMail_Back_Login"];
            div.set("html", "<a>" + backToLogin + "</a>");
            return {
                el: div,
                intent: this.INTENTS.LOGIN,
                formData: {enteredEmail: function() {
                    this._email._data.get("text");}.bind(this)
                }
            };
        }
    }) ;
});