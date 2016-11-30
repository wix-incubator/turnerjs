define(['lodash', 'documentServices/constants/constants', 
    'documentServices/componentsMetaData/components/baseInputMetadata'], function(_, constants, baseInputMetadata) {
    'use strict';

    return _.assign({resizableSides: [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT]}, baseInputMetadata);
});
