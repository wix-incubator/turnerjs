define([
    'lodash',
    'coreUtils',
    'utils',
    'layout/util/reduceDistancesAlgorithm/minHeightDataUtils',
    'layout/util/reduceDistancesAlgorithm/reduceDistancesAlgorithmUtils',
    'layout/util/reduceDistancesAlgorithm/anchorsTypes'], function (_, coreUtils, utils, minHeightDataUtils, reduceDistancesAlgorithmUtils, anchorsTypes) {

    'use strict';

    function orderByOriginalTop(components, originalValuesManager){
        return _.sortBy(components, function(component){
            return originalValuesManager.getOriginalTop(component.id);
        });
    }

    function getComponentTopMinHeightData(layout){
        var dockTop = utils.layout.getTopDockData(layout);

        if (dockTop){
            return minHeightDataUtils.createMinHeightDataForDockedTopData(dockTop);
        }

        return minHeightDataUtils.createMinHeightData(layout.y);
    }

    function getTopMargin(componentLayout, isLocked, isChainDockedBottom){
        var noMarginUnitsData = minHeightDataUtils.createMinHeightData();
        var componentTopMinHeightData = getComponentTopMinHeightData(componentLayout);
        var isDockedTop = utils.layout.isDockedToDirection(componentLayout, 'top');
        var shouldKeepTopMargin = isLocked || isDockedTop || !isChainDockedBottom || componentTopMinHeightData.absoluteHeight < 0;

        return shouldKeepTopMargin ? componentTopMinHeightData : noMarginUnitsData;
    }

    function getMinHeightsByPusher(pusherMinHeightData, pusherHeight, pusherAnchor){
        var componentHeight = pusherAnchor.type === anchorsTypes.TOP_TOP ? 0 : pusherHeight;
        var anchorMinDistance = reduceDistancesAlgorithmUtils.getAnchorMinDistance(pusherAnchor);

        return _.map(pusherMinHeightData, function(minHeightData){
            var absoluteHeightToAdd = componentHeight + anchorMinDistance;
            return minHeightData.clone().addAbsoluteHeight(absoluteHeightToAdd);
        });
    }

    function getContainerHeightByChildren(container, measureMapManager, anchorsDataManager, isMobileView, lockedDataMap, minHeightMap, originalValuesManager, layoutsMap){

        var containerHeightByChildren = {
            value: 0,
            chainsMinHeightData: minHeightDataUtils.createChainMinHeightData(),
            isShrinkableContainer: false
        };

        var componentMinHeightDataCache = {};

        function updateContainerMinHeightByChildren(chainMinHeightData, anchorToParent){
            if (anchorToParent && anchorToParent.locked){
                containerHeightByChildren.isShrinkableContainer = true;
            }

            containerHeightByChildren.chainsMinHeightData.merge(chainMinHeightData);
        }

        function getRootNodeMinHeightData(component, isLocked){
            var compLayout = layoutsMap[component.id];
            return {
                forNonDocked: [getTopMargin(compLayout, isLocked, false)],
                forDocked: [getTopMargin(compLayout, isLocked, true)]
            };
        }

        function getNodeMinHeightData(component, componentPushers){
            var hasLockedAnchor = false;
            var minHeightsByPushersForDocked = [];
            var minHeightsByPushersForNonDocked = [];

            _.forEach(componentPushers, function(pusherAnchor){
                if (pusherAnchor.locked){
                    hasLockedAnchor = true;
                }

                var pusherMinHeightData = componentMinHeightDataCache[pusherAnchor.fromComp];
                var pusherCompHeight = minHeightMap[pusherAnchor.fromComp];

                minHeightsByPushersForDocked =
                    minHeightsByPushersForDocked.concat(getMinHeightsByPusher(pusherMinHeightData.forDocked, pusherCompHeight, pusherAnchor));
                minHeightsByPushersForNonDocked =
                    minHeightsByPushersForNonDocked.concat(getMinHeightsByPusher(pusherMinHeightData.forNonDocked, pusherCompHeight, pusherAnchor));
            });

            if (!hasLockedAnchor){
                var currentCompTop = originalValuesManager.getOriginalTop(component.id);
                var currentTopMinHeightData = minHeightDataUtils.createMinHeightData(currentCompTop);

                minHeightsByPushersForNonDocked.push(currentTopMinHeightData);
            }

            return {
                forDocked: minHeightsByPushersForDocked,
                forNonDocked : minHeightsByPushersForNonDocked
            };
        }

        function getComponentBottomMinHeightData(component){
            var dockBottom = utils.layout.getBottomDockData(layoutsMap[component.id]);

            var minHeightData;
            if (dockBottom){
                minHeightData = minHeightDataUtils.createMinHeightDataForDockedBottomData(dockBottom);
            } else {
                var anchorToParent = anchorsDataManager.getComponentAnchorToParent(component.id);
                minHeightData = minHeightDataUtils.createMinHeightData(reduceDistancesAlgorithmUtils.getAnchorMinDistance(anchorToParent));
            }

            var compHeight = minHeightMap[component.id];

            return minHeightData.clone().addAbsoluteHeight(compHeight);
        }

        function getChainMinHeightData(component, isDockedBottom, minHeightsData){
            var relevantMinHeights = isDockedBottom ? minHeightsData.forDocked : minHeightsData.forNonDocked;
            var bottomMarginMinHeightData = getComponentBottomMinHeightData(component, container);

            var minHeightsForBottomNode = _.map(relevantMinHeights, function(minHeightData){
                return minHeightData.clone().addMinHeightData(bottomMarginMinHeightData);
            });

            return minHeightDataUtils.createChainMinHeightData(minHeightsForBottomNode);
        }

        function getChainMinHeightDataForVerticallyCentered(componentId, compLayout){
            var verticallyCenterDockData = utils.layout.getVerticallyCenteredDockData(compLayout);
            var compHeight = minHeightMap[componentId];

            var minHeightForNode = minHeightDataUtils.createMinHeightDataForVerticallyCenteredDockedData(verticallyCenterDockData).addAbsoluteHeight(compHeight);

            return minHeightDataUtils.createChainMinHeightData([minHeightForNode]);
        }

        function calcMinHeightDataForNode(component){
            var isVerticallyCentered = utils.layout.isVerticallyCentered(layoutsMap[component.id]);

            if (isVerticallyCentered){
                updateContainerMinHeightByChildren(getChainMinHeightDataForVerticallyCentered(component.id, layoutsMap[component.id]));
                return;
            }

            var componentPushers = anchorsDataManager.getComponentPushers(component.id);
            var isRoot = _.isEmpty(componentPushers);
            var isLocked = !!lockedDataMap[component.id];

            var minHeightData = (isRoot || isLocked) ?
                getRootNodeMinHeightData(component, isLocked) :
                getNodeMinHeightData(component, componentPushers);

            componentMinHeightDataCache[component.id] = minHeightData;

            var anchorToParent = anchorsDataManager.getComponentAnchorToParent(component.id);
            var hasAnchorToParent = !!anchorToParent;
            var isDockedBottom = utils.layout.isDockedToDirection(layoutsMap[component.id], 'bottom');
            var isBottomNode = isDockedBottom || hasAnchorToParent;

            if (isBottomNode){
                updateContainerMinHeightByChildren(getChainMinHeightData(component, isDockedBottom, minHeightData), anchorToParent);
            }
        }

        function updateContainerHeightByChildren(){
            var childrenOrderedByY = orderByOriginalTop(coreUtils.dataUtils.getChildrenData(container, isMobileView), originalValuesManager);

            _.forEach(childrenOrderedByY, function(child){
                calcMinHeightDataForNode(child);
            });

            containerHeightByChildren.value = containerHeightByChildren.chainsMinHeightData.solve();
            delete containerHeightByChildren.chainsMinHeightData;

            return containerHeightByChildren;
        }

        return updateContainerHeightByChildren();
    }

    return function enforceComponentsMinHeight(structure, measureMapManager, anchorsDataManager, originalValuesManager, isMobileView, lockedDataMap, layoutsMap){

        var minHeightMap = {};

        function getMinHeights(component, containerHeightByChildren, isContainerVerticallyStretched){
            var minHeights = [];
            var layout = layoutsMap[component.id];

            if (!layout){
                return minHeights;
            }

            var aspectRatio = layout.aspectRatio || 0;

            var isShrinkable = isContainerVerticallyStretched || layout.isVerticallyStretchedToScreen || aspectRatio || measureMapManager.isShrinkableContainer(component.id) || (containerHeightByChildren && containerHeightByChildren.isShrinkableContainer);

            if (aspectRatio) {
                var currentWidth = measureMapManager.getComponentWidth(component.id);
                minHeights.push(aspectRatio * currentWidth);
            }

            if (containerHeightByChildren){
                minHeights.push(containerHeightByChildren.value + measureMapManager.getContainerHeightMargin(component.id));

                if (!isShrinkable){
                    var originalHeight = originalValuesManager.getOriginalHeight(component.id);
                    minHeights.push(originalHeight);
                }
            }

            if (isShrinkable){
                var measuredMinHeight = measureMapManager.getComponentMinHeight(component.id);
                var structureMinHeight = layout.minHeight || 0;

                minHeights.push(measuredMinHeight, structureMinHeight);
            }

            return minHeights;
        }

        function updateEnforcedMinHeight(componentId, minHeights, shouldUpdateHeight){
            if (shouldUpdateHeight) {
                if (minHeights.length){
                    measureMapManager.setComponentHeight(componentId, _.max(minHeights));
                }

                minHeightMap[componentId] = measureMapManager.getComponentHeight(componentId);
            } else {
                minHeightMap[componentId] = minHeights.length ? (_.max(minHeights)) : 0;
            }
        }

        function fixComponentHeight(component, containerHeightByChildren){
            if (measureMapManager.isCollapsed(component.id)){
                measureMapManager.setComponentHeight(component.id, 0);
                minHeightMap[component.id] = 0;
                return;
            }

            var isContainerVerticallyStretched = utils.layout.isVerticallyStretched(layoutsMap[component.id]);
            var minHeights = getMinHeights(component, containerHeightByChildren, isContainerVerticallyStretched);
            updateEnforcedMinHeight(component.id, minHeights, !isContainerVerticallyStretched);
        }

        function shouldEnforceChildren(componentId){
            return !measureMapManager.isCollapsed(componentId);
        }

        function fixContainerHeight(container){
            var children = coreUtils.dataUtils.getChildrenData(container, isMobileView);
            var containerHeightByChildren;
            var isContainerLocked = lockedDataMap[container.id];

            if (!_.isEmpty(children) && shouldEnforceChildren(container.id)){
                _.forEach(children, fixContainerHeight);

                if (!isContainerLocked){
                    containerHeightByChildren = getContainerHeightByChildren(container, measureMapManager, anchorsDataManager, isMobileView, lockedDataMap, minHeightMap, originalValuesManager, layoutsMap);
                }
            }

            // todo - check scenario when container is locked - should we enforce aspectRatio/minHeight?
            fixComponentHeight(container, containerHeightByChildren);
        }

        fixContainerHeight(structure);
    };
});
