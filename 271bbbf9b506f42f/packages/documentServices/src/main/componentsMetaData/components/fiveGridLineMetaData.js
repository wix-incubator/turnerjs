define(['lodash', 'documentServices/dataModel/dataModel', 'documentServices/constants/constants', 'utils'], function (_, dataModel, constants, utils) {
    'use strict';

    function isStretched(ps, componentPointer) {
        var compLayoutPointer = ps.pointers.getInnerPointer(componentPointer, 'layout');
        var compLayout = ps.dal.get(compLayoutPointer);

        return utils.dockUtils.isStretched(compLayout);
    }

    function isHorizontallyStretchedToScreen(ps, componentPointer) {
        var compLayoutPointer = ps.pointers.getInnerPointer(componentPointer, 'layout');
        var compLayout = ps.dal.get(compLayoutPointer);
        return utils.dockUtils.isHorizontalDockToScreen(compLayout);
    }


    function moveDirections(isFullWidth) {
        if (isFullWidth) {
            return [constants.MOVE_DIRECTIONS.VERTICAL];
        }

        return [constants.MOVE_DIRECTIONS.HORIZONTAL, constants.MOVE_DIRECTIONS.VERTICAL];
    }

    var metaData = {


        styleCanBeApplied:true,
        rotatable: function (ps, compPointer) {
            return !isStretched(ps, compPointer);
        },

        resizableSides: function (/*ps, compPointer*/) {
            return [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT];
        },

        moveDirections: function (ps, compPointer) {
            return moveDirections(isStretched(ps, compPointer));
        },

        fullWidth: function(ps, compPointer){
            return isHorizontallyStretchedToScreen(ps, compPointer);
        },

        fullWidthByStructure: function(ps, compStructure){
            return !!utils.dockUtils.isHorizontalDockToScreen(compStructure.layout);
        },

        canBeStretched: true
    };

    return metaData;
});
