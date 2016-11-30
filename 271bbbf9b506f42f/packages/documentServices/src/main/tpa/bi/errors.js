define(['lodash', 'utils'], function(_, utils){
    'use strict';
    var logger = utils.logger;

    var errors = {

        EVENT_TYPE_NOT_SUPPORTED: {
            errorName: 'EVENT_TYPE_NOT_SUPPORTED',
            errorCode: 28004,
            desc: 'tpa event type is not supported',
            severity: "error"
        },

        ECOM_HIDDEN_PAGES_MISSING: {
            errorName: 'ECOM_HIDDEN_PAGES_MISSING',
            errorCode: 28005,
            desc: 'ecom pages are missing after save',
            severity: "error"
        },

        FAIL_TO_GET_APP_MARKET_DATA: {
            errorName: 'FAIL_TO_GET_APP_MARKET_DATA',
            errorCode: 28006,
            desc: 'failure while trying to get app market data',
            severity: "error"
        }
    };

    logger.register('documentServices', 'error', errors);

    return errors;
});
