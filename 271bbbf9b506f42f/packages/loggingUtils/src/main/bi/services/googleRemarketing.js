define(['lodash'], function(_){
    'use strict';

    var loaded = false;

    var remarketingParams = {
        google_custom_params: {},
        google_remarketing_only: true
    };

    function initRemarketingPixel(accountId){
        if (loaded || !isValidAccountIdParam(accountId)){
            return;
        }

        _.assign(remarketingParams, {google_conversion_id: accountId[0]});
        insertGoogleRemarketingScript();
        loaded = true;
    }

    function isValidAccountIdParam(accountId) {
        return _.isArray(accountId) && (accountId.length === 1) && Number(accountId[0]);
    }

    function insertGoogleRemarketingScript() {
        var scriptElem = window.document.createElement('script');
        scriptElem.type = 'text/javascript';
        scriptElem.src = '//www.googleadservices.com/pagead/conversion_async.js';
        scriptElem.async = true;
        scriptElem.setAttribute('onload', 'google_trackConversion(' + JSON.stringify(remarketingParams) + ')');

        var s = window.document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(scriptElem, s);
    }

    function fireRemarketingPixel(){
        if (loaded && window.google_trackConversion) {
            window.google_trackConversion(remarketingParams);
        }
    }


    return {
        initRemarketingPixel: initRemarketingPixel,
        fireRemarketingPixel: fireRemarketingPixel
    };
});
