define([
        'lodash',
        'testUtils',
        'utils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/wixapps/utils/pathUtils',
        'documentServices/wixapps/services/types'
    ],
    function (_, testUtils, utils, privateServicesHelper, pathUtils, typesDS) {
        'use strict';

        describe('Wixapps Types Document Services', function () {

            function getPrivateServices(appbuilderData) {
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                ps.dal.full.setByPath(['wixapps', 'appbuilder'], appbuilderData);

                return ps;
            }

            var typeForFieldOrderTest;
            beforeEach(function() {
                typeForFieldOrderTest = {
                    fakeId: 'fakeId',
                    fields: [
                        {type: 'String', name: 'subtitle'},
                        {type: 'wix:Video', name: 'video'},
                        {type: 'wix:Date', name: 'date1'},
                        {type: 'String', name: 'title'},
                        {type: 'wix:Image', name: 'image2'},
                        {type: 'String', name: 'price', metadata: {showAsHint: 'AsPrice'}},
                        {type: 'wix:Image', name: 'image1'},
                        {type: 'String', name: 'button', metadata: {showAsHint: 'AsButton'}},
                        {type: 'wix:RichText', name: 'description'},
                        {type: 'wix:Date', name: 'date2'}
                    ]
                };
            });

            describe('getType', function () {

                var appbuilderData;
                beforeEach(function () {
                    appbuilderData = {
                        descriptor: {
                            types: {
                                typeId1: {barvaz: "oger"},
                                typeId2: {oger: "barvaz"}
                            }
                        }
                    };
                });

                it('should get the requested type definition', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var returnedType = typesDS.getType(ps, "typeId1");
                    expect(returnedType).toEqual(appbuilderData.descriptor.types.typeId1);
                });

                it('should return undefined when the type does not exist', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var returnedType = typesDS.getType(ps, 'undefinedType');
                    expect(returnedType).toBeUndefined();
                });

                it('should return the fields in the correct order', function() {
                    appbuilderData.descriptor.types = {
                        testTypeDef: typeForFieldOrderTest
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var returnedFields = typesDS.getType(ps, 'testTypeDef').fields;

                    expect(returnedFields[0].name).toEqual('title');
                    expect(returnedFields[1].name).toEqual('subtitle');
                    expect(returnedFields[2].name).toEqual('date1');
                    expect(returnedFields[3].name).toEqual('date2');
                    expect(returnedFields[4].name).toEqual('description');
                    expect(returnedFields[5].name).toEqual('price');
                    expect(returnedFields[6].name).toEqual('image2');
                    expect(returnedFields[7].name).toEqual('image1');
                    expect(returnedFields[8].name).toEqual('video');
                    expect(returnedFields[9].name).toEqual('button');
                });

            });

            describe('getAllTypes', function () {

                var appbuilderData;
                beforeEach(function () {
                    appbuilderData = {
                        descriptor: {
                            types: {
                                typeId1: {barvaz: "oger"},
                                typeId2: {oger: "barvaz"}
                            }
                        }
                    };
                });

                it('should return all types', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var returnedType = typesDS.getAllTypes(ps);
                    expect(returnedType).toEqual(appbuilderData.descriptor.types);
                });

                it('should return the fields in the correct order', function() {
                    appbuilderData.descriptor.types = {
                        testTypeDef: typeForFieldOrderTest
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var returnedFields = typesDS.getAllTypes(ps).testTypeDef.fields;

                    expect(returnedFields[0].name).toEqual('title');
                    expect(returnedFields[1].name).toEqual('subtitle');
                    expect(returnedFields[2].name).toEqual('date1');
                    expect(returnedFields[3].name).toEqual('date2');
                    expect(returnedFields[4].name).toEqual('description');
                    expect(returnedFields[5].name).toEqual('price');
                    expect(returnedFields[6].name).toEqual('image2');
                    expect(returnedFields[7].name).toEqual('image1');
                    expect(returnedFields[8].name).toEqual('video');
                    expect(returnedFields[9].name).toEqual('button');
                });
            });

            describe('createType', function () {

                var fakeTypeDef, emptyAppbuilderData;
                beforeEach(function() {
                    emptyAppbuilderData = {
                        descriptor: {
                            types: {}
                        },
                        items: {},
                        deletedItems: {}
                    };
                    fakeTypeDef = {
                        name: 'testType',
                        displayName: 'Test Type',
                        fields: ['fakeField1', 'fakeField2'],
                        baseTypes: ['fakeType1', 'fakeType2'],
                        version: 0
                    };
                });

                it('should return a type id', function() {
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId = typesDS.createType(ps, fakeTypeDef);
                    expect(typeId).toEqual(jasmine.any(String));
                    expect(typeId.length).toBeGreaterThan(0);
                });

                it('should add a new type with the given fields', function() {
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId = typesDS.createType(ps, fakeTypeDef);

                    var expectedTypeDef = _.cloneDeep(fakeTypeDef);
                    expectedTypeDef.name = typeId;
                    expectedTypeDef.version = 0;

                    var createdType = ps.dal.getByPath(pathUtils.getTypePath(typeId));
                    expect(createdType).toEqual(expectedTypeDef);
                });

                it('should add a serial number id to the type ID', function() {
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId1 = typesDS.createType(ps, fakeTypeDef);
                    var typeId2 = typesDS.createType(ps, fakeTypeDef);
                    expect(typeId1).toEqual(fakeTypeDef.name + '_1');
                    expect(typeId2).toEqual(fakeTypeDef.name + '_2');
                });

                it('should add a serial number id to the type ID, depends on the original type name', function() {
                    var anotherTypeName = 'SomeOtherType';
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId1 = typesDS.createType(ps, fakeTypeDef);
                    var typeId2 = typesDS.createType(ps, _.defaults({name: anotherTypeName}, fakeTypeDef));
                    expect(typeId1).toEqual(fakeTypeDef.name + '_1');
                    expect(typeId2).toEqual(anotherTypeName + '_1');
                });

                it('should add a serial number id to the type ID, according to the current repo, i.e. no prefix like that was exist', function() {
                    fakeTypeDef.name = 'SomeOtherType_2';
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId1 = typesDS.createType(ps, fakeTypeDef);
                    var typeId2 = typesDS.createType(ps, fakeTypeDef);
                    expect(typeId1).toEqual('SomeOtherType_1');
                    expect(typeId2).toEqual('SomeOtherType_2');
                });

                it('should add a serial number id to the type ID, when the name suffix is not a number', function() {
                    fakeTypeDef.name = 'SomeOtherType_ij3333';
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId1 = typesDS.createType(ps, fakeTypeDef);
                    var typeId2 = typesDS.createType(ps, fakeTypeDef);
                    expect(typeId1).toEqual(fakeTypeDef.name + '_1');
                    expect(typeId2).toEqual(fakeTypeDef.name + '_2');
                });

                it('should use a default name of "type" if none given', function() {
                    delete fakeTypeDef.name;
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId = typesDS.createType(ps, fakeTypeDef);
                    var createdType = ps.dal.getByPath(pathUtils.getTypePath(typeId));
                    expect(createdType.name.indexOf('type') === 0).toBeTruthy();
                });

                it('should use name as the displayName if none given', function() {
                    delete fakeTypeDef.displayName;
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId = typesDS.createType(ps, fakeTypeDef);
                    var createdType = ps.dal.getByPath(pathUtils.getTypePath(typeId));
                    expect(createdType.displayName).toEqual(createdType.name);
                });

                it('should create an empty fields array if none given', function() {
                    delete fakeTypeDef.fields;
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId = typesDS.createType(ps, fakeTypeDef);
                    var createdType = ps.dal.getByPath(pathUtils.getTypePath(typeId));
                    expect(createdType.fields).toEqual([]);
                });

                it('should create an empty baseTypes array if none given', function() {
                    delete fakeTypeDef.baseTypes;
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId = typesDS.createType(ps, fakeTypeDef);
                    var createdType = ps.dal.getByPath(pathUtils.getTypePath(typeId));
                    expect(createdType.baseTypes).toEqual([]);
                });

                it('should always start with version 0', function() {
                    fakeTypeDef.version = 23;
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId = typesDS.createType(ps, fakeTypeDef);
                    var createdType = ps.dal.getByPath(pathUtils.getTypePath(typeId));
                    expect(createdType.version).toEqual(0);
                });

                it('should not modify the given typeDef', function() {
                    var givenTypeDef = {name: 'type name'};
                    var givenTypeDefClone = _.cloneDeep(givenTypeDef);
                    var ps = getPrivateServices(emptyAppbuilderData);
                    typesDS.createType(ps, givenTypeDef);
                    expect(givenTypeDef).toEqual(givenTypeDefClone);
                });

                it('should add a path for items that belong to the type', function() {
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId = typesDS.createType(ps);
                    var typeItemsPath = pathUtils.getBaseItemsPath(typeId);
                    expect(ps.dal.getByPath(typeItemsPath)).toEqual({});
                });

                xit('should add a path for deletedItems that belong to the type', function() {
                    var ps = getPrivateServices(emptyAppbuilderData);
                    var typeId = typesDS.createType(ps);
                    var typeDeletedItemsPath = pathUtils.getBaseDeletedItemsPath(typeId);
                    expect(ps.dal.getByPath(typeDeletedItemsPath)).toEqual({});
                });

                describe('displayName', function() {
                    it('should have incremented number suffix', function() {
                        var ps = getPrivateServices(emptyAppbuilderData);
                        typesDS.createType(ps, fakeTypeDef);
                        var typeId = typesDS.createType(ps, fakeTypeDef);
                        var createdType = ps.dal.getByPath(pathUtils.getTypePath(typeId));
                        expect(createdType.displayName).toEqual(fakeTypeDef.displayName + ' 2');
                    });

                    it('should have incremented number suffix when a number suffix already exists', function() {
                        var ps = getPrivateServices(emptyAppbuilderData);
                        fakeTypeDef.displayName = 'Test 2015';
                        typesDS.createType(ps, fakeTypeDef);
                        var secondTypeId = typesDS.createType(ps, fakeTypeDef);
                        var createdType = ps.dal.getByPath(pathUtils.getTypePath(secondTypeId));
                        expect(createdType.displayName).toEqual('Test 2016');
                    });

                    it('should increment suffix until display name is unique', function() {
                        var ps = getPrivateServices(emptyAppbuilderData);
                        fakeTypeDef.displayName = 'Test 1';
                        typesDS.createType(ps, fakeTypeDef);
                        typesDS.createType(ps, fakeTypeDef);
                        typesDS.createType(ps, fakeTypeDef);
                        var secondTypeId = typesDS.createType(ps, fakeTypeDef);
                        var createdType = ps.dal.getByPath(pathUtils.getTypePath(secondTypeId));
                        expect(createdType.displayName).toEqual('Test 4');
                    });
                });
            });
        });
    });
