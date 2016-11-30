/**
 * @class wysiwyg.viewer.managers.SiteMembersManager
 */
define.Class("wysiwyg.viewer.managers.SiteMembersManager", function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits("bootstrap.managers.BaseManager");

    def.resources(['W.Viewer', 'W.Utils', 'W.Config', 'W.MessagesController','W.Resources','W.Experiments']);

    def.binds(['_initializeAPI', 'openSiteMembersPopup', 'closeSiteMembersPopup']);

    def.statics({
        AUTH_STATES: {
            AUTH: "auth token and cookie exist",
            NO_AUTH_WITH_COOKIE: "no auth token, cookie exist",
            NO_AUTH_WITHOUT_COOKIE: "no auth token, cookie doesnt exist"
        },

        INTENTS: {
            LOGIN: "LOGIN",
            REGISTER: "REGISTER",
            UPDATE_USER: "UPDATE"
        },

        API_ERRORS: {
            API_NOT_LOADED: "Site Members API was not loaded",
            TOKEN_IS_INVALID: "Authentication Token is invalid"
        },

        RESET_PASSWORD_KEY_PARAMETER: "forgotPasswordToken",

        OWNER_LOGOUT_ACTION: {
            TITLE: 'Logout failure',
            MESSAGE: 'You are the owner of this website, and are logged in on Wix.com. Please log out of Wix.com to test the Site Members feature.'
        },

        WIX_USER_COOKIE_NAME: 'wixClient',

        LOGOUT_MESSAGES: {
            TITLE:          "Logout Unsuccessful",
            IN_PROGRESS:    "Something went wrong with that logout. Please give it another go."
        }
    });

    def.fields({
        MAX_NUMBER_OF_RETRIES: 10,
        DELAY_OF_RETRY_IN_MS: 300
    });

    /**
     * @lends wysiwyg.viewer.managers.SiteMembersManager
     */
    def.methods({
        initialize: function () {
            var initData = this.resources.W.Viewer.getAppDataHandler().getSiteMembersData();
            this.setData(initData);
            //}.bind(this));
            var self = this;
            this.resources.W.Viewer.addEvent("SiteReady", function () {
                self._showPasswordResetIfNeeded();
            });
        },

        _showPasswordResetIfNeeded: function () {
            var q = this._getCurrentSearchURL();
            if (this._isResetPasswordRequested(q) && this._isViewerMode()) {
                var self = this;
                this.resource.getResourceValue('W.SiteMembers', function (siteMembers) {
                    var resetPasswordId = self._getResetPasswordIdFromURL(q);
                    siteMembers.openSiteMembersPopup({
                        intent: "RESETPASSWORD",
                        disableCancel: true,
                        resetPassKey: resetPasswordId
                    });
                });
            }
        },

        _getCurrentSearchURL: function () {
            return window.location.search;
        },

        sendUserPasswordResetEmail: function (email, onSuccess, onError) {
            var returnUrl = this._getReturnUrl();
            this._api.sendForgotPasswordMail(email, returnUrl, onSuccess, onError);
        },

        _getReturnUrl: function () {
            var returnUrl = this._getLocationUrl();
            returnUrl = encodeURIComponent(returnUrl);
            return returnUrl;
        },

        _getLocationUrl: function () {
            return window.location.href;
        },

        resetPassword: function (password, onSuccess, onError) {
            var url = this._getCurrentSearchURL();
            var resetKey = this._getResetPasswordIdFromURL(url);
            this._api.resetMemberPassword(resetKey, password, onSuccess, onError);
        },

        _isResetPasswordRequested: function (urlSearchPart) {
            return urlSearchPart.indexOf(this.RESET_PASSWORD_KEY_PARAMETER) >= 0;
        },

        _getResetPasswordIdFromURL: function (url) {
            return W.Utils.getQueryParam(this.RESET_PASSWORD_KEY_PARAMETER, url);
        },

        _isViewerMode: function () {
            return window.viewMode === 'site';
        },

        isReady: function () {
            return true;
        },

        setData: function (newData) {
            this._smData = newData;
            if (newData) {
                this._loadScriptAndInitAPI();
            }
        },

        _loadScriptAndInitAPI: function () {
            if (!window.SiteMembers) {
                var scriptsLocationMap = window.serviceTopology['scriptsLocationMap'];
                var jsSdkUrl = scriptsLocationMap["sitemembers"];

                if (!define.getDefinition('resource', 'SiteMembersSdk')) {
                    define.resource('SiteMembersSdk').withUrls(jsSdkUrl + '/SiteMembers.js');
                }

                resource.getResourceValue('SiteMembersSdk', function() {
                    this._initializeAPI();
                    this._checkQueryStringForFormOpen();
                    this._preloadMemberDetails();
                }.bind(this));
            } else {
                this._initializeAPI();
            }
        },

        _initializeAPI: function () {
            var baseUrl = W.Config.getServiceTopologyProperty("siteMembersUrl");
            var globalVarName = "siteMembers";
            var SiteMembers = window['SiteMembers'];
            var collectionId = this.getCollectionId();
            if (collectionId) {
                var metasiteId = W.Config.getMetaSiteId();
                window[globalVarName] = new SiteMembers(collectionId, baseUrl, globalVarName, metasiteId);
                this._api = window[globalVarName];
                this._token = this.getData()['smtoken'];
                this._apiReady = true;
            } else {
                LOG.reportError("Site members - collection Id is undefined? [" + collectionId + "]", this.$className, "_initializeAPI");
            }
        },

        _checkQueryStringForFormOpen: function() {
            var utils = this.injects().Utils;
            var intent = utils.getQueryParam("intent");

            if (intent && !this._queryStringHandled) {
                if (!this.injects().Viewer.isSiteReady() || !this.isApiReady()) {
                    utils.callLater(this._checkQueryStringForFormOpen, [], this, 500);
                    return;
                }

                this.openSiteMembersPopup({ intent: intent  });
                this._queryStringHandled = true;
            }
        },

        _preloadMemberDetails: function() {
            this.getMemberDetails( function( data ) { /* on success */
                this._memberDetails = data;
            }.bind(this));
        },

        getData: function() {
            return this._smData || {};
        },

        getCollectionId: function() {
            return this.getData()['smcollectionId'] || this.getData()["id"];
        },

        getCollectionOwner: function() {
            return this.getData()['owner'];
        },

        getCollectionType: function() {
            return this.getData()['collectionType'] || this.getData()['type'];
        },

        /**
         * ClientSpecMap has a SiteMembers entry
         * @return {Boolean}
         */
        isServiceProvisioned: function() {
            return !!this._smData;
        },

        /**************/
        /* API ACCESS */
        /**************/

        /**
         * The Script was loaded, and api initialized
         * @return {*}
         */
        isApiReady: function() {
            return this._apiReady;
        },

        login: function (email, password, rememberMe, onSuccess, onError, initiator) {
            if (!this._apiReady) {
                onError && onError({
                    code: "API_NOT_LOADED",
                    description: this.API_ERRORS.API_NOT_LOADED
                });
            } else {
                var svSession = this.resources.W.Config.getSvSession();
                this._api.login(email, password, rememberMe, onSuccess, onError, initiator, svSession);
            }
        },

        register: function (email, password, onSuccess, onError, initiator) {
            if (!this._apiReady) {
                onError && onError({
                    code: "API_NOT_LOADED",
                    description: this.API_ERRORS.API_NOT_LOADED
                });
            } else {
                var svSession = this.resources.W.Config.getSvSession();
                this._api.register(email, password, onSuccess, onError, initiator, svSession);
            }
        },

        updateMemberDetails: function (memberDetails, onSuccess, onError) {
            if (!this._apiReady) {
                onError && onError({
                    code: "API_NOT_LOADED",
                    description: this.API_ERRORS.API_NOT_LOADED
                });
            } else if (!this._token) {
                onError && onError({
                    code: "TOKEN_IS_INVALID",
                    description: this.API_ERRORS.TOKEN_IS_INVALID
                });
            } else {
                this._api.updateMemberDetails(this._token, memberDetails, onSuccess, onError);
            }
        },

        getMemberDetails: function (onSuccess, onError) {
            if (this._memberDetails) {
                onSuccess(this._memberDetails);
            } else {
                if (!this._apiReady) {
                    onError && onError({
                        code: "API_NOT_LOADED",
                        description: this.API_ERRORS.API_NOT_LOADED
                    });
                } else if (!this._token) {
                    onError && onError({
                        code: "TOKEN_IS_INVALID",
                        description: this.API_ERRORS.TOKEN_IS_INVALID
                    });
                } else {
                    this._api.getMemberDetails(this._token, onSuccess, onError);
                }
            }
        },

        applyForMembership: function (email, password, onSuccess, onError) {
            if (!this._apiReady) {
                onError && onError({
                    code: "API_NOT_LOADED",
                    description: this.API_ERRORS.API_NOT_LOADED
                });
            } else {
                var svSession = this.resources.W.Config.getSvSession();
                this._api.apply(email, password, onSuccess, onError, svSession);
            }
        },

        logout: function () {
            this._retries = 0;
            if (this._isOwnerLoggedIn()) {
                this._informSiteOwnerToLogout();
                return false;
            } else {
                this._logoutSiteMember();
                return true;
            }
        },

        _logoutSiteMember: function() {
            if (!this._apiReady) {
                return;
            }
            var title = this.resources.W.Resources.get('SITE_MEMBER_MANAGER', "SITEMEMBERMANGAGER_LOGOUT_MESSAGES_TITLE", this.LOGOUT_MESSAGES.TITLE);
            var msg = this.resources.W.Resources.get('SITE_MEMBER_MANAGER', "SITEMEMBERMANGAGER_LOGOUT_MESSAGES_IN_PROGRESS", this.LOGOUT_MESSAGES.IN_PROGRESS);
            this.resources.W.MessagesController.showTryAgainMessage(title,
                msg,
                    this.MAX_NUMBER_OF_RETRIES * this.DELAY_OF_RETRY_IN_MS,
                this.logout.bind(this)) ;
            delete this._token;
            this._logoutUser();
        },

        _logoutUser: function () {
            this._api.logout();
            if (this._retries < this.MAX_NUMBER_OF_RETRIES && this._api.isSessionValid()) {
                this._retries++;
                this._logoutRetry();
            } else if (this._retries >= this.MAX_NUMBER_OF_RETRIES) {
                LOG.reportError(wixErrors.SM_LOGOUT_FAILED, "SiteMembersManager");
            } else {
                location.reload();
            }
        },

        _logoutRetry: function () {
            var $this = this;
            setTimeout(function () {
                $this._logoutUser();
            }, this.DELAY_OF_RETRY_IN_MS);
        },

        _informSiteOwnerToLogout: function () {
            var title = this.resources.W.Resources.get('SITE_MEMBER_MANAGER', "SITEMEMBERMANGAGER_OWNER_LOGOUT_ACTION_TITLE", this.OWNER_LOGOUT_ACTION.TITLE);
            var msg = this.resources.W.Resources.get('SITE_MEMBER_MANAGER', "SITEMEMBERMANGAGER_OWNER_LOGOUT_ACTION_MESSAGE", this.OWNER_LOGOUT_ACTION.MESSAGE);

            W.MessagesController.showMessage(title, msg, function () {
            });
        },

        _isOwnerLoggedIn: function () {
            return this.resources.W.Utils.cookies.hasCookie(this.WIX_USER_COOKIE_NAME) && this._isSiteBelongToUser();
        },

        _isSiteBelongToUser: function () {
            var memberDetails = null;
            var onSuccess = function (data) {
                memberDetails = data;
            };
            this.getMemberDetails(onSuccess, function () {
            });
            return memberDetails && memberDetails.owner === true;
        },

        getToken: function() {
            return this._token;
        },


        /**********************/
        /* Session and Cookie */
        /**********************/

        isLoggedIn: function() {
            var authState = this._getAuthenticationState();
            return authState == this.AUTH_STATES.AUTH;
        },

        isNotAuthenticatedWithCookie: function () {
            if (this.isLoggedIn()) {
                return false;
            }

            var authState = this._getAuthenticationState();
            return authState == this.AUTH_STATES.NO_AUTH_WITH_COOKIE;
        },

        _getAuthenticationState: function () {
            var isTokenAvailable = !!this._token;
            var isSessionCookieAvailable = (this._api ? this._api.isSessionValid() : false);

            if (isTokenAvailable) {
                return this.AUTH_STATES.AUTH;
            } else if (!isTokenAvailable && isSessionCookieAvailable) {
                return this.AUTH_STATES.NO_AUTH_WITH_COOKIE;
            } else if (!isTokenAvailable && !isSessionCookieAvailable) {
                return this.AUTH_STATES.NO_AUTH_WITHOUT_COOKIE;
            }
        },

        /**********************/
        /* Site Members Popup */
        /**********************/

        openSiteMembersPopup: function( cmdParams ) {
            var intent = cmdParams && cmdParams.intent;
            var authCallback = cmdParams && cmdParams.authCallback;

            if (!intent) {
                if (this.isNotAuthenticatedWithCookie()) {
                    intent = this.INTENTS.LOGIN;
                } else {
                    intent = this.INTENTS.REGISTER;
                }
            }

            var authIntents = [ this.INTENTS.LOGIN , this.INTENTS.REGISTER ];
            if (authIntents.contains( intent ) && this.isLoggedIn()) {
                this.injects().SiteMembers.getMemberDetails( function (memberDetails) {
                    this.reportAuthStatusChange(authCallback, true, memberDetails);
                }.bind(this));
            } else {
                var smViewMgr = this.injects().SiteMembers;

                if (this._siteMembersContainer) { // if already opened
                    this._previousContainer = this._siteMembersContainer._args;
                    this.closeSiteMembersPopup();
                }

                // NOTE: checking intent is a dirty fix due to urgency of the issue
                var canBeRequested = !this._openSiteMembersPopupRequested || intent === 'RESETPASSWORD';

                // if session is invalid and SM service is provisioned.
                if( smViewMgr.isApiReady() && !this._siteMembersContainer && canBeRequested){
                    this._openSiteMembersPopupRequested = true;
                    W.Components.createComponent('wysiwyg.viewer.components.sm.SMContainer', 'wysiwyg.viewer.skins.sm.SMContainerSkin', /* data */ null, cmdParams , function() {},
                        function(compLogic){ //component ready
                            if (this._previousContainer) {
                                compLogic._previousContainer = this._previousContainer;
                            }
                            this._siteMembersContainer = compLogic;
                            var viewNode = compLogic.getViewNode();
                            viewNode.setStyle("opacity", "0.0");
                            var siteNode = this.injects().Viewer.getSiteNode();
                            viewNode.insertInto(siteNode);
                            var fxShow = new Fx.Tween(viewNode, {'duration': 'short' ,'link': 'ignore'}).start('opacity', '1.0');
                        }.bind(this));
                }
            }
        },

        closeSiteMembersPopup: function() {
            if (this._siteMembersContainer) {
                var viewNode = this._siteMembersContainer.getViewNode();

                var fx_hide = new Fx.Tween(viewNode, {'duration': 'short' ,'link': 'chain'});
                fx_hide.addEvent('complete', function(){
                    fx_hide.removeEvent('complete', arguments.callee);
                    viewNode.removeFromDOM();
                }.bind(this));

                fx_hide.start('opacity', '0.0');
                delete this._siteMembersContainer;
                this._openSiteMembersPopupRequested = false;
            }

        },

        reportAuthStatusChange: function (authCallback, success, data) {
            if (authCallback) {
                authCallback ({
                    authResponse: success,
                    data: data
                });
            }
        }
    });

});
