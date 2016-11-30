define.component('wysiwyg.editor.components.TopToolbar', function (componentDefinition) {

    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');
    def.skinParts({
        mainTabs: {type: 'wysiwyg.editor.components.Tabs', dataQuery: "#TOP_TABS" },
        mainButtons: {type: 'wysiwyg.editor.components.Tabs', dataQuery: "#TOP_BUTTONS", argObject: {isToggle: false} }
    });

    def.methods({
        initialize: function (compId, compView, args) {
            this.parent(compId, compView, args);
        }
    });

});
