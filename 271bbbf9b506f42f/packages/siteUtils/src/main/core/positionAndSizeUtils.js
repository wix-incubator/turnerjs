define(['lodash', 'coreUtils', 'siteUtils/core/layoutUtils'],
    function (_, coreUtils, layoutUtils) {
        'use strict';

        function getPositionAndSizeAPI(shouldRoundDock){

            function getParentWidth(layout, parentDimension, clientSize, siteWidth) {
                if (layout.fixedPosition) {
                    return clientSize.width;
                }
                if (coreUtils.dockUtils.isHorizontalDockToScreen(layout)){
                    return Math.max(clientSize.width, siteWidth);
                }
                return parentDimension.width;
            }

            function getParentHeight(layout, parentDimension, clientSize) {
                if (layout.fixedPosition || coreUtils.dockUtils.isVerticallyDockToScreen(layout)) {
                    return clientSize.height;
                }

                return parentDimension.height;
            }

            function getHorizontalDockInPixels(horizontalDock, parentWidth, clientWidth) {
                var percentVal = (horizontalDock && horizontalDock.pct && (horizontalDock.pct / 100) * parentWidth) || 0;
                var pixelVal = horizontalDock && horizontalDock.px || 0;
                var viewportWidthVal = (horizontalDock && horizontalDock.vw && (horizontalDock.vw / 100) * clientWidth) || 0;

                var horizontalDockInPixels = percentVal + pixelVal + viewportWidthVal;

                return shouldRoundDock ? Math.ceil(horizontalDockInPixels) : horizontalDockInPixels;
            }

            function getVerticalDockInPixels(verticalDock, parentHeight, clientHeight) {
                var percentVal = (verticalDock.pct && (verticalDock.pct / 100) * parentHeight) || 0;
                var pixelVal = verticalDock.px || 0;
                var viewportHeightVal = (verticalDock.vh && (verticalDock.vh / 100) * clientHeight) || 0;

                var verticalDockInPixels = percentVal + pixelVal + viewportHeightVal;

                return shouldRoundDock ? Math.ceil(verticalDockInPixels) : verticalDockInPixels;
            }

            function getWidthInPixels(layout, parentDimension, clientSize, siteWidth) {
                if (layoutUtils.isHorizontallyStretched(layout)) {
                    var parentWidth = getParentWidth(layout, parentDimension, clientSize, siteWidth);
                    var docked = layout.docked;
                    var leftDock = getHorizontalDockInPixels(docked.left, parentWidth, clientSize.width);
                    var rightDock = getHorizontalDockInPixels(docked.right, parentWidth, clientSize.width);

                    return parentWidth - (leftDock + rightDock);
                }

                return layout.width;
            }

            function getHeightInPixels(layout, parentDimension, clientSize, width) {

                if (layoutUtils.isAspectRatioOn(layout)) {
                    width = width || getWidthInPixels(layout, parentDimension, clientSize);
                    return width * layout.aspectRatio;
                }

                if (layoutUtils.isVerticallyStretched(layout)) {
                    var parentHeight = getParentHeight(layout, parentDimension, clientSize);
                    var docked = layout.docked;
                    var topDock = getVerticalDockInPixels(docked.top, parentHeight, clientSize.height);
                    var bottomDock = getVerticalDockInPixels(docked.bottom, parentHeight, clientSize.height);
                    return parentHeight - (topDock + bottomDock);

                }

                return layout.height;
            }

            function getSiteX(clientWidth, siteWidth) {
                return Math.max((clientWidth - siteWidth) / 2, 0);
            }

            function getXInPixels(layout, parentDimension, clientSize, compWidth, siteWidth, rootLeft) {
                var docked = layout.docked;
                if (docked) {
                    var parentWidth = getParentWidth(layout, parentDimension, clientSize, siteWidth);
                    if (docked.left) {
                        var leftRelativeToParent = getHorizontalDockInPixels(docked.left, parentWidth, clientSize.width);

                        if (coreUtils.dockUtils.isHorizontalDockToScreen(layout)){
                            var siteX = _.isUndefined(rootLeft) ? getSiteX(clientSize.width, siteWidth) : rootLeft;
                            leftRelativeToParent -= siteX;
                        }

                        return leftRelativeToParent;
                    }

                    compWidth = compWidth || getWidthInPixels(layout, parentDimension, clientSize);
                    if (docked.right) {
                        var rightDock = getHorizontalDockInPixels(docked.right, parentWidth, clientSize.width);
                        return parentWidth - (compWidth + rightDock);
                    }

                    if (docked.hCenter) {
                        var centerDock = getHorizontalDockInPixels(docked.hCenter, parentWidth, clientSize.width);
                        return (parentWidth - compWidth) / 2 + centerDock;
                    }

                }

                return layout.x;
            }

            function getYInPixels(layout, parentDimension, clientSize, compHeight) {
                var docked = layout.docked;
                if (docked) {
                    var parentHeight = getParentHeight(layout, parentDimension, clientSize);

                    if (layoutUtils.isVerticallyStretchedToScreen(layout)) {
                        return layout.y;
                    }

                    if (docked.top) {
                        return getVerticalDockInPixels(docked.top, parentHeight, clientSize.height);
                    }

                    compHeight = compHeight || getHeightInPixels(layout, parentDimension, clientSize);
                    if (docked.bottom) {
                        var bottomDock = getVerticalDockInPixels(docked.bottom, parentHeight, clientSize.height);
                        return parentHeight - (compHeight + bottomDock);
                    }

                    if (docked.vCenter) {
                        var centerDock = getVerticalDockInPixels(docked.vCenter, parentHeight, clientSize.height);
                        return (parentHeight - compHeight) / 2 + centerDock;
                    }
                }

                return layout.y;
            }

            function getPositionAndSize(layout, parentDimension, clientSize, siteWidth, rootLeft) {
                if (!layout.docked && !layout.aspectRatio) {
                    return _.pick(layout, ['x', 'y', 'width', 'height']);
                }

                var width = getWidthInPixels(layout, parentDimension, clientSize, siteWidth);
                var height = getHeightInPixels(layout, parentDimension, clientSize, width);

                return {
                    x: getXInPixels(layout, parentDimension, clientSize, width, siteWidth, rootLeft),
                    y: getYInPixels(layout, parentDimension, clientSize, height),
                    width: width,
                    height: height
                };
            }

            return {
                'getYInPixels': getYInPixels,
                'getHeightInPixels': getHeightInPixels,
                'getPositionAndSize': getPositionAndSize
            };
        }

        var normalAPI = getPositionAndSizeAPI(false);
        var roundingAPI = getPositionAndSizeAPI(true);

        return {
            getYInPixelsRounded: roundingAPI.getYInPixels,
            getHeightInPixelsRounded: roundingAPI.getHeightInPixels,
            getPositionAndSizeRounded: roundingAPI.getPositionAndSize,
            getYInPixels: normalAPI.getYInPixels,
            getHeightInPixels: normalAPI.getHeightInPixels,
            getPositionAndSize: normalAPI.getPositionAndSize
        };
    });
