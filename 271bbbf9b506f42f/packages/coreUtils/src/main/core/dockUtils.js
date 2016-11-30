define(['lodash', 'coreUtils/core/cssUtils'], function (_, cssUtils) {
    'use strict';

    function doubleAllValues(dockedObj){
        return _.mapValues(dockedObj, function(val){ return val * 2; });
    }

    function addPageBottomMargin(dockedValueObj, pagePaddingBottom) {
        if (_.isNumber(dockedValueObj.px)) {
            dockedValueObj.px += pagePaddingBottom;
        } else {
            dockedValueObj.px = pagePaddingBottom;
        }
    }

    function isHorizontalDockToScreen (layout){
        var dockedData = layout && layout.docked;
        var isDockToScreenFromLeft = dockedData && dockedData.left && _.isFinite(dockedData.left.vw);
        var isDockToScreenFromRight = dockedData && dockedData.right && _.isFinite(dockedData.right.vw);

        return Boolean(isDockToScreenFromLeft && isDockToScreenFromRight);
    }

    function isFullPageComponent (layout){
        var dockedData = layout && layout.docked;
        var isDockToScreenFromLeft = _.get(dockedData, 'left.px') === 0;
        var isDockToScreenFromRight = _.get(dockedData, 'right.px') === 0;
        var isDockToScreenFromTop = _.get(dockedData, 'top.px') === 0;
        var isDockToScreenFromBottom = _.get(dockedData, 'bottom.px') === 0;

        return Boolean(isDockToScreenFromLeft && isDockToScreenFromRight && isDockToScreenFromTop && isDockToScreenFromBottom);
    }

    function isVerticallyDockToScreen (layout){
        return _.has(layout, ['docked', 'top', 'vh']) && _.has(layout, ['docked', 'bottom', 'vh']);
    }

    function getScreenWidthCss(dockLeft, dockRight, screenWidth){
        var widthUnitsData = {
            vw: (100 - dockLeft.vw - dockRight.vw)
        };

        var offsetInPx = (0 - (dockLeft.px || 0) - (dockRight.px || 0));
        if (offsetInPx !== 0){
            widthUnitsData.px = offsetInPx;
        }

        return cssUtils.convertUnitsDataToCssStringValue(widthUnitsData, screenWidth);
    }

    function getScreenHeightCss(dockTop, dockBottom, screenHeight){
        var heightUnitsData = {
            vh: (100 - dockTop.vh - dockBottom.vh)
        };

        var offsetInPx = (0 - (dockTop.px || 0) - (dockBottom.px || 0));
        if (offsetInPx !== 0){
            heightUnitsData.px = offsetInPx;
        }

        return cssUtils.convertUnitsDataToCssStringValue(heightUnitsData, screenHeight);
    }

    function updateStyleObjectForHorizontalDockToScreen(dockedData, styleObject, screenWidth, siteX){
        var leftDockData = _.clone(dockedData.left);
        leftDockData.px = (leftDockData.px || 0) + siteX;
        styleObject.left = cssUtils.convertUnitsDataToCssStringValue(leftDockData, screenWidth);
        styleObject.width = getScreenWidthCss(dockedData.left, dockedData.right, screenWidth);
    }

    function updateStyleObjectForVerticalDockToScreen(dockedData, styleObject, screenHeight, structureY, fixedPosition, pageBottomMargin){
        var topDockData = _.clone(dockedData.top);
        topDockData.px = (topDockData.px || 0);
        styleObject.top = cssUtils.convertUnitsDataToCssStringValue({px: structureY}, screenHeight);
        styleObject.height = getScreenHeightCss(dockedData.top, dockedData.bottom, screenHeight);

        var dockedBottomObj = _.clone(dockedData.bottom);
        if (dockedBottomObj && fixedPosition){
            addPageBottomMargin(dockedBottomObj, pageBottomMargin);
            styleObject.bottom = cssUtils.convertUnitsDataToCssStringValue(dockedBottomObj, screenHeight);
        }
    }

    function updateStyleAccordingToHorizontalDockedLayout(layout, style, screenWidth, siteX){
        if (layout.docked.hCenter) {
            style.left = cssUtils.convertUnitsDataToCssStringValue(doubleAllValues(layout.docked.hCenter), screenWidth); //double values because in css, the margin is split to both sides when it has auto and left value
            style.right = 0;
            style.margin = 'auto';
            return;
        }

        if (isHorizontalDockToScreen(layout)){
            updateStyleObjectForHorizontalDockToScreen(layout.docked, style, screenWidth, siteX);
            return;
        }

        if (layout.docked.left) {
            style.left = cssUtils.convertUnitsDataToCssStringValue(layout.docked.left, screenWidth);
        }

        if (layout.docked.right) {
            style.right = cssUtils.convertUnitsDataToCssStringValue(layout.docked.right, screenWidth);
        }
    }

    function updateStyleAccordingToVerticalDockedLayout(layout, style, pageBottomMargin, screenWidth, screenHeight){
        if (layout.docked.vCenter) {
            style.top = cssUtils.convertUnitsDataToCssStringValue(doubleAllValues(layout.docked.vCenter), screenWidth); //double values because in css, the margin is split to both sides when it has auto and left value
            style.bottom = 0;
            style.margin = 'auto';
            return;
        }

        if (isVerticallyDockToScreen(layout)) {
            updateStyleObjectForVerticalDockToScreen(layout.docked, style, screenHeight, layout.y, layout.fixedPosition, pageBottomMargin);
            return;
        }

        if (isVerticallyStretched(layout)) {
           style.height = '';
        }

        if (layout.docked.top) {
            style.top = cssUtils.convertUnitsDataToCssStringValue(layout.docked.top, screenHeight);
        }

        if (layout.docked.bottom) {
            var dockedBottomObj = _.clone(layout.docked.bottom);
            if (layout.fixedPosition){
                addPageBottomMargin(dockedBottomObj, pageBottomMargin);
            }
            style.bottom = cssUtils.convertUnitsDataToCssStringValue(dockedBottomObj, screenHeight);
        }
    }

    function updateStyleAccordingToDockedLayout(layout, style, pageBottomMargin, screenWidth, siteWidth, siteX, screenHeight) {
        screenWidth = Math.max(screenWidth, siteWidth);

        updateStyleAccordingToHorizontalDockedLayout(layout, style, screenWidth, siteX);
        updateStyleAccordingToVerticalDockedLayout(layout, style, pageBottomMargin, screenWidth, screenHeight);

        return style;
    }

    function isHorizontallyStretched(layout){
        var dockedData = layout && layout.docked;

        return !!(dockedData && dockedData.left && dockedData.right);
    }

    function isVerticallyStretched(layout){
        var dockedData = layout && layout.docked;

        return !!(dockedData && dockedData.top && dockedData.bottom);
    }

    function isStretched(layout){
        return isHorizontallyStretched(layout) || isVerticallyStretched(layout);
    }

    return {
        isHorizontalDockToScreen: isHorizontalDockToScreen,
        isVerticallyDockToScreen: isVerticallyDockToScreen,
        isHorizontallyStretched: isHorizontallyStretched,
        isVerticallyStretched: isVerticallyStretched,
        isFullPageComponent: isFullPageComponent,
        isStretched: isStretched,
        getDockedStyle: function (layout, pageBottomMargin, screenWidth, siteWidth, siteX) {
            if (!layout.docked) {
                throw new Error('Layout must have docked structure');
            }

            return updateStyleAccordingToDockedLayout(layout, {}, pageBottomMargin, screenWidth, siteWidth, siteX);
        },
        /**
         *
         * @param layout
         * @param style
         * @param pageBottomMargin
         * @param {number} [screenWidth]
         * @param {number} [siteX] only required for screen-width docked comps.. should probably refactor
         * @returns {*}
         */
		applyDockedStyle: function (layout, style, pageBottomMargin, screenWidth, siteWidth, siteX, screenHeight) {
            if (!layout.docked) {
                throw new Error('Layout must have docked structure');
            }

            return updateStyleAccordingToDockedLayout(layout, style, pageBottomMargin, screenWidth, siteWidth, siteX, screenHeight);
        }
    };
});
