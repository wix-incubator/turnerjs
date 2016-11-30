define([], function() {
    'use strict';
    var global;

    function setState(globalContext) {

        if (globalContext) {
            global = globalContext;
        }
    }

    function isMobileView() {
        // global.rendered is the WixSite instance, this should be refactored once we have some other
        // standard way for accessing it
        return global.rendered.props.siteData.isMobileView();
    }

    function siteIsReady() {
        return Boolean(global.rendered && global.rendered.siteIsReady);
    }

    function isPublicViewer() {
        // TODO: change this when we have an editor on top of Santa.
        return true;
    }

    function isEditorInPreviewMode() {
        // TODO NMO 8/20/14 12:42 PM - change this when we have an editor on top of Santa.
        return false;
    }

    function getCurrentUrlPageId() {
        return global.rendered.props.siteData.getCurrentUrlPageId();
    }

    return {
        setState: setState,
        isMobileView: isMobileView,
        isPublicViewer: isPublicViewer,
        isEditorInPreviewMode: isEditorInPreviewMode,
        siteIsReady: siteIsReady,
        getCurrentUrlPageId: getCurrentUrlPageId,
        /**@deprecated*/
        getCurrentPageId: getCurrentUrlPageId
    };
});
