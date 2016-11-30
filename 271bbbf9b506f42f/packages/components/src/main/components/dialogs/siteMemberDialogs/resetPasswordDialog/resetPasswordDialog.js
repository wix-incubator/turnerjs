define(['lodash', 'core', 'components/components/dialogs/dialogMixin', 'experiment'], function (_, /** core */ core, dialogMixin, experiment) {
    'use strict';

    /**
     * @class components.siteMembersDialogs.ResetPasswordDialog
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    return {
        displayName: "ResetPasswordDialog",
        mixins: [core.compMixins.skinBasedComp, dialogMixin],

        passwordInputRef: 'passwordInput',
        retypePasswordInputRef: 'retypePasswordInput',

        validateBeforeSubmit: function () {
            this.refs[this.passwordInputRef].validate();
            this.refs[this.retypePasswordInputRef].validate();

            if (!this.refs[this.passwordInputRef].isValid() || !this.refs[this.retypePasswordInputRef].isValid()) {
                return false;
            }

            if (this.refs[this.passwordInputRef].getValue() !== this.refs[this.retypePasswordInputRef].getValue()) {
                this.setErrorMessage('SMForm_Error_Password_Retype');
                return false;
            }

            return true;
        },

        getDefaultProps: function () {
            return {
                shouldNotClose: true
            };
        },

        getDataToSubmit: function () {
            return {
                forgotPasswordToken: this.props.siteData.currentUrl.query.forgotPasswordToken,
                newPassword: this.refs[this.passwordInputRef].getValue()
            };
        },

        getSkinProperties: function () {
            var lang = this.props.language;
            var isNewLoginScreens = experiment.isOpen('newLoginScreens');
            var titleText = this.getText(lang, "SMResetPassMail_title");
            var descriptionText = this.getText(lang, isNewLoginScreens ? "dialogMixinTranslations_RESET_PASSWORD_TEXT" : "SMResetPass_Message");
            var submitButtonText = this.getText(lang, "SMRegister_GO");
            var newPasswordText = this.getText(lang, 'SMResetPass_New_Password');
            var retypePasswordText = this.getText(lang, isNewLoginScreens ? 'dialogMixinTranslations_RESET_PASSWORD_NEWFIELD_RETYPE' : 'SMResetPass_Retype_Password');

            var errMsgText = this.getErrorMessage();
            var skin = {
                "blockingLayer": {},
                "title": {
                    children: titleText
                },
                "errMsg": {
                    children: errMsgText
                },
                "content": this.createContent(isNewLoginScreens)
            };


            var extraSkinParams;
            if (isNewLoginScreens) {
                extraSkinParams = {
                    "okButton": {
                        children: this.createSubmitButton('okButton', submitButtonText),
                        onClick: this.submit
                    },
                    "subtitle": {
                        children: descriptionText
                    },
                    "password": {
                        children: this._createPasswordField({placeholder: newPasswordText})
                    },
                    "retypePassword": {
                        children: this._createRetypePasswordField({placeholder:  retypePasswordText})
                    }
                };
            } else {
                extraSkinParams = {
                    "submitButton": {
                        children: submitButtonText,
                        onClick: this.submit
                    },
                    "description": {
                        children: descriptionText
                    },
                    "password": {
                        children: this._createPasswordField()
                    },
                    "retypePassword": {
                        children: this._createRetypePasswordField()
                    }
                };
            }
            _.merge(skin, extraSkinParams);
            return skin;
        },

        _createPasswordField: function (extraProps) {
            var passwordProperties = {
                refId: this.passwordInputRef,
                inputTitleKey: 'SMResetPass_New_Password',
                language: this.props.language
            };
            return this.createPasswordInput(passwordProperties, extraProps);
        },

        _createRetypePasswordField: function (extraProps) {
            var retypePasswordProperties = {
                refId: this.retypePasswordInputRef,
                inputTitleKey: 'SMResetPass_Retype_Password',
                language: this.props.language
            };
            return this.createPasswordInput(retypePasswordProperties, extraProps);
        }

    };
});
