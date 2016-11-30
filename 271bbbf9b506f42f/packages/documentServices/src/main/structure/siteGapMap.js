define([
    'lodash',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/structure/structureUtils'
], function(_, documentModeInfo, structureUtils) {
    'use strict';

    var siteGapMaps = {};

    function getSiteGapMap(ps) {
        var viewMode = documentModeInfo.getViewMode(ps);

        var header = ps.pointers.components.getHeader(viewMode);
        var footer = ps.pointers.components.getFooter(viewMode);
        var pagesContainer = ps.pointers.components.getPagesContainer(viewMode);

        var headerLayout = structureUtils.getComponentLayout(ps, header);
        var pagesContainerLayout = structureUtils.getComponentLayout(ps, pagesContainer);
        var footerLayout = structureUtils.getComponentLayout(ps, footer);

        var headerBottom = headerLayout.y + headerLayout.height;
        var pagesContainerBottom = pagesContainerLayout.y + pagesContainerLayout.height;

        return {
            aboveHeader: headerLayout.y,
            abovePagesContainer: pagesContainerLayout.y - headerBottom,
            aboveFooter: footerLayout.y - pagesContainerBottom
        };
    }

    function createInitialGapMap(ps) {
        var siteId = ps.siteAPI.getSiteId();

        if (!siteGapMaps[siteId]) {
            siteGapMaps[siteId] = getSiteGapMap(ps);
        }

        return siteGapMaps[siteId];
    }

    function getInitialGapMap(ps) {
        return siteGapMaps[ps.siteAPI.getSiteId()];
    }


    return {
        createInitialGapMap: createInitialGapMap,
        getInitialGapMap: getInitialGapMap
    };
});