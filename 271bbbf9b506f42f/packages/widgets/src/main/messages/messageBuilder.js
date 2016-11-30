define([], function() {
   'use strict';

    /**
     * @param widgetsIdAndType {{id: string, type: string}[]}
     * @param rootIds
     * @param routersMap
     * @returns {{handlerId: *, type: string, widgets: *}}
     */
    function loadWidgetsMessage(widgetsIdAndType, routersMap, rootIds) {
        return {
            type: 'load_widgets',
            widgets: widgetsIdAndType,
            rootIds: rootIds,
            routersMap: routersMap || {}
        };
    }

    /**
     *
     * @param controllers
     * @returns {{handlerId: string, type: string, widgets: *}}
     */
    function initWidgetsMessage(controllers) {
        return {
            type: 'init_widgets',
            controllers: controllers
        };
    }

    function startWidgetsMessage(contextIdToModelMap, siteInfo) {
        return {
            type: 'start_widgets',
            contexts: contextIdToModelMap,
            siteInfo: siteInfo
        };
    }

    /**
     *
     * @param widgetIds
     * @returns {{type: string, widgetIds: string[]}}
     */
    function stopWidgetsMessage(widgetIds) {
        return {
            type: 'stop_widgets',
            widgetIds: widgetIds
        };
    }

    /**
     *
     * @param contextId
     * @param componentUpdates
     * @returns {{type: string, widgetInstanceId: string, updates: *}}
     */
    function updateWidgetMessage(contextId, componentUpdates) {
        return {
            type: 'update',
            contextId: contextId,
            updates: componentUpdates
        };
    }

    return {
        loadWidgetsMessage: loadWidgetsMessage,
        initWidgetsMessage: initWidgetsMessage,
        startWidgetsMessage: startWidgetsMessage,
        stopWidgetsMessage: stopWidgetsMessage,
        updateWidgetMessage: updateWidgetMessage
    };
});
