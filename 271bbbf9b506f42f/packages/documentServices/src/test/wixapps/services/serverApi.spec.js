define([
    'bluebird',
    'lodash',
    'testUtils',
    'utils',
    'documentServices/wixapps/utils/pathUtils',
    'documentServices/wixapps/services/items',
    'documentServices/wixapps/utils/requestPayloadCreator',
    'documentServices/wixapps/services/serverApi',
    'documentServices/wixapps/bi/events',
    'documentServices/wixapps/bi/errors'
], function (Promise, _, testUtils, utils, pathUtils, items, requestPayloadCreator, serverApi, BI_EVENTS, BI_ERRORS) {
    'use strict';

    function getRepo(repo) {
        var defaultRepo = {
            applicationInstanceVersion: 0,
            dataProviders: {wixdb: {type: "WixDb"}},
            dataSelectors: {},
            pages: {},
            parts: {},
            types: {},
            views: {}
        };

        return _.assign(defaultRepo, repo);
    }

    function getDataItems(created, updated, deleted) {
        return {
            created: created || [],
            updated: updated || [],
            deleted: deleted || []
        };
    }

    function getOperationResult(id, error) {
        var result = {
            payload: {
                id: id
            },
            success: _.isUndefined(error)
        };

        if (error) {
            _.assign(result, error);
        }

        return result;
    }

    function getDataItem(newId) {
        return {
            _iid: newId,
            _type: 'type',
            title: 'title'
        };
    }


    function getSavItemsResponse(results, errorCode) {
        var response = {
            success: _.isUndefined(errorCode)
        };

        if (!_.isEmpty(results)) {
            response.payload = {
                results: results
            };
        }

        if (!response.success) {
            response.errorCode = errorCode;
        }

        return response;
    }

    function fakeServerSuccess(payload) {
        spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
            doneCallback({
                success: true,
                payload: payload
            });
        });
    }

    function fakeServerError(payload, errorCode, errorDescription) {
        spyOn(console, 'warn');
        spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
            doneCallback({
                errorCode: errorCode,
                errorDescription: errorDescription,
                success: false,
                payload: payload
            });
        });
    }

    describe('wixapps server API', function () {
        var appInstance, fakeBiCallbacks;

        beforeEach(function () {
            appInstance = {
                applicationInstanceId: '12345',
                applicationInstanceVersion: '0'
            };
            fakeBiCallbacks = {
                error: jasmine.createSpy('bi.error'),
                event: jasmine.createSpy('bi.event')
            };
        });

        describe('saveRepo', function () {
            it('should resolve with null when there is no repo changes', function (done) {
                spyOn(utils.requestsUtil, 'createAndSendRequest');
                serverApi.saveRepo(appInstance, undefined, fakeBiCallbacks)
                    .then(function (changes) {
                        expect(utils.requestsUtil.createAndSendRequest).not.toHaveBeenCalled();
                        expect(changes).toBeNull();
                        done();
                    })
                    .catch(function () {
                        expect("error function shouldn't be called").toBeUndefined();
                        done();
                    });
            });

            it('should resolve with the new applicationInstanceVersion from the server response', function (done) {
                var newVersion = 2;
                spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
                    doneCallback({
                        success: true,
                        payload: {applicationInstanceVersion: newVersion}
                    });
                });

                serverApi.saveRepo(appInstance, getRepo(), fakeBiCallbacks)
                    .then(function (changes) {
                        var expectedRequest = {
                            urls: [utils.urlUtils.origin() + '/apps/appBuilder/saved/' + appInstance.applicationInstanceId + '?checkConcurrentModification=true']
                        };
                        expect(utils.requestsUtil.createAndSendRequest).toHaveBeenCalledWith(jasmine.objectContaining(expectedRequest), jasmine.any(Function), jasmine.any(Function));

                        var expectedChanges = {};
                        expectedChanges[pathUtils.getApplicationInstanceVersionPath().join('.')] = newVersion;
                        expect(changes).toEqual(expectedChanges);
                        done();
                    })
                    .catch(function () {
                        expect('saveRepo should resolved and not reject').toBeFalsy();
                        done();
                    });
            });

            it('should set dataProviderId for data selectors which do not have it', function (done) {
                spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
                    expect(request.data.dataSelectors.ds1.dataProviderId).toEqual('wixdb');
                    doneCallback({
                        success: true,
                        payload: {applicationInstanceVersion: 2}
                    });
                });

                serverApi.saveRepo(appInstance, getRepo({dataSelectors: {ds1: {}}}), fakeBiCallbacks)
                    .then(function () {
                        done();
                    })
                    .catch(function () {
                        expect('saveRepo should resolved and not reject').toBeFalsy();
                        done();
                    });
            });

            it('should reject when there was a server error', function (done) {
                var errorCode = -1;
                spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
                    doneCallback({
                        success: false,
                        errorCode: errorCode,
                        payload: undefined
                    });
                });

                serverApi.saveRepo(appInstance, getRepo(), fakeBiCallbacks)
                    .then(function () {
                        expect('saveRepo should reject and not resolved').toBeFalsy();
                        done();
                    })
                    .catch(function (payload) {
                        expect(utils.requestsUtil.createAndSendRequest).toHaveBeenCalled();
                        expect(payload).toEqual(jasmine.objectContaining({errorCode: errorCode, changes: null}));
                        done();
                    });

            });

            it('should reject when there is an HTTP error', function (done) {
                var errorCode = 404;
                spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
                    doneCallback(errorCode, 'NOT FOUND');
                });

                serverApi.saveRepo(appInstance, getRepo(), fakeBiCallbacks)
                    .then(function () {
                        expect('saveRepo should reject and not resolved').toBeFalsy();
                        done();
                    })
                    .catch(function (changes) {
                        expect(utils.requestsUtil.createAndSendRequest).toHaveBeenCalled();
                        expect(changes).toEqual(jasmine.objectContaining({errorCode: errorCode, changes: null}));
                        done();
                    });
            });

            describe('bi events', function () {
                describe('on success', function () {
                    it('should send before & success bi events on successful save', function () {
                        var serverPayload = {applicationInstanceVersion: '889977'};
                        fakeServerSuccess(serverPayload);

                        var expectedBeforeEvent = {
                            event: BI_EVENTS.BEFORE_SAVING_REPO,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion
                            })
                        };

                        var expectedSuccessEvent = {
                            event: BI_EVENTS.SUCCESS_SAVING_REPO,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                old_app_instance_version: appInstance.applicationInstanceVersion,
                                new_app_instance_version: '889977'
                            })
                        };

                        serverApi.saveRepo(appInstance, getRepo(), fakeBiCallbacks);

                        expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedBeforeEvent.event, expectedBeforeEvent.props);
                        expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedSuccessEvent.event, expectedSuccessEvent.props);
                    });
                });

                describe('on error', function () {
                    it('should send before & error bi events on bad save', function (done) {
                        fakeServerError(null, -1234, 'test error description');

                        var expectedBeforeEvent = {
                            event: BI_EVENTS.BEFORE_SAVING_REPO,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion
                            })
                        };

                        var expectedErrorEvent = {
                            event: BI_ERRORS.LIST_BUILDER_ERROR_SAVING_REPO,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion,
                                error_code: -1234,
                                error_description: 'test error description'
                            })
                        };

                        serverApi.saveRepo(appInstance, getRepo(), fakeBiCallbacks)
                            .catch(function () {
                                expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedBeforeEvent.event, expectedBeforeEvent.props);
                                expect(fakeBiCallbacks.error).toHaveBeenCalledWith(expectedErrorEvent.event, expectedErrorEvent.props);
                                done();
                            });
                    });
                });

                it('should send before & skipped bi events when there is no need to save the repo', function () {
                    fakeServerSuccess();

                    var repo = null;

                    var expectedBeforeEvent = {
                        event: BI_EVENTS.BEFORE_SAVING_REPO,
                        props: jasmine.objectContaining({
                            app_instance_id: appInstance.applicationInstanceId,
                            app_instance_version: appInstance.applicationInstanceVersion
                        })
                    };

                    var expectedSkippedEvent = {
                        event: BI_EVENTS.SKIPPED_SAVING_REPO,
                        props: jasmine.objectContaining({
                            app_instance_id: appInstance.applicationInstanceId,
                            app_instance_version: appInstance.applicationInstanceVersion
                        })
                    };

                    serverApi.saveRepo(appInstance, repo, fakeBiCallbacks);

                    expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedBeforeEvent.event, expectedBeforeEvent.props);
                    expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedSkippedEvent.event, expectedSkippedEvent.props);
                });
            });
        });

        describe('saveItems', function () {
            it('should resolve without sending request when there are no items to save', function (done) {
                spyOn(utils.requestsUtil, 'createAndSendRequest');
                serverApi.saveItems(appInstance, getDataItems(), fakeBiCallbacks)
                    .then(function (changes) {
                        expect(utils.requestsUtil.createAndSendRequest).not.toHaveBeenCalled();
                        expect(changes).toBeNull();
                        done();
                    })
                    .catch(function () {
                        expect("error function shouldn't be called").toBeUndefined();
                        done();
                    });
            });

            it('should resolve and send request to the correct url when there are items to save', function (done) {
                var id = 'id1';
                var dataItems = getDataItems([getDataItem(id)]);
                spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
                    doneCallback(getSavItemsResponse(getOperationResult(id)));
                });
                var operations = [getOperationResult(id)];
                spyOn(requestPayloadCreator, 'getSaveItemsOperations').and.returnValue(operations);
                serverApi.saveItems(appInstance, dataItems, fakeBiCallbacks)
                    .then(function () {
                        var expectedRequest = {
                            urls: [utils.urlUtils.origin() + '/apps/appBuilder/1/editor/Batch?checkConcurrentModification=true']
                        };
                        expect(utils.requestsUtil.createAndSendRequest).toHaveBeenCalledWith(jasmine.objectContaining(expectedRequest), jasmine.any(Function), jasmine.any(Function));
                        done();
                    })
                    .catch(testUtils.jasmineHelper.getFailTestMethod('reject', done));
            });

            it('should not update states for already saved or published items', function (done) {
                var ids = ['created', 'updated', 'delete'];
                spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
                    var results = _.map(ids, function (id) {
                        return getOperationResult(id);
                    });

                    doneCallback(getSavItemsResponse(results));
                });

                var dataItems = getDataItems([getDataItem(ids[0])], [getDataItem(ids[1])], [getDataItem(ids[2])]);

                serverApi.saveItems(appInstance, dataItems, fakeBiCallbacks)
                    .then(function (changes) {
                        expect(utils.requestsUtil.createAndSendRequest).toHaveBeenCalled();

                        var expectedChanges = {};
                        expectedChanges[pathUtils.getItemPath('type', 'created', '_state').join('.')] = items.STATES.SAVED;
                        expect(changes).toEqual(expectedChanges);
                        done();
                    })
                    .catch(testUtils.jasmineHelper.getFailTestMethod('reject', done));

            });

            it('should send save request and resolve with changes to state of successful saved items', function (done) {
                var newIds = ['1', '2'];
                spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
                    var results = _.map(newIds, function (id) {
                        return getOperationResult(id);
                    });

                    doneCallback(getSavItemsResponse(results));
                });

                var created = _.map(newIds, getDataItem);

                serverApi.saveItems(appInstance, getDataItems(created), fakeBiCallbacks)
                    .then(function (changes) {
                        expect(utils.requestsUtil.createAndSendRequest).toHaveBeenCalled();

                        var expectedChanges = _.transform(newIds, function (acc, newId) {
                            acc[pathUtils.getItemPath('type', newId, '_state').join('.')] = items.STATES.SAVED;
                        }, {});
                        expect(changes).toEqual(expectedChanges);
                        done();
                    })
                    .catch(testUtils.jasmineHelper.getFailTestMethod('reject', done));
            });

            it('should reject on partial error with changes to all successful operations', function (done) {
                var successId = '1';
                var failedId = '2';

                spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
                    var results = [getOperationResult(successId), getOperationResult(failedId, {
                        errorCode: -1234,
                        errorDescription: 'Error Message'
                    })];
                    doneCallback(getSavItemsResponse(results, '-1212'));
                });

                var successDataItem = getDataItem(successId);
                var created = [successDataItem, getDataItem(failedId)];
                serverApi.saveItems(appInstance, getDataItems(created), fakeBiCallbacks)
                    .then(testUtils.jasmineHelper.getFailTestMethod('resolve', done))
                    .catch(function (changes) {
                        expect(utils.requestsUtil.createAndSendRequest).toHaveBeenCalled();

                        var expectedChanges = {};
                        expectedChanges[pathUtils.getItemPath('type', successId).join('.')] = _.assign(successDataItem, {_status: items.STATES.SAVED});
                        expect(changes).toEqual({errorCode: '-1212', changes: expectedChanges});
                        done();
                    });
            });

            it('should reject on error without any changes', function (done) {
                spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
                    doneCallback('404', 'NOT FOUND');
                });

                var created = [getDataItem('1'), getDataItem('2')];
                serverApi.saveItems(appInstance, getDataItems(created), fakeBiCallbacks)
                    .then(testUtils.jasmineHelper.getFailTestMethod('resolve', done))
                    .catch(function (changes) {
                        expect(utils.requestsUtil.createAndSendRequest).toHaveBeenCalled();
                        expect(changes).toEqual({errorCode: '404', changes: null});
                        done();
                    });
            });

            describe('bi events', function () {

                var created, updated, deleted, allSavedItemIds;
                beforeEach(function () {
                    created = [getDataItem('created_1'), getDataItem('created_2')];
                    updated = [getDataItem('updated_1'), getDataItem('updated_2')];
                    deleted = ['deleted_1', 'deleted_2'];
                    allSavedItemIds = _.flattenDeep([_.pluck(updated, '_iid'), _.pluck(created, '_iid'), deleted]);
                });

                describe('on success', function () {
                    it('should send before & success bi events on successful save', function () {
                        var serverPayload = {
                            results: _.map(allSavedItemIds, function (itemId) {
                                return {payload: {id: itemId}};
                            })
                        };
                        fakeServerSuccess(serverPayload);

                        var expectedBeforeEvent = {
                            event: BI_EVENTS.BEFORE_SAVING_ITEMS,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion,
                                item_ids_to_create: _.pluck(created, '_iid').join(','),
                                item_ids_to_update: _.pluck(updated, '_iid').join(','),
                                item_ids_to_delete: deleted.join(',')
                            })
                        };

                        var expectedSuccessEvent = {
                            event: BI_EVENTS.SUCCESS_SAVING_ITEMS,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion,
                                saved_item_ids: allSavedItemIds.join(',')
                            })
                        };

                        serverApi.saveItems(appInstance, getDataItems(created, updated, deleted), fakeBiCallbacks);

                        expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedBeforeEvent.event, expectedBeforeEvent.props);
                        expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedSuccessEvent.event, expectedSuccessEvent.props);
                    });

                    it('should not crash when server\'ss response data is missing required attributes', function () {
                        fakeServerSuccess(null); // no payload

                        var expectedSuccessEvent = {
                            event: BI_EVENTS.SUCCESS_SAVING_ITEMS,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion,
                                saved_item_ids: ''
                            })
                        };

                        serverApi.saveItems(appInstance, getDataItems(created, updated, deleted), fakeBiCallbacks);

                        expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedSuccessEvent.event, expectedSuccessEvent.props);
                    });
                });

                describe('on error', function () {
                    it('should send before & error bi events on bad save', function (done) {
                        fakeServerError(null, -1234, 'test error description');

                        var expectedBeforeEvent = {
                            event: BI_EVENTS.BEFORE_SAVING_ITEMS,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion,
                                item_ids_to_create: _.pluck(created, '_iid').join(','),
                                item_ids_to_update: _.pluck(updated, '_iid').join(','),
                                item_ids_to_delete: deleted.join(',')
                            })
                        };

                        var expectedErrorEvent = {
                            event: BI_ERRORS.LIST_BUILDER_ERROR_SAVING_ITEMS,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion,
                                error_code: -1234,
                                error_description: 'test error description'
                            })
                        };

                        serverApi.saveItems(appInstance, getDataItems(created, updated, deleted), fakeBiCallbacks)
                            .catch(function () {
                                expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedBeforeEvent.event, expectedBeforeEvent.props);
                                expect(fakeBiCallbacks.error).toHaveBeenCalledWith(expectedErrorEvent.event, expectedErrorEvent.props);
                                done();
                            });
                    });

                    it('should not crash when server\'ss response data is missing required attributes', function (done) {
                        fakeServerError(); // no payload, error code or decription

                        var expectedErrorEvent = {
                            event: BI_ERRORS.LIST_BUILDER_ERROR_SAVING_ITEMS,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion,
                                error_code: undefined,
                                error_description: undefined
                            })
                        };

                        serverApi.saveItems(appInstance, getDataItems(created, updated, deleted), fakeBiCallbacks)
                            .catch(function () {
                                expect(fakeBiCallbacks.error).toHaveBeenCalledWith(expectedErrorEvent.event, expectedErrorEvent.props);
                                done();
                            });

                    });
                });

                it('should send before & skipped bi events when there is no need to save any item', function () {
                    var itemsToSave = getDataItems(); // empty

                    var expectedBeforeEvent = {
                        event: BI_EVENTS.BEFORE_SAVING_ITEMS,
                        props: jasmine.objectContaining({
                            app_instance_id: appInstance.applicationInstanceId,
                            app_instance_version: appInstance.applicationInstanceVersion,
                            item_ids_to_create: '',
                            item_ids_to_update: '',
                            item_ids_to_delete: ''
                        })
                    };

                    var expectedSkippedEvent = {
                        event: BI_EVENTS.SKIPPED_SAVING_ITEMS,
                        props: jasmine.objectContaining({
                            app_instance_id: appInstance.applicationInstanceId,
                            app_instance_version: appInstance.applicationInstanceVersion
                        })
                    };

                    serverApi.saveItems(appInstance, itemsToSave, fakeBiCallbacks);

                    expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedBeforeEvent.event, expectedBeforeEvent.props);
                    expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedSkippedEvent.event, expectedSkippedEvent.props);
                });
            });
        });

        describe('saveRepoAndItems', function () {
            it('should not send requests to either call saveRepo nor saveItems when the repo is empty and there are no dataItem changes', function (done) {
                spyOn(utils.requestsUtil, 'createAndSendRequest');
                serverApi.saveRepoAndItems(appInstance, null, getDataItems(), fakeBiCallbacks)
                    .then(function (changes) {
                        expect(changes).toEqual({});
                        expect(utils.requestsUtil.createAndSendRequest).not.toHaveBeenCalled();
                        done();
                    })
                    .catch(function () {
                        expect('saveRepo should resolve and not reject').toBeFalsy();
                        done();
                    });
            });

            it('should not call saveItems when saveRepo rejects', function (done) {
                spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
                    doneCallback(404, 'NOT FOUND');
                });

                spyOn(serverApi, 'saveItems').and.returnValue(Promise.resolve(null));
                serverApi.saveRepoAndItems(appInstance, {applicationInstanceVersion: 2}, getDataItems(), fakeBiCallbacks)
                    .then(function () {
                        expect('saveRepo should reject and not resolve').toBeFalsy();
                        done();
                    })
                    .catch(function (changes) {
                        expect(serverApi.saveItems).not.toHaveBeenCalled();
                        expect(changes).toEqual({errorCode: 404, changes: {}});
                        done();
                    });
            });

            it('should update applicationInstanceVersion before calling saveItems', function (done) {
                var newVersion = 5;
                spyOn(utils.requestsUtil, 'createAndSendRequest').and.callFake(function (request, doneCallback) {
                    doneCallback({
                        success: true,
                        payload: {applicationInstanceVersion: newVersion}
                    });
                });

                spyOn(serverApi, 'saveRepo').and.callThrough();
                spyOn(serverApi, 'saveItems').and.returnValue(Promise.resolve(null));

                var repo = {
                    applicationInstanceVersion: 2,
                    payload: {}
                };
                var dataItems = getDataItems();
                serverApi.saveRepoAndItems(appInstance, repo, dataItems, fakeBiCallbacks)
                    .then(function (changes) {
                        expect(serverApi.saveRepo).toHaveBeenCalledWith(appInstance, repo, fakeBiCallbacks);
                        expect(serverApi.saveItems).toHaveBeenCalledWith(jasmine.objectContaining({applicationInstanceVersion: newVersion}), dataItems, fakeBiCallbacks);
                        var expectedChanges = {};
                        expectedChanges[pathUtils.getApplicationInstanceVersionPath().join('.')] = newVersion;
                        expect(changes).toEqual(expectedChanges);
                        done();
                    })
                    .catch(function () {
                        expect('saveRepo should resolve and not reject').toBeFalsy();
                        done();
                    });
            });

            it('should return both changes of the repo and the items after success of both requests', function (done) {
                var repoChanges = {};
                repoChanges[pathUtils.getApplicationInstanceVersionPath().join('.')] = 5;
                spyOn(serverApi, 'saveRepo').and.returnValue(Promise.resolve(repoChanges));

                var itemChanges = {};
                itemChanges[pathUtils.getItemPath('type', 'itemId', '_state').join('.')] = items.STATES.SAVED;
                spyOn(serverApi, 'saveItems').and.returnValue(Promise.resolve(itemChanges));

                var repo = {
                    applicationInstanceVersion: 2,
                    payload: {}
                };
                var dataItems = getDataItems();
                serverApi.saveRepoAndItems(appInstance, repo, dataItems, fakeBiCallbacks)
                    .then(function (changes) {
                        expect(changes).toEqual(_.assign(repoChanges, itemChanges));
                        done();
                    })
                    .catch(function () {
                        expect('saveRepo should resolve and not reject').toBeFalsy();
                        done();
                    });
            });
        });

        describe('publish', function () {

            it('should resolve without any changes on success', function (done) {
                fakeServerSuccess(null);

                var expectedRequest = {
                    urls: [utils.urlUtils.origin() + '/apps/appBuilder/published/' + appInstance.applicationInstanceId]
                };
                serverApi.publish(appInstance, fakeBiCallbacks)
                    .then(function (changes) {
                        expect(utils.requestsUtil.createAndSendRequest).toHaveBeenCalledWith(jasmine.objectContaining(expectedRequest), jasmine.any(Function), jasmine.any(Function));
                        expect(changes).toBeNull();
                        done();
                    })
                    .catch(testUtils.jasmineHelper.getFailTestMethod('reject', done));
            });

            it('should reject without any changes on failure', function (done) {
                var errorCode = -1234;
                fakeServerError(null, errorCode, 'invalid instance id');

                serverApi.publish(appInstance, fakeBiCallbacks)
                    .then(testUtils.jasmineHelper.getFailTestMethod('resolve', done))
                    .catch(function (changes) {
                        expect(changes).toEqual({errorCode: errorCode});
                        done();
                    });
            });

            describe('bi events', function () {

                describe('on success', function () {
                    it('should send before & success bi events on successful publish', function () {
                        fakeServerSuccess(null);

                        var expectedBeforeEvent = {
                            event: BI_EVENTS.BEFORE_PUBLISH,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion
                            })
                        };

                        var expectedSuccessEvent = {
                            event: BI_EVENTS.SUCCESS_PUBLISH,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion
                            })
                        };

                        serverApi.publish(appInstance, fakeBiCallbacks);
                        expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedBeforeEvent.event, expectedBeforeEvent.props);
                        expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedSuccessEvent.event, expectedSuccessEvent.props);
                    });
                });

                describe('on error', function () {
                    it('should send before & error bi events on bad publish', function (done) {
                        fakeServerError('payload', -1234, 'test error description');

                        var expectedBeforeEvent = {
                            event: BI_EVENTS.BEFORE_PUBLISH,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion
                            })
                        };

                        var expectedErrorEvent = {
                            event: BI_ERRORS.LIST_BUILDER_ERROR_PUBLISH,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion,
                                error_code: -1234,
                                error_description: 'test error description'
                            })
                        };

                        serverApi.publish(appInstance, fakeBiCallbacks)
                            .catch(function () {
                                expect(fakeBiCallbacks.event).toHaveBeenCalledWith(expectedBeforeEvent.event, expectedBeforeEvent.props);
                                expect(fakeBiCallbacks.error).toHaveBeenCalledWith(expectedErrorEvent.event, expectedErrorEvent.props);
                                done();
                            });
                    });

                    it('should not crash when server\'ss response data is missing required attributes', function (done) {
                        fakeServerError(); // no payload, error code or decription

                        var expectedErrorEvent = {
                            event: BI_ERRORS.LIST_BUILDER_ERROR_PUBLISH,
                            props: jasmine.objectContaining({
                                app_instance_id: appInstance.applicationInstanceId,
                                app_instance_version: appInstance.applicationInstanceVersion,
                                error_code: undefined,
                                error_description: undefined
                            })
                        };

                        serverApi.publish(appInstance, fakeBiCallbacks)
                            .catch(function () {
                                expect(fakeBiCallbacks.error).toHaveBeenCalledWith(expectedErrorEvent.event, expectedErrorEvent.props);
                                done();
                            });
                    });
                });

            });

        });

    });
});
