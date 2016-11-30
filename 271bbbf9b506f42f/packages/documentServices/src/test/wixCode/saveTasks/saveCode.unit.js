define([
    'lodash',
    'bluebird',
    'testUtils',
    'documentServices/dataAccessLayer/wixImmutable',
    'documentServices/wixCode/services/fileSystemService',
    'documentServices/wixCode/saveTasks/saveCode',
    'documentServices/wixCode/utils/constants',
    'documentServices/wixCode/utils/utils'
], function (_, Promise, testUtils, wixImmutable, fileSystemService, saveCode, constants, utils) {
    'use strict';

    describe('saveCode', function () {
        var lastSnapshot, currentSnapshot, resolve, reject;

        function createSnapshot() {
            var mockSiteData = testUtils.mockFactory.mockSiteData().updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());

            return {
                wixCode: {
                    modifiedFileContents: {}
                },
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
                saveCode.fullSave(wixImmutable.fromJS(last), wixImmutable.fromJS(current), res, rej);
            };
            this.publish = function(current, res, rej){
                saveCode.publish(wixImmutable.fromJS(current), res, rej);
            };
        });

        describe('API definition', function () {

            it('Should be defined', function () {
                expect(saveCode).toBeDefined();
            });

            it('Should have partialSave function that receives 4 arguments: lastSnapshot, currentSnapshot and callbacks', function () {
                expect(saveCode.partialSave).toBeDefined();
                expect(saveCode.partialSave.length).toEqual(4);
            });

            it('Should have fullSave function that receives 4 arguments: lastSnapshot, currentSnapshot and callbacks', function () {
                expect(saveCode.fullSave).toBeDefined();
                expect(saveCode.fullSave.length).toEqual(4);
            });

            it('Should have firstSave function that receives 4 arguments: lastSnapshot, currentSnapshot and callbacks', function () {
                expect(saveCode.firstSave).toBeDefined();
                expect(saveCode.firstSave.length).toEqual(4);
            });

            it('Should have publish function that receives 2 arguments: currentSnapshot and resolve callback', function () {
                expect(saveCode.publish).toBeDefined();
                expect(saveCode.publish.length).toEqual(2);
            });

            it('fullSave, firstSave and partialSave should run the same function', function () {
                expect(saveCode.fullSave).toBe(saveCode.firstSave);
                expect(saveCode.firstSave).toBe(saveCode.partialSave);
            });
        });

        describe('save', function () {
            describe('when wix code is not provisioned', function () {
                it('Should call resolve() callback with nothing', function (done) {
                    currentSnapshot.rendererModel.clientSpecMap = {};
                    resolve.and.callFake(function(result) {
                        expect(result).toEqual(undefined);
                        done();
                    });
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);
                });
            });

            describe('when no files to save', function () {
                it('calls resolve() callback with nothing', function (done) {
                    spyOn(fileSystemService, 'writeFile');

                    resolve.and.callFake(function(result) {
                        expect(fileSystemService.writeFile).not.toHaveBeenCalled();
                        expect(result).toEqual(undefined);
                        done();
                    });
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);
                });
            });

            describe('when there are files to save', function () {
                it('saves changes since last save', function (done) {
                    var fileId = 'fake-fileId';
                    var fakeContent = 'fake-content';
                    _.set(currentSnapshot, constants.paths.MODIFIED_FILE_CONTENTS.concat([fileId]), fakeContent);

                    var prevSavedFileId = 'fake-saved-fileId';
                    var prevFakeContent = 'fake-saved-content';
                    _.set(lastSnapshot, constants.paths.MODIFIED_FILE_CONTENTS.concat([prevSavedFileId]), prevFakeContent);
                    _.set(currentSnapshot, constants.paths.MODIFIED_FILE_CONTENTS.concat([prevSavedFileId]), prevFakeContent);


                    spyOn(fileSystemService, 'writeFile').and.returnValue(Promise.resolve());

                    resolve.and.callFake(function() {
                        var clientSpec = _.find(currentSnapshot.rendererModel.clientSpecMap, {type: 'siteextension'});
                        var gridAppId = _.get(currentSnapshot, constants.paths.GRID_APP_ID);
                        var scari = _.get(currentSnapshot, constants.paths.SCARI);
                        var expectedCodeAppInfo = utils.createCodeAppInfo(
                            currentSnapshot.serviceTopology.wixCloudEditorBaseUrl,
                            gridAppId,
                            clientSpec.signature,
                            scari
                        );

                        expect(fileSystemService.writeFile.calls.count()).toBe(1);

                        var args = fileSystemService.writeFile.calls.argsFor(0);
                        expect(args[0]).toEqual(expectedCodeAppInfo);
                        expect(args[1].location).toEqual(fileId);
                        expect(args[2]).toEqual(fakeContent);

                        done();
                    });
                    reject.and.callFake(function() {
                        this.fail('should not reject');
                        done();
                    });
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);
                });

                it('rejects when the app is not writeable', function(done) {
                    var fileId = 'fake-fileId';
                    var fakeContent = 'fake-content';
                    _.set(currentSnapshot, constants.paths.MODIFIED_FILE_CONTENTS.concat([fileId]), fakeContent);
                    _.set(currentSnapshot, constants.paths.IS_APP_READ_ONLY, true);

                    spyOn(fileSystemService, 'writeFile');

                    resolve.and.callFake(function() {
                        this.fail('should not resolve');
                        done();
                    });
                    reject.and.callFake(function() {
                        expect(fileSystemService.writeFile).not.toHaveBeenCalled();
                        done();
                    });
                    this.fullSave(lastSnapshot, currentSnapshot, resolve, reject);
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
