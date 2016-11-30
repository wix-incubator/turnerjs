/*eslint max-statements:0*/
define([
    'lodash',
    'zepto',
    'layout/util/layout',
    'utils',
    'layout/util/rootLayoutUtils',
    'layout/util/calculateScreenWidthDimensions',
    'layout/specificComponents/bgImageLayout',
    'layout/specificComponents/balataLayout'
], function (_,
             $,
             /** layout.layout */ layout,
             utils,
             rootLayoutUtils,
             calculateScreenWidthDimensions,
             bgImageLayout,
             balataLayout) {
    'use strict';

    var balataConsts = utils.balataConsts;
    var POPUP_OVERLAY_SKIN_PART_ID = balataConsts.BALATA;

    function measureShrinkableContainer(id, measureMap, nodesMap) {
        measureMap.height[id] = nodesMap[id].offsetHeight;
        measureScreenWidthContainer(id, measureMap, nodesMap);
    }

    function getViewModeProperty(siteData) {
        return siteData.isMobileView() ? 'mobile' : 'desktop';
    }

    function getPageBackground(structureInfo, siteData) {
        return _.get(structureInfo.dataItem, ['pageBackgrounds', getViewModeProperty(siteData), 'ref']);
    }

    function measurePage(id, measureMap, nodesMap, siteData, serializedComp) {
        measureShrinkableContainer(id, measureMap, nodesMap);
        measureMap.shrinkableContainer[id] = true;

        var pageBottomByComponents = utils.layout.getPageBottomChildEnd(measureMap, nodesMap, siteData, serializedComp) + measureMap.containerHeightMargin[id]; //IMPORTANT! the containerHeightMargin must be here or we will have an endless loop with anchors resizing the page

        var minHeight = siteData.getPageMinHeight();
        var pagePropertiesItem = _.get(serializedComp, ['propertiesItem', siteData.isMobileView() ? 'mobile' : 'desktop']);

        if (pagePropertiesItem && pagePropertiesItem.minHeight) {
            minHeight = pagePropertiesItem.minHeight;
        }

        measureMap.pageBottomByComponents[id] = pageBottomByComponents;
        measureMap.minHeight[id] = minHeight;
        measureMap.height[id] = Math.max(minHeight, pageBottomByComponents);

        nodesMap.POPUPS_ROOT = $('#POPUPS_ROOT');
        if (serializedComp.dataItem.isPopup) {
            var dataItem = {background: getPageBackground(serializedComp, siteData)};
            var overlayStructureInfo = _.clone(serializedComp);

            overlayStructureInfo.id += POPUP_OVERLAY_SKIN_PART_ID;
            overlayStructureInfo.designDataItem = dataItem;

            measureMap.top[id] = 0;
            measureBalataPopupsOverlay(id, measureMap, nodesMap, siteData, overlayStructureInfo);
        }
    }

    function measureContainer(id, measureMap, nodesMap) {
        //we take the actual offsetHeight for the case the height written in the structure is bigger
        var inlineContentHeight = measureMap.height[id + "inlineContent"] || 0;
        measureMap.containerHeightMargin[id] = inlineContentHeight ? (nodesMap[id].offsetHeight - inlineContentHeight) : 0;
    }

    function measureScreenWidthContainer(id, measureMap, nodesMap) {
        measureMap.left[id] = 0;
        measureContainer(id, measureMap, nodesMap);
    }

    function measureBalataPopupsOverlay(id, measureMap, nodesMap, siteData, structureInfo) {
        measureScreenWidthContainer(id, measureMap, nodesMap);

        if (getBackgroundDataItem(structureInfo)) {
            balataLayout.measure(id, measureMap, nodesMap, siteData, structureInfo, {
                left: Math.max(0, 0.5 * (measureMap.clientWidth - measureMap.width.screen)),
                width: measureMap.width.screen,
                height: measureMap.innerHeight.screen
            });
        }
    }

    function measureStripContainer(id, measureMap, nodesMap, siteData, structureInfo) {
        measureScreenWidthContainer(id, measureMap, nodesMap);
        if (!getBackgroundDataItem(structureInfo)) {
            return;
        }

        var screenWidthDimensions = calculateScreenWidthDimensions(measureMap, siteData, structureInfo.rootId);
        measureMap.width[id] = screenWidthDimensions.width;
        var overrides = {
            width: screenWidthDimensions.width,
            left: screenWidthDimensions.left,
            height: measureMap.height[id]
        };
        balataLayout.measure(id, measureMap, nodesMap, siteData, structureInfo, overrides);

    }

    function measureHeaderFooter(id, measureMap, nodesMap, siteData, structureInfo) {
        measureMap.custom[id] = {
            isFixedPosition: structureInfo.layout.fixedPosition
        };
        measureScreenWidthContainer(id, measureMap, nodesMap);
    }

    function patchZeroLeft(id, patchers) {
        patchers.css(id, {
            left: 0
        });
    }

    function patchScreenFullWidth(id, patchers, measureMap, structureInfo, siteData, childNodeId) {
        patchers.css(childNodeId, {
            width: measureMap.width.screen,
            left: calcLeftPosition(structureInfo.layout.width, measureMap.width.screen, siteData)
        });
        patchZeroLeft(id, patchers);
    }

    function patchScreenWidth(id, patchers, measureMap, structureInfo, siteData) {
        var screenWidthId = id + "screenWidthBackground";
        patchScreenFullWidth(id, patchers, measureMap, structureInfo, siteData, screenWidthId);
    }

    function measureStripContainerSlideShow(id, measureMap, nodesMap) {
        measureScreenWidthContainer(id, measureMap, nodesMap);
        var $navigationArrows = $(nodesMap[id + "navigationArrows"]);
        measureMap.custom[id] = {
            offset: parseInt($navigationArrows.attr('data-navigation-button-margin'), 10)
        };
    }

    function measureStripContainerSlideShowSlide(id, measureMap, nodesMap, siteData, structureInfo) {
        var slideNode = $(nodesMap[id]);
        var slideParentId = slideNode.data('parent-id');
        measureMap.minHeight[id] = slideNode.data('min-height');
        measureMap.height[id] = measureMap.height[slideParentId];
        measureStripContainer(id, measureMap, nodesMap, siteData, structureInfo);
    }

    function patchParentWithFullWidthAndInlineContentWithSiteWidth(id, patchers, measureMap, siteData, structureInfo) {
        var inlineContentId = id + "inlineContent";
        var inlineContentParentId = inlineContentId + "Parent";
        var dimensions = calculateScreenWidthDimensions(measureMap, siteData, structureInfo.rootId);
        patchers.css(inlineContentParentId, {
            left: dimensions.left,
            width: dimensions.width
        });

        patchers.css(inlineContentId, {
            left: dimensions.left * (-1),
            width: rootLayoutUtils.getRootWidth(siteData, measureMap, structureInfo.rootId)
        });
    }

    function patchStripContainerSlideShowSlideScreenWidth(id, patchers, measureMap, structureInfo, siteData) {
        patchParentWithFullWidthAndInlineContentWithSiteWidth(id, patchers, measureMap, siteData, structureInfo);
    }

    function patchStripContainerSlideShow(id, patchers, measureMap, structureInfo, siteData) {
        patchZeroLeft(id, patchers, measureMap);
        patchParentWithFullWidthAndInlineContentWithSiteWidth(id, patchers, measureMap, siteData, structureInfo);

        var arrowSideOffset = calcLeftPosition(structureInfo.layout.width, measureMap.width.screen, siteData) + measureMap.custom[id].offset;
        patchers.css(id, {
            width: siteData.getSiteWidth()
        });

        patchers.css(id + "prevButton", {
            left: arrowSideOffset
        });
        patchers.css(id + "nextButton", {
            right: arrowSideOffset
        });
    }

    function patchPage(id, patchers, measureMap, structureInfo, siteData) {
        if (structureInfo.dataItem.isPopup) {
            patchers.css('POPUPS_ROOT', {
                width: measureMap.innerWidth.screen,
                height: measureMap.innerHeight.screen
            });

            var overlayId = id + POPUP_OVERLAY_SKIN_PART_ID;
            var overlayStructureInfo = _.defaultsDeep({
                id: overlayId,
                rootId: 'masterPage',
                structure: {behaviors: []}
            }, structureInfo);

            var pageBackground = getPageBackground(structureInfo, siteData);
            overlayStructureInfo.designDataItem = {background: pageBackground};

            balataLayout.patch(id, patchers, measureMap, overlayStructureInfo, siteData, {
                left: measureMap.left[overlayId],
                top: measureMap.top[overlayId],
                width: measureMap.width[overlayId],
                height: measureMap.height[overlayId]
            });
        }
    }

    function patchStripContainer(id, patchers, measureMap, structureInfo, siteData, overrides) {
        if (!getBackgroundDataItem(structureInfo)) {
            return;
        }

        patchZeroLeft(id, patchers);
        var screenWidthDimensions = calculateScreenWidthDimensions(measureMap, siteData, structureInfo.rootId);
        var parentDimensions = _.assign({
            top: 0,
            left: screenWidthDimensions.left,
            width: screenWidthDimensions.width,
            height: measureMap.height[id],
            absoluteLeft: 0
        }, overrides);

        patchers.css(id, {width: rootLayoutUtils.getRootWidth(siteData, measureMap, structureInfo.rootId)});
        balataLayout.patch(id, patchers, measureMap, structureInfo, siteData, parentDimensions);
    }

    function hasImageData(structureInfo) {
        return _.get(structureInfo, ['dataItem', 'type']) === 'Image';
    }

    function measureBgImageStrip(id, measureMap, nodesMap, siteData, structureInfo) {
        var dimensions = calculateScreenWidthDimensions(measureMap, siteData, structureInfo.rootId);
        measureMap.width[id] = dimensions.width;
        measureMap.left[id] = dimensions.left;

        if (hasImageData(structureInfo)) {
            bgImageLayout.measureLegacyBgImageStrip(id, measureMap, nodesMap, siteData, structureInfo);
        }
    }

    function patchBgImageStrip(id, patchers, measureMap, structureInfo, siteData) {
        patchers.css(id, {
            width: measureMap.width[id] + 'px',
            left: measureMap.left[id] + 'px'
        });
        if (hasImageData(structureInfo)) {
            var parentDimensions = {width: measureMap.width[id], height: measureMap.height[id]};
            bgImageLayout.patchLegacyBgImageStrip(id, patchers, measureMap, structureInfo, siteData, parentDimensions);
        } else {
            var legacyBgImageId = id + 'bg';
            patchers.css(legacyBgImageId, {backgroundImage: 'none'});
        }
    }

    function calcLeftPosition(layoutWidth, screenWidth, siteData) {
        if (siteData.isMobileView() || siteData.isMobileDevice()) {
            return 0;
        }
        return Math.min(parseInt(Math.floor((layoutWidth - screenWidth) / 2), 10), 0);
    }

    function patchFooter(id, patchers, measureMap, /** layout.structureInfo */ structureInfo) {
        var isFixed = structureInfo.layout && structureInfo.layout.fixedPosition;
        patchers.css(id, {
            height: measureMap.height[id],
            bottom: isFixed ? measureMap.siteMarginBottom : 'auto',
            top: isFixed ? 'auto' : measureMap.top[id]
        });
    }

    function getBackgroundDataItem(structureInfo) {
        if (_.isUndefined(structureInfo.designDataItem)) {
            return structureInfo.dataItem.background;
        }
        return structureInfo.designDataItem.background;
    }

    layout.registerRequestToMeasureDom("mobile.core.components.Container");
    layout.registerRequestToMeasureDom("mobile.core.components.Page");
    layout.registerRequestToMeasureDom("wixapps.integration.components.AppPage");
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.FooterContainer");
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.HeaderContainer");
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.ScreenWidthContainer");
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.StripContainerSlideShow");
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.StripContainer");
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.StripColumnsContainer");
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.Column");
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.StripContainerSlideShowSlide");

    layout.registerMeasureChildrenFirst("mobile.core.components.Page", true);
    layout.registerMeasureChildrenFirst("wixapps.integration.components.AppPage", true);

    layout.registerRequestToMeasureChildren("mobile.core.components.Container", [["inlineContent"]]);
    layout.registerRequestToMeasureChildren("mobile.core.components.Page", function (siteData, compId, nodesMap, structureInfo) {
        if (structureInfo.dataItem.isPopup) {
            return [["inlineContent"]].concat(balataLayout.BALATA_PATHS_TO_REQUEST_MEASURE);
        }

        return [["inlineContent"]];
    });
    layout.registerRequestToMeasureChildren("wixapps.integration.components.AppPage", [["inlineContent"]]);

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.FooterContainer", [["screenWidthBackground"], ["inlineContent"]]);
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.PagesContainer", [["screenWidthBackground"], ["inlineContent"]]);
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.HeaderContainer", [["screenWidthBackground"], ["inlineContent"]]);
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.ScreenWidthContainer", [["screenWidthBackground"], ["inlineContent"]]);
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.StripContainerSlideShow", [["background"], ["inlineContentParent"], ["inlineContent"], ["shownOnAllSlides"], ["navigationArrows"], ["prevButton"], ["nextButton"]]);

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.StripContainer", [["inlineContent"]].concat(balataLayout.BALATA_PATHS_TO_REQUEST_MEASURE));
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.StripContainerSlideShowSlide", [["inlineContentParent"], ["inlineContent"]].concat(balataLayout.BALATA_PATHS_TO_REQUEST_MEASURE));

    layout.registerCustomMeasure("mobile.core.components.Container", measureContainer);
    layout.registerCustomMeasure("mobile.core.components.Page", measurePage);
    layout.registerCustomMeasure("wixapps.integration.components.AppPage", measurePage);
    layout.registerCustomMeasure("wysiwyg.viewer.components.FooterContainer", measureHeaderFooter);
    layout.registerCustomMeasure("wysiwyg.viewer.components.PagesContainer", measureShrinkableContainer);
    layout.registerCustomMeasure("wysiwyg.viewer.components.HeaderContainer", measureHeaderFooter);
    layout.registerCustomMeasure("wysiwyg.viewer.components.ScreenWidthContainer", measureScreenWidthContainer);
    layout.registerCustomMeasure("wysiwyg.viewer.components.StripContainerSlideShow", measureStripContainerSlideShow);
    layout.registerCustomMeasure("wysiwyg.viewer.components.StripContainer", measureStripContainer);
    layout.registerCustomMeasure("wysiwyg.viewer.components.StripContainerSlideShowSlide", measureStripContainerSlideShowSlide);
    layout.registerCustomMeasure("wysiwyg.viewer.components.BgImageStrip", measureBgImageStrip);

    layout.registerSAFEPatchers("wysiwyg.viewer.components.FooterContainer", [patchScreenWidth, patchFooter]);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.HeaderContainer", patchScreenWidth);
    layout.registerSAFEPatcher("mobile.core.components.Page", patchPage);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.PagesContainer", patchScreenWidth);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.ScreenWidthContainer", patchScreenWidth);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.StripContainerSlideShow", patchStripContainerSlideShow);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.StripContainer", patchStripContainer);
    layout.registerSAFEPatchers("wysiwyg.viewer.components.StripContainerSlideShowSlide", [patchStripContainerSlideShowSlideScreenWidth, patchStripContainer]);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.BgImageStrip", patchBgImageStrip);

    return {
        measureContainer: measureContainer,
        measureStripContainer: measureStripContainer,
        patchStripContainer: patchStripContainer
    };
});
