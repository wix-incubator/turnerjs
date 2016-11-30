define(['lodash', 'utils',
        'documentServices/structure/utils/componentLayout'],
    function (_, utils, componentLayout) {
        'use strict';

        var NON_MOVABLE_DATA_ITEMS = ['MAIN_MENU', 'CUSTOM_MAIN_MENU', 'CUSTOM_MENUS', 'masterPage'];

        function canMoveDataItemToAnotherPage(dataItemId) {
            return !_.includes(NON_MOVABLE_DATA_ITEMS, dataItemId);
        }

        function getLayoutFromBoundingLayout(privateServices, boundingLayout, currentRotationInDegrees){
            return utils.boundingLayout.getLayoutFromBoundingLayout(boundingLayout, currentRotationInDegrees);
        }

        function ensureWithinLimits(value, min, max){
            min = _.isUndefined(min) ? value : min;
            max = _.isUndefined(max) ? value : max;
            if (min > max){
                throw 'min limit is greater than max limit';
            }

            if (value < min) {
                return min;
            }
            if (value > max){
                return max;
            }

            return value;
        }

        /**
         *  @exports documentServices/structure/structureUtils
         */
        return {
            isHorizontallyDocked: utils.layout.isHorizontallyDocked,
            isVerticallyDocked: utils.layout.isVerticallyDocked,
            getBoundingY: utils.boundingLayout.getBoundingY,
            getBoundingX: utils.boundingLayout.getBoundingX,
            getBoundingHeight: utils.boundingLayout.getBoundingHeight,
            getBoundingWidth: utils.boundingLayout.getBoundingWidth,
            getBoundingLayout: componentLayout.getBoundingLayout,
            getLayoutFromBoundingLayout: getLayoutFromBoundingLayout,
            canMoveDataItemToAnotherPage: canMoveDataItemToAnotherPage,
            ensureWithinLimits: ensureWithinLimits,
            getComponentLayout: componentLayout.getComponentLayout,
            getPositionAndSize: componentLayout.getPositionAndSize
        };
    });
