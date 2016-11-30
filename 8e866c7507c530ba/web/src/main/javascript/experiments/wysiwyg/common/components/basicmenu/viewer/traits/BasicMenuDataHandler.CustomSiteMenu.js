define.experiment.Class('wysiwyg.common.components.basicmenu.viewer.traits.BasicMenuDataHandler.CustomSiteMenu', function(classDefinition, experimentStrategy) {

    var def = classDefinition,
        strategy = experimentStrategy;

    def.methods({
        _handleFirstDataChange: function() {
            var currentData = this.getDataItem(),
                currentDataId = this._fixDataItemId(currentData.get('id')),
                menuRefDataId;

            if (currentDataId === '#MAIN_MENU') {
                this._mainMenuData = currentData;
                this._mainMenuData.on(Constants.DataEvents.DATA_CHANGED, this, this._onMainMenuDataChange);
                this._menuDataNP = this._createMenuNonPersistentData(currentData);
            } else {
                this._fixDataItemMenuRef(currentData);
                menuRefDataId = currentData.get('menuRef');
                if (menuRefDataId === '#MAIN_MENU') {
                    this._mainMenuData = this.resources.W.Data.getDataByQuery(menuRefDataId);
                    this._mainMenuData.on(Constants.DataEvents.DATA_CHANGED, this, this._onMainMenuDataChange);
                    this._menuDataNP = this._createMenuNonPersistentData(this._mainMenuData);
                } else {
                    this._menuDataNP = this.resources.W.Data.getDataByQuery(menuRefDataId);
                    this._menuDataNP.on(Constants.DataEvents.DATA_CHANGED, this, this._handleSkinChange);
                }
            }
        },

        _onMainMenuDataChange: function() {
            this.buildItemList();
        },

        _createNonPersistentRawData: function(mainMenuData) {
            var linkDataItem = this.createLinkDataItem(mainMenuData),
                itemLabel = this.getItemLabel(mainMenuData),
                items = mainMenuData.getItems(true);

            return {type: 'BasicMenuItem', items: items, label: itemLabel, isVisible: true, link : linkDataItem && this._fixDataItemId(linkDataItem.id)};
        }
    });
});
