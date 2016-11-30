define.component('wysiwyg.editor.components.dialogs.IntroDialog', function (componentDefinition) {
    //@type core.managers.component.ComponentDefinition
    var def = componentDefinition;
    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        'introVideoFrame': {type: 'htmlElement'},
        'text': {type: 'htmlElement' },
        'videoBorder': {type: 'htmlElement' },
        'textStart': {type: 'htmlElement'},
        'linkWrapper': {type: 'htmlElement'}
    });
    def.resources(['W.Resources', 'W.Commands', 'W.EditorDialogs']);

    def.traits(['core.editor.components.traits.DataPanel']);


    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._dialogName = args.dialogName;
            this._setShowAgainStatusCallBack = args.setShowAgainStatusCallBack;
            this._dialogWindow = args.dialogWindow;
        },

        _onAllSkinPartsReady: function () {
            var rec = this.resources.W.Resources;
            this._skinParts.textStart.set('text', rec.get('EDITOR_LANGUAGE', 'HELP_CENTER_LINK_START'));
            this._skinParts.linkWrapper.set('text', rec.get('EDITOR_LANGUAGE', 'HELP_CENTER_LINK_MIDDLE'));
            this._skinParts.linkWrapper.addEvent(Constants.CoreEvents.CLICK, this._onClick.bind(this));
            var localizedURL = rec.get('EDITOR_LANGUAGE', 'INTRO_VIDEO_URL');
            if (rec.getLanguageSymbol() === "en") {
                // new intro video - only in english for now
                localizedURL = 'https://www.youtube.com/embed/AaJqrm4s0GI?autoplay=1&rel=0&wmode=transparent&showinfo=0&autohide=1';
            }
            this._skinParts.introVideoFrame.set('src', localizedURL);

        },

        _onClick: function () {
            LOG.reportEvent(wixEvents.FROM_INTRO_VIDEO_TO_HELP_CENTER, {});
            this.resources.W.EditorDialogs.IntroVideoDialog.getLogic().closeDialog();
            this.resources.W.Commands.executeCommand('WEditorCommands.ShowHelpDialog', 'TopBar');

        }

    });
});








