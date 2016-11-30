define(['lodash', 'documentServices/mobileConversion/mobileConversionFacade'], function(_, mobileConversionFacade) {
    'use strict';

    return function convertMobileStructure(privateServices) {
        mobileConversionFacade.convertMobileStructure(privateServices, {commitConversionResults: privateServices.siteAPI.isMobileView()});
    };
});
