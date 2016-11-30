define(['lodash', 'core', 'components/components/dialogs/dialogMixin', 'experiment'], function (_, /** core */ core, dialogMixin, experiment) {
    'use strict';

    /**
     * @class components.siteMembersDialogs.RequestPasswordResetDialog
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    return {
        displayName: "RequestPasswordResetDialog",
        mixins: [core.compMixins.skinBasedComp, dialogMixin],

        emailInputRef: 'emailInput',

        validateBeforeSubmit: function () {
            this.refs[this.emailInputRef].validate();
            return this.refs[this.emailInputRef].isValid();
        },

        getDataToSubmit: function () {
            return {
                email: this.refs[this.emailInputRef].getValue()
            };
        },

        getSkinProperties: function () {

            if (this.shouldDialogBeClosed()) {
                return this.getCloseDialogSkinProperties();
            }

            var lang = this.props.language;
            var cancelButtonText = this.getText(lang, "SMContain_Cancel");
            var titleText = this.getText(lang, "SMResetPassMail_title");
            var submitButtonText = this.getText(lang, "SMRegister_GO");
            var switchDialogLinkText = this.getText(lang, "SMResetPassMail_Back_Login");
            var pleaseEnterEmailText = this.getText(lang, "SMResetPassMail_Enter_Email");
            var errMsgText = this.getErrorMessage();

            var skin = {
                "blockingLayer": {},
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

            var isNewLoginScreens = experiment.isOpen('newLoginScreens');
            var extraSkinParams;
            if (isNewLoginScreens) {
                extraSkinParams = {
                    "okButton": {
                        children: this.createSubmitButton('okButton', submitButtonText),
                        onClick: this.submit
                    },
                    "subtitle" : {
                        children: pleaseEnterEmailText
                    },
                    "email": {
                        children: this._createEmailInput({placeholder:  this.getText(lang, 'SMForm_Email')})
                    }
                };
            } else {
                extraSkinParams = {
                    "submitButton": {
                        children: submitButtonText,
                        onClick: this.submit
                    },
                    "email": {
                        children: this._createEmailInput()
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

        _createEmailInput: function (extraProps) {
            var emailProperties = {
                refId: this.emailInputRef,
                inputTitleKey: 'SMResetPassMail_Enter_Email',
                language: this.props.language,
                defaultValue: this.props.defaultEmail
            };
            return this.createEmailInput(emailProperties, extraProps);
        }

    };
});
