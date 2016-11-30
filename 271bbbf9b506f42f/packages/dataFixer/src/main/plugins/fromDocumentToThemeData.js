define([], function() {
    'use strict';

    /**
     * @exports utils/dataFixer/plugins/fromDocumentToThemeData
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson) {
            var data = pageJson.data;
            if (data.document_data.THEME_DATA) {
                if (!data.theme_data.THEME_DATA) {
                    data.theme_data.THEME_DATA = data.document_data.THEME_DATA;
                }
                delete data.document_data.THEME_DATA;
            }
        }
    };

    return exports;
});