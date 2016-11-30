define([
    'lodash',
    'utils'
], function (
    _,
    utils
) {
    'use strict';

    var viewNamesByAppPartName = {};

    viewNamesByAppPartName[utils.blogAppPartNames.FEED] = [
        'MasonryPage',
        'MediaBottomPage',
        'MediaLeftPage',
        'MediaRightPage',
        'MediaTopPage',
        'MediaZigzagPage'
    ];

    viewNamesByAppPartName[utils.blogAppPartNames.CUSTOM_FEED] = [
        'Masonry',
        'MediaBottom',
        'MediaLeft',
        'MediaRight',
        'MediaTop',
        'MediaZigzag'
    ];

    return {
        getBlogPaginationCustomizationsByAppPartName: function (appPartName) {
            return _.map(viewNamesByAppPartName[appPartName], function (viewName) {
                return {
                    type: 'AppPartCustomization',
                    forType: 'Array',
                    format: '*',
                    view: viewName,
                    fieldId: 'vars',
                    key: 'pageNavigationType',
                    value: 'pagination'
                };
            });
        }
    };
});
