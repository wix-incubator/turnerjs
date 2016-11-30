define([
    'lodash',
    'core',
    'components/components/dialogs/dialogMixin',
    'reactDOM',
    'experiment'
], function(_, /** core */ core, dialogMixin, ReactDOM, experiment) {
    'use strict';

    /**
     * @class components.siteMembersDialogs.MemberLoginDialog
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @extends {core.postMessageCompMixin}
     * @property {comp.properties} props
     */
    return {
        displayName: "MemberLoginDialog",
        mixins: [core.compMixins.skinBasedComp, core.compMixins.postMessageCompMixin, dialogMixin],

        passwordInputRef: 'passwordInput',
        emailInputRef: 'emailInput',
        socialHolderRef: 'socialHolder',

        validateBeforeSubmit: function () {
            this.refs[this.emailInputRef].validate();
            this.refs[this.passwordInputRef].validate();

            return this.refs[this.emailInputRef].isValid() && this.refs[this.passwordInputRef].isValid();
        },

        getDataToSubmit: function () {
            return {
                email: this.refs[this.emailInputRef].getValue(),
                password: this.refs[this.passwordInputRef].getValue(),
                rememberMe: ReactDOM.findDOMNode(this.refs.rememberMeCheckbox).checked
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
            var noteText = this.getText(lang, "SMLogin_OR");
            var cancelButtonText = this.getText(lang, "SMContain_Cancel");
            var titleText = this.getText(lang, isNewLoginScreens ? "dialogMixinTranslations_Log_In_Title" : "SMRegister_Login");
            var submitButtonText = this.getText(lang, "SMRegister_GO");
            var switchDialogLinkText = this.getText(lang, "SMRegister_sign_up");
            var rememberMeText = this.getText(lang, "SMLogin_Remember_Me");
            var newKey = (this.props.siteData.isMobileView() ? "dialogMixinTranslations_forgot_password_mobile" : "dialogMixinTranslations_forgot_password");
            var forgotYourPasswordText = this.getText(lang, isNewLoginScreens ? newKey : "SMLogin_Forgot_Password");
            var switchToSignUpText = this.getText(lang, "dialogMixinTranslations_switch_to_signup") + ' ';

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
                "content": this.createContent(isNewLoginScreens),
                "rememberMeCheckboxLabel": {
                    children: rememberMeText
                },
                "forgotYourPasswordLink": {
                    children: forgotYourPasswordText,
                    onClick: this._onForgotYourPasswordClick
                },
                "switchToSignUpText" : {
                    children: switchToSignUpText
                }
            };
            var extraSkinParams;
            if (isNewLoginScreens) {
                extraSkinParams = {
                    "password": {
                        children: this._createPasswordField({placeholder: this.getText(lang, 'PasswordLogin_Password'), asyncErrorMessage : errMsgText})
                    },
                    "email": {
                        children: this._createEmailField({placeholder: this.getText(lang, 'SMForm_Email')})
                    },
                    "okButton": {
                        children: this.createSubmitButton('okButton', submitButtonText),
                        onClick: this.submit
                    },
                    "forgotYourPasswordLinkMobile": {
                        children: forgotYourPasswordText,
                        onClick: this._onForgotYourPasswordClick
                    },
                    "contentWrapper" : {
                        className : this.props.styleId + '_' + (isSocialLogin ? 'horizontal' : 'vertical') + ' ' +
                        this.props.styleId + '_' + (isSocialLogin ? this.getMobileSocialLoginClass() : '')
                    }
                };
                _.assign(extraSkinParams, isSocialLogin ? this.getSocialLoginSkinParts('login', lang, {
                    google : 'dialogMixinTranslations_login_google',
                    facebook : 'dialogMixinTranslations_login_facebook',
                    switchEmail : 'dialogMixinTranslations_login_switch_email'
                }) : {});
            } else {
                extraSkinParams = {
                    "password": {
                        children: this._createPasswordField()
                    },
                    "email": {
                        children: this._createEmailField()
                    },
                    "submitButton": {
                        children: submitButtonText,
                        onClick: this.submit
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

        _onForgotYourPasswordClick: function () {
            this.props.onForgetYourPasswordClick();
        },

        _createEmailField: function (extraProps) {
            var emailProperties = {
                refId: this.emailInputRef,
                inputTitleKey: 'SMForm_Email',
                language: this.props.language,
                defaultValue: this.props.defaultEmail
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
        
        componentDidMount: function () {
            this.setPostMessageHandler('wix-social-login', this.onSocialLoginIframeMessage);
        }
        
    };
});
