define([], function () {
    'use strict'

    var editorAPI

    function init(global) {
        editorAPI = global.rendered.editorAPI
    }

    function closeAllPanels() {
        editorAPI.panelManager.closeAllPanels()
    }

    function getCompById(compId) {
        return editorAPI.components.get.byId(compId, editorAPI.pages.getCurrentPageId())
    }

    function getPageTitle(pageId) {
        var pageData = editorAPI.pages.data.get(pageId);
        return pageData ? pageData.title : null;
    }


    function getCurrentPageRef() {
        return editorAPI.pages.getCurrentPage();
    }

    function undo() {
        return editorAPI.history.undo()
    }

    function waitForChangesApplied() {
        return new Promise(function (resolve) {
            editorAPI.waitForChangesApplied(function () {
                resolve();
            });
        });
    }

    function getOpenPanels() {
        return editorAPI.panelManager.getOpenPanels()
    }

    function deleteFile(path) {
        var fs = editorAPI.wixCode.fileSystem
        var fd = fs.getVirtualDescriptor(path)

        return fs.deleteItem(fd)
    }

    function closePagesPanel() {
        editorAPI.closePagesPanel();
    }

    return {
        init: init,
        getCompById: getCompById,
        getPageTitle: getPageTitle,
        closeAllPanels: closeAllPanels,
        getOpenPanels: getOpenPanels,
        deleteFile: deleteFile,
        undo: undo,
        waitForChangesApplied: waitForChangesApplied,
        getCurrentPageRef: getCurrentPageRef,
        closePagesPanel: closePagesPanel
    }
})


