define(['core/activities/activityService', 'utils'], function(activityService, utils) {
    'use strict';

    describe('Activity service', function() {
        var service, activity, onSuccess, onError;

        beforeEach(function () {
            spyOn(utils.ajaxLibrary, 'ajax');
            spyOn(utils.urlUtils, 'origin').and.returnValue('https://someorigin.com');

            service = activityService;

            activity = {
                getPayload: jasmine.createSpy().and.returnValue({
                    "activityDetails":{
                        "additionalInfoUrl":null,
                        "summary":""
                    },
                    "activityInfo":"activityInfo",
                    "activityLocationUrl":"http://wix.com/activities",
                    "activityType":"activityType"
                }),
                getParams: jasmine.createSpy().and.returnValue({
                    "hs":"123456789",
                    "activity-id":"activity-id",
                    "metasite-id":"metasite-id",
                    "version":"1.0.0"
                })
            };
            onSuccess = jasmine.createSpy();
            onError = jasmine.createSpy();
        });

        describe('report activity successfully', function () {
            beforeEach(function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.success({success: true});
                });
            });

            it('should post activity with the right values', function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    expect(opts.url).toContain('https://someorigin.com/_api/app-integration-bus-web/v1/activities');
                    expect(opts.url).toContain('hs=123456789');
                    expect(opts.url).toContain('activity-id=activity-id');
                    expect(opts.url).toContain('metasite-id=metasite-id');
                    expect(opts.url).toContain('version=1.0.0');

                    expect(opts.data).toEqual({
                        "activityDetails":{
                            "additionalInfoUrl":null,
                            "summary":""
                        },
                        "activityInfo":"activityInfo",
                        "activityLocationUrl":"http://wix.com/activities",
                        "activityType":"activityType"
                    });

                    expect(opts.success).toEqual(onSuccess);
                    expect(opts.error).toEqual(onError);
                });

                service.reportActivity(activity, onSuccess, onError);
            });

            it('should call success callback', function () {
                service.reportActivity(activity, onSuccess, onError);

                expect(onSuccess).toHaveBeenCalledWith({success: true});
                expect(onError).not.toHaveBeenCalled();
            });
        });

        describe('report activity error', function () {
            beforeEach(function () {
                utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                    opts.error({error: true});
                });
            });

            it('should call error callback', function () {
                service.reportActivity(activity, onSuccess, onError);

                expect(onError).toHaveBeenCalledWith({error: true});
                expect(onSuccess).not.toHaveBeenCalled();
            });
        });
    });
});
