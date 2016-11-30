define.component("wysiwyg.editor.components.EditLayerDecorations", function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.skinParts({
        siteCommentsContainer: {type: 'htmlElement'}
    });

    def.methods({
        getCommentsContainer: function() {
            return this._skinParts.siteCommentsContainer;
        }
    });
});