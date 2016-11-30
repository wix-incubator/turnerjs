define(['lodash',
    'documentServices/component/component'], function (_, component) {
    'use strict';

    function getRowMargin(ps, columnsContainerCompPtr) {
        return component.properties.get(ps, columnsContainerCompPtr).rowMargin;
    }

    return function changeColumnsContainerHeight(ps, columnPtr, newLayoutToUpdate, updateCompLayoutFn, isTriggeredByHook) {
        if (isTriggeredByHook || !_.isNumber(newLayoutToUpdate.height) || ps.siteAPI.isMobileView()) {
            return;
        }

        var columnsContainerPtr = component.getContainer(ps, columnPtr);
        var rowMargins = getRowMargin(ps, columnsContainerPtr);

        var parentLayoutUpdate = {
            height: newLayoutToUpdate.height + 2 * rowMargins
        };

        updateCompLayoutFn(ps, columnsContainerPtr, parentLayoutUpdate);
    };
});
