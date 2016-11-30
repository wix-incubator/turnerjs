define(['lodash', 'coreUtils', 'utils', 'layout/util/reduceDistancesAlgorithm/reduceDistancesAlgorithmUtils', 'layout/util/reduceDistancesAlgorithm/anchorsTypes'],
    function (_, coreUtils, utils, reduceDistancesAlgorithmUtils, anchorsTypes) {
        'use strict';

        function orderByOriginalTop(components, originalValuesManager){
            return _.sortBy(components, function(component){
                return originalValuesManager.getOriginalTop(component.id);
            });
        }

        function getHeightForVerticallyStretchedComponent(layout, parentId, measureMapManager){
            var parentHeight = measureMapManager.getComponentHeight(parentId);
            var parentWidth = measureMapManager.getComponentWidth(parentId);
            var clientSize = measureMapManager.getClientSize();

            return utils.positionAndSize.getHeightInPixelsRounded(layout, {width: parentWidth, height: parentHeight}, clientSize);
        }

        function getComponentTopBasedOnStructure(componentId, componentLayout, parentId, measureMapManager){
            var parentDimensions = {
                width: measureMapManager.getComponentWidth(parentId),
                height: measureMapManager.getComponentHeight(parentId)
            };
            var clientSize = measureMapManager.getClientSize();
            var compHeight = measureMapManager.getComponentHeight(componentId);

            return utils.positionAndSize.getYInPixelsRounded(componentLayout, parentDimensions, clientSize, compHeight);
        }

        function getEnforcedTopByPusher(componentId, pushersAnchors, originalValuesManager, measureMapManager){
            var pushersEnforcedTop = [];
            var shouldEnforceOriginalValue = _.every(pushersAnchors, {locked: false});

            _.forEach(pushersAnchors, function(anchor){
                if (shouldEnforceOriginalValue){
                    var originalTop = originalValuesManager.getOriginalTop(componentId);
                    pushersEnforcedTop.push(originalTop);
                }

                var pusherTop = measureMapManager.getComponentTop(anchor.fromComp);
                var pusherHeight = anchor.type === anchorsTypes.TOP_TOP ? 0 : measureMapManager.getComponentHeight(anchor.fromComp);
                var anchorMargin = reduceDistancesAlgorithmUtils.getAnchorMinDistance(anchor);

                var currentPusherEnforcedTop = pusherTop + pusherHeight + anchorMargin;
                pushersEnforcedTop.push(currentPusherEnforcedTop);
            });

            return _.max(pushersEnforcedTop);
        }

        function getEnforcedTopByLockedPusher(pushersAnchors, measureMapManager){
            var pushersEnforcedTop = [];

            if (!_.some(pushersAnchors, 'locked')){
                return null;
            }

            _.forEach(pushersAnchors, function(anchor){
                var pusherTop = measureMapManager.getComponentTop(anchor.fromComp);
                var pusherHeight = anchor.type === anchorsTypes.TOP_TOP ? 0 : measureMapManager.getComponentHeight(anchor.fromComp);
                var anchorMargin = reduceDistancesAlgorithmUtils.getAnchorMinDistance(anchor);

                var currentPusherEnforcedTop = pusherTop + pusherHeight + anchorMargin;
                pushersEnforcedTop.push(currentPusherEnforcedTop);
            });

            return _.max(pushersEnforcedTop);
        }

        function checkIsDockedBottom(componentLayout){
            return utils.layout.isDockedToDirection(componentLayout, 'bottom');
        }

        return function enforceAnchorsAndDocking(structure, measureMapManager, anchorsDataManager, originalValuesManager, isMobileView, lockedDataMap, layoutsMap){

            function enforceDockingPosition(component, parentId){
                var componentTopBasedOnStructure = getComponentTopBasedOnStructure(component.id, layoutsMap[component.id], parentId, measureMapManager);

                measureMapManager.setComponentTop(component.id, componentTopBasedOnStructure);
            }

            function enforceDockingSize(component, parentId){
                if (utils.layout.isVerticallyStretched(layoutsMap[component.id]) && !measureMapManager.isCollapsed(component.id)){
                    var stretchedHeight = getHeightForVerticallyStretchedComponent(layoutsMap[component.id], parentId, measureMapManager);

                    measureMapManager.setComponentHeight(component.id, stretchedHeight);
                }
            }

            function enforceComponentDocking(component, parent){
                enforceDockingPosition(component, parent.id);
                enforceDockingSize(component, parent.id);
            }

            function enforceComponentLockedAnchors(component){
                var componentPushers = anchorsDataManager.getComponentPushers(component.id);

                if (_.isEmpty(componentPushers)){
                    return;
                }

                var componentEnforcedTop = getEnforcedTopByLockedPusher(componentPushers, measureMapManager);

                if (componentEnforcedTop === null){
                    return;
                }

                measureMapManager.setComponentTop(component.id, componentEnforcedTop);
            }

            function enforceComponentAnchors(component){
                var componentPushers = anchorsDataManager.getComponentPushers(component.id);

                if (_.isEmpty(componentPushers) || lockedDataMap[component.id]){
                    return;
                }

                var componentEnforcedTop = getEnforcedTopByPusher(component.id, componentPushers, originalValuesManager, measureMapManager);

                measureMapManager.setComponentTop(component.id, componentEnforcedTop);
            }

            function enforceChildrenAnchorsAndDocking(componentsSortedByY, parent){
                _.forEach(componentsSortedByY, function(component){
                    var isVerticallyDocked = utils.layout.isVerticallyDocked(layoutsMap[component.id]);

                    if (isVerticallyDocked){
                        enforceComponentDocking(component, parent);
                    } else {
                        enforceComponentAnchors(component);
                    }
                });
            }

            function enforceChildrenLockedAnchorsOnly(componentsSortedByY, parent){
                _.forEach(componentsSortedByY, function(component){
                    var isDockedTop = utils.layout.isDockedToDirection(layoutsMap[component.id], 'top');
                    var isDockedBottom = utils.layout.isDockedToDirection(layoutsMap[component.id], 'bottom');

                    if (!isDockedTop && !isDockedBottom){
                        enforceComponentLockedAnchors(component, parent);
                    }
                });
            }

            function pushDockedBottomChains(components){
                var isAnyComponentsChanged = false;

                function pushComponentByBottomValue(compId, compBottom){
                    var currentTop = measureMapManager.getComponentTop(compId);
                    var newTop = compBottom - measureMapManager.getComponentHeight(compId);

                    if (newTop >= currentTop){
                        return null;
                    }

                    measureMapManager.setComponentTop(compId, newTop);
                    isAnyComponentsChanged = true;
                    return newTop;
                }

                function pushToTopRecursively(anchor, pusherCompTop){
                    var pushedCompId = anchor.fromComp;
                    var anchorMargin = reduceDistancesAlgorithmUtils.getAnchorMinDistance(anchor);
                    var pushedNewBottom = pusherCompTop - anchorMargin;

                    var newPushedTop = pushComponentByBottomValue(pushedCompId, pushedNewBottom);

                    if (newPushedTop !== null){
                        var componentPushers = anchorsDataManager.getComponentPushers(pushedCompId);

                        _.forEach(componentPushers, function(pusherAnchor){
                            pushToTopRecursively(pusherAnchor, newPushedTop);
                        });
                    }
                }

                function pushChainForDockedBottomComp(compId){
                    var componentTop = measureMapManager.getComponentTop(compId);
                    var dockedPusherAnchors = anchorsDataManager.getComponentPushers(compId);

                    _.forEach(dockedPusherAnchors, function(anchor){
                        pushToTopRecursively(anchor, componentTop);
                    });
                }

                var dockedBottomComponents = _.filter(components, function (component) {
                    return checkIsDockedBottom(layoutsMap[component.id]);
                });

                _.forEach(dockedBottomComponents, function(component){
                    pushChainForDockedBottomComp(component.id);
                });

                return isAnyComponentsChanged;
            }

            function shouldEnforceChildren(componentId){
                return !measureMapManager.isCollapsed(componentId);
            }

            function updateChildrenEnforcedTopRecursively(container){
                var children = coreUtils.dataUtils.getChildrenData(container, isMobileView);

                if (!_.isEmpty(children) && shouldEnforceChildren(container.id)){
                    var childrenSortedByY = orderByOriginalTop(children, originalValuesManager);
                    enforceChildrenAnchorsAndDocking(childrenSortedByY, container);
                    var isDirty = pushDockedBottomChains(childrenSortedByY);

                    if (isDirty){
                        enforceChildrenLockedAnchorsOnly(childrenSortedByY, container);
                    }
                    _.forEach(children, updateChildrenEnforcedTopRecursively);
                }
            }

            updateChildrenEnforcedTopRecursively(structure);
        };
    });
