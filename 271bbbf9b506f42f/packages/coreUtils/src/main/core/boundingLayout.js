define(['lodash'], function (_) {
    'use strict';

    function roundToNearestHalf(num) {
        return Math.round(num * 2) / 2;
    }

    function degreesToRadians(angleInDegrees) {
        return angleInDegrees * Math.PI / 180;
    }

    function getBoundingWidthWithRotation(layout, angleInRadians){
        var boundingWidthWithRotation = Math.abs(layout.width * Math.cos(angleInRadians)) + Math.abs(layout.height * Math.sin(angleInRadians));
        return roundToNearestHalf(boundingWidthWithRotation);
    }

    /**
     * @returns {number} the bounding width according to given params.
     *  @param {layout} layout - layout object containing height,width,x,y,angle
     */
    function getBoundingWidth(layout) {
        if (layout.rotationInDegrees === 0) {
            return layout.width;
        }
        var currentAngleInRadians = degreesToRadians(layout.rotationInDegrees);
        return getBoundingWidthWithRotation(layout, currentAngleInRadians);
    }

    function getBoundingHeightWithRotation(layout, angleInRadians){
        var boundingHeightWithRotation = Math.abs(layout.width * Math.sin(angleInRadians)) + Math.abs(layout.height * Math.cos(angleInRadians));
        return roundToNearestHalf(boundingHeightWithRotation);
    }
    /**
     * @returns {number} the bounding height according to given params. If angleInRadians === 0, return value === height
     *  @param {layout} layout - layout object containing height,width,x,y,angle
     */
    function getBoundingHeight(layout) {
        if (!layout.rotationInDegrees) {
            return layout.height;
        }
        var currentAngleInRadians = degreesToRadians(layout.rotationInDegrees);
        return getBoundingHeightWithRotation(layout, currentAngleInRadians);
    }

    /**
     * @returns {number} the bounding box's x according to given params. If the component isn't rotated boundingX === component.x
     *  @param {layout} layout - layout object containing height,width,x,y,angle
     */
    function getBoundingX(layout) {
        if (layout.rotationInDegrees === 0) {
            return layout.x;
        }
        var boundingWidth = getBoundingWidth(layout);
        return getXAfterRotation(layout, boundingWidth);
    }

    /**
     * @returns {number} the bounding box's y according to given params. If the component isn't rotated boundingY === component.y
     *  @param {layout} layout - layout object containing height,width,x,y,angle
     */
    function getBoundingY(layout) {
        if (!layout.rotationInDegrees) {
            return layout.y;
        }
        var boundingHeight = getBoundingHeight(layout);
        return getYAfterRotation(layout, boundingHeight);
    }

    function getXAfterRotation(layout, rotatedWidth) {
        return roundToNearestHalf(layout.x - (rotatedWidth - layout.width) / 2);
    }

    function getYAfterRotation(layout, rotatedHeight){
        return roundToNearestHalf(layout.y - (rotatedHeight - layout.height) / 2);
    }

    function rotateAndGetBoundingLayout(layout, rotationInDegrees){
        if (rotationInDegrees === 0) {
            return _.pick(layout, ['x', 'y', 'width', 'height']);
        }

        var angleInRadians = degreesToRadians(rotationInDegrees);
        var boundingWidth = getBoundingWidthWithRotation(layout, angleInRadians);
        var boundingHeight = getBoundingHeightWithRotation(layout, angleInRadians);
        return {
            x: getXAfterRotation(layout, boundingWidth),
            y: getYAfterRotation(layout, boundingHeight),
            width: boundingWidth,
            height: boundingHeight
        };
    }

    function getBoundingLayout(layout){
        return rotateAndGetBoundingLayout(layout, layout.rotationInDegrees || 0);
    }

    function getLayoutFromBoundingLayout(boundingLayout, currentRotationInDegrees){
        var layout = rotateAndGetBoundingLayout(boundingLayout, -currentRotationInDegrees); //we rotate it the reverse of the current rotations, and get the new bounding layout
        layout.rotationInDegrees = currentRotationInDegrees;
        return layout;
    }
    /**
     *  @exports documentServices/structure/structureUtils
     */
    return {
        getBoundingY: getBoundingY,
        getBoundingX: getBoundingX,
        getBoundingHeight: getBoundingHeight,
        getBoundingWidth: getBoundingWidth,
        getBoundingLayout: getBoundingLayout,
        getLayoutFromBoundingLayout: getLayoutFromBoundingLayout
    };
});
