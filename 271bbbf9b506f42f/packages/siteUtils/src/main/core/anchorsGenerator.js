define(['lodash',
    'experiment',
    'siteUtils/core/constants',
    'coreUtils',
    'siteUtils/core/layoutUtils',
    'siteUtils/core/skinAnchorsMetaData',
    'siteUtils/core/componentsAnchorsMetaData'], function
    (_, experiment, constants, coreUtils, layoutUtils, skinAnchorsMetaData, componentsAnchorsMetaData) {
    'use strict';

    var COMPS_WITH_NO_ANCHORS = ['BACK_TO_TOP_BUTTON'];
    var COMPS_WITH_RUNTIME_DYNAMIC_HEIGHT = ['PAGES_CONTAINER'];
    var STRUCTURAL_COMP_IDS = ['SITE_HEADER', 'SITE_FOOTER', 'PAGES_CONTAINER'];
    var pageTypes = ['Page', 'Document'];
    var slideShowComponentTypes = ['wysiwyg.viewer.components.BoxSlideShow', 'wysiwyg.viewer.components.StripContainerSlideShow'];
    var currentAnchorsMap, theme;
    var types = {
        bottomTop: 'BOTTOM_TOP',
        bottomParent: 'BOTTOM_PARENT',
        topTop: 'TOP_TOP'
    };

    var parentPlaceholder = 'parentNode';

    function isLowerCompBottomBelowUpperComp(upperCompLayout, lowerCompLayout) {
        var lowerCompY = coreUtils.boundingLayout.getBoundingY(lowerCompLayout);
        var lowerCompBottom = lowerCompY + coreUtils.boundingLayout.getBoundingHeight(lowerCompLayout);

        var upperCompY = coreUtils.boundingLayout.getBoundingY(upperCompLayout);
        var upperCompHeight = coreUtils.boundingLayout.getBoundingHeight(upperCompLayout);
        var upperCompBottom = upperCompY + upperCompHeight;

        var upperCompCenter = upperCompY + upperCompHeight / 2;

        return (lowerCompBottom > upperCompBottom) && (lowerCompY > upperCompCenter);
    }

    function createBottomTopAnchor(fromComp, toComp, zeroOriginalValue) {
        var fromCompLayout = fromComp.layout;
        var toCompLayout = toComp.layout;
        var toCompY = coreUtils.boundingLayout.getBoundingY(toCompLayout);
        var distance = toCompY - coreUtils.boundingLayout.getBoundingY(fromCompLayout) - coreUtils.boundingLayout.getBoundingHeight(fromCompLayout);
        var originalValue = zeroOriginalValue ? 0 : toCompY;

        createAnchor(types.bottomTop, fromComp.componentType, fromComp.id, toComp.id, distance, originalValue);
    }

    function createTopTopAnchor(fromComp, toComp) {
        var fromCompLayout = fromComp.layout;
        var toCompLayout = toComp.layout;
        var distance = coreUtils.boundingLayout.getBoundingY(toCompLayout) - coreUtils.boundingLayout.getBoundingY(fromCompLayout);

        createAnchor(types.topTop, fromComp.componentType, fromComp.id, toComp.id, distance, coreUtils.boundingLayout.getBoundingY(toCompLayout));
    }

    function createBottomParentAnchor(fromComp, toComp) {
        if (toComp.id === 'masterPage' || toComp.id === constants.COMP_IDS.PAGES_CONTAINER) {
            return createAnchor(types.bottomParent, fromComp.componentType, fromComp.id, toComp.id, 0, 0);
        }
        var distance;
        var toCompLayout = toComp.layout;
        var toCompStyleId = toComp.styleId && toComp.styleId.replace('#', '');
        var toCompStyle = theme[toCompStyleId];
        var toCompSkin = toCompStyle && toCompStyle.skin || toComp.skin;
        var fromCompLayout = fromComp.layout;
        var fromCompY = coreUtils.boundingLayout.getBoundingY(fromCompLayout);
        var fromCompHeight = coreUtils.boundingLayout.getBoundingHeight(fromCompLayout);
        var anchorableContainerHeight = toCompLayout.height - skinAnchorsMetaData.getNonAnchorableHeightForSkin(toCompSkin, toCompStyle);
        var isZeroDistanceToParent = _.includes(pageTypes, toComp.type) || _.includes(slideShowComponentTypes, toComp.componentType);
        var originalValue = anchorableContainerHeight;
        distance = isZeroDistanceToParent ? 0 : anchorableContainerHeight - (fromCompY + fromCompHeight);

        return createAnchor(types.bottomParent, fromComp.componentType, fromComp.id, toComp.id, distance, originalValue);
    }

    function getBasicAnchorStructure(type, fromCompId, toCompId, originalValue) {
        return {
            distance: 0,
            locked: true,
            originalValue: originalValue,
            fromComp: fromCompId,
            targetComponent: toCompId,
            type: type
        };
    }

    function createAnchor(type, fromCompType, fromCompId, toCompId, distance, originalValue) {
        var anchor = getBasicAnchorStructure(type, fromCompId, toCompId, originalValue);
        anchor.distance = distance;

        anchor.locked = isAnchorLocked(type, fromCompType, distance);
        var fromCompAnchors = currentAnchorsMap[fromCompId];

        fromCompAnchors.push(anchor);
    }

    function isAnchorLocked(type, fromCompType, distance) {
        if (type === types.topTop) {
            return true;
        }

        var anchorsMetaData = componentsAnchorsMetaData[fromCompType] || componentsAnchorsMetaData.default;

        if (anchorsMetaData.from.lock === constants.ANCHORS.LOCK_CONDITION.NEVER) {
            return false;
        }

        if (anchorsMetaData.from.lock === constants.ANCHORS.LOCK_CONDITION.ALWAYS) {
            return true;
        }

        return distance <= constants.ANCHORS.LOCK_THRESHOLD;
    }

    function canCreateAnchorsToComp(comp) {
        if (experiment.isOpen('layout_verbs_with_anchors')) {
            return _.includes(STRUCTURAL_COMP_IDS, comp.id) || !(_.includes(COMPS_WITH_NO_ANCHORS, comp.id) || comp.layout.fixedPosition || layoutUtils.isVerticallyCentered(comp.layout) || (layoutUtils.isVerticallyStretched(comp.layout) && !layoutUtils.isVerticallyStretchedToScreen(comp.layout)));
        }

        return _.includes(STRUCTURAL_COMP_IDS, comp.id) || !(_.includes(COMPS_WITH_NO_ANCHORS, comp.id) || comp.layout.fixedPosition || layoutUtils.isVerticallyDocked(comp.layout));
    }

    function getTargetsOfAnchorsFromComps(compsIds, graph) {
        return _(compsIds).map(function (compId) {
            return _.map(graph[compId], 'target');
        }).flatten().value();
    }

    function getTargetsOfAnchorsToResetOriginalValue(graph) {
        var idsInIgnoreOriginalValueChain = getTargetsOfAnchorsFromComps(COMPS_WITH_RUNTIME_DYNAMIC_HEIGHT, graph);

        var targetsOfAnchorsToResetOriginalValue = {};
        while (idsInIgnoreOriginalValueChain.length) {
            var currentId = idsInIgnoreOriginalValueChain.shift();
            targetsOfAnchorsToResetOriginalValue[currentId] = true;
            var nextInChain = _(graph[currentId])
                .map('target')
                .reject(function (compId) {
                    return _.has(targetsOfAnchorsToResetOriginalValue, compId);
                })
                .value();
            idsInIgnoreOriginalValueChain = idsInIgnoreOriginalValueChain.concat(nextInChain);
        }

        return targetsOfAnchorsToResetOriginalValue;
    }

    function createAnchorsAccordingToGraph(graph, compsMap, parent) {
        var targetsOfAnchorsToResetOriginalValue = getTargetsOfAnchorsToResetOriginalValue(graph);

        _.forEach(graph, function (compAnchorsData, compId) {
            if (!compAnchorsData.length) {
                return;
            }
            var pusher = compsMap[compId];

            _.forEach(compAnchorsData, function (anchorData) {
                if (anchorData.target === parentPlaceholder) {
                    createBottomParentAnchor(pusher, parent);
                    return;
                }
                var pushed = compsMap[anchorData.target];
                if (anchorData.type === types.bottomTop) {
                    createBottomTopAnchor(pusher, pushed, targetsOfAnchorsToResetOriginalValue[pushed.id]);
                } else {
                    createTopTopAnchor(pusher, pushed);
                }
            });
        });
    }

    /**
     * Creates new anchors to all children of given parent.
     * site structure components are treated separately inside this function
     * For non site structure comps, a dependency graph is calculated, and each edge in the graph is converted to an anchor
     * @param parent
     * @param isMobileView
     * @returns {{}} the anchors map for children of given parent
     */
    function createNewAnchorsForChildren(parent, isMobileView) {
        currentAnchorsMap = {};
        var compsMap = {};
        var children = coreUtils.dataUtils.getChildrenData(parent, isMobileView);

        if (_.isEmpty(children)) {
            return currentAnchorsMap;
        }

        if (isLandingPageStructure(children)) {
            children = resolveLandingPageStructure(parent, children, isMobileView);
        }

        _.forEach(children, function (child) {
            compsMap[child.id] = child;
            currentAnchorsMap[child.id] = [];
        });

        var childrenToCreateAnchors = _.filter(children, canCreateAnchorsToComp);
        var graph = createDependencyGraph(childrenToCreateAnchors, compsMap);
        createAnchorsAccordingToGraph(graph, compsMap, parent);
        return currentAnchorsMap;
    }

    function isLandingPageStructure(children) {
        var header = _.find(children, {id: 'SITE_HEADER'});
        if (!header) {
            return false;
        }
        var pagesContainer = _.find(children, {id: 'PAGES_CONTAINER'});
        return pagesContainer.layout.y < header.layout.y + header.layout.height;
    }

    function hasBottomTopToPages(compStructure) {
        return _.find(compStructure.layout.anchors, {
            targetComponent: 'PAGES_CONTAINER',
            type: types.bottomTop
        });
    }

    function resolveLandingPageStructure(masterPageComp, structureComps, isMobileView) {
        if (masterPageComp.layout.anchors) {
            return resolveLandingPageStructureFromMasterPageAnchors(masterPageComp, structureComps, isMobileView);
        }

        return resolveLandingPageStructureFromOldAnchors(structureComps);
    }

    /**
     * Master page of sites that went through remove anchors migration, contains an anchor with distance between the header and the pages container for desktop.
     * @param masterPageComp
     * @param structureComps
     * @returns {*}
     */
    function resolveLandingPageStructureFromMasterPageAnchors(masterPageComp, structureComps, isMobileView) {
        var res = _.clone(structureComps);
        var header = _.find(structureComps, {id: 'SITE_HEADER'});
        var footer = _.find(structureComps, {id: 'SITE_FOOTER'});
        var distanceFromHeaderToPagesContainer = getDistanceFromHeaderToPagesContainer(masterPageComp, isMobileView);
        var deducedPagesContainerTop = distanceFromHeaderToPagesContainer + coreUtils.boundingLayout.getBoundingY(header.layout) + coreUtils.boundingLayout.getBoundingHeight(header.layout);
        var pagesContainerIndex = _.findIndex(structureComps, {id: 'PAGES_CONTAINER'});
        var pagesContainer = structureComps[pagesContainerIndex];
        var updatedLayout = _.assign({}, pagesContainer.layout, {
            y: deducedPagesContainerTop,
            height: footer.layout.y - deducedPagesContainerTop
        });
        res[pagesContainerIndex] = _.assign({}, pagesContainer, {layout: updatedLayout});
        return res;
    }

    function resolveLandingPageStructureFromOldAnchors(structureComps) {
        var res = _.clone(structureComps);
        var footer = _.find(structureComps, {id: 'SITE_FOOTER'});
        var bottomMostCompAbovePagesContainer = _.max(structureComps, function (comp) {
            if (hasBottomTopToPages(comp)) {
                return coreUtils.boundingLayout.getBoundingY(comp.layout) + coreUtils.boundingLayout.getBoundingHeight(comp.layout);
            }

            return -10000;
        });
        if (!bottomMostCompAbovePagesContainer || !hasBottomTopToPages(bottomMostCompAbovePagesContainer)) {
            return res;
        }
        var bottomMostAnchorToPagesContainer = _.find(bottomMostCompAbovePagesContainer.layout.anchors, {targetComponent: 'PAGES_CONTAINER', type: types.bottomTop});
        var bottomOfClosestCompAbovePagesContainer = coreUtils.boundingLayout.getBoundingY(bottomMostCompAbovePagesContainer.layout) + coreUtils.boundingLayout.getBoundingHeight(bottomMostCompAbovePagesContainer.layout);
        var deducedPagesContainerTop = bottomMostAnchorToPagesContainer.distance + bottomOfClosestCompAbovePagesContainer;
        var pagesContainerIndex = _.findIndex(structureComps, {id: 'PAGES_CONTAINER'});
        var pagesContainer = structureComps[pagesContainerIndex];
        var updatedLayout = _.assign({}, pagesContainer.layout, {
            y: deducedPagesContainerTop,
            height: footer.layout.y - deducedPagesContainerTop
        });
        res[pagesContainerIndex] = _.assign({}, pagesContainer, {layout: updatedLayout});
        return res;
    }

    function getDistanceFromHeaderToPagesContainer(masterPageComp, isMobileView) {
        return isMobileView ? 0 : _.get(masterPageComp, 'layout.anchors.0.distance');
    }

    function removeTransitiveBottomTopEdges(anchorsToConnect, reversedGraph) {
        var transitivelyConnectedNodes = [];
        _.forEach(anchorsToConnect, function (anchorType, id) {
            // TODO GuyR 21/03/2016 23:00 - only add from the reversed graph comps that have bottom top to id
            var bottomTopPushersIds = _(reversedGraph[id])
                .filter({type: types.bottomTop})
                .map('source')
                .value();
            transitivelyConnectedNodes = transitivelyConnectedNodes.concat(bottomTopPushersIds);

        });
        _.forEach(transitivelyConnectedNodes, function (transitivelyConnectedId) {
            delete anchorsToConnect[transitivelyConnectedId];
        });
    }

    function filterBottomParentWithTransitiveBottomTopChain(anchorsToConnect, graph) {
        return _.omit(anchorsToConnect, function (anchorType, id) {
            return _.some(graph[id], {type: types.bottomTop});
        });
    }

    function componentCanBePushed(component) {
        if (component.componentType) {
            var allowedToAnchor = _.get(componentsAnchorsMetaData, [component.componentType, 'to', 'allow']);
            if (allowedToAnchor === false) {
                return false;
            }
        }

        if (experiment.isOpen('layout_verbs_with_anchors')) {
            return !layoutUtils.isDockedToDirection(component.layout, 'top') || layoutUtils.isVerticallyStretchedToScreen(component.layout);
        }

        return true;
    }

    function componentCanPush(component) {
        if (component.componentType) {
            var allowedFromAnchor = _.get(componentsAnchorsMetaData, [component.componentType, 'from', 'allow']);
            if (allowedFromAnchor === false) {
                return false;
            }
        }

        if (experiment.isOpen('layout_verbs_with_anchors')) {
            return !layoutUtils.isDockedToDirection(component.layout, 'bottom') || layoutUtils.isVerticallyStretchedToScreen(component.layout);
        }

        return true;
    }

    /**
     * Algorithm to create dependency graph for components
     * Components are nodes in the graph.
     * Graph is directed.
     * node v1 is connected to v2 by edge, if v1 is above v2 (in layout.y), and they have direct x overlap area, with clear line between them in that area (no other comps in the middle)
     *
     * Algo -
     *
     * create root node which takes the entire x axis and is above all components
     * create parent placeholder which takes the entire x axis and is below all components
     *
     * sort the components according to y, and push the parent placeholder to the end of the sorted array.
     *
     * the array xSorted represents the current projections of components on the x axis, as the algorithm scans them downwards.
     * Each segment of xSorted, holds multiple comp ids, that cover that segment and should affect comps beneath that segment with anchors.
     *
     * scan sorted components from top to bottom, and project each comp on the current x axis
     * collect all comps that the projection hits - anchorsToConnect object
     *
     * remove transitive connections from anchorsToConnect, by using reversedGraph
     *
     * create edges from the anchorsToConnect to the current tested comp
     * create reverse edges in the reversed graph
     *
     * update xSorted with the comps representing the overlapping area
     * comps that had a bottom-top overlap with the tested comp are removed.
     * comps that had a top-top overlap remain in the xSorted.
     * half covered nodes are updated
     *
     * remove root from graph
     *
     * @param comps
     * @returns {{}}
     */
    function createDependencyGraph(comps, compsMap) {
        // initialization
        var graph = {}; //keys are ids, values are array of connected vertices - direct x overlapping components
        var reversedGraph = {};
        var ySortedComps = _.sortBy(comps, 'layout.y');
        var root = {left: -100000, right: Infinity, ids: ['root']};
        ySortedComps = addParentPlaceholderToSortedComps(ySortedComps);

        graph.root = [];
        var xSortedPushers = [root];

        var compLeft, compRight, beginIndex, endIndex;

        function updateGraph(comp, anchorsToConnect) {
            if (_.isEmpty(anchorsToConnect)) {
                return;
            }

            if (comp.id === parentPlaceholder) {
                anchorsToConnect = filterBottomParentWithTransitiveBottomTopChain(anchorsToConnect, graph);
            } else {
                removeTransitiveBottomTopEdges(anchorsToConnect, reversedGraph);
            }

            _.forEach(anchorsToConnect, function (anchorType, id) {
                graph[id].push({target: comp.id, type: anchorType});
                reversedGraph[comp.id].push({source: id, type: anchorType});
            });
        }

        // graph creation
        _.forEach(ySortedComps, function (comp) {
            graph[comp.id] = [];
            reversedGraph[comp.id] = [];

            compLeft = comp.layout.x;
            compRight = compLeft + comp.layout.width;
            beginIndex = null;
            endIndex = 0;

            var canBePushed = componentCanBePushed(comp);
            var canPush = componentCanPush(comp);
            var xSortedLength = xSortedPushers.length;
            var compsLeftOfCurrent = [];
            var anchorsToConnect = {};
            var overlappingComps = [];
            var isFirstOverlap, isLastOverlap, i;

            function addToAnchorsToConnect(testedId) {
                if (testedId === 'root') {
                    anchorsToConnect[testedId] = types.bottomTop;
                } else {
                    anchorsToConnect[testedId] = getOverlapAnchorType(compsMap[testedId], comp);
                }
            }

            // find which previously reached comps overlap current comp and create edges from them to current comp
            // create updated xSorted after pushing the current comp and replacing overlapped comps
            for (i = 0; i < xSortedLength; i++) {
                var testedComp = xSortedPushers[i];
                if (testedComp.right <= compLeft) {
                    compsLeftOfCurrent.push(testedComp);
                    continue;
                }

                if (beginIndex === null) {
                    beginIndex = i;
                    isFirstOverlap = true;
                } else {
                    isFirstOverlap = false;
                }

                if (xSortedPushers.length - 1 === i || xSortedPushers[i + 1].left > compRight) {
                    endIndex = i;
                    isLastOverlap = true;
                }

                if (canBePushed) {
                    _.forEach(testedComp.ids, addToAnchorsToConnect);
                }

                if (canPush) {
                    overlappingComps = getOverlappingComps(comp.id, overlappingComps, testedComp, anchorsToConnect, isFirstOverlap, isLastOverlap, compLeft, compRight, canBePushed);
                }

                if (isLastOverlap) {
                    break;
                }
            }

            delete anchorsToConnect.root;

            updateGraph(comp, anchorsToConnect);

            if (canPush) {
                var rightComps = _.takeRight(xSortedPushers, xSortedLength - endIndex - 1);
                xSortedPushers = _.compact(compsLeftOfCurrent).concat(overlappingComps, rightComps);
            }
        });

        delete graph.root;

        return graph;
    }

    function addParentPlaceholderToSortedComps(ySortedComps) {
        var parentNode = {
            layout: {
                x: -100000,
                y: Infinity, //should be beneath other components
                height: 10,
                width: Infinity
            },
            id: parentPlaceholder
        };
        return ySortedComps.concat(parentNode);
    }

    function getOverlapAnchorType(pusher, pushed) {
        var shouldBottomTop = isLowerCompBottomBelowUpperComp(pusher.layout, pushed.layout);
        return shouldBottomTop ? types.bottomTop : types.topTop;
    }

    function shouldKeepTopComponent(anchorType, canBePushed) {
        if (!experiment.isOpen('layout_verbs_with_anchors')) {
            return anchorType === types.topTop;
        }

        return !canBePushed || anchorType === types.topTop;
    }

    function getOverlappingComps(compId, overlappingNodes, testedNode, anchorsToConnect, isFirstOverlap, isLastOverlap, compLeft, compRight, canBePushed) {
        var result = _.clone(overlappingNodes);
        if (isFirstOverlap) {
            result.push({
                ids: testedNode.ids,
                left: testedNode.left,
                right: compLeft - 1
            });
        }

        var newNode = {
            ids: [compId],
            left: Math.max(compLeft, testedNode.left),
            right: Math.min(compRight, testedNode.right)
        };

        _.forEach(testedNode.ids, function (testedId) {
            if (shouldKeepTopComponent(anchorsToConnect[testedId], canBePushed)) {
                newNode.ids.push(testedId);
            }
        });

        var previousResultElement = _.last(result);
        if (previousResultElement && !_.isEqual(previousResultElement.ids, newNode.ids)) {
            result.push(newNode);
        } else if (previousResultElement) {
            previousResultElement.right = newNode.right;
        }

        if (isLastOverlap) {
            result.push({
                ids: testedNode.ids,
                left: compRight + 1,
                right: testedNode.right
            });
        }

        return result;
    }

    function createPageAnchors(pageStructure, siteTheme, isMobileView) {
        var componentsQueue = [pageStructure];
        var structure, children, childrenAnchorsMap;
        var pageAnchorsMap = {};
        while (componentsQueue.length) {
            structure = componentsQueue.pop();

            childrenAnchorsMap = createChildrenAnchors(structure, siteTheme, isMobileView);
            _.assign(pageAnchorsMap, childrenAnchorsMap);

            children = coreUtils.dataUtils.getChildrenData(structure, isMobileView);
            Array.prototype.push.apply(componentsQueue, children);
        }

        return pageAnchorsMap;
    }

    function createChildrenAnchors(parentStructure, siteTheme, isMobileView) {
        theme = siteTheme;
        return createNewAnchorsForChildren(parentStructure, isMobileView);
    }

    /**
     * For each anchor in the input the function will pack it's distance if needed
     *
     * @param anchors - the comp anchors
     * @param packedTextBottom - the bottom of the component
     * @param packedHeight - the height of the packed text component
     * @param savedHeight - the height that was save in the json last save
     * @param savedDistances map between <anchor type, target> to saved distance between current component and target
     * @returns boolean - true if one of the anchors was packed and updated
     */
    function packTextAnchors(anchors, packedTextBottom, packedHeight, savedHeight, savedDistances) {
        var wasAnchorPacked = false;

        var heightDiff = savedHeight - packedHeight;
        if (heightDiff < 0) {
            return false;
        }

        _.forEach(anchors, function (anchor) {
            if (anchor.locked && (anchor.type === types.bottomTop || anchor.type === types.bottomParent )) {
                var originalDistanceFromTextToOther = _.get(savedDistances, [anchor.type, anchor.targetComponent]);
                var newDistance = originalDistanceFromTextToOther + heightDiff;

                if (_.isNaN(newDistance)) {
                    return;
                }

                if (anchor.distance !== newDistance) {
                    wasAnchorPacked = true;
                    anchor.distance = newDistance;
                    anchor.originalValue = packedTextBottom + newDistance;
                    anchor.locked = isAnchorLocked(anchor.type, null, newDistance);
                }
            }
        });

        return wasAnchorPacked;
    }

    /**
     * @class anchorsGenerator
     */
    return {
        createPageAnchors: createPageAnchors,
        createChildrenAnchors: createChildrenAnchors,
        packTextAnchors: packTextAnchors
    };
});
