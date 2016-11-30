define(['core/activities/tpaActivity'], function (TPAActivity) {
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
                contactUpdate: 'test-update',
                type: 'test-type',
                info: 'test-info',
                url: 'test-url',
                instance: 'test-instance',
                appDefinitionId: 'test-id',
                details: {
                    key: 'value'
                }
            };
            type = 'test-type';
            activity = new TPAActivity(activityInfo, fields, null, type);
        });

        describe('getParams', function () {
            it('should get activity params', function () {
                var params = activity.getParams();
                expect(params.instance).toEqual('test-instance');
                expect(params['application-id']).toEqual('test-id');
            });
        });

        describe('getPayload', function () {
            it('should get activity payload', function () {
                var payload = activity.getPayload();
                expect(payload.activityType).toEqual('test-type');
                expect(payload.activityInfo).toEqual('test-info');
                expect(payload.activityDetails).toEqual({
                    key: 'value'
                });
            });
        });
    });
});
