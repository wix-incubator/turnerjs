define(['lodash',
    'documentServices/structure/utils/layoutConstraintsUtils',
    'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/component/component'], function (_, layoutConstraintsUtils, componentsMetaData, component) {
    'use strict';

    function getRowMargin(ps, columnsContainerCompPtr) {
        return component.properties.get(ps, columnsContainerCompPtr).rowMargin;
    }

    function isShortening(currColumnsContainerLayout, newLayout) {
        return _.isNumber(newLayout.height) && newLayout.height < currColumnsContainerLayout.height;
    }

    function isShorteningFromBottom(currColumnsContainerLayout, newLayout) {
        if (!isShortening(currColumnsContainerLayout, newLayout)) {
            return false;
        }

        return !_.isNumber(newLayout.y) || currColumnsContainerLayout.y === newLayout.y;
    }

    function getUpdatedLayoutForIndividualColumns(ps, columnsContainerCompPtr, updatedColumnsContainerLayout) {
        var currColumnsContainerLayout = component.layout.get(ps, columnsContainerCompPtr);
        var rowMargin = getRowMargin(ps, columnsContainerCompPtr);

        var layout = {
            height: updatedColumnsContainerLayout.height - rowMargin * 2
        };

        if (_.isNumber(updatedColumnsContainerLayout.y)) {
            layout.y = updatedColumnsContainerLayout.y - currColumnsContainerLayout.y + rowMargin;
        }

        return layout;
    }

    return function changeChildrenColumnsHeightBeforeContainer(ps, columnsContainerCompPtr, newLayoutToUpdate, updateCompLayoutFn/*, isTriggeredByHook*/) {
        var columnPtrs = component.getChildren(ps, columnsContainerCompPtr);
        var currColumnsContainerLayout = component.layout.get(ps, columnsContainerCompPtr);
        var isMultiColumns = columnPtrs.length > 1;

        var isChangingHeight = _.isNumber(newLayoutToUpdate.height) && newLayoutToUpdate.height !== currColumnsContainerLayout.height;
        if (!isChangingHeight || (isMultiColumns && ps.siteAPI.isMobileView())) {
            return;
        }

        var isShorteningContainer = isShortening(currColumnsContainerLayout, newLayoutToUpdate);

        var updatedColumnsLayout = getUpdatedLayoutForIndividualColumns(ps, columnsContainerCompPtr, newLayoutToUpdate);
        updatedColumnsLayout.y = _.isUndefined(updatedColumnsLayout.y) ? component.layout.get(ps, columnPtrs[0]).y : updatedColumnsLayout.y;

        _.forEach(columnPtrs, function (columnPtr) {
            var isEnforcingByWidth = componentsMetaData.public.isEnforcingContainerChildLimitationsByWidth(ps, columnPtr);
            var isEnforcingByHeight = componentsMetaData.public.isEnforcingContainerChildLimitationsByHeight(ps, columnPtr);

            layoutConstraintsUtils.constrainByChildrenLayout(ps, columnPtr, updatedColumnsLayout, !isEnforcingByWidth, !isEnforcingByHeight);
        });

        _.forEach(columnPtrs, function (columnPtr) {
            updateCompLayoutFn(ps, columnPtr, updatedColumnsLayout);

            if (isShorteningContainer) {
                var rowMargin = getRowMargin(ps, columnsContainerCompPtr);

                // constrain the parent columnsContainer when it resizes
                if (isShorteningFromBottom(currColumnsContainerLayout, newLayoutToUpdate)) {
                    updateCompLayoutFn(ps, columnPtr, {y: updatedColumnsLayout.y + rowMargin});
                } else {
                    updateCompLayoutFn(ps, columnPtr, {y: updatedColumnsLayout.y - rowMargin});
                }
            }
        });
    };
});
