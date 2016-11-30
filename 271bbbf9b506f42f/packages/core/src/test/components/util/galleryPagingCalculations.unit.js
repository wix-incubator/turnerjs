/**
 * Created by Talm on 16/07/2014.
 */
define(['lodash', 'core/components/util/galleryPagingCalculations'], function (_, galleryPagingCalculations) {
    'use strict';


    describe('galleryPagingCalculations TESTS', function () {
        it("getNumberOfDisplayedRows", function () {
            var expectedVal = 2;
            var fixedNumberOfRows = null,
                maxRows = 2,
                numCols = 2,
                totalItems = 17;
            var res = galleryPagingCalculations.getNumberOfDisplayedRows(fixedNumberOfRows, maxRows, numCols, totalItems);
            expect(res).toEqual(expectedVal);
        });

        it("getNumberOfDisplayedRows - with fixed number", function () {
            var expectedVal = 3;
            var fixedNumberOfRows = true,
                maxRows = 3,
                numCols = 2,
                totalItems = 17;
            var res = galleryPagingCalculations.getNumberOfDisplayedRows(fixedNumberOfRows, maxRows, numCols, totalItems);
            expect(res).toEqual(expectedVal);
        });

        it("getItemsPerPage ", function () {
            var expectedVal = 4;
            var numCols = 2,
                maxRows = 2,
                itemsLength = 17;
            var itemsPerPage = galleryPagingCalculations.getItemsPerPage(numCols, maxRows, itemsLength);
            expect(itemsPerPage).toEqual(expectedVal);
        });

        it("getTotalPageCount", function () {
            var expectedVal = 5;
            var numCols = 2,
                maxRows = 2,
                itemsLength = 17;
            var totalPageCount = galleryPagingCalculations.getTotalPageCount(numCols, maxRows, itemsLength);
            expect(totalPageCount).toEqual(expectedVal);
        });
        it("getNextPageItemIndexs ", function () {
            var expectedVal = 0;
            var pageIndex = 16,
                numCols = 2,
                maxRows = 2,
                itemsLength = 17;
            var nextPageIndex = galleryPagingCalculations.getNextPageItemIndex(pageIndex, numCols, maxRows, itemsLength);
            expect(nextPageIndex).toEqual(expectedVal);
        });
        it("getPrevPageItemIndex ", function () {
            var expectedVal = 0;
            var pageIndex = 4,
                numCols = 2,
                maxRows = 2,
                itemsLength = 17;
            var prevPageIndex = galleryPagingCalculations.getPrevPageItemIndex(pageIndex, numCols, maxRows, itemsLength);
            expect(prevPageIndex).toEqual(expectedVal);
        });
        it("getCounterText ", function () {
            var expectedVal = "1/5";
            var currentItem = 0,
                numCols = 2,
                maxRows = 2,
                itemsLength = 17;
            var counterText = galleryPagingCalculations.getCounterText(currentItem, numCols, maxRows, itemsLength);
            expect(counterText).toEqual(expectedVal);
        });
        it("getPageItems ", function () {
            var expectedVal = ["#i01iie", "#i1bbw", "#i2f3", "#i36ao"];
            var itemList = ["#i01iie", "#i1bbw", "#i2f3", "#i36ao", "#i49gb", "#i5zop", "#i61hzj", "#i71uqe", "#i811kk", "#i9nu8", "#i101j2u", "#i111wm6", "#i1211eu", "#i13kko", "#i1414c7", "#i151o95", "#i161zug"],
                firstItemIndex = 0,
                numCols = 2,
                maxRows = 2;
            var pagesItems = galleryPagingCalculations.getPageItems(itemList, firstItemIndex, numCols, maxRows);
            expect(pagesItems).toEqual(expectedVal);
        });

        it("getPageItemsByStartIndex ", function () {
            var expectedVal = ["#i61hzj", "#i71uqe", "#i811kk", "#i9nu8", "#i101j2u", "#i111wm6", "#i1211eu", "#i13kko", "#i1414c7", "#i151o95"];
            var itemList = ["#i01iie", "#i1bbw", "#i2f3", "#i36ao", "#i49gb", "#i5zop", "#i61hzj", "#i71uqe", "#i811kk", "#i9nu8", "#i101j2u", "#i111wm6", "#i1211eu", "#i13kko", "#i1414c7", "#i151o95", "#i161zug"],
                firstItemIndex = 6,
                itemsPerPage = 10;
            var pagesItems = galleryPagingCalculations.getPageItemsByStartIndex(itemList, firstItemIndex, itemsPerPage);
            expect(pagesItems).toEqual(expectedVal);
            expect(itemList).toEqual(galleryPagingCalculations.getPageItemsByStartIndex(itemList, 0, itemList.length));
            expect(itemList).toEqual(galleryPagingCalculations.getPageItemsByStartIndex(itemList, 0, itemList.length + 1));
        });
    });
});
