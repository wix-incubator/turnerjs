define(['utils', 'lodash'], function(utils, _) {
    'use strict';

    var hashUtils = utils.hashUtils,
        blogAppPartNames = utils.blogAppPartNames,
        BLOG_PAGE_ID = 'blog';

    function getHash() {
        var args = Array.prototype.slice.call(arguments, 0);
        return hashUtils.SHA256.hex_sha256(args.join('/'));
    }

    return {
        /**
         *
         * @param {object} pageData
         * @returns {boolean}
         */
        isMatched : function(pageData) {
            return _.some(pageData.data.document_data, {appPartName: blogAppPartNames.SINGLE_POST});
        },
        getUniquePageId : function(siteData, rootId) {
            if (utils.stringUtils.isTrue(_.get(siteData, ['currentUrl', 'query', 'draft']))) {
                return hashUtils.SHA256.hex_sha256('editor');
            }

            var pageData = siteData.pagesData[rootId],
                singlePostComponent = _.findWhere(pageData.data.document_data, {appPartName: blogAppPartNames.SINGLE_POST}),
                postId = siteData.wixapps.blog[singlePostComponent.id][1];
            return getHash(siteData.siteId, BLOG_PAGE_ID, postId);
        }
    };
});
