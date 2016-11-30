/**
 * @Class wysiwyg.editor.components.inputs.ListEditorButton
 * @extends wysiwyg.editor.components.inputs.ButtonInput
 */
define.component('wysiwyg.editor.components.inputs.ListEditorButton', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.ButtonInput");

    def.binds(['_tunnelButtonEvent']);

    def.skinParts({
        label: {type: 'htmlElement'},
        button: {type: 'wysiwyg.editor.components.WButton'}
    });

    def.states({'label': ['hasLabel', 'noLabel'], 'editable': ['disabled', 'enabled']});

    /**
     * @lends wysiwyg.editor.components.inputs.ListEditorButton
     */
    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._labelText = args.labelText || '';
            this._listData = args.listData;
            this._startingTab = args.startingTab;
            this._galleryConfigID = args.galleryConfigID;
            this._source = args.source;
        },

        _onAllSkinPartsReady: function (parts) {
            parts.button.setParameters({
                command: 'WEditorCommands.OpenListEditDialog',
                commandParameter: {
                    data: this._listData,
                    galleryConfigID: this._galleryConfigID,
                    startingTab: this._startingTab || 'my',
                    source: this._source || "NO_SOURCE_SPECIFIED"
                }
            });
        }
    });
});