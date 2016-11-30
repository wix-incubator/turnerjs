define.component('wysiwyg.editor.components.WritableButton', function(compDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    def.inherits('wysiwyg.editor.components.WButton');

    def.skinParts({
        icon: {'type': 'htmlElement', optional: 'true'},
        label: {'type': 'htmlElement'},
        inputArea: {type: 'htmlElement'}
    });


    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
        }

    });
});