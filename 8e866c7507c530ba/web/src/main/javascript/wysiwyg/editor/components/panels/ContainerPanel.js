/**
 * @Class wysiwyg.editor.components.panels.ContainerPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.ContainerPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_createStylePanel']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.dataTypes(['']);

    /**
     * @lends wysiwyg.editor.components.panels.ContainerPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function(){
            this.addStyleSelector();
            this.addAnimationButton();
        }
    });
});