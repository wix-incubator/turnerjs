define(['core/activities/subscribeFormActivity'], function (SubscribeFormActivity) {
    'use strict';

    describe('ContactFormActivity', function () {
        var activity, fields, type, activityInfo;

        beforeEach(function () {
            activityInfo = {
                hubSecurityToken: jasmine.createSpy().and.returnValue(123456789),
                svSession: jasmine.createSpy().and.returnValue('sv-session'),
                metaSiteId: jasmine.createSpy().and.returnValue('metasite-id'),
                currentUrl: {
                    host: 'wix.com',
                    full: 'http://wix.com/activities'
                }
            };
            fields = {
                first: 'John',
                last: 'Doe',
                email: 'john@doe.com',
                phone: '123456789'
            };
            type = 'test-type';
            activity = new SubscribeFormActivity(activityInfo, fields, null, type);
        });

        describe('getParams', function () {
            it('should get activity params', function () {
                var params = activity.getParams();
                expect(params['component-name']).toEqual('subscribeForm');
            });
        });

        describe('getPayload', function () {
            it('should get activity payload', function () {
                var payload = activity.getPayload();
                expect(payload.activityType).toEqual('contact/subscription-form');
                expect(payload.activityInfo).toEqual({
                    fields: [
                        {name: 'first', value: 'John'},
                        {name: 'last', value: 'Doe'},
                        {name: 'email', value: 'john@doe.com'},
                        {name: 'phone', value: '123456789'}
                    ],
                    email : 'john@doe.com',
                    name : {first : 'John', last : 'Doe'},
                    phone : '123456789'
                });
                expect(payload.contactUpdate).toEqual({
                    "name": {
                        "first": 'John',
                        "last":  'Doe'
                    },
                    "emails": [{
                        "tag": "main",
                        "email": 'john@doe.com'
                    }],
                    phones: [{
                        tag: 'main',
                        phone: '123456789'
                    }],
                    "emailSubscriptionPolicy" : "RECURRING"
                });
            });
        });
    });
});