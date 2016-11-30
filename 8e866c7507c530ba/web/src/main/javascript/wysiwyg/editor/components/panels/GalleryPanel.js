/**
 * @Class wysiwyg.editor.components.panels.GalleryPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.GalleryPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.dataTypes(['ImageList']);

    /**
     * @lends wysiwyg.editor.components.panels.GalleryPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function(){
            this.addListEditorButton("Manage Gallery",this._data);
        }
    });
});