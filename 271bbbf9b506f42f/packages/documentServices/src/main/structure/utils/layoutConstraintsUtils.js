define(['lodash',
        'utils',
        'documentServices/component/componentModes',
        'documentServices/componentsMetaData/componentsMetaData',
        'documentServices/structure/structureUtils',
        'documentServices/structure/layoutCalcPlugins/layoutCalcPlugins',
        'documentServices/component/componentStructureInfo'],
    function (_, utils, componentModes, componentsMetaData, structureUtils, layoutCalcPlugins, componentStructureInfo) {
        'use strict';

        var GROUP_COMPONENT_TYPE = 'wysiwyg.viewer.components.Group';

        var AXIS = {
            VERTICAL: 'vertical',
            HORIZONTAL: 'horizontal'
        };

        var DIRECTIONS = {
          TOP: 'top',
          BOTTOM: 'bottom',
          LEFT: 'left',
          RIGHT: 'right'
        };

        function getCompLayoutFromData(ps, compPointer) {
            var layoutPointer = ps.pointers.getInnerPointer(compPointer, 'layout');
            return ps.dal.get(layoutPointer);
        }

        function getCompActualLayout(privateServices, compPointer) {
            var positionAndSize = structureUtils.getPositionAndSize(privateServices, compPointer);
            var compLayout = getCompLayoutFromData(privateServices, compPointer);
            return structureUtils.getBoundingLayout(privateServices, _.merge(positionAndSize, _.pick(compLayout, ['rotationInDegrees'])));
        }

        function getLayoutsMap(privateServices, axis, edge, compPointers) {
            var layoutsMap = {
                dockedToEdge: [],
                nonDockedToEdge: []
            };

            var isStretched = axis === AXIS.VERTICAL ? utils.layout.isVerticallyStretched : utils.layout.isHorizontallyStretched;

            _.forEach(compPointers, function (compPointer) {
                var compLayout = getCompLayoutFromData(privateServices, compPointer);
                var compActualLayout = getCompActualLayout(privateServices, compPointer);

                if (!isStretched(compLayout)){
                    if (utils.layout.isDockedToDirection(compLayout, edge)) {
                        layoutsMap.dockedToEdge.push(compActualLayout);
                    } else {
                        layoutsMap.nonDockedToEdge.push(compActualLayout);
                    }
                }
            });

            return layoutsMap;
        }

        function handleNarrowingFromLeft(privateServices, currentLayout, newLayout, childrenPointers) {
            var layoutsMap = getLayoutsMap(privateServices, AXIS.HORIZONTAL, DIRECTIONS.LEFT, childrenPointers);

            var minPossibleWidthForNonDockedComponents = _.map(layoutsMap.nonDockedToEdge, function (layout) {
                return currentLayout.width - layout.x;
            });

            var minPossibleWidthForDockedComponents = _.map(layoutsMap.dockedToEdge, function (layout) {
                return layout.x + layout.width;
            });

            var minPossibleWidth = _.max(minPossibleWidthForNonDockedComponents.concat(minPossibleWidthForDockedComponents));

            if (minPossibleWidth > currentLayout.width) {
                if (currentLayout.x) {
                    newLayout.x = currentLayout.x;
                }
                newLayout.width = currentLayout.width;
            } else if (newLayout.width < minPossibleWidth) {
                var widthDiff = minPossibleWidth - newLayout.width;
                if (newLayout.x) {
                    newLayout.x -= widthDiff;
                }
                newLayout.width += widthDiff;
            }
        }

        function handleNarrowingFromRight(privateServices, currentLayout, newLayout, childrenPointers) {
            var layoutsMap = getLayoutsMap(privateServices, AXIS.HORIZONTAL, DIRECTIONS.RIGHT, childrenPointers);

            var minPossibleWidthForNonDockedComponents = _.map(layoutsMap.nonDockedToEdge, function (layout) {
                return layout.x + layout.width;
            });

            var minPossibleWidthForDockedComponents = _.map(layoutsMap.dockedToEdge, function (layout) {
                return currentLayout.width - layout.x;
            });

            var minPossibleWidth = _.max(minPossibleWidthForNonDockedComponents.concat(minPossibleWidthForDockedComponents));

            if (minPossibleWidth > currentLayout.width) {
                newLayout.width = currentLayout.width;
            } else if (newLayout.width < minPossibleWidth) {
                var widthDiff = minPossibleWidth - newLayout.width;
                newLayout.width += widthDiff;
            }
        }

        function handleShorteningFromTop(privateServices, currentLayout, newLayout, childrenPointers) {
            var layoutsMap = getLayoutsMap(privateServices, AXIS.VERTICAL, DIRECTIONS.TOP, childrenPointers);

            var minPossibleHeightForNonDockedComponents = _.map(layoutsMap.nonDockedToEdge, function (layout) {
                return currentLayout.height - layout.y;
            });

            var minPossibleHeightForDockedComponents = _.map(layoutsMap.dockedToEdge, function (layout) {
                return layout.y + layout.height;
            });

            var minPossibleHeight = _.max(minPossibleHeightForNonDockedComponents.concat(minPossibleHeightForDockedComponents));

            if (minPossibleHeight > currentLayout.height) {
                if (currentLayout.y) {
                    newLayout.y = currentLayout.y;
                }
                newLayout.height = currentLayout.height;
            } else if (newLayout.height < minPossibleHeight) {
                var heightDiff = minPossibleHeight - newLayout.height;
                if (newLayout.y) {
                    newLayout.y -= heightDiff;
                }
                newLayout.height += heightDiff;
            }
        }

        function handleShorteningFromBottom(privateServices, currentLayout, newLayout, childrenPointers) {
            var layoutsMap = getLayoutsMap(privateServices, AXIS.VERTICAL, DIRECTIONS.BOTTOM, childrenPointers);

            var minPossibleHeightForNonDockedComponents = _.map(layoutsMap.nonDockedToEdge, function (layout) {
                return layout.y + layout.height;
            });

            var minPossibleHeightForDockedComponents = _.map(layoutsMap.dockedToEdge, function (layout) {
                return currentLayout.height - layout.y;
            });

            var minPossibleHeight = _.max(minPossibleHeightForNonDockedComponents.concat(minPossibleHeightForDockedComponents));

            if (minPossibleHeight > currentLayout.height) {
                newLayout.height = currentLayout.height;
            } else if (newLayout.height < minPossibleHeight) {
                var heightDiff = minPossibleHeight - newLayout.height;
                newLayout.height += heightDiff;
            }
        }

        function constrainByChildrenLayout(ps, compPointer, newLayout, dontConstrainByWidth, dontConstrainByHeight) {
            var childrenPointers = ps.pointers.components.getChildren(compPointer);

            if (_.isEmpty(childrenPointers)) {
                return;
            }

            var currLayout = getCompActualLayout(ps, compPointer);
            var nextLayout = _.assign({}, currLayout, newLayout);

            var isEnlargingOrMoving = nextLayout.width >= currLayout.width && nextLayout.height >= currLayout.height;
            if (isEnlargingOrMoving) {
                return;
            }

            var isNarrowing = nextLayout.width < currLayout.width;
            var isNarrowingFromLeft = isNarrowing && (nextLayout.docked && newLayout.docked.right || nextLayout.x > currLayout.x);

            if (isNarrowing && !dontConstrainByWidth) {
                if (isNarrowingFromLeft) {
                    handleNarrowingFromLeft(ps, currLayout, newLayout, childrenPointers);
                } else {
                    handleNarrowingFromRight(ps, currLayout, newLayout, childrenPointers);
                }
            }

            var isShortening = nextLayout.height < currLayout.height;
            var isShorteningFromTop = isShortening && (nextLayout.docked && newLayout.docked.bottom || nextLayout.y > currLayout.y);

            if (isShortening && !dontConstrainByHeight) {
                if (isShorteningFromTop) {
                    handleShorteningFromTop(ps, currLayout, newLayout, childrenPointers);
                } else {
                    handleShorteningFromBottom(ps, currLayout, newLayout, childrenPointers);
                }
            }
        }


        //<editor-fold desc="Proportional Resize">

        function getLayoutAspectRatio(/**layoutObject*/compLayout) {
            return compLayout.width / compLayout.height;
        }

        function isGroup(ps, compPointer) {
            var componentType = componentsMetaData.getComponentType(ps, compPointer);
            return componentType === GROUP_COMPONENT_TYPE;
        }

        function getComponentMinLayout(ps, compPointer) {
            var limits = componentsMetaData.public.getLayoutLimits(ps, compPointer);
            var componentLayout = structureUtils.getComponentLayout(ps, compPointer);
            var horizontallyResizable = componentsMetaData.public.isHorizontallyResizable(ps, compPointer);
            var verticallyResizable = componentsMetaData.public.isVerticallyResizable(ps, compPointer);
            var proportionallyResizable = componentsMetaData.public.isProportionallyResizable(ps, compPointer);
            var minLayout = _.pick(componentLayout, ['width', 'height']);

            // TODO: naora 9/10/15 12:18 PM Remove group exception when removing proportional resize experiment

            if (proportionallyResizable || horizontallyResizable || isGroup(ps, compPointer)) {
                minLayout.width = limits.minWidth;
            }

            if (proportionallyResizable || verticallyResizable || isGroup(ps, compPointer)) {
                minLayout.height = limits.minHeight;
            }

            return minLayout;
        }

        function calcMinLayoutAndPreserveAspectRatio(compLayout, minLayoutConstrain) {
            var aspectRatio = getLayoutAspectRatio(compLayout);
            var heightForMinWidth = minLayoutConstrain.width / aspectRatio;
            var widthForMinHeight = minLayoutConstrain.height * aspectRatio;

            if (heightForMinWidth > minLayoutConstrain.height) {
                minLayoutConstrain.height = heightForMinWidth;
            } else {
                minLayoutConstrain.width = widthForMinHeight;
            }

            return minLayoutConstrain;
        }

        function addLayoutPositionConstraintAccordingToDirection(ps, minLayoutConstraint, compPointer, direction) {
            var compLayout = structureUtils.getComponentLayout(ps, compPointer);

            minLayoutConstraint = calcMinLayoutAndPreserveAspectRatio(compLayout, minLayoutConstraint);

            var heightDiff = compLayout.height - minLayoutConstraint.height;
            var widthDiff = compLayout.width - minLayoutConstraint.width;

            if (direction.y === -1) {
                minLayoutConstraint.y = compLayout.y + heightDiff;
            }

            if (direction.x === -1) {
                minLayoutConstraint.x = compLayout.x + widthDiff;
            }

            if (direction.x !== 0 && direction.y === 0) {
                minLayoutConstraint.y = compLayout.y + heightDiff / 2;
            }

            if (direction.y !== 0 && direction.x === 0) {
                minLayoutConstraint.x = compLayout.x + widthDiff / 2;
            }
            return minLayoutConstraint;
        }

        function isLayoutExceedsContainerBoundaries(/**layoutObject*/layout, /**layoutObject*/containerLayout) {
            return layout.x < 0 || layout.x + layout.width > containerLayout.width ||
                    layout.y < 0 || layout.y + layout.height > containerLayout.height;
        }

        function maintainCompAspectRatio (ps, compPointer, layout) {
            var aspectRatio = componentsMetaData.public.getLayoutLimits(ps, compPointer).aspectRatio;
            var width = layout.height * aspectRatio;
            layout.width = width;
        }

        function updateMinLayoutDimensionConstraintByChildren(ps, proportionStructure, minLayoutConstraint) {
            var containerLayout = structureUtils.getComponentLayout(ps, proportionStructure.component);

            _.forEach(proportionStructure.children, function getChildMinLayout(/**proportionStructure*/childProportionStructure) {
                var childMinLayout = structureUtils.getBoundingLayout(ps, childProportionStructure.minLayout);
                var childLayout = structureUtils.getComponentLayout(ps, childProportionStructure.component);
                childLayout = structureUtils.getBoundingLayout(ps, childLayout);


                if (isLayoutExceedsContainerBoundaries(childLayout, containerLayout)) {
                    minLayoutConstraint.width = containerLayout.width;
                    minLayoutConstraint.height = containerLayout.height;
                    return false;
                }
                // TODO: naora 9/8/15 2:11 PM Find a cleaner way to implement this logic
                var minWidthCandidate = childMinLayout.width / (1 - childProportionStructure.proportions.x);
                var minHeightCandidate = childMinLayout.height / (1 - childProportionStructure.proportions.y);

                minLayoutConstraint.width = _.max([minWidthCandidate, minLayoutConstraint.width]);
                minLayoutConstraint.height = _.max([minHeightCandidate, minLayoutConstraint.height]);
            });
        }

        // TODO: naora 9/8/15 1:27 PM Find a way to remove editor logic from DS (such as considering resize direction)
        function addCompMinLayout(ps, /** proportionStructure */ proportionStructure, resizeDirection) {

            _.forEach(proportionStructure.children, function (childCompStructure) {
                addCompMinLayout(ps, childCompStructure);
            });

            var compPointer = proportionStructure.component;
            var minLayoutConstraint = getComponentMinLayout(ps, compPointer);

            updateMinLayoutDimensionConstraintByChildren(ps, proportionStructure, minLayoutConstraint);

            var isRootComp = !!resizeDirection;
            if (isRootComp) {
                minLayoutConstraint = addLayoutPositionConstraintAccordingToDirection(ps, minLayoutConstraint, compPointer, resizeDirection);
            }

            minLayoutConstraint = _.pick(minLayoutConstraint, ['x', 'y', 'width', 'height', 'rotationInDegrees']);
            //proportionStructure.minLayout = _.mapValues(minLayoutConstraint, Math.round);
            proportionStructure.minLayout = minLayoutConstraint;
        }

        function isLayoutExceedMinLayout(proportionStructure, newLayout) {
            return proportionStructure.minLayout.width > newLayout.width || proportionStructure.minLayout.height > newLayout.height;
        }

        function constrainProportionalResize(ps, /**proportionStructure*/ proportionStructure, /**layoutObject*/newLayout, isRoot) {
            if (isRoot) {
                if (componentsMetaData.public.resizeOnlyProportionally(ps, proportionStructure.component)) {
                    maintainCompAspectRatio(ps, proportionStructure.component, newLayout);
                }

                if (isLayoutExceedMinLayout(proportionStructure, newLayout)) {
                    _.assign(newLayout, proportionStructure.minLayout);
                }
            } else {
                newLayout.width = _.max([proportionStructure.minLayout.width, newLayout.width]);
                newLayout.height = _.max([proportionStructure.minLayout.height, newLayout.height]);
            }
        }

        //</editor-fold>

        function constrainByDimensionsLimits(ps, compPointer, newLayout) {
            var oldLayout = getCompLayoutFromData(ps, compPointer);
            var layoutLimits = componentsMetaData.public.getLayoutLimits(ps, compPointer);

            if (!_.isUndefined(newLayout.width) && newLayout.width !== oldLayout.width) {
                var widthWithinLimits = structureUtils.ensureWithinLimits(newLayout.width, layoutLimits.minWidth, layoutLimits.maxWidth);
                    if (!_.isUndefined(newLayout.x) && newLayout.x !== oldLayout.x) {
                        newLayout.x -= (widthWithinLimits - newLayout.width);
                    }

                newLayout.width = widthWithinLimits;
            }

            if (!_.isUndefined(newLayout.height) && newLayout.height !== oldLayout.height) {
                var heightWithinLimits = structureUtils.ensureWithinLimits(newLayout.height, layoutLimits.minHeight, layoutLimits.maxHeight);
                    if (!_.isUndefined(newLayout.y) && newLayout.y !== oldLayout.y) {
                        newLayout.y -= (heightWithinLimits - newLayout.height);
                    }

                newLayout.height = heightWithinLimits;
            }
        }

        function constrainBySpecificType(ps, compPointer, newLayout){
            var compType = componentStructureInfo.getType(ps, compPointer);
            var fixLayout = layoutCalcPlugins[compType];
            if (!fixLayout){
                return newLayout;
            }
            var pluginLayout = fixLayout(ps, compPointer, newLayout);
            _.assign(newLayout, pluginLayout);
        }

        function constrainByDockingLimits(newLayout) {
            if (utils.dockUtils.isHorizontalDockToScreen(newLayout)){
                _.forEach(['left', 'right'], function(size){
                    var unitsData = newLayout.docked[size];
                    if (_.has(unitsData, 'px')){
                        unitsData.px = Math.max(unitsData.px, 0);
                    }


                    unitsData.vw = Math.max(unitsData.vw, 0);
                });
            }
        }

        return {
            addCompMinLayout: addCompMinLayout,
            constrainByChildrenLayout: constrainByChildrenLayout,
            constrainByDimensionsLimits: constrainByDimensionsLimits,
            constrainByDockingLimits: constrainByDockingLimits,
            constrainProportionalResize: constrainProportionalResize,
            constrainBySpecificType: constrainBySpecificType
        };
    });
