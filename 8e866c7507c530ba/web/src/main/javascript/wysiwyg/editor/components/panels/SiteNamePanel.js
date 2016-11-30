define.component('wysiwyg.editor.components.panels.SiteNamePanel', function(componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SettingsSubPanel');

    def.binds(['_onConnectDomainClick']);

    def.skinParts({
        panelLabel  : { type: 'htmlElement', autoBindDictionary: 'SITE_NAME' },
        help       : { type: 'htmlElement' },
        close       : { type: 'htmlElement', command: 'this._closeCommand' },
        doneButton  : { type: 'wysiwyg.editor.components.WButton', autoBindDictionary: 'done', command: 'this._closeCommand' },
        content     : { type: 'htmlElement' }
    });

    def.states(['SiteNamePanel']);

    def.resources(['W.CookiesManager']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this.setState('SiteNamePanel');

            this._editorStatusAPI = this.injects().Editor.getEditorStatusAPI();

            this._appType = this.injects().Config.getApplicationType();
        },

        _createFields: function() {
            if (this._appType == Constants.WEditManager.SITE_TYPE_WEB) {
                this._addPanelHeader();
            }
            this._addPanelContent();
            this._addManageDomainsButton();
            this._addPremiumLabel();
        },

        _showHelp :function(){
            W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'SETTINGS_SUB_PANEL_SiteName');
        },

        _addPanelHeader: function() {
            this.addTitle(this._translate('SITE_NAME_TITLE_FULL'), null, 'bold');
            this.addSubLabel(this._translate('SITE_NAME_DESCRIPTION'), null);
        },

        _addPanelContent: function() {
            var isSaved = !this.injects().Config.siteNeverSavedBefore();
            var siteAddr = '';
            if (isSaved) {
                this._contentLabel = this._translate('SITE_NAME_SITE_ADDRESS_LABEL_BEFORE_PUBLISH');
                this._contentSublabel = this.injects().Config.getUserPublicUrl();
            } else {
                this._contentLabel = this._translate('SITE_NAME_SITE_ADDRESS_DESCRIPTION_BEFORE_SAVE');
                this._contentSublabel =  this.injects().Config.getUserPublicUrl() + "/" + this._translate('SITE_NAME_LITERALLY');
            }

            this.addLabel(this._contentLabel, null, 'bold');

            if (this._editorStatusAPI.isPreviouslyPublished()){
                siteAddr = this.addInlineTextLinkField(null, null, this._contentSublabel, null, null, null, null)
                    .addEvent('click', this._gotoSiteUrl);
            } else {
                siteAddr = this.addSubLabel(this._contentSublabel);
            }
            //Make address selectable
            siteAddr.getHtmlElement().addClass('selectableChildren');
        },

        _gotoSiteUrl: function() {
            window.open(this.injects().Config.getUserPublicUrl(), 'blank');
        },

        _addPremiumLabel: function() {
            var isPremium = this.injects().Config.isPremiumUser();
            if (isPremium) {
                this._manageUpgradeLabelIfPremium();
            }
            else {
                this._manageUpgradeLabelIfFree();
            }
            this.addBreakLine('20px');
            this._seoTipGroupProxy = this.addInputGroupField(function(panel){
                this.addInlineTextLinkField(null, panel._label);
                this.addInlineTextLinkField(null, null, panel._action)
                    .addEvent('click', panel._callback);

            }, 'purple');
        },

        _manageUpgradeLabelIfPremium:function(){
            this._template = "premiumSlogan";
            this._callback = this._onUpgradeClick;
            this._label = this._translate('SITE_NAME_WIX_UPGRADE_AD_VOUCHERS');
            this._action = this._translate('SITE_NAME_SWITCH_TO_YEARLY_PLAN');
        },

        _manageUpgradeLabelIfFree:function(){
            this._template = "slogan";
            this._callback = this._onConnectDomainClick;
            this._label    = (this._appType == Constants.WEditManager.SITE_TYPE_WEB ? this._translate('PURCHASE_PREMIUM_AND_CONNECT_DOMAIN') : this._translate('SITE_NAME_REMOVE_ADS'));
            this._action   = this._translate('HELPLET_LEARN_MORE');
        },

        _onConnectDomainClick: function() {
            var isSaved = !W.Config.siteNeverSavedBefore();
            var isPremium = W.Config.isPremiumUser();
            var i1 = isSaved ? (isPremium ? 2 : 1) : 0;  // if not saved = 0, saved = 1, saved+premium = 2
            LOG.reportEvent(wixEvents.SETTINGS_CONNECT_DOMAIN_CLICKED, { 'i1': i1 });
            var helpLink = this.getHelpLink();
            W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', helpLink);
        },

        getHelpLink:function(){
            var wixClientCookie = this.resources.W.CookiesManager.getCookie('wixClient');
            var helpLink = 'SiteAdressOpenHelp';
            if(wixClientCookie){
                if(wixClientCookie.indexOf("GOOGLE_DOMAIN")>0){
                    helpLink = 'SiteAdressOpenHelpForGoogleDomainCampaign';
                }
                else
                if(wixClientCookie.indexOf("REGRU")>0){
                    helpLink = 'SiteAdressOpenHelpForRegruDomainCampaign';
                }
            }
            return helpLink;
        },

        _addManageDomainsButton: function() {
            var isPremium = this.injects().Config.isPremiumUser();
            if (isPremium) {
                this.addButtonField(this._translate('SITE_NAME_CONNECT_THIS_DOMAIN'), this._translate('SITE_NAME_MANAGE_DOMAINS'))
                    .addEvent(Constants.CoreEvents.CLICK, this._onManageYourDomainClick);

                this.addSubLabel(this._translate('SITE_NAME_MANAGE_DOMAIN_NOTE'), null);
            }
        },

        _onUpgradeClick : function() {
            this.injects().Commands.executeCommand('WEditorCommands.UpgradeToPremium', {
                'referralAdditionalInfo': Constants.WEditManager.UPGRADE_SRC.SITE_NAME_PANEL
            });
        },

        _onManageYourDomainClick: function() {
            var isSaved = !W.Config.siteNeverSavedBefore();
            var isPremium = W.Config.isPremiumUser();
            var i1 = isSaved ? (isPremium ? 2 : 1) : 0;  // if not saved = 0, saved = 1, saved+premium = 2
            LOG.reportEvent(wixEvents.SETTINGS_CONNECT_DOMAIN_CLICKED, { 'i1': i1 });

            this.injects().Commands.executeCommand('WEditorCommands.ManageDomain');
        }
    });

});