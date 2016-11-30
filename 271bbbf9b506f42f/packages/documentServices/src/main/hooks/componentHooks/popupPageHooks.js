define([
    'lodash',
    'documentServices/actionsAndBehaviors/actionsAndBehaviors',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/page/page'
], function (
    _,
    actionsAndBehaviors,
    documentInfo,
    page
) {
    'use strict';

    function getContainerToAddTo(ps, containerPointer) {
        if (ps.pointers.components.isPage(containerPointer) && page.popupPages.isPopup(ps, containerPointer.id)){
            return page.popupPages.getCurrentMainContainer(ps);
        }

        return containerPointer;
    }

    function removeDeadBehaviors(ps, popupPointer) {
        var isPopup = page.popupPages.isPopup(ps, popupPointer.id);
        if (!isPopup) {
            return;
        }

        var viewMode = documentInfo.getViewMode(ps);
        var pagePointers = page.getPageIdList(ps, true).map(function (pageId) {
            return ps.pointers.components.getPage(pageId, viewMode);
        });

        pagePointers.forEach(function (pagePointer) {
            actionsAndBehaviors.removeComponentsBehaviorsWithFilter(ps, pagePointer, {behavior: {targetId: popupPointer.id}});
        });
    }

    function removeBehaviorsFromAddedPage(ps, pagePointer){
        actionsAndBehaviors.removeComponentsBehaviorsWithFilter(ps, pagePointer, {behavior: {name: 'openPopup'}});
    }

    return {
        getContainerToAddTo: getContainerToAddTo,
        removeDeadBehaviors: removeDeadBehaviors,
        removeBehaviorsFromAddedPage: removeBehaviorsFromAddedPage
    };
});
