define([
    'documentServices/constants/constants',
    'documentServices/dataModel/dataModel',
    'documentServices/componentsMetaData/metaDataUtils'
], function(
    constants,
    dataModel,
    metaDataUtils
) {
    'use strict';

    function moveDirections(isFullWidth) {
        var directions = [constants.MOVE_DIRECTIONS.VERTICAL];
        if (!isFullWidth) {
            directions.push(constants.MOVE_DIRECTIONS.HORIZONTAL);
        }
        return directions;
    }

    function getResizableSides(ps, compPointer){
        if (!isCompFullWidth(ps, compPointer)){
            return [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT];
        }
        return [];
    }

    function moveDirectionsByPointer (ps, compPointer) {
        return moveDirections(isCompFullWidth(ps, compPointer));
    }

    function isCompFullWidth(ps, compPointer){
        return !!dataModel.getPropertiesItem(ps, compPointer).fitToScreenWidth;
    }

    function isCompFullWidthByStructure (ps, compStructure) {
        return !!compStructure.props.fitToScreenWidth;
    }

    var metaData = {
        moveDirections: moveDirectionsByPointer,
        resizableSides: getResizableSides,
        fullWidth: isCompFullWidth,
        fullWidthByStructure: isCompFullWidthByStructure,
        containableByStructure: metaDataUtils.containableByFullWidthPopup
    };

    return metaData;
});
