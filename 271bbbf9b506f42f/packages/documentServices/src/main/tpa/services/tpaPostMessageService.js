define(['tpa',
    'experiment',
    'documentServices/tpa/handlers/tpaHandlers',
    'documentServices/tpa/services/clientSpecMapService'], function (tpa, experiment, handlers, clientSpecMapService) {

    'use strict';

    var tpaPostMessageCommon = tpa.common.tpaPostMessageCommon;

    var shouldHandleMessage = function(ps, siteAPI, msg) {

        var documentServicesHandlersThatAreCalledFromAppIframe = {
            isSupported: true,
            registerEventListener: true,
            getInstalledInstance: true,
            resizeComponent: true
        };

        var documentServicesHandlersThatOverridesViewerHandlers = {
            siteInfo: true,
            getSectionUrl: true,
            getStateUrl: true,
            navigateToPage: true,
            getExternalId: true,
            getValue: true,
            getValues: true,
            getCurrentPageAnchors: true,
            getComponentInfo: true,
            navigateToSectionPage: true,
            getSitePages: true
        };

        var tpaEditorPreviewHandlers = {
            openSettingsDialog: true
        };

        var documentServicesHandlersThatAvailableOnlyInEditor = {
            setValue: true,
            removeValue: true
        };

        var superAppsOnlyHandlers = {
            getInstalledInstance: true
        };

        var editorPreviewHandler = tpaEditorPreviewHandlers[msg.type];
        var documentServicesHandlers = documentServicesHandlersThatAreCalledFromAppIframe[msg.type];
        var documentServicesHandlersThatOverrideViewer = documentServicesHandlersThatOverridesViewerHandlers[msg.type];
        var fromSettings = isFromSettings(msg);
        var componentViewModePointer = ps.pointers.general.getRenderFlag('componentViewMode');
        var componentViewMode = ps.dal.get(componentViewModePointer);
        var documentServicesHandlersAvailableInEditor = documentServicesHandlersThatAvailableOnlyInEditor[msg.type] && componentViewMode === 'editor';
        var isAppAllowedMethod = !superAppsOnlyHandlers[msg.type] || clientSpecMapService.isSuperAppByCompId(ps, siteAPI, msg.compId);

        return (documentServicesHandlersThatOverrideViewer ||
            documentServicesHandlers ||
            editorPreviewHandler ||
            fromSettings ||
            documentServicesHandlersAvailableInEditor) &&
            isAppAllowedMethod &&
            handlers[msg.type];
    };

    var isFromSettings = function (msg) {
        return msg.originFrame === "editor";
    };

    var callHandler = function (ps, siteAPI, msg, response) {
        var msgType = tpaPostMessageCommon.fixOldPingPongMessageType(msg.type);

        if (shouldHandleMessage(ps, siteAPI, msg)) {
            handlers[msgType].apply(this, [ps, siteAPI, msg, response]);
            if (experiment.isOpen('sv_SendSdkMethodBI')) {
                var origin = isFromSettings(msg) ? 'editor' : 'preview';
                tpa.common.bi.sendBIEvent(msg, siteAPI, origin);
            }
        }
    };

    var init = function (ps, siteAPI) {
        window.addEventListener('message', tpaPostMessageCommon.handleTPAMessage.bind(this, ps, siteAPI, callHandler), false);
    };

    return {
        init: init,
        callHandler: callHandler
    };
});
