/**@class wysiwyg.editor.components.traits.FiltersDataByTags */
define.Class('wysiwyg.editor.components.traits.FiltersDataByTags', function(classDefinition){
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Data', 'W.Preview']);

    def.methods({
        /**
         *
         * @param dataId the id of a list data item in the editor, which you want to filter
         * @param settingsTagsProperty the id of PalletTags data items by which you want to filter
         * @param dataTagsProperty tags property name of the filtered data item
         * @param callback will be called with the filtered list
         */
        filterEditorDataListByTags: function(dataId, settingsTagsProperty, dataTagsProperty, callback){
            var previewData = this.resources.W.Preview.getPreviewManagers().Data;

            this.resources.W.Data.getDataByQuery(dataId, function(allPallets){
                if(!previewData.isDataAvailable('#EDITOR_SETTINGS')){
                    callback(allPallets.get(['items']));
                    return;
                }
                
                previewData.getDataByQuery('#EDITOR_SETTINGS', function(editorSettings){
                    var tags = editorSettings.get(settingsTagsProperty);
                    if(!tags || !tags.isIntersecting){
                        callback(allPallets.get(['items']));
                        return;
                    }

                    var filteredPallets = allPallets.get(['items']).filter(function(item){
                        return  item[dataTagsProperty] && editorSettings.get(settingsTagsProperty).isIntersecting(item[dataTagsProperty]);
                    });
                    callback(filteredPallets);
                });
            });
        }
    });
});
