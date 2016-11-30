define(['lodash'], function(_) {
    'use strict';

    /**
     * @exports utils/dataFixer/plugins/characterSetsFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function(pageJson) {
            if (pageJson.structure && pageJson.structure.type === 'Document') {
                if (_.isEmpty(pageJson.data.document_data.masterPage.characterSets)) {
                    pageJson.data.document_data.masterPage.characterSets = ['latin'];
                }
            }
            return pageJson;
        }
    };

    return exports;
});
