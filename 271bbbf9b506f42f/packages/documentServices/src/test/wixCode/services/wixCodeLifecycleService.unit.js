define(['utils',
    'lodash',
    'bluebird',
    'testUtils',
    'documentServices/dataAccessLayer/wixImmutable',
    'documentServices/wixCode/services/wixCodeLifecycleService',
    'documentServices/siteMetadata/siteMetadata',
    'documentServices/siteMetadata/clientSpecMap',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/utils/provisionUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/wixCode/services/wixCodeModelService',
    'documentServices/wixCode/services/appWriteableState',
    'documentServices/wixCode/utils/pathUtils',
    'documentServices/wixCode/utils/constants'
], function (utils, _, Promise, testUtils, wixImmutable, wixCodeLifecycleService, siteMetadata, clientSpecMap, clientSpecMapService, provisionUtils, privateServicesHelper, wixCodeModelService, appWriteableState, pathUtils, constants) {

    'use strict';

    describe('wixCodeLifecycleService', function () {
        var ajaxSpy;
        var appStoreBaseUrl = 'http://editor.wix.com/wix-apps/appStore/wix-code/';

        var wixCodeSavedClientSpec = {
            appDefinitionId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
            applicationId: 14,
            extensionId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
            instance: '3eeed575c90c4f84fbb0d9c9cb72f3b7bac09b95.eyJleHRlbnNpb25JZCI6IjhmMmEwYjZkLTg4ZGItNDMwNi1iZmUyLTFiMjQ3Y2NiNTMzYiIsImluc3RhbmNlSWQiOiI4ZjJhMGI2ZC04OGRiLTQzMDYtYmZlMi0xYjI0N2NjYjUzM2IiLCJzaWduRGF0ZSI6MTQ0OTE0ODE0ODE3OCwidWlkIjpudWxsLCJwZXJtaXNzaW9ucyI6bnVsbH0=',
            instanceId: '1cb7428c-1483-41fa-9220-5a8c36743350',
            signature: '02baa083df8d4f720a36e8c9ed450f7612a690a4.eyJjb2RlQXBwSWQiOiI2MzhkODcwMS0xYjkyLTQxMzctYTZiOC1kNzZkYzM3MWFiYjkiLCJpbnN0YW5jZUlkIjoiYWViOGVhOGEtZWEzNy00ZTY2LWE1MzgtZWZiZTVlOGQzZjEwIiwiY29ycmVsYXRpb25JZCI6ImU4NmU0NmEyLTc5YzUtNDdlNS05OTIwLTQ2ZWRkNTE2ZmNiMCIsInNlc3Npb25VSWQiOiIxYWM3ZDlhNy1iYmE0LTQ2MGMtOWQxZC1iM2M3NzUwMzU0MzQiLCJzaWduRGF0ZSI6MTQ3NDM1NzkyMjQwMn0=',
            type: 'siteextension'
        };

        function getLastArgsFromAjaxSpy() {
            return ajaxSpy.calls.mostRecent().args;
        }

        function getUrlFromAjaxSpy() {
            return getLastArgsFromAjaxSpy()[0].url;
        }

        function getBodyFromAjaxSpy() {
            var bodyAsString = getLastArgsFromAjaxSpy()[0].data;
            return JSON.parse(bodyAsString);
        }

        function getHeadersFromAjaxSpy() {
            return getLastArgsFromAjaxSpy()[0].headers;
        }

        function createDataForSnapshot(customClientSpecMap, wixCodeModel) {
            var mockSiteData = testUtils.mockFactory.mockSiteData()
                                .updateRendererModel({wixCodeModel: wixCodeModel})
                                .overrideClientSpecMap(customClientSpecMap);

            return {
                rendererModel: mockSiteData.rendererModel,
                serviceTopology: mockSiteData.serviceTopology
            };
        }

        function createPrivateServices(customClientSpecMap) {
            var config = {siteData: [{
                path: ['wixCode'],
                optional: true
            }]};

            var siteData = customClientSpecMap ? testUtils.mockFactory.mockSiteData().overrideClientSpecMap(customClientSpecMap) : null;
            var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, config);
            pathUtils.initPaths(ps);
            return ps;
        }

        function fakeAjaxSuccess(payload) {
            utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                opts.success({
                    success: true,
                    payload: payload || {}
                });
            });
        }

        function fakeAjaxError(payload) {
            utils.ajaxLibrary.ajax.and.callFake(function (opts) {
                opts.error({
                    success: false,
                    payload: payload || {}
                });
            });
        }

        function getWixCodeServiceUrl(ps) {
            var pointer = ps.pointers.general.getServiceTopology();
            return ps.dal.get(ps.pointers.getInnerPointer(pointer, constants.WIX_CODE_SERVICE_URL_KEY));
        }

        function expectPromiseToBeResolved(done) {
            return function() {
                expect('promise').toBe('resolved');
                done();
            };
        }

        function expectPromiseToBeRejected(done) {
            return function() {
                expect('promise').toBe('rejected');
                done();
            };
        }

        beforeEach(function () {
            ajaxSpy = spyOn(utils.ajaxLibrary, 'ajax');
        });

        describe('provision', function () {
            var LARGEST_APP_ID = 2000;

            function generateProvisionedClientSpec() {
                var response = getCreateAppResponse();

                return {
                    extensionId: response.codeAppId,
                    appDefinitionId: response.codeAppId,
                    signature: response.si,
                    instance: response.si,
                    instanceId: response.instanceId,
                    applicationId: 2001,
                    wixCodeNotProvisioned: true,
                    type: 'siteextension'
                };
            }

            function getCreateAppResponse(){
                return {
                    codeAppId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
                    gridAppId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
                    instanceId: '41ac57c4-bd35-4519-b243-97639f1e6a3e',
                    si: '3eeed575c90c4f84fbb0d9c9cb72f3b7bac09b95.eyJleHRlbnNpb25JZCI6IjhmMmEwYjZkLTg4ZGItNDMwNi1iZmUyLTFiMjQ3Y2NiNTMzYiIsImluc3RhbmNlSWQiOiI4ZjJhMGI2ZC04OGRiLTQzMDYtYmZlMi0xYjI0N2NjYjUzM2IiLCJzaWduRGF0ZSI6MTQ0OTE0ODE0ODE3OCwidWlkIjpudWxsLCJwZXJtaXNzaW9ucyI6bnVsbH0=',
                    scari: '123456575c90c4f84fbb0d9c9cb72f3b7bac09b95.eyJleHRlbnNpb25JZCI6IjhmMmEwYjZkLTg4ZGItNDMwNi1iZmUyLTFiMjQ3Y2NiNTMzYiIsImluc3RhbmNlSWQiOiI4ZjJhMGI2ZC04OGRiLTQzMDYtYmZlMi0xYjI0N2NjYjUzM2IiLCJzaWduRGF0ZSI6MTQ0OTE0ODE0ODE3OCwidWlkIjpudWxsLCJwZXJtaXNzaW9ucyI6bnVsbH0='
                };
            }

            function getWixCodeProvisionUrl(ps) {
                var baseUrl = getWixCodeServiceUrl(ps);

                return baseUrl + '/api/apps';
            }

            beforeEach(function () {
                spyOn(clientSpecMapService, 'getLargestApplicationId').and.returnValue(LARGEST_APP_ID);
                spyOn(provisionUtils, 'generateAppFlowsLargestAppId').and.returnValue(2001);
            });

            describe('when wix code is provisioned', function() {
                it('should not provision again', function (done) {
                    var customClientSpecMap = {
                        14: wixCodeSavedClientSpec
                    };

                    var ps = createPrivateServices(customClientSpecMap);

                    wixCodeLifecycleService.provision(ps)
                        .then(validate)
                        .catch(expectPromiseToBeResolved(done));

                    function validate(result) {
                        expect(result).toEqual(wixCodeSavedClientSpec);
                        expect(clientSpecMap.getAppsData(ps)).toEqual(customClientSpecMap);
                        done();
                    }
                });
            });

            describe('when wix code is not provisioned', function() {
                var ps;

                beforeEach(function() {
                    ps = createPrivateServices({});
                });

                it('should call the server with the right end point and params', function (done) {
                    var fakeResponse = getCreateAppResponse();
                    var expectedUrl = getWixCodeProvisionUrl(ps);

                    fakeAjaxSuccess(fakeResponse);

                    wixCodeLifecycleService.provision(ps)
                        .then(validate)
                        .catch(expectPromiseToBeResolved(done));

                    function validate() {
                        expect(getUrlFromAjaxSpy()).toEqual(expectedUrl);
                        expect(getBodyFromAjaxSpy()).toEqual({});
                        done();
                    }
                });

                describe('on success', function () {
                    it('should call the given success callback', function (done) {
                        var expectedClientSpec = generateProvisionedClientSpec();
                        var fakeResponse = getCreateAppResponse();

                        fakeAjaxSuccess(fakeResponse);

                        wixCodeLifecycleService.provision(ps)
                            .then(validate)
                            .catch(expectPromiseToBeResolved(done));

                        function validate(result) {
                            expect(result).toEqual(expectedClientSpec);
                            done();
                        }
                    });

                    it('should add the app to the client spec map', function (done) {
                        var expectedClientSpec = generateProvisionedClientSpec();
                        var fakeResponse = getCreateAppResponse();

                        fakeAjaxSuccess(fakeResponse);

                        wixCodeLifecycleService.provision(ps)
                            .then(validate)
                            .catch(expectPromiseToBeResolved(done));

                        function validate() {
                            expect(clientSpecMap.getAppData(ps, expectedClientSpec.applicationId)).toEqual(expectedClientSpec);
                            done();
                        }
                    });

                    it('should update wixCodeModel with scari and gridAppId', function(done) {
                        var fakeResponse = getCreateAppResponse();

                        fakeAjaxSuccess(fakeResponse);

                        wixCodeLifecycleService.provision(ps)
                            .then(validate)
                            .catch(expectPromiseToBeResolved(done));

                        function validate() {
                            var scari = wixCodeModelService.getScari(ps);
                            var gridAppId = wixCodeModelService.getGridAppId(ps);
                            expect(scari).toEqual(fakeResponse.scari);
                            expect(gridAppId).toEqual(fakeResponse.gridAppId);
                            done();
                        }
                    });

                    it('should set the app to be writeable', function(done) {
                        var fakeResponse = getCreateAppResponse();

                        fakeAjaxSuccess(fakeResponse);

                        var appReadOnlyPointer = ps.pointers.wixCode.getIsAppReadOnly();
                        ps.dal.set(appReadOnlyPointer, true);

                        wixCodeLifecycleService.provision(ps)
                            .then(validate)
                            .catch(expectPromiseToBeResolved(done));

                        function validate() {
                            expect(ps.dal.get(appReadOnlyPointer)).toBe(false);
                            done();
                        }
                    });
                });

                describe('on error', function () {
                    it('should not add the app to the client spec map', function (done) {
                        fakeAjaxError();

                        wixCodeLifecycleService.provision(ps)
                            .then(expectPromiseToBeRejected(done))
                            .catch(validate);

                        function validate() {
                            expect(clientSpecMap.getAppsData(ps)).toEqual({});
                            done();
                        }
                    });

                    it('should call the given error callback', function (done) {
                        var expectedErrorObject = {success: false, payload: {}};
                        fakeAjaxError();

                        wixCodeLifecycleService.provision(ps)
                            .then(expectPromiseToBeRejected(done))
                            .catch(validate);

                        function validate(error) {
                            expect(error).toEqual(expectedErrorObject);
                            done();
                        }
                    });
                });
            });
        });

        describe('markAppImmutable', function () {
            var savedClientSpec = {
                appDefinitionId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
                applicationId: 14,
                extensionId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
                signature: '02baa083df8d4f720a36e8c9ed450f7612a690a4.eyJjb2RlQXBwSWQiOiI2MzhkODcwMS0xYjkyLTQxMzctYTZiOC1kNzZkYzM3MWFiYjkiLCJpbnN0YW5jZUlkIjoiYWViOGVhOGEtZWEzNy00ZTY2LWE1MzgtZWZiZTVlOGQzZjEwIiwiY29ycmVsYXRpb25JZCI6ImU4NmU0NmEyLTc5YzUtNDdlNS05OTIwLTQ2ZWRkNTE2ZmNiMCIsInNlc3Npb25VSWQiOiIxYWM3ZDlhNy1iYmE0LTQ2MGMtOWQxZC1iM2M3NzUwMzU0MzQiLCJzaWduRGF0ZSI6MTQ3NDM1NzkyMjQwMn0=',
                instance: '3eeed575c90c4f84fbb0d9c9cb72f3b7bac09b95.eyJleHRlbnNpb25JZCI6IjhmMmEwYjZkLTg4ZGItNDMwNi1iZmUyLTFiMjQ3Y2NiNTMzYiIsImluc3RhbmNlSWQiOiI4ZjJhMGI2ZC04OGRiLTQzMDYtYmZlMi0xYjI0N2NjYjUzM2IiLCJzaWduRGF0ZSI6MTQ0OTE0ODE0ODE3OCwidWlkIjpudWxsLCJwZXJtaXNzaW9ucyI6bnVsbH0=',
                instanceId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
                type: 'siteextension'
            };
            var customClientSpecMap = {
                14: savedClientSpec
            };

            function getMarkImmutableUrl(snapshot) {
                var baseUrl = snapshot.serviceTopology[constants.WIX_CODE_SERVICE_URL_KEY];
                var gridAppId = _.get(snapshot, constants.paths.GRID_APP_ID);

                return baseUrl + '/api/apps/' + gridAppId + '/save';
            }

            function createSnapshot(siteData) {
                return _.pick(siteData, ['serviceTopology', 'rendererModel']);
            }

            it('should reject when no wixCode app', function (done) {
                var siteData = createDataForSnapshot({});
                var snapshot = createSnapshot(siteData);

                wixCodeLifecycleService.markAppImmutable(wixImmutable.fromJS(snapshot)).catch(validate);

                function validate() {
                    expect(utils.ajaxLibrary.ajax).not.toHaveBeenCalled();
                    done();
                }
            });

            it('should call the server with the right end point and params', function (done) {
                var siteData = createDataForSnapshot(customClientSpecMap);
                var snapshot = createSnapshot(siteData);

                var expectedUrl = getMarkImmutableUrl(snapshot);
                var expectedRequestScari = _.get(snapshot, constants.paths.SCARI);
                var expectedRequestSi = savedClientSpec.signature;

                fakeAjaxSuccess();

                wixCodeLifecycleService.markAppImmutable(wixImmutable.fromJS(snapshot)).then(validate);

                function validate() {
                    expect(getUrlFromAjaxSpy()).toEqual(expectedUrl);
                    var headers = getHeadersFromAjaxSpy();
                    expect(headers['X-Wix-Si']).toEqual(expectedRequestSi);
                    expect(headers['X-Wix-Scari']).toEqual(expectedRequestScari);
                    done();
                }
            });

            it('should reject when server fails', function (done) {
                var siteData = createDataForSnapshot(customClientSpecMap);
                var snapshot = createSnapshot(siteData);

                fakeAjaxError();

                wixCodeLifecycleService.markAppImmutable(wixImmutable.fromJS(snapshot)).catch(validate);

                function validate() {
                    done();
                }
            });
        });

        describe('ensureAppIsWriteable', function () {
            var customClientSpecMap = {
                14: wixCodeSavedClientSpec
            };

            function getCloneAppUrl(ps) {
                var baseUrl = getWixCodeServiceUrl(ps);
                var gridAppId = wixCodeModelService.getGridAppId(ps);

                return baseUrl + '/api/apps/' + gridAppId + '/clone';
            }

            function getCloneAppResponse() {
                return {
                    "gridAppId": "bb2cfdd8-075c-4250-8665-21999940bc3b",
                    "si": "1b7674fea8700e9349fc02effa1db5850d1c0993.eyJleHRlbnNpb25JZCI6IjRmMGEyMGFhLWFhNTktNDc1ZS1hYWU0LThmZDlkMTQ1Yzk3ZCIsImluc3RhbmNlSWQiOiI3NGUzMGQ3OC04ZWU0LTRkMzMtOGMyNi01OWE3NGZiNDJjODAiLCJzaWduRGF0ZSI6MTQ2MzkxODAxNDk1OCwidWlkIjpudWxsLCJwZXJtaXNzaW9ucyI6bnVsbCwiaHRtbFNpdGVJZCI6ImM0ZTVhNDAyLWJkMTgtNDJlYy04NDRiLTlmMWI3MTlhNTU3MiJ9",
                    "scari": "d3c0941d9327bdd459745539e3c9163bfffde90a.eyJncmlkQXBwSWQiOiJiYjJjZmRkOC0wNzVjLTQyNTAtODY2NS0yMTk5OTk0MGJjM2IiLCJodG1sU2l0ZUlkIjoiYzRlNWE0MDItYmQxOC00MmVjLTg0NGItOWYxYjcxOWE1NTcyIiwiaXNWaWV3UmV2aXNpb24iOmZhbHNlLCJkZW1vSWQiOm51bGwsInNpZ25EYXRlIjoxNDYzOTE4MDE0OTU4fQ=="
                };
            }

            function setReadonly(ps, isReadonly) {
                var pointer = ps.pointers.wixCode.getIsAppReadOnly();
                ps.dal.set(pointer, isReadonly);
            }

            beforeEach(function() {
                var appWriteableStateData = null;
                spyOn(appWriteableState, 'getState').and.callFake(function() {
                    return appWriteableStateData;
                });
                spyOn(appWriteableState, 'setState').and.callFake(function(state) {
                    appWriteableStateData = state;
                });
            });

            it('should reject when no wixCode app', function (done) {
                var ps = createPrivateServices({});

                wixCodeLifecycleService.ensureAppIsWriteable(ps).catch(validate);

                function validate() {
                    expect(utils.ajaxLibrary.ajax).not.toHaveBeenCalled();
                    done();
                }
            });

            it('should initiate clone when app is readonly', function (done) {
                var ps = createPrivateServices(customClientSpecMap);

                setReadonly(ps, true);

                var fakeResponse = getCloneAppResponse();
                var expectedUrl = getCloneAppUrl(ps);
                var expectedRequestScari = wixCodeModelService.getScari(ps);
                var expectedRequestSi = wixCodeSavedClientSpec.signature;

                fakeAjaxSuccess(fakeResponse);

                wixCodeLifecycleService.ensureAppIsWriteable(ps).then(validate);

                function validate() {
                    expect(getUrlFromAjaxSpy()).toEqual(expectedUrl);
                    var headers = getHeadersFromAjaxSpy();
                    expect(headers['X-Wix-Si']).toEqual(expectedRequestSi);
                    expect(headers['X-Wix-Scari']).toEqual(expectedRequestScari);
                    done();
                }
            });

            it('should reset appWriteableState when cloneApp succeeds', function (done) {
                var ps = createPrivateServices(customClientSpecMap);

                setReadonly(ps, true);

                var fakeResponse = getCloneAppResponse();

                fakeAjaxSuccess(fakeResponse);

                wixCodeLifecycleService.ensureAppIsWriteable(ps).then(validate);

                function validate() {
                    expect(appWriteableState.getState()).toBe(null);
                    done();
                }
            });

            it('should reject when cloneApp fails', function (done) {
                var expectedErrorObject = {success: false, payload: {}};
                var ps = createPrivateServices(customClientSpecMap);

                setReadonly(ps, true);

                fakeAjaxError();

                wixCodeLifecycleService.ensureAppIsWriteable(ps).catch(validate);

                function validate(error) {
                    expect(error).toEqual(expectedErrorObject);
                    done();
                }
            });

            it('should reset appWriteableState when cloneApp fails', function (done) {
                var ps = createPrivateServices(customClientSpecMap);

                setReadonly(ps, true);

                fakeAjaxError();

                wixCodeLifecycleService.ensureAppIsWriteable(ps).catch(validate);

                function validate() {
                    expect(appWriteableState.getState()).toBe(null);
                    done();
                }
            });

            it('should wait for pending clone when app is readonly and a clone operation is in progress', function(done) {
                var ps = createPrivateServices(customClientSpecMap);

                setReadonly(ps, true);

                var validateCalled = false;
                var pendingClone = new Promise(function(resolve) {
                    _.defer(function() {
                        expect(validateCalled).toBe(false);
                        resolve();
                    });
                });
                appWriteableState.setState(pendingClone);

                appWriteableState.setState.calls.reset();

                wixCodeLifecycleService.ensureAppIsWriteable(ps).then(validate);

                function validate() {
                    validateCalled = true;
                    expect(utils.ajaxLibrary.ajax).not.toHaveBeenCalled();
                    done();
                }
            });

            it('should not initiate clone when app is writeable', function(done) {
                var ps = createPrivateServices(customClientSpecMap);

                setReadonly(ps, false);

                wixCodeLifecycleService.ensureAppIsWriteable(ps).then(validate);

                function validate() {
                    expect(utils.ajaxLibrary.ajax).not.toHaveBeenCalled();
                    done();
                }
            });

        });

        describe('save', function () {
            var savedClientSpec = {
                appDefinitionId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
                applicationId: 14,
                extensionId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
                signature: '02baa083df8d4f720a36e8c9ed450f7612a690a4.eyJjb2RlQXBwSWQiOiI2MzhkODcwMS0xYjkyLTQxMzctYTZiOC1kNzZkYzM3MWFiYjkiLCJpbnN0YW5jZUlkIjoiYWViOGVhOGEtZWEzNy00ZTY2LWE1MzgtZWZiZTVlOGQzZjEwIiwiY29ycmVsYXRpb25JZCI6ImU4NmU0NmEyLTc5YzUtNDdlNS05OTIwLTQ2ZWRkNTE2ZmNiMCIsInNlc3Npb25VSWQiOiIxYWM3ZDlhNy1iYmE0LTQ2MGMtOWQxZC1iM2M3NzUwMzU0MzQiLCJzaWduRGF0ZSI6MTQ3NDM1NzkyMjQwMn0=',
                instance: '3eeed575c90c4f84fbb0d9c9cb72f3b7bac09b95.eyJleHRlbnNpb25JZCI6IjhmMmEwYjZkLTg4ZGItNDMwNi1iZmUyLTFiMjQ3Y2NiNTMzYiIsImluc3RhbmNlSWQiOiI4ZjJhMGI2ZC04OGRiLTQzMDYtYmZlMi0xYjI0N2NjYjUzM2IiLCJzaWduRGF0ZSI6MTQ0OTE0ODE0ODE3OCwidWlkIjpudWxsLCJwZXJtaXNzaW9ucyI6bnVsbH0=',
                instanceId: '8f2a0b6d-88db-4306-bfe2-1b247ccb533b',
                type: 'siteextension'
            };
            var unsavedClientSpec = _.assign({}, savedClientSpec, {
                applicationId: 15,
                wixCodeNotProvisioned: true
            });
            var customClientSpecMap = {
                14: savedClientSpec,
                15: unsavedClientSpec
            };
            var responseClientSpecMap = {
                clientSpecMap: {
                    14: savedClientSpec,
                    15: _.omit(unsavedClientSpec, 'wixCodeNotProvisioned')
                }
            };

            function createSnapshot(siteData) {
                return _.pick(siteData, ['serviceTopology', 'rendererModel']);
            }

            beforeEach(function() {
                this.save = function(snapshot, res, rej) {
                    wixCodeLifecycleService.save(wixImmutable.fromJS(snapshot), res, rej);
                };
            });

            it('should call the server with the right end point and params', function () {
                var wixCodeModel = {
                    appData: {
                        codeAppId: unsavedClientSpec.extensionId
                    },
                    signedAppRenderInfo: 'ff6ddb65a01c00fd6f57cc7415d82002eff163ad.eyJncmlkQXBwSWQiOiIwMGUyOWM0MS0wNzUxLTQxOTItOTE1YS1iNTY2MzhjNGJmMjMiLCJjb3JyZWxhdGlvbklkIjoiYzBlYzQzMzYtNmU1My00M2YwLTgxODctYmUzNDZmNWU5NzY2Iiwic2Vzc2lvblVJZCI6IjFhYzdkOWE3LWJiYTQtNDYwYy05ZDFkLWIzYzc3NTAzNTQzNCIsImlzVmlld1JldmlzaW9uIjpmYWxzZSwiZGVtb0lkIjpudWxsLCJzaWduRGF0ZSI6MTQ3NDI5MDM4NTkwOH0='
                };
                var siteData = createDataForSnapshot(customClientSpecMap, wixCodeModel);
                var snapshot = createSnapshot(siteData);
                var resolve = jasmine.createSpy('resolve');
                var reject = jasmine.createSpy('reject');

                this.save(snapshot, resolve, reject);

                expect(reject).not.toHaveBeenCalled();
                expect(getUrlFromAjaxSpy()).toEqual(appStoreBaseUrl + 'save');
                expect(getBodyFromAjaxSpy()).toEqual({
                    metaSiteId: siteData.rendererModel.metaSiteId,
                    codeAppSpec: {
                        codeAppId: unsavedClientSpec.extensionId,
                        applicationId: unsavedClientSpec.applicationId.toString(),
                        signedInstance: unsavedClientSpec.signature,
                        instanceId: unsavedClientSpec.instanceId,
                        signedCodeAppInfo: _.get(snapshot, constants.paths.SCARI)
                    }
                });
            });

            it('should do nothing and call the success callback if wixCode is not provisioned', function (done) {
                var siteData = createDataForSnapshot({});
                var snapshot = createSnapshot(siteData);
                var resolve = jasmine.createSpy('resolve').and.callFake(validate);
                var reject = jasmine.createSpy('reject');

                this.save(snapshot, resolve, reject);

                function validate() {
                    expect(ajaxSpy).not.toHaveBeenCalled();
                    expect(reject).not.toHaveBeenCalled();
                    done();
                }
            });

            it('should call the given success callback if request was successful', function (done) {
                var siteData = createDataForSnapshot(customClientSpecMap);
                var snapshot = createSnapshot(siteData);
                var resolve = jasmine.createSpy('resolve').and.callFake(validate);
                var reject = jasmine.createSpy('reject');
                fakeAjaxSuccess(responseClientSpecMap);

                this.save(snapshot, resolve, reject);

                function validate(result) {
                    expect(reject).not.toHaveBeenCalled();
                    expect(result).toEqual({payload: responseClientSpecMap, success: true});
                    done();
                }
            });

            it('should call the given error callback if request was not successful', function (done) {
                var siteData = createDataForSnapshot(customClientSpecMap);
                var snapshot = createSnapshot(siteData);
                var resolve = jasmine.createSpy('resolve');
                var reject = jasmine.createSpy('reject').and.callFake(validate);
                var expectedErrorObject = {success: false, payload: {}};
                fakeAjaxError();

                this.save(snapshot, resolve, reject);

                function validate(error) {
                    expect(resolve).not.toHaveBeenCalled();
                    expect(error).toEqual(expectedErrorObject);
                    done();
                }
            });
        });

        describe('isProvisioned', function () {
            it('should return `true` if wix code is provisioned', function () {
                var customClientSpecMap = {
                    14: wixCodeSavedClientSpec
                };

                var ps = createPrivateServices(customClientSpecMap);

                var isProvisioned = wixCodeLifecycleService.isProvisioned(ps);

                expect(isProvisioned).toBeTruthy();
            });

            it('should return `false` if wix code is not provisioned', function () {
                var ps = createPrivateServices({});

                var isProvisioned = wixCodeLifecycleService.isProvisioned(ps);

                expect(isProvisioned).toBeFalsy();
            });
        });
    });
});
