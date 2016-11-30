define.experiment.component('wysiwyg.editor.components.dialogs.PublishWebsiteSuccessDialog.EditorSupportForMarketingBanner', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.resources(['W.CookiesManager', 'W.Commands', 'W.Editor']);

    def.methods({
        _createFields: function () {
            this.setSkinSet('FLOATING_DIALOG');
            var panel = this;
            this._websiteUrl = this.injects().Config.getUserPublicUrl();

            this.addLabel(this._translate('PUBLISH_WEB_SUCCESS_MAIN_LABEL'), null, null, 'icons/save_publish.png', {x: '-2px', y: '-28px'}, {width: '30px', height: '30px'});
            this.addSubLabel();
            this._createWebsiteAddressField();
            this._addPublishDelayNotification();
            if (_.contains(_.pluck(editorModel.permissionsInfo.loggedInUserRoles, 'role'), 'owner')) {
                this._isPremiumUser ? this._createFieldsForPremiumUser() : this._createFieldsForNotPremiumUser();
            }

            this.addBreakLine('20px');

            this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(0);

                this.addButtonField('', W.Resources.get('EDITOR_LANGUAGE', 'OK_BUTTON'), null, null, 'blue', '60px')
                    .addEvent(Constants.CoreEvents.CLICK, panel._onNotNowClick)
                    .runWhenReady(function (buttonLogic) {
                        buttonLogic.disable();
                        panel.buttonLogic = buttonLogic;

                        // this condition is in case that the site was loaded before the registration to the siteLoaded command:
                        var siteLoadedCommand = panel.injects().Commands.getCommand('EditorCommands.SiteLoaded');
                        if (siteLoadedCommand && siteLoadedCommand.getNumTimesExecuted() > 0) {
                            buttonLogic.enable();
                        }
                    });
            }, 'skinless', null, null, null, 'right');
        },

        _createFieldsForNotPremiumUser: function(){
            if (W.Editor._campaignInfo) {
                var bannerSrc = 'http://assets.parastorage.com/apples/editor/' + W.Editor._campaignInfo + '/apple_' + (window.wixEditorLangauge).toLowerCase() + '.png';
                this.addButtonField(null, '', false, {iconSrc: bannerSrc, iconSize: {width: 520, height: 82}}, 'upgradeSale', null, 'Publish_Marketing_Banner_ttid')
                    .addEvent(Constants.CoreEvents.CLICK, this._onUpgradeNowClick);
            } else {
                this.addBreakLine('20px');
                this.addInputGroupField(function (panel) {
                    this.setSkinSet('FLOATING_DIALOG');
                    var message = panel._getUpgradeMessage();
                    this.addButtonField(null, this._translate('PUBLISH_WEB_SUCCESS_UPGRADE_BUTTON'), null, null, 'upgrade')
                        .addEvent(Constants.CoreEvents.CLICK, panel._onUpgradeNowClick)
                        .runWhenReady(function(logic) {
                            logic._skinParts.view.setStyles({'float':'right', 'margin':'5px -11px'});
                        });
                    this.addSubLabel(message)
                        .runWhenReady( function( logic ) {
                            logic._skinParts.view.setStyle('width', '290px');
                            logic._skinParts.label.setStyles({'max-width': '290px', 'margin-bottom': '0.4em'});
                        });
                });
            }
        },

        _onUpgradeNowClick: function (event) {
            this._closeDialog();
            this.injects().Commands.executeCommand('WEditorCommands.UpgradeToPremium', {'referralAdditionalInfo': Constants.WEditManager.UPGRADE_SRC.PUBLISH_WEBSITE_SUCCESS_DIALOG});

            W.Editor._campaignInfo ? LOG.reportEvent(wixEvents.UPGRADE_NOW_PUBLISH_SUCCESS_WITH_CAMPAIGN, {c1: W.Editor._campaignInfo}) : LOG.reportEvent(wixEvents.UPGRADE_NOW_PUBLISH_SUCCESS);
        }
    });
});
