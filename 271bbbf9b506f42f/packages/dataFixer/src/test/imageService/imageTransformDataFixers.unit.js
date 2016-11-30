define(['lodash', 'imageClientApi', 'dataFixer/imageService/imageTransformDataFixers'], function(_, imageClientApi, fixers) {
    'use strict';


    describe('imageTransformDataFixers', function() {

        describe('cssToFittingType', function() {

            it('should convert css background-size contain to fittingTypes.SCALE_TO_FIT ', function() {
                var fittingType = fixers.cssToFittingType({bgSize: "contain", bgRepeat: "no-repeat no-repeat"});
                expect(fittingType).toBe(imageClientApi.fittingTypes.SCALE_TO_FIT);
            });

            it('should convert css background-size cover to fittingTypes.SCALE_TO_FILL ', function() {
                var fittingType = fixers.cssToFittingType({bgSize: "cover", bgRepeat: "no-repeat no-repeat"});
                expect(fittingType).toBe(imageClientApi.fittingTypes.SCALE_TO_FILL);
            });

            it('should convert css background-size auto to fittingTypes.ORIGINAL_SIZE', function() {
                var fittingType = fixers.cssToFittingType({bgSize: "auto", bgRepeat: "no-repeat no-repeat"});
                expect(fittingType).toBe(imageClientApi.fittingTypes.LEGACY_ORIGINAL_SIZE);
            });

            it('should convert css background-repeat [repeat] and [repeat repeat] css to fittingTypes.TILE', function() {
                var fittingType = fixers.cssToFittingType({bgSize: "auto", bgRepeat: "repeat repeat"});
                expect(fittingType).toBe(imageClientApi.fittingTypes.TILE);
                fittingType = fixers.cssToFittingType({bgSize: "auto", bgRepeat: "repeat"});
                expect(fittingType).toBe(imageClientApi.fittingTypes.TILE);
            });

            it('should convert css background-repeat [repeat-x] and [repeat no-repeat] css to fittingTypes.TILE_HORIZONTAL', function() {
                var fittingType = fixers.cssToFittingType({bgSize: "auto", bgRepeat: "repeat no-repeat"});
                expect(fittingType).toBe(imageClientApi.fittingTypes.TILE_HORIZONTAL);
                fittingType = fixers.cssToFittingType({bgSize: "auto", bgRepeat: "repeat-x"});
                expect(fittingType).toBe(imageClientApi.fittingTypes.TILE_HORIZONTAL);
            });

            it('should convert css background-repeat [repeat-y] and [no-repeat repeat] css to fittingTypes.TILE_VERTICAL', function() {
                var fittingType = fixers.cssToFittingType({bgSize: "auto", bgRepeat: "no-repeat repeat"});
                expect(fittingType).toBe(imageClientApi.fittingTypes.TILE_VERTICAL);
                fittingType = fixers.cssToFittingType({bgSize: "auto", bgRepeat: "repeat-y"});
                expect(fittingType).toBe(imageClientApi.fittingTypes.TILE_VERTICAL);
            });

        });

        describe('cssToAlignType', function() {

            it('should convert background-position css to imageClientApi alignTypes ', function() {
                var alignType = fixers.cssToAlignType("center center");
                expect(alignType).toBe(imageClientApi.alignTypes.CENTER);
                alignType = fixers.cssToAlignType("50% 50%");
                expect(alignType).toBe(imageClientApi.alignTypes.CENTER);

                alignType = fixers.cssToAlignType("center top");
                expect(alignType).toBe(imageClientApi.alignTypes.TOP);
                alignType = fixers.cssToAlignType("top center");
                expect(alignType).toBe(imageClientApi.alignTypes.TOP);
                alignType = fixers.cssToAlignType("50% 0%");
                expect(alignType).toBe(imageClientApi.alignTypes.TOP);

                alignType = fixers.cssToAlignType("bottom center");
                expect(alignType).toBe(imageClientApi.alignTypes.BOTTOM);
                alignType = fixers.cssToAlignType("center bottom");
                expect(alignType).toBe(imageClientApi.alignTypes.BOTTOM);
                alignType = fixers.cssToAlignType("50% 100%");
                expect(alignType).toBe(imageClientApi.alignTypes.BOTTOM);

                alignType = fixers.cssToAlignType("center right");
                expect(alignType).toBe(imageClientApi.alignTypes.RIGHT);
                alignType = fixers.cssToAlignType("right center");
                expect(alignType).toBe(imageClientApi.alignTypes.RIGHT);
                alignType = fixers.cssToAlignType("100% 50%");
                expect(alignType).toBe(imageClientApi.alignTypes.RIGHT);

                alignType = fixers.cssToAlignType("center left");
                expect(alignType).toBe(imageClientApi.alignTypes.LEFT);
                alignType = fixers.cssToAlignType("left center");
                expect(alignType).toBe(imageClientApi.alignTypes.LEFT);
                alignType = fixers.cssToAlignType("0% 50%");
                expect(alignType).toBe(imageClientApi.alignTypes.LEFT);

                alignType = fixers.cssToAlignType("top left");
                expect(alignType).toBe(imageClientApi.alignTypes.TOP_LEFT);
                alignType = fixers.cssToAlignType("left top");
                expect(alignType).toBe(imageClientApi.alignTypes.TOP_LEFT);
                alignType = fixers.cssToAlignType("0% 0%");
                expect(alignType).toBe(imageClientApi.alignTypes.TOP_LEFT);

                alignType = fixers.cssToAlignType("top right");
                expect(alignType).toBe(imageClientApi.alignTypes.TOP_RIGHT);
                alignType = fixers.cssToAlignType("right top");
                expect(alignType).toBe(imageClientApi.alignTypes.TOP_RIGHT);
                alignType = fixers.cssToAlignType("100% 0%");
                expect(alignType).toBe(imageClientApi.alignTypes.TOP_RIGHT);

                alignType = fixers.cssToAlignType("bottom right");
                expect(alignType).toBe(imageClientApi.alignTypes.BOTTOM_RIGHT);
                alignType = fixers.cssToAlignType("right bottom");
                expect(alignType).toBe(imageClientApi.alignTypes.BOTTOM_RIGHT);
                alignType = fixers.cssToAlignType("100% 100%");
                expect(alignType).toBe(imageClientApi.alignTypes.BOTTOM_RIGHT);

                alignType = fixers.cssToAlignType("bottom left");
                expect(alignType).toBe(imageClientApi.alignTypes.BOTTOM_LEFT);
                alignType = fixers.cssToAlignType("left bottom");
                expect(alignType).toBe(imageClientApi.alignTypes.BOTTOM_LEFT);
                alignType = fixers.cssToAlignType("0% 100%");
                expect(alignType).toBe(imageClientApi.alignTypes.BOTTOM_LEFT);

            });

        });

        describe('fittingTypeToBgRepeat', function() {

           it('should convert fittingTypes to css background-repeat', function() {
                var bgRepeat = fixers.fittingTypeToBgRepeat(imageClientApi.fittingTypes.TILE);

                expect(bgRepeat).toBe("repeat");

                bgRepeat = fixers.fittingTypeToBgRepeat(imageClientApi.fittingTypes.TILE_HORIZONTAL);

                expect(bgRepeat).toBe("repeat-x");

                bgRepeat = fixers.fittingTypeToBgRepeat(imageClientApi.fittingTypes.TILE_VERTICAL);

                expect(bgRepeat).toBe("repeat-y");

                bgRepeat = fixers.fittingTypeToBgRepeat("NotTilingType");

                expect(bgRepeat).toBe("no-repeat");
            });
        });

        describe('fittingTypeToBgSize', function() {

            it('should convert fittingTypes to css background-size', function() {
                var bgSize = fixers.fittingTypeToBgSize(imageClientApi.fittingTypes.SCALE_TO_FIT);

                expect(bgSize).toBe("contain");

                bgSize = fixers.fittingTypeToBgSize(imageClientApi.fittingTypes.SCALE_TO_FILL);

                expect(bgSize).toBe("cover");

                bgSize = fixers.fittingTypeToBgSize(imageClientApi.fittingTypes.LEGACY_ORIGINAL_SIZE);

                expect(bgSize).toBe("auto");

                bgSize = fixers.fittingTypeToBgSize("checkDefault");

                expect(bgSize).toBe("auto");

            });
        });

        describe('alignTypeToBgPosition', function() {

            it('should convert imageClientApi alignTypes to background-position css', function() {
                var bgPosition = fixers.alignTypeToBgPosition(imageClientApi.alignTypes.CENTER);

                expect(bgPosition).toBe("center");

                bgPosition = fixers.alignTypeToBgPosition(imageClientApi.alignTypes.TOP);

                expect(bgPosition).toBe("center top");

                bgPosition = fixers.alignTypeToBgPosition(imageClientApi.alignTypes.BOTTOM);

                expect(bgPosition).toBe("center bottom");

                bgPosition = fixers.alignTypeToBgPosition(imageClientApi.alignTypes.RIGHT);

                expect(bgPosition).toBe("right center");

                bgPosition = fixers.alignTypeToBgPosition(imageClientApi.alignTypes.LEFT);

                expect(bgPosition).toBe("left center");

                bgPosition = fixers.alignTypeToBgPosition(imageClientApi.alignTypes.TOP_LEFT);

                expect(bgPosition).toBe("left top");

                bgPosition = fixers.alignTypeToBgPosition(imageClientApi.alignTypes.TOP_RIGHT);

                expect(bgPosition).toBe("right top");

                bgPosition = fixers.alignTypeToBgPosition(imageClientApi.alignTypes.BOTTOM_LEFT);

                expect(bgPosition).toBe("left bottom");

                bgPosition = fixers.alignTypeToBgPosition(imageClientApi.alignTypes.BOTTOM_RIGHT);

                expect(bgPosition).toBe("right bottom");

                bgPosition = fixers.alignTypeToBgPosition("unsupported alignment");

                expect(bgPosition).toBe("center");
            });
        });
    });

});
