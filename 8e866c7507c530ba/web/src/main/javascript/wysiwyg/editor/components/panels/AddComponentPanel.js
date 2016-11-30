/**
 * @Class wysiwyg.editor.components.panels.AddComponentPanel
 * @extends wysiwyg.editor.components.panels.SelectableListPanel
 */
define.component('wysiwyg.editor.components.panels.AddComponentPanel', function(componentDefinition){
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

    /**
     * @lends wysiwyg.editor.components.panels.AddComponentPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._category = args && args.category;
            this.setTitleKey("ADD_COMPONENT_TITLE");
            this.setDescriptionKey("ADD_COMPONENT_DESCRIPTION");
            LOG.reportEvent(wixEvents.OPEN_EDITOR_SUB_PANEL, {c1: args.category, c2: "addPanel"});
        },

        /*override*/
        _createDataItem: function (definition) {
            var items = this._getCategoryItems();
            definition.dataItem = this.resources.W.Data.createDataItem({type: 'SelectableList', items: items, selected: null});
            return definition;
        },

        _getCategoryItems: function() {
            var categoryItems = this.resources.W.Editor.getAddMenuData().get('items');
            return _.find(categoryItems, function(categoryItem) {
                return categoryItem.get('name') === this._category;
            }, this).get('items');
        },

        /*override*/
        canGoBack : function() {
            return true;
        }
    });
});