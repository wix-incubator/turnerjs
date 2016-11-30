/**@class  wysiwyg.editor.components.panels.navigation.TreeStructureEditor*/
define.experiment.component('wysiwyg.editor.components.panels.navigation.TreeStructureEditor.CustomSiteMenu', function (componentDefinition, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.methods({

        _createSingleTreeItem: function (itemData, itemLevel, parentItem, itemArgs) {
            var params = this._getItemButtonParams(itemData);

            return this.injects().Components.createComponent(
                params.compType,
                params.skin,
                itemData,
                itemArgs,
                null,
                function (treeItem) {
                    this._onButtonReady(treeItem, itemLevel, parentItem);
                }.bind(this)
            );
        },

        _getItemButtonParams: function(data){
            switch(data.getLinkedDataItemType()){
                case 'PageLink':
                    return {
                        compType: this._itemCompName,
                        skin: this._compSkin
                    };
                default:
                    return Constants.NavigationButtons.CUSTOM_MENU_NAVIGATION_BUTTON;
            }
        }
    });
});
