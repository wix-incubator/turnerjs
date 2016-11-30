define.component('wysiwyg.editor.components.inputs.DataItemSelectionListInput', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.SelectionListInput');

    def.binds(['_onRepeaterClick']);

    def.skinParts({
        label:  {type: 'htmlElement'},
        collection: {type: 'htmlElement'}
    });

    def.methods({
        /**
         * @override
         * Unlike the overridden method, this repeater click handler sets the value as the selected <b>DataItem</b> and not its raw data
         * @param event
         */
        _onRepeaterClick:function(event){
            this.setValue(event.data);
            this._updateSelection(event.target.getLogic());
        }
    });
});