define([
    'documentServices/constants/constants'
], function(
    constants
) {
    'use strict';

    return {

        /**
         *  returns document's view mode (mobile or desktop)- i.e the view that's rendered, regardless of the displaying device
         *  @param {PrivateDocumentServices} privateServices
         *  @returns {string} specifying MOBILE or DESKTOP
         */
        getViewMode: function (privateServices){
            return privateServices.siteAPI.isMobileView() ? constants.VIEW_MODES.MOBILE : constants.VIEW_MODES.DESKTOP;
        },

        isMobileView: function (privateServices){
            return privateServices.siteAPI.isMobileView();
        }
    };
});