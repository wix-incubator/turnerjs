define([
    'lodash',
    'coreUtils'
], function (
    _,
    coreUtils
) {
    'use strict';

    var VIEW_NAMES_BY_APP_PART_NAME = {};
    VIEW_NAMES_BY_APP_PART_NAME[coreUtils.blogAppPartNames.FEED] = [
        'MediaBottomPage',
        'MediaLeftPage',
        'MediaRightPage',
        'MediaTopPage',
        'MediaZigzagPage'
    ];
    VIEW_NAMES_BY_APP_PART_NAME[coreUtils.blogAppPartNames.POSTS_LIST] = [
        'PostsList',
        'PostsListMediaLeft'
    ];
    VIEW_NAMES_BY_APP_PART_NAME[coreUtils.blogAppPartNames.TICKER] = [
        'TickerMediaBottom',
        'TickerMediaTop'
    ];

    return {
        exec: function (pageJson) {
            _(pageJson.data.document_data)
                .filter(function (compData) {
                    return (
                        compData.type === 'AppPart' &&
                        _.includes([
                            coreUtils.blogAppPartNames.FEED,
                            coreUtils.blogAppPartNames.POSTS_LIST,
                            coreUtils.blogAppPartNames.TICKER
                        ], compData.appPartName)
                    );
                })
                .forEach(function (compData) {
                    _(compData.appLogicCustomizations)
                        .filter(function (customization) {
                            return (
                                customization.fieldId === 'date' &&
                                customization.forType === 'Post' &&
                                !customization.format &&
                                customization.key === 'comp.format' &&
                                _.includes(VIEW_NAMES_BY_APP_PART_NAME[compData.appPartName], customization.view)
                            );
                        })
                        .forEach(function (customization) {
                            customization.format = '*';
                        })
                        .value();
                })
                .value();
        }
    };
});
