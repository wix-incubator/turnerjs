define(['lodash', 'utils'], function(_, utils) {
    'use strict';

    var fixers = utils.imageTransformDataFixers;

    var migrationFunctions = {
        'BgImageStripUnifiedProperties': function(property) {

            property.bgSize = fixers.fittingTypeToBgSize(property.fittingType);
            property.bgRepeat = fixers.fittingTypeToBgRepeat(property.fittingType);
            property.bgPosition = fixers.alignTypeToBgPosition(property.alignType);
            property.type = 'BgImageStripProperties';

            delete property.fittingType;
            delete property.alignType;

        }
    };

    function fixProperties(properties) {
        _.forEach(properties, function(property) {
            var migrationFunction = migrationFunctions[property.type];
            if (migrationFunction) {
                migrationFunction(property);
            }
        });
    }

    function fixData(data) {
        _.noop(data);
    }

    /**
     * @exports utils/saveDataFixer/plugins/backgroundsSaveDataFixer
     * @type {{exec: function}}
     */
    var exports = {
        exec: function(dataToSave) {
            var properties = dataToSave.dataDelta.component_properties;
            var data = dataToSave.dataDelta.document_data;

            if (!_.isEmpty(properties)) {
                fixProperties(properties);
            }
            if (!_.isEmpty(data)) {
                fixData(data);
            }
        }
    };

    return exports;
});
