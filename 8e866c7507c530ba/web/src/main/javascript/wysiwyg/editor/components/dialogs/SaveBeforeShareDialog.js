define.component("wysiwyg.editor.components.dialogs.SaveBeforeShareDialog", function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.binds(['_onContinueEditingClick', '_onSave']);

    def.resources(['W.EditorDialogs']);

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._dialogWindow = args.dialogWindow;
        },
        _createFields: function (panel) {
            this.setSkinSet('FLOATING_DIALOG');
            this.addLabel(this._translate("SAVE_BEFORE_YOU_SHARE", "Before you share, Save your work"), null, null, 'icons/save_publish.png', {x: "-2px", y: 0}, {width: "30px", height: "30px"});
            this.addSubLabel( this._translate('FEEDBACK_SITE_VISIBILITY_WARN', "Don't worry, your site is still private and will only be shown to the world<br/>when you choose to publish it."));
            this.addInlineTextLinkField(null, null, this._translate('SAVE_NOW_BUTTON', 'Save Now'), null)
                .addEvent(Constants.CoreEvents.CLICK, panel._onSave);
            this.addInlineTextLinkField(null, null,  this._translate('SAVE_DIALOG_CONTINUE_EDIT_LINK', 'Not now thank you, continue editing'), null)
                .addEvent(Constants.CoreEvents.CLICK, panel._onContinueEditingClick);
        },
        _onSave: function () {
            this._dialogWindow.closeDialog();
            this.resources.W.EditorDialogs.openSaveDialog();
        },

        _onContinueEditingClick: function () {
            this._dialogWindow.closeDialog();
        }
    });
});
