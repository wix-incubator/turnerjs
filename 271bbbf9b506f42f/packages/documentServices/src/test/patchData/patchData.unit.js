define([
    'lodash',
    'utils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/patchData/patchList',
    'documentServices/patchData/patchData'],
function (_, utils, privateServicesHelper, siteMetadata, patchList, patchData) {
    'use strict';

    describe('patchData', function () {
        describe('applyPatchIfExists', function () {
            beforeEach(function () {
                this.onSuccess = jasmine.createSpy('onSuccess');
                this.onError = jasmine.createSpy('onError');
                this.mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL(null, {siteData: [{path: ['documentServicesModel'], optional: true}]});
                this.autosaveInfoPointer = this.mockPs.pointers.general.getAutosaveInfo();
            });

            describe('when no data to patch', function () {
                it('should call the onSuccess handler with {changesApplied: false} if autoSaveInfo does not exist', function () {
                    patchData.applyPatchIfExists(this.mockPs, this.mockPs.config, this.onSuccess, this.onError);
                    expect(this.onSuccess.calls.mostRecent().args[0]).toEqual(null);
                    expect(this.onSuccess.calls.mostRecent().args[1]).toEqual({changesApplied: false});
                });
                it('should call the onSuccess handler with {changesApplied: false} if autoSaveInfo exists but shouldRestoreDiffs is false', function () {
                    this.mockPs.dal.set(this.autosaveInfoPointer, {shouldRestoreDiffs: false});
                    patchData.applyPatchIfExists(this.mockPs, this.mockPs.config, this.onSuccess, this.onError);
                    expect(this.onSuccess.calls.mostRecent().args[0]).toEqual(null);
                    expect(this.onSuccess.calls.mostRecent().args[1]).toEqual({changesApplied: false});
                });
            });

            describe('when dataToPatchExists', function () {
                beforeEach(function () {
                    this.mockPs.dal.set(this.autosaveInfoPointer, {shouldRestoreDiffs: true});
                    this.baseDomain = this.mockPs.dal.get(this.mockPs.pointers.general.getServiceTopology()).baseDomain;
                    this.siteId = siteMetadata.getProperty(this.mockPs, 'SITE_ID');
                    this.metaSiteId = siteMetadata.getProperty(this.mockPs, 'META_SITE_ID');
                    this.siteVersion = siteMetadata.getProperty(this.mockPs, 'SITE_VERSION');
                    spyOn(utils.ajaxLibrary, 'ajax');
                });

                it('should call the onSuccess handler with {changesApplied: false} if autosaveRestore URL param is false', function () {
                    spyOn(utils.urlUtils, 'getParameterByName').and.callFake(function(name){
                        if (name === 'autosaveRestore') {
                            return 'false';
                        }
                        return utils.urlUtils.getParameterByName(name);
                    });

                    patchData.applyPatchIfExists(this.mockPs, this.mockPs.config, this.onSuccess, this.onError);

                    expect(this.onSuccess.calls.mostRecent().args[0]).toEqual(null);
                    expect(this.onSuccess.calls.mostRecent().args[1]).toEqual({changesApplied: false});
                    expect(utils.ajaxLibrary.ajax).not.toHaveBeenCalled();
                });

                it('should query the server for changes', function () {
                    patchData.applyPatchIfExists(this.mockPs, this.mockPs.config, this.onSuccess, this.onError);
                    var ajaxOptions = utils.ajaxLibrary.ajax.calls.mostRecent().args[0];
                    var expectedUrl = 'http://editor.' + this.baseDomain + '/html/autosave/get_diffs/' + this.siteId + '?metaSiteId=' + this.metaSiteId + '&siteVersion=' + this.siteVersion;
                    expect(ajaxOptions.url).toBe(expectedUrl);
                    expect(ajaxOptions.type).toBe('GET');
                    expect(ajaxOptions.dataType).toBe('json');
                });
            });

            describe('handling dataToPatch results', function () {
                beforeEach(function () {
                    this.mockPs.dal.set(this.autosaveInfoPointer, {shouldRestoreDiffs: true});
                });

                it('should call applyPatchList with diffs and update latest diff Id', function () {
                    _.assign(this, {
                        latestDiffId: 'latestDiffId',
                        diffPayloads: [{payload: '[1]'}, {payload: '[2]'}]
                    });
                    spyOn(utils.ajaxLibrary, 'ajax').and.callFake(function (options) {
                        options.success({
                            success: true,
                            payload: {
                                latestDiffId: this.latestDiffId,
                                diffPayloads: this.diffPayloads
                            }
                        });
                    }.bind(this));
                    spyOn(patchList, 'applyPatchList');
                    patchData.applyPatchIfExists(this.mockPs, this.mockPs.config, this.onSuccess, this.onError);

                    expect(patchList.applyPatchList).toHaveBeenCalled();
                    var applyPatchListCallArgs = patchList.applyPatchList.calls.mostRecent().args;
                    expect(applyPatchListCallArgs[0]).toBe(this.mockPs);
                    expect(applyPatchListCallArgs[1]).toEqual([1, 2]);
                    expect(this.mockPs.dal.getByPath(['documentServicesModel', 'autoSaveInfo', 'previousDiffId'])).toEqual(this.latestDiffId);
                });

                it('should call applyPatchList with diffs and update autosaveCount with the number of autosave applied', function () {
                    var autosaveCountPointer = this.mockPs.pointers.general.getAutoSaveInnerPointer('autosaveCount');
                    _.assign(this, {
                        latestDiffId: 'latestDiffId',
                        diffPayloads: [{payload: '[1]'}, {payload: '[2]'}]
                    });
                    spyOn(utils.ajaxLibrary, 'ajax').and.callFake(function (options) {
                        options.success({
                            success: true,
                            payload: {
                                latestDiffId: this.latestDiffId,
                                diffPayloads: this.diffPayloads
                            }
                        });
                    }.bind(this));
                    spyOn(patchList, 'applyPatchList');

                    patchData.applyPatchIfExists(this.mockPs, this.mockPs.config, this.onSuccess, this.onError);

                    expect(this.mockPs.dal.get(autosaveCountPointer)).toEqual(this.diffPayloads.length);
                });

                describe('handling errors', function () {
                    it('should call onError with errorCode if server returned success:false', function () {
                        var errorCode = -1014;
                        var expectedErrorMsg = 'Failed to fetch diffs. error code: ' + errorCode;
                        spyOn(utils.ajaxLibrary, 'ajax').and.callFake(function (options) {
                            options.success({
                                success: false,
                                errorCode: errorCode,
                                errorDescription: 'Internal Server Error',
                                payload: null
                            });
                        });

                        patchData.applyPatchIfExists(this.mockPs, this.mockPs.config, this.onSuccess, this.onError);

                        expect(this.onError.calls.mostRecent().args[0].message).toEqual(expectedErrorMsg);
                        expect(this.onSuccess).not.toHaveBeenCalled();
                    });

                    it('should call onError with statusCode if AJAX request failed', function () {
                        var statusCode = 503;
                        var expectedErrorMsg = 'Error while fetching diffs. status code: ' + statusCode;
                        spyOn(utils.ajaxLibrary, 'ajax').and.callFake(function (options) {
                            options.error({
                                status: statusCode,
                                statusText: 'Error'
                            });
                        });

                        patchData.applyPatchIfExists(this.mockPs, this.mockPs.config, this.onSuccess, this.onError);

                        expect(this.onError.calls.mostRecent().args[0].message).toEqual(expectedErrorMsg);
                        expect(this.onSuccess).not.toHaveBeenCalled();
                    });

                    it('should call onError and rollback if exception thrown during apply phase', function () {
                        var goodPath = 'pagesData/mainPage/structure/components';
                        var expectedErrorMsg = 'replace operation in nonexisting path';
                        this.mockPs.dal.full.setByPath(goodPath.replace(/\//g, '.').split('.'), []);
                        _.assign(this, {
                            latestDiffId: 'latestDiffId',
                            diffPayloads: [
                                {payload: '[{"op":"add","path":"/' + goodPath + '/0","value":{"id": "fakeCompId"}}]'},
                                {payload: '[{"op":"replace","path":"/fakePath","value":"some value"}]'}
                            ]
                        });
                        spyOn(console, 'error');
                        spyOn(utils.log, 'error');
                        spyOn(utils.ajaxLibrary, 'ajax').and.callFake(function (options) {
                            options.success({
                                success: true,
                                payload: {
                                    latestDiffId: this.latestDiffId,
                                    diffPayloads: this.diffPayloads
                                }
                            });
                        }.bind(this));

                        patchData.applyPatchIfExists(this.mockPs, this.mockPs.config, this.onSuccess, this.onError);

                        expect(this.onSuccess).not.toHaveBeenCalled();
                        expect(this.onError.calls.mostRecent().args[0].message).toEqual(expectedErrorMsg);
                        expect(this.mockPs.dal.getByPath(goodPath.split('/'))).toEqual([]);
                    });
                });
            });
        });
    });
});
