define(['lodash',
        'documentServices/component/component',
        'documentServices/structure/structure',
        'documentServices/componentsMetaData/componentsMetaData',
        'documentServices/smartBoxes/multiComponentsUtilsValidations',
        'documentServices/constants/constants'],
    function (_,
              component,
              structure,
              componentsMetaData,
              multiComponentsUtilsValidations,
              constants) {

        'use strict';

        function getSnugLayoutFromLayoutsArray(layouts) {
            var mostLeft, mostRight, mostTop, mostBottom,
                mostTopBounding, mostRightBounding, mostLeftBounding, mostBottomBounding;
            mostLeft = mostTop = mostTopBounding = mostLeftBounding = Number.MAX_VALUE;
            mostRight = mostBottom = mostBottomBounding = mostRightBounding = -Number.MAX_VALUE;

            _.forEach(layouts, function (compLayout) {
                mostLeft = Math.min(mostLeft, compLayout.x);
                mostRight = Math.max(mostRight, compLayout.x + compLayout.width);
                mostTop = Math.min(mostTop, compLayout.y);
                mostBottom = Math.max(mostBottom, compLayout.y + compLayout.height);

                mostLeftBounding = Math.min(mostLeftBounding, compLayout.bounding.x);
                mostRightBounding = Math.max(mostRightBounding, compLayout.bounding.x + compLayout.bounding.width);
                mostTopBounding = Math.min(mostTopBounding, compLayout.bounding.y);
                mostBottomBounding = Math.max(mostBottomBounding, compLayout.bounding.y + compLayout.bounding.height);
            });

            return {
                bounding: {
                    x: mostLeftBounding,
                    y: mostTopBounding,
                    width: mostRightBounding - mostLeftBounding,
                    height: mostBottomBounding - mostTopBounding
                },
                x: mostLeftBounding,
                y: mostTopBounding,
                width: mostRightBounding - mostLeftBounding,
                height: mostBottomBounding - mostTopBounding,
                rotationInDegrees: 0
            };
        }

        function getSnugFromPositionAndSizeArray(compsPositionAndSize) {
            var mostLeft, mostRight, mostTop, mostBottom;

            mostLeft = mostTop = Number.MAX_VALUE;
            mostRight = mostBottom = -Number.MAX_VALUE;

            _.forEach(compsPositionAndSize, function (compPositionAndSize) {
                mostLeft = Math.min(mostLeft, compPositionAndSize.x);
                mostRight = Math.max(mostRight, compPositionAndSize.x + compPositionAndSize.width);
                mostTop = Math.min(mostTop, compPositionAndSize.y);
                mostBottom = Math.max(mostBottom, compPositionAndSize.y + compPositionAndSize.height);
            });

            return {
                x: mostLeft,
                y: mostTop,
                width: mostRight - mostLeft,
                height: mostBottom - mostTop
            };
        }

        function getSnugPositionAndSize(ps, compPointers) {
            if (!compPointers || compPointers.length === 0) {
                return undefined;
            }

            var compsPositionAndSize = _.map(compPointers, function (compPointer) {
                return structure.getPositionAndSize(ps, compPointer);
            });
            return getSnugFromPositionAndSizeArray(compsPositionAndSize);
        }

        function getSnugLayout(ps, compPointers) {
            if (!compPointers || compPointers.length === 0) {
                return undefined;
            }

            var layouts = _.map(compPointers, function (compPointer) {
                return component.layout.get(ps, compPointer);
            });

            return getSnugLayoutFromLayoutsArray(layouts);
        }

        function getSnugLayoutRelativeToScreen(ps, compPointers) {
            if (!compPointers || compPointers.length === 0) {
                return undefined;
            }

            var layouts = _.map(compPointers, function (compPointer) {
                return structure.getCompLayoutRelativeToScreen(ps, compPointer);
            });

            return getSnugLayoutFromLayoutsArray(layouts);
        }

        function getSnugLayoutRelativeToScreenConsideringScroll(ps, compPointers, ignorePlugins) {
            if (!compPointers || compPointers.length === 0) {
                return undefined;
            }

            var layouts = _.map(compPointers, function (compPointer) {
                return structure.getCompLayoutRelativeToScreenConsideringScroll(ps, compPointer, ignorePlugins);
            });

            return getSnugLayoutFromLayoutsArray(layouts);
        }

        function getSnugLayoutRelativeToStructure(ps, compPointers) {
            if (!compPointers || compPointers.length === 0) {
                return undefined;
            }

            var layouts = _.map(compPointers, function (compPointer) {
                return structure.getCompLayoutRelativeToStructure(ps, compPointer);
            });

            return getSnugLayoutFromLayoutsArray(layouts);
        }

        function isMinBy(axis, ps, compPointer, compPointerArray) {
            if (!compPointer) {
                return false;
            }

            var compCoord = component.layout.get(ps, compPointer).bounding[axis];
            if (_.isUndefined(compCoord)) {
                return false;
            }

            compPointerArray = compPointerArray || component.getSiblings(ps, compPointer);

            return _.every(compPointerArray, function (otherCompPointer) {
                if (compPointer.id === otherCompPointer.id) {
                    return true;
                }
                var otherCoord = component.layout.get(ps, otherCompPointer).bounding[axis];
                if (_.isUndefined(otherCoord)) {
                    return true;
                }
                return compCoord <= otherCoord;
            });
        }
        var isTopMost = _.partial(isMinBy, 'y');
        var isLeftMost = _.partial(isMinBy, 'x');

        function getFullWidthLayoutRelativeToScreenForAlignmentCalculations(ps, compPointer){
            var compLayout = structure.getCompLayoutRelativeToScreen(ps, compPointer);
            //we use pages container so that we have a valid x relative to the screen.
            //we can also use getSiteWidth and getSiteX, but getSiteX returns a negative number, so we would need to use Math.abs(siteX) which isn't necessarily better..
            var relativeToScreenSiteLayout = structure.getCompLayoutRelativeToScreen(ps, ps.pointers.components.getPagesContainer(constants.VIEW_MODES.DESKTOP));
            return {
                x: relativeToScreenSiteLayout.x,
                width: relativeToScreenSiteLayout.width,
                y: compLayout.y,
                height: compLayout.height,
                bounding: {
                    x: relativeToScreenSiteLayout.x,
                    width: relativeToScreenSiteLayout.width,
                    y: compLayout.y,
                    height: compLayout.height
                }
            };
        }

        function getSnugLayoutRelativeToScreenForAlignmentCalculations(ps, compPointers){
            if (!compPointers || compPointers.length === 0) {
                return undefined;
            }

            var layouts = _.map(compPointers, function (compPointer) {
                if (structure.isHorizontallyStretchedToScreen(ps, compPointer)) {
                    return getFullWidthLayoutRelativeToScreenForAlignmentCalculations(ps, compPointer);
                }
                return structure.getCompLayoutRelativeToScreen(ps, compPointer);
            });

            return getSnugLayoutFromLayoutsArray(layouts);
        }

        function align(ps, compPointerArray, alignment) {
            if (multiComponentsUtilsValidations.canAlign(ps, compPointerArray, alignment)) {
                var compsToAlign = multiComponentsUtilsValidations.getFilteredComponentsToApplyAction(ps, compPointerArray, alignment);
                var snugLayoutRelativeToScreen = getSnugLayoutRelativeToScreenForAlignmentCalculations(ps, compPointerArray);
                alignComponentsToOuterLayout(ps, compsToAlign, snugLayoutRelativeToScreen, alignment, false);
            }
        }

        function alignComponentsToOuterLayout(ps, compPointerArray, outerLayout, alignment, relativeToOuterLayout) {
            _.forEach(compPointerArray, function (compPointer) {
                var compLayoutRelativeToScreen = structure.getCompLayoutRelativeToScreen(ps, compPointer, true);
                var compContainer = component.getContainer(ps, compPointer);
                var compContainerLayoutRelativeToScreen = structure.getCompLayoutRelativeToScreen(ps, compContainer, true);

                var updateProps = {};
                switch (alignment) {
                    case constants.COMP_ALIGNMENT_OPTIONS.LEFT:
                        updateProps.x = 0;
                        break;
                    case constants.COMP_ALIGNMENT_OPTIONS.RIGHT:
                        updateProps.x = outerLayout.width - compLayoutRelativeToScreen.bounding.width;
                        break;
                    case constants.COMP_ALIGNMENT_OPTIONS.TOP:
                        updateProps.y = 0;
                        break;
                    case constants.COMP_ALIGNMENT_OPTIONS.BOTTOM:
                        updateProps.y = outerLayout.height - compLayoutRelativeToScreen.bounding.height;
                        break;
                    case constants.COMP_ALIGNMENT_OPTIONS.CENTER:
                        updateProps.x = 0.5 * (outerLayout.width - compLayoutRelativeToScreen.bounding.width);
                        break;
                    case constants.COMP_ALIGNMENT_OPTIONS.MIDDLE:
                        updateProps.y = 0.5 * (outerLayout.height - compLayoutRelativeToScreen.bounding.height);
                        break;
                    default:
                        break;
                }

                if (!relativeToOuterLayout) {
                    if (updateProps.x !== undefined) {
                        updateProps.x += outerLayout.x - compContainerLayoutRelativeToScreen.x;
                    }
                    if (updateProps.y !== undefined) {
                        updateProps.y += outerLayout.y - compContainerLayoutRelativeToScreen.y;
                    }
                }

                var props = _.keys(updateProps);
                _.forEach(props, function (prop) {
                    updateProps[prop] = getLayoutValueFromBoundingValue(compLayoutRelativeToScreen, prop, updateProps[prop]);
                });

                structure.updateCompLayout(ps, compPointer, updateProps);
            });
        }


        function matchSize(ps, compPointerArray, matchSizeValue) {
            if (multiComponentsUtilsValidations.canMatchSize(ps, compPointerArray, matchSizeValue)) {
                var compsToMatch = multiComponentsUtilsValidations.getFilteredComponentsToApplyAction(ps, compPointerArray, matchSizeValue);
                var compLayoutsArr = _.map(compsToMatch, function (compPointer) {
                    return component.layout.get(ps, compPointer);
                });
                var averageWidth = _.sum(compLayoutsArr, 'width') / compLayoutsArr.length;
                var averageHeight = _.sum(compLayoutsArr, 'height') / compLayoutsArr.length;

                if (averageWidth && (matchSizeValue === 'width' || matchSizeValue === 'heightAndWidth')) {
                    _.forEach(compsToMatch, matchComponentSize.bind(this, ps, 'width', averageWidth));
                }

                if (averageHeight && (matchSizeValue === 'height' || matchSizeValue === 'heightAndWidth')) {
                    _.forEach(compsToMatch, matchComponentSize.bind(this, ps, 'height', averageHeight));
                }
            }
        }

        function matchComponentSize(ps, dimension, average, compPointer) {
            var newLayout = {};
            newLayout[dimension] = average;
            structure.updateCompLayout(ps, compPointer, newLayout);
        }

        function getLayoutValueFromBoundingValue(compLayout, key, boundingValue) {
            return compLayout[key] + boundingValue - compLayout.bounding[key];
        }

        function distribute(ps, compPointerArray, distribution) {
            var compLayoutsRelativeToScreen, snugLayoutRelativeToScreen;
            if (multiComponentsUtilsValidations.canDistribute(ps, compPointerArray, distribution)) {
                var compsToApplyDistribute = multiComponentsUtilsValidations.getFilteredComponentsToApplyAction(ps, compPointerArray, distribution);
                var spaceBetweenComps, sortedCompLayoutRelativeToScreenMap;
                var compLayoutRelativeToScreenMap = _.map(compsToApplyDistribute, function (compPointer) {
                    var compContainer = component.getContainer(ps, compPointer);
                    return {
                        compPointer: compPointer,
                        layoutRelativeToScreen: structure.getCompLayoutRelativeToScreen(ps, compPointer, true),
                        compContainerLayoutRelativeToScreen: structure.getCompLayoutRelativeToScreen(ps, compContainer, true)
                    };
                });

                if (distribution === 'horizontal' || distribution === 'verticalAndHorizontal') {
                    compLayoutsRelativeToScreen = _.map(compLayoutRelativeToScreenMap, 'layoutRelativeToScreen');
                    snugLayoutRelativeToScreen = getSnugLayoutFromLayoutsArray(compLayoutsRelativeToScreen);
                    var totalCompsWidth = _.sum(compLayoutsRelativeToScreen, 'bounding.width');
                    spaceBetweenComps = (snugLayoutRelativeToScreen.width - totalCompsWidth) / (compLayoutsRelativeToScreen.length - 1);
                    var nextXRelativeToSnug = 0;
                    sortedCompLayoutRelativeToScreenMap = _.sortBy(compLayoutRelativeToScreenMap, 'layoutRelativeToScreen.bounding.x');

                    _.forEach(sortedCompLayoutRelativeToScreenMap, function (compObject) {
                        var newBoundingX = nextXRelativeToSnug + (snugLayoutRelativeToScreen.x - compObject.compContainerLayoutRelativeToScreen.x);
                        nextXRelativeToSnug += compObject.layoutRelativeToScreen.bounding.width + spaceBetweenComps;
                        var newLayoutX = getLayoutValueFromBoundingValue(compObject.layoutRelativeToScreen, 'x', newBoundingX);
                        structure.updateCompLayout(ps, compObject.compPointer, {x: newLayoutX});
                    });
                }

                if (distribution === 'vertical' || distribution === 'verticalAndHorizontal') {
                    compLayoutsRelativeToScreen = _.map(compLayoutRelativeToScreenMap, 'layoutRelativeToScreen');
                    snugLayoutRelativeToScreen = getSnugLayoutFromLayoutsArray(compLayoutsRelativeToScreen);
                    var totalCompsHeight = _.sum(compLayoutRelativeToScreenMap, 'layoutRelativeToScreen.bounding.height');
                    spaceBetweenComps = (snugLayoutRelativeToScreen.height - totalCompsHeight) / (compLayoutsRelativeToScreen.length - 1);
                    var nextYRelativeToSnug = 0;
                    sortedCompLayoutRelativeToScreenMap = _.sortBy(compLayoutRelativeToScreenMap, 'layoutRelativeToScreen.bounding.y');

                    _.forEach(sortedCompLayoutRelativeToScreenMap, function (compObject) {
                        var newBoundingY = nextYRelativeToSnug + (snugLayoutRelativeToScreen.y - compObject.compContainerLayoutRelativeToScreen.y);
                        nextYRelativeToSnug += compObject.layoutRelativeToScreen.bounding.height + spaceBetweenComps;
                        var newLayoutY = getLayoutValueFromBoundingValue(compObject.layoutRelativeToScreen, 'y', newBoundingY);
                        structure.updateCompLayout(ps, compObject.compPointer, {y: newLayoutY});
                    });
                }
            }
        }

        function sortCompsByZOrder(ps, compPointerArray, isDescending) {
            if (compPointerArray.length === 0) {
                return [];
            }

            var container = component.getContainer(ps, compPointerArray[0]);
            var allChildrenSortedAsc = component.getChildren(ps, container);

            var collectComponentsByZOrder = function (sortedComps, currentComp) {
                if (_.some(compPointerArray, currentComp)) {
                    sortedComps.push(currentComp);
                }

                return sortedComps;
            };

            if (isDescending) {
                return _.reduceRight(allChildrenSortedAsc, collectComponentsByZOrder, []);
            }

            return _.reduce(allChildrenSortedAsc, collectComponentsByZOrder, []);
        }

        return {
            getSnugPositionAndSize: getSnugPositionAndSize,
            getSnugLayout: getSnugLayout,
            getSnugLayoutRelativeToStructure: getSnugLayoutRelativeToStructure,
            getSnugLayoutRelativeToScreen: getSnugLayoutRelativeToScreen,
            getSnugLayoutRelativeToScreenConsideringScroll: getSnugLayoutRelativeToScreenConsideringScroll,
            isTopMost: isTopMost,
            isLeftMost: isLeftMost,
            alignComponentsToOuterLayout: alignComponentsToOuterLayout,
            sortComponentsByZOrder: sortCompsByZOrder,
            distribute: distribute,
            matchSize: matchSize,
            align: align
        };
    });
