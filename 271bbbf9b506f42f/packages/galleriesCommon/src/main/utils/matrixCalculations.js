/**
 * Created by Talm on 14/07/2014.
 */
define([], function () {
    'use strict';


    var matrixCalculations = {
        getItemPosition: function (itemIndex, itemWidth, itemHeight, margin, numCols) {
            var marginBetweenImages = margin;
            var numberOfColumns = numCols;
            var columnIndex = itemIndex % numberOfColumns;
            var rowIndex = Math.floor((itemIndex - columnIndex) / numberOfColumns);

            return {
                left: (columnIndex * (itemWidth + marginBetweenImages)),
                top: (rowIndex * (itemHeight + marginBetweenImages))
            };
        },

        /**
         *
         * @param {number} requestedRows
         * @param numCols
         * @param numItems
         * @returns {number}
         */
        getAvailableRowsNumber: function (requestedRows, numCols, numItems) {
            var calculatedNumOfRows = Math.ceil(numItems / numCols);
            return Math.min(requestedRows, calculatedNumOfRows);
        },

        getItemHeight: function (margin, height, numberOfRows, heightDiff) {
            var marginBetweenImages = margin;
            var containerHeight = height - heightDiff;
            return Math.max(Math.floor((containerHeight - ((numberOfRows - 1) * marginBetweenImages)) / numberOfRows), 0);
        },

        getItemWidth: function (margin, numCols, width, widthDiff) {
            var marginBetweenImages = margin;
            var numberOfColumns = numCols;
            var containerWidth = width - widthDiff;
            return Math.max(Math.floor((containerWidth - ((numberOfColumns - 1) * marginBetweenImages)) / numberOfColumns), 0);
        },

        getImageStyle: function (height, width, imgHeight, imgWidth) {
            var isWiderThanContainer = imgWidth > width;
            var isHigherThanContainer = imgHeight > height;
            var newHeight = isWiderThanContainer ? "100%" : "auto";
            var newWidth = isHigherThanContainer ? "100%" : "auto";
            var imgLeft = isHigherThanContainer ? 0 : (width - imgWidth * ( height / imgHeight)) / 2.0;
            var imgTop = isWiderThanContainer ? 0 : (height - imgHeight * (width / imgWidth)) / 2.0;
            return {
                "width": newWidth,
                "height": newHeight,
                "margin-top": imgTop,
                "margin-left": imgLeft
            };
        }
    };
    return matrixCalculations;


});
