define([
    'lodash',
    'utils'
], function (
    _,
    utils
) {
    'use strict';

    return {
        getRootWidth: function getRootWidth(siteData, measureMap, rootId) {
            return utils.layout.getRootWidth(measureMap, rootId, siteData.getSiteWidth());
        },
        getRootLeft: function getRootLeft(siteData, measureMap, rootId) {
            return utils.layout.getRootLeft(measureMap, rootId, siteData.getSiteX());
        }
    };
});
