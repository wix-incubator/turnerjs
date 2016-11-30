define(['lodash', 'dataFixer/imageService/imageTransformDataFixers'], function(_, fixers) {
    'use strict';

    var migrationFunctions = {
        'BgImageStripProperties': function(property) {

            property.fittingType = fixers.cssToFittingType({
                bgSize: property.bgSize,
                bgRepeat: property.bgRepeat
            });
            property.fittingType = fixers.migrateToLegacyFittings(property.fittingType);
            property.alignType = fixers.cssToAlignType(property.bgPosition);
            property.type = 'BgImageStripUnifiedProperties';

            delete property.bgSize;
            delete property.bgRepeat;
            delete property.bgPosition;
            delete property.bgUrl;

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
     * @exports utils/dataFixer/plugins/backgroundsDataFixer
     * @type {{exec: function}}
     */
    var exports = {
        exec: function(pageJson) {
            var properties = pageJson.data.component_properties;
            var data = pageJson.data.document_data;

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
