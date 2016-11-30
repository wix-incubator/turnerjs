define.experiment.newComponent('wysiwyg.editor.components.dialogs.NGTestDialog.NGPanels', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.UndoRedoManager', 'W.Resources', 'W.Utils', 'W.Data', 'W.Preview', "W.Editor"]);

    def.skinParts({
        openNgDialog: {type: 'wysiwyg.editor.components.WButton'},
        openLegacyDialog: {type: 'wysiwyg.editor.components.WButton'}
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._dialogParts = [];
            this._closeDialogCB = args.closeCallback;
            this._previewData = args.data;
            this._dialogWindow = args.dialogWindow;
        },

        _onAllSkinPartsReady: function () {
            this.parent();

            this._skinParts.openNgDialog.setLabel('Open Angular Semi-Modal');
            this._skinParts.openNgDialog.addEvent(Constants.CoreEvents.CLICK, function() {
                W.EditorDialogs._getAngularLegacyDialogsService().openTestDialog();
            });

            this._skinParts.openLegacyDialog.setLabel('Open Legacy Semi-Modal');
            this._skinParts.openLegacyDialog.addEvent(Constants.CoreEvents.CLICK, function() {
                W.EditorDialogs._getAngularLegacyDialogsService().openLegacyDialog();
            });
        }
    });

});
