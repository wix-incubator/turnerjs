define.experiment.component('wysiwyg.editor.components.dialogs.PublishWebsiteSuccessDialog.PublishMarketingBanner', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.methods({
        _createFields:function () {
            this.setSkinSet('FLOATING_DIALOG');

            var panel = this;

            this._websiteUrl = this.injects().Config.getUserPublicUrl();

            this.addLabel(this._translate('PUBLISH_WEB_SUCCESS_MAIN_LABEL'), null, null, 'icons/save_publish.png', {x:"-2px", y:"-28px"}, {width:'30px', height:'30px'});
            this.addSubLabel();

            this._createWebsiteAddressField();

            //            this.addInlineTextLinkField("","",this._translate('PUBLISH_WEB_SUCCESS_PREVIEW_BUTTON'),"").addEvent(Constants.CoreEvents.CLICK, this._onViewLiveSiteClick);
            //            this.addButtonField("",this._translate('PUBLISH_WEB_SUCCESS_PREVIEW_BUTTON')).addEvent(Constants.CoreEvents.CLICK, this._onViewLiveSiteClick);

            this._addPublishDelayNotification();

            this._isPremiumUser ? this._createFieldsForPremiumUser() : this._createFieldsForNotPremiumUser();

            this.addBreakLine('20px');

            this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(0);

                var bothFacebookAndMobileSitesCreated = panel._userHasMobileSite && panel._userHasFacebookSite;
                var continueButtonText = bothFacebookAndMobileSitesCreated ? this._translate('ok') : this._translate('PUBLISH_WEB_SUCCESS_CONTINUE_EDIT_LINK');

                //this.addInlineTextLinkField("", "", continueButtonText, "")
                //    .addEvent(Constants.CoreEvents.CLICK, panel._onNotNowClick);


                this.addButtonField("", W.Resources.get('EDITOR_LANGUAGE', 'OK_BUTTON'), null, null, 'blue', "60px")
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

        _createFieldsForNotPremiumUser:function(){
			var geoString = W.Experiments.isExperimentOpen("publishmarketingbannergeo") ? ("_" + window.editorModel.geo).toLowerCase() : '';
			var iconSrcByLang = "//static.parastorage.com/server/misc/editor_banners/Banner_" + window.wixEditorLangauge + geoString + ".jpg";
            this.addButtonField(null, "", false, {iconSrc:iconSrcByLang, iconSize:{width:520, height:82}}, 'upgradeSale', null, 'Publish_Marketing_Banner_ttid').addEvent(Constants.CoreEvents.CLICK, this._onUpgradeNowClick);
        }
    });
});
