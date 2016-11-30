define([
    'utils',
    'layout/util/rootLayoutUtils'
], function (
    utils,
    rootLayoutUtils
) {
    'use strict';

    var stretchInCenteredContainer = utils.layout.stretchInCenteredContainer;

    return function calculateScreenWidthDimensions(measureMap, siteData, rootId) {
        var fullScreenContainerWidth = Math.max(
            measureMap.width.screen,
            rootLayoutUtils.getRootWidth(siteData, measureMap, rootId)
        );

        return stretchInCenteredContainer(
            rootLayoutUtils.getRootWidth(siteData, measureMap, rootId),
            fullScreenContainerWidth
        );
    };
});
