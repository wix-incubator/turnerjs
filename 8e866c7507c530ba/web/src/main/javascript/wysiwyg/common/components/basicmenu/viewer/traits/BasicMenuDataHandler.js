define.Class('wysiwyg.common.components.basicmenu.viewer.traits.BasicMenuDataHandler', function(classDefinition) {
    /**type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.methods({

        initialize: function() {
            this._menuDataNP = null;
        },

        _handleFirstDataChange: function() {
            var currentData = this.getDataItem(),
                currentDataId = this._fixDataItemId(currentData.get('id')),
                menuRefDataId;

            if (currentDataId === '#MAIN_MENU') {
                this._mainMenuData = currentData;
                this._menuDataNP = this._createMenuNonPersistentData(currentData);
                this._migrateData(currentData);
            }
            else {
                this._fixDataItemMenuRef(currentData);
                menuRefDataId = currentData.get('menuRef');
                if (menuRefDataId === '#MAIN_MENU') {
                    this._mainMenuData = this.resources.W.Data.getDataByQuery(menuRefDataId);
                    this._menuDataNP = this._createMenuNonPersistentData(this._mainMenuData);
                }
                else {//maybe this._menuDataNP - menuRefDataId is enough?
                    this._menuDataNP = this.resources.W.Data.getDataByQuery(menuRefDataId);
                }
            }
        },

        _createMenuNonPersistentData: function(mainMenuData) {
            var menuDataObject = this._createNonPersistentRawData(mainMenuData);
            return this.resources.W.Data.createDataItem(menuDataObject);
        },

        _createNonPersistentRawData: function(mainMenuData) {
            var linkDataItem = this.createLinkDataItem(mainMenuData),
                itemLabel = this.getItemLabel(mainMenuData),
                items = this._createItemsData(mainMenuData.get('items'));

            return {type: 'BasicMenuItem', items: items, label: itemLabel, link : linkDataItem && this._fixDataItemId(linkDataItem.id)};
        },

        _getHrefValue: function(data) {
            return data.get('refId');
        },

        /*@override*/
        createLinkDataItem: function(mainMenuData){
            var href = this._getHrefValue(mainMenuData);
            return this.resources.W.Data.addDataItemWithUniqueId('', {type: 'PageLink', pageId: href});
        },

        _createItemsData: function(items) {
            var itemsData = [];

            _(items).forEach(function(item) {
                itemsData.push(this._createMenuNonPersistentData(item));
            }, this);

            return itemsData;
        },

        _migrateData: function(currentData) {
            var currentDataId = currentData.get('id');
            currentData = this._createMenuData(currentDataId);
            this.setDataItem(currentData);
        },

        _createMenuData: function(currentMenuDataId) {
            var dataObject = {type: 'MenuDataRef', menuRef: currentMenuDataId };
            return this.resources.W.Data.createDataItem(dataObject);
        },

        _fixDataItemMenuRef: function(dataItem){
            var menuRef = dataItem.get('menuRef');
            dataItem.set('menuRef', this._fixDataItemId(menuRef));
        },

        _fixDataItemId: function(id){
            if(!id){
                return null;
            }

            if(id.indexOf('#') === -1){
                return '#' + id;
            }

            return id;
        }
    });
});
