define.component('wysiwyg.editor.components.panels.MobileAddPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.MasterComponentPanel');

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
        },

        getPanelType: function(){
            return this.PANEL_TYPE.DEFAULT;
        },

        _createDataItem: function (definition) {
            var items = _.map(this.resources.W.Data.getDataByQuery('#MOBILE_ADD_PANELS').get('items'), function(item){
                return this.resources.W.Data.createDataItem(item);
            }, this);
            definition.dataItem = this.resources.W.Data.createDataItem({type: 'SelectableList', items: items, selected: null});
            return definition;
        },

        render: function () {
            this.parent();
            this._skinParts.scrollableArea.setStyle('height', '500px');
        }
    });
});
