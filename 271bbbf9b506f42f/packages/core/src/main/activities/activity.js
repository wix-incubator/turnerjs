define(['utils'], function(utils) {
    'use strict';

    var getActivityDetails = function () {
        return {
            'additionalInfoUrl': null,
            'summary': ''
        };
    };

    var getActivityLocationUrl = function (activityInfo) {
        return activityInfo.currentUrl.full;
    };

    var getActivityId = function () {
        return utils.guidUtils.getUniqueId();
    };

    var Activity = function (activityInfo, fields) {
        this._activityInfo = activityInfo;
        this._fields = fields;
    };

    Activity.prototype = {
        getParams: function () {
            return {
                'hs': this._activityInfo.hubSecurityToken,
                'activity-id': getActivityId(),
                'metasite-id': this._activityInfo.metaSiteId,
                'svSession': this._activityInfo.svSession,
                'version': '1.0.0'
            };
        },
        getPayload: function () {
            return {
                activityDetails: getActivityDetails(),
                activityInfo: 'activityInfo',
                activityLocationUrl: getActivityLocationUrl(this._activityInfo),
                activityType: 'activityType',
                contactUpdate: {},
                createdAt: new Date().toISOString()
            };
        }
    };

    return Activity;
});
