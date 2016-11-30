define(['lodash'], function (_) {
    'use strict';


    function isJsonForPage(pageJson){
        return _.get(pageJson, 'structure.type') === 'Page';
    }

    function removePageDataItems(pageJson){
        _(pageJson.data.document_data)
            .where({type: "Page"})
            .pluck('id')
            .forEach(function(pageId){
                delete pageJson.data.document_data[pageId];
            })
            .value();
    }

    function updateLinksMasterPageId(pageJson) {
        _.forEach(pageJson.data.document_data, function (dataItem) {
            if (dataItem.pageId === '#SITE_STRUCTURE') {
                dataItem.pageId = '#masterPage';
            }
        });
    }

    function pageDataFixer(pageJson) {
        if (isJsonForPage(pageJson)){
            removePageDataItems(pageJson);
        }
        updateLinksMasterPageId(pageJson);
    }

    return {exec: pageDataFixer};
});
