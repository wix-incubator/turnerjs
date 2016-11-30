define(['core', 'components/components/dialogs/dialogMixin', 'lodash', 'experiment'], function (/** core */ core, dialogMixin, _, experiment) {
    'use strict';
    
    /**
     * @class components.siteMembersDialogs.EnterPasswordDialog
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    return {
        displayName: 'EnterPasswordDialog',
        mixins: [core.compMixins.skinBasedComp, dialogMixin],

        passwordInputRef: 'passwordInput',

        validateBeforeSubmit: function () {
            return this.refs[this.passwordInputRef].validate();
        },

        getDataToSubmit: function () {
            // digestedPassword not provided => password validation is performed from outside (user API for example)
            return this.props.digestedPassword ? {} : {password: this.refs[this.passwordInputRef].getValue()};
        },

        getSkinProperties: function () {
            var isNewLoginScreens = experiment.isOpen('newLoginScreens');

            var titleText = this.getText(this.props.language, 'PasswordLogin_Header');
            var submitButtonText = this.getText(this.props.language, isNewLoginScreens ? 'SMRegister_GO' : 'PasswordLogin_Submit');
            var favIconProps = this._getFavIconProps();
            var errMsgText = this.getErrorMessage();

            var skin = {
                blockingLayer: {},
                "favIconLink": favIconProps.link,
                "favIconImg": favIconProps.image,
                "errMsg": {
                    children: errMsgText
                },
                "content": this.createContent(isNewLoginScreens)
            };

            var extraSkinParams;
            if (isNewLoginScreens) {
                extraSkinParams = {
                    "subtitle": {
                        children: this.getText(this.props.language, 'dialogMixinTranslations_GUEST_LOGIN_SUBTITLE')
                    },
                    "title": {
                        children: this.getText(this.props.language, 'dialogMixinTranslations_GUEST_LOGIN_TITLE')
                    },
                    "okButton": {
                        children: this.createSubmitButton('okButton', submitButtonText),
                        onClick: this.submit
                    },
                    "password": {
                        children: this._createPasswordField({placeholder:  this.getText(this.props.language, 'PasswordLogin_Password')})
                    }
                };
            } else {

                extraSkinParams = {
                    "submitButton" : {
                        children: submitButtonText,
                        onClick: this.submit
                    },
                    "title": {
                        children: titleText
                    },
                    "password": {
                        children: this._createPasswordField()
                    }
                };
            }
            _.merge(skin, extraSkinParams);


            if (!this.props.notClosable){
                var closeableSkinProperties = {
                    "blockingLayer": isNewLoginScreens ? {} : {onClick: this.closeDialog},
                    "cancel": this._createCancelProps(),
                    "xButton": this.createXButton()
                };
                _.merge(skin, closeableSkinProperties);
            }

            return skin;
        },

        _validatePassword: function (password) {
            if (!password) {
                return this.getText(this.props.language, 'SMForm_Error_Password_Blank');
            }
            return false;
        },

        /**
         *
         * @returns {*}
         * @private
         */
        _createPasswordField: function (extraProps) {
            var passwordProperties = {
                refId: this.passwordInputRef,
                inputTitleKey: 'PasswordLogin_Password',
                language: this.props.language,
                overrideValidators: [this._validatePassword]
            };
            return this.createPasswordInput(passwordProperties, extraProps);
        },

        /**
         *
         * @returns {{alt: *, width: number, height: number}}
         * @private
         */
        _getFavIconProps: function () {
            var favIconProps = {
                image: {
                    alt: this.getText(this.props.language, 'PasswordLogin_AdministratorLogin'),
                    width: 16,
                    height: 16
                },
                link: {}
            };

            var siteData = this.props.siteData;
            if (siteData.isPremiumUser()) {
                var favIconUri = siteData.getFavicon();
                favIconProps.image.src = favIconUri ?
                    siteData.getMediaFullStaticUrl(favIconUri) :
                    (siteData.getStaticThemeUrlWeb() + '/viewer/blank-favicon.png');
            } else {
                favIconProps.image.src = 'http://www.wix.com/favicon.ico';
                favIconProps.link.href = 'http://www.wix.com';
            }

            return favIconProps;
        },

        /**
         *
         * @returns {{children: *, onClick: closeDialog}}
         * @private
         */
        _createCancelProps: function () {
            var cancelButtonText = this.getText(this.props.language, 'PasswordLogin_Cancel');
            return {
                children: cancelButtonText,
                onClick: this.closeDialog
            };
        }

    };
});
