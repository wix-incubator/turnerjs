/**
 * @class wysiwyg.viewer.managers.viewer.SiteMembersHandler
 */
define.Class('wysiwyg.viewer.managers.viewer.SiteMembersHandler', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('bootstrap.utils.Events');

    def.binds([]);

    def.resources(['W.Utils', 'W.Commands', 'W.Config']);

    /** @lends wysiwyg.viewer.managers.viewer.SiteMembersHandler */
    def.methods({
        //for now we'll pass the viewer instance
        initialize: function(viewer, siteNode){
            this._passwordLogin = null;
            this._validatedPages = null;
            this._siteNode = siteNode;
            this._viewer = viewer; //used for current page and mode checks
            this._registerCommands();
        },

        _registerCommands: function(){
            var cmds = this.resources.W.Commands;
            cmds.registerCommandAndListener('WViewerCommands.AdminLogin.Open', this, this._openAdminLogin);
            cmds.registerCommandAndListener('WViewerCommands.AdminLogin.Close', this, this._closeAdminLogin);
            cmds.registerCommandAndListener('WViewerCommands.SiteMembers.Open', this, this._openSiteMembersPopup);
            cmds.registerCommandAndListener('WViewerCommands.SiteMembers.Close', this, this._closeSiteMembersPopup);
            cmds.registerCommandAndListener('WViewerCommands.PasswordLogin.Open', this, this._openPasswordLogin);
            cmds.registerCommandAndListener('WViewerCommands.PasswordLogin.Close', this, this._closePasswordLogin);
        },

        setPageAsNotValidated: function (pageId) {
            if (!this._validatedPages) {
                this._validatedPages = {};
            }

            this._validatedPages[pageId] = false;

        },

        _closeAdminLogin: function () {
            this._closePasswordLogin();
        },

        _closePasswordLogin: function () {
            if (this._passwordLogin) {
                var viewNode = this._passwordLogin.getViewNode();
                var fx_hide = new Fx.Tween(viewNode, {'duration': 'short', 'link': 'ignore'});

                var completeCallback = function () {
                    fx_hide.removeEvent('complete', completeCallback);
                    viewNode.removeFromDOM();
                    delete this._passwordLogin;
                }.bind(this);
                fx_hide.addEvent('complete', completeCallback);
                fx_hide.start('opacity', '0.0');

                this._openPasswordLoginRequested = false;
            }
        },

        _openAdminLogin: function (cmdParams) {
            if (!cmdParams) {
                cmdParams = {};
            }
            cmdParams.clazz = "wysiwyg.viewer.components.AdminLogin";
            cmdParams.dataItem = W.Data.createDataItem({type: "Text"});
            this._openPasswordLogin(cmdParams);
        },

        _openPasswordLogin: function (cmdParams) {
            if (!this._passwordLogin && !this._openPasswordLoginRequested) {
                var args = cmdParams && cmdParams.args;
                var clazz = (cmdParams && cmdParams.clazz) || 'wysiwyg.viewer.components.PasswordLogin';
                var dataItem = (cmdParams && cmdParams.dataItem) || null;
                this._openPasswordLoginRequested = true;
                W.Components.createComponent(clazz, 'wysiwyg.viewer.skins.PasswordLoginSkin', dataItem, args, function () {},
                    function (compLogic) { //component ready
                        this._passwordLogin = compLogic;
                        var viewNode = compLogic.getViewNode();
                        viewNode.setStyle("opacity", "0");
                        compLogic.getViewNode().insertInto(this._siteNode);
                        compLogic.centerDialog();
                        var fxShow = new Fx.Tween(viewNode, {'duration': 'short', 'link': 'ignore'}).start('opacity', '1.0');
                    }.bind(this));
            }
        },

        _openSiteMembersPopup: function (cmdParams) {
            this.injects().SiteMembers.openSiteMembersPopup(cmdParams);
        },

        //Experiment SM.New was promoted to feature on Wed Oct 17 17:43:58 IST 2012
        _closeSiteMembersPopup: function () {
            this.injects().SiteMembers.closeSiteMembersPopup();
        },

        /**
         *
         * @param pageData
         * @param callback
         * @private
         */
        checkRequireLogin: function (pageData, callback,cameFromHashChange) {
            var isInPreviewOrPublicMode = this.resources.W.Config.env.isInInteractiveViewer();

            var pageSecurity = pageData.get("pageSecurity");
            var pageId = pageData.get("id");
            var fallbackPageId = this._getFallbackPage(pageId);
            var isFallbackPageNotAvailable = !fallbackPageId;


            if (isInPreviewOrPublicMode &&
                pageSecurity.requireLogin && !this.injects().SiteMembers.isLoggedIn() && !this._isProtectedPageValidated(pageId)) {
                var extData = ""; // I think that's true
                var title = pageData.get('pageUriSEO');
                var newHashString = this.resources.W.Utils.hash.getHashPartsString(pageId, title, extData);
                this.injects().SiteMembers.openSiteMembersPopup({
                    disableCancel: isFallbackPageNotAvailable,
                    hashRedirectTo:  "#"+newHashString,
                    cameFromHashChange:cameFromHashChange,
                    openedByPageSecurity: true,
                    dialogsLanguage: pageSecurity.dialogLanguage? pageSecurity.dialogLanguage :"en",
                    authCallback: function (authObj) {
                        this._onAuthCallback(authObj, pageId, fallbackPageId, callback);
                    }.bind(this)
                });
            }
            else if (isInPreviewOrPublicMode &&
                pageSecurity.passwordDigest && !this._isProtectedPageValidated(pageId)) {
                this.resources.W.Commands.executeCommand("WViewerCommands.PasswordLogin.Open", {
                    args: {
                        digestedPassword: pageSecurity.passwordDigest,
                        disableCancel: isFallbackPageNotAvailable,
                        dialogsLanguage: pageSecurity.dialogLanguage? pageSecurity.dialogLanguage :"en",
                        authCallback: function (authObj) {
                            this._onAuthCallback(authObj, pageId, fallbackPageId, callback);
                        }.bind(this)
                    }
                });
            }
            else {
                callback();
            }
        },

        _getFallbackPage: function (pageId) {
            var currentPageId = this._viewer.getCurrentPageId();
            var isCurrentlyOnSomePage = !!currentPageId;
            var mainPageId = W.Data.getDataMap().SITE_STRUCTURE.get("mainPage");
            mainPageId = (mainPageId ? mainPageId.replace("#", "") : "");
            if (isCurrentlyOnSomePage) {
                return currentPageId;
            }
            else if (pageId != mainPageId) {
                return mainPageId;
            }
            else {
                return null;
            }
        },

        _isProtectedPageValidated: function (pageId) {
            return this._validatedPages && this._validatedPages[pageId];

        },

        _onAuthCallback: function (authObj, pageId, fallbackPageId, callback) {
            if (authObj.authResponse) {
                this._setPageValidated(pageId);
                callback();
            }
            else if (authObj.data && authObj.data.cancel) {
                if (fallbackPageId) {
                    location.hash = fallbackPageId;
                }
                else {
                    // we shouldn't reach here, since the UI for cancelling the authentication popup
                    // should not appear when there's no page to fallback to. (see "disableCancel")
                    // as a fallback, I'm reloading the page, so the dialog will appear again, and the user will
                    // not be presented with a blank site.
                    location.reload();
                }
            }
        },

        _setPageValidated: function (pageId) {
            if (!this._validatedPages) {
                this._validatedPages = {};
            }

            this._validatedPages[pageId] = true;

        }
    });

});