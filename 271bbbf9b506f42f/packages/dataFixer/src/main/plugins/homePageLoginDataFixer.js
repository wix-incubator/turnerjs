define(['lodash'], function(_) {
    'use strict';

    function fixSendEmailField(dataItem){
        if (!dataItem.metaData || dataItem.metaData.schemaVersion !== '2.0'){
            dataItem.sendMail = true;
        }
    }

    function fixData(data) {
        _.forEach(data, function(dataItem) {
            if (dataItem.type === 'LoginToWixLink' || dataItem.type === 'HomePageLogin'){
                fixSendEmailField(dataItem);
            }
        });
    }

    /**
     * @exports utils/dataFixer/plugins/backgroundsDataFixer
     * @type {{exec: function}}
     */
    var exports = {
        exec: function(pageJson) {
            var data = pageJson.data.document_data;
            if (!_.isEmpty(data)) {
                fixData(data);
            }
        }
    };

    return exports;
});
