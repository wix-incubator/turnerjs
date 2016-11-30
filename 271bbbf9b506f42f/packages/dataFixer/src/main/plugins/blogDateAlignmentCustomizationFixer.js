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
                .filter(function(compData) {
                    return compData.type === 'AppPart' &&
                        _.includes([coreUtils.blogAppPartNames.CUSTOM_FEED, coreUtils.blogAppPartNames.FEED, coreUtils.blogAppPartNames.SINGLE_POST], compData.appPartName);
                    }
                )
                .forEach(function (compData) {
                    _(compData.appLogicCustomizations)
                        .filter(customizationMatches)
                        .forEach(function (customization) {
                            _.assign(customization, {
                                fieldId: 'vars',
                                key: 'dateAndAuthorPosition',
                                value: customization.value === '0' ? 'left' : 'right'
                            });
                        })
                        .value();
                })
                .value();
        }
    };

    function customizationMatches(customization) {
        return (
            customization.forType === 'Post' &&
            customization.key === 'layout.spacerBefore' &&
            customization.fieldId === 'date' &&
            _.includes(['MediaTop', 'MediaBottom', 'MediaLeft', 'MediaRight', 'MediaZigzag', 'Masonry',
                'MediaTopPage', 'MediaBottomPage', 'MediaLeftPage', 'MediaRightPage', 'MediaZigzagPage', 'MasonryPage',
                'SinglePostMediaBottom', 'SinglePostMediaTop'], customization.view)
        );
    }
});
