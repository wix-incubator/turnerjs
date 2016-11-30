define(['lodash', 'core/activities/activity', 'experiment'], function (_, Activity, experiment) {
    'use strict';

    var MAX_PHONE_FIELD_CHARS = 29;

    var getActivityDetails = function (fields) {
        var summary = '';

        summary += fields.subject ? ('<strong>' + fields.subject + '</strong>') : '';

        if (fields.message) {
            summary += fields.subject ? '<br>' : '';
            summary += fields.message;
        }

        return {
            "additionalInfoUrl": null,
            "summary": !_.isEmpty(summary) ? summary : 'No message was received'
        };
    };

    var contactUpdateTemplate = {
        "name": {
            "first": "",
            "last": ""
        },
        "emails": [
            {
                "tag": "main",
                "email": ""
            }
        ],
        "phones": [
            {
                "tag": "main",
                "phone": ""
            }
        ],
        "addresses": [
            {
                "tag": "main",
                "address": ""
            }
        ]
    };

    var fieldNameToTemplateKey = {
        name: "name",
        email: "emails",
        phone: "phones",
        address: "addresses"
    };

    var createAdditionalFields = function(fields, fieldLabels) {
        return _(fields).keys().map(function(key){
            return {name: fieldLabels[key], value: fields[key]};
        }).value();
    };

    var getActivityInfo = function (fields, fieldLabels) {
        if (experiment.isOpen('contactFormActivity')) {
            // new contact form activity payload (form/contact-form)
            return {
              "subject": fields.subject,
              "content": {
                "message": fields.message,
                "media": []
              },
              "additionalFields": createAdditionalFields(fields, fieldLabels)
            };
        }

        var info = {fields: []};

        Object.keys(fields).forEach(function (key) {
            info.fields.push({name: key, value: fields[key]});
        });

        return info;
    };

    var getContactUpdate = function (allFields) {
        var nonEmptyFields = _.omit(allFields, function (value) {
            return !value;
        });
        var contactFormFields = _.map(nonEmptyFields, function (fieldValue, fieldName) {
            return fieldNameToTemplateKey[fieldName];
        }, this);
        var contactUpdateInfo = _.pick(contactUpdateTemplate, contactFormFields);

        handleNameInfo(contactUpdateInfo, nonEmptyFields);
        handlePhonesInfo(contactUpdateInfo, nonEmptyFields);

        _.forEach(nonEmptyFields, function (fieldValue, fieldName) {
            var currentValue = contactUpdateInfo[fieldNameToTemplateKey[fieldName]];
            if (_.isArray(currentValue)) {
                _.first(currentValue)[fieldName] = fieldValue;
            }
        }, this);


        return contactUpdateInfo;
    };

    var handlePhonesInfo = function (contactUpdateInfo, fields) {
        if (!fields.phone) {
            fields.phone = '';
        }
        fields.phone = fields.phone.substring(0, MAX_PHONE_FIELD_CHARS);
    };


    var handleNameInfo = function (contactUpdateInfo, fields) {
        if (!fields.name) {
            fields.name = '';
        }
        var parts = fields.name.split(' ');
        if (contactUpdateInfo.name) {
            contactUpdateInfo.name.first = parts[0];
            contactUpdateInfo.name.last = parts[1];
        }
    };

    var ContactFormActivity = function (activityInfo, fields, fieldLabels) {
        Activity.call(this, activityInfo, fields);
        this._fieldLabels = fieldLabels;
    };

    ContactFormActivity.prototype = new Activity();

    ContactFormActivity.prototype.getParams = function (params) {
        var baseParams = Activity.prototype.getParams.call(this, params);
        var contactFormParams = {
            'component-name': 'ContactForm'
        };

        contactFormParams = _.assign(baseParams, contactFormParams);

        return contactFormParams;
    };

    ContactFormActivity.prototype.getPayload = function (payload) {
        var basePayload = Activity.prototype.getPayload.call(this, payload);
        var contactUpdate = getContactUpdate(this._fields);
        var contactFormPayload = {
            contactUpdate: contactUpdate,
            activityInfo: getActivityInfo(this._fields, this._fieldLabels),
            activityDetails: getActivityDetails(this._fields),
            activityType: experiment.isOpen('contactFormActivity') ? 'form/contact-form' : 'contact/contact-form'
        };

        contactFormPayload = _.assign(basePayload, contactFormPayload);

        return contactFormPayload;
    };

    return ContactFormActivity;
});
