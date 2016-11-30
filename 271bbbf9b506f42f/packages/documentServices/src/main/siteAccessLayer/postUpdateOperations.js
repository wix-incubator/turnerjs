define(['lodash',
    'coreUtils',
    'documentServices/structure/utils/componentLayout',
    'documentServices/structure/structure',
    'documentServices/documentMode/documentMode',
    'documentServices/dataModel/dataModel',
    'documentServices/anchors/anchors',
    'documentServices/constants/constants',
    'documentServices/component/componentModes',
    'documentServices/page/page',
    'utils',
    'layout',
    'experiment'
], function
    (_, coreUtils, componentLayout, structureUtils, documentMode, dataModel, anchors, constants, componentModes, page, utils, layout, experiment) {
    "use strict";

    var PERFORMANCE_NAME = 'postUpdateOperations';

    function areAllNumbers(/**num1, num2, ...*/) {
        return _.every(arguments, _.isFinite);
    }

    function isTextComponent(ps, compPointer) {
        var compType = ps.dal.get(ps.pointers.getInnerPointer(compPointer, 'componentType'));
        return (compType === 'wysiwyg.viewer.components.WRichText');
    }

    function isPacked(compProperties) {
        return compProperties && compProperties.packed;
    }

    function isAnchoredToPage(pageId, compAnchors) {
        return _.some(compAnchors, {'targetComponent': pageId, 'type': 'BOTTOM_PARENT'});

    }

    /**
     * @param {ps} ps
     * @param {Pointer} compPointer
     */
    function removeBottomBottomToTextComp(ps, compPointer) {
        var siblings = ps.pointers.components.getSiblings(compPointer);
        _.forEach(siblings, function (siblingPointer) {
            var anchorsPointer = ps.pointers.getInnerPointer(siblingPointer, ['layout', 'anchors']);
            if (!ps.dal.isExist(anchorsPointer)) {
                return;
            }
            var siblingAnchors = ps.dal.get(anchorsPointer);
            var shouldRemove = _.some(siblingAnchors, {type: 'BOTTOM_BOTTOM', targetComponent: compPointer.id});
            if (shouldRemove) {
                var withoutBottomBottom = _.reject(siblingAnchors, {
                    type: 'BOTTOM_BOTTOM',
                    targetComponent: compPointer.id
                });
                ps.dal.set(anchorsPointer, withoutBottomBottom);
            }
        });
    }

    /**
     * @returns true if need to force update after pack text
     */
    function packTextComponent(ps, compPointer, measureMap, hasPendingFonts, siteId, isMobileView) {
        var pageId = ps.siteAPI.getPrimaryPageId();
        var pageHeight = measureMap.height[pageId];
        var pageRef = page.getReference(ps, pageId);

        var shouldForceUpdate = false;
        if (!isTextComponent(ps, compPointer)) {
            return false;
        }

        var compProperties = dataModel.getPropertiesItem(ps, compPointer);
        if (isPacked(compProperties)) {
            return false;
        }

        if (!compProperties) {
            //create default text properties
            compProperties = dataModel.createPropertiesItemByType(ps, 'WRichTextProperties');
        }

        var compLayoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
        var compAnchorsPointer = ps.pointers.getInnerPointer(compLayoutPointer, 'anchors');
        var compLayout = ps.dal.get(compLayoutPointer);

        var measuredHeight = measureMap.minHeight[compPointer.id];

        var previousPackedHeight = getPreviousPackFixHeight(siteId, isMobileView, compPointer);

        //When measuredHeight < compLayout.height it means that the text content is smaller than the save text height
        //When measuredHeight !== previousPackedHeight it means that the fonts are still loading\loaded and the content had changed its height
        //Need to pack the anchors again until the packing is finished
        if (hasOriginalValues(siteId, isMobileView, compPointer) && (measuredHeight < compLayout.height || (previousPackedHeight && measuredHeight !== previousPackedHeight))) {
            var savedOriginalValues = getOriginalValues(siteId, isMobileView, compPointer);
            var packTextBottom = compLayout.y + measuredHeight;

            if (isAnchoredToPage(pageId, compLayout.anchors)) {
                page.properties.update(ps, pageRef, {minHeight: pageHeight});
            }

            var shouldUpdateAnchors = utils.layoutAnchors.packTextAnchors(compLayout.anchors, packTextBottom, measuredHeight, savedOriginalValues.height, savedOriginalValues.distancesTo);
            if (shouldUpdateAnchors) {
                ps.dal.set(compAnchorsPointer, compLayout.anchors);
                shouldForceUpdate = true;
            }
        }

        compLayout.height = measuredHeight;
        setPreviousPackFixHeight(siteId, isMobileView, compPointer, measuredHeight);
        removeBottomBottomToTextComp(ps, compPointer);
        ps.dal.set(compLayoutPointer, compLayout);

        //we do that because measureMap is used in DS for getCompByXY for example - please remove this as soon as we stop using the measureMap!!!!
        measureMap.height[compPointer.id] = measuredHeight;

        if (!hasPendingFonts) {
            //fonts finished loading, pack forever
            compProperties.packed = true;
            dataModel.updatePropertiesItem(ps, compPointer, compProperties);
        }

        return shouldForceUpdate;
    }

    /**
     * a map between site id and data that is used by the packText algorithm
     *
     * originalValues ==> is a map from component id to its original y and height from the loaded json
     * and the original distances to its anchored components
     */
    var packTextDataBySiteId = {};

    function getPackTextData(siteId, isMobileView, compPointer, fieldName) {
        return _.get(packTextDataBySiteId, [siteId, isMobileView, compPointer.id, fieldName]);
    }

    function setPackTextData(siteId, isMobileView, compPointer, fieldName, data) {
        _.set(packTextDataBySiteId, [siteId, isMobileView, compPointer.id, fieldName], data);
    }

    function getOriginalValues(siteId, isMobileView, compPointer) {
        return getPackTextData(siteId, isMobileView, compPointer, 'originalValues');
    }

    function hasOriginalValues(siteId, isMobileView, compPointer) {
        return !!getPackTextData(siteId, isMobileView, compPointer, 'originalValues');
    }

    function setOriginalValues(siteId, isMobileView, compPointer, originalValues) {
        setPackTextData(siteId, isMobileView, compPointer, 'originalValues', originalValues);
    }

    function getPreviousPackFixHeight(siteId, isMobileView, compPointer) {
        return getPackTextData(siteId, isMobileView, compPointer, 'previousPackFixHeight');
    }

    function setPreviousPackFixHeight(siteId, isMobileView, compPointer, previousPackFixHeight) {
        setPackTextData(siteId, isMobileView, compPointer, 'previousPackFixHeight', previousPackFixHeight);
    }

    function getAnchorsOriginalDistances(ps, compLayoutPointer) {
        var anchorsPointer = ps.pointers.getInnerPointer(compLayoutPointer, 'anchors');
        var compAnchors = ps.dal.get(anchorsPointer);

        var originalDistancesTo = {};

        _.forEach(compAnchors, function (anchor) {
            _.set(originalDistancesTo, [anchor.type, anchor.targetComponent], anchor.distance);
        });
        return originalDistancesTo;
    }

    function saveOriginalValues(ps, compPointer, compLayoutPointer, heightPointer, siteId, isMobileView) {
        if (!getOriginalValues(siteId, isMobileView, compPointer)) {
            setOriginalValues(siteId, isMobileView, compPointer, {
                height: ps.dal.get(heightPointer),
                distancesTo: getAnchorsOriginalDistances(ps, compLayoutPointer)
            });
        }
    }

    function updateCompLayoutAccordingToMeasure(ps, measureMap, siteId, isMobileView, compPointer) {
        if (!measureMap) {
            return;
        }

        var compLayoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
        if (!ps.dal.isExist(compLayoutPointer)) {
            return;
        }

        var measuredTop = measureMap.top[compPointer.id];
        var measuredHeight = measureMap.height[compPointer.id];
        var measuredWidth = measureMap.width[compPointer.id];
        if (!areAllNumbers(measuredTop, measuredHeight, measuredWidth)) { //measuredLeft is not mandatory, and we do not measure it by default
            return;
        }
        var measuredLeft = measureMap.left[compPointer.id];
        var compDockedPointer = ps.pointers.getInnerPointer(compLayoutPointer, 'docked');
        var docked = ps.dal.get(compDockedPointer);
        if (docked) {
            var compRuntimeLayoutPointer = ps.pointers.getInnerPointer(ps.pointers.general.getDockedRuntimeLayout(), compPointer.id);
            var dockedPosAndSize = componentLayout.getPositionAndSize(ps, compPointer);
            var currentDockedPosAndSize = ps.dal.get(compRuntimeLayoutPointer);
            if (hasValuesChanged(currentDockedPosAndSize, dockedPosAndSize)) {
                ps.dal.set(compRuntimeLayoutPointer, dockedPosAndSize);
            }
        }

        var layoutSection = {
            y: measuredTop,
            width: measuredWidth
        };
        if (!_.isUndefined(measuredLeft)) {  //measuredLeft is not mandatory, and we do not measure it by default
            layoutSection.x = measuredLeft;
        }

        var heightPointer;
        //we do not update the text height from the measure map, so that it will preserve the ability to shrink.
        heightPointer = ps.pointers.getInnerPointer(compLayoutPointer, 'height');
        layoutSection.height = measuredHeight;

        saveOriginalValues(ps, compPointer, compLayoutPointer, heightPointer, siteId, isMobileView);

        var currentLayout = ps.dal.get(compLayoutPointer);
        if (hasValuesChanged(currentLayout, layoutSection)) {
            ps.dal.merge(compLayoutPointer, layoutSection);
        }
    }

    function hasValuesChanged(origObject, newObject) {
        if (!origObject) {
            return true;
        }

        return _.some(newObject, function (value, key) {
            return !origObject || !_.isEqual(origObject[key], value);
        });
    }

    function markPagesToIgnoreBottomBottom(ps, roots) {
        _.forEach(roots, function (rootId) {
            var pageDataPointer = ps.pointers.data.getDataItemFromMaster(rootId);
            var ignoreBottomBottomPointer = ps.pointers.getInnerPointer(pageDataPointer, 'ignoreBottomBottomAnchors');
            ps.dal.set(ignoreBottomBottomPointer, true);
        });
    }


    function updateAnchorToPagesContainer(/** ps */ps) {
        var masterPagePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
        var masterPageComps = ps.pointers.components.getChildren(masterPagePointer);
        var pagesContainerPointer = _.find(masterPageComps, {id: 'PAGES_CONTAINER'});
        var pagesContainerTopPointer = ps.pointers.getInnerPointer(pagesContainerPointer, 'layout.y');
        var pagesContainerTop = ps.dal.full.get(pagesContainerTopPointer);
        var masterPageLayoutPointer = ps.pointers.getInnerPointer(masterPagePointer, 'layout');
        var headerPointer = _.find(masterPageComps, {id: 'SITE_HEADER'});
        var headerLayoutPointer = ps.pointers.getInnerPointer(headerPointer, 'layout');
        var headerLayout = ps.dal.full.get(headerLayoutPointer);
        var distanceFromHeaderToPages = pagesContainerTop - (headerLayout.y + headerLayout.height);

        var isLandingPage = distanceFromHeaderToPages < 0;
        var updatedAnchor = {
            targetComponent: 'PAGES_CONTAINER',
            type: 'BOTTOM_TOP'
        };
        if (isLandingPage) {
            updatedAnchor.distance = getDistanceFromHeaderToPagesFromAnchors(ps, masterPageComps, masterPageLayoutPointer);
        } else {
            updatedAnchor.distance = distanceFromHeaderToPages;
        }

        ps.dal.full.merge(masterPageLayoutPointer, {
            anchors: [updatedAnchor]
        });
    }

    function getDistanceFromHeaderToPagesFromAnchors(/** ps */ps, masterPageComps, masterPageLayoutPointer) {
        var masterPageLayout = ps.dal.get(masterPageLayoutPointer);
        var anchor = masterPageLayout.anchors && _.find(masterPageLayout.anchors, {targetComponent: 'PAGES_CONTAINER'});
        if (anchor) {
            return anchor.distance;
        }
        var masterPageCompsLayouts = _.map(masterPageComps, function (compPointer) {
            var compLayoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
            return ps.dal.get(compLayoutPointer);
        });
        var bottomMostCompLayoutAbovePagesContainer = _.max(masterPageCompsLayouts, function (compLayout) {
            if (getBottomTopToPages(compLayout.anchors)) {
                return coreUtils.boundingLayout.getBoundingY(compLayout) + coreUtils.boundingLayout.getBoundingHeight(compLayout);
            }

            return -10000;
        });
        var bottomMostAnchorToPagesContainer = bottomMostCompLayoutAbovePagesContainer && getBottomTopToPages(bottomMostCompLayoutAbovePagesContainer.anchors);

        if (!bottomMostAnchorToPagesContainer) {
            return 0;
        }
        var bottomOfClosestCompAbovePagesContainer = coreUtils.boundingLayout.getBoundingY(bottomMostCompLayoutAbovePagesContainer) + coreUtils.boundingLayout.getBoundingHeight(bottomMostCompLayoutAbovePagesContainer);
        var deducedPagesContainerTop = bottomMostAnchorToPagesContainer.distance + bottomOfClosestCompAbovePagesContainer;

        var headerPointer = _.find(masterPageComps, {id: 'SITE_HEADER'});
        var headerLayoutPointer = ps.pointers.getInnerPointer(headerPointer, 'layout');
        var headerLayout = ps.dal.get(headerLayoutPointer);
        return deducedPagesContainerTop - (headerLayout.y + headerLayout.height);
    }

    function getBottomTopToPages(compAnchors) {
        return _.find(compAnchors, {
            targetComponent: 'PAGES_CONTAINER',
            type: 'BOTTOM_TOP'
        });
    }

    function replaceJsonAnchorsWithCachedAnchors(/** ps */ps, compsByRoot) {
        var isMobileView = ps.siteAPI.isMobileView();
        var rootsRenderedInMobileEditorPointer = ps.pointers.general.getRootsRenderedInMobileEditor();
        var rootsRenderedInMobileEditor = ps.dal.isExist(rootsRenderedInMobileEditorPointer) ? ps.dal.get(rootsRenderedInMobileEditorPointer) : {};
        _.forEach(compsByRoot, function (compsInRoot, rootId) {
            if (isMobileView && !rootsRenderedInMobileEditor[rootId]) {
                rootsRenderedInMobileEditor[rootId] = true; // replacing anchors for mobile should execute after 2 renderes, since phone links mess with texts sizes in the first render #SE-16208
                ps.dal.set(rootsRenderedInMobileEditorPointer, rootsRenderedInMobileEditor);
                return;
            }
            if (rootId === 'masterPage') {
                var masterPagePointer = ps.pointers.components.getMasterPage(documentMode.getViewMode(ps));
                compsInRoot = ps.pointers.components.getChildrenRecursively(masterPagePointer); // for master page all children should be migrated, since landing pages only render pagesContainer
            }

            if (rootId === 'masterPage' && !isMobileView) {
                updateAnchorToPagesContainer(ps);
            }
            var anchorsWereRemoved = removeCompsJsonAnchors(ps, compsInRoot);
            if (anchorsWereRemoved) {
                ps.siteAPI.createPageAnchors(rootId);
            }
        });
    }

    function removeCompsJsonAnchors(ps, compsInRoot) {
        var res = false;
        _(compsInRoot)
            .map(function (compPointer) {
                return ps.pointers.getInnerPointer(compPointer, ['layout', 'anchors']);
            })
            .filter(ps.dal.full.isExist)
            .forEach(function (anchorsPointer) {
                res = true;
                ps.dal.full.remove(anchorsPointer);
            })
            .value();
        return res;
    }

    function getRenderedComponentsToUpdate(ps) {
        var measureMap = ps.siteAPI.getSiteMeasureMap();
        var rootIds = ps.siteAPI.getAllRenderedRootIds();
        //TODO: PARTIAL_RELAYOUT you can just create a map of pointers from this map (no need for all children)
        //be careful here, if you have all components it will kill you
        var reLayoutedCompsMap = ps.siteAPI.getReLayoutedCompsMap();

        var compsByRoot = _.indexBy(rootIds);
        compsByRoot = _.mapValues(compsByRoot, function (rootId) {
            var pagePointer = ps.pointers.components.getPage(rootId, documentMode.getViewMode(ps));
            var pageComponents = ps.pointers.components.getChildrenRecursively(pagePointer);

            pageComponents = _.filter(pageComponents, function (compPointer) {
                if (experiment.isOpen('sv_partialReLayout')) {
                    return !!reLayoutedCompsMap[compPointer.id] && _.isFinite(measureMap.height[compPointer.id]);
                }
                return _.isFinite(measureMap.height[compPointer.id]);
            });

            if (!ps.pointers.components.isMasterPage(pagePointer)) {
                pageComponents.push(pagePointer);
            }
            return pageComponents;
        });
        return {
            compsByRoot: compsByRoot,
            allComps: [].concat.apply([], _.values(compsByRoot))
        };
    }

    function updateJsonAccordingToMeasure(ps, compsToUpdate) {
        var measureMap = ps.siteAPI.getSiteMeasureMap();
        var siteId = ps.siteAPI.getSiteId();
        var isMobileView = ps.siteAPI.isMobileView();
        _.forEach(compsToUpdate, _.partial(updateCompLayoutAccordingToMeasure, ps, measureMap, siteId, isMobileView));
    }

    function runPackTextMigration(ps, compsToUpdate) {
        var shouldForceUpdate = false;
        var measureMap = ps.siteAPI.getSiteMeasureMap();
        var siteId = ps.siteAPI.getSiteId();
        var hasPendingFonts = ps.siteAPI.hasPendingFonts();
        var isMobileView = ps.siteAPI.isMobileView();
        _.forEach(compsToUpdate, function (compPointer) {
            //once shouldForceUpdate becomes true it will stay true
            var wasPacked = packTextComponent(ps, compPointer, measureMap, hasPendingFonts, siteId, isMobileView);
            shouldForceUpdate = shouldForceUpdate || wasPacked;
        });

        anchors.updateAnchorsForMultipleComps(ps);
        return shouldForceUpdate;
    }
    
    function fixAnchorsParent(/** ps */ps, comps, pageId) {
        var hasOldAnchors = _.some(comps, function (compPointer) {
            return ps.dal.isExist(ps.pointers.getInnerPointer(compPointer, ['layout', 'anchors']));
        });

        if (hasOldAnchors) {
            return;
        }

        var isMobileView = ps.siteAPI.isMobileView();
        var pagePointer = ps.pointers.components.getPage(pageId, documentMode.getViewMode(ps));
        var pageY = structureUtils.getCompLayoutRelativeToStructure(ps, pagePointer).y;
        var childrenProperty = isMobileView ? 'mobileComponents' : 'components';
        var pageChildrenPointer = ps.pointers.getInnerPointer(pagePointer, ps.pointers.components.isMasterPage(pagePointer) && !isMobileView ? 'children' : childrenProperty);

        var corruptedAnchors = _.filter(comps, function (compPointer) {
            var parent = ps.pointers.components.getParent(compPointer);
            var parentTypePointer = ps.pointers.getInnerPointer(parent, 'componentType');
            var compTypePointer = ps.pointers.getInnerPointer(compPointer, 'componentType');
            return parent && ps.dal.get(parentTypePointer) === 'wysiwyg.viewer.components.Column' &&
                ps.dal.get(compTypePointer) === 'wysiwyg.common.components.anchor.viewer.Anchor';
        });

        _.forEach(corruptedAnchors, function (anchorPointer) {
            var anchor = ps.dal.get(anchorPointer);
            anchor.layout.y = structureUtils.getCompLayoutRelativeToStructure(ps, anchorPointer).y - pageY;
            ps.dal.remove(anchorPointer);
            ps.dal.push(pageChildrenPointer, anchor);
        });
        if (!hasOldAnchors && !_.isEmpty(corruptedAnchors)) {
            ps.siteAPI.createPageAnchors(pageId);
        }
    }

    return {
        runPostUpdateOperations: function (ps) {
            if (experiment.isOpen('sv_reportPerformance')) {
                utils.performance.clearMeasures(PERFORMANCE_NAME);
                utils.performance.start(PERFORMANCE_NAME);
            }

            var renderFlagPointer = ps.pointers.general.getRenderFlag('shouldUpdateJsonFromMeasureMap');
            var shouldUpdateJsonFromMeasureMap = ps.dal.get(renderFlagPointer);
            if (!shouldUpdateJsonFromMeasureMap) {
                return false;
            }

            var compsToUpdateInfo = getRenderedComponentsToUpdate(ps);
            var allComps = compsToUpdateInfo.allComps;

            updateJsonAccordingToMeasure(ps, allComps);

            var shouldForceUpdate = runPackTextMigration(ps, allComps);

            if (experiment.isOpen('removeJsonAnchors')) {
                _.forEach(compsToUpdateInfo.compsByRoot, _.partial(fixAnchorsParent, ps));
                replaceJsonAnchorsWithCachedAnchors(ps, compsToUpdateInfo.compsByRoot);
            } else {
                markPagesToIgnoreBottomBottom(ps, _.keys(compsToUpdateInfo.compsByRoot));
            }

            if (experiment.isOpen('sv_reportPerformance')) {
                utils.performance.finish(PERFORMANCE_NAME, true, {
                    partialReLayout: experiment.isOpen('sv_partialReLayout')
                });
            }

            return shouldForceUpdate;
        },

        //reset - unfortunately I need this function for tests
        reset: function () {
            packTextDataBySiteId = {};
        }
    };
});
