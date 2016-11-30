define([
    'lodash',
    'coreUtils'
], function (
    _,
    coreUtils
) {
    'use strict';

    return {
        exec: function (pageJson) {
            _(pageJson.data.document_data)
                .filter({
                    type: 'AppPart',
                    appPartName: coreUtils.blogAppPartNames.CUSTOM_FEED
                })
                .forEach(function (compData) {
                    _(compData.appLogicCustomizations)
                        .filter(customizationMatches)
                        .forEach(function (customization) {
                            _.assign(customization, {
                                fieldId: 'vars',
                                format: '*',
                                key: 'itemsPerPage'
                            });
                        })
                        .value();
                })
                .value();
        }
    };

    function customizationMatches(customization) {
        return (
            customization.forType === 'Array' &&
            customization.key === 'comp.itemsPerPage' &&
            _.includes(['', '*'], customization.format) &&
            _.includes(['paginatedlist', 'columnBlog'], customization.fieldId) &&
            _.includes(['MediaTop', 'MediaBottom', 'MediaLeft', 'MediaRight', 'MediaZigzag', 'Masonry'], customization.view)
        );
    }
});
