define([], function () {
    'use strict';

    var DIALOG_BOX_MIN_WIDTH = 600;
    var MIN_PANEL_HEIGHT = 20;

    var DESKTOP_VIEW_DEFAULTS = {
        marginTop: 0,
        paddingTop: 0,
        dialogBoxHeight: 600,
        imageContainerWidth: 500,
        imageContainerHeight: 500
    };

    var DESKTOP_DEFAULT_PADDING = {
        vertical: 10,
        horizontal: 20
    };

    var NON_OPTIMIZED_DEFAULT_PADDING = {
        vertical: 15,
        horizontal: 15
    };

    var MOBILE_VIEW_DEFAULTS = {
        marginTop: 0,
        paddingTop: 0,
        dialogBoxHeight: 400,
        imageContainerWidth: 320,
        imageContainerHeight: 400
    };

    function getImageContainerDimensions(imageData, maxImageWidth, maxImageHeight, minImageContainerWidth) {
        var wScale = maxImageWidth / imageData.width;
        var hScale = maxImageHeight / imageData.height;
        var targetScale = Math.min(wScale, hScale);
        return {
            width: Math.max(Math.round(imageData.width * targetScale), minImageContainerWidth),
            height: Math.round(imageData.height * targetScale)
        };
    }

    function getDimensionsForImageAndBox(imageData, maxImageWidth, maxImageHeight, panelHeight, minBoxWidth, screenHeight, screenWidth, dialogBoxPadding) {
        panelHeight = panelHeight || 0;
        dialogBoxPadding = dialogBoxPadding || {};

        var imageContainer = getImageContainerDimensions(imageData, maxImageWidth, maxImageHeight, minBoxWidth);

        var dialogBoxWidth = imageContainer.width + (dialogBoxPadding.horizontal || 0);
        var dialogBoxHeight = imageContainer.height + panelHeight + (dialogBoxPadding.vertical || 0);
        var marginLeft = Math.ceil(Math.max((screenWidth - dialogBoxWidth) / 2, 0));
        var distanceFromTop = Math.ceil(Math.max((screenHeight - dialogBoxHeight) / 2, 0));


        return {
            marginLeft: marginLeft,
            marginTop: distanceFromTop,
            paddingTop: distanceFromTop,
            dialogBoxHeight: dialogBoxHeight,
            dialogBoxWidth: dialogBoxWidth,
            imageContainerWidth: imageContainer.width,
            imageContainerHeight: imageContainer.height
        };
    }

    var mediaZoomCalculations = {

        /**
         * Calculates the correct measurements for media zoom component for desktop view and non optimized view
         * (mobile device in not mobile view or tablet device)
         *
         * @param compData
         * @param siteData
         * @param measureMap
         * @param widthSpacer
         * @param heightSpacer
         * @returns {{marginTop: (number),{paddingTop: (number), dialogBoxHeight: (number), imageContainerWidth: (number), imageContainerHeight: (number)}}
         * @param panelHeight
         */
        getDesktopViewDimensions: function (compData, siteData, measureMap, widthSpacer, heightSpacer, panelHeight, dialogBoxPadding) {
            var maxImageWidth, maxImageHeight, screenWidth, screenHeight;
            dialogBoxPadding = dialogBoxPadding || DESKTOP_DEFAULT_PADDING;
            panelHeight = panelHeight || MIN_PANEL_HEIGHT;
            var dimensions = DESKTOP_VIEW_DEFAULTS;
            if (measureMap) {
                screenWidth = measureMap.width.screen;
                screenHeight = measureMap.height.screen;

                maxImageWidth = screenWidth - widthSpacer - dialogBoxPadding.horizontal;
                maxImageHeight = screenHeight - (heightSpacer / 2) - panelHeight - dialogBoxPadding.vertical;

                if (!siteData.isMobileDevice() && !siteData.isTabletDevice()) {
                    maxImageWidth = Math.min(compData.width, maxImageWidth);
                    maxImageHeight = Math.min(compData.height, maxImageHeight);
                }

                dimensions = getDimensionsForImageAndBox(compData, maxImageWidth, maxImageHeight, panelHeight,
                                                        DIALOG_BOX_MIN_WIDTH, screenHeight, screenWidth, dialogBoxPadding);
            }

            return dimensions;
        },

        // widthSpacer and heightSpacer are defined in mediaZoom and are 0 for non desktop devices
        getNonOptimizedViewDimensions: function (imageData, siteData, measureMap, widthSpacer, heightSpacer, panelHeight, dialogBoxPadding) {
            if (!measureMap) {
                return DESKTOP_VIEW_DEFAULTS;
            }

            dialogBoxPadding = dialogBoxPadding && (dialogBoxPadding.vertical || dialogBoxPadding.horizontal) ? dialogBoxPadding : NON_OPTIMIZED_DEFAULT_PADDING;
            panelHeight = panelHeight || 0;

            var screenWidth = measureMap.width.screen;
            var screenHeight = measureMap.height.screen;

            var maxImageWidth = Math.min(imageData.width, screenWidth - 2 * dialogBoxPadding.horizontal);
            var maxImageHeight = Math.min(imageData.height, screenHeight - 2 * dialogBoxPadding.vertical);

            var imageContainer = getImageContainerDimensions(imageData, maxImageWidth, maxImageHeight, DIALOG_BOX_MIN_WIDTH);

            var dialogBoxWidth = screenWidth - 2 * dialogBoxPadding.horizontal;
            var dialogBoxHeight = imageContainer.height + panelHeight;

            var marginLeft = dialogBoxPadding.horizontal;
            var distanceFromTop = Math.ceil(Math.max((screenHeight - dialogBoxHeight) / 2, dialogBoxPadding.vertical));

            return {
                marginLeft: marginLeft,
                marginTop: distanceFromTop,
                paddingTop: distanceFromTop,
                dialogBoxHeight: dialogBoxHeight,
                dialogBoxWidth: dialogBoxWidth,
                imageContainerWidth: imageContainer.width,
                imageContainerHeight: imageContainer.height
            };
        },

        getMobileViewDimensions: function (compData, siteData, measureMap) {
            var maxWidth, maxHeight, screenWidth, screenHeight, siteStructureWidth;

            var dimensions = MOBILE_VIEW_DEFAULTS;
            if (measureMap) {

                screenWidth = measureMap.width.screen;
                screenHeight = measureMap.innerHeight.screen;
                siteStructureWidth = siteData.getSiteWidth();

                maxWidth = Math.min(compData.width, Math.max(screenWidth, siteStructureWidth));
                maxHeight = Math.min(compData.height, screenHeight);

                dimensions = getDimensionsForImageAndBox(compData, maxWidth, maxHeight, 0, 0, screenHeight, screenWidth);
            }

            return dimensions;
        }
    };

    return mediaZoomCalculations;
});
