define.component('wysiwyg.editor.components.panels.PagesContainerPanel', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
    def.utilize(['core.editor.components.traits.DataPanel']);

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.dataTypes(['']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function(){
            this.addPageStyleSelector("CHANGE_PAGE_STYLE");
        }
    });
});
