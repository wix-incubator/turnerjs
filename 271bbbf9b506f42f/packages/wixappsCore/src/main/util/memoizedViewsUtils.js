define(['lodash', 'wixappsCore/util/viewsUtils'], function(_, viewsUtils) {
    'use strict';

    function findViewInDescriptorByNameTypeAndFormatResolver(descriptor, viewName, typeName, formatName) {
        return [descriptor.id, viewName, typeName, formatName].join('|');
    }

    return {
        findViewInDescriptorByNameTypeAndFormat: _.memoize(
            viewsUtils.findViewInDescriptorByNameTypeAndFormat,
            findViewInDescriptorByNameTypeAndFormatResolver
        )
    };
});
