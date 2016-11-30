define.Class('wysiwyg.editor.commandregistrars.AccountCommandRegistrar', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.binds(['_onPublishError']);

    def.resources(['W.Commands']);

    def.methods({
        initialize: function () {

        },

        registerCommands : function() {
            var cmdmgr = this.resources.W.Commands;

            //Account related commands:
            //-------------------------
            this._upgradeToPremiumCommand = cmdmgr.registerCommandAndListener("WEditorCommands.UpgradeToPremium", this, this._onUpgradeToPremiumCommand);
            this._publishCommand = cmdmgr.registerCommandAndListener("WEditorCommands.Publish", this, this._onPublishCommand);
            this._goToMyAcountCommand = cmdmgr.registerCommandAndListener("WEditorCommands.GoToMyAcount", this, this._onGoToMyAcountCommand);
            this._manageDomainCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ManageDomain", this, this._onManageDomainCommand);
            this._postInFacebookCommand = cmdmgr.registerCommandAndListener("WEditorCommands.PostInFacebook", this, this._onPostInFacebookCommand);
            this._postInTwitterCommand = cmdmgr.registerCommandAndListener("WEditorCommands.ShareInTwitter", this, this._onShareInTwitterCommand);
        },

        //############################################################################################################
        // ACCOUNT RELATED COMMANDS
        //############################################################################################################

        _onUpgradeToPremiumCommand:function (param, cmd) {
            var isSaved = !W.Config.siteNeverSavedBefore();
            var isPremium = W.Config.isPremiumUser();
            var isTpa = param && param.type && param.type === 'app';

            // report bi
            var i1 = isSaved ? (isPremium ? 2 : 1) : 0;  // if not saved = 0, saved = 1, saved+premium = 2
            if (isTpa) {
                LOG.reportEvent(wixEvents.TPA_UPGRADE_BUTTON_CLICKED, { c1:param.referralAdditionalInfo, g1:param.appDefinitionId, i1:i1});
            }
            else {
                LOG.reportEvent(wixEvents.UPGRADE_BUTTON_CLICKED, { c1:param.referralAdditionalInfo, i1:i1 });
            }

            if (!isSaved) {
                var description = W.Resources.get('EDITOR_LANGUAGE', 'MUST_SAVE_BEFORE_PUBLISH');
                var params = {
                    description:description
                };
                W.EditorDialogs.openSaveDialog(params);
            }
            else {
                var url = this._getBaseUpgradeUrl(isTpa, isPremium);
                var metasiteId = W.Config.getMetaSiteId();

                // build url query
                var query = "?referralAdditionalInfo=edhtml_" + param.referralAdditionalInfo;

                if (isTpa) {
                    query += "&metaSiteId=" + metasiteId +
                        "&applicationId=" + param.applicationId +
                        "&appDefinitionId=" + param.appDefinitionId +
                        "&vendorProductId=" + param.vendorProductId +
                        "&paymentCycle=MONTHLY";
                } else {
                    query += "&siteGuid=" + metasiteId;
                }

                // chrome is the only browser that will open the TPA upgrade page in a popup, hence
                // we need to set the size. Otherwise it will use the default which is currently
                // set to 100x100
                var userAgent = window.navigator.userAgent.toLowerCase();
                var isChrome = userAgent.indexOf("chrome") > -1;
                if (isTpa && isChrome) {
                    window.open(url + query, '_blank', 'width=' + window.screen.width + ',height=' + window.screen.height);
                } else {
                    window.open(url + query);
                }

                W.EditorDialogs.openPromptDialog(
                    W.Resources.get('EDITOR_LANGUAGE', 'REFRESH_WHEN_UPGRADE_COMPLETED_TITLE'),
                    W.Resources.get('EDITOR_LANGUAGE', 'REFRESH_WHEN_UPGRADE_COMPLETED_DESCRIPTION'),
                    "",
                    W.EditorDialogs.DialogButtonSet.OK
                );
            }
        },

        /**
         *
         * @param isTpa
         * @param isPremium  -> is in use in an experiment
         * @returns {string}
         * @private
         */
        _getBaseUpgradeUrl: function(isTpa, isPremium){
            var premiumServerUrl = window.serviceTopology.premiumServerUrl;
            if(isTpa){
                return premiumServerUrl + '/wix/api/tpaStartPurchase';
            }
            return premiumServerUrl + '/wix/api/premiumStart';
        },

        _onPublishCommand:function () {
            if (!W.Preview.isSiteReady()) {
                return;
            }

            var param = {};
            param.isPublished = true;
            param.promptResultDialog = true;
            param.onCompleteCallback = function () {

                if (W.Config.getApplicationType() == Constants.WEditManager.SITE_TYPE_FACEBOOK) {
                    W.ServerFacade.publishDocument(window.siteHeader.id,

                        //fb publish onSuccess callback:
                        function () {
                            this._removeSaveFreeze();
                            this.resources.W.Commands.executeCommand('WEditorCommands.OpenPublishFbSiteSuccessDialog');

                        }.bind(this),

                        //fb publish onFailure callback:
                        function (errorDescription, errorCode) {
                            this._removeSaveFreeze();
                            W.Utils.errorPopup(
                                W.Resources.get('EDITOR_LANGUAGE', 'ERROR_PUBLISH_DOCUMENT_FB_TITLE'),
                                W.Resources.get('EDITOR_LANGUAGE', 'ERROR_PUBLISH_DESC') + ' (' + errorCode + ')',
                                ''
                            );
                        }.bind(this));

                    //if you want that the publish sucess dialog will be prompted even in case of failure (for debugging), uncomment this line:
                    //console.log('-*-');
                    //this.resources.W.Commands.executeCommand('WEditorCommands.OpenPublishFbSiteSuccessDialog');
                }

                else { // (W.Config.getApplicationType() == Constants.WEditManager.SITE_TYPE_WEB)
                    W.ServerFacade.publishDocument(siteHeader.id,

                        //web publish onSuccess callback:
                        function() {
                            this._executePostPublishActions( function() {
                                this._removeSaveFreeze();
                                this.resources.W.Commands.executeCommand('WEditorCommands.OpenPublishWebsiteSuccessDialog');
                            }.bind(this), this._onPublishError);
                        }.bind(this),
                        this._onPublishError);

                    //if you want that the publish success dialog will be prompted even in case of failure (for debugging), uncomment this line:
                    //console.log('-*-');
                    //this.resources.W.Commands.executeCommand('WEditorCommands.OpenPublishWebsiteSuccessDialog');
                }
            }.bind(this);

            // save document before publish to template
            this.injects().Commands.executeCommand('WEditorCommands.Save', param);

            if (!window.FB) {
                this._initFacebookSDK();
            }
        },

        _onPublishError: function (errorDescription, errorCode) {
              this._removeSaveFreeze();
              var errorUtils = W.Utils.EditorErrorUtils;
              var msg = errorUtils.getErrorMsg(errorCode, 'ERROR_PUBLISH_DESC');
              W.EditorDialogs.openPromptDialog(
                  W.Resources.get('EDITOR_LANGUAGE', 'ERROR_PUBLISH_TITLE'),
                  msg,
                  "",
                  W.EditorDialogs.DialogButtonSet.OK,
                  function() {
                  }
              );
          },

        _executePostPublishActions: function (onSuccess, onError) {
               W.AppsEditor2.publishDraft(onSuccess, onError);
         },

        _removeSaveFreeze:function () {
            var blockArea = $('TEMP_SAVE_FREEZE');
            if (blockArea && blockArea.dispose) {
                blockArea.dispose();
            }
        },

        _onGoToMyAcountCommand:function () {
            var dashboardUrl = window.serviceTopology.dashboardUrl;
            window.open(dashboardUrl);

            //wtf??
            this._closeDialog();
        },

        _onManageDomainCommand:function () {
            var premiumServerUrl = window.serviceTopology.premiumServerUrl;
            window.open(premiumServerUrl + '/wix/api/domainViewForm?domainName=anotherpleskdomainfortest.com&');
        },

        _onPostInFacebookCommand : function(param) {
            var shareData = this._getFacebookShareData(param);

            if (window.FB) {
                FB.ui(shareData);
            }
        },

        _onShareInTwitterCommand:function (params) {
            var msg = params.isPremium? W.Resources.get('EDITOR_LANGUAGE', 'TWITTER_CHECK_OUT_MY_SITE_MSG_PREMIUM') : W.Resources.get('EDITOR_LANGUAGE', 'TWITTER_CHECK_OUT_MY_SITE_MSG_NON_PREMIUM');
            msg = decodeURIComponent(msg);
            window.open('https://twitter.com/intent/tweet?url='+params.siteUrl+'&text='+msg+'&related='+W.Resources.get('EDITOR_LANGUAGE', 'TWITTER_RELATED_WIX_ACCOUNTS')+'&hashtags='+W.Resources.get('EDITOR_LANGUAGE', 'TWITTER_WIX_HASHTAGS'));
        },

        _getFacebookShareData: function(param) {
            if (!param || !param.url){
                return;
            }
            var settings = this.injects().Data.getDataMap().SITE_SETTINGS.getData();
            var siteName = settings.siteTitleSEO || this.injects().Preview.getPreviewManagers().Viewer.getSiteName();
            var description = settings.siteDescriptionSEO || "";
            var lang = window.editorModel.languageCode;
            var campaign = "vir_fb_pub_h";
            var link = 'http://' + lang + '.wix.com/html5webbuilder/share';
            var linkParams = "?utm_campaign=" + campaign + "_" + lang + "&experiment_id=";
            var urlNoHttp = param.url.replace(/https?:\/\//, '');

            return {
                method: "feed",
                name: siteName,
                description: description,
                link: param.url,
                actions: [{
                    name: W.Resources.get('EDITOR_LANGUAGE', 'FBSHARE_MARKETING_MESSAGE'),
                    link: link + linkParams + urlNoHttp
                }]
            };
        },

        _initFacebookSDK: function() {
            var appId = window.location.host.indexOf("wix.com") !== -1 ? '304553036307597' : '394905507233800',
                initData = {appId: appId, status: true, cookie: true, xfbml: 1, version: 'v2.0'};

            if (!define.getDefinition('resource', 'FacebookApi')) {
                define.resource('FacebookApi').withUrls('//connect.facebook.net/en_US/sdk.js');
            }

            window.resource.getResourceValue('FacebookApi', function() {
                window.FB.init(initData);
            });
        }
    });
});