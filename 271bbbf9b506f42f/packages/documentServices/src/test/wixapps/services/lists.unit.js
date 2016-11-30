define([
        'lodash',
        'testUtils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/wixapps/utils/pathUtils',
        'documentServices/wixapps/services/lists',
        'documentServices/wixapps/services/selection',
        'documentServices/wixapps/utils/wixappsConsts'
    ],
    function (_, testUtils, privateServicesHelper, pathUtils, listsDS, selectionDS, wixappsConsts) {
        'use strict';

        describe('Wixapps Lists Document Services', function () {

            function getPrivateServices(appbuilderData) {
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                ps.dal.full.setByPath(['wixapps', 'appbuilder'], appbuilderData);

                return ps;
            }

            describe('getType', function () {

                it('should return the type definition for the given list', function () {
                    var listsTypeDef = {fake: 'fake type definition'};
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {type: 'testTypeId'}
                            },
                            types: {
                                testTypeId: listsTypeDef
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var returnedTypeDef = listsDS.getType(ps, 'testListId');
                    expect(returnedTypeDef).toEqual(listsTypeDef);
                });

                it('should throw an error if the list does not exist', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                existingListId: {}
                            }
                        }
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var getTypeFunc = function () {
                        listsDS.getType(ps, 'nonExistingListId');
                    };
                    expect(getTypeFunc).toThrowError('List does not exist');
                });

            });

            describe('getItems (manual list only)', function () {

                it('should return all items that belong to a list', function () {
                    var listItems = {
                        firstItemId: {fake: 'fake first item'},
                        secondItemId: {fake: 'fake second item'}
                    };
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {
                                    dataSelector: 'dataSelectorId',
                                    type: 'typeId'
                                }
                            },
                            dataSelectors: {
                                dataSelectorId: {
                                    logicalTypeName: 'IB.ManualSelectedList',
                                    forType: 'typeId',
                                    itemIds: ['firstItemId', 'secondItemId']
                                }
                            }
                        },
                        items: {
                            typeId: listItems
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var returnedItems = listsDS.getItems(ps, 'testListId');
                    expect(returnedItems).toEqual(_.values(listItems));
                });

                it('should return an empty map for an empty list', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {
                                    dataSelector: 'dataSelectorId',
                                    type: 'typeId'
                                }
                            },
                            dataSelectors: {
                                dataSelectorId: {
                                    logicalTypeName: 'IB.ManualSelectedList',
                                    forType: 'typeId',
                                    itemIds: []
                                }
                            }
                        },
                        items: {
                            typeId: {
                                'firstItemId': {fake: 'fake item'}
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var returnedItems = listsDS.getItems(ps, 'testListId');
                    expect(returnedItems).toEqual([]);
                });

                it('should throw an error if the list does not exist', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                existingListId: {}
                            }
                        }
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var getItemsFunc = function () {
                        listsDS.getItems(ps, 'nonExistingListId');
                    };
                    expect(getItemsFunc).toThrowError('List does not exist');
                });

                it('should not return items of the same type that are not in the list', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {
                                    dataSelector: 'dataSelectorId',
                                    type: 'typeId'
                                }
                            },
                            dataSelectors: {
                                dataSelectorId: {
                                    logicalTypeName: 'IB.ManualSelectedList',
                                    forType: 'typeId',
                                    itemIds: ['listItem']
                                }
                            }
                        },
                        items: {
                            typeId: {
                                listItem: {fake: 'fake list item'},
                                anotherItem: {fake: 'fake other item'}
                            }
                        }
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var returnedItems = listsDS.getItems(ps, 'testListId');
                    expect(returnedItems).toEqual([{fake: 'fake list item'}]);
                });

            });

            describe('getListDef', function () {
                it('should return the requested list part definition', function () {
                    var listDef = {fake: 'fake list definition'};
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: listDef
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var returnedListDef = listsDS.getListDef(ps, 'testListId');
                    expect(returnedListDef).toEqual(listDef);
                });

                it('should return undefined when the list does not exist', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                anotherListId: {fake: 'another fake list'}
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var returnedListDef = listsDS.getListDef(ps, 'testListId');
                    expect(returnedListDef).toBeUndefined();
                });
            });

            describe('getViews', function () {

                it('should return all view definitions for the given list', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {viewName: 'testViewId'}
                            },
                            views: {
                                'testType|testViewId': {name: 'testViewId', fake: 'fake value 1'},
                                'Array|testViewId': {name: 'testViewId', fake: 'fake value 2'},
                                'testType|anotherView': {name: 'anotherView', fake: 'fake value 3'}
                            }
                        }
                    };
                    var expectedListViews = {
                        'testType|testViewId': {name: 'testViewId', fake: 'fake value 1'},
                        'Array|testViewId': {name: 'testViewId', fake: 'fake value 2'}
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var returnedViews = listsDS.getViews(ps, 'testListId');
                    expect(returnedViews).toEqual(expectedListViews);
                });

                it('should throw an error if list does not exist', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                existingListId: {}
                            }
                        }
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var getTypeFunc = function () {
                        listsDS.getViews(ps, 'nonExistingListId');
                    };
                    expect(getTypeFunc).toThrowError('List does not exist');
                });

            });

            describe('getSelector', function () {

                it('should return the data selector of the given list', function () {
                    var dataSelector = {fake: 'fake data selector'};
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {dataSelector: 'testDataSelectorId'}
                            },
                            dataSelectors: {
                                testDataSelectorId: dataSelector
                            }
                        }
                    };

                    spyOn(selectionDS, 'getSelector').and.callFake(function (ps2, dataSelectorId) {
                        return appbuilderData.descriptor.dataSelectors[dataSelectorId];
                    });
                    var ps = getPrivateServices(appbuilderData);
                    var returnedDataSelector = listsDS.getSelector(ps, 'testListId');
                    expect(returnedDataSelector).toEqual(dataSelector);
                });

                it('should throw an error if the list does not exist', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                existingListId: {}
                            }
                        }
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var getSelectorFunc = function () {
                        listsDS.getSelector(ps, 'nonExistingListId');
                    };
                    expect(getSelectorFunc).toThrowError('List does not exist');
                });

            });

            describe('setManualSelector', function () {

                it('should call selection.setManualSelector with the right parameters', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {dataSelector: 'testDataSelectorId'}
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    spyOn(selectionDS, 'setManualSelector').and.returnValue(undefined);
                    listsDS.setManualSelector(ps, 'testListId', ['itemId1', 'itemId2']);

                    expect(selectionDS.setManualSelector).toHaveBeenCalledWith(ps, 'testDataSelectorId', ['itemId1', 'itemId2']);
                });

                it('should throw an error if the list does not exist', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                existingListId: {}
                            }
                        }
                    };
                    var ps = getPrivateServices(appbuilderData);
                    spyOn(selectionDS, 'setManualSelector').and.returnValue(undefined);
                    var setManualSelectorFunc = function () {
                        listsDS.setManualSelector(ps, 'nonExistingListId');
                    };
                    expect(setManualSelectorFunc).toThrowError('List does not exist');
                    expect(selectionDS.setManualSelector).not.toHaveBeenCalled();
                });

            });

            describe('getAllLists', function () {

                it('should return all list part definitions', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {fake: 'list 1'},
                                testListId2: {fake: 'list 2'}
                            }
                        }
                    };
                    var expectedLists = _.cloneDeep(appbuilderData.descriptor.parts);
                    var ps = getPrivateServices(appbuilderData);
                    var returnedLists = listsDS.getAllLists(ps);
                    expect(returnedLists).toEqual(expectedLists);
                });

                it('should return an empty map when no parts exist', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {}
                        }
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var returnedLists = listsDS.getAllLists(ps);
                    expect(returnedLists).toEqual({});
                });

            });

            describe('createList', function () {

                var appbuilderData, testListDef;
                beforeEach(function () {
                    appbuilderData = {
                        descriptor: {
                            types: {
                                testTypeId: {
                                    name: 'testTypeId',
                                    displayName: 'Test Type',
                                    fields: [{
                                        type: 'String',
                                        name: 'idForTest',
                                        displayName: 'Test ID',
                                        defaultValue: 'default',
                                        computed: false,
                                        searchable: false
                                    }]
                                }
                            },
                            views: {
                                'testTypeId|fakeViewName': {
                                    name: 'fakeViewName',
                                    forType: 'testTypeId',
                                    idForTest: 'viewId1'
                                }
                            },
                            parts: {},
                            dataSelectors: {
                                testDataSelectorId: {}
                            }
                        },
                        items: {},
                        deletedItems: {}
                    };
                    testListDef = {
                        displayName: 'Test display name',
                        type: 'testTypeId',
                        viewName: 'fakeViewName',
                        dataSelector: 'testDataSelectorId'
                    };
                });


                it('should throw an if type does not exist', function () {
                    testListDef.type = 'nonExistingTypeId';
                    var ps = getPrivateServices(appbuilderData);
                    var createListFunc = function () {
                        listsDS.createList(ps, testListDef);
                    };
                    expect(createListFunc).toThrowError('Type does not exist');
                });

                it('should throw an if data selector does not exist', function () {
                    testListDef.dataSelector = 'nonExistingDataSelectorId';
                    var ps = getPrivateServices(appbuilderData);
                    var createListFunc = function () {
                        listsDS.createList(ps, testListDef);
                    };
                    expect(createListFunc).toThrowError('Data selector does not exist');
                });

                it('should throw an if views do not exist', function () {
                    testListDef.viewName = 'nonExistingViewName';
                    var ps = getPrivateServices(appbuilderData);
                    var createListFunc = function () {
                        listsDS.createList(ps, testListDef);
                    };
                    expect(createListFunc).toThrowError('List views do not exist');
                });

                it('should return a list ID', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var listId = listsDS.createList(ps, testListDef);
                    expect(listId).toEqual(jasmine.any(String));
                    expect(listId.length).toBeGreaterThan(0);
                });

                it('should add the list as a new part with required fields', function () {
                    var expectedListDef = _.cloneDeep(testListDef);
                    var ps = getPrivateServices(appbuilderData);
                    var listId = listsDS.createList(ps, testListDef);
                    var listDef = ps.dal.getByPath(pathUtils.getPartPath(listId));
                    expect(listDef).toEqual(jasmine.objectContaining(expectedListDef));
                });

                it('should use a default display name if missing in the given definition', function () {
                    delete testListDef.displayName;
                    var ps = getPrivateServices(appbuilderData);
                    var listId = listsDS.createList(ps, testListDef);
                    var listDef = ps.dal.getByPath(pathUtils.getPartPath(listId));
                    expect(listDef.displayName).toEqual('New List');
                });

                it('should not modify the given list def', function () {
                    delete testListDef.displayName;
                    var givenListDef = _.cloneDeep(testListDef);
                    var ps = getPrivateServices(appbuilderData);
                    listsDS.createList(ps, testListDef);
                    expect(testListDef).toEqual(givenListDef);
                });

                it('should increment suffix until display name is unique', function () {
                    testListDef.displayName = 'My List';
                    var ps = getPrivateServices(appbuilderData);
                    listsDS.createList(ps, testListDef);
                    listsDS.createList(ps, testListDef);
                    listsDS.createList(ps, testListDef);
                    var fourthListId = listsDS.createList(ps, testListDef);
                    var listDef = ps.dal.getByPath(pathUtils.getPartPath(fourthListId));
                    expect(listDef.displayName).toEqual('My List 4');
                });

                it('should set a version on the new part definition', function() {
                    var ps = getPrivateServices(appbuilderData);
                    var listId = listsDS.createList(ps, testListDef);
                    var listDef = ps.dal.getByPath(pathUtils.getPartPath(listId));
                    expect(listDef.version).toBeDefined();
                    expect(listDef.version).toEqual(wixappsConsts.LIST_VERSION);
                });


            });

            describe('rename', function(){
                it('should rename list', function(){
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {
                                    displayName: 'testListName'
                                }
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    listsDS.rename(ps, 'testListId', 'newName');
                    var returnedDisplayName = listsDS.getDisplayName(ps, 'testListId');
                    expect(returnedDisplayName).toEqual('newName');
                });
            });

            describe('getVersion', function(){
                it('should return the version of the list if it exists', function(){
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {
                                    version: '2.0'
                                }
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var version = listsDS.getVersion(ps, 'testListId');
                    expect(version).toEqual('2.0');
                });

                it('should return the version 1.0 if no version exists', function(){
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {
                                }
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var version = listsDS.getVersion(ps, 'testListId');
                    expect(version).toEqual('1.0');
                });
            });

            describe('replaceItemView', function() {

                var appbuilderData, newView;
                beforeEach(function() {
                    appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {
                                    viewName: 'oldViewName',
                                    type: 'testTypeId'
                                }
                            },
                            types: {
                                testTypeId: {}
                            },
                            views: {
                                'testTypeId|oldViewName|Mobile': {
                                    format: 'Mobile',
                                    name: 'oldViewName',
                                    forType: 'testTypeId'
                                },
                                'testTypeId|oldViewName': {
                                    name: 'oldViewName',
                                    forType: 'testTypeId'
                                },
                                'Array|oldViewName': {
                                    name: 'oldViewName',
                                    forType: 'Array'
                                }
                            }
                        }
                    };
                    newView = {
                        idForTest: 'newViewTestId',
                        name: 'newViewName',
                        forType: 'anotherTypeId',
                        innerObj: {
                            refToViewName: 'newViewName'
                        }
                    };
                });

                it('should set the new desktop view with the current list\'s view name and type', function() {
                    var expectedReplacedView = _.cloneDeep(newView);
                    expectedReplacedView.forType = 'testTypeId';
                    expectedReplacedView.name = 'oldViewName';
                    expectedReplacedView.innerObj.refToViewName = 'oldViewName';

                    var ps = getPrivateServices(appbuilderData);
                    listsDS.replaceItemView(ps, 'testListId', newView);

                    var replacedView = ps.dal.getByPath(pathUtils.getViewPath('testTypeId|oldViewName'));
                    expect(replacedView).toEqual(expectedReplacedView);
                });

                it('should set the new mobile view with the current list\'s view name and type', function() {
                    newView.format = 'Mobile';

                    var expectedReplacedView = _.cloneDeep(newView);
                    expectedReplacedView.forType = 'testTypeId';
                    expectedReplacedView.name = 'oldViewName';
                    expectedReplacedView.innerObj.refToViewName = 'oldViewName';

                    var ps = getPrivateServices(appbuilderData);
                    listsDS.replaceItemView(ps, 'testListId', newView);

                    var replacedView = ps.dal.getByPath(pathUtils.getViewPath('testTypeId|oldViewName|Mobile'));
                    expect(replacedView).toEqual(expectedReplacedView);
                });

                it('should not change array views or mobile views', function() {
                    var expectedViews = _.cloneDeep(appbuilderData.descriptor.views);
                    expectedViews['testTypeId|oldViewName'] = jasmine.any(Object);

                    var ps = getPrivateServices(appbuilderData);
                    listsDS.replaceItemView(ps, 'testListId', newView);

                    var viewsAfterChange = ps.dal.getByPath(pathUtils.getBaseViewsPath());
                    expect(viewsAfterChange).toEqual(expectedViews);
                });

                it('should not change array views or desktop views, when new item view is mobile', function() {
                    newView.format = 'Mobile';

                    var expectedViews = _.cloneDeep(appbuilderData.descriptor.views);
                    expectedViews['testTypeId|oldViewName|Mobile'] = jasmine.any(Object);

                    var ps = getPrivateServices(appbuilderData);
                    listsDS.replaceItemView(ps, 'testListId', newView);

                    var viewsAfterChange = ps.dal.getByPath(pathUtils.getBaseViewsPath());
                    expect(viewsAfterChange).toEqual(expectedViews);
                });

                it('should throw an error if no view def given without changing any data', function() {
                    var ps = getPrivateServices(appbuilderData);
                    var replaceViewFunc = function () {
                        listsDS.replaceItemView(ps, 'testListId', undefined);
                    };
                    expect(replaceViewFunc).toThrowError('View is not valid');
                });

                it('should throw an error if the list does not exist', function() {
                    var ps = getPrivateServices(appbuilderData);
                    var replaceViewFunc = function () {
                        listsDS.replaceItemView(ps, 'nonExistingListId', newView);
                    };
                    expect(replaceViewFunc).toThrowError('List does not exist');
                });

            });

            describe('getItemView', function() {

                var appbuilderData;
                beforeEach(function() {
                    appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {
                                    viewName: 'oldViewName',
                                    type: 'testTypeId'
                                }
                            },
                            types: {
                                testTypeId: {}
                            },
                            views: {
                                'testTypeId|oldViewName': {
                                    name: 'oldViewName',
                                    forType: 'testTypeId'
                                },
                                'testTypeId|oldViewName|mobile': {
                                    name: 'oldViewName',
                                    forType: 'testTypeId',
                                    format: 'mobile'
                                },
                                'Array|oldViewName': {
                                    name: 'oldViewName',
                                    forType: 'Array'
                                }
                            }
                        }
                    };
                });

                it('should return a view with no format', function() {
                    var ps = getPrivateServices(appbuilderData);
                    var returnedView = listsDS.getItemView(ps, 'testListId');
                    expect(returnedView).toEqual(appbuilderData.descriptor.views['testTypeId|oldViewName']);
                });

                it('should return a view with no format if the definition has an empty string format', function() {
                    appbuilderData.descriptor.views['testTypeId|oldViewName'].format = '';
                    var ps = getPrivateServices(appbuilderData);
                    var returnedView = listsDS.getItemView(ps, 'testListId');
                    expect(returnedView).toEqual(appbuilderData.descriptor.views['testTypeId|oldViewName']);
                });

                it('should return a view with some format', function() {
                    var ps = getPrivateServices(appbuilderData);
                    var returnedView = listsDS.getItemView(ps, 'testListId', 'mobile');
                    expect(returnedView).toEqual(appbuilderData.descriptor.views['testTypeId|oldViewName|mobile']);
                });

                it('should throw an error if the list does not exist', function() {
                    var ps = getPrivateServices(appbuilderData);
                    var getViewFunc = function () {
                        listsDS.getItemView(ps, 'nonExistingListId');
                    };
                    expect(getViewFunc).toThrowError('List does not exist');
                });

            });

            describe('getHiddenItems', function() {
                it('should return all items of the same type which do not belong to the list', function() {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {
                                    dataSelector: 'dataSelectorId',
                                    type: 'listType'
                                }
                            },
                            dataSelectors: {
                                dataSelectorId: {
                                    logicalTypeName: 'IB.ManualSelectedList',
                                    forType: 'listType',
                                    itemIds: ['visibleListItemId', 'visibleListItemId2']
                                }
                            }
                        },
                        items: {
                            listType: {
                                visibleListItemId: {_iid: 'visibleListItemId'},
                                visibleListItemId2: {_iid: 'visibleListItemId2'},
                                hiddenItemId: {_iid: 'hiddenItemId'},
                                hiddenItemId2: {_iid: 'hiddenItemId2'}
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var returnedItems = listsDS.getHiddenItems(ps, 'testListId');
                    expect(returnedItems).toEqual([
                        {_iid: 'hiddenItemId'},
                        {_iid: 'hiddenItemId2'}
                    ]);
                });

                it('should return an empty array if list contains all items of its type', function() {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {
                                    dataSelector: 'dataSelectorId',
                                    type: 'listType'
                                }
                            },
                            dataSelectors: {
                                dataSelectorId: {
                                    logicalTypeName: 'IB.ManualSelectedList',
                                    forType: 'listType',
                                    itemIds: ['visibleListItemId', 'visibleListItemId2']
                                }
                            }
                        },
                        items: {
                            listType: {
                                visibleListItemId: {_iid: 'visibleListItemId'},
                                visibleListItemId2: {_iid: 'visibleListItemId2'}
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var returnedItems = listsDS.getHiddenItems(ps, 'testListId');
                    expect(returnedItems).toEqual([]);
                });

                it('should throw an error if the list does not exist', function () {
                    var appbuilderData = {
                        descriptor: {
                            parts: {
                                existingListId: {}
                            }
                        }
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var getItemsFunc = function () {
                        listsDS.getHiddenItems(ps, 'nonExistingListId');
                    };
                    expect(getItemsFunc).toThrowError('List does not exist');
                });

            });

        });
    });
