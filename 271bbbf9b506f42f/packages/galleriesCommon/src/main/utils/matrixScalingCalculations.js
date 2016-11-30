define([], function () {
    'use strict';

    var matrixScalingCalculations = {
        getSizeAfterScaling: function (itemData) {
            var mode = itemData.imageMode || 'clipImage';
            var height = itemData.itemHeight - itemData.bottomGap;
            var widthDiff = itemData.widthDiff;
            var heightDiff = itemData.heightDiff;
            var galleryScalersMap = {
                clipImage: this.getClipImage,
                flexibleHeight: this.getFlexibleHeight,
                flexibleWidth: this.getFlexibleWidth,
                flexibleWidthFixed: this.getFlexibleWidth
            };
            return galleryScalersMap[mode].call(this, itemData.itemWidth, height, widthDiff, heightDiff, itemData.displayerData, mode);
        },

        getClipImage: function (width, height, widthDiff, heightDiff) {
            return {
                displayerSize: {
                    width: width,
                    height: height
                },
                imageWrapperSize: this.getWrapperSize(width - widthDiff, height - heightDiff)
            };

        },

        getFlexibleHeight: function (width, height, widthDiff, heightDiff, displayerData) {
            var newWidth = width - widthDiff;
            var newHeight = Math.floor(newWidth / this.getAspectRatio(displayerData));
            return {
                displayerSize: {
                    width: width,
                    height: newHeight
                },
                imageWrapperSize: this.getWrapperSize(newWidth, newHeight - heightDiff)
            };

        },
        getFlexibleWidth: function (width, height, widthDiff, heightDiff, displayerData, mode) {
            var isFlexibleWidth = (mode === 'flexibleWidth');
            var horizontalPadding = 0;
            var verticalPadding = 0;
            var newHeight = height - heightDiff;
            var newWidth = newHeight * this.getAspectRatio(displayerData);

            if (!isFlexibleWidth && newWidth > (width - widthDiff)) {
                if (newWidth > (width - widthDiff)) {
                    var coef = (width - widthDiff) / newWidth;
                    newWidth = (width - widthDiff);
                    newHeight = coef * newHeight;
                }
            }
            if (!isFlexibleWidth) {
                horizontalPadding = Math.floor((width - newWidth - widthDiff) / 2.0);
                verticalPadding = Math.floor((height - newHeight - heightDiff) / 2.0);

            }

            return {
                displayerSize: {
                    width: isFlexibleWidth ? newWidth : width,
                    height: height
                },
                imageWrapperSize: this.getWrapperSize(newWidth, newHeight, horizontalPadding, verticalPadding)
            };
        },
        getAspectRatio: function (displayerData) {
            return displayerData.width / displayerData.height;
        },
        getWrapperSize: function (newWidth, newHeight, horizontalPadding, verticalPadding) {
            var height = (newHeight < 0) ? 0 : newHeight;
            var width = (newWidth < 0) ? 0 : newWidth;
            return {
                imageWrapperHeight: height,
                imageWrapperWidth: width,
                imageWrapperMarginLeft: horizontalPadding || 0,
                imageWrapperMarginRight: horizontalPadding || 0,
                imageWrapperMarginTop: verticalPadding || 0,
                imageWrapperMarginBottom: verticalPadding || 0
            };
        }
    };
    return matrixScalingCalculations;
});
