define.component('wysiwyg.editor.components.dialogs.PublishFbSiteSuccessDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds([ '_onViewLiveSiteClick', '_onUpgradeNowClick', '_closeDialog', '_onCreateWebsiteClick', '_onCreateMobileSiteClick', '_onPromotePremiumClick', '_markSiteAsPublishedBefore' ]);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.methods({
        initialize: function (compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);
            this._dialogWindow = attr.dialogWindow;
            this._editorStatusAPI = this.injects().Editor.getEditorStatusAPI();

            // check if this is the first time that the site is published
            this._firstTimePublish = !this._editorStatusAPI.isPreviouslyPublished();
            //            this._firstTimePublish = (window.siteHeader.revision == 0) ;

            this._isPremiumUser = this.injects().Config.isPremiumUser();
            this._userHasWebSite = this.injects().Config.userHasWebSite();
            this._userHasMobileSite = this.injects().Config.userHasMobileSite();
        },

        _onAllSkinPartsReady: function () {
            this.parent();
            this._dialogWindow.getViewNode()
                .addEvent('dialogClosed', this._markSiteAsPublishedBefore);
        },

        _createFields: function (panel) {
            this.setSkinSet('FLOATING_DIALOG');

            this.addLabel(this._translate('PUBLISH_FB_SUCCESS_MAIN_LABEL'), null, null, 'icons/save_publish.png', {x: "-2px", y: "-28px"}, {width: '30px', height: '30px'});
            var subLabelText = this._firstTimePublish ? this._translate('PUBLISH_FB_SUCCESS_SUB_LABEL_FIRSTTIME')
                : this._translate('PUBLISH_FB_SUCCESS_SUB_LABEL_NOT_FIRSTTIME');

            this.addSubLabel(subLabelText);

            if (!this._isPremiumUser) {
                this.addInputGroupField(function () {
                    this.setSkinSet('FLOATING_DIALOG');

                    this.setNumberOfItemsPerLine(2, '210px');

                    this.addSubLabel(this._translate('PUBLISH_FB_SUCCESS_RMV_WIX_ADS'), null, null, null);
                    this.addButtonField(null, this._translate('PUBLISH_FB_SUCCESS_UPGRADE_BUTTON'), null, null, 'upgrade')
                        .addEvent(Constants.CoreEvents.CLICK, panel._onUpgradeNowClick);
                });
            }

            //Premium user
            else {
                this.addInputGroupField(function () {
                    this.setNumberOfItemsPerLine(2, "120px");

                    if (!this._userHasWebSite) {
                        this.addLabel(this._translate('PUBLISH_FB_SUCCESS_CREATE_WEBSITE_BUTTON_LABEL'));
                        this.addButtonField(null, this._translate('PUBLISH_FB_SUCCESS_CREATE_WEBSITE_BUTTON'), null, null, 'action', '150px')
                            .addEvent(Constants.CoreEvents.CLICK, panel._onCreateWebsiteClick);
                    }
                    else {
                        this.addLabel(this._translate('PUBLISH_FB_WEBSITE_CREATED'), null, null, 'icons/save_publish.png', {x: "-2px", y: "-28px"}, {width: '30px', height: '30px'});
                    }
                });

            }

            this.addBreakLine('15px');

            this.addInputGroupField(function () {
                this.setNumberOfItemsPerLine(0);

                this.addInlineTextLinkField(null, null, this._translate('PUBLISH_FB_SUCCESS_CONTINUE_EDIT_LINK'), null)
                    .addEvent(Constants.CoreEvents.CLICK, panel._closeDialog);
            }, 'skinless', null, null, null, 'right');
        },

        _onUpgradeNowClick: function (event) {
            this.injects().Commands.executeCommand('WEditorCommands.UpgradeToPremium', {'referralAdditionalInfo': Constants.WEditManager.UPGRADE_SRC.PUBLISH_FB_SITE_SUCCESS_DIALOG});
        },

        _onCreateWebsiteClick: function (event) {
            var createWebsiteUrl = this.injects().Config.getCreateWebsiteLink();
            window.open(createWebsiteUrl);
        },

        _onCreateMobileSiteClick: function (event) {
            var createMobileSiteUrl = this.injects().Config.getCreateMobileSiteLink();
            window.open(createMobileSiteUrl);
        },

        _onPromotePremiumClick: function (event) {
            //TODO
        },

        _closeDialog: function () {
            this._markSiteAsPublishedBefore();
            this._dialogWindow.closeDialog();
        },

        _markSiteAsPublishedBefore: function () {
            this._editorStatusAPI.markSiteAsPublishedBefore();
        }
    });

});