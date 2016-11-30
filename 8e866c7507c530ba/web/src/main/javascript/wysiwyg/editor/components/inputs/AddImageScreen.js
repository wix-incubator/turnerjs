define.component('wysiwyg.editor.components.inputs.AddImageScreen', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Commands']);

    def.binds(['_onClick', '_onKeepPreset']);

    def.states({
        'situation': ['emptyList', 'presetList']
    });

    def.skinParts({
        background: { type: 'htmlElement' },
        heading:    { type: 'htmlElement' },
        paragraph1: { type: 'htmlElement' },
        addButton:  { type: 'wysiwyg.editor.components.WButton' },
        keepPresetButton: { type: 'htmlElement' }
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.OpenMediaFrame", this, function () {
                this._skinParts.addButton.disable();
            });
            this.resources.W.Commands.registerCommandListenerByName("WEditorCommands.CloseMediaFrame", this, function () {
                this._skinParts.addButton.enable();
            });
        },

        _onStateChange: function(newState, oldState) {
            if(this._componentReady === true) {
                this._updateLabels();
            }
        },

        render : function() {
            this._updateLabels();
        },

        _onAllSkinPartsReady: function () {
            this._skinParts.addButton.addEvent(Constants.CoreEvents.CLICK, this._onClick);
            this._skinParts.keepPresetButton.addEvent(Constants.CoreEvents.CLICK, this._onKeepPreset);
        },

        _updateLabels : function () {
            this._skinParts.heading.set("text", this.injects().Resources.get('EDITOR_LANGUAGE', 'ADDIMAGESCREEN_HEADING'));
            var currentState = this.getState();
            var message = this.injects().Resources.get('EDITOR_LANGUAGE', currentState.contains("emptyList") === true ? 'ADDIMAGESCREEN_PAR1' : 'ADDIMAGESCREEN_PAR2');
            this._skinParts.paragraph1.set("text", message);
            this._skinParts.addButton.setLabel(this.injects().Resources.get('EDITOR_LANGUAGE', 'ADDIMAGESCREEN_ADD_BUTTON'));
            this._skinParts.keepPresetButton.set("text", this.injects().Resources.get('EDITOR_LANGUAGE', 'ADDIMAGESCREEN_KEEP_PRESET_BUTTON'));
        },

        _onClick : function (event) {
            event.stopPropagation();
            this.fireEvent('addImageRequested');
        },

        _onKeepPreset : function (event) {
            this.fireEvent('keepPreset');
        }
    });
});