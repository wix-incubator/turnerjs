/** @class wysiwyg.editor.managers.preview.SiteDataSerializer */
define.experiment.Class('wysiwyg.editor.managers.preview.SiteDataSerializer.SuperRichTextMenuToggle', function(classDefinition, experimentStrategy){
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    var strategy = experimentStrategy ;

    def.methods({
        _handleSingleDataItem: function (item, key) {
            var text;
            var dataQueries;
            var getDataQueriesFromText = function(text) {
                var dataQueryExtractorRegEx = new RegExp('<a[^>]+dataquery=\"([^"]+)\"', 'igm');
                var tempMatch;
                var dataQueries = [];

                while (tempMatch = dataQueryExtractorRegEx.exec(text)) {
                    dataQueries.push(tempMatch[1]);
                }

                return dataQueries;
            };
            var filterRealDataItems = function(dataQueries) {
                var previewDataManager = W.Preview.getPreviewManagers().Data;
                var filteredDataQueries;
                var dataItem;

                filteredDataQueries =_.filter(dataQueries, function(dataRef){
                    dataItem = previewDataManager.getDataByQuery(dataRef);
                    return validateLinkDataItem(dataItem);
                }, this);

                return filteredDataQueries;
            };
            var validateLinkDataItem = function(dataItem) {
                return !!dataItem;
            };

            if(item.getType() === 'StyledText' || item.getType() === 'MediaRichText') {
                dataQueries = getDataQueriesFromText(item.get('text'));
                dataQueries = filterRealDataItems(dataQueries);

                item.setFields({
                    linkList: _.unique(dataQueries)
                });
            }

            if (key === 'SITE_STRUCTURE') {
                return {
                    'renderModifiers': item.getData().renderModifiers,
                    'siteName': item.getData().siteName,
                    'mainPage': item.getData().mainPage,
                    'mainPageId': item.getData().mainPageId || undefined,
                    'characterSets': item.getData().characterSets,
                    'usedFonts': item.getData().usedFonts,
                    'type': 'Document'
                };
            } else {
                return item.cloneData();
            }
        }

    });
});
