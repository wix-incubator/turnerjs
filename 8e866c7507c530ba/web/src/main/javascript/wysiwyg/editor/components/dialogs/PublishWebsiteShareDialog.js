define.component('wysiwyg.editor.components.dialogs.PublishWebsiteShareDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds(['_onCheckBoxInputChanged', '_onPostInFacebookClick', '_onTweetInTwitterClick', '_onLearnMoreClick', '_closeDialog', '_onGoToMyAccountClick', '_markSiteAsPublishedBefore']);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });
    def.methods({
        initialize: function (compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);
            this._dialogWindow = attr.dialogWindow;
            this._editorStatusAPI = this.injects().Editor.getEditorStatusAPI();

            this._websiteUrl = this.injects().Config.getUserPublicUrl();
            this._firstTimePublish = !this._editorStatusAPI.isPreviouslyPublished();
            this._isPremiumUser = this.injects().Config.isPremiumUser();

            this._dialogName = attr.dialogName;
            this._setShowAgainStatusCallBack = attr.setShowAgainStatusCallBack;
        },

        _onAllSkinPartsReady: function () { //
            this.parent();
            this._dialogWindow.getViewNode().addEvent('dialogClosed', this._markSiteAsPublishedBefore);
        },

        _createFields: function () {
            this.setSkinSet('FLOATING_DIALOG');

            this.addLabel(this._translate('PUBLISH_WEB_SHARE_MAIN_LABEL'), null, null, 'icons/save_publish.png', {x: "-2px", y: "-56px"}, {width: '30px', height: '30px'});
            this.addSubLabel(this._translate('PUBLISH_WEB_SHARE_SUB_LABEL'));

            var panel = this;

            //Post in facebook button:
            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0);

                this.addButtonField(null, panel._translate('PUBLISH_WEB_SHARE_FACEBOOK_BUTTON'), null, 'icons/facebook_icon.png', 'facebook', '195px')
                    .addEvent(Constants.CoreEvents.CLICK, panel._onPostInFacebookClick);

                this.addButtonField(null, panel._translate('PUBLISH_WEB_SHARE_TWITTER_BUTTON'), null, 'icons/twitter_icon_new.png', 'twitter', '175px')
                    .addEvent(Constants.CoreEvents.CLICK, panel._onTweetInTwitterClick);

            }, null, null, null, null, 'center');

            this.addInputGroupField(function (panel) {
                this.setNumberOfItemsPerLine(0);
                this.addBreakLine('20px');

                panel._createCheckBox(this);
                this.addInlineTextLinkField("", "", panel._translate('PUBLISH_WEB_SHARE_CONTINUE_EDIT_LINK'), null)
                    .addEvent(Constants.CoreEvents.CLICK, panel._closeDialog)
                    .runWhenReady( function( labelLogic ) {
                        labelLogic._view.setStyle('float', 'right');
                    });

            }, 'skinless', null, null, null, 'center');
        },

        _createCheckBox:function(container){
            if(this._setShowAgainStatusCallBack){
                container.addBreakLine('15px');
                container.addCheckBoxField(W.Resources.get('EDITOR_LANGUAGE', 'DO_NOT_SHOW_THIS_MESSAGE_AGAIN'))
                    .addEvent('inputChanged', this._onCheckBoxInputChanged)
                    .runWhenReady( function( labelLogic ) {
                        labelLogic._view.setStyle('float','left');
                    });
            }
        },

        _onCheckBoxInputChanged:function(e){
            if(typeOf(this._setShowAgainStatusCallBack)==="function" && this._dialogName){
                this._setShowAgainStatusCallBack(this._dialogName, !e.value);
            }
        },

        _onPostInFacebookClick: function (event) {
            var params = {
                'url': this._websiteUrl,
                'text': this._firstTimePublish ? this._translate('PUBLISH_WEB_SHARE_FB_MSG_FIRSTTIME')
                    : this._translate('PUBLISH_WEB_SHARE_FB_MSG_NOT_FIRSTTIME')
            };

            this.injects().Commands.executeCommand('WEditorCommands.PostInFacebook', params);

            //report BI event
            LOG.reportEvent(wixEvents.POST_IN_FB_CLICKED_IN_PUBLISH_SHARE_DIALOG);
        },

        _onTweetInTwitterClick: function (event) {
            var params = {
                siteUrl: this._websiteUrl,
                isPremium: this._isPremiumUser
            };

            this.injects().Commands.executeCommand('WEditorCommands.ShareInTwitter', params);

            //report BI event
            LOG.reportEvent(wixEvents.POST_IN_TWITTER_CLICKED_IN_PUBLISH_SHARE_DIALOG);

        },

        _onLearnMoreClick: function (event) {
            window.open('http://promote.wix.com/seo/');
        },

        _onGoToMyAccountClick: function (event) {
            this.injects().Commands.executeCommand('WEditorCommands.GoToMyAcount');
        },

        _closeDialog: function () {
            this._markSiteAsPublishedBefore();
            this._dialogWindow.closeDialog();
            LOG.reportEvent(wixEvents.MAYBE_LATER_PROMOTE_DIALOG);
        },

        _markSiteAsPublishedBefore: function () {
            this._editorStatusAPI.markSiteAsPublishedBefore();
            this._dialogWindow.getViewNode().removeEvent('dialogClosed', this._markSiteAsPublishedBefore);
        }
    });

});
