/**
 * @Class wysiwyg.editor.components.panels.EcommercePanel
 * @extends wysiwyg.editor.components.panels.SelectableListPanel
 */
define.experiment.newComponent('wysiwyg.editor.components.panels.EcommercePanel.WixStoresLaunch', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.SelectableListPanel");

    def.resources(['W.Data', 'W.Commands']);

    def.skinParts({
		content: {type: 'htmlElement'},
        scrollableArea: { type: 'htmlElement' },
        upgradeLink:{
            type:'wysiwyg.editor.components.WButton',
            command:'WEditorCommands.UpgradeToPremium',
            commandParameter:{'referralAdditionalInfo': "ECOM_EDITOR_PANEL"},
            autoBindDictionary:'ECOMMERCE_PANEL_UPGRADE_NOW'
        },
        selectionList: {
            type: 'wysiwyg.common.components.inputs.OptionsListInput',
            dataType: 'SelectableList',
            argObject: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.buttons.ButtonMenuNoSelectionSkin'},
            hookMethod: '_createDataItem'
        }
	});

    def.fields({
        _panelName : "ECOMMERCE_TITLE"
    });

    /**
     * @lends wysiwyg.editor.components.panels.EcommercePanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this.setTitleKey("ECOMMERCE_TITLE");
            if (!this.injects().Config.isPremiumUser()){
                this.setDescriptionKey("ECOMMERCE_PANEL_UPGRADE_DESCRIPTION");
            } else {
                this.setDescriptionKey("ECOMMERCE_PANEL_DESCRIPTION");
            }
        },

		_onAllSkinPartsReady:function () {
			if (this.injects().Config.isPremiumUser()){
				this._skinParts.upgradeLink.hide();
			}
		},

        /*override*/
        _createDataItem: function (definition) {
            var items = _.map(this.resources.W.Data.getDataByQuery('#ECOMMERCE_SUB_PANELS').get('items'), function(item){
                return this.resources.W.Data.createDataItem(item);
            }, this);
            definition.dataItem = this.resources.W.Data.createDataItem({type: 'SelectableList', items: items, selected: null});
            return definition;
        },

        getHelplet : function (){
          return 'WIX_STORE_APP_Help_Icon';
        },

		getPanelType: function(){
			return this.PANEL_TYPE.DEFAULT;
		}
    });
});
