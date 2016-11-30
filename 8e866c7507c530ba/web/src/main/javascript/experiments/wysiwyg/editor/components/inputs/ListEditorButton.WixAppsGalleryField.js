define.experiment.component('wysiwyg.editor.components.inputs.ListEditorButton.WixAppsGalleryField', function (componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition,
        strategy = experimentStrategy;

    def.methods({
        initialize: strategy.after(function(compId, viewNode, args) {
            this._callback = args.callback;
        }),

        _onAllSkinPartsReady: function (parts) {
            parts.button.setParameters({
                command: 'WEditorCommands.OpenListEditDialog',
                commandParameter: {
                    data: this._listData,
                    galleryConfigID: this._galleryConfigID,
                    startingTab: this._startingTab || 'my',
                    source: this._source || "NO_SOURCE_SPECIFIED",
                    callback: this._callback || function() {}
                }
            });
        }
    });
});
