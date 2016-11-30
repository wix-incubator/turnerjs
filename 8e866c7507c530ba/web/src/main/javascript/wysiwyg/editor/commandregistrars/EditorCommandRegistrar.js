/**@class  wysiwyg.editor.commandregistrars.EditorCommandRegistrar*/
define.Class('wysiwyg.editor.commandregistrars.EditorCommandRegistrar', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.resources(['W.Commands']);
    def.binds([]);
    /**@lends wysiwyg.editor.commandregistrars.EditorCommandRegistrar*/
    def.methods({
        initialize: function () {
        },

        /**
         *
         */
        registerCommands: function () {
            var cmdmgr = this.resources.W.Commands;

            // General editor commands:
            //-------------------------

            this._setEditModeCommand = cmdmgr.registerCommandAndListener("WEditorCommands.WSetEditMode", this, this._onSetEditMode);
            this._setViewerModeCommand = cmdmgr.registerCommandAndListener("WEditorCommands.SetViewerMode", this, this._onSetViewerMode);
        },

        //############################################################################################################
        //# G E N E R A L   E D I T O R    C O M M A N D S
        //############################################################################################################

        _onSetEditMode: function (param, cmd) {
            if (!W.Preview.isSiteReady()) {
                return;
            }
            W.Editor.setEditMode(param.editMode);

            if (param && (param.src == 'previewBtn')) {
                //report BI event
                LOG.reportEvent(wixEvents.PREVIEW_BUTTON_CLICKED_IN_MAIN_WINDOW, {g1: W.Editor._templateId});
            }
            else if (param && (param.previousEditMode == "PREVIEW")) {
                LOG.reportEvent(wixEvents.BACK_TO_EDITOR_MODE_BUTTON_CLICKED, {g1: W.Editor._templateId});
            }

        },

        _onSetViewerMode: function (param, cmd) {
            W.Editor.setViewerMode(param.mode);
        }
    });
});


