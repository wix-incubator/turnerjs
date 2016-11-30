define(['lodash', 'coreUtils'],
    function (_, coreUtils) {
        'use strict';

        function isVerticallyDocked(layout) {
            return layout && layout.docked && (layout.docked.vCenter || layout.docked.bottom || layout.docked.top);
        }

        function isHorizontallyDocked(layout) {
            return layout && layout.docked && (layout.docked.hCenter || layout.docked.left || layout.docked.right);
        }

        function calcAspectRatio(width, height) {
            return parseFloat((height / width).toFixed(5));
        }

        function isAspectRatioOn(layout) {
            return !_.isUndefined(layout.aspectRatio);
        }

        function isDockedToDirection(layout, direction) {
            return Boolean(layout && layout.docked && layout.docked[direction]);
        }

        function getDockToDirection(layout, direction) {
            return layout && layout.docked && layout.docked[direction];
        }

        function getVerticallyCenteredDockData(layout) {
            return getDockToDirection(layout, 'vCenter');
        }

        function getTopDockData(layout) {
            return getDockToDirection(layout, 'top');
        }

        function getBottomDockData(layout) {
            return getDockToDirection(layout, 'bottom');
        }

        function isVerticallyStretched(layout) {
            return Boolean(layout && layout.docked && (layout.docked.bottom && layout.docked.top));
        }

        function isVerticallyCentered(layout) {
            return _.has(layout, ['docked', 'vCenter']);
        }

        function isVerticallyStretchedToScreen(layout) {
            return _.has(layout, ['docked', 'bottom', 'vh']) && _.has(layout, ['docked', 'top', 'vh']);
        }

        function isHorizontallyStretchedToScreen(layout) {
            return _.has(layout, ['docked', 'left', 'vw']) && _.has(layout, ['docked', 'right', 'vw']);
        }

        function isDockToScreen(layout){
            return isVerticallyStretchedToScreen(layout) || isHorizontallyStretchedToScreen(layout);
        }

        function isHorizontallyStretched(layout) {
            return layout && layout.docked && (layout.docked.left && layout.docked.right);
        }

        function enforceRange(value, min, max) {
            return value && Math.max(min, Math.min(max, value));
        }

        function getEmptyStyleObject(){
            return {
                top: '',
                bottom: '',
                left: '',
                right: '',
                width: '',
                height: '',
                position: ''
            };
        }

        function getStyle(layout, pageBottomMargin, screenWidth, siteWidth, siteX, screenHeight){
            var styleObject = getEmptyStyleObject();
            styleObject.position = (layout && layout.position) || 'absolute';

            if (layout) {

                if (!isHorizontallyDocked(layout)) {
                    styleObject.left = layout.x;
                }

                if (!isVerticallyDocked(layout)) {
                    styleObject.top = layout.y;
                }

                if (!isVerticallyStretched(layout)){
                    styleObject.height = enforceRange(layout.height, coreUtils.siteConstants.COMP_SIZE.MIN_HEIGHT, coreUtils.siteConstants.COMP_SIZE.MAX_HEIGHT);
                }

                if (!isHorizontallyStretched(layout)){
                    styleObject.width = enforceRange(layout.width, coreUtils.siteConstants.COMP_SIZE.MIN_WIDTH, coreUtils.siteConstants.COMP_SIZE.MAX_WIDTH);
                }

                if (layout.fixedPosition) {
                    styleObject.position = 'fixed';
                }

                if (layout.rotationInDegrees) {
                    var prefixedTransform = coreUtils.style.getPrefixedTransform();
                    styleObject[prefixedTransform] = "rotate(" + layout.rotationInDegrees + "deg) translateZ(0)";
                }

                if (layout.docked) {
                    coreUtils.dockUtils.applyDockedStyle(layout, styleObject, pageBottomMargin, screenWidth, siteWidth, siteX, screenHeight);
                }
            }

            return styleObject;
        }

        function getBoundingLayoutForComponent(measureMap, nodesMap, component) {
            var compNode = nodesMap[component.id];

            return coreUtils.boundingLayout.getBoundingLayout({
                x: compNode.offsetLeft,
                y: compNode.offsetTop,
                width: numberOr(measureMap.width[component.id], compNode.offsetWidth),
                height: numberOr(measureMap.height[component.id], compNode.offsetHeight),
                rotationInDegrees: component.layout.rotationInDegrees
            });
        }

        function getComponentsBottomY(measureMap, nodesMap, components, shouldRunRecursively, parentTop) {
            return _(components)
                .reject({layout: {fixedPosition: true}})
                .filter(function (component) {
                    return !!nodesMap[component.id];
                })
                .reduce(function (maxBottom, component) {
                    var layout = getBoundingLayoutForComponent(measureMap, nodesMap, component);
                    var compTop = parentTop + layout.y;
                    var compBottom = compTop + layout.height;
                    var childrenBottom = shouldRunRecursively ? getComponentsBottomY(
                        measureMap, nodesMap, component.components, shouldRunRecursively, compTop
                    ) : compBottom;

                    return Math.max(maxBottom, compBottom, childrenBottom);
                }, 0);
        }

        function getPageComponents(siteData, serializedComp) {
            return siteData.isMobileView() ?
                serializedComp.structure.mobileComponents :
                serializedComp.structure.components;
        }

        function getPageBottomChildEnd(measureMap, nodesMap, siteData, serializedComp) {
            return getComponentsBottomY(measureMap, nodesMap, getPageComponents(siteData, serializedComp), false, 0);
        }

        function numberOr(n, elseValue) {
            return _.isNumber(n) ? n : elseValue;
        }

        function getRootWidth(measureMap, rootId, siteWidth) {
            return numberOr(measureMap.width['ROOT_' + rootId], siteWidth);
        }

        function getRootLeft(measureMap, rootId, siteX) {
            return numberOr(measureMap.left['ROOT_' + rootId], -siteX);
        }

        function stretchInCenteredContainer(containerWidth, componentWidth) {
            var negOffset = containerWidth - componentWidth;

            return {
                left: Math.floor(Math.min(0, 0.5 * negOffset)),
                width: Math.floor(Math.max(containerWidth, componentWidth))
            };
        }

        return {
            isDockToScreen: isDockToScreen,
            isVerticallyDocked: isVerticallyDocked,
            isDockedToDirection: isDockedToDirection,
            getDockToDirection: getDockToDirection,
            getTopDockData: getTopDockData,
            getBottomDockData: getBottomDockData,
            getVerticallyCenteredDockData: getVerticallyCenteredDockData,
            isVerticallyStretched: isVerticallyStretched,
            isVerticallyCentered: isVerticallyCentered,
            isVerticallyStretchedToScreen: isVerticallyStretchedToScreen,
            isHorizontallyDocked: isHorizontallyDocked,
            isHorizontallyStretched: isHorizontallyStretched,
            isAspectRatioOn: isAspectRatioOn,
            calcAspectRatio: calcAspectRatio,
            getStyle: getStyle,
            getRootLeft: getRootLeft,
            getRootWidth: getRootWidth,
            getPageBottomChildEnd: getPageBottomChildEnd,
            stretchInCenteredContainer: stretchInCenteredContainer
        };
    });
