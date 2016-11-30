define([
    'lodash',
    'documentServices/constants/constants'
], function (
    _,
    consts
){
    'use strict';

    var MIN_WIDTH = 50;
    var MIN_HEIGHT = 50;

    return {
        styleCanBeApplied: false,
        moveDirections: [],
        canBeFixedPosition: false,
        duplicatable: false,
        groupable: false,
        removable: false,
        enforceContainerChildLimitsByWidth: false,
        enforceContainerChildLimitsByHeight: false,
        layoutLimits: {
            minWidth: MIN_WIDTH,
            minHeight: MIN_HEIGHT
        },
        resizableSides: function (ps, pointer) {
            var LEFT = consts.RESIZE_SIDES.LEFT,
                RIGHT = consts.RESIZE_SIDES.RIGHT,
                BOTTOM = consts.RESIZE_SIDES.BOTTOM,
                TOP = consts.RESIZE_SIDES.TOP,
                compStructure = ps.dal.get(pointer),
                compPropsPointer = ps.pointers.data.getPropertyItem(compStructure.propertyQuery),
                compProps = ps.dal.get(compPropsPointer),
                nineGridMap = {
                    left: {
                        top: [BOTTOM, RIGHT],
                        center: [BOTTOM, RIGHT],
                        bottom: [TOP, RIGHT]
                    },
                    center: {
                        top: [BOTTOM, RIGHT, LEFT],
                        center: [TOP, BOTTOM, RIGHT, LEFT],
                        bottom: [TOP, RIGHT, LEFT]
                    },
                    right: {
                        top: [BOTTOM, LEFT],
                        center: [BOTTOM, LEFT],
                        bottom: [TOP, LEFT]
                    }
                },
                fullHeightMap = {
                    left: [RIGHT],
                    center: [RIGHT, LEFT],
                    right: [LEFT]
                },
                fullWidth = {
                    top: [BOTTOM],
                    center: [TOP, BOTTOM],
                    bottom: [TOP]
                },
                sidesMap = {
                    nineGrid: function () {
                        return nineGridMap[compProps.horizontalAlignment][compProps.verticalAlignment];
                    },
                    fullHeight: function () {
                        return fullHeightMap[compProps.horizontalAlignment];
                    },
                    fullWidth: function () {
                        return fullWidth[compProps.verticalAlignment];
                    }
                };

            return sidesMap[compProps.alignmentType]();
        },
        defaultMobileProperties: function (ps, comp, desktopProps) {
            return {
                horizontalAlignment: desktopProps.alignmentType === 'nineGrid' ? 'center' : desktopProps.horizontalAlignment,
                horizontalOffset: 0,
                verticalOffset: 0
            };
        }
    };
});
