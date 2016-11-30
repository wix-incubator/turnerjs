define([
        'lodash',
        'testUtils',
        'wixappsBuilder',
        'documentServices/wixapps/utils/linksConverter',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/wixapps/services/items',
        'documentServices/wixapps/services/selection',
        'documentServices/wixapps/utils/pathUtils',
        'documentServices/wixapps/utils/timeUtils'
    ],
    function (_, testUtils, wixappsBuilder, linksConverter, privateServicesHelper, itemsDS, selectionDS, pathUtils, timeUtils) {
        'use strict';

        describe('Wixapps Items Document Services', function () {

            function createFakeItemInDal(typeId, itemId, item) {
                var fakeItem = _.assign(item || {}, {_iid: itemId});
                fakePS.dal.full.setByPath(pathUtils.getItemPath(typeId, itemId), fakeItem);
                return itemId;
            }

            function createFakeDeletedItemInDal(typeId, itemId) {
                var fakeDeletedItem = {_iid: itemId, _deletedAt: (new Date()).toISOString()};
                fakePS.dal.full.setByPath(pathUtils.getDeletedItemPath(typeId, itemId), fakeDeletedItem);
                return itemId;
            }

            function getItemFromDal(typeId, itemId) {
                return fakePS.dal.getByPath(pathUtils.getItemPath(typeId, itemId));
            }

            function getAllItemsFromDal(typeId) {
                return fakePS.dal.getByPath(pathUtils.getBaseItemsPath(typeId));
            }

            function getDeletedItemFromDal(typeId, itemId) {
                return fakePS.dal.getByPath(pathUtils.getDeletedItemPath(typeId, itemId));
            }

            function createInitialData(typeDef) {
                var appBuilderData = {
                    descriptor: {
                        types: {},
                        offsetFromServerTime: 0
                    },
                    items: {},
                    deletedItems: {}
                };
                if (typeDef) {
                    appBuilderData.descriptor.types[typeDef.name] = typeDef;
                    appBuilderData.items[typeDef.name] = {};
                    appBuilderData.deletedItems[typeDef.name] = {};
                }
                return appBuilderData;
            }

            var fakePS, defaultTypeDef, appBuilderSiteData;
            beforeEach(function () {
                defaultTypeDef = {
                    "name": 'testTypeDef',
                    "displayName": "Test Type",
                    "baseTypes": [],
                    "fields": [{
                        "name": "title",
                        "displayName": "Title",
                        "type": "String",
                        "defaultValue": "I'm a Title",
                        "computed": false,
                        "searchable": false
                    }, {
                        "name": "description",
                        "displayName": "Description",
                        "type": "String",
                        "computed": false,
                        "searchable": false
                    }, {
                        "name": "computedField",
                        "displayName": "Computed Field",
                        "type": "String",
                        "computed": true,
                        "searchable": false
                    }, {
                        "name": "links",
                        "displayName": "",
                        "type": "wix:Map",
                        "defaultValue": {"_type": "wix:Map"},
                        "computed": false,
                        "searchable": false
                    }, {
                        "name": "image",
                        "displayName": "Image",
                        "type": "wix:Image",
                        "defaultValue": {
                            "_type": "wix:Image",
                            "height": 600,
                            "src": "images/items/bloom.jpg",
                            "title": "",
                            "width": 600
                        },
                        "computed": false,
                        "searchable": false
                    }, {
                        'displayName': 'Rich Text',
                        'name': 'richText',
                        'type': 'wix:RichText',
                        'defaultValue': {
                            'version': 1,
                            '_type': 'wix:RichText',
                            'links': [],
                            'text': 'Add Description here'
                        },
                        'searchable': false,
                        'computed': false
                    }],
                    "version": 0
                };
                appBuilderSiteData = createInitialData(defaultTypeDef);
                fakePS = privateServicesHelper.mockPrivateServicesWithRealDAL();
                fakePS.dal.full.setByPath(['wixapps', 'appbuilder'], appBuilderSiteData);
            });

            xdescribe('createItem', function () {
                var newItemId = 'barvazOger23';

                it('should create a new item with the default values when none given', function () {
                    var testTypeId = defaultTypeDef.name;
                    var expectedNewItem = {
                        _iid: newItemId,
                        _createdAt: jasmine.any(String),
                        _updatedAt: jasmine.any(String),
                        _type: testTypeId,
                        _state: "Draft",
                        title: _.find(defaultTypeDef.fields, {name: 'title'}).defaultValue,
                        links: _.find(defaultTypeDef.fields, {name: 'links'}).defaultValue,
                        image: _.find(defaultTypeDef.fields, {name: 'image'}).defaultValue,
                        richText: _.find(defaultTypeDef.fields, {name: 'richText'}).defaultValue
                    };

                    itemsDS.createItem(fakePS, newItemId, testTypeId);
                    var createdItem = getItemFromDal(testTypeId, newItemId);

                    expect(createdItem).toEqual(expectedNewItem);
                });

                it('should create a new item with the given values in addition to defaults', function () {
                    var testTypeId = defaultTypeDef.name;
                    var itemToCreate = {
                        title: 'non default title',
                        description: 'this is a description'
                    };
                    var expectedNewItem = {
                        _iid: newItemId,
                        _createdAt: jasmine.any(String),
                        _updatedAt: jasmine.any(String),
                        _type: testTypeId,
                        _state: "Draft",
                        title: 'non default title',
                        description: 'this is a description',
                        links: _.find(defaultTypeDef.fields, {name: 'links'}).defaultValue,
                        image: _.find(defaultTypeDef.fields, {name: 'image'}).defaultValue,
                        richText: _.find(defaultTypeDef.fields, {name: 'richText'}).defaultValue
                    };

                    itemsDS.createItem(fakePS, newItemId, testTypeId, itemToCreate);
                    var createdItem = getItemFromDal(testTypeId, newItemId);

                    expect(createdItem).toEqual(expectedNewItem);
                });

                it('should create a new item with the given values in addition to defaults and ignore system fields', function () {
                    var testTypeId = defaultTypeDef.name;
                    var itemToCreate = {
                        _iid: 'aaa',
                        _createdAt: 'bbb',
                        _updatedAt: 'ccc',
                        _type: testTypeId,
                        _permissions: {},
                        _state: "Published",
                        title: 'non default title',
                        description: 'this is a description',
                        links: 'some links',
                        image: 'an image'
                    };
                    var expectedNewItem = {
                        _iid: newItemId,
                        _createdAt: jasmine.any(String),
                        _updatedAt: jasmine.any(String),
                        _type: testTypeId,
                        _state: "Draft",
                        title: 'non default title',
                        description: 'this is a description',
                        links: 'some links',
                        image: 'an image'
                    };

                    itemsDS.createItem(fakePS, newItemId, testTypeId, itemToCreate);
                    var createdItem = getItemFromDal(testTypeId, newItemId);

                    expect(createdItem).toEqual(jasmine.objectContaining(expectedNewItem));
                });

                it('should throw an error when the requested type does not exist', function () {
                    var undefinedTypeId = 'undefinedTypeId';
                    var createItemFunc = function () {
                        itemsDS.createItem(fakePS, newItemId, undefinedTypeId);
                    };
                    expect(createItemFunc).toThrowError('Type does not exist');
                    var allItems = getAllItemsFromDal(undefinedTypeId);
                    expect(allItems).toBeUndefined();
                });

                it('should throw an error when trying to set fields that are not part of the type', function () {
                    var testTypeId = defaultTypeDef.name;
                    var itemToCreate = {
                        title: 'title is a valid field',
                        nonExistingField: 'this field does not exist in the type definition'
                    };
                    var createItemFunc = function () {
                        itemsDS.createItem(fakePS, newItemId, testTypeId, itemToCreate);
                    };
                    expect(createItemFunc).toThrowError('Item does not match schema');
                    var allItems = getAllItemsFromDal(testTypeId);
                    expect(allItems).toEqual({});
                });

                it('should not modify the given item object', function () {
                    var testTypeId = defaultTypeDef.name;
                    var itemToCreate = {
                        title: 'non default title',
                        description: 'this is a description'
                    };
                    var itemToCreateClone = _.cloneDeep(itemToCreate);

                    itemsDS.createItem(fakePS, newItemId, testTypeId, itemToCreate);

                    expect(itemToCreate).toEqual(itemToCreateClone);
                });

                it('should convert item links and field links to wixapps format', function() {
                    var testTypeId = defaultTypeDef.name;
                    var itemToCreate = {
                        title: 'test title',
                        richText: {
                            _type: "wix:RichText",
                            text: 'some rich text',
                            links: [
                                {type: 'PageLink'}
                            ]
                        },
                        links: {
                            title: {type: 'ExternalLink'}
                        }
                    };

                    spyOn(linksConverter, 'convertWLinkToWixappsData').and.callFake(function(wLink) {
                        return {_type: 'wix:' + wLink.type};
                    });

                    itemsDS.createItem(fakePS, newItemId, testTypeId, itemToCreate);

                    expect(linksConverter.convertWLinkToWixappsData).toHaveBeenCalledWith({type: 'PageLink'});
                    expect(linksConverter.convertWLinkToWixappsData).toHaveBeenCalledWith({type: 'ExternalLink'});

                    var createdItem = getItemFromDal(testTypeId, newItemId);
                    expect(createdItem.links.title).toEqual({_type: 'wix:ExternalLink'});
                    expect(createdItem.richText.links[0]).toEqual({_type: 'wix:PageLink'});
                });

            });

            describe('updateItem', function () {

                it('should update an existing item with the given fields', function () {
                    var mockTimes = ['2015-01-27T13:53:42.567Z', '2015-01-27T13:53:51.935Z'];
                    spyOn(timeUtils, 'getCurrentTime').and.callFake(function () {
                        return mockTimes.pop(); // fake time so updatedAt will change
                    });

                    var testTypeId = defaultTypeDef.name;
                    var testItemId = createFakeItemInDal(testTypeId, 'testItemId');
                    var fieldsToUpdate = {
                        title: 'a new title',
                        description: 'a new description'
                    };

                    var itemBeforeUpdate = getItemFromDal(testTypeId, testItemId);
                    var previousUpdatedAtValue = itemBeforeUpdate._updatedAt;

                    var expectedItemAfterUpdate = _.cloneDeep(itemBeforeUpdate);
                    expectedItemAfterUpdate.title = fieldsToUpdate.title;
                    expectedItemAfterUpdate.description = fieldsToUpdate.description;
                    expectedItemAfterUpdate._updatedAt = jasmine.any(String);

                    itemsDS.updateItem(fakePS, testTypeId, testItemId, fieldsToUpdate);
                    var itemAfterUpdate = getItemFromDal(testTypeId, testItemId);

                    expect(itemAfterUpdate).toEqual(expectedItemAfterUpdate);
                    expect(itemAfterUpdate._updatedAt).not.toEqual(previousUpdatedAtValue);
                });

                it('should not change existing fields which were not requested to update', function () {
                    var testTypeId = defaultTypeDef.name;
                    var testItemId = createFakeItemInDal(testTypeId, 'testItemId');
                    var fieldsToUpdate = {
                        description: 'a new description'
                    };
                    var itemBeforeUpdate = _.cloneDeep(getItemFromDal(testTypeId, testItemId));

                    itemsDS.updateItem(fakePS, testTypeId, testItemId, fieldsToUpdate);
                    var itemAfterUpdate = getItemFromDal(testTypeId, testItemId);

                    expect(itemAfterUpdate.title).toEqual(itemBeforeUpdate.title);
                    expect(itemAfterUpdate.description).not.toEqual(itemBeforeUpdate.description);
                });

                it('should throw an error when the requested item does not exist', function () {
                    var existingTypeId = defaultTypeDef.name;
                    var fakeItemId = 'fakeItemId';
                    var updateItemFunc = function () {
                        itemsDS.updateItem(fakePS, existingTypeId, fakeItemId, {});
                    };
                    expect(updateItemFunc).toThrowError('Item does not exist');

                    var itemThatShouldNotExist = getItemFromDal(existingTypeId, fakeItemId);
                    expect(itemThatShouldNotExist).toBeUndefined();
                });

                it('should throw an error when trying to update invalid fields', function () {
                    var testTypeId = defaultTypeDef.name;
                    var testItemId = createFakeItemInDal(testTypeId, 'testItemId');
                    var itemBeforeUpdate = _.cloneDeep(getItemFromDal(testTypeId, testItemId));
                    var fieldsToUpdate = {
                        nonExistingField: 'this field does not exist'
                    };

                    var updateItemFunc = function () {
                        itemsDS.updateItem(fakePS, testTypeId, testItemId, fieldsToUpdate);
                    };
                    expect(updateItemFunc).toThrowError('Item does not match schema');

                    var itemAfterUpdate = getItemFromDal(testTypeId, testItemId);
                    expect(itemAfterUpdate).toEqual(itemBeforeUpdate);
                });

                it('should throw an error when trying to update a computed field', function () {
                    var testTypeId = defaultTypeDef.name;
                    var testItemId = createFakeItemInDal(testTypeId, 'testItemId');
                    var itemBeforeUpdate = _.cloneDeep(getItemFromDal(testTypeId, testItemId));
                    var fieldsToUpdate = {
                        computedField: 'computed field value'
                    };

                    var updateItemFunc = function () {
                        itemsDS.updateItem(fakePS, testTypeId, testItemId, fieldsToUpdate);
                    };
                    expect(updateItemFunc).toThrowError('Item does not match schema');

                    var itemAfterUpdate = getItemFromDal(testTypeId, testItemId);
                    expect(itemAfterUpdate).toEqual(itemBeforeUpdate);
                });


                it('should not update any other item', function () {
                    var testTypeId = defaultTypeDef.name;
                    var firstItemId = createFakeItemInDal(testTypeId, 'firstItemId');
                    var secondItemId = createFakeItemInDal(testTypeId, 'secondItemId');
                    var firstItemBeforeUpdate = _.cloneDeep(getItemFromDal(testTypeId, firstItemId));
                    var secondItemBeforeUpdate = _.cloneDeep(getItemFromDal(testTypeId, secondItemId));

                    var fieldsToUpdateInFirstItem = {
                        title: 'a new title',
                        description: 'a new description'
                    };

                    spyOn(fakePS.dal.full, 'setByPath').and.callThrough();

                    itemsDS.updateItem(fakePS, testTypeId, firstItemId, fieldsToUpdateInFirstItem);

                    var firstItemAfterUpdate = getItemFromDal(testTypeId, firstItemId);
                    var secondItemAfterUpdate = getItemFromDal(testTypeId, secondItemId);

                    expect(firstItemAfterUpdate).not.toEqual(firstItemBeforeUpdate);
                    expect(secondItemAfterUpdate).toEqual(secondItemBeforeUpdate);
                });

                it('should merge 1st degree field attributes', function () {
                    var testTypeId = defaultTypeDef.name;
                    var testItemId = createFakeItemInDal(testTypeId, 'testItemId');
                    var itemBeforeUpdate = getItemFromDal(testTypeId, testItemId);

                    var firstUpdateFields = {
                        image: {
                            height: 100
                        }
                    };
                    var secondUpdateFields = {
                        image: {
                            title: 'image title'
                        }
                    };

                    var expectedAfterSecondUpdate = _.cloneDeep(itemBeforeUpdate);
                    expectedAfterSecondUpdate._updatedAt = jasmine.any(String);
                    expectedAfterSecondUpdate.image = {
                        height: 100,
                        title: 'image title'
                    };

                    itemsDS.updateItem(fakePS, testTypeId, testItemId, firstUpdateFields);
                    itemsDS.updateItem(fakePS, testTypeId, testItemId, secondUpdateFields);

                    var itemAfterSecondUpdate = getItemFromDal(testTypeId, testItemId);
                    expect(itemAfterSecondUpdate).toEqual(expectedAfterSecondUpdate);
                });

                it('should not merge deep field attributes', function () {
                    var testTypeId = defaultTypeDef.name;
                    var testItemId = createFakeItemInDal(testTypeId, 'testItemId');
                    var itemBeforeUpdate = getItemFromDal(testTypeId, testItemId);

                    var firstUpdateFields = {
                        richText: {
                            innerField: {
                                key1: 'value1'
                            }
                        }
                    };
                    var secondUpdateFields = {
                        richText: {
                            innerField: {
                                key2: 'value2'
                            }
                        }
                    };

                    var expectedAfterSecondUpdate = _.cloneDeep(itemBeforeUpdate);
                    expectedAfterSecondUpdate._updatedAt = jasmine.any(String);
                    expectedAfterSecondUpdate.richText = {
                        innerField: {
                            key2: 'value2'
                        }
                    };

                    itemsDS.updateItem(fakePS, testTypeId, testItemId, firstUpdateFields);
                    itemsDS.updateItem(fakePS, testTypeId, testItemId, secondUpdateFields);

                    var itemAfterSecondUpdate = getItemFromDal(testTypeId, testItemId);
                    expect(itemAfterSecondUpdate).toEqual(expectedAfterSecondUpdate);
                });

                it('should remove links when they are null or undefined', function () {
                    var wLink = {};
                    spyOn(linksConverter, 'convertWixappsDataToWLink').and.returnValue(wLink);
                    var testTypeId = defaultTypeDef.name;
                    var partialItem = {
                        links: {
                            title: {
                                type: 'DummyLink1'
                            }
                        }
                    };
                    var testItemId = createFakeItemInDal(testTypeId, 'testItemId', partialItem);

                    itemsDS.updateItem(fakePS, testTypeId, testItemId, {links: {title: null}});

                    var item = getItemFromDal(testTypeId, testItemId);
                    expect(item.links.title).toBeNull();
                });

                xit('should remove links when they are null or undefined', function () {
                    var wLink = {};
                    spyOn(linksConverter, 'convertWixappsDataToWLink').and.returnValue(wLink);
                    var testTypeId = defaultTypeDef.name;
                    var partialItem = {
                        links: {
                            title: {
                                type: 'DummyLink1'
                            }
                        }
                    };
                    var testItemId = createFakeItemInDal(testTypeId, 'testItemId', partialItem);

                    itemsDS.updateItem(fakePS, testTypeId, testItemId, {links: {title: undefined}});

                    var item = getItemFromDal(testTypeId, testItemId);
                    expect(item.links.title).toBeUndefined();
                });

                it('should convert item links and field links to wixapps format', function() {
                    var testTypeId = defaultTypeDef.name;
                    var testItemId = createFakeItemInDal(testTypeId, 'testItemId');


                    var updateFields = {
                        richText: {
                            links: [
                                {type: 'PageLink'}
                            ]
                        },
                        links: {
                            title: {type: 'ExternalLink'}
                        }
                    };

                    spyOn(linksConverter, 'convertWLinkToWixappsData').and.callFake(function(wLink) {
                        return {_type: 'wix:' + wLink.type};
                    });

                    itemsDS.updateItem(fakePS, testTypeId, testItemId, updateFields);

                    expect(linksConverter.convertWLinkToWixappsData).toHaveBeenCalledWith({type: 'PageLink'});
                    expect(linksConverter.convertWLinkToWixappsData).toHaveBeenCalledWith({type: 'ExternalLink'});

                    var itemAfterUpdate = getItemFromDal(testTypeId, testItemId);
                    expect(itemAfterUpdate.links.title).toEqual({_type: 'wix:ExternalLink'});
                    expect(itemAfterUpdate.richText.links[0]).toEqual({_type: 'wix:PageLink'});
                });

            });

            describe('deleteItem', function () {

                it('should remove the item from the items map', function () {
                    var testTypeId = defaultTypeDef.name;
                    var itemId = createFakeItemInDal(testTypeId, 'testItemId');
                    var itemBeforeDeletion = getItemFromDal(testTypeId, itemId);
                    expect(itemBeforeDeletion).toBeDefined();

                    itemsDS.deleteItem(fakePS, testTypeId, itemId);
                    var itemAfterDeletion = getItemFromDal(testTypeId, itemId);
                    expect(itemAfterDeletion).toBeUndefined();
                });

                it('should remove the item from all of the data selectors', function () {
                    spyOn(selectionDS, 'deleteItemFromAllManualDataSelectors').and.returnValue(0);
                    var testTypeId = defaultTypeDef.name;
                    var itemId = createFakeItemInDal(testTypeId, 'testItemId');

                    itemsDS.deleteItem(fakePS, testTypeId, itemId);

                    expect(selectionDS.deleteItemFromAllManualDataSelectors).toHaveBeenCalledWith(fakePS, itemId);
                });

                xit('should put the item in the deletedItems map and set _deletedAt', function () {
                    var testTypeId = defaultTypeDef.name;
                    var itemId = createFakeItemInDal(testTypeId, 'testItemId');
                    var itemBeforeDeletion = getItemFromDal(testTypeId, itemId);
                    var expectedDeletedItem = _.cloneDeep(itemBeforeDeletion);
                    expectedDeletedItem._deletedAt = jasmine.any(String);

                    itemsDS.deleteItem(fakePS, testTypeId, itemId);

                    var itemFromDeleted = getDeletedItemFromDal(testTypeId, itemId);
                    expect(itemFromDeleted).toEqual(expectedDeletedItem);
                });

                it('should throw an error when the requested item does not exist', function () {
                    var existingTypeId = defaultTypeDef.name;
                    var fakeItemId = 'fakeItemId';
                    var deleteItemFunc = function () {
                        itemsDS.deleteItem(fakePS, existingTypeId, fakeItemId);
                    };
                    expect(deleteItemFunc).toThrowError('Item does not exist');
                });

                it('should not delete any other item', function () {
                    var testTypeId = defaultTypeDef.name;
                    var firstItemId = createFakeItemInDal(testTypeId, 'firstItemId');
                    var secondItemId = createFakeItemInDal(testTypeId, 'secondItemId');
                    itemsDS.deleteItem(fakePS, testTypeId, firstItemId);
                    var secondItem = getItemFromDal(testTypeId, secondItemId);
                    expect(secondItem).toBeDefined();
                });

            });

            describe('restoreItem', function () {

                it('should remove the item from the deletedItems map', function () {
                    var testTypeId = defaultTypeDef.name;
                    var itemId = createFakeDeletedItemInDal(testTypeId, 'testItemId');
                    var deletedItemBeforeRestore = getDeletedItemFromDal(testTypeId, itemId);
                    expect(deletedItemBeforeRestore).toBeDefined();

                    itemsDS.restoreItem(fakePS, testTypeId, itemId);
                    var deletedItemAfterRestore = getDeletedItemFromDal(testTypeId, itemId);
                    expect(deletedItemAfterRestore).toBeUndefined();
                });

                it('should put the item in the items map without a _deletedAt value', function () {
                    var testTypeId = defaultTypeDef.name;
                    var itemId = createFakeDeletedItemInDal(testTypeId, 'testItemId');
                    var deletedItemBeforeRestore = getDeletedItemFromDal(testTypeId, itemId);
                    expect(deletedItemBeforeRestore._deletedAt).toBeDefined();
                    var expectedRestoredItem = _.cloneDeep(deletedItemBeforeRestore);
                    delete expectedRestoredItem._deletedAt;

                    itemsDS.restoreItem(fakePS, testTypeId, itemId);

                    var restoredItem = getItemFromDal(testTypeId, itemId);
                    expect(restoredItem).toEqual(expectedRestoredItem);
                });


                it('should throw an error if the item is not deleted', function () {
                    var testTypeId = defaultTypeDef.name;
                    var nonDeletedItemId = 'nonDeletedItemId';
                    var restoreItemFunc = function () {
                        itemsDS.restoreItem(fakePS, testTypeId, nonDeletedItemId);
                    };
                    expect(restoreItemFunc).toThrowError('Deleted item does not exist');
                });

                it('should not restore any other item', function () {
                    var testTypeId = defaultTypeDef.name;
                    var firstDeletedItemId = createFakeDeletedItemInDal(testTypeId, 'firstDeletedItemId');
                    var secondDeletedItemId = createFakeDeletedItemInDal(testTypeId, 'secondDeletedItemId');
                    itemsDS.restoreItem(fakePS, testTypeId, firstDeletedItemId);
                    var secondDeletedItem = getDeletedItemFromDal(testTypeId, secondDeletedItemId);
                    expect(secondDeletedItem).toBeDefined();
                });

            });

            describe('getAllItemsOfType', function () {

                it('should return a map of all items in the requested type', function () {
                    var testTypeId = defaultTypeDef.name;
                    var firstItemId = createFakeItemInDal(testTypeId, 'firstItemId');
                    var secondItemId = createFakeItemInDal(testTypeId, 'secondItemId');

                    var allItems = itemsDS.getAllItemsOfType(fakePS, testTypeId);
                    var expectedAllItems = {};
                    expectedAllItems[firstItemId] = getItemFromDal(testTypeId, firstItemId);
                    expectedAllItems[secondItemId] = getItemFromDal(testTypeId, secondItemId);

                    expect(allItems).toEqual(expectedAllItems);
                });

                it('should return an empty object if the type does not exist', function () {
                    var nonExistingTypeId = 'nonExistingTypeId';
                    var allItems = itemsDS.getAllItemsOfType(fakePS, nonExistingTypeId);
                    expect(allItems).toEqual({});
                });

                it('should not return deleted items', function () {
                    var testTypeId = defaultTypeDef.name;
                    var firstItemId = createFakeItemInDal(testTypeId, 'firstItemId');
                    var secondItemId = createFakeItemInDal(testTypeId, 'secondItemId');
                    itemsDS.deleteItem(fakePS, testTypeId, firstItemId);

                    var allItems = itemsDS.getAllItemsOfType(fakePS, testTypeId);
                    var expectedAllItems = {};
                    expectedAllItems[secondItemId] = getItemFromDal(testTypeId, secondItemId);

                    expect(allItems).toEqual(expectedAllItems);
                });

                it('should convert wixapps links to wix format', function() {
                    var testTypeId = defaultTypeDef.name;
                    var itemFields = {
                       links: {
                           title: {_type: 'wix:ExternalLink'}
                       },
                       richText: {
                           _type: 'wix:RichText',
                           text: 'some text',
                           links: [
                               {_type: 'wix:PageLink'}
                           ]
                       }
                   };

                    var testItemId = createFakeItemInDal(testTypeId, 'testItemId', itemFields);

                    spyOn(linksConverter, 'convertWixappsDataToWLink').and.callFake(function(ps, wixappsLink) {
                        return {type: wixappsLink._type.split(':')[1]};
                    });

                    var allItems = itemsDS.getAllItemsOfType(fakePS, testTypeId);

                    expect(linksConverter.convertWixappsDataToWLink).toHaveBeenCalledWith(fakePS, {_type: 'wix:PageLink'});
                    expect(linksConverter.convertWixappsDataToWLink).toHaveBeenCalledWith(fakePS, {_type: 'wix:ExternalLink'});

                    expect(allItems[testItemId].links.title).toEqual({type: 'ExternalLink'});
                    expect(allItems[testItemId].richText.links[0]).toEqual({type: 'PageLink'});
                });

                it('should fix any of the image fields when getting the items', function () {
                    var typeDef = {
                        "name": 'testTypeDef',
                        "displayName": "Test Type",
                        "baseTypes": [],
                        "fields": [{
                            "name": "title",
                            "displayName": "Title",
                            "type": "String",
                            "defaultValue": "I'm a Title",
                            "computed": false,
                            "searchable": false
                        }, {
                            "name": "image",
                            "displayName": "Image",
                            "type": "wix:Image",
                            "defaultValue": {
                                "_type": "wix:Image",
                                "height": 600,
                                "src": "images/items/bloom.jpg",
                                "title": "",
                                "width": 600
                            },
                            "computed": false,
                            "searchable": false
                        }, {
                            "name": "image2",
                            "displayName": "Image",
                            "type": "wix:Image",
                            "defaultValue": {
                                "_type": "wix:Image",
                                "height": 600,
                                "src": "images/items/bloom.jpg",
                                "title": "",
                                "width": 600
                            },
                            "computed": false,
                            "searchable": false
                        }, {
                            'displayName': 'Rich Text',
                            'name': 'richText',
                            'type': 'wix:RichText',
                            'defaultValue': {
                                'version': 1,
                                '_type': 'wix:RichText',
                                'links': [],
                                'text': 'Add Description here'
                            },
                            'searchable': false,
                            'computed': false
                        }],
                        "version": 0
                    };
                    appBuilderSiteData = createInitialData(typeDef);
                    fakePS = privateServicesHelper.mockPrivateServicesWithRealDAL();
                    fakePS.dal.full.setByPath(['wixapps', 'appbuilder'], appBuilderSiteData);
                    var serviceTopology = fakePS.dal.get(fakePS.pointers.general.getServiceTopology());

                    var testTypeId = typeDef.name;
                    var item = {
                        title: 'BARVAZ OGER',
                        image: testUtils.proxyData.createImageData('imageSrc', 300, 300, 'barvaz'),
                        image2: testUtils.proxyData.createImageData('imageSrc2', 302, 302, 'oger')
                    };
                    createFakeItemInDal(testTypeId, 'firstItemId', item);
                    spyOn(wixappsBuilder, 'resolveImageData').and.callThrough();

                    itemsDS.getAllItemsOfType(fakePS, testTypeId);

                    expect(wixappsBuilder.resolveImageData.calls.count()).toEqual(2);
                    expect(wixappsBuilder.resolveImageData).toHaveBeenCalledWith(item.image, serviceTopology);
                    expect(wixappsBuilder.resolveImageData).toHaveBeenCalledWith(item.image2, serviceTopology);
                });
            });
        });
    });
