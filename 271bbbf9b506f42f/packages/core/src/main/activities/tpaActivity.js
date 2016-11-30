define(['lodash', 'core/activities/activity'], function(_, Activity) {
    'use strict';

    var TPAActivity = function (activityInfo, fields) {
        Activity.call(this, activityInfo, fields);
    };

    TPAActivity.prototype = new Activity();

    TPAActivity.prototype.getParams = function (params) {
        var baseParams = Activity.prototype.getParams.call(this, params);
        var tpaParams = {
            'application-id': this._fields.appDefinitionId,
            instance: this._fields.instance
        };

        tpaParams = _.assign(baseParams, tpaParams);

        return tpaParams;
    };

    TPAActivity.prototype.getPayload = function (payload) {
        var basePayload = Activity.prototype.getPayload.call(this, payload);
        var tpaPayload = {
            contactUpdate: this._fields.contactUpdate,
            activityInfo: this._fields.info,
            activityType: this._fields.type,
            activityDetails: this._fields.details
        };

        tpaPayload = _.assign(basePayload, tpaPayload);

        return tpaPayload;
    };

    return TPAActivity;
});
