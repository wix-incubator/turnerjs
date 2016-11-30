define([
    'lodash',
    'bluebird',
    'testUtils',
    'documentServices/dataAccessLayer/wixImmutable',
    'documentServices/wixCode/services/wixCodeLifecycleService',
    'documentServices/wixCode/saveTasks/markAppImmutable',
    'documentServices/wixCode/utils/constants'
], function (_, Promise, testUtils, wixImmutable, wixCodeLifecycleService, markAppImmutable, constants) {
    'use strict';

    describe('markAppImmutable', function () {
        var lastSnapshot, currentSnapshot, resolve, reject;

        function createSnapshot() {
            var mockSiteData = testUtils.mockFactory.mockSiteData()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());

            return {
                wixCode: {},
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
                markAppImmutable.fullSave(wixImmutable.fromJS(last), wixImmutable.fromJS(current), res, rej);
            };
            this.publish = function(current, res, rej){
                markAppImmutable.publish(wixImmutable.fromJS(current), res, rej);
            };
        });

        describe('API definition', function () {

            it('Should be defined', function () {
                expect(markAppImmutable).toBeDefined();
            });

            it('Should have partialSave function that receives 4 arguments: lastSnapshot, currentSnapshot and callbacks', function () {
                expect(markAppImmutable.partialSave).toBeDefined();
                expect(markAppImmutable.partialSave.length).toEqual(4);
            });

            it('Should have fullSave function that receives 4 arguments: lastSnapshot, currentSnapshot and callbacks', function () {
                expect(markAppImmutable.fullSave).toBeDefined();
                expect(markAppImmutable.fullSave.length).toEqual(4);
            });

            it('Should have firstSave function that receives 4 arguments: lastSnapshot, currentSnapshot and callbacks', function () {
                expect(markAppImmutable.firstSave).toBeDefined();
                expect(markAppImmutable.firstSave.length).toEqual(4);
            });

            it('Should have publish function that receives 2 arguments: currentSnapshot and resolve callback', function () {
                expect(markAppImmutable.publish).toBeDefined();
                expect(markAppImmutable.publish.length).toEqual(2);
            });

            it('fullSave, firstSave and partialSave should run the same function', function () {
                expect(markAppImmutable.fullSave).toBe(markAppImmutable.firstSave);
                expect(markAppImmutable.firstSave).toBe(markAppImmutable.partialSave);
            });
        });

        describe('task', function () {
            describe('when wix code is not provisioned', function () {
                it('calls resolve() callback with nothing', function (done) {
                    currentSnapshot.rendererModel.clientSpecMap = {};
                    resolve.and.callFake(function(result) {
                        expect(result).toEqual(undefined);
                        done();
                    });
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);
                });
            });

            describe('when wix code is provisioned', function () {
                beforeEach(function() {
                    spyOn(wixCodeLifecycleService, 'markAppImmutable');
                });

                describe('when the app was not changed', function () {
                    beforeEach(function() {
                        _.set(currentSnapshot, constants.paths.IS_APP_READ_ONLY, true);
                    });

                    it('calls resolve() callback with nothing', function (done) {
                        resolve.and.callFake(function(result) {
                            expect(result).toEqual(undefined);
                            expect(wixCodeLifecycleService.markAppImmutable).not.toHaveBeenCalled();
                            done();
                        });
                        this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);
                    });
                });

                describe('when the app was changed', function () {
                    beforeEach(function() {
                        _.set(currentSnapshot, constants.paths.IS_APP_READ_ONLY, false);
                    });

                    it('calls wixCodeLifecycleService.markAppImmutable', function (done) {
                        wixCodeLifecycleService.markAppImmutable.and.returnValue(Promise.resolve());

                        resolve.and.callFake(function() {
                            expect(wixCodeLifecycleService.markAppImmutable).toHaveBeenCalled();
                            done();
                        });
                        this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);
                    });

                    it('calls resolve() callback with expected result object', function (done) {
                        var expectation = {};
                        var readOnlyKey = constants.paths.IS_APP_READ_ONLY.join('.');
                        expectation[readOnlyKey] = true;

                        wixCodeLifecycleService.markAppImmutable.and.returnValue(Promise.resolve());

                        resolve.and.callFake(function(result) {
                            expect(result).toEqual(expectation);
                            expect(reject).not.toHaveBeenCalled();
                            done();
                        });
                        this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);
                    });

                    it('calls reject() callback with expected error object', function (done) {
                        var fakeError = new Error('fake error for test');

                        wixCodeLifecycleService.markAppImmutable.and.returnValue(Promise.reject(fakeError));

                        reject.and.callFake(function(error) {
                            expect(error).toEqual(fakeError);
                            expect(resolve).not.toHaveBeenCalled();
                            done();
                        });
                        this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);
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
