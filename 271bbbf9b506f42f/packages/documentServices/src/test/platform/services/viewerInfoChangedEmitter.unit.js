define([
    'lodash',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/platform/common/constants',
    'documentServices/platform/services/viewerInfoChangedEmitter'
], function (
    _,
    testUtils,
    privateServicesHelper,
    constants,
    viewerInfoChangedEmitter
) {
    'use strict';

    xdescribe('viewInfoChangedEmitter', function () {

        beforeEach(function () {
            this.ps = privateServicesHelper.mockPrivateServices();
            testUtils.experimentHelper.openExperiments('sv_platform1');
        });

        afterEach(function () {
            testUtils.experimentHelper.closeExperiments('sv_platform1'); // TODO uncomment this when tests pass
        });


        it('should invoke callback with the given payload', function() {
            var appId = 'dummy_appId';
            var spy = jasmine.createSpy();
            var payload = {some_data_id: 'dummy_data'};

            var unregister = viewerInfoChangedEmitter.register(this.ps, appId, spy);
            viewerInfoChangedEmitter.emit(this.ps, payload);

            expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
                eventType: constants.MessageTypes.VIEWER_INFO_CHANGED,
                eventPayload: payload
            }));

            unregister();
        });

        it('should not invoke listener after unsubscribing', function() {
            var appId = 'dummy_appId';
            var spy = jasmine.createSpy();

            var unregister = viewerInfoChangedEmitter.register(this.ps, appId, spy);
            viewerInfoChangedEmitter.emit(this.ps, {});
            expect(spy.calls.count()).toBe(1);

            unregister();
            viewerInfoChangedEmitter.emit(this.ps, {});
            expect(spy.calls.count()).toBe(1);
        });

    });
});
