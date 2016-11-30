define(['lodash', 'coreUtils/core/dataUtils'], function (_, dataUtils) {
    'use strict';

    var SCROLL_TO_TOP = "SCROLL_TO_TOP";
    var SCROLL_TO_BOTTOM = "SCROLL_TO_BOTTOM";

    var SCROLL_PAGE_TOP_Y_POS = -99999;
    var SCROLL_PAGE_TOP_Y_POS_WITH_OFFSET = 0;

    function calcYOffset(anchorCompData, siteData) {
        var yOffset = 0;
        var measureMap = siteData.measureMap;

        if (measureMap && anchorCompData) {
            var anchorCompId = anchorCompData.compId;
            var isHeaderFixed = _.get(measureMap, 'custom.SITE_HEADER.isFixedPosition');
            var topFromMeasureMap = measureMap.top[anchorCompId];
            var absoluteTopFromMeasureMap = measureMap.absoluteTop[anchorCompId];

            var compTop = isHeaderFixed ? topFromMeasureMap : absoluteTopFromMeasureMap;
            var wixADSOffset = measureMap.siteOffsetTop || 0;
            yOffset = _.isFinite(compTop) ? compTop + wixADSOffset : 0;
        }

        return yOffset;
    }

    function getMaxScroll(siteData) {
        if (!siteData.measureMap) {
            return Infinity;
        }

        var wixBottomAdsHeight = siteData.measureMap.siteMarginBottom || 0;
        var wixTopAdsHeight = siteData.measureMap.siteOffsetTop || 0;
        var pageHeight = siteData.measureMap.height.masterPage + wixBottomAdsHeight + wixTopAdsHeight + siteData.renderFlags.extraSiteHeight;
        var windowHeight = siteData.measureMap.height.screen;

        return Math.max(pageHeight - windowHeight, 0);
    }

    function normalizeYOffset(anchorYOffset, siteData) {
        return Math.min(anchorYOffset, getMaxScroll(siteData));
    }

    function getAnchor(anchorQuery, pageId, siteData) {
        var pageData = siteData.getPageData(pageId);
        var compsInPage = dataUtils.getAllCompsInStructure(pageData.structure);
        return _.find(compsInPage, function (comp) {
            var connectionQuery = comp.connectionQuery;
            return connectionQuery && (_.find(pageData.data.connections_data[connectionQuery].items, {role: anchorQuery}));
        });
    }

    function getAnchorQuery(anchorQuery, siteAPI) {
        var fetchedAnchorQuery; //anchorQuery = nickname/samePageAnchor
        if (!_.startsWith(anchorQuery, 'dataItem') && siteAPI) {
            var siteData = siteAPI.getSiteData();
            var anchor = getAnchor(anchorQuery, siteData.getPrimaryPageId(), siteData);
            if (anchor) {
                fetchedAnchorQuery = anchor.dataQuery;
            }
        }
        return fetchedAnchorQuery || anchorQuery;
    }

    function calcAnchorScrollToPosition(anchorQuery, siteAPI) {
        var siteData = siteAPI.getSiteData();
        var anchorPosition = calcAnchorPosition(getAnchorQuery(anchorQuery, siteAPI), siteData);
        anchorPosition.y = normalizeYOffset(anchorPosition.y, siteData);
        return anchorPosition;
    }

    function calcAnchorPosition(anchorQuery, siteData) {
        var anchorYOffset = 0;

        if (anchorQuery === SCROLL_TO_TOP) {
            anchorYOffset = SCROLL_PAGE_TOP_Y_POS_WITH_OFFSET;
        } else if (anchorQuery === SCROLL_TO_BOTTOM) {
            anchorYOffset = (siteData.isMobileView() ? window.document.documentElement.scrollHeight : window.document.body.scrollHeight);
        } else if (anchorQuery) {
            var anchorCompData = siteData.getDataByQuery(anchorQuery, siteData.getPrimaryPageId());
            anchorYOffset = calcYOffset(anchorCompData, siteData);
        }

        return {
            x: 0,
            y: anchorYOffset,
            anchorQuery: anchorQuery
        };
    }

    function getCompLayoutFromPageStructure(pageStructure, compId) {
        var compStructure = _.find(pageStructure.structure.components, {id: compId});
        return compStructure && compStructure.layout;
    }

    function getPageAnchors(siteData, pageId, pageTopLabel) {
        var pageStructure = siteData.getPageData(pageId);
        if (!pageStructure) {
            return [];
        }

        var pageData = pageStructure.data.document_data;
        var pageAnchors = _.filter(pageData, {type: 'Anchor'});
        pageAnchors.push(getPageTopAnchor(siteData.getPrimaryPageId(), pageTopLabel));
        return _.sortBy(pageAnchors, function (pageAnchor) {
            var compLayout = getCompLayoutFromPageStructure(pageStructure, pageAnchor.compId);
            return compLayout ? compLayout.y : SCROLL_PAGE_TOP_Y_POS;
        });
    }

    function getPageTopAnchor(pageId, pageTopLabel) {
        return {
            compId: 'PAGE_TOP_ANCHOR',
            id: SCROLL_TO_TOP,
            name: pageTopLabel || '',
            type: "Anchor",
            pageId: pageId
        };
    }

    function getShowingPageAnchors(siteData, hiddenAnchorsIds) {
        hiddenAnchorsIds = hiddenAnchorsIds || [];
        //I think it should collect anchors from all pages, though now we have only on primary
        var primaryPageId = siteData.getPrimaryPageId();
        var pageAnchors = getPageAnchors(siteData, primaryPageId);
        var filteredPageAnchors = _.reject(pageAnchors, function (anchor) {
            return _.includes(hiddenAnchorsIds, anchor.compId);
        });
        return _.size(filteredPageAnchors) ? filteredPageAnchors : [pageAnchors[0]];
    }

    function getSortedAnchorsByY(siteData, anchorsToSort) {
        return _(anchorsToSort).map(function (anchor) {
            var position = calcAnchorPosition(anchor.id, siteData);
            var id = anchor.id;
            return _.assign(position, {id: id});
        }).sortBy('y').value();
    }

    function formatActiveAnchorResult(activeAnchorComp, index, total) {
        return {
            activeAnchorComp: activeAnchorComp,
            index: index,
            total: total
        };
    }

    function findLastAnchorWithYBiggerThan(sortedAnchorsByYPos, yPos) {
        var everyYZero = _.every(sortedAnchorsByYPos, 'y', 0);
        if (everyYZero) {
            return null;
        }

        var activeAnchorComp = null;
        var i = 0;
        for (; i < sortedAnchorsByYPos.length; i++) {
            var anchor = sortedAnchorsByYPos[i];
            if (yPos >= anchor.y) {
                activeAnchorComp = anchor;
            } else {
                break;
            }
        }
        if (activeAnchorComp) {
            return formatActiveAnchorResult(activeAnchorComp, i - 1, sortedAnchorsByYPos.length);
        }
        return null;
    }

    function getActiveAnchor(siteData, scrollPosition, hiddenAnchorsIds) {
        if (!siteData.measureMap) {
            return null;
        }

        var shownPageAnchors = getShowingPageAnchors(siteData, hiddenAnchorsIds);
        var pageAnchors = getSortedAnchorsByY(siteData, shownPageAnchors);
        var activeAnchor = findLastAnchorWithYBiggerThan(pageAnchors, scrollPosition);
        if (activeAnchor && getMaxScroll(siteData) <= scrollPosition) {
            return formatActiveAnchorResult(_.last(pageAnchors), pageAnchors.length - 1, pageAnchors.length);
        }

        return activeAnchor;
    }

    function isSpecialAnchor(anchorDataId){
        return anchorDataId === SCROLL_TO_BOTTOM || anchorDataId === SCROLL_TO_TOP;
    }

    return {
        /**
         * calc the anchor position by the given anchor data
         * @param anchorQuery
         * @param siteData
         * @returns {{x: number, y: *}}
         */
        getPageTopAnchor: getPageTopAnchor,
        calcAnchorScrollToPosition: calcAnchorScrollToPosition,
        getPageAnchors: getPageAnchors,
        getActiveAnchor: getActiveAnchor,
        getAnchor: getAnchor,
        normalizeYOffset: normalizeYOffset,
        isSpecialAnchor: isSpecialAnchor,
        getSortedAnchorsByY: getSortedAnchorsByY,
        SCROLL_PAGE_TOP_Y_POS: SCROLL_PAGE_TOP_Y_POS
    };
});
