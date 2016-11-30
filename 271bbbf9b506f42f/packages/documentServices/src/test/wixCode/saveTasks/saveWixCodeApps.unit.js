define([
    'lodash',
    'testUtils',
    'documentServices/dataAccessLayer/wixImmutable',
    'documentServices/wixCode/saveTasks/saveWixCodeApps',
    'documentServices/wixCode/services/wixCodeLifecycleService'
], function (_, testUtils, wixImmutable, saveWixCodeApps, wixCodeLifecycleService) {
    'use strict';

    describe('saveWixCodeApps', function () {
        var lastSnapshot, currentSnapshot, resolve, reject;

        function createSnapshot() {
            var mockSiteData = testUtils.mockFactory.mockSiteData();

            return {
                rendererModel: mockSiteData.rendererModel,
                serviceTopology: mockSiteData.serviceTopology
            };
        }

        beforeEach(function () {
            lastSnapshot = createSnapshot();
            currentSnapshot = createSnapshot();
            resolve = jasmine.createSpy('resolve');
            reject = jasmine.createSpy('reject');

            this.fullSave = function(last, current, res, rej) {
                saveWixCodeApps.fullSave(wixImmutable.fromJS(last), wixImmutable.fromJS(current), res, rej);
            };
            this.publish = function(current, res, rej){
                saveWixCodeApps.publish(wixImmutable.fromJS(current), res, rej);
            };
        });

        describe('API definition', function () {

            it('Should be defined', function () {
                expect(saveWixCodeApps).toBeDefined();
            });

            it('Should have partialSave function that receives 4 arguments: lastSnapshot, currentSnapshot and callbacks', function () {
                expect(saveWixCodeApps.partialSave).toBeDefined();
                expect(saveWixCodeApps.partialSave.length).toEqual(4);
            });

            it('Should have fullSave function that receives 4 arguments: lastSnapshot, currentSnapshot and callbacks', function () {
                expect(saveWixCodeApps.fullSave).toBeDefined();
                expect(saveWixCodeApps.fullSave.length).toEqual(4);
            });

            it('Should have firstSave function that receives 4 arguments: lastSnapshot, currentSnapshot and callbacks', function () {
                expect(saveWixCodeApps.firstSave).toBeDefined();
                expect(saveWixCodeApps.firstSave.length).toEqual(4);
            });

            it('Should have publish function that receives 2 arguments: currentSnapshot and resolve callback', function () {
                expect(saveWixCodeApps.publish).toBeDefined();
                expect(saveWixCodeApps.publish.length).toEqual(2);
            });

            it('fullSave, firstSave and partialSave should run the same function', function () {
                expect(saveWixCodeApps.fullSave).toBe(saveWixCodeApps.firstSave);
                expect(saveWixCodeApps.firstSave).toBe(saveWixCodeApps.partialSave);
            });
        });

        describe('save functions', function () {
            describe('when task succeeds', function () {
                describe('with a new client spec map', function () {
                    it('Should call resolve() callback with expected result object', function () {
                        var WIX_CODE_NOT_PROVISIONED_KEY = 'wixCodeNotProvisioned';
                        var wixCodeApps = _.filter(currentSnapshot.rendererModel.clientSpecMap, WIX_CODE_NOT_PROVISIONED_KEY);
                        var newClientSpecMapFromService = _.map(wixCodeApps, _.partialRight(_.omit, WIX_CODE_NOT_PROVISIONED_KEY));
                        var serverPayload = {clientSpecMap: newClientSpecMapFromService};
                        var expectation = {}, path = 'rendererModel.clientSpecMap';
                        expectation[path] = _.assign({}, currentSnapshot.rendererModel.clientSpecMap, newClientSpecMapFromService);

                        spyOn(wixCodeLifecycleService, 'save').and.callFake(function (currentData, onSuccess) {
                            onSuccess({success: true, payload: serverPayload, errorCode: 0});
                        });

                        this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                        expect(resolve).toHaveBeenCalledWith(expectation);
                    });
                });

                describe('without a result', function () {
                    it('Should call resolve() callback without arguments', function () {
                        spyOn(wixCodeLifecycleService, 'save').and.callFake(function (currentData, onSuccess) {
                            onSuccess();
                        });

                        this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                        expect(resolve).toHaveBeenCalledWith(/* nothing */);
                    });
                });
            });

            describe('when task fails', function () {
                it('Should call reject() callback with expected reject object', function () {
                    var errorResponse = {errorCode: 1020, errorDescription: 'desc'};
                    spyOn(wixCodeLifecycleService, 'save').and.callFake(function (currentData, onSuccess, onError) {
                        onError(errorResponse);
                    });

                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                    expect(reject).toHaveBeenCalledWith(errorResponse);
                });
            });

            describe('when the server returns a concurrency provisioning error', function(){
                describe('when retryOnConcurrencyError experiment is open', function(){
                    it('should retry the save once', function(){
                        testUtils.experimentHelper.openExperiments('retryOnConcurrencyError');
                        var serverResponse = {errorCode: -40103, payload: {}, success: false};
                        spyOn(wixCodeLifecycleService, 'save').and.callFake(function (currentData, onSuccess) {
                            onSuccess(serverResponse);
                        });

                        this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                        expect(resolve).toHaveBeenCalled();
                        expect(resolve.calls.mostRecent().args).toEqual([]);
                        expect(wixCodeLifecycleService.save.calls.count()).toBe(2); //called one additional time
                    });
                });

                describe('when retryOnConcurrencyError experiment is closed', function(){
                    it('should not retry the save', function(){
                        testUtils.experimentHelper.closeExperiments('retryOnConcurrencyError');
                        var serverResponse = {errorCode: -40103, payload: {}, success: false};
                        spyOn(wixCodeLifecycleService, 'save').and.callFake(function (currentData, onSuccess) {
                            onSuccess(serverResponse);
                        });

                        this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);

                        expect(resolve).toHaveBeenCalled();
                        expect(resolve.calls.mostRecent().args).toEqual([]);
                        expect(wixCodeLifecycleService.save.calls.count()).toBe(1); //called only once
                    });
                });
            });
        });

        describe('publish', function () {
            it('Should call resolve() callback', function () {
                this.publish(currentSnapshot, resolve);
                expect(resolve).toHaveBeenCalledWith(/* nothing */);
            });
        });
    });
});
