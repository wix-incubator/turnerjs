define(['lodash', 'documentServices/wixapps/utils/requestPayloadCreator'], function (_, requestPayloadCreator) {
    'use strict';

    describe('requestPayloadCreator', function () {
        var appInstance = {
            applicationInstanceId: 'xxx',
            applicationInstanceVersion: 'yyy'
        };

        function createDiff(created, updated, deleted) {
            return {
                created: created || [],
                updated: updated || [],
                deleted: deleted || []
            };
        }

        describe('getSaveItemsOperations', function () {
            it('only created items - CreateItem operation for each', function () {
                var createdItems = [{_iid: "id1"}, {_iid: "id2"}];

                var ops = requestPayloadCreator.getSaveItemsOperations(appInstance, createDiff(createdItems));

                expect(ops.length).toBe(2);
                _.forEach(createdItems, function (item, i) {
                    expect(ops[i].name).toBe('CreateItem');
                    expect(ops[i].params.applicationInstanceId).toBe('xxx');
                    expect(ops[i].params.applicationInstanceVersion).toBe('yyy');
                    expect(ops[i].params.item).toBe(item);
                });
            });

            it('only updated items - UpdateItem operation for each', function () {
                var updatedItems = [{_iid: "id1"}, {_iid: "id2"}];

                var ops = requestPayloadCreator.getSaveItemsOperations(appInstance, createDiff(null, updatedItems));

                expect(ops.length).toBe(2);
                _.forEach(updatedItems, function (item, i) {
                    expect(ops[i].name).toBe('UpdateItem');
                    expect(ops[i].params.applicationInstanceId).toBe('xxx');
                    expect(ops[i].params.applicationInstanceVersion).toBe('yyy');
                    expect(ops[i].params.item).toBe(item);
                });
            });

            it('only deleted items - DeleteItem operation for each', function () {
                var deletedItemsIds = ["id1", "id2"];

                var ops = requestPayloadCreator.getSaveItemsOperations(appInstance, createDiff(null, null, deletedItemsIds));

                expect(ops.length).toBe(2);
                _.forEach(deletedItemsIds, function (id, i) {
                    expect(ops[i].name).toBe('DeleteItem');
                    expect(ops[i].params.applicationInstanceId).toBe('xxx');
                    expect(ops[i].params.applicationInstanceVersion).toBe('yyy');
                    expect(ops[i].params.itemId).toBe(id);
                });
            });

            it('one created, one updated and one deleted - all have the matching operation', function () {
                var createdItems = [{_iid: "id1"}];
                var updatedItems = [{_iid: "id2"}];
                var deletedItemsIds = ["id3"];

                var ops = requestPayloadCreator.getSaveItemsOperations(appInstance, createDiff(createdItems, updatedItems, deletedItemsIds));

                expect(ops.length).toBe(3);
                _.forEach(ops, function (op) {
                    expect(op.params.applicationInstanceId).toBe('xxx');
                    expect(op.params.applicationInstanceVersion).toBe('yyy');
                });

                expect(ops[0].name).toBe('CreateItem');
                expect(ops[0].params.item).toBe(createdItems[0]);
                expect(ops[1].name).toBe('UpdateItem');
                expect(ops[1].params.item).toBe(updatedItems[0]);
                expect(ops[2].name).toBe('DeleteItem');
                expect(ops[2].params.itemId).toBe(deletedItemsIds[0]);
            });
        });


        xdescribe('getSaveOperations', function () {
            it('only created items - CreateItem operation for each', function () {
                var createdItems = [{_iid: "id1"}, {_iid: "id2"}];
                var payload = {
                    dataItems: createDiff(createdItems),
                    types: createDiff()
                };

                var ops = requestPayloadCreator.getSaveOperations(appInstance, payload);

                expect(ops.length).toBe(2);
                _.forEach(createdItems, function (item, i) {
                    expect(ops[i].name).toBe('CreateItem');
                    expect(ops[i].params.applicationInstanceId).toBe('xxx');
                    expect(ops[i].params.applicationInstanceVersion).toBe('yyy');
                    expect(ops[i].params.item).toBe(item);
                });
            });

            it('only updated items - UpdateItem operation for each', function () {
                var updatedItems = [{_iid: "id1"}, {_iid: "id2"}];
                var payload = {
                    dataItems: createDiff(null, updatedItems),
                    types: createDiff()
                };

                var ops = requestPayloadCreator.getSaveOperations(appInstance, payload);

                expect(ops.length).toBe(2);
                _.forEach(updatedItems, function (item, i) {
                    expect(ops[i].name).toBe('UpdateItem');
                    expect(ops[i].params.applicationInstanceId).toBe('xxx');
                    expect(ops[i].params.applicationInstanceVersion).toBe('yyy');
                    expect(ops[i].params.item).toBe(item);
                });
            });

            it('only deleted items - DeleteItem operation for each', function () {
                var deletedItemsIds = ["id1", "id2"];
                var payload = {
                    dataItems: createDiff(null, null, deletedItemsIds),
                    types: createDiff()
                };

                var ops = requestPayloadCreator.getSaveOperations(appInstance, payload);

                expect(ops.length).toBe(2);
                _.forEach(deletedItemsIds, function (id, i) {
                    expect(ops[i].name).toBe('DeleteItem');
                    expect(ops[i].params.applicationInstanceId).toBe('xxx');
                    expect(ops[i].params.applicationInstanceVersion).toBe('yyy');
                    expect(ops[i].params.itemId).toBe(id);
                });
            });

            it('only created type - one CreateTypes operation for all', function () {
                var types = [{name: 'type1'}, {name: 'type2'}];
                var payload = {
                    dataItems: createDiff(),
                    types: createDiff(types)
                };

                var ops = requestPayloadCreator.getSaveOperations(appInstance, payload);

                expect(ops.length).toBe(1);
                expect(ops[0].name).toBe('CreateTypes');
                expect(ops[0].params.applicationInstanceId).toBe('xxx');
                expect(ops[0].params.applicationInstanceVersion).toBe('yyy');
                expect(ops[0].params.types).toBe(types);
            });

            it('one created, one updated and one deleted - all have the matching operation', function () {
                var createdItems = [{_iid: "id1"}];
                var updatedItems = [{_iid: "id2"}];
                var deletedItemsIds = ["id3"];
                var types = [{name: 'type1'}, {name: 'type2'}];

                var payload = {
                    dataItems: createDiff(createdItems, updatedItems, deletedItemsIds),
                    types: createDiff(types)
                };

                var ops = requestPayloadCreator.getSaveOperations(appInstance, payload);

                expect(ops.length).toBe(4);
                _.forEach(ops, function (op) {
                    expect(op.params.applicationInstanceId).toBe('xxx');
                    expect(op.params.applicationInstanceVersion).toBe('yyy');
                });

                expect(ops[0].name).toBe('CreateItem');
                expect(ops[0].params.item).toBe(createdItems[0]);
                expect(ops[1].name).toBe('UpdateItem');
                expect(ops[1].params.item).toBe(updatedItems[0]);
                expect(ops[2].name).toBe('DeleteItem');
                expect(ops[2].params.itemId).toBe(deletedItemsIds[0]);
                expect(ops[3].name).toBe('CreateTypes');
                expect(ops[3].params.types).toBe(types);
            });
        });

        xdescribe('getPublishOperations', function () {
            it('no payload - no operations', function () {
                var payload = {
                    dataItems: [],
                    types: []
                };

                var ops = requestPayloadCreator.getPublishOperations(appInstance, payload);

                expect(ops).toEqual([]);
            });

            it('only dataItems - creates only PublishItems operation', function () {
                var dataItems = ['id1', 'id2'];
                var types = [];
                var payload = {
                    dataItems: dataItems,
                    types: types
                };

                var ops = requestPayloadCreator.getPublishOperations(appInstance, payload);

                var expected = {
                    name: 'PublishItems',
                    params: {
                        applicationInstanceId: appInstance.applicationInstanceId,
                        applicationInstanceVersion: appInstance.applicationInstanceVersion,
                        itemIds: dataItems
                    }
                };

                expect(ops).toEqual([expected]);
            });

            it('only types - creates only PublishTypes operation', function () {
                var dataItems = [];
                var types = ['type1', 'type2'];
                var payload = {
                    dataItems: dataItems,
                    types: types
                };

                var ops = requestPayloadCreator.getPublishOperations(appInstance, payload);

                var expected = {
                    name: 'PublishTypes',
                    params: {
                        applicationInstanceId: appInstance.applicationInstanceId,
                        applicationInstanceVersion: appInstance.applicationInstanceVersion,
                        names: types
                    }
                };

                expect(ops).toEqual([expected]);
            });

            it('dataItems and types - create an operation for each', function () {
                var dataItems = ['id1', 'id2'];
                var types = ['type1', 'type2'];
                var payload = {
                    dataItems: dataItems,
                    types: types
                };

                var ops = requestPayloadCreator.getPublishOperations(appInstance, payload);


                var expectedItems = {
                    name: 'PublishItems',
                    params: {
                        applicationInstanceId: appInstance.applicationInstanceId,
                        applicationInstanceVersion: appInstance.applicationInstanceVersion,
                        itemIds: dataItems
                    }
                };

                var expectedTypes = {
                    name: 'PublishTypes',
                    params: {
                        applicationInstanceId: appInstance.applicationInstanceId,
                        applicationInstanceVersion: appInstance.applicationInstanceVersion,
                        names: types
                    }
                };

                expect(ops).toEqual([expectedItems, expectedTypes]);
            });

        });
    });
});
