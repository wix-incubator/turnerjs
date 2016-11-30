/**
 */

define.component('wysiwyg.editor.components.dialogs.PublishFbSiteDialog', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.binds([ '_onPublishClick', '_onSetUpFacebookPageClick', '_onHelpSetUpFacebookPageClick', '_onSupportPageClick' ]);
    def.traits(['core.editor.components.traits.DataPanel']);
    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.methods({
        initialize: function (compId, viewNode, attr) {
            this.parent(compId, viewNode, attr);
            this._dialogWindow = attr.dialogWindow;
            this._editorStatusAPI = this.injects().Editor.getEditorStatusAPI();

            //check if this is the first time that the site is published
            this._firstTimePublish = !this._editorStatusAPI.isPreviouslyPublished();
        },

        _createFields: function (panel) {
            this.setSkinSet('FLOATING_DIALOG');

            var mainLabel = this._firstTimePublish ? this._translate('PUBLISH_FB_MAIN_LABEL_FIRSTTIME')
                : this._translate('PUBLISH_FB_MAIN_LABEL_NOT_FIRSTTIME');

            this.addLabel(mainLabel);

            if (this._firstTimePublish) {
                this.addInlineTextLinkField(null, this._translate('PUBLISH_FB_SETUP_FB_PREFIX'), this._translate('PUBLISH_FB_SETUP_FB_LINK'), this._translate('PUBLISH_FB_SETUP_FB_POSTFIX'))
                    .addEvent(Constants.CoreEvents.CLICK, this._onSetUpFacebookPageClick);
            }
            else {
                this.addSubLabel(this._translate('PUBLISH_FB_AUTOMATIC_CHANGE_LABEL'));
            }

            this.addBreakLine('15px');

            this.addInputGroupField(function () {
                var publishButtonLabel = panel._firstTimePublish ? this._translate('PUBLISH_FB_PUBLISH_BUTTON_FIRSTTIME')
                    : this._translate('PUBLISH_FB_PUBLISH_BUTTON_NOT_FIRSTTIME');
                this.addInputGroupField(function () {
                    this.setNumberOfItemsPerLine(0);
                    this.addBreakLine('20px');
                    this.addButtonField(null, publishButtonLabel, null, null, 'blue')
                        .addEvent(Constants.CoreEvents.CLICK, panel._onPublishClick);
                }, 'skinless', null, null, null, 'center');
            }, 'skinless', null, null, null, 'center');

            this.addBreakLine('15px');

            if (panel._firstTimePublish) {
                this.addInputGroupField(function (panel) {
                    this.setNumberOfItemsPerLine(0);

                    this.addInlineTextLinkField(null, this._translate('PUBLISH_FB_HELP_SET_FB_PREFIX'), this._translate('PUBLISH_FB_HELP_SET_FB_LINK'), null)
                        .addEvent(Constants.CoreEvents.CLICK, panel._onHelpSetUpFacebookPageClick);

                    this.addInlineTextLinkField(null, this._translate('PUBLISH_FB_MORE_INFO_PREFIX'), this._translate('PUBLISH_FB_MORE_INFO_LINK'), null)
                        .addEvent(Constants.CoreEvents.CLICK, panel._onSupportPageClick);

                }, 'skinless', null, null, null, 'center');
            }
        },

        _onPublishClick: function (event) {
            this._dialogWindow.closeDialog();
            this.injects().Commands.executeCommand('WEditorCommands.Publish');

            //this command opens the FB installation app. it will be opened without waiting for an answer
            //from the server regarding publish success/fail. It is because if we wait for an answer, it may cause the
            //browser to block the pop up, since the popup request is not immediate after UI action, such as a click:
            this._openFacebookApplicationPage();

        },

        _openFacebookApplicationPage: function () {
            var siteUrl = this.injects().Config.getUserPublicUrl();
            var metaSiteId = this.injects().Config.getMetaSiteId();

            var siteHeight = this.injects().Preview.getPreviewManagers().Viewer.getSiteHeight();
            var footerAdHeight = 20;
            var siteHeightWithAdHeight = siteHeight + footerAdHeight;

            window.open('http://fb.flashquix.com/wix/start.php?siteUrl=' + siteUrl + '&h=' + siteHeightWithAdHeight + '&metaSiteId=' + metaSiteId + '&callback=json');

        },


        _onSetUpFacebookPageClick: function (event) {
            window.open('https://www.facebook.com/pages/create.php');
        },

        _onHelpSetUpFacebookPageClick: function (event) {
            window.open('https://www.facebook.com/pages/create.php');
        },

        _onSupportPageClick: function (event) {
            window.open('http://www.wix.com/support/main/html5/facebook/using-facebook-templates');
        }
    });
});
