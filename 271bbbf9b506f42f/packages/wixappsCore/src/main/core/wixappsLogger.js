define(['lodash', 'utils'], function(_, utils){
    'use strict';
    var logger = utils.logger;

    var classifications = {
        LISTS_EVENT_SOURCE: 60,
        Type: {ERROR: 10, USER_ACTION: 40},
        Category: {EDITOR: 1, VIEWER: 2, CORE: 3, SERVER: 4},
        issue: {GENERAL: 0, PROXY: 1, APP_LOGIC: 2, DATA_SERVICE: 3, DATA_ITEMS: 4, CORE_WIRING: 5, DATA_EDITING: 6, APP_BUILDER: 7, APP_REPO_SERVICE: 8},
        Severity: {RECOVERABLE: 10, WARNING: 20, ERROR: 30, FATAL: 40}
    };

    var errors = {
        /**
         * Add new ERRORS here!
         */
        GENERIC_ERROR: {errorCode: -20000, desc: "WixApps unspecified error"},
        APP_PART2_FAILED_TO_LOAD: {errorCode: -20011, desc: "Failed to load app part", issue: classifications.issue.APP_BUILDER},
        DATA_SELECTOR_CONTAINS_NULL: {errorCode: -20013, desc: "A data selector returned from the server with a null id key.", issue: classifications.issue.APP_BUILDER},
        MISSING_PERMALINK: {errorCode: -22041, desc: 'Site data is missing the permalink data item'},
        REQUEST_FAILED: {errorCode: -1, desc: 'Unspecified error occurred, possibly a connection problem'}
    };

    logger.register('wixapps', 'error', errors);

    var events = {
        /**
         * Add new EVENTS here!
         */
        APP_BUILDER_PART_LOADED: {eventId: 103, desc: "App builder - part loaded in published", params: {c2: 'appPartName', 'g2': 'userId'}},
        APP_PART2_FAILED_TO_LOAD_DATA_SELECTOR: {eventId: 135, desc: "Failed to load data selector", params: {c1: 'dataSelector'}},
        APP_PART2_FAILED_TO_LOAD_PART_DEFINITION: {eventId: 136, desc: "Failed to load app part definition"}, // TODO: event isn't being used anywhere
        VIEW_DEFINITION_NOT_FOUND: {eventId: 137, desc: "Failed to load view definition"}, // TODO: event isn't being used anywhere
        TAG_SELECTED_IN_VIEWER: {eventId: 305, desc: "User selected a tag in the viewer."}
    };

    logger.register('wixapps', 'event', events);

    var errorDefaultValues = {
        desc: errors.GENERIC_ERROR.desc,
        errorCode: errors.GENERIC_ERROR.errorCode,
        type: classifications.Type.ERROR,
        issue: classifications.issue.GENERAL,
        severity: classifications.Severity.ERROR,
        category: classifications.Category.VIEWER,
        src: classifications.LISTS_EVENT_SOURCE
    };

    var eventDefaultValues = {
        type: classifications.Type.USER_ACTION,
        adapter: 'lists',
        category: classifications.Category.VIEWER,
        src: classifications.LISTS_EVENT_SOURCE
    };

    function reportError(siteData, errorData, params){
        try {
            var error = _.defaults({}, errorData, errorDefaultValues);
            logger.reportBI(siteData, error, params);
        } catch (e){} //eslint-disable-line no-empty
    }

    function reportEvent(siteData, eventData, params){
        try {
            var event = _.defaults({}, eventData, eventDefaultValues);
            logger.reportBI(siteData, event, params);
        } catch (e){
            // empty
        }
    }

    /**
     * @class wixappsCore.wixappsLogger
     */
    return {
        events: events,
        errors: errors,
        reportError: reportError,
        reportEvent: reportEvent
    };
});