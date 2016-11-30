/**
 * Created by Talm on 16/07/2014.
 */
define(['lodash', 'galleriesCommon/utils/matrixCalculations'], function (_, matrixCalculations) {
    'use strict';

    describe('gallery base util tests', function () {
        it("getItemPosition function - left 0 and top 0 pos", function () {
            var expectedObj = {left: 0, top: 0};
            var itemIndex = 0,
                itemWidth = 110,
                itemHeight = 110,
                margin = 106,
                numCols = 2;
            var itemPos = matrixCalculations.getItemPosition(itemIndex, itemWidth, itemHeight, margin, numCols);
            expect(itemPos).toEqual(expectedObj);
        });

        it("getItemPosition ", function () {
            var expectedObj = {left: 320, top: 120};
            var itemIndex = 5,
                itemWidth = 160,
                itemHeight = 120,
                margin = 0,
                numCols = 3;
            var itemPos = matrixCalculations.getItemPosition(itemIndex, itemWidth, itemHeight, margin, numCols);
            expect(itemPos).toEqual(expectedObj);
        });

        it("getAvailableRowsNumber", function () {
            var expectedVal = 3;
            var requestedRows = 3,
                numCols = 3,
                numItems = 17;
            var availableRows = matrixCalculations.getAvailableRowsNumber(requestedRows, numCols, numItems);
            expect(availableRows).toEqual(expectedVal);
        });

        it("getItemHeight", function () {
            var expectedVal = 110;
            var margin = 106,
                numCols = 2,
                height = 346;
            var itemHeight = matrixCalculations.getItemHeight(margin, height, numCols, 20);
            expect(itemHeight).toEqual(expectedVal);
        });
        it("getItemWidth", function () {
            var expectedVal = 110;
            var margin = 106,
                numCols = 2,
                width = 426;
            var itemWidth = matrixCalculations.getItemWidth(margin, numCols, width, 100);
            expect(itemWidth).toEqual(expectedVal);
        });


    });
});
