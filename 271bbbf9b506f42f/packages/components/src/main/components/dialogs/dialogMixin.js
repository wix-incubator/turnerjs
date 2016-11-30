define([
    'lodash',
    'utils',
    'core',
    'components/components/dialogs/translations/dialogMixinTranslations',
    'reactDOM'
], function(_, utils, core, langKeys, ReactDOM) {
    'use strict';

    var idCounter = 1;
    return {

        PASS_MIN_LEN: 4,
        PASS_MAX_LEN: 15,

        mixins: [core.compMixins.animationsMixin],

        getInitialState: function () {
            var view = this.props.siteData.isMobileView() ? 'mobile' : 'desktop';
            this.canOpenSiteMembersDialogs = this.props.siteData.renderFlags.isSiteMembersDialogsOpenAllowed;
            return {
                showComponent: true,
                errMsg: '',
                oAuthErrMsg: '',
                $view: view,
                $canBeClosed: !this.props.notClosable ? 'canBeClosed' : '',
                socialLoginEnabled : this.isSocialLogin(),
                socialLoginIframeReady : false
            };
        },

        componentWillMount: function () {
            if (!this.props.notClosable) {
                var windowKeyboardEvent = this.props.siteAPI.getSiteAspect('windowKeyboardEvent');
                if (windowKeyboardEvent) {
                    windowKeyboardEvent.registerToEscapeKey(this);
                }
            }
        },

        componentWillReceiveProps: function (nextProps) {
            if (this.canOpenSiteMembersDialogs && this.canOpenSiteMembersDialogs !== nextProps.siteData.renderFlags.isSiteMembersDialogsOpenAllowed) {
                this.closeDialog();
            }
        },

        componentWillUnmount: function () {
            var windowKeyboardEvent = this.props.siteAPI.getSiteAspect('windowKeyboardEvent');
            if (windowKeyboardEvent) {
                windowKeyboardEvent.unRegisterKeys(this);
            }
            this.props.siteAPI.exitFullScreenMode();
        },

        onEscapeKey: function () {
            var userAction = true;
            this.closeDialog(userAction);
        },

        componentDidMount: function () {
            this.animate('dialog', 'FadeIn', 0.5, 0);
            this.props.siteAPI.enterFullScreenMode();//eslint-disable-line react/no-did-mount-callbacks-from-props
        },

        onClickCloseButton: function () {
            var userAction = true;
            this.closeDialog(userAction);
        },

        closeDialog: function (isUserAction) {
            if (this.props.onCloseDialogCallback) {
                this.props.onCloseDialogCallback(this, false, isUserAction);
            } else {
                this.performCloseDialog();
            }
        },

        performCloseDialog: function (additionalOnCompleteCallback) {
            this.animate('dialog', 'FadeOut', 0.5, 0, null, {
                onComplete: function () {
                    if (additionalOnCompleteCallback) {
                        additionalOnCompleteCallback();
                    }
                }
            });
        },

        submit: function () {
            if (this.shouldBlockSubmit && this.shouldBlockSubmit()) {
                this.blockSubmit(ReactDOM.findDOMNode(this.refs.submitButton));
                return;
            }
            var isValid = true;
            if (this.validateBeforeSubmit) {
                isValid = this.validateBeforeSubmit();
            }
            if (isValid) {
                if (this.props.onSubmitCallback) {
                    this.props.onSubmitCallback(this.getDataToSubmit(), this);
                } else {
                    utils.log.error('dialogMixin: this.props.onSubmitCallback is not defined');
                }
            }
        },

        submitOnEnterKeyPress: function (evt) {
            if (evt.key === 'Enter') {
                this.submit();
            }
        },

        getErrorMessage: function () {
            return this.state.errMsg;
        },

        _toErrorKey: function (errorCode) {
            var prefix = 'SMForm_Error_';
            var errorKey = _.startsWith(errorCode, prefix) ? errorCode : prefix + errorCode;
            if (_.includes(errorKey, "-")) {
                errorKey = errorKey.replace("-", "");
            }
            return errorKey;
        },

        setErrorMessageByCode: function (errorCode) {
            if (errorCode) {
                this.setErrorMessage(this._toErrorKey(errorCode));
            } else {
                this.setState({errMsg: ''});
            }
        },

        setOuathErrorMessageByCode: function (errorCode) {
            this.setState({
                oAuthErrMsg: errorCode ? this.getText(this.props.language, this._toErrorKey(errorCode)) : ''
            });
        },

        setGeneralErrorMessage: function () {
            var text = this.getText(this.props.language, 'PasswordLogin_Error_General');
            this.setState({errMsg: text});
        },

        setErrorMessage: function (errorKey) {
            var text = this.getText(this.props.language, errorKey);
            this.setState({errMsg: text});
        },

        shouldDialogBeClosed: function () {
            return !this.state.showComponent;
        },

        getCloseDialogSkinProperties: function () {
            return {
                "": {
                    style: {display: 'none'}
                }
            };
        },

        getMobileSocialLoginClass: function () {
            return this.state.socialLoginEnabled ? 'socialLoginMode' : 'emailLoginMode';
        },

        _isAsciiOnlyInput: function (value) {
            var length = value.length;
            var maxLength = this.PASS_MAX_LEN;
            for (var i = 0; i < length && i < maxLength; i++) {
                if (value.charCodeAt(i) > 127) {
                    return false;
                }
            }
            return true;
        },


        _getEmailValidator: function (lang) {
            return function (email) {
                if (email.length === 0) {
                    return this.getText(lang, "SMForm_Error_Email_Blank");
                }
                if (!utils.validationUtils.isValidEmail(email)) {
                    return this.getText(lang, "SMForm_Error_Email_Invalid");
                }
                return false;
            }.bind(this);
        },

        _getPasswordValidator: function (lang) {
            return function (password) {
                if (password.length === 0) {
                    return this.getText(lang, "SMForm_Error_Password_Blank");
                }
                if (password.length < this.PASS_MIN_LEN || password.length > this.PASS_MAX_LEN) {
                    return this.getText(lang, "SMForm_Error_Password_Length").replace('{0}', this.PASS_MIN_LEN).replace('{1}', this.PASS_MAX_LEN);
                }
                if (!this._isAsciiOnlyInput(password)) {
                    return this.getText(lang, "SMForm_Error_Non_Ascii_Chars");
                }
                return false;
            }.bind(this);
        },

        _onInputChange: function () {
            this.setErrorMessageByCode('');
        },

        createEmailInput: function (emailProperties, extraProps) {
            var lang = emailProperties.language;
            var inputTitleText = this.getText(lang, emailProperties.inputTitleKey);
            var emailValidator = this._getEmailValidator(lang);

            var inputProperties = {
                refId: emailProperties.refId,
                inputTitleText: inputTitleText,
                validators: [emailValidator],
                defaultValue: emailProperties.defaultValue || ''
            };

            return this.createInputWithValidation(inputProperties, extraProps);
        },

        createPasswordInput: function (passwordProperties, extraProps) {
            var lang = passwordProperties.language;

            var inputTitleText = this.getText(lang, passwordProperties.inputTitleKey);
            var passwordValidator = passwordProperties.overrideValidators || [this._getPasswordValidator(lang)];

            var inputProperties = {
                refId: passwordProperties.refId,
                inputTitleText: inputTitleText,
                validators: passwordValidator,
                type: 'password',
                defaultValue: passwordProperties.defaultValue
            };

            return this.createInputWithValidation(inputProperties, extraProps);
        },

        createInputWithValidation: function (inputProperties, extraProps) {
            inputProperties.validators = inputProperties.validators || [];
            extraProps = extraProps || {};

            var defaultProps = {
                'lazyValidation': true,
                'validators': inputProperties.validators,
                'label': inputProperties.inputTitleText,
                'ref': inputProperties.refId,
                'defaultValue': inputProperties.defaultValue,
                'type': inputProperties.type,
                'onChange': this._onInputChange
            };
            _.merge(defaultProps, extraProps);
            return this.createChildComponent(
                {id: 'inputWithValidation' + idCounter++},
                "wysiwyg.components.viewer.inputs.InputWithValidation",
                "inputWithValidation",
                defaultProps
            );
        },

        getText: function (lang, textType, textParams) {


            lang = langKeys[lang] ? lang : 'en';
            textType = langKeys[lang][textType] ? textType : 'SMForm_Error_General_Err';

            var text = langKeys[lang][textType];

            if (textParams) {
                _.forEach(textParams, function (val, index) {
                    text = text.replace("{" + index + "}", val);
                });
            }

            return text;
        },

        createXButton: function() {
            return {
                onClick: this.onClickCloseButton,
                className: (this.props.siteData.isPremiumUser() ? '' : this.props.styleId + 'free')
            };
        },

        createContent: function (isValidated) {
          return {
              className : isValidated && this.getErrorMessage() ? this.props.styleId + '_validationError' : '',
              onKeyPress: this.submitOnEnterKeyPress
          };
        },

        createSubmitButton: function (btnName, btnLabel) {
            var buttonData = {
                label: btnLabel || 'GO',
                id: 'ok'
            };

            var compProp = {
                align: 'center'
            };

            var skinPartName = btnName;

            return this.createChildComponent(
              buttonData,
              'wysiwyg.viewer.components.SiteButton',
              skinPartName,
              {
                  skinPart: skinPartName,
                  styleId: this.props.loadedStyles.b1,
                  compProp: compProp,
                  style: {position: 'relative', height:'100%', width: '100%'},
                  structure: {
                      layout: {
                          scale: 0.5
                      }
                  }
              }
            );
        },

        _onTokenReceived: function (msg) {
            if (msg.token && typeof _.isFunction(this.props.onTokenMessage)) {
                this.props.onTokenMessage(msg.token, msg.vendor, this.refs[this.socialHolderRef].contentWindow, this);
            }
        },

        _onSocialLoginIframeLoaded: function () {
            this.setState({
                socialLoginIframeReady : true
            });
        },

        onSocialLoginIframeMessage: function (msg) {
            switch (msg.type) {
                case 'page-ready':
                    this._onSocialLoginIframeLoaded();
                    break;
                case 'auth-token':
                    this._onTokenReceived(msg);
                    break;
            }
        },

        getSocialLoginSkinParts: function (mode, lang, translationKeys) {
            var smSettings = this._getSmSettings();
            var iframeReadyClass = this.state.socialLoginIframeReady ? this.props.styleId + '_hide' : '';
            var googleEnabled = smSettings.socialLoginGoogleEnabled ? this.props.styleId + '_google' : '';
            var facebookEnabled = smSettings.socialLoginFacebookEnabled ? this.props.styleId + '_facebook' : '';
            return {
                "socialHolder" : this._getSocialLoginIframeProps({
                    mode: mode,
                    lang: lang,
                    vendors: [{id: 'google', enabled: smSettings.socialLoginGoogleEnabled}, {id: 'facebook', enabled: smSettings.socialLoginFacebookEnabled}]
                }),
                "dummySocialButtons" : {
                    className : (iframeReadyClass + ' ' + googleEnabled + ' ' + facebookEnabled).trim()
                },
                "googleButton" : {
                    children : this.getText(lang, translationKeys.google)
                },
                "facebookButton" : {
                    children : this.getText(lang, translationKeys.facebook)
                },
                "switchToEmailLink": {
                    children: this.getText(lang, translationKeys.switchEmail),
                    onClick: this.toggleSocialLoginDisplayState
                },
                "switchToSocialLink": {
                    className : (this.props.siteData.isPremiumUser() ? '' : this.props.styleId + 'free') + ' ' +
                    (this.props.styleId + '_' + (this.isSocialLogin ? this.getMobileSocialLoginClass() : '')),
                    onClick: this.toggleSocialLoginDisplayState
                },
                "socialLoginErrorMsg": {
                    className : this.props.styleId + (this.state.oAuthErrMsg ? '_enabled' : ''),
                    children : this.state.oAuthErrMsg
                }
            };
        },

        isSocialLogin: function () {
            var smSettings = this._getSmSettings();
            return !!(smSettings.socialLoginGoogleEnabled || smSettings.socialLoginFacebookEnabled); // FIXME - use constants? (for siteMembers.js as well);
        },

        toggleSocialLoginDisplayState : function () {
            this.setState({
                socialLoginEnabled : !this.state.socialLoginEnabled
            });
        },

        _getSocialLoginIframeProps: function (config) {
            return {
                src: this._buildIframeSrc(config),
                frameBorder: '0',
                scrolling: 'no',
                allowTransparency: 'true'
            };
        },

        _buildIframeSrc: function (config) {
            var siteData = this.props.siteData;
            return _.template('${baseUrl}/view/social/frame/${msid}?mode=${mode}&lang=${lang}&vendors=${vendors}')({
                baseUrl: (siteData.serviceTopology.siteMembersUrl).replace(/^(https|http):/i, ''),
                msid: siteData.getMetaSiteId(),
                mode: config.mode,
                lang: config.lang,
                vendors: config.vendors.reduce(function (result, vendor) {
                    return vendor.enabled ? (result.push(vendor.id) && result) : result;
                }, []).join(',')
            });
        },

        _getSmSettings: function () {
            return _.get(this.props.siteData.getDataByQuery('masterPage'), ['smSettings'], {}); // FIXME - refactor to siteData?!
        }

    };

});
