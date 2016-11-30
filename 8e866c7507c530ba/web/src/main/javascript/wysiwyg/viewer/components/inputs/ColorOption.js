define.component('wysiwyg.viewer.components.inputs.ColorOption', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.skinParts({
        'tooltip':{type:'wysiwyg.common.components.InfoTip'}
    });

    def.inherits('wysiwyg.viewer.components.inputs.TextOption');

    def.methods({
        _onAllSkinPartsReady:function () {
            this.getViewNode().setStyle('background-color', this.getDataItem().get('text'));
            this._initializeTooTip(this.getViewNode());
        }
    });
});