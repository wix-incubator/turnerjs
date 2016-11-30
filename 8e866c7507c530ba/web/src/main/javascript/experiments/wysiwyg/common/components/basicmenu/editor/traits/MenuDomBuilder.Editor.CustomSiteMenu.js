define.experiment.Class('wysiwyg.common.components.basicmenu.editor.traits.MenuDomBuilder.CustomSiteMenu', function(classDefinition, expeirmentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition,
        strategy = expeirmentStrategy;

    def.methods({
        buildItemList: function() {
            this._removeItemsDataChangeListeners();
            this._build();
            this._addItemsDataChangeListeners();
        },

        _addItemsDataChangeListeners: function(items) {
            items = items || this._menuDataNP.get('items');

            items.forEach(function(item){
                item.on(Constants.DataEvents.DATA_CHANGED, this, this._onMainMenuDataChange);
                this._addItemsDataChangeListeners(item.get('items'));
            }.bind(this));
        },

        _removeItemsDataChangeListeners: function(items) {
            items = items || this._menuDataNP.get('items');

            items.forEach(function(item){
                item.off(Constants.DataEvents.DATA_CHANGED, this, this._onMainMenuDataChange);
                this._removeItemsDataChangeListeners(item.get('items'));
            }.bind(this));
        }
    });
});