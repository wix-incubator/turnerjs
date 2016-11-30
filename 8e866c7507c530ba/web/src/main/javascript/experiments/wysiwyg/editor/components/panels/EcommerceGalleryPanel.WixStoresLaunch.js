/**
 * @Class wysiwyg.editor.components.panels.EcommerceGalleryPanel
 * @extends wysiwyg.editor.components.panels.SelectableListPanel
 */
define.experiment.newComponent('wysiwyg.editor.components.panels.EcommerceGalleryPanel.WixStoresLaunch', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SelectableListPanel');

    def.resources(['W.Data', 'W.Commands']);

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
     * @lends wysiwyg.editor.components.panels.EcommerceGalleryPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this.setTitleKey("ADD_ECOMMERCE_GALLERY_TITLE");
            this.setDescriptionKey("ADD_ECOMMERCE_GALLERY_DESCRIPTION");
            this.setHeight(211);
            LOG.reportEvent(wixEvents.OPEN_EDITOR_SUB_PANEL, {c1:null, c2:Constants.EditorUI.ECOMMERCE_GALLERY_PANEL});
        },

        /*override*/
        _createDataItem: function (definition) {
            var items = _.map(this.resources.W.Data.getDataByQuery('#ECOMMERCE_GALLERIES_SUB_PANELS').get('items'), function(item){
                return this.resources.W.Data.createDataItem(item);
            }, this);
            definition.dataItem = this.resources.W.Data.createDataItem({type: 'SelectableList', items: items, selected: null});
            return definition;
        },

        getHelplet : function (){
            return 'WIX_STORE_APP_Help_Icon';
        },

        /*override*/
        canGoBack : function() {
            return true;
        }
    });
});
