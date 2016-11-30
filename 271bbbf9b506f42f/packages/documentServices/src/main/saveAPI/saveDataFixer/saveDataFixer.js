define([
        'documentServices/saveAPI/saveDataFixer/plugins/backgroundsSaveDataFixer',
        'documentServices/saveAPI/saveDataFixer/plugins/dataItemRefsSaveDataFixer',
        'documentServices/saveAPI/saveDataFixer/plugins/headTagsSaveDataFixer'
    ],
    function(backgroundsSaveDataFixer, dataItemRefsSaveDataFixer, headTagSaveDataFixer) {

        'use strict';
        var plugins = [
            backgroundsSaveDataFixer,
            dataItemRefsSaveDataFixer,
            headTagSaveDataFixer
        ];

        /**
         *
         * @param {{component_properties:object, document_data:object, theme_data:object}} dataNodes
         * @returns {*}
         */
        function fixData(dataToSave, lastSnapshot, currentSnapshot) {
            plugins.forEach(function(plugin) {
                plugin.exec(dataToSave, lastSnapshot, currentSnapshot);
            });
            return dataToSave;
        }

        /**
         * @exports utils/saveDataFixer/saveDataFixer
         */
        var exports = {
            fixData: fixData
        };

        return exports;
    });
