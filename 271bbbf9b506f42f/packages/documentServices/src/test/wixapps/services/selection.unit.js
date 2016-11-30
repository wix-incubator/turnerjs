define([
        'testUtils',
        'utils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/wixapps/utils/pathUtils',
        'documentServices/wixapps/services/selection'
    ],
    function (testUtils, utils, privateServicesHelper, pathUtils, selection) {
        'use strict';

        describe('Wixapps selection Document Services', function () {

            function getPrivateServices(appbuilderData) {
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                ps.dal.full.setByPath(['wixapps', 'appbuilder'], appbuilderData);

                return ps;
            }

            var appbuilderData;

            beforeEach(function () {
                appbuilderData = {
                    descriptor: {
                        types: {
                            testTypeId: {fake: 'fake type'}
                        },
                        dataSelectors: {
                            dataSelector1: {
                                id: 'dataSelector1',
                                dataProviderId: 'wixdb',
                                forType: 'testTypeId',
                                logicalTypeName: 'IB.ManualSelectedList',
                                itemIds: ['itemId1', 'itemId2']
                            },
                            dataSelector2: {
                                id: 'dataSelector2',
                                dataProviderId: 'wixdb',
                                forType: 'testTypeId',
                                logicalTypeName: 'IB.ManualSelectedList',
                                itemIds: ['itemId3', 'itemId2']
                            },
                            dataSelector3: {
                                id: 'dataSelector3',
                                dataProviderId: 'wixdb',
                                forType: 'testTypeId',
                                logicalTypeName: 'IB.ManualSelectedList',
                                itemIds: ['itemId1', 'itemId3']
                            }
                        }
                    },
                    items: {
                        testTypeId: {
                            itemId1: {_iid: 'itemId1'},
                            itemId2: {_iid: 'itemId2'},
                            itemId3: {_iid: 'itemId3'}
                        }
                    }
                };
            });

            describe('getSelector', function () {

                it('return the selector, without system fields, and with translated type', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var returnedSelector = selection.getSelector(ps, 'dataSelector1');
                    expect(returnedSelector).toEqual({id: 'dataSelector1', type: 'ManualSelectedList', itemIds: ['itemId1', 'itemId2']});
                });

            });

            describe('deleteItemFromAllManualDataSelectors', function () {

                it('remove the item from all of the data selectors', function () {
                    var ps = getPrivateServices(appbuilderData);
                    selection.deleteItemFromAllManualDataSelectors(ps, 'itemId2');

                    var returnedSelector1 = selection.getSelector(ps, 'dataSelector1');
                    expect(returnedSelector1).toEqual({id: 'dataSelector1', type: 'ManualSelectedList', itemIds: ['itemId1']});
                    var returnedSelector2 = selection.getSelector(ps, 'dataSelector2');
                    expect(returnedSelector2).toEqual({id: 'dataSelector2', type: 'ManualSelectedList', itemIds: ['itemId3']});
                    var returnedSelector3 = selection.getSelector(ps, 'dataSelector3');
                    expect(returnedSelector3).toEqual({id: 'dataSelector3', type: 'ManualSelectedList', itemIds: ['itemId1', 'itemId3']});
                });

            });

            describe('setManualSelector', function () {

                it('should set manual type and itemIds', function () {
                    delete appbuilderData.descriptor.dataSelectors.dataSelector1.logicalTypeName;
                    delete appbuilderData.descriptor.dataSelectors.dataSelector1.itemIds;
                    var ps = getPrivateServices(appbuilderData);
                    selection.setManualSelector(ps, 'dataSelector1', ['itemId2', 'itemId3']);
                    var returnedSelector = selection.getSelector(ps, 'dataSelector1');
                    expect(returnedSelector).toEqual({id: 'dataSelector1', type: 'ManualSelectedList', itemIds: ['itemId2', 'itemId3']});
                });

                it('should throw if item ids is not an array of strings', function () {
                    var ps = getPrivateServices(appbuilderData);
                    expect(function () {
                        selection.setManualSelector(ps, 'dataSelector1', 'itemId1');
                    }).toThrowError('itemsId must be an array of strings.');
                    expect(function () {
                        selection.setManualSelector(ps, 'dataSelector1', {'itemId1': 'itemId2'});
                    }).toThrowError('itemsId must be an array of strings.');
                });

                it('should throw an error if data selector does not exist', function() {
                    var ps = getPrivateServices(appbuilderData);
                    var setManualFunc = function() {
                        selection.setManualSelector(ps, 'nonExistingSelectorId', ['item1']);
                    };
                    expect(setManualFunc).toThrowError('Selector does not exist');
                });

                it('should only set IDs of existing items', function() {
                    var ps = getPrivateServices(appbuilderData);
                    selection.setManualSelector(ps, 'dataSelector1', ['itemId1', 'nonExisting1', 'itemId2', 'nonExisting2']);
                    var updatedSelector = appbuilderData.descriptor.dataSelectors.dataSelector1;
                    expect(updatedSelector.itemIds).toEqual(['itemId1', 'itemId2']);
                });

            });

            describe('createSelector', function() {

                it('should return a unique selector ID', function() {
                    var fakeUniqueId = 'fakeUniqueId';
                    spyOn(utils.guidUtils, 'getUniqueId').and.returnValue(fakeUniqueId);
                    var ps = getPrivateServices(appbuilderData);
                    var dataSelectorId = selection.createSelector(ps, 'testTypeId');
                    expect(dataSelectorId).toEqual('dataSelector_' + fakeUniqueId);
                });

                it('should create a new data selector with the given type and a unique id', function() {
                    var ps = getPrivateServices(appbuilderData);
                    var dataSelectorId = selection.createSelector(ps, 'testTypeId');
                    var createdDataSelector = ps.dal.getByPath(pathUtils.getDataSelectorPath(dataSelectorId));
                    var expectedDataSelector = {
                        forType: 'testTypeId',
                        id: dataSelectorId
                    };
                    expect(createdDataSelector).toEqual(expectedDataSelector);
                });

                it('should throw an error if the type does not exist', function() {
                    var ps = getPrivateServices(appbuilderData);
                    var createSelectorFunc = function() {
                        selection.createSelector(ps, 'nonExistingTypeId');
                    };
                    expect(createSelectorFunc).toThrowError('Type does not exist');
                });

            });
        });
    });
