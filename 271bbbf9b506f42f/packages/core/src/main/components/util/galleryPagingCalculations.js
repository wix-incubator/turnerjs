/**
 * Created by Talm on 14/07/2014.
 */
define(['lodash', 'galleriesCommon'], function (_, galleriesCommon) {
    'use strict';

    var matrixCalculations = galleriesCommon.utils.matrixCalculations;
    /**
     *
     *
     * @class core.galleryPagingCalculations
     */
    var galleryPagingCalculations = {
        getNumberOfDisplayedRows: function (fixedNumberOfRows, maxRows, numCols, totalItems) {
            if (fixedNumberOfRows || (totalItems && totalItems < (maxRows * numCols))) {
                return maxRows;
            }
            return matrixCalculations.getAvailableRowsNumber(maxRows, numCols, totalItems);
        },

        getItemsPerPage: function (numCols, maxRows, itemsLength) {
            return numCols * this.getNumberOfDisplayedRows(null, maxRows, numCols, itemsLength);
        },

        getTotalPageCount: function (numCols, maxRows, itemsLength) {
            var itemsPerPage = this.getItemsPerPage(numCols, maxRows, itemsLength);
            var totalPageCount = Math.floor(itemsLength / itemsPerPage);
            if ((itemsLength % itemsPerPage) > 0) {
                totalPageCount++;
            }
            return totalPageCount;
        },

        getNextPageItemIndex: function (pageIndex, numCols, maxRows, itemsLength) {
            var index = pageIndex + this.getItemsPerPage(numCols, maxRows, itemsLength);
            if (index >= itemsLength) {
                index = 0;
            }
            return index;
        },

        getPrevPageItemIndex: function (pageIndex, numCols, maxRows, itemsLength) {
            var itemsPerPage = this.getItemsPerPage(numCols, maxRows, itemsLength);
            var index = pageIndex - itemsPerPage;
            if (index < 0) {
                index = (this.getTotalPageCount(numCols, maxRows, itemsLength) - 1) * itemsPerPage;
            }
            return index;
        },

        getCounterText: function (currentItem, numCols, maxRows, itemsLength) {
            var currentPage = Math.floor(currentItem / this.getItemsPerPage(numCols, maxRows, itemsLength));
            var totalPageCount = this.getTotalPageCount(numCols, maxRows, itemsLength);
            if (!totalPageCount) {
                totalPageCount = 1;
            }
            return String(currentPage + 1) + "/" + String(totalPageCount);
        },

        getPageItems: function (itemList, firstItemIndex, numCols, maxRows) {
            return this.getPageItemsByStartIndex(itemList, firstItemIndex, this.getItemsPerPage(numCols, maxRows, itemList.length));
        },

        getPageItemsByStartIndex: function (itemList, firstItemIndex, itemsPerPage) {
            var pageItems = [];

            if (itemsPerPage < itemList.length){
                var finalItemIndex = this.getLastItemIndex(itemList, firstItemIndex, itemsPerPage);
                for (var i = firstItemIndex; i <= finalItemIndex; i++) {
                    pageItems.push(itemList[i]);
                }
                return pageItems;
            }

            return itemList;
        },

        getLastItemIndex: function(itemList, firstItemIndex, itemsPerPage){
            return Math.min(itemList.length - 1, firstItemIndex + itemsPerPage - 1);
        }
    };
    return galleryPagingCalculations;


});
