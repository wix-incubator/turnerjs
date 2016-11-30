define([
        'lodash',
        'testUtils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/wixapps/utils/pathUtils',
        'documentServices/wixapps/services/listTemplates',
        'documentServices/wixapps/utils/wixappsConsts'
    ],
    function (_, testUtils, privateServicesHelper, pathUtils, listTemplatesDS, wixappsConsts) {
        'use strict';

        describe('Wixapps List Templates Document Services', function () {

            function getPrivateServices(appbuilderData) {
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                ps.dal.full.setByPath(['wixapps', 'appbuilder'], appbuilderData);

                return ps;
            }

            describe('generateTemplate', function () {

                var appbuilderData;
                beforeEach(function () {
                    appbuilderData = {
                        descriptor: {
                            parts: {
                                testListId: {
                                    displayName: 'Test Display Name',
                                    type: 'testTypeId',
                                    viewName: 'testViewId',
                                    dataSelector: 'testDataSelectorId'
                                }
                            },
                            types: {
                                testTypeId: {
                                  "name": 'testTypeId',
                                  "displayName": 'In the Press Library',
                                  "version": 0,
                                  "baseTypes": [],
                                  "fields": [
                                    {
                                      "displayName": 'Title',
                                      "name": 'title',
                                      "searchable": false,
                                      "type": 'String',
                                      "defaultValue": 'Write a catchy title...',
                                      "computed": false
                                    }
                                  ]
                                }
                            },
                            views: {
                                'testTypeId|testViewId': {testId: 'id1', name: 'testViewId', fake: 'fake value 1'},
                                'Array|testViewId': {testId: 'id2', name: 'testViewId', fake: 'fake value 2'},
                                'testTypeId|anotherView': {testId: 'id3', name: 'anotherView', fake: 'fake value 3'}
                            },
                            dataSelectors: {
                                testDataSelectorId: {
                                    forType: 'testTypeId',
                                    logicalTypeName: 'IB.ManualSelectedList',
                                    itemIds: ['testItem1', 'testItem2', 'testItem3']
                                }
                            },
                            offsetFromServerTime: 0
                        },
                        items: {
                            testTypeId: {
                                testItem1: {_iid: 'id1', fakeItem1: 'fake item 1'},
                                testItem2: {_iid: 'id1', fakeItem2: 'fake item 2'},
                                testItem3: {_iid: 'id1', fakeItem3: 'fake item 3'},
                                itemNotInList: {_iid: 'id1', fake: 'this item is not in the list'}
                            }
                        }
                    };
                });

                it('should include the list\'s type definition', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var preset = listTemplatesDS.generateTemplate(ps, 'testListId');
                    expect(preset.type).toEqual(appbuilderData.descriptor.types.testTypeId);
                });

                it('should include all list\'s views', function () {
                    var listViews = _.filter(appbuilderData.descriptor.views, {name: 'testViewId'});
                    var ps = getPrivateServices(appbuilderData);
                    var preset = listTemplatesDS.generateTemplate(ps, 'testListId');
                    expect(_.sortBy(preset.views, 'testId')).toEqual(_.sortBy(listViews, 'testId'));
                });

                it('should include all items of the list\'s type, omitting private fields', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var preset = listTemplatesDS.generateTemplate(ps, 'testListId');
                    expect(preset.items).toEqual(appbuilderData.items.testTypeId);
                });

                it('should include a list display name', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var preset = listTemplatesDS.generateTemplate(ps, 'testListId');
                    expect(preset.displayName).toEqual(appbuilderData.descriptor.parts.testListId.displayName);
                });

                it('should include a default name if list\'s display name is missing', function () {
                    delete appbuilderData.descriptor.parts.testListId.displayName;
                    var ps = getPrivateServices(appbuilderData);
                    var preset = listTemplatesDS.generateTemplate(ps, 'testListId');
                    expect(preset.displayName).toEqual('New List');
                });

                it('should throw an error if the list does not exist', function () {
                    delete appbuilderData.descriptor.parts.testListId;
                    var ps = getPrivateServices(appbuilderData);
                    var generateTemplateFunc = function () {
                        listTemplatesDS.generateTemplate(ps, 'testListId');
                    };
                    expect(generateTemplateFunc).toThrowError('List does not exist');
                });

                it('should throw an error if the list\'s type definition does not exist', function () {
                    delete appbuilderData.descriptor.types.testTypeId;
                    var ps = getPrivateServices(appbuilderData);
                    var generateTemplateFunc = function () {
                        listTemplatesDS.generateTemplate(ps, 'testListId');
                    };
                    expect(generateTemplateFunc).toThrowError('Type does not exist');
                });

                it('should throw an error if the list\'s views do not exist', function () {
                    appbuilderData.descriptor.views = {};
                    var ps = getPrivateServices(appbuilderData);
                    var generateTemplateFunc = function () {
                        listTemplatesDS.generateTemplate(ps, 'testListId');
                    };
                    expect(generateTemplateFunc).toThrowError('List views do not exist');
                });

                it('should throw an error if the list\'s data selector does not exist', function () {
                    delete appbuilderData.descriptor.dataSelectors.testDataSelectorId;
                    var ps = getPrivateServices(appbuilderData);
                    var generateTemplateFunc = function () {
                        listTemplatesDS.generateTemplate(ps, 'testListId');
                    };
                    expect(generateTemplateFunc).toThrowError('Data selector does not exist');
                });

                it('should throw an error for non manual lists which are not yet supported', function () {
                    appbuilderData.descriptor.dataSelectors.testDataSelectorId.logicalTypeName = 'nonSupportedDataSelector';
                    var ps = getPrivateServices(appbuilderData);
                    var generateTemplateFunc = function () {
                        listTemplatesDS.generateTemplate(ps, 'testListId');
                    };
                    expect(generateTemplateFunc).toThrowError('Only manual lists are supported');
                });

            });


            describe('createListFromTemplate', function () {

                var appbuilderData, fakeViews, fakeType, fakeItems;
                beforeEach(function () {
                    appbuilderData = {
                        descriptor: {
                            types: {},
                            views: {},
                            parts: {},
                            dataSelectors: {},
                            offsetFromServerTime: 0
                        },
                        items: {},
                        deletedItems: {}
                    };
                    fakeType = {
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
                    };
                    fakeViews = {
                        view1: {
                            name: 'fakeView',
                            forType: 'testTypeId',
                            idForTest: 'viewId1'
                        },
                        view2: {
                            name: 'fakeArrayView',
                            forType: 'Array',
                            idForTest: 'viewId2'
                        }
                    };
                    fakeItems = {
                        item1: {
                            idForTest: 'itemId1'
                        },
                        item2: {
                            idForTest: 'itemId2'
                        }
                    };
                });


                it('should throw an error if template does not contain a valid type', function () {
                    var templateWithInvalidType = {
                        type: {},
                        views: fakeViews
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var createFromTemplateFunc = function () {
                        listTemplatesDS.createListFromTemplate(ps, templateWithInvalidType);
                    };
                    expect(createFromTemplateFunc).toThrowError('Template\'s type definition is not valid');
                });

                it('should throw an error if template does not contain a valid view', function () {
                    var templateWithInvalidView = {
                        type: fakeType,
                        views: {}
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var createFromTemplateFunc = function () {
                        listTemplatesDS.createListFromTemplate(ps, templateWithInvalidView);
                    };
                    expect(createFromTemplateFunc).toThrowError('Template\'s view definitions are not valid');
                });

                it('should return a list ID', function () {
                    var template = {
                        type: fakeType,
                        views: fakeViews,
                        items: {},
                        displayName: 'list name'
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var listId = listTemplatesDS.createListFromTemplate(ps, template);
                    expect(listId).toEqual(jasmine.any(String));
                    expect(listId.length).toBeGreaterThan(0);
                });

                it('should add the list as a new part with required fields', function () {
                    var template = {
                        type: fakeType,
                        views: fakeViews,
                        items: {},
                        displayName: 'list name'
                    };
                    var expectedListDef = {
                        dataSelector: jasmine.any(String),
                        displayName: 'list name',
                        type: jasmine.any(String),
                        viewName: jasmine.any(String),
                        version: wixappsConsts.LIST_VERSION
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var listId = listTemplatesDS.createListFromTemplate(ps, template);
                    var listDef = ps.dal.getByPath(pathUtils.getPartPath(listId));
                    expect(listDef).toEqual(expectedListDef);
                });

                it('should use a default display name if missing in the template', function () {
                    var templateWithoutDisplayName = {
                        type: fakeType,
                        views: fakeViews,
                        items: {}
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var listId = listTemplatesDS.createListFromTemplate(ps, templateWithoutDisplayName);
                    var listDef = ps.dal.getByPath(pathUtils.getPartPath(listId));
                    expect(listDef.displayName).toEqual('New List');
                });

                it('should add the template\'s type with a new name', function () {
                    var template = {
                        type: fakeType,
                        views: fakeViews,
                        items: {},
                        displayName: 'list name'
                    };
                    template.type.displayName = 'Test Type Display Name';

                    var expectedType = _.cloneDeep(template.type);
                    expectedType.name = jasmine.any(String);
                    expectedType.version = 0;

                    var ps = getPrivateServices(appbuilderData);
                    var listId = listTemplatesDS.createListFromTemplate(ps, template);
                    var listDef = ps.dal.getByPath(pathUtils.getPartPath(listId));
                    var typeFromDal = ps.dal.getByPath(pathUtils.getTypePath(listDef.type));

                    expect(typeFromDal).toBeDefined();
                    expect(typeFromDal.displayName).toEqual(template.type.displayName);
                    expect(typeFromDal.name).toEqual(listDef.type);
                    expect(typeFromDal.name).not.toEqual(template.type.name);
                });

                it('should add all template\'s views with a new name and the right type', function () {
                    var template = {
                        type: fakeType,
                        views: fakeViews,
                        items: {}
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var listId = listTemplatesDS.createListFromTemplate(ps, template);
                    var listDef = ps.dal.getByPath(pathUtils.getPartPath(listId));

                    var allDalViews = ps.dal.getByPath(pathUtils.getBaseViewsPath());
                    _.forEach(template.views, function (view) {
                        var expectedType = view.forType === 'Array' ? 'Array' : listDef.type;
                        var viewInDal = _.find(allDalViews, {idForTest: view.idForTest});
                        expect(viewInDal).toBeDefined();
                        expect(viewInDal.forType).toEqual(expectedType);
                        expect(viewInDal.name).toEqual(listDef.viewName);
                        expect(viewInDal.name).not.toEqual(view.name);
                    });
                });

                it('should add the template\'s items with new unique IDs', function () {
                    var template = {
                        type: fakeType,
                        views: fakeViews,
                        items: fakeItems
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var listId = listTemplatesDS.createListFromTemplate(ps, template);
                    var listDef = ps.dal.getByPath(pathUtils.getPartPath(listId));

                    var allDalItems = ps.dal.getByPath(pathUtils.getBaseItemsPath(listDef.type));
                    _.forEach(template.items, function (item) {
                        var itemInDal = _.find(allDalItems, {idForTest: item.idForTest});
                        expect(itemInDal).toBeDefined();
                    });
                });

                it('should create a new manual data selector that contains the list\'s items', function () {
                    var template = {
                        type: fakeType,
                        views: fakeViews,
                        items: fakeItems
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var listId = listTemplatesDS.createListFromTemplate(ps, template);
                    var listDef = ps.dal.getByPath(pathUtils.getPartPath(listId));
                    expect(listDef.dataSelector).toBeDefined();
                    expect(listDef.dataSelector.length).toBeGreaterThan(0);

                    var dataSelectorFromDal = ps.dal.getByPath(pathUtils.getDataSelectorPath(listDef.dataSelector));
                    var listItemIds = _.keys(ps.dal.getByPath(pathUtils.getBaseItemsPath(listDef.type)));
                    expect(dataSelectorFromDal).toBeDefined();
                    expect(dataSelectorFromDal.itemIds.length).toBeGreaterThan(0);
                    expect(dataSelectorFromDal.itemIds.sort()).toEqual(listItemIds.sort());
                });

                it('should not modify the given template object', function () {
                    var template = {
                        type: fakeType,
                        views: fakeViews,
                        items: fakeItems,
                        displayName: 'display'
                    };
                    var givenTemplate = _.cloneDeep(template);
                    var ps = getPrivateServices(appbuilderData);
                    listTemplatesDS.createListFromTemplate(ps, template);
                    expect(template).toEqual(givenTemplate);
                });

                it('should increment displayName suffix until it is unique', function () {
                    var template = {
                        type: fakeType,
                        views: fakeViews,
                        items: {},
                        displayName: 'list name 1'
                    };
                    var ps = getPrivateServices(appbuilderData);
                    listTemplatesDS.createListFromTemplate(ps, template);
                    listTemplatesDS.createListFromTemplate(ps, template);
                    listTemplatesDS.createListFromTemplate(ps, template);
                    var fourthListId = listTemplatesDS.createListFromTemplate(ps, template);
                    var listDef = ps.dal.getByPath(pathUtils.getPartPath(fourthListId));
                    expect(listDef.displayName).toEqual('list name 4');
                });

                it('should copy hidden items of a list without including them in the new list dataSelector (i.e. as hidden items)', function () {
                    fakeItems = _.map(fakeItems, function (item) {
                        return _.assign({_iid: 'id_' + _.uniqueId()}, item);
                    });
                    var selectedItem = _(fakeItems).values().first();
                    var template = {
                        type: fakeType,
                        views: fakeViews,
                        items: fakeItems,
                        dataSelector: {
                            forType: 'testTypeId',
                            logicalTypeName: 'IB.ManualSelectedList',
                            itemIds: [selectedItem._iid]
                        },
                        displayName: 'list name 1'
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var newListId = listTemplatesDS.createListFromTemplate(ps, template);
                    var newListDef = ps.dal.getByPath(pathUtils.getPartPath(newListId));
                    var newItems = ps.dal.getByPath(pathUtils.getBaseItemsPath(newListDef.type));

                    // make sure the number of items in the new type are the same as in the template
                    expect(_.keys(newItems).length).toEqual(_.keys(fakeItems).length);

                    // Make sure that the number of items in the new dataSelector are the same as original one
                    var newDataSelectorDef = ps.dal.getByPath(pathUtils.getDataSelectorPath(newListDef.dataSelector));
                    expect(newDataSelectorDef.itemIds.length).toEqual(template.dataSelector.itemIds.length);

                    // expect the new dataSelector is pointing to the new created item
                    expect(newDataSelectorDef.itemIds[0]).not.toEqual(selectedItem._iid);

                    // expect the new item will be identical to the original except for it's _iid.
                    var newItem = newItems[newDataSelectorDef.itemIds[0]];
                    expect(newItem._iid).not.toEqual(selectedItem._iid);
                });

            });


            describe('setItemViewFromTemplate', function () {

                var appbuilderData, mockTemplate;
                beforeEach(function () {
                    appbuilderData = {
                        descriptor: {
                            types: {
                                testTypeId: {
                                    name: 'testTypeId',
                                    displayName: 'Test Type',
                                    fields: [
                                        {
                                            "name": "title",
                                            "displayName": "Title",
                                            "type": "String",
                                            "defaultValue": "I'm a news headline",
                                            "computed": false,
                                            "searchable": false
                                        }, {
                                            name: 'textField',
                                            displayName: 'Test ID',
                                            type: 'String',
                                            defaultValue: 'default',
                                            computed: false,
                                            searchable: false
                                        }, {
                                            "name": "imageField",
                                            "displayName": "Image",
                                            "type": "wix:Image",
                                            "defaultValue": {
                                                "_type": "wix:Image",
                                                "height": 600,
                                                "src": "images/items/bloom.jpg",
                                                "title": "Default image",
                                                "width": 600
                                            },
                                            "computed": false,
                                            "searchable": false
                                        }, {
                                            "name": "richTextField",
                                            "displayName": "News Story",
                                            "type": "wix:RichText",
                                            "defaultValue": {
                                                "_type": "wix:RichText",
                                                "text": "Add News Story here",
                                                "links": [],
                                                "version": 1
                                            },
                                            "computed": false,
                                            "searchable": false
                                        }, {
                                            "name": "buttonField",
                                            "displayName": "Button",
                                            "type": "String",
                                            "defaultValue": "Read More",
                                            "computed": false,
                                            "metadata": {"showAsHint": "AsButton"},
                                            "searchable": false
                                        }, {
                                            "name": "videoField",
                                            "displayName": "Video",
                                            "type": "wix:Video",
                                            "defaultValue": {
                                                "_type": "wix:Video",
                                                "videoId": "83nu4yXFcYU",
                                                "videoType": "YOUTUBE"
                                            },
                                            "computed": false,
                                            "searchable": false
                                        }, {
                                            "name": "links",
                                            "displayName": "",
                                            "type": "wix:Map",
                                            "defaultValue": {"_type": "wix:Map"},
                                            "computed": false,
                                            "searchable": false
                                        }
                                    ]
                                }
                            },
                            views: {
                                'testTypeId|testViewId': {
                                    name: 'testViewId',
                                    forType: 'testTypeId',
                                    idForTest: 'viewId1'
                                },
                                'Array|testViewId': {
                                    name: 'testViewId',
                                    forType: 'Array',
                                    idForTest: 'viewId2'
                                },
                                'testTypeId|testViewId|Mobile': {
                                    name: 'testViewId',
                                    format: 'Mobile',
                                    forType: 'testTypeId',
                                    idForTest: 'viewId3'
                                },
                                'Array|testViewId|Mobile': {
                                    name: 'testViewId',
                                    format: 'Mobile',
                                    forType: 'Array',
                                    idForTest: 'viewId4'
                                },
                                'testTypeId|testViewId2': {
                                    name: 'testViewId2',
                                    forType: 'testTypeId',
                                    idForTest: 'viewId1'
                                },
                                'Array|testViewId2': {
                                    name: 'testViewId2',
                                    forType: 'Array',
                                    idForTest: 'viewId2'
                                },
                                'testTypeId|testViewId2|Mobile': {
                                    name: 'testViewId2',
                                    format: 'Mobile',
                                    forType: 'testTypeId',
                                    idForTest: 'viewId3'
                                },
                                'Array|testViewId2|Mobile': {
                                    name: 'testViewId2',
                                    format: 'Mobile',
                                    forType: 'Array',
                                    idForTest: 'viewId4'
                                }
                            },
                            parts: {
                                testListId: {
                                    displayName: 'Test Display Name',
                                    type: 'testTypeId',
                                    viewName: 'testViewId',
                                    dataSelector: 'testDataSelectorId'
                                },
                                testListId2: {
                                    displayName: 'Test Display Name',
                                    type: 'testTypeId',
                                    viewName: 'testViewId2',
                                    dataSelector: 'testDataSelectorId2'
                                }
                            }
                        }
                    };
                    mockTemplate = {
                        type: {
                            name: 'templateTypeId',
                            displayName: 'Test Type',
                            fields: [
                                {
                                    "name": "title",
                                    "displayName": "Title",
                                    "type": "String",
                                    "defaultValue": "I'm a news headline",
                                    "computed": false,
                                    "searchable": false
                                }, {
                                    name: 'templateTextField',
                                    displayName: 'Test ID',
                                    type: 'String',
                                    defaultValue: 'default',
                                    computed: false,
                                    searchable: false
                                }, {
                                    "name": "templateImageField",
                                    "displayName": "Image",
                                    "type": "wix:Image",
                                    "defaultValue": {
                                        "_type": "wix:Image",
                                        "height": 600,
                                        "src": "images/items/bloom.jpg",
                                        "title": "Default image",
                                        "width": 600
                                    },
                                    "computed": false,
                                    "searchable": false
                                }, {
                                    "name": "templateRichTextField",
                                    "displayName": "News Story",
                                    "type": "wix:RichText",
                                    "defaultValue": {
                                        "_type": "wix:RichText",
                                        "text": "Add News Story here",
                                        "links": [],
                                        "version": 1
                                    },
                                    "computed": false,
                                    "searchable": false
                                }, {
                                    "name": "templateButtonField",
                                    "displayName": "Button",
                                    "type": "String",
                                    "defaultValue": "Read More",
                                    "computed": false,
                                    "metadata": {"showAsHint": "AsButton"},
                                    "searchable": false
                                }, {
                                    "name": "templateVideoField",
                                    "displayName": "Video",
                                    "type": "wix:Video",
                                    "defaultValue": {
                                        "_type": "wix:Video",
                                        "videoId": "83nu4yXFcYU",
                                        "videoType": "YOUTUBE"
                                    },
                                    "computed": false,
                                    "searchable": false
                                }, {
                                    "name": "links",
                                    "displayName": "",
                                    "type": "wix:Map",
                                    "defaultValue": {"_type": "wix:Map"},
                                    "computed": false,
                                    "searchable": false
                                }
                            ]
                        },
                        views: [
                            {
                                idForTest: 'fakeSimpleView',
                                forType: 'templateTypeId',
                                name: 'templateFakeSimpleView',
                                objectField: {
                                    data: 'title',
                                    innerObject: {
                                        data: 'templateTextField'
                                    }
                                },
                                arrayField: [
                                    'fakeArrayValue',
                                    {
                                        fake: 'fake attribute of object inside array',
                                        data: 'templateImageField'
                                    }
                                ]
                            },
                            {
                                idForTest: 'fakeMobileView',
                                forType: 'templateTypeId',
                                format: 'Mobile',
                                name: 'templateFakeMobileView',
                                objectField: {
                                    data: 'templateRichTextField',
                                    innerObject: {
                                        data: 'templateButtonField'
                                    }
                                },
                                arrayField: [
                                    'fakeArrayValue',
                                    {
                                        fake: 'fake attribute of object inside array',
                                        data: 'templateVideoField'
                                    }
                                ]
                            },
                            {
                                idForTest: 'fakeArrayView',
                                forType: 'Array',
                                name: 'templateFakeArrayView',
                                objectField: {
                                    data: 'templateVideoField',
                                    innerObject: {
                                        data: 'templateImageField'
                                    }
                                },
                                arrayField: [
                                    'fakeArrayValue',
                                    {
                                        fake: 'fake attribute of object inside array',
                                        data: 'templateRichTextField'
                                    }
                                ]
                            }
                        ]
                    };
                });

                it('should throw an error if template does not contain a valid type', function () {
                    mockTemplate.type = undefined;

                    var ps = getPrivateServices(appbuilderData);
                    var setItemViewFromTemplateFunc = function () {
                        listTemplatesDS.setItemViewFromTemplate(ps, 'testListId', mockTemplate);
                    };

                    expect(setItemViewFromTemplateFunc).toThrowError('Template\'s type definition is not valid');
                });

                it('should throw an error if template does not contain a valid item view', function () {
                    mockTemplate.views = _(mockTemplate.views).reject({idForTest: 'fakeSimpleView'})
                        .reject({idForTest: 'fakeMobileView'})
                        .value();

                    var ps = getPrivateServices(appbuilderData);
                    var setItemViewFromTemplateFunc = function () {
                        listTemplatesDS.setItemViewFromTemplate(ps, 'testListId', mockTemplate);
                    };

                    expect(setItemViewFromTemplateFunc).toThrowError('The template is missing an item view');
                });

                it('should replace view name, type, and all field references with references to their matching fields in the target list', function () {
                    var fieldMap = {
                        templateTextField: 'textField',
                        templateImageField: 'imageField',
                        templateRichTextField: 'richTextField',
                        templateButtonField: 'buttonField',
                        templateVideoField: 'videoField'
                    };
                    var fieldNamesRegex = new RegExp(_.keys(fieldMap).join('|'), 'g');

                    function getExpectedView(idForTest, templateViewName) {
                        var expectedViewStr = JSON.stringify(_.find(mockTemplate.views, {idForTest: idForTest}))
                            .replace(new RegExp(templateViewName, 'g'), 'testViewId')
                            .replace(fieldNamesRegex, function (match) {
                                return fieldMap[match];
                            });
                        var expectedView = JSON.parse(expectedViewStr);
                        expectedView.forType = 'testTypeId';
                        return expectedView;
                    }

                    var expectedDesktopView = getExpectedView('fakeSimpleView', 'templateFakeSimpleView');
                    var expectedMobileView = getExpectedView('fakeMobileView', 'templateFakeMobileView');

                    var ps = getPrivateServices(appbuilderData);
                    listTemplatesDS.setItemViewFromTemplate(ps, 'testListId', mockTemplate);
                    var desktopViewAfterReplacement = ps.dal.getByPath(pathUtils.getViewPath('testTypeId|testViewId'));
                    var mobileViewAfterReplacement = ps.dal.getByPath(pathUtils.getViewPath('testTypeId|testViewId|Mobile'));

                    expect(desktopViewAfterReplacement).toEqual(expectedDesktopView);
                    expect(mobileViewAfterReplacement).toEqual(expectedMobileView);
                });

                it('should not modify the given template object', function () {
                    var givenTemplate = _.cloneDeep(mockTemplate);
                    var ps = getPrivateServices(appbuilderData);
                    listTemplatesDS.setItemViewFromTemplate(ps, 'testListId', mockTemplate);
                    expect(mockTemplate).toEqual(givenTemplate);
                });

                it('should not replace any other views', function() {
                    var originalOtherViews = _.cloneDeep(_.omit(appbuilderData.descriptor.views, 'testTypeId|testViewId', 'testTypeId|testViewId|Mobile'));

                    var ps = getPrivateServices(appbuilderData);
                    listTemplatesDS.setItemViewFromTemplate(ps, 'testListId', mockTemplate);

                    var otherViewsAfterReplacement = _.omit(ps.dal.getByPath(pathUtils.getBaseViewsPath()), 'testTypeId|testViewId', 'testTypeId|testViewId|Mobile');
                    expect(otherViewsAfterReplacement).toEqual(originalOtherViews);
                });

                it('should remove from the created view, references to fields that do not exist in the new list', function () {
                    // TODO: maybe in the future ?
                });

            });

        });
    });
