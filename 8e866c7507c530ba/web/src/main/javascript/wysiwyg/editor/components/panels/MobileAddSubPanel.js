define.component('wysiwyg.editor.components.panels.MobileAddSubPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.AddComponentPanel');

    def.resources(['W.Preview', 'W.Resources']);

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
        _panelName: "MOBILE_ADD_PANEL_TITLE_NEW"
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.setTitleKey("MOBILE_ADD_PANEL_TITLE_NEW");
            this.setDescriptionKey("MOBILE_ADD_PANEL_DESCRIPTION");
            this._category = args.category;
        },

        _getCategoryItems: function() {
            var rawItems = this.resources.W.Data.getDataByQuery('#MOBILE_ADD_SUB_PANELS').get('items');
            var categoryItems = _.map(rawItems, function(item){
                return this.resources.W.Data.createDataItem(item);
            }, this);

            return _.filter(categoryItems, function(categoryItem) {
                return categoryItem.get('category') === this._category;
            }, this);
        }
    });
});
