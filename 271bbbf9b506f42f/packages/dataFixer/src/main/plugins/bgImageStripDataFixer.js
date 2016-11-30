define(['lodash'], function (_) {
    'use strict';

    var PLACEHOLDER_IMAGE_FILENAME = 'add_image_thumb.png';

    function isBgImageStrip(comp) {
        return comp && comp.componentType === 'wysiwyg.viewer.components.BgImageStrip';
    }

    function getDataQuery(comp) {
        return comp && comp.dataQuery && comp.dataQuery.replace('#', '');
    }

    function isPlaceholder(dataItem) {
        return dataItem.uri.slice(0 - PLACEHOLDER_IMAGE_FILENAME.length) === PLACEHOLDER_IMAGE_FILENAME;
    }

    function gatherBgImageStripDataAndFixEmptyTitle(dataQueryMap, documentData, comp) {
        if (isBgImageStrip(comp)) {
            var dataQuery = getDataQuery(comp);
            var dataItem = dataQuery && documentData[dataQuery];

            if (dataItem) {
                dataItem.title = dataItem.title || '';
                if (!isPlaceholder(dataItem)) {
                    dataQueryMap[comp.id] = dataQuery;
                }
            }
        }
    }

    function propagateBgImageStripData(dataQueryMap, documentData, comp) {
        if (isBgImageStrip(comp)) {
            var desktopQuery = dataQueryMap[comp.id];

            if (desktopQuery) {
                comp.dataQuery = '#' + desktopQuery;
            } else {
                delete comp.dataQuery;
            }
        }
    }

    function forComponents(comps, callback) {
        _.forEach(comps, function (comp) {
            callback(comp);
            forComponents(comp.components, callback);
        });
    }

    return {
        exec: function (pageJson) {
            var structure = pageJson.structure;
            var desktopComps = structure && (structure.components || structure.children);
            var mobileComps = structure && structure.mobileComponents;

            if (desktopComps) {
                var dataQueryMap = {};
                forComponents(desktopComps, gatherBgImageStripDataAndFixEmptyTitle.bind(null, dataQueryMap, pageJson.data.document_data));
                forComponents(desktopComps, propagateBgImageStripData.bind(null, dataQueryMap, pageJson.data.document_data));
                forComponents(mobileComps, propagateBgImageStripData.bind(null, dataQueryMap, pageJson.data.document_data));
            }
        }
    };
});
