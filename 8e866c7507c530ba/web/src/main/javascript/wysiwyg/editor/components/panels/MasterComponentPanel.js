/**
 * @Class wysiwyg.editor.components.panels.MasterComponentPanel
 * @extends wysiwyg.editor.components.panels.SelectableListPanel
 */
define.component('wysiwyg.editor.components.panels.MasterComponentPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SelectableListPanel');

    def.skinParts({
        content: { type: 'htmlElement' },
        scrollableArea: { type: 'htmlElement' },
        selectionList: {
            type: 'wysiwyg.common.components.inputs.OptionsListInput',
            dataType: 'SelectableList',
            argObject: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.buttons.ButtonMenuNoSelectionSkin'},
            hookMethod: '_createDataItem'
        }
    });

    def.fields({
        _panelName : "MASTER_COMPONENT_TITLE"
    });

    /**
     * @lends wysiwyg.editor.components.panels.MasterComponentPanel
     */
    def.methods({

        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this.setTitleKey("ADD_COMPONENT_TITLE");
            this.setDescriptionKey("ADD_COMPONENT_DESCRIPTION");
        },

        /*override*/
        _createDataItem: function (definition) {
            definition.dataItem = this.resources.W.Editor.getAddMenuData();
            return definition;
        },

        /*override*/
        canGoBack : function() {
            return false;
        }
    });
});