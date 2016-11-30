define(["lodash"], function (_) {
    'use strict';

    /**
     * @class layout.masonryCalculations
     */
    var masonryCalculations = {
        /**
         * @param columnIndex - current column index
         * @param totalColumns - total # of columns
         * @param horizontalGap - required horizontal gap between columns
         * @param columnsDirection - rtl or ltr
         * @return {right: number, left: number} right and left padding
         */
        getColumnSidePadding: function(columnIndex, totalColumns, horizontalGap, columnsDirection){
            var isRtl = columnsDirection === "rtl";
            var spacingUnit = Math.floor(horizontalGap / totalColumns);
            var firstSidePadding = columnIndex * spacingUnit;
            var secondSidePadding = (totalColumns - 1 - columnIndex) * spacingUnit;
            return {
                right: isRtl ? firstSidePadding : secondSidePadding,
                left: isRtl ? secondSidePadding : firstSidePadding
            };
        },

        /**
         * @param itemsHeights - array of all of the items' heights
         * @param totalColumns - total # of columns
         * @returns {Array} - returns an array where each entry is an object represents the corresponding item's row,
         * column and offset from the top
         */
        getMasonryRowsAndColumns: function(itemsHeights, totalColumns){
            var result = [];
            var colsHeightSum = [];
            var colsRowsCount = [];

            for (var i = 0; i < totalColumns; i++) {
                colsHeightSum.push(0);
                colsRowsCount.push(0);
            }

            for (var j = 0; j < itemsHeights.length; j++) {
                var shortestColumn = _.indexOf(colsHeightSum, _.min(colsHeightSum));
                result.push({
                    col: shortestColumn,
                    row: colsRowsCount[shortestColumn],
                    topOffset: colsHeightSum[shortestColumn]
                });
                colsHeightSum[shortestColumn] += itemsHeights[j];
                colsRowsCount[shortestColumn]++;
            }

            return result;
        }
    };

    return masonryCalculations;
});