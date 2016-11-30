define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTImageAltCommand', function(classDefinition) {
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTDualCommand');

    def.methods({
        getUserActionEventName: function() {
            return Constants.CoreEvents.INPUT_CHANGE;
        },
        executeCommand: function(event) {
            if (this._imageDataItem) {
                this._imageDataItem.set('alt', event.value);
                this._imageDataItem.set('title', event.value);
            } else {
                //todo - handle missing video data item...
                console.log("missing image data item");
            }

            this._editorInstance.execCommand(this._commandName, event.value);
        },
        setDataItem: function(imageDataItem) {
            this._imageDataItem = imageDataItem;
            this._controllerComponent.setTextContent(imageDataItem.get('title') || imageDataItem.get('alt'));
        }
    });
});
