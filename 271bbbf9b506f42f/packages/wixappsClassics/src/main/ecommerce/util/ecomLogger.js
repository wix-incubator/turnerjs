define(['utils'], function(utils){
    'use strict';
    var logger = utils.logger;

    var classifications = {
        ECOM_EVENT_SOURCE: 30,
        Type: {ERROR: 10, TIMING: 20, FUNNEL: 30, USER_ACTION: 40},
        Category: {EDITOR: 1, VIEWER: 2, CORE: 3, SERVER: 4},
        ErrorCategory: {FLASH_SITE: 1, HTML_SITE: 2, ECOMMERCE_STORE_MANAGE: 3},
        Issue: {SERVER_EDITOR_ERROR: 0, SERVER_VIEWER_ERROR: 1, CLIENT_EDITOR_ERROR: 2, CLIENT_VIEWER_ERROR: 4},
        Severity: {RECOVERABLE: 10, WARNING: 20, ERROR: 30, FATAL: 40}
    };

    var errors = {
        /**
         * Add new ERRORS here!
         */
        GENERIC_ERROR: {code: -20000, description: "ecommerce unspecified error"},
        ATNT_FIX: {code: 12345, description: "AT&T Fix - Sending Fallback Request"}

    };

    logger.register('{%= name %}', 'error', errors);

    var events = {
        /**
         * Add new EVENTS here!
         */
        PRODUCT_PAGE_VIEWED_BY_USER: {'id': 33, 'desc': "Product page viewed by the user", params: {c1: "itemId", c2: "referrer"}},
        USER_PROCEEDED_TO_CHECKOUT: {'id': 72, 'desc': "User proceeded to checkout", params: {c1: "cartId", c2: "checkoutSource"}}, //DONE
        PRODUCT_PAGE_VIEW_FROM_REFERRAL: {'id': 75, 'desc': "Product page viewed from referral"}, //DONE
        USER_SHARED_PRODUCT_PAGE: {'id': 76, 'desc': "User shared product page", params: {c1: 'productId', c2: 'service'}}, //DONE
        PRODUCT_PAGE_ADD_PRODUCT_TO_CART: {'id': 77, 'desc': "User added product to cart from product page", params: {c1: 'itemId'}}, //DONE
        ADD_TO_CART_BTN_ADD_PRODUCT_TO_CART: {'id': 78, 'desc': "User added product to cart from add to cart button", params: {c1: 'productId'}}, //DONE
        CHECKOUT_MESSAGE_UPGRADE_BUTTON_CLICK: {'id': 81, 'desc': "User clicked on upgrade button in checkout dialog."},
        FEEDBACK_MSG_CONTINUE_SHOPPING_BTN_CLICKED: {'id': 84, 'desc': "Feedback message - continue shopping button clicked", params: {c1: 'itemValue'}}, //DONE
        FEEDBACK_MSG_CHECKOUT_BTN_CLICKED: {'id': 85, 'desc': "Feedback message - checkout button clicked", params: {c1: 'itemValue'}}, //DONE
        MAGENTO_CLIENT_SUCCESS: {'id': 88, 'desc': "Measure success rate of all magento calls", params: {c1: 'action'}} //TODO add this to all requests fails.
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
                packageName: 'ecommerce',
                src: classifications.ECOM_EVENT_SOURCE
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
                eventId: eventData.id,
                adapter: 'ec2',
                category: classifications.Category.VIEWER,
                reportType: 'event',
                packageName: 'ecommerce',
                params: eventData.params || {},
                src: classifications.ECOM_EVENT_SOURCE
            };

            params = params || {};
            logger.reportBI(siteData, event, params);
        } catch (e){
            // empty
        }
    }

    /**
     * @class wixappsCore.ecomLogger
     */
    return {
        events: events,
        errors: errors,
        reportError: reportError,
        reportEvent: reportEvent
    };
});
