define(['lodash'], function (_) {
    "use strict";

    function cleanPage(documentServices, pageRef) {
        var pageChildren = documentServices.components.getChildren(pageRef);
        _.forEach(pageChildren, function (compRef) {
            documentServices.components.remove(compRef);
        });
    }

    function waitForChangesApplied(documentServices) {
        return new Promise(function (resolve) {
            documentServices.waitForChangesApplied(resolve);
        });
    }

    function getPageDataById(documentServices, pageId) {
        var pagesData = documentServices.pages.getPagesData();
        return _.find(pagesData, {id: pageId});
    }


    function getPopupDataById(documentServices, popupId) {
        var popupData = documentServices.pages.popupPages.getDataList();
        return _.find(popupData, {id: popupId});
    }

    function getButtonsElementsWithTitle(documentServices, document, title) {
        return getPageComponentsByType(documentServices, "wysiwyg.viewer.components.SiteButton")
            .filter(function (comp) {
                var buttonWrapper = document.getElementById(comp.id);
                if (buttonWrapper) {
                    var button = buttonWrapper.getElementsByTagName('a')[0];
                    return button.text === title;
                }

                return false;
            }).map(function (comp) {
                var buttonWrapper = document.getElementById(comp.id);
                return buttonWrapper.getElementsByTagName('a')[0];
            });
    }

    function getPageComponentsByType(documentServices, type) {
        var focusedPage = documentServices.pages.getFocusedPage();
        var pageComponents = documentServices.components.getChildren(focusedPage);

        return pageComponents.filter(function (comp) {
            var compType = documentServices.components.getType(comp);
            return compType === type;
        });
    }

    return {
        getButtonsElementsWithTitle: getButtonsElementsWithTitle,
        getPageComponentsByType: getPageComponentsByType,
        cleanPage: cleanPage,
        getPageDataById: getPageDataById,
        getPopupDataById: getPopupDataById,
        waitForChangesApplied: waitForChangesApplied
    };
});
