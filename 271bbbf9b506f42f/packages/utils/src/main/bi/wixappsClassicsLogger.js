define(['loggingUtils'], function(loggingUtils){
    'use strict';
    var logger = loggingUtils.logger;

    var classifications = {
        CLASSICS_EVENT_SOURCE: 12,
        Type: {ERROR: 10, TIMING: 20, FUNNEL: 30, USER_ACTION: 40},
        Category: {EDITOR: 1, VIEWER: 2, CORE: 3, SERVER: 4},
        Issue: {SERVER_EDITOR_ERROR: 0, SERVER_VIEWER_ERROR: 1, CLIENT_EDITOR_ERROR: 2, CLIENT_VIEWER_ERROR: 4},
        Severity: {RECOVERABLE: 10, WARNING: 20, ERROR: 30, FATAL: 40}
    };

    var errors = {
        /**
         * Add new ERRORS here!
         */
        GENERIC_ERROR: {code: -20000, description: "classics unspecified error"},
        APP_PART_FAILED_TO_LOAD: {errorCode: -20011, desc: "Failed to load app part", issue: classifications.Issue.CLIENT_VIEWER_ERROR}
    };

    logger.register('{%= name %}', 'error', errors);

    var events = {
        /**
         * Add new EVENTS here!
         */
        APP_PART_BEFORE_LOAD: {eventId: 500, description: "classics - part start loading", params: {c2: 'component_id', 'g2': 'visitor_id'}},
        APP_PART_AFTER_LOAD: {eventId: 501, description: "classics - part loaded", params: {c2: 'component_id', 'g2': 'visitor_id', 'loading_time': 'loading_time'}},
        APP_PART_LOADING_STAGES: {
            adapter: 'blog-ugc',
            description: 'measure time for a stage',
            eventId: 511,
            params: {
                component_id: 'component_id',
                component_type: 'component_type',
                startTime: 'startTime',
                endTime: 'endTime',
                stage_process: 'stage_process',
                site_id: 'site_id'
            },
            src: 12
        },
        SITE_PUBLISHED_WITH_BLOG: {eventId: 64, description: "site published with blog"},
        CATEGORY_CLICKED: {eventId: 502, description: "category clicked"},
        TAG_CLICKED: {eventId: 503, description: "tag clicked"},
        SHARE_CLICKED: {eventId: 504, description: "share clicked", params: {
                'type': 'type',
                'post_id': 'post_id'
            }
        },
        SINGLE_POST_LINK_CLICKED: {eventId: 505, description: "single post link clicked", params: {'post_id': 'post_id'}},
        SELECTION_SHARER_OPENED: {eventId: 507, description: "share part of text popup", params: {'post_id': 'post_id'}},
        SELECTION_SHARER_CLICKED: {eventId: 508, description: "share part of text click", params: {
                'type': 'type',
                'post_id': 'post_id'
            }
        },
        LIKE_CLICKED: {eventId: 512, description: "User click on like", params: {
                'like_status': 'like_status',
                'post_id': 'post_id'
            }
        }
    };

    logger.register('{%= name %}', 'event', events);

    function reportError(siteData, errorData, params){
        try {
            var error = {
                desc: errorData.description || errors.GENERIC_ERROR.description,
                errorCode: errorData.code || errors.GENERIC_ERROR.code,
                type: classifications.Type.ERROR,
                issue: errorData.Issue || classifications.Issue.CLIENT_VIEWER_ERROR,
                severity: errorData.severity || classifications.Severity.ERROR,
                category: errorData.category || classifications.Category.VIEWER,
                reportType: 'error',
                packageName: 'blog',
                src: classifications.CLASSICS_EVENT_SOURCE
            };

            params = params || {};
            logger.reportBI(siteData, error, params);
        } catch (e){
            // empty
        }
    }

    function reportEvent(siteData, eventData, params){
        try {
            var event = {
                type: classifications.Type.USER_ACTION,
                desc: eventData.description,
                eventId: eventData.eventId,
                adapter: eventData.adapter || 'blog-ugc',
                category: classifications.Category.VIEWER,
                reportType: 'event',
                packageName: 'blog',
                params: eventData.params || {},
                src: eventData.src || classifications.CLASSICS_EVENT_SOURCE
            };

            params = params || {};
            logger.reportBI(siteData, event, params);
        } catch (e){
            // empty
        }
    }

    /**
     * @class wixappsCore.wixappsClassicsLogger
     */
    return {
        events: events,
        errors: errors,
        reportError: reportError,
        reportEvent: reportEvent
    };
});
