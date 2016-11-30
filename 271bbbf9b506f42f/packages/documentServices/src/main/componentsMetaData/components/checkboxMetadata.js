define([
    'lodash',
    'documentServices/componentsMetaData/components/baseInputMetadata'
], function(_, baseInputMetadata) {
    'use strict';

    var metadata = {
        resizableSides: [],
        layoutLimits: {
            minHeight: 12,
            minWidth: 12,
            aspectRatio: 1
        }
    };
    
    return _.assign({}, baseInputMetadata, metadata);
});
