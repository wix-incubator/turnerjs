/**
 * Created by Talm on 16/07/2014.
 */
define(['lodash', 'galleriesCommon/utils/galleriesHelperFunctions'], function (_, galleriesHelperFunctions) {
    'use strict';


    describe('gallery base util tests', function () {

        it("getSkinWidthDiff- no statics ", function () {
            var skinName = "wysiwyg.viewer.skins.paginatedgrid.PaginatedGridDefaultSkin";
            var widthDiff = galleriesHelperFunctions.getSkinWidthDiff(skinName);
            expect(widthDiff).toEqual(0);
        });
        it("getSkinHeightDiff - no statics", function () {
            var skinName = "wysiwyg.viewer.skins.paginatedgrid.PaginatedGridDefaultSkin";
            var heightDiff = galleriesHelperFunctions.getSkinHeightDiff(skinName);
            expect(heightDiff).toEqual(0);
        });

        it("getSkinWidthDiff- with statics ", function () {
            var skinName = "wysiwyg.viewer.skins.paginatedgrid.PaginatedGridArrowsOutside";
            var widthDiff = galleriesHelperFunctions.getSkinWidthDiff(skinName);
            expect(widthDiff).toEqual(100);
        });
        it("getSkinHeightDiff - with statics", function () {
            var skinName = "wysiwyg.viewer.skins.paginatedgrid.PaginatedGridArrowsOutside";
            var heightDiff = galleriesHelperFunctions.getSkinHeightDiff(skinName);
            expect(heightDiff).toEqual(20);
        });

        it("getGalleryHeight", function () {
            var expectedVal = 946;
            var currentNumberOfRows = 3,
                newNumberOfRows = 4,
                margin = 15,
                skinName = "wysiwyg.viewer.skins.gallerymatrix.TextBottomCustomHeightSkin",
                height = 712;
            var newGalleryHeight = galleriesHelperFunctions.getGalleryHeight(currentNumberOfRows, newNumberOfRows, margin, skinName, height);
            expect(newGalleryHeight).toEqual(expectedVal);
        });


    });
});
