define([
    'lodash',
    'bluebird',
    'testUtils',
    'documentServices/dataAccessLayer/wixImmutable',
    'documentServices/wixCode/saveTasks/markAppImmutable',
    'documentServices/wixCode/saveTasks/saveCode',
    'documentServices/wixCode/saveTasks/saveCodeAndMarkImmutable'
], function (_, Promise, testUtils, wixImmutable, markAppImmutable, saveCode, saveCodeAndMarkImmutable) {
    'use strict';

    describe('saveCodeAndMarkImmutable', function () {
        var mockLastSnapshot, mockCurrentSnapshot, resolveSpy, rejectSpy;

        function createSnapshot() {
            return {};
        }

        beforeEach(function () {
            mockLastSnapshot = createSnapshot();
            mockCurrentSnapshot = createSnapshot();
            resolveSpy = jasmine.createSpy('resolve');
            rejectSpy = jasmine.createSpy('reject');

            this.fullSave = function(last, current, res, rej) {
                saveCodeAndMarkImmutable.fullSave(wixImmutable.fromJS(last), wixImmutable.fromJS(current), res, rej);
            };
            this.publish = function(current, res, rej){
                saveCodeAndMarkImmutable.publish(wixImmutable.fromJS(current), res, rej);
            };
        });

        describe('API definition', function () {

            it('Should be defined', function () {
                expect(saveCodeAndMarkImmutable).toBeDefined();
            });

            it('Should have partialSave function that receives 4 arguments: lastSnapshot, currentSnapshot and callbacks', function () {
                expect(saveCodeAndMarkImmutable.partialSave).toBeDefined();
                expect(saveCodeAndMarkImmutable.partialSave.length).toEqual(4);
            });

            it('Should have fullSave function that receives 4 arguments: lastSnapshot, currentSnapshot and callbacks', function () {
                expect(saveCodeAndMarkImmutable.fullSave).toBeDefined();
                expect(saveCodeAndMarkImmutable.fullSave.length).toEqual(4);
            });

            it('Should have firstSave function that receives 4 arguments: lastSnapshot, currentSnapshot and callbacks', function () {
                expect(saveCodeAndMarkImmutable.firstSave).toBeDefined();
                expect(saveCodeAndMarkImmutable.firstSave.length).toEqual(4);
            });

            it('Should have publish function that receives 2 arguments: currentSnapshot and resolve callback', function () {
                expect(saveCodeAndMarkImmutable.publish).toBeDefined();
                expect(saveCodeAndMarkImmutable.publish.length).toEqual(2);
            });

            it('fullSave, firstSave and partialSave should run the same function', function () {
                expect(saveCodeAndMarkImmutable.fullSave).toBe(saveCodeAndMarkImmutable.firstSave);
                expect(saveCodeAndMarkImmutable.firstSave).toBe(saveCodeAndMarkImmutable.partialSave);
            });
        });

        describe('save', function () {
            it('Should resolve with unified results of saveCode and markAppImmutable', function(done) {
                var saveCodeResolution = {a: 1};
                var markAppImmutableResolution = {b: 2};
                spyOn(saveCode, 'fullSave').and.callFake(function(lastSnapshot, currentSnapshot, resolve/*, reject*/) {
                    resolve(saveCodeResolution);
                });
                spyOn(markAppImmutable, 'fullSave').and.callFake(function(lastSnapshot, currentSnapshot, resolve/*, reject*/) {
                    resolve(markAppImmutableResolution);
                    var expectedResolution = _.assign({}, saveCodeResolution, markAppImmutableResolution);
                    expect(resolveSpy).toHaveBeenCalledWith(expectedResolution);
                    done();
                });
                this.fullSave(mockLastSnapshot, mockCurrentSnapshot, resolveSpy, rejectSpy);
            });

            it('Should reject if saveCode fails', function (done) {
                spyOn(saveCode, 'fullSave').and.callFake(function(lastSnapshot, currentSnapshot, resolve, reject) {
                    var err = new Error('fake-error');
                    reject(err);
                    expect(rejectSpy).toHaveBeenCalledWith(err);
                    done();
                });
                this.fullSave(mockLastSnapshot, mockCurrentSnapshot, resolveSpy, rejectSpy);
            });

            it('Should reject if markAppImmutable fails', function(done) {
                spyOn(saveCode, 'fullSave').and.callFake(function(lastSnapshot, currentSnapshot, resolve/*, reject*/) {
                    resolve();
                });
                spyOn(markAppImmutable, 'fullSave').and.callFake(function(lastSnapshot, currentSnapshot, resolve, reject) {
                    var err = new Error('fake-error');
                    reject(err);
                    expect(rejectSpy).toHaveBeenCalledWith(err);
                    done();
                });
                this.fullSave(mockLastSnapshot, mockCurrentSnapshot, resolveSpy, rejectSpy);
            });
        });

        describe('publish', function () {
            it('Should call resolve() callback', function () {
                this.publish(mockCurrentSnapshot, resolveSpy);
                expect(resolveSpy).toHaveBeenCalledWith(/* nothing */);
            });
        });
    });
});