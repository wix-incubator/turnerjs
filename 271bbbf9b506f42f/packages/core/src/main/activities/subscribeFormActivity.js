define(['lodash', 'core/activities/activity'], function(_, Activity) {
    'use strict';

    var getActivityInfo = function (fields) {
        var info = {fields: []};

        Object.keys(fields).forEach(function(key) {
            info.fields.push({name: key, value: fields[key]});
        });

        info.email = fields.email;
        if (fields.first || fields.last) {
            info.name = _.pick({first: fields.first, last: fields.last}, _.identity);
        }
        if (fields.phone) {
            info.phone = fields.phone;
        }

        return info;
    };

    var getContactUpdate = function (fields) {
        return {
            "name": {
                "first": fields.first || "",
                "last":  fields.last || ""
            },
            "emails": [{
                "tag": "main",
                "email": fields.email || ""
            }],
            phones: (fields.phone ? [{
                "tag": "main",
                "phone": fields.phone || ""
            }] : []),
            "emailSubscriptionPolicy" : "RECURRING"
        };
    };

    var SubscribeFormActivity = function (activityInfo, fields) {
        Activity.call(this, activityInfo, fields);
    };

    SubscribeFormActivity.prototype = new Activity();

    SubscribeFormActivity.prototype.getParams = function (params) {
        var baseParams = Activity.prototype.getParams.call(this, params);
        var subFormParams = {
            'component-name': 'subscribeForm'
        };

        subFormParams = _.assign(baseParams, subFormParams);

        return subFormParams;
    };

    SubscribeFormActivity.prototype.getPayload = function (payload) {
        var basePayload = Activity.prototype.getPayload.call(this, payload);
        var subFormPayload = {
            contactUpdate: getContactUpdate(this._fields),
            activityInfo: getActivityInfo(this._fields),
            activityType: 'contact/subscription-form'
        };

        subFormPayload = _.assign(basePayload, subFormPayload);

        return subFormPayload;
    };

    return SubscribeFormActivity;
});
