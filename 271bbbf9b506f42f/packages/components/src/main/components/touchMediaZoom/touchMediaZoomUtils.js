define([], function () {
    'use strict';

    function createStageData (overlap) {
        return {
            leftPart_leftMargin: calcContentLeft(overlap, 0),
            leftPart_begin: calcContentCenter(overlap, 0),
            leftPart_rightMargin: calcContentRight(overlap, 0),

            centerPart_leftMargin: calcContentLeft(overlap, 1),
            centerPart_begin: calcContentCenter(overlap, 1),
            centerPart_rightMargin: calcContentRight(overlap, 1),

            rightPart_leftMargin: calcContentLeft(overlap, 2),
            rightPart_begin: calcContentCenter(overlap, 2),
            rightPart_rightMargin: calcContentRight(overlap, 2),

            fullWidth: calcContentCenter(overlap, 3)
        };
    }

    function calcContentLeft (overlap, index){
        return index * (1 + overlap);
    }

    function calcContentCenter (overlap, index){
        return index * (1 + overlap) + overlap;
    }

    function calcContentRight (overlap, index){
        return index * (1 + overlap) + 2 * overlap;
    }

    function clamp (val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    function calcImageSize (params) {
        var wScale = Math.min(params.viewport.width / params.imageDimensions.width, 1);
        var hScale = Math.min(params.viewport.height / params.imageDimensions.height, 1);
        var targetScale = Math.min(wScale, hScale);
        return {
            width: Math.round(params.imageDimensions.width * targetScale),
            height: Math.round(params.imageDimensions.height * targetScale)
        };
    }

    return {
        createStageData: createStageData,
        clamp: clamp,
        calcImageSize: calcImageSize
    };
});
