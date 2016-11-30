define(['lodash', 'santaProps', 'utils', 'core/core/siteAspectsRegistry', 'core/core/SiteMembersAPI', 'core/bi/events', 'core/util/translations/siteMembersTranslations', 'experiment', 'color'],
    function (/** lodash */ _,
              santaProps,
             /** utils */ utils,
             /** core.siteAspectsRegistry */ siteAspectsRegistry,
             /**SiteMembersAPI */ SiteMembersAPI,
             events,
             siteMemberslangs,
             experiment,
             Color
        ) {

        "use strict";

        /** utils.util.hashUtils */
        var hashUtils = utils.hashUtils;
        var cookieUtils = utils.cookieUtils;
        var componentPropsBuilder = santaProps.componentPropsBuilder;
        var isNewLoginScreens = experiment.isOpen('newLoginScreens');
        var isWithFallbackStyleDialogs = experiment.isOpen('fallbackStyleDialogs');

        var DIALOGS = {
            Login: "login",
            SignUp: "register",
            ResetPasswordEmail: "resetPasswordEmail",
            ResetPasswordNewPassword: "resetPasswordNewPassword",
            Notification: "notification",
            Credits: "credits",
            PasswordProtected: "enterPassword"
        };

        var NOTIFICATIONS = {
            SiteOwner: "siteowner",
            SignUp: "register",
            ResetPasswordEmail: "resetPasswordEmail",
            ResetPasswordNewPassword: "resetPasswordNewPassword"
        };

        var DIALOGS_SKINS = {
          Login: {
            old: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.memberLoginDialogSkin",
            themeStyled: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.memberLoginDialogSkinNew",
            socialMobileThemeStyled: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.memberLoginDialogSkinSocialMobile",
            fixedStyle: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.memberLoginDialogSkinFixed",
            socialMobileFixedStyle: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.memberLoginDialogSkinSocialMobileFixed"
          },
          SignUp: {
            old: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.signUpDialogSkin",
            themeStyled: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.signUpDialogSkinNew",
            socialMobileThemeStyled: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.signUpDialogSkinSocialMobile",
            fixedStyle: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.signUpDialogSkinFixed",
            socialMobileFixedStyle: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.signUpDialogSkinSocialMobileFixed"
          },
          ResetPasswordEmail: {
            old: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.requestPasswordResetDialogSkin",
            themeStyled: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.requestPasswordResetDialogSkinNew",
            fixedStyle: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.requestPasswordResetDialogSkinFixed"
          },
          ResetPasswordNewPassword: {
            old: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.resetPasswordDialogSkin",
            themeStyled: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.resetPasswordDialogSkinNew",
            fixedStyle: "wysiwyg.viewer.skins.dialogs.siteMembersDialogs.resetPasswordDialogSkinFixed"
          },
          Notification: {
            old: "wysiwyg.viewer.skins.dialogs.notificationDialogSkin",
            themeStyled: "wysiwyg.viewer.skins.dialogs.notificationDialogSkinNew",
            fixedStyle: "wysiwyg.viewer.skins.dialogs.notificationDialogSkinFixed"
          },
          PasswordProtected: {
            old: "wysiwyg.viewer.skins.dialogs.enterPasswordDialogSkin",
            themeStyled: "wysiwyg.viewer.skins.dialogs.enterPasswordDialogSkinNew",
            fixedStyle: "wysiwyg.viewer.skins.dialogs.enterPasswordDialogSkinFixed"
          }
      };

        var PALETTE_INDEX = {
          BACKGROUND : 11,
          PRIMARY : 15
        };

        var WCAG2_CONTRAST_CRITERIA = {
          AA_large : 3
        };

        var COOKIES = {
            SV_SESSION: 'svSession',
            SM_SESSION: 'smSession',
            WIX_CLIENT: 'wixClient'
        };

        function getStructure(compType, id, skin) {
            return {
                componentType: compType,
                type: "Component",
                id: id,
                key: id,
                skin: skin
            };
        }

        function getCreditsStructure() {
            return getStructure("wysiwyg.viewer.components.dialogs.CreditsDialog", "creditsDialog", "wysiwyg.viewer.skins.dialogs.creditsDialogSkin");
        }

        function getNotificationStructure(siteData) {
            return getStructure("wysiwyg.viewer.components.dialogs.NotificationDialog", "notificationDialog", getSkin(DIALOGS_SKINS.Notification, siteData));
        }

        function getLoginStructure(siteData) {
            return getStructure("wysiwyg.viewer.components.dialogs.siteMemberDialogs.MemberLoginDialog", "memberLoginDialog", getSkin(DIALOGS_SKINS.Login, siteData));
        }

        function getSignUpStructure(siteData) {
            return getStructure("wysiwyg.viewer.components.dialogs.siteMemberDialogs.SignUpDialog", "signUpDialog", getSkin(DIALOGS_SKINS.SignUp, siteData));
        }

        function getResetPasswordEmailStructure(siteData) {
            return getStructure("wysiwyg.viewer.components.dialogs.siteMemberDialogs.RequestPasswordResetDialog", "requestResetPasswordDialog", getSkin(DIALOGS_SKINS.ResetPasswordEmail, siteData));
        }

        function getResetPasswordNewPasswordStructure(siteData) {
            return getStructure("wysiwyg.viewer.components.dialogs.siteMemberDialogs.ResetPasswordDialog", "resetPasswordDialog", getSkin(DIALOGS_SKINS.ResetPasswordNewPassword, siteData));
        }

        function getEnterPasswordStructure(siteData) {
            return getStructure("wysiwyg.viewer.components.dialogs.EnterPasswordDialog", "enterPasswordDialog", getSkin(DIALOGS_SKINS.PasswordProtected, siteData));
        }

        /**
         * @private
         */
        function getSkin(skin, siteData) {
          if (!isNewLoginScreens) {
            return skin.old;
          }
          var isSocialMobile = isSocialLoginEnabled(siteData) && siteData.isMobileView() && skin.socialMobileThemeStyled && skin.socialMobileFixedStyle;
          if (!isWithFallbackStyleDialogs || isThemeColorsContrastValid(siteData)) {
            return isSocialMobile ? skin.socialMobileThemeStyled : skin.themeStyled;
          }
          return isSocialMobile ? skin.socialMobileFixedStyle : skin.fixedStyle;
        }

        function isSocialLoginEnabled(siteData) {
          var settings = _.get(siteData.getDataByQuery('masterPage'), ['smSettings'], {}); // FIXME - refactor to siteData?!
          return !!(settings.socialLoginGoogleEnabled || settings.socialLoginFacebookEnabled); // FIXME - use constants? (for siteMembers.js as well)
        }

        /**
         * @private
         */
        function isThemeColorsContrastValid(siteData) {
          var palette = siteData.getColorsMap();
          var backgroundHex = palette[PALETTE_INDEX.BACKGROUND], primaryHex = palette[PALETTE_INDEX.PRIMARY];
          if (backgroundHex && primaryHex) {
            var cl1 = new Color(backgroundHex).luminosity();
            var cl2 = new Color(primaryHex).luminosity();
            return (Math.max(cl1, cl2) + 0.05) / (Math.min(cl1, cl2) + 0.05) >= WCAG2_CONTRAST_CRITERIA.AA_large;
          }
          return false;
        }

        function getDialogToShowFirst(siteData, showLoginDialog) {
            if (_.isBoolean(showLoginDialog)) {
                return showLoginDialog ? DIALOGS.Login : DIALOGS.SignUp;
            }
            var siteStructureData = siteData.getDataByQuery('masterPage');
            var shouldShowLoginDialogFirst = _.get(siteStructureData, ['smSettings', 'smFirstDialogLogin'], false);
            return shouldShowLoginDialogFirst ? DIALOGS.Login : DIALOGS.SignUp;
        }

        /**
         * @private
         * @param siteAPI
         * @param loadedStyles
         * @param structureGetter
         * @param propsDecorator
         * @returns {*}
         */
        function getDialogComponent(siteAPI, loadedStyles, structureGetter, propsDecorator){
            var structure = structureGetter();
            var props = getDialogProps.call(this, structure, siteAPI, loadedStyles);
            propsDecorator.call(this, props);
            return createDialog.call(this, structure, props);
        }

        /**
         * @private
         * @param structure
         * @param props
         * @returns {*}
         */
        function createDialog(structure, props) {
            props.notClosable = this.notClosable;
            var compConstructor = utils.compFactory.getCompClass(structure.componentType);
            return compConstructor(props);
        }

        /**
         * @private
         * @param structure
         * @param siteAPI
         * @param loadedStyles
         * @returns {*}
         */
        function getDialogProps(structure, siteAPI, loadedStyles) {
            var props = componentPropsBuilder.getCompProps(structure, siteAPI, null, loadedStyles);
            var currentDialogType = this.dialogToDisplay;
            props.language = privateMembers[currentDialogType] && privateMembers[currentDialogType].language || privateMembers[this.siteData.siteId].language;
            props.onCloseDialogCallback = closeDialog.bind(this);
            return props;
        }

        /**
         * @private
         * @param props
         */
        function addLoginProps(props){
            props.onSubmitCallback = loginHandler.bind(this);
            var lang = privateMembers[DIALOGS.Login] && privateMembers[DIALOGS.Login].language || null;
            props.onTokenMessage = tokenHandler.bind(this);
            props.onSwitchDialogLinkClick = showDialog.bind(this, DIALOGS.SignUp, undefined, lang);
            props.onForgetYourPasswordClick = function () {
              this.aspectSiteApi.reportBI(events.SITE_MEMBER_CLICKED_FORGOT_PASSWORD);
              showDialog.call(this, DIALOGS.ResetPasswordEmail, undefined, lang);
            }.bind(this);
            props.needLoginMessage = this._showDialogMessage;
        }

        /**
         * @private
         * @param props
         */
        function addSignupProps(props){
            props.onSubmitCallback = registerHandler.bind(this);
            var lang = privateMembers[DIALOGS.SignUp] && privateMembers[DIALOGS.SignUp].language || null;
            props.onTokenMessage = tokenHandler.bind(this);
            props.onSwitchDialogLinkClick = showDialog.bind(this, DIALOGS.Login, undefined, lang);
            props.needLoginMessage = this._showDialogMessage;
        }

        /**
         * @private
         * @param props
         */
        function addResetPasswordRequestProps(props){
            var lang = privateMembers[DIALOGS.ResetPasswordEmail] && privateMembers[DIALOGS.ResetPasswordEmail].language || null;
            props.onSwitchDialogLinkClick = showDialog.bind(this, DIALOGS.Login, undefined, lang);
            props.onSubmitCallback = resetPasswordRequestHandler.bind(this);
        }

        /**
         * @private
         * @param structure
         * @param siteAPI
         * @param loadedStyles
         * @returns {*}
         */
        function getPasswordChangeComp(structure, siteAPI, loadedStyles) {
            var props = componentPropsBuilder.getCompProps(structure, siteAPI, null, loadedStyles);
            props.onSubmitCallback = changePasswordHandler.bind(this);
            props.notClosable = true;
            return createDialog.call(this, structure, props);
        }

        /**
         * @private
         * @param props
         */
        function addNotificationProps(props) {
            var lang = props.language;
            switch (this.notifcationToDisplay) {
                case DIALOGS.SignUp:
                    var siteMember = privateMembers[this.siteData.siteId].siteMember;
                    var nameToDisplay = siteMember.details.email;
                    props.title = "";//getText(lang,"SMApply_Success1");
                    props.description = getText(lang, "SMApply_Success1") + " " + getText(lang, "SMApply_Success2").replace("{0}", nameToDisplay);
                    props.buttonText = getText(lang, "SMContainer_OK");
                    break;
                case DIALOGS.ResetPasswordEmail:
                    props.title = getText(lang, isNewLoginScreens ? "siteMembersTranslations_RESET_PASSWORD_CHECKEMAIL_TITLE" : "SMResetPassMail_confirmation_title");
                    props.description = getText(lang, isNewLoginScreens ? "siteMembersTranslations_RESET_PASSWORD_CHECKEMAIL_TEXT" : "SMResetPassMail_confirmation_msg");
                    props.buttonText = getText(lang, "SMContainer_OK");
                    break;
                case DIALOGS.ResetPasswordNewPassword:
                    props.title = getText(lang, isNewLoginScreens ? "siteMembersTranslations_Reset_Password_Sucess_Title" : "SMResetPass_Reset_Succ");
                    props.description = "";
                    props.buttonText = getText(lang, isNewLoginScreens ? "SMContainer_OK" : "SMResetPass_Continue");
                    props.onButtonClick = onCloseSuccessNotification.bind(this, DIALOGS.Login, "resetPasswordSuccessNotification");
                    break;
                case "siteowner":
                    props.title = getText(lang, "SITEMEMBERMANGAGER_OWNER_LOGOUT_ACTION_TITLE");
                    props.description = getText(lang, "SITEMEMBERMANGAGER_OWNER_LOGOUT_ACTION_MESSAGE");
                    props.buttonText = getText(lang, "SMContainer_OK");
                    break;
                default:
                    break;
            }
        }

        /**
         * @private
         * @param props
         */
        function addEnterPasswordProps(props){
            props.onSubmitCallback = this.handlePasswordEntered.bind(this, this.nextPageInfo);
        }

        /**
         * @private
         * @param password
         * @returns {*}
         */
        function encryptPassword(password) {
            return hashUtils.SHA256.b64_sha256(password);
        }

        /**
         * @private
         * @param cookieData
         * @param siteData
         */
        function setSMSessionCookie(cookieData, siteData) {
            var cookieName = cookieData.cookieName || COOKIES.SM_SESSION;
            var sessionToken = cookieData.sessionToken;
            var expirationDate = cookieData.rememberMe ? cookieData.expirationDate : 0;

            cookieUtils.setCookie(
                cookieName,
                sessionToken,
                expirationDate,
                siteData.currentUrl.hostname,
                siteData.getMainPagePath(),
                false
            );
        }

        /**
         * @private
         * @param dialogType
         * @param successCallback
         * @param cancelCallback
         */
        function showDialog(dialogType, successCallback, language, cancelCallback) {
            if (successCallback) {
                this.dialogProcessSuccessCallback = successCallback;
            }
            if (language) {
                privateMembers[dialogType] = {
                    language: language
                };
            }
            if (cancelCallback){
                this.onCancelCallback = cancelCallback;
            }
            this.dialogToDisplay = dialogType;
            this.aspectSiteApi.forceUpdate();
        }

        /**
         * @private
         * @param notificationType
         */
        function showNotification(notificationType, language) {
            this.notifcationToDisplay = notificationType;
            this.dialogToDisplay = DIALOGS.Notification;
            if (language) {
                privateMembers[DIALOGS.Notification] = {
                    language: language
                };
            }
            this.aspectSiteApi.forceUpdate();
        }

        /**
         * @private
         * @param loginData
         * @param dialog
         */
        function loginHandler(loginData, dialog) {
            delete this.dialogToDisplay;
            var svSession = cookieUtils.getCookie(COOKIES.SV_SESSION);
            var initiator = null;
            this.aspectSiteApi.reportBI(events.SITE_MEMBER_SUBMIT_BUTTON, {context: dialog.props.id});
            SiteMembersAPI.login(loginData, onLoginSuccess.bind(this, dialog), dialog.setErrorMessageByCode, svSession, initiator);
        }

        function tokenHandler(token, type, postMessageTarget, dialog) {
            delete this.dialogToDisplay;
            var svSession = cookieUtils.getCookie(COOKIES.SV_SESSION);

            SiteMembersAPI.handleOauthToken(onOauthSuccess.bind(this, dialog, postMessageTarget, type),
                onOauthError.bind(this, dialog, postMessageTarget, type), svSession, token, type);
        }

        /**
         * @private
         * @param registerData
         * @param dialog
         */
        function registerHandler(registerData, dialog) {
            var specMap = this.siteData.rendererModel.clientSpecMap;
            var siteMembersConfig = _.find(specMap, {type:"sitemembers"});
            var membersRegistrationType = siteMembersConfig.collectionType;
            if (membersRegistrationType === "Open") {
                SiteMembersAPI.register(registerData, onRegisterSuccess.bind(this, dialog), dialog.setErrorMessageByCode);
            } else if (membersRegistrationType === "ApplyForMembership"){
                SiteMembersAPI.apply(registerData, onApplyRegisterSuccess.bind(this, dialog.props.language), dialog.setErrorMessageByCode);
            }
            this.aspectSiteApi.reportBI(events.SITE_MEMBER_SUBMIT_BUTTON, {context: dialog.props.id});
        }

        /**
         * @private
         * @param submitData
         * @param dialog
         */
        function resetPasswordRequestHandler(submitData, dialog) {
            var currentPageUrl = this.siteData.currentUrl.full;
            this.aspectSiteApi.reportBI(events.SITE_MEMBER_SUBMIT_BUTTON, {context: dialog.props.id});
            SiteMembersAPI.sendForgotPasswordMail(submitData.email, currentPageUrl, showNotification.bind(this, NOTIFICATIONS.ResetPasswordEmail, dialog.props.language), dialog.setErrorMessageByCode);
        }

        /**
         *
         */
        function onPasswordChangeSuccess() {
            delete this.siteData.currentUrl.query.forgotPasswordToken;
            showNotification.call(this, NOTIFICATIONS.ResetPasswordNewPassword);
        }

        /**
         * @private
         * @param newPassword
         * @param dialog
         */
        function changePasswordHandler(newPassword, dialog) {
            this.aspectSiteApi.reportBI(events.SITE_MEMBER_SUBMIT_BUTTON, {context: dialog.props.id});
            SiteMembersAPI.resetMemberPassword(newPassword, onPasswordChangeSuccess.bind(this), dialog.setErrorMessageByCode);
        }

        function isPageProtectedByPasswordOnServer (siteData, pageId) {
            return _.includes(siteData.rendererModel.passwordProtectedPages, pageId);
        }

        function isPageSecurityProtected(siteData, pageInfo, isLoggedIn) {
            var pageSecurity = siteData.getDataByQuery(pageInfo.pageId) && siteData.getDataByQuery(pageInfo.pageId).pageSecurity;
            if (!pageSecurity) {
                return {
                    isAllowed: true,
                    defaultDialog: DIALOGS.ResetPasswordNewPassword
                };
            }

            if (!isPagePreviouslyApproved(siteData, pageInfo.pageId)) {
                if (pageSecurity.passwordDigest) {
                    return {
                        isAllowed: false,
                        defaultDialog: DIALOGS.PasswordProtected,
                        pageSecurity: pageSecurity
                    };
                }

                if (isPageProtectedByPasswordOnServer(siteData, pageInfo.pageId)) {
                    return {
                        isAllowed: false,
                        defaultDialog: DIALOGS.PasswordProtected,
                        pageSecurity: pageSecurity
                    };
                }
            }

            if (pageSecurity.requireLogin && !isLoggedIn) {
                return {
                    isAllowed: false,
                    defaultDialog: getDialogToShowFirst(siteData),
                    pageSecurity: pageSecurity
                };
            }

            return {
                isAllowed: true,
                defaultDialog: null
            };
        }

        function getPageSecurityStatus(pageInfo) {
            if (_.has(this.siteData.currentUrl.query, 'forgotPasswordToken')) {
                return {
                    isAllowed: isPageSecurityProtected(this.siteData, pageInfo, this.isLoggedIn()).isAllowed,
                    defaultDialog: DIALOGS.ResetPasswordNewPassword
                };
            }

            return isPageSecurityProtected(this.siteData, pageInfo, this.isLoggedIn());
        }

        /**
         * @private
         * @param dialog
         * @param authSuccess
         * @param isUserAction
         */
        function closeDialog(dialog, authSuccess, isUserAction) {
            this.currentDialog = null;
            this.dialogToDisplay = null;

            if (isUserAction) {
              this.aspectSiteApi.reportBI(events.SITE_MEMBER_EXIT_DIALOG, {context: dialog.props.id});
            }

            var siteMember = privateMembers[this.siteData.siteId].siteMember;
            if (_.isFunction(this.onCancelCallback) && !siteMember.details){
                this.onCancelCallback();
            }
            this.onCancelCallback = null;
            this.dialogProcessSuccessCallback = null;

            dialog.performCloseDialog(function() {
                this._showDialogMessage = false;
                if (authSuccess) {
                    if (this.nextPageInfo) {
                        this.aspectSiteApi.navigateToPage(this.nextPageInfo);
                    } else {
                        this.aspectSiteApi.forceUpdate();
                    }
                } else if (this.nextPageInfo && (this.nextPageInfo.pageId === this.siteData.getCurrentUrlPageId())) {
                    forceUnmountingOfCurrentDialog.call(this);
                    this.aspectSiteApi.navigateToPage({pageId: this.siteData.getMainPageId()});
                } else {
                    this.aspectSiteApi.forceUpdate();
                }
            }.bind(this));

        }

        function forceUnmountingOfCurrentDialog(){
            this.dontShowDialog = true;
        }

        /**
         * @private
         * @param dialog
         * @param loginCallbackData
         */
        function onLoginSuccess(dialog, loginCallbackData) {
            handleSmSession.call(this, dialog, loginCallbackData, events.SITE_MEMBER_LOGIN_SUCCESS);
        }

      function revokeAppPermissions(postMessageTarget, type) {
          postMessageTarget.postMessage({src: 'wix-social-login', type: type, action: 'revoke'}, '*');
      }

      /**
         * @private
         * @param dialog
         * @param oAuthLoginCallbackData
         * @param postMessageTarget
         * @param type
         */
        function onOauthSuccess(dialog, postMessageTarget, type, oAuthLoginCallbackData) {
            var smSession = oAuthLoginCallbackData.payload.smSession;
            var siteMember = oAuthLoginCallbackData.payload.siteMemberDto;

            if (smSession) {
                handleSmSession.call(this, dialog, {payload: smSession});
            } else {
                onApplyRegisterSuccess.call(this, dialog.props.language, {payload: siteMember});
            }

            revokeAppPermissions(postMessageTarget, type);
        }

        function onOauthError(dialog, postMessageTarget, type, errorCode) {
            dialog.setOuathErrorMessageByCode(errorCode);
            revokeAppPermissions(postMessageTarget, type);
        }

        /**
         * @private
         * @param dialog
         * @param registerCallbackData
         */
        function onRegisterSuccess(dialog, registerCallbackData) {
            handleSmSession.call(this, dialog, registerCallbackData);
        }

        /**
         * @private
         * @param dialog
         * @param callbackData
         * @param biEvent
         * @param biEventData
         */
        function handleSmSession(dialog, callbackData, biEvent) {
            setSMSessionCookie(callbackData.payload, this.siteData);
            reloadClientSpecMap.call(this, function () {
                var siteMember = privateMembers[this.siteData.siteId].siteMember;
                siteMember.details = callbackData.payload.siteMemberDto;
                if (_.isFunction(this.dialogProcessSuccessCallback)) {
                    this.dialogProcessSuccessCallback(siteMember.details);
                    this.dialogProcessSuccessCallback = null;
                }

                closeDialog.call(this, dialog, true);

                if (biEvent) {
                    this.aspectSiteApi.reportBI(biEvent, {
                      userName: (siteMember.details.attribute && siteMember.details.attribute.name) || siteMember.details.email
                    });
                }
            }.bind(this));
        }

        /**
         * @private
         * @param registerData
         */
        function onApplyRegisterSuccess(language, registerData) {
            var siteMember = privateMembers[this.siteData.siteId].siteMember;
            siteMember.details = registerData.payload;
            if (_.isFunction(this.dialogProcessSuccessCallback)) {
                this.dialogProcessSuccessCallback(siteMember.details);
                this.dialogProcessSuccessCallback = null;
            }
            showNotification.call(this, NOTIFICATIONS.SignUp, language);
        }

        /**
         *
         * @param callback
         */
        function reloadClientSpecMap(callback) {
            var dynamicClientSpecMapAspect = this.aspectSiteApi.getSiteAspect('dynamicClientSpecMap');
            dynamicClientSpecMapAspect.reloadClientSpecMap(callback, true);
        }

        /**
         *
         * @param nextPageInfo
         * @param dialogToDisplay
         * @param passwordDigest
         */
        function handleProtectedPage(nextPageInfo, dialogToDisplay, pageSecurity) {
            this._showDialogMessage = true;
            this.nextPageInfo = nextPageInfo;
            if (pageSecurity && pageSecurity.passwordDigest) {
                this._passwordDigest = pageSecurity.passwordDigest;
            }
            this.dialogToDisplay = dialogToDisplay;
            if (pageSecurity) {
                if (pageSecurity.dialogLanguage) {
                    privateMembers[dialogToDisplay] = {
                        language: pageSecurity.dialogLanguage
                    };
                }
                privateMembers[this.siteData.siteId].language = "en";
            }
        }

        var privateMembers = {};
        function initPrivateMembers(siteData){
            privateMembers[siteData.siteId] = {
                approvedPasswordPages: [],
                siteMember: {details: null},
                language: "en"
            };
        }

        /**
         * @private
         * @param pageId
         * @returns {boolean} whether the password-protected page has already been logged into
         */
        function isPagePreviouslyApproved(siteData, pageId){
            return _.includes(privateMembers[siteData.siteId].approvedPasswordPages, pageId);
        }

        /**
         * @private
         * @param pageId
         * stores a password-protected page as 'approved' after a successful login
         */
        function storeApprovedPage(pageId){
            privateMembers[this.siteData.siteId].approvedPasswordPages.push(pageId);
        }

          /**
         * @private
         * @param password
         * @param nextPageInfo
         * @param onSuccess
         * @param onError
         */
        function validatePasswordOnServer (password, nextPageInfo, onSuccess, onError) {
            var url = this.siteData.serviceTopology.protectedPageResolverUrl;
            var payload = {
                password: password,
                metaSiteId: this.siteData.getMetaSiteId(),
                siteId: this.siteData.siteId,
                pageId: nextPageInfo.pageId
            };
            utils.ajaxLibrary.ajax({
                type: 'POST',
                url: url,
                data: payload,
                dataType: 'json',
                cache: false,
                contentType: 'application/json',
                success: onSuccess,
                error: onError
            });
        }

        /**
         * @private
         * @param givenPassword
         * @param onSuccess
         * @param onError
         */
        function validatePasswordAgainstJSON (givenPassword, onSuccess, onError) {
            var givenPasswordEncypted = encryptPassword(givenPassword);
            if (givenPasswordEncypted === this._passwordDigest) {
                onSuccess(this.nextPageInfo);
            } else {
                onError();
            }
        }

        function onCloseSuccessNotification(nextDialogType, notificationId) {
            this.aspectSiteApi.reportBI(events.SITE_MEMBER_SUBMIT_BUTTON, {context: notificationId});
            showDialog.call(this, nextDialogType);
        }

        /**
         *
         * @param {core.SiteAspectsSiteAPI} aspectSiteApi
         * @implements {core.SiteAspectInterface}
         * @constructor
         */
        function SiteMembersAspect(aspectSiteApi){
            /** @type core.SiteAspectsSiteAPI */
            this.aspectSiteApi = aspectSiteApi;
            this.siteData = aspectSiteApi.getSiteData();
            this.dialogProcessSuccessCallback = null;
            initPrivateMembers(this.siteData);
            SiteMembersAPI.initializeData(this.siteData);
            this.dialogToDisplay = _.has(this.siteData.currentUrl.query, 'forgotPasswordToken') ? DIALOGS.ResetPasswordNewPassword : null;
        }

        SiteMembersAspect.prototype = {
            dialogToDisplay: null,
            notifcationToDisplay: null,
            nextPageInfo: null,
            _passwordDigest: null,
            _showDialogMessage: false,

            getComponentStructures: function () {
              var getter = function (getStructureInternal) {
                return [getStructureInternal(this.siteData)];
              }.bind(this);
              switch (this.dialogToDisplay) {
                    case DIALOGS.Login:
                        return getter(getLoginStructure);
                    case DIALOGS.SignUp:
                        return getter(getSignUpStructure);
                    case DIALOGS.ResetPasswordEmail:
                        return getter(getResetPasswordEmailStructure);
                    case DIALOGS.ResetPasswordNewPassword:
                        return getter(getResetPasswordNewPasswordStructure);
                    case DIALOGS.Notification:
                        return getter(getNotificationStructure);
                    case DIALOGS.PasswordProtected:
                        return getter(getEnterPasswordStructure);
                    case DIALOGS.AdminLogin:
                        return getter(getEnterPasswordStructure);
                    case DIALOGS.Credits:
                      return [getCreditsStructure()];
                    default:
                        return null;
                }
            },

            /**
             *
             * @returns {ReactComponent[]}
             */
            getReactComponents: function (loadedStyles) {
                if (this.dontShowDialog) {
                    this.dontShowDialog = false;
                    return null;
                }
                var siteAPI = this.aspectSiteApi.getSiteAPI();
                var getter = function(getStructureInternal) {
                  return getStructureInternal.bind(null, this.siteData);
                }.bind(this);

                var propsDecorator, structureGetter;
                switch (this.dialogToDisplay) {
                    case DIALOGS.Login:
                        propsDecorator = addLoginProps;
                        structureGetter = getter(getLoginStructure);
                        break;
                    case DIALOGS.SignUp:
                        propsDecorator = addSignupProps;
                        structureGetter = getter(getSignUpStructure);
                        break;
                    case DIALOGS.ResetPasswordEmail:
                        propsDecorator = addResetPasswordRequestProps;
                        structureGetter = getter(getResetPasswordEmailStructure);
                        break;
                    case DIALOGS.ResetPasswordNewPassword:
                        var structure = getter(getResetPasswordNewPasswordStructure)();
                        this.currentDialog = getPasswordChangeComp.call(this, structure, siteAPI, loadedStyles);
                        return this.currentDialog;
                    case DIALOGS.Notification:
                        propsDecorator = addNotificationProps.bind(this);
                        structureGetter = getter(getNotificationStructure);
                        break;
                    case DIALOGS.Credits:
                        propsDecorator = _.noop;
                        structureGetter = getter(getCreditsStructure);
                        break;
                    case DIALOGS.PasswordProtected:
                        propsDecorator = addEnterPasswordProps;
                        structureGetter = getter(getEnterPasswordStructure);
                        break;
                    default:
                        break;
                }

                this.currentDialog = structureGetter && getDialogComponent.call(this, siteAPI, loadedStyles, structureGetter, propsDecorator);
                return this.currentDialog;
            },

            /**
             *
             * @returns {boolean}
             */
            isLoggedIn: function () {
                return !!this.siteData.getSMToken();
            },

            /**
             * Opens the Sign Up / Login dialog
             * @param successCallback
             * @param language
             * @param showLoginDialog
             * @param cancelCallback
             */
            showAuthenticationDialog: function (successCallback, language, showLoginDialog, cancelCallback) {
                this.aspectSiteApi.reportBI(events.SITE_MEMBER_OPEN_LOGIN_OR_SIGNUP_DIALOGS);
                showDialog.call(this, getDialogToShowFirst(this.siteData, showLoginDialog), successCallback, language, cancelCallback);
            },

            /**
             * Opens the Credits dialog
             */
            showCreditsDialog: function(){
                showDialog.call(this, DIALOGS.Credits);
            },

            /**
             *
             * @returns {null|*}
             */
            getMemberDetails: function (callback) {
                var siteMember = privateMembers[this.siteData.siteId].siteMember;
                if (this.isLoggedIn() && !siteMember.details) {
                    SiteMembersAPI.getMemberDetails(this.siteData.getSMToken(), function (response) {
                        siteMember.details = response.payload;
                        if (callback) {
                            callback(siteMember.details);
                        }
                        this.aspectSiteApi.forceUpdate();
                    }.bind(this), function () {
                    });
                    return null;
                }
                if (callback) {
                    callback(siteMember.details);
                }
                return siteMember.details;
            },

            /**
             *
             * @param nextPageInfo
             * @returns {boolean}
             */
            isPageAllowed: function (nextPageInfo) {
                if (this.siteData.renderFlags.isPageProtectionEnabled) {
                    var securityStatus = getPageSecurityStatus.call(this, nextPageInfo);
                    return securityStatus.isAllowed;
                }
                return true;
            },

            showDialogOnNextRender: function (nextPageInfo) {
                var securityStatus = getPageSecurityStatus.call(this, nextPageInfo);
                if (!this.dialogToDisplay && !securityStatus.isAllowed) {
                    this.notClosable = nextPageInfo.pageId === this.siteData.getCurrentUrlPageId() && nextPageInfo.pageId === this.siteData.getMainPageId();
                    handleProtectedPage.call(this, nextPageInfo, securityStatus.defaultDialog, securityStatus.pageSecurity);
                }
            },

            /**
             * Log out
             */
            logout: function (language) {
                var siteMember = privateMembers[this.siteData.siteId].siteMember;
                if (cookieUtils.getCookie(COOKIES.WIX_CLIENT) && siteMember.details && siteMember.details.owner) {
                    showNotification.call(this, NOTIFICATIONS.SiteOwner, language);
                } else {
                    cookieUtils.deleteCookie(COOKIES.SM_SESSION, this.siteData.currentUrl.hostname, this.siteData.getMainPagePath());
                    cookieUtils.deleteCookie(COOKIES.SV_SESSION, this.siteData.currentUrl.hostname, this.siteData.getMainPagePath());
                    reloadClientSpecMap.call(this, function () {
                        siteMember.details = null;
                        this.notifcationToDisplay = null;
                        this.aspectSiteApi.forceUpdate();
                    }.bind(this));
                }
            },

            forceCloseDialog: function() {
                forceUnmountingOfCurrentDialog.call(this);
            },

            handlePasswordEntered: function (nextPageInfo, data, dialog) {
                var onError = function () {
                    dialog.setErrorMessage('PasswordLogin_Wrong_Password');
                };

                var navigateToPage = function (nextPage) {
                    closeDialog.call(this, dialog, true);
                    storeApprovedPage.call(this, nextPage.pageId);
                    this.aspectSiteApi.navigateToPage(nextPage);
                    this._passwordDigest = null;
                }.bind(this);

                if (_.isEmpty(data.password)) {
                    return dialog.setErrorMessage('PasswordLogin_Wrong_Password');
                }

                if (isPageProtectedByPasswordOnServer(this.siteData, nextPageInfo.pageId)) {
                    validatePasswordOnServer.call(this, data.password, nextPageInfo, function (response) {
                        nextPageInfo.jsonUrls = response.payload.urls;
                        navigateToPage(nextPageInfo);
                    }, onError);
                } else {
                    validatePasswordAgainstJSON.call(this, data.password, navigateToPage, onError);
                }
            }
        };

        siteAspectsRegistry.registerSiteAspect('siteMembers', SiteMembersAspect);

        function getText(lang, textType) {
            return siteMemberslangs[lang] ? siteMemberslangs[lang][textType] : siteMemberslangs.en[textType];
        }
    });
