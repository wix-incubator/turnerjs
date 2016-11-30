define(['lodash', 'imageClientApi'], function (_, imageClientApi) {
    'use strict';

    var fittingTypes = imageClientApi.fittingTypes;
    var alignTypes = imageClientApi.alignTypes;

    var tilingMap = {
        "repeat-x": fittingTypes.TILE_HORIZONTAL,
        "repeat no_repeat": fittingTypes.TILE_HORIZONTAL,
        "repeat no-repeat": fittingTypes.TILE_HORIZONTAL,
        "repeat-y": fittingTypes.TILE_VERTICAL,
        "no_repeat repeat": fittingTypes.TILE_VERTICAL,
        "no-repeat repeat": fittingTypes.TILE_VERTICAL,
        "repeat": fittingTypes.TILE,
        "repeat repeat": fittingTypes.TILE,
        // Default (keep empty)
        '': ''
    };

    var fittingTypeMap = {
        'auto': function (tile) {
            return (tile) ? tile : fittingTypes.LEGACY_ORIGINAL_SIZE;
        },
        'cover': function () {
            return fittingTypes.SCALE_TO_FILL;
        },
        'contain': function (tile) {
            return (tile) ? fittingTypes.FIT_AND_TILE : fittingTypes.SCALE_TO_FIT;
        },
        // Default
        '': function () {
            return fittingTypes.SCALE_TO_FILL;
        }
    };

    var alignTypeMap = {
        "center center": alignTypes.CENTER,
        "center": alignTypes.CENTER,
        "50% 50%": alignTypes.CENTER,

        "top center": alignTypes.TOP,
        "center top": alignTypes.TOP,
        "50% 0%": alignTypes.TOP,

        "bottom center": alignTypes.BOTTOM,
        "center bottom": alignTypes.BOTTOM,
        "50% 100%": alignTypes.BOTTOM,

        "center right": alignTypes.RIGHT,
        "right center": alignTypes.RIGHT,
        "100% 50%": alignTypes.RIGHT,

        "center left": alignTypes.LEFT,
        "left center": alignTypes.LEFT,
        "0% 50%": alignTypes.LEFT,

        "left top": alignTypes.TOP_LEFT,
        "top left": alignTypes.TOP_LEFT,
        "0% 0%": alignTypes.TOP_LEFT,

        "right top": alignTypes.TOP_RIGHT,
        "top right": alignTypes.TOP_RIGHT,
        "100% 0%": alignTypes.TOP_RIGHT,

        "left bottom": alignTypes.BOTTOM_LEFT,
        "bottom left": alignTypes.BOTTOM_LEFT,
        "0% 100%": alignTypes.BOTTOM_LEFT,

        "right bottom": alignTypes.BOTTOM_RIGHT,
        "bottom right": alignTypes.BOTTOM_RIGHT,
        "100% 100%": alignTypes.BOTTOM_RIGHT,

        // Default
        '': alignTypes.CENTER
    };

    var fittingToRepeatMap = (function () {
        var map = {};
        map[fittingTypes.LEGACY_STRIP_TILE_HORIZONTAL] = 'repeat-x';
        map[fittingTypes.TILE_HORIZONTAL] = 'repeat-x';
        map[fittingTypes.LEGACY_STRIP_TILE_VERTICAL] = 'repeat-y';
        map[fittingTypes.TILE_VERTICAL] = 'repeat-y';
        map[fittingTypes.LEGACY_STRIP_TILE] = 'repeat';
        map[fittingTypes.TILE] = 'repeat';
        map[fittingTypes.FIT_AND_TILE] = 'repeat';

        // Default
        map[''] = 'no-repeat';
        return map;
    }());

    var fittingToBgMap = (function () {
        var map = {};
        map[fittingTypes.LEGACY_ORIGINAL_SIZE] = 'auto';
        map[fittingTypes.LEGACY_STRIP_ORIGINAL_SIZE] = 'auto';
        map[fittingTypes.SCALE_TO_FILL] = 'cover';
        map[fittingTypes.LEGACY_STRIP_SCALE_TO_FILL] = 'cover';
        map[fittingTypes.SCALE_TO_FIT] = 'contain';
        map[fittingTypes.LEGACY_STRIP_SCALE_TO_FIT] = 'contain';
        map[fittingTypes.FIT_AND_TILE] = 'contain';
        map[fittingTypes.LEGACY_STRIP_FIT_AND_TILE] = 'contain';

        // Default
        map[''] = 'auto';
        return map;
    }());

    var alignToPositionMap = (function () {
        var map = {};
        map[alignTypes.TOP] = 'center top';
        map[alignTypes.CENTER] = 'center';
        map[alignTypes.BOTTOM] = 'center bottom';

        map[alignTypes.TOP_LEFT] = 'left top';
        map[alignTypes.LEFT] = 'left center';
        map[alignTypes.BOTTOM_LEFT] = 'left bottom';

        map[alignTypes.TOP_RIGHT] = 'right top';
        map[alignTypes.RIGHT] = 'right center';
        map[alignTypes.BOTTOM_RIGHT] = 'right bottom';

        // Default
        map[''] = 'center';
        return map;
    }());

    /**
     * sometime css values are saved with spaces. here we are cleaning and making sure all values are lower case.
     * @param {string} value
     * @returns {string}
     */
    function cleanupDataStrings(value) {
        return (value || '').toLowerCase().trim();
    }

    function cssToFittingType(cssValues) {
        var bgRepeat = cleanupDataStrings(cssValues.bgRepeat);
        var bgSize = cleanupDataStrings(cssValues.bgSize);

        var tile = tilingMap[bgRepeat];
        return fittingTypeMap[bgSize] && fittingTypeMap[bgSize](tile);
    }

    function cssToAlignType(cssValues) {
        cssValues = cleanupDataStrings(cssValues);
        return alignTypeMap[cssValues];
    }

    function fittingTypeToBgRepeat(fittingType) {
        return fittingToRepeatMap[fittingType] || fittingToRepeatMap[''];
    }

    function fittingTypeToBgSize(fittingType) {
        return fittingToBgMap[fittingType] || fittingToBgMap[''];
    }

    function alignTypeToBgPosition(alignType) {
        return alignToPositionMap[alignType] || alignToPositionMap[''];
    }

    function migrateToLegacyFittings(fittingType) {
        if (fittingType === fittingTypes.TILE) {
            return fittingTypes.LEGACY_STRIP_TILE;
        } else if (fittingType === fittingTypes.TILE_HORIZONTAL) {
            return fittingTypes.LEGACY_STRIP_TILE_HORIZONTAL;
        } else if (fittingType === fittingTypes.TILE_VERTICAL) {
            return fittingTypes.LEGACY_STRIP_TILE_VERTICAL;
        } else if (fittingType === fittingTypes.SCALE_TO_FILL) {
            return fittingTypes.LEGACY_STRIP_SCALE_TO_FILL;
        } else if (fittingType === fittingTypes.SCALE_TO_FIT) {
            return fittingTypes.LEGACY_STRIP_SCALE_TO_FIT;
        } else if (fittingType === fittingTypes.FIT_AND_TILE) {
            return fittingTypes.LEGACY_STRIP_FIT_AND_TILE;
        } else if (fittingType === fittingTypes.LEGACY_ORIGINAL_SIZE) {
            return fittingTypes.LEGACY_STRIP_ORIGINAL_SIZE;
        }

        return fittingType;
    }


    return {
        cssToFittingType: cssToFittingType,
        cssToAlignType: cssToAlignType,
        fittingTypeToBgRepeat: fittingTypeToBgRepeat,
        fittingTypeToBgSize: fittingTypeToBgSize,
        alignTypeToBgPosition: alignTypeToBgPosition,
        migrateToLegacyFittings: migrateToLegacyFittings
    };
});
