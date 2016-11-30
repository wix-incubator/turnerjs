define(['core/activities/activity'], function(Activity) {
    'use strict';

    describe('Activities', function () {
        var activity, callbacks, activityInfo;

        beforeEach(function () {
            activityInfo = {
                hubSecurityToken: 123456789,
                svSession: 'sv-session',
                metaSiteId: 'metasite-id',
                currentUrl: {
                    host: 'wix.com',
                    full: 'http://wix.com/activities'
                }
            };
            callbacks = {
                onSuccess: jasmine.createSpy(),
                onError: jasmine.createSpy()
            };
            activity = new Activity(activityInfo, null, callbacks);
        });

        describe('getParams', function () {
            it('should get activity params', function () {
                var params = activity.getParams();
                expect(params.hs).toEqual(123456789);
                expect(params['activity-id']).toEqual(jasmine.any(String));
                expect(params['metasite-id']).toEqual('metasite-id');
                expect(params.svSession).toEqual('sv-session');
                expect(params.version).toEqual('1.0.0');
            });
        });

        describe('getPayload', function () {
            it('should get activity payload', function () {
                var payload = activity.getPayload();
                expect(payload.activityDetails).toEqual({
                    additionalInfoUrl: null,
                    summary: ''
                });
                expect(payload.activityInfo).toEqual('activityInfo');
                expect(payload.activityLocationUrl).toEqual('http://wix.com/activities');
                expect(payload.activityType).toEqual('activityType');
                expect(payload.contactUpdate).toEqual({});
                expect(payload.createdAt).toEqual(jasmine.any(String));
            });
        });
    });
});