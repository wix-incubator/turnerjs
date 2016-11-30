define.experiment.newClass('wysiwyg.editor.managers.Redirect301Manager.RedirectFeature301Data', function(classDefinition){

    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('bootstrap.managers.BaseManager');
    def.resources(['W.Data', 'W.Preview']);
    def.binds(['_onSiteSettingsDataReady', '_pagesDataChanged']);


    def.methods({
        initialize: function(params){
            this._itemsListObj = null;
            this._dataItem = null;
            this._menuData = null;
            this._externalUriMappings = null;
            this.resources.W.Data.getDataByQuery('#SITE_SETTINGS', this._onSiteSettingsDataReady);
        },

        _onSiteSettingsDataReady:function(dataItem){
            this._externalUriMappings = this._getExternalUriMappings(dataItem);
            this._menuData = this._getMenuData();
            this._menuData.addEvent(Constants.DataEvents.DATA_CHANGED, this._pagesDataChanged);
        },

        _getExternalUriMappings:function(dataItem){
            if(dataItem) {
                this._dataItem = dataItem;
            }
            return this._dataItem.get("externalUriMappings");
        },

        _getMenuData:function(){
            if(!this._menuData){
                this._menuData = this.resources.W.Preview.getPreviewManagers().Data.getDataByQuery("#MAIN_MENU");
            }
            return this._menuData;
        },

        _getPageDataFromItem:function(item){
            var toWixUri = item.toWixUri;
            var fromExternalUri = item.fromExternalUri;
            return this._getMenuData().getItemByRefId('#' + toWixUri);
        },

        _pagesDataChanged:function(){
            this._filter301RowsAccordingToPages();
        },

        _filter301RowsAccordingToPages:function(){
            var newArr = [];
            var externalUriMappings = this._getExternalUriMappings();
            _.forEach(externalUriMappings, function (item) {
                var pageData = this._getPageDataFromItem(item);
                if(pageData){
                    newArr.push({fromExternalUri: item.fromExternalUri, toWixUri: item.toWixUri});
                }
            },this);
            this._setDataItem(newArr);
        },

        _setDataItem:function(newArr){
            this._dataItem.set('externalUriMappings', newArr);
        }
    });
});