define(['layout/wixappsLayout/proxyLayout/util/masonryCalculations'], function (masonryCalculations) {
    'use strict';

    describe('Masonry calculations', function () {
        var totalCols = 5;
        var horizontalGap = 20;
        var direction = "ltr";
        var expected = [0, 4, 8, 12, 16];

        it("should calculate left and right padding correctly", function () {
            for (var i = 0; i < totalCols; i++) {
                var sidePadding = masonryCalculations.getColumnSidePadding(i, totalCols, horizontalGap, direction);
                expect(sidePadding.left).toEqual(expected[i]);
                expect(sidePadding.right).toEqual(expected[totalCols - i - 1]);
            }
        });

        it('should reverse left and right padding according to direction', function () {
            direction = "rtl";
            for (var i = 0; i < totalCols; i++) {
                var sidePadding = masonryCalculations.getColumnSidePadding(i, totalCols, horizontalGap, direction);
                expect(sidePadding.right).toEqual(expected[i]);
                expect(sidePadding.left).toEqual(expected[totalCols - i - 1]);
            }
        });

        it('should get an array of heights and total columns and return an array of column, rows and offsets for each item', function () {
            var itemsHeights = [73, 169, 105, 41, 169, 73, 169, 105, 41, 169];
            expected = [
                {"col": 0, "row": 0, "topOffset": 0},
                {"col": 1, "row": 0, "topOffset": 0},
                {"col": 2, "row": 0, "topOffset": 0},
                {"col": 3, "row": 0, "topOffset": 0},
                {"col": 3, "row": 1, "topOffset": 41},
                {"col": 0, "row": 1, "topOffset": 73},
                {"col": 2, "row": 1, "topOffset": 105},
                {"col": 0, "row": 2, "topOffset": 146},
                {"col": 1, "row": 1, "topOffset": 169},
                {"col": 1, "row": 2, "topOffset": 210}
            ];
            expect(masonryCalculations.getMasonryRowsAndColumns(itemsHeights, 4)).toEqual(expected);

            itemsHeights = [250, 200, 980, 146, 633, 100, 879, 120, 966, 10, 25];
            expected = [
                {"col": 0, "row": 0, "topOffset": 0},
                {"col": 1, "row": 0, "topOffset": 0},
                {"col": 1, "row": 1, "topOffset": 200},
                {"col": 0, "row": 1, "topOffset": 250},
                {"col": 0, "row": 2, "topOffset": 396},
                {"col": 0, "row": 3, "topOffset": 1029},
                {"col": 0, "row": 4, "topOffset": 1129},
                {"col": 1, "row": 2, "topOffset": 1180},
                {"col": 1, "row": 3, "topOffset": 1300},
                {"col": 0, "row": 5, "topOffset": 2008},
                {"col": 0, "row": 6, "topOffset": 2018}
            ];
            expect(masonryCalculations.getMasonryRowsAndColumns(itemsHeights, 2)).toEqual(expected);
        });
    });
});
