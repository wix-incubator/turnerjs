define(['lodash'], function(_) {
    'use strict';

    /**
     * @exports utils/saveDataFixer/plugins/headTagsSaveDataFixer
     * @type {{exec: function}}
     */
    var exports = {
        exec: function(dataToSave) {
            var hasHeadTagsToSave = !_.isEmpty(dataToSave.siteMetaData) && !_.isEmpty(dataToSave.siteMetaData.headTags);
            if (hasHeadTagsToSave) {
                dataToSave.siteMetaData.headTags = dataToSave.siteMetaData.headTags.replace(/[”“]/gm, '"');
            }
        }
    };

    return exports;
});
