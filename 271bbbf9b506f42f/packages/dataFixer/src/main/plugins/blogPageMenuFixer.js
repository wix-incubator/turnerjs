define(['lodash'], function(_) {
    'use strict';

    function moveSinglePostToTopLevel(masterPageData) {
        var singlePostPageId = findSinglePostPageMenuItem(masterPageData);
        if (singlePostPageId) {
            moveSinglePostToNewParent(masterPageData, '#' + singlePostPageId);
        }
    }

    function findSinglePostPageMenuItem(data) {
        var singlePostPageId = _.findKey(data, function(key) {
           return key.appPageId && key.appPageId === '7326bfbb-4b10-4a8e-84c1-73f776051e10';
        });

        if (!singlePostPageId) {
            return null;
        }

        var singlePostLinkId = _.findKey(data, function(key) {
            return key.pageId && key.pageId === '#' + singlePostPageId;
        });
        return _.findKey(data, function(key) {
            return key.link && key.link === '#' + singlePostLinkId;
        });
    }

    function moveSinglePostToNewParent(data, singlePostPageId) {
        var pagesIds = data.CUSTOM_MAIN_MENU && data.CUSTOM_MAIN_MENU.items;
        _.forEach(pagesIds, function(pageId) {
            var pageItems = data[pageId.replace('#', '')].items;
            var index = _.indexOf(pageItems, singlePostPageId);
            if (index !== -1) {
                pageItems.splice(index, 1);
                data.CUSTOM_MAIN_MENU.items.push(singlePostPageId);
                return false;
            }
        });
    }

    /**
     * @exports utils/dataFixer/plugins/blogPageMenuFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function(pageJson) {
            if (pageJson.structure && pageJson.structure.type === 'Document') {
                moveSinglePostToTopLevel(pageJson.data.document_data);
            }
            return pageJson;
        }
    };

    return exports;
});