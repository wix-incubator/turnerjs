define(['lodash', 'core', 'components/components/dialogs/dialogMixin', 'experiment'], function (_, /** core */ core, dialogMixin, experiment) {
    'use strict';

    /**
     * @class components.siteMembersDialogs.SignUpDialog
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @extends {core.postMessageCompMixin}
     * @property {comp.properties} props
     */
    return {
        displayName: "SignUpDialog",
        mixins: [core.compMixins.skinBasedComp, core.compMixins.postMessageCompMixin, dialogMixin],

        passwordInputRef: 'passwordInput',
        retypePasswordInputRef: 'retypePasswordInput',
        emailInputRef: 'emailInput',
        socialHolderRef: 'socialHolder',

        validateBeforeSubmit: function () {
            this.refs[this.emailInputRef].validate();
            this.refs[this.passwordInputRef].validate();
            this.refs[this.retypePasswordInputRef].validate();

            if (!this.refs[this.emailInputRef].isValid() || !this.refs[this.passwordInputRef].isValid() || !this.refs[this.retypePasswordInputRef].isValid()) {
                return false;
            }

            if (this.refs[this.passwordInputRef].getValue() !== this.refs[this.retypePasswordInputRef].getValue()) {
                this.setErrorMessageByCode('SMForm_Error_Password_Retype');
                return false;
            }

            return true;
        },

        getDataToSubmit: function () {
            return {
                email: this.refs[this.emailInputRef].getValue(),
                password: this.refs[this.passwordInputRef].getValue()
            };
        },

        getSkinProperties: function () {
            if (this.shouldDialogBeClosed()) {
                return this.getCloseDialogSkinProperties();
            }

            var isNewLoginScreens = experiment.isOpen('newLoginScreens');
            var isSocialLogin = this.isSocialLogin();
            var lang = this.props.language;
            var infoTitleText = this.getText(lang, "SMContainer_Need_Log_In");
            var noteText = this.getText(lang, "SMRegister_Already_Have_User") + ",";
            var cancelButtonText = this.getText(lang, "SMContain_Cancel");
            var titleText = this.getText(lang, "SMRegister_sign_up");
            var submitButtonText = this.getText(lang, "SMRegister_GO");
            var switchDialogLinkText = this.getText(lang, isNewLoginScreens ? "dialogMixinTranslations_Log_In" : "SMRegister_Login");
            var errMsgText = this.getErrorMessage();

            var skin = {
                "blockingLayer": {},
                "infoTitle": {
                    children: this.props.needLoginMessage ? infoTitleText : ""
                },
                "note": {
                    children: noteText
                },
                "switchDialogLink": {
                    children: switchDialogLinkText,
                    onClick: this._onSwitchDialogLinkClick
                },
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
                    "email": {
                        children: this._createEmailField({placeholder:  this.getText(lang, 'SMForm_Email')})
                    },
                    "password": {
                        children: this._createPasswordField({placeholder:  this.getText(lang, 'PasswordLogin_Password')})
                    },
                    "retypePassword": {
                        children: this._createRetypePasswordField({placeholder:  this.getText(lang, 'SMForm_Retype_Password')})
                    },
                    "contentWrapper" : {
                        className : this.props.styleId + '_' + (isSocialLogin ? 'horizontal' : 'vertical') + ' ' +
                        this.props.styleId + '_' + (isSocialLogin ? this.getMobileSocialLoginClass() : '')
                    }
                };
                _.assign(extraSkinParams, isSocialLogin ? this.getSocialLoginSkinParts('signup', lang, {
                    google : 'dialogMixinTranslations_signup_google',
                    facebook : 'dialogMixinTranslations_signup_facebook',
                    switchEmail : 'dialogMixinTranslations_signup_switch_email'
                }) : {});
            } else {
                extraSkinParams = {
                    "submitButton": {
                        children: submitButtonText,
                        onClick: this.submit
                    },
                    "email": {
                        children: this._createEmailField()
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
            if (!this.props.notClosable){
                var closeableSkinProperties = {
                    "blockingLayer": isNewLoginScreens ? {} : {onClick: this.closeDialog},
                    "cancel": {
                        children: cancelButtonText,
                        onClick: this.closeDialog
                    },
                    "xButton": this.createXButton()
                };
                _.merge(skin, closeableSkinProperties);
            }

            return skin;
        },

        _onSwitchDialogLinkClick: function () {
            this.props.onSwitchDialogLinkClick();
        },

        _createEmailField: function (extraProps) {
            var emailProperties = {
                refId: this.emailInputRef,
                inputTitleKey: 'SMForm_Email',
                language: this.props.language
            };
            return this.createEmailInput(emailProperties, extraProps);
        },

        _createPasswordField: function (extraProps) {
            var passwordProperties = {
                refId: this.passwordInputRef,
                inputTitleKey: 'SMForm_Password',
                language: this.props.language
            };

            return this.createPasswordInput(passwordProperties, extraProps);
        },

        _createRetypePasswordField: function (extraProps) {
            var retypePasswordProperties = {
                refId: this.retypePasswordInputRef,
                inputTitleKey: 'SMForm_Retype_Password',
                language: this.props.language
            };
            return this.createPasswordInput(retypePasswordProperties, extraProps);
        },

        componentDidMount: function () {
            this.setPostMessageHandler('wix-social-login', this.onSocialLoginIframeMessage);
        }

    };
});
