define.component('wysiwyg.editor.components.dialogs.PublishWebsiteSuccessDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds(
        ['_onViewLiveSiteClick', '_onUpgradeNowClick', '_onNotNowClick', '_goToPublishShareDialog', '_onCreateFacebookSiteClick', '_onCreateMobileSiteClick']
    );
    def.resources(['W.CookiesManager', 'W.Commands']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.methods({
        initialize: function (compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);
            this._dialogWindow = attr.dialogWindow;

            this._isPremiumUser = this.injects().Config.isPremiumUser();
            this._userHasFacebookSite = this.injects().Config.userHasFacebookSite();
            this._userHasMobileSite = this.injects().Config.userHasMobileSite();
        },

        _onAllSkinPartsReady: function () {
            this.parent();
            this._dialogWindow.addEvent('cancelButtonClicked', this._goToPublishShareDialog);
            this.resources.W.Commands.executeCommand('WEditorCommands.PublishComplete')
        },

        _createFields: function () {
            this.setSkinSet('FLOATING_DIALOG');

            var panel = this;

            this._websiteUrl = this.injects().Config.getUserPublicUrl();

            this.addLabel(this._translate('PUBLISH_WEB_SUCCESS_MAIN_LABEL'), null, null, 'icons/save_publish.png', {x: "-2px", y: "-28px"}, {width: '30px', height: '30px'});
            this.addSubLabel();

            this._createWebsiteAddressField();

            //            this.addInlineTextLinkField("","",this._translate('PUBLISH_WEB_SUCCESS_PREVIEW_BUTTON'),"").addEvent(Constants.CoreEvents.CLICK, this._onViewLiveSiteClick);
            //            this.addButtonField("",this._translate('PUBLISH_WEB_SUCCESS_PREVIEW_BUTTON')).addEvent(Constants.CoreEvents.CLICK, this._onViewLiveSiteClick);

            this._addPublishDelayNotification();

            this._isPremiumUser ? this._createFieldsForPremiumUser() : this._createFieldsForNotPremiumUser();
            this.addBreakLine('20px');

            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0);

                //var bothFacebookAndMobileSitesCreated = panel._userHasMobileSite && panel._userHasFacebookSite;
                //var continueButtonText = bothFacebookAndMobileSitesCreated? this._translate('ok') : this._translate('PUBLISH_WEB_SUCCESS_CONTINUE_EDIT_LINK');

                //this.addInlineTextLinkField("","",continueButtonText,"")
                //    .addEvent(Constants.CoreEvents.CLICK, panel._onNotNowClick);


                this.addButtonField("", panel._translate('OK_BUTTON'), null, null, 'blue', "60px")
                    .addEvent(Constants.CoreEvents.CLICK, panel._onNotNowClick)
                    .runWhenReady(function (buttonLogic) {
                        buttonLogic.disable();
                        panel.buttonLogic = buttonLogic;

                        //this condition is in case that the site was loaded before the registration to the siteLoaded command:
                        var siteLoadedCommand = panel.injects().Commands.getCommand('EditorCommands.SiteLoaded');
                        if (siteLoadedCommand && siteLoadedCommand.getNumTimesExecuted() > 0) {
                            buttonLogic.enable();
                        }

                    });


            }, 'skinless', null, null, null, 'right');
        },

        _createWebsiteAddressField: function (){
            this.addInlineTextLinkField(this._translate('PUBLISH_WEB_SUCCESS_URL_LABEL'), "", this._websiteUrl, "", null, null, 'selectable')
                .addEvent(Constants.CoreEvents.CLICK, this._onViewLiveSiteClick);
            var wixClientCookie = this.resources.W.CookiesManager.getCookie('wixClient');
            if(wixClientCookie.indexOf("GOOGLE_DOMAIN")>0 || wixClientCookie.indexOf("REGRU")>0){
                this.addBreakLine('10px');
                this.addSubLabel(this._translate('PUBLISH_WEB_SUCCESS_CONNECT_DOMAIN_MESSAGE'))
                    .runWhenReady( function( logic ) {
                        logic._skinParts.view.setStyle('margin-bottom', '-8px');
                    });
            }
        },

        _createFieldsForNotPremiumUser:function(){
            this.addBreakLine('20px');
            this.addInputGroupField(function (panel) {
                this.setSkinSet('FLOATING_DIALOG');
                var message = panel._getUpgradeMessage();
                this.addButtonField(null, this._translate('PUBLISH_WEB_SUCCESS_UPGRADE_BUTTON'), null, null, 'upgrade')
                    .addEvent(Constants.CoreEvents.CLICK, panel._onUpgradeNowClick)
                    .runWhenReady( function( logic ) {
                        logic._skinParts.view.setStyles({'float':'right', 'margin':'5px -11px'});
                    });
                this.addSubLabel(message)
                    .runWhenReady( function( logic ) {
                        logic._skinParts.view.setStyle('width','290px');
                        logic._skinParts.label.setStyles({'max-width': '290px', 'margin-bottom': '0.4em'});
                    });
            });
        },

        _getUpgradeMessage:function(){
            var wixClientCookie = this.resources.W.CookiesManager.getCookie('wixClient');
            var key = 'PUBLISH_WEB_SUCCESS_UPGRADE_FEATURES';
            if(wixClientCookie){
                if(wixClientCookie.indexOf("GOOGLE_DOMAIN")>0){
                    key = 'PUBLISH_WEB_SUCCESS_UPGRADE_FEATURES_GOOGLE_CAMPAIGN';
                }
                else if(wixClientCookie.indexOf("REGRU")>0){
                    key = 'PUBLISH_WEB_SUCCESS_UPGRADE_FEATURES_REGRU_CAMPAIGN';
                }
            }
            return this._translate(key);
        },

        _onViewLiveSiteClick: function (event) {
            window.open(this._websiteUrl);
            LOG.reportEvent(wixEvents.CLICK_SITE_LINK_PUBLISH_SUCCESS);
        },

        _onUpgradeNowClick: function (event) {
            this._closeDialog();
            this.injects().Commands.executeCommand('WEditorCommands.UpgradeToPremium', {'referralAdditionalInfo': Constants.WEditManager.UPGRADE_SRC.PUBLISH_WEBSITE_SUCCESS_DIALOG});
            LOG.reportEvent(wixEvents.UPGRADE_NOW_PUBLISH_SUCCESS);
        },

        _onNotNowClick: function (event) {
            this._closeDialog();
        },

        _closeDialog: function () {
            this._dialogWindow.closeDialog();
            this.injects().Commands.executeCommand('WEditorCommands.OpenPublishWebsiteShareDialog');
        },

        _goToPublishShareDialog: function () {
            this.injects().Commands.executeCommand('WEditorCommands.OpenPublishWebsiteShareDialog');
            this._dialogWindow.removeEvent('cancelButtonClicked', this._goToPublishShareDialog);
        },

        _onCreateFacebookSiteClick: function (event) {
            var createFacbookSiteUrl = this.injects().Config.getCreateFacebookSiteLink();
            window.open(createFacbookSiteUrl);
        },

        _onCreateMobileSiteClick: function (event) {
            var createMobileSiteUrl = this.injects().Config.getCreateMobileSiteLink();
            window.open(createMobileSiteUrl);
        },

        _addPublishDelayNotification: function () {
            return null;
        },
        _createFieldsForPremiumUser:function(){
            this.addBreakLine('20px');
            this.addInputGroupField(function (panel) {
                this.setSkinSet('FLOATING_DIALOG');
                var skinName = 'businessApps';
                this.addButtonField(null, this._translate('PUBLISH_WEB_SUCCESS_BUSINESS_APPS_BUTTON'), null, null, skinName)
                    .addEvent(Constants.CoreEvents.CLICK, panel._onMyAccountPageLinkClick.bind(panel))
                    .runWhenReady( function( logic ) {
                        logic._skinParts.view.setStyles({'float':'right', 'margin':'5px 4px'});
                    });
                this.addSubLabel(this._translate('PUBLISH_WEB_SUCCESS_BUSINESS_APPS_DESC'), null, skinName)
                    .runWhenReady( function( logic ) {
                        logic._skinParts.view.setStyle('width','290px');
                        logic._skinParts.label.setStyles({'max-width': '290px', 'margin-bottom': '0.4em'});
                    });

            });
        },
        _onMyAccountPageLinkClick: function () {
            var url = this.injects().Config.getBusinessAppsPageUrl();
            window.open(url);

            LOG.reportEvent({
                'desc': 'User clicked business apps banner',
                'biEventId': 291,
                'timerId': 'main',
                'biAdapter': 'mlt'
            });

            this._closeDialog();
        }
    });

});
