define([], function() {
   'use strict';

    function getIFrameForApp(url, appDef) {
        var iFrame = window.document.createElement('iframe');
        iFrame.style.display = 'none';
        iFrame.src = url;
        iFrame.className = 'wix-code-app';
        iFrame.setAttribute('data-app-id', appDef.applicationId);
        iFrame.setAttribute('data-app-definition-id', appDef.appDefinitionId);
        return iFrame;
    }

    function isIFrameEvent(iframe, event) {
        return event.source === iframe.contentWindow;
    }

    return {
        getIFrameForApp: getIFrameForApp,
        isIFrameEvent: isIFrameEvent
    };
});
