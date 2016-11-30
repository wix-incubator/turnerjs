/**
 * @Class wysiwyg.editor.components.panels.DesignPanel
 * @extends wysiwyg.editor.components.panels.SideContentPanel
 */
define.component('wysiwyg.editor.components.panels.DesignPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.SideContentPanel");

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.fields({
        _panelName : "DESIGN_TITLE"
    });

    /**
     * @lends wysiwyg.editor.components.panels.DesignPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._titleKey = "DESIGN_TITLE";
            this._descriptionKey = "DESIGN_DESCRIPTION";
        },

        _createFields: function(){
            //Background image selector
            this.addSelectionListInputFieldWithDataProvider("", '#DESIGN_SUB_PANELS',
                {repeatersSelectable: false},
                {
                    type: 'wysiwyg.editor.components.WButton',
                    skin: 'wysiwyg.editor.skins.buttons.ButtonMenuSkin',
                    numRepeatersInLine: 1
                }
            );
        }
    });
});