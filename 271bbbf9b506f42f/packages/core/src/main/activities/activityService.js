define(['utils'], function (utils) {
    'use strict';

    var urlUtils = utils.urlUtils,
        ajaxUtils = utils.ajaxLibrary;

    var API_HUB_PATH = '/_api/app-integration-bus-web/v1/activities';


    function reportActivity(activity, onSuccess, onError) {
        var query = '?' + urlUtils.toQueryString(activity.getParams()),
            url = utils.urlUtils.origin() + API_HUB_PATH + query;
        
        ajaxUtils.ajax({
            type: 'POST',
            url: url,
            data: activity.getPayload(),
            dataType: 'json',
            contentType: 'application/json',
            success: onSuccess,
            error: onError
        });
    }

    return {
        reportActivity: reportActivity
    };
});
