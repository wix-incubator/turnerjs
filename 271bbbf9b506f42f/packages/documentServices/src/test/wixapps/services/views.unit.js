define([
        'lodash',
        'testUtils',
        'utils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/wixapps/utils/pathUtils',
        'documentServices/wixapps/services/views'
    ],
    function (_, testUtils, utils, privateServicesHelper, pathUtils, viewsDS) {
        'use strict';

        describe('Wixapps Views Document Services', function () {

            function getPrivateServices(appbuilderData) {
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL();
                ps.dal.full.setByPath(['wixapps', 'appbuilder'], appbuilderData);

                return ps;
            }

            function getViewFromDalByTestId(ps, testId) {
                return _.find(ps.dal.getByPath(pathUtils.getBaseViewsPath()), {testId: testId});
            }

            describe('getAllViewsByName', function () {

                it('should return a map of all views with the given name', function () {
                    var appbuilderData = {
                        descriptor: {
                            views: {
                                'testType|testViewName': {name: 'testViewName', fake: 'fake value 1'},
                                'testType|testViewName|mobile': {name: 'testViewName', fake: 'fake value 2'},
                                'testType|anotherView': {name: 'anotherView', fake: 'fake value 3'}
                            }
                        }
                    };
                    var expectedViews = {
                        'testType|testViewName': {name: 'testViewName', fake: 'fake value 1'},
                        'testType|testViewName|mobile': {name: 'testViewName', fake: 'fake value 2'}
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var returnedViews = viewsDS.getAllViewsByName(ps, 'testViewName');
                    expect(returnedViews).toEqual(expectedViews);
                });

                it('should return an empty map if no views exist with the given name', function () {
                    var appbuilderData = {
                        descriptor: {
                            views: {
                                testViewId3: {name: 'anotherView', fake: 'fake value 3'}
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    var returnedViews = viewsDS.getAllViewsByName(ps, 'nonExistingViewName');
                    expect(returnedViews).toEqual({});
                });

            });

            describe('views creation', function () {

                var exampleViewDef, appbuilderData;
                beforeEach(function () {
                    exampleViewDef = {
                        "name": "ExampleViewDef",
                        "forType": "testTypeId",
                        "vars": {"itemSpacing": 10, "paginationColor": "color_15"},
                        "comp": {
                            "name": "VBox",
                            "items": [{
                                "id": "paginatedlist"
                            }, {
                                "id": "noItemsLabel",
                                "value": "There are no items in this list",
                                "comp": {"name": "Label", "hidden": {"$expr": "gt(String.length(this), 0)"}}
                            }],
                            "editorData": {"isPaginated": true}
                        },
                        "stylesheet": [{
                            ".paginationPrev, .paginationNext": {
                                "padding": "0 5px",
                                "display": "inline-block",
                                "font-size": "14px",
                                "cursor": "pointer",
                                "-webkit-touch-callout": "none",
                                "-webkit-user-select": "none"
                            }
                        }],
                        "customizations": [
                            {fakeCustom1: 'fake customization 1'},
                            {fakeCustom2: 'fake customization 2'}
                        ],
                        "id": "def_0",
                        "format": "Mobile"
                    };
                    appbuilderData = {
                        descriptor: {
                            views: {},
                            types: {
                                testTypeId: {fake: 'fake type def'}
                            }
                        }
                    };
                });

                describe('createView', function () {

                    it('should create a new view with the given fields and a unique name', function () {
                        var fakeUniqueId = 'fakeUniqueId';
                        spyOn(utils.guidUtils, 'getUniqueId').and.returnValue(fakeUniqueId);
                        var expectedViewDef = _.cloneDeep(exampleViewDef);
                        expectedViewDef.name = exampleViewDef.name + '_' + fakeUniqueId;
                        var ps = getPrivateServices(appbuilderData);
                        var viewId = viewsDS.createView(ps, exampleViewDef);
                        var createdView = ps.dal.getByPath(pathUtils.getViewPath(viewId));
                        expect(createdView).toEqual(expectedViewDef);
                    });

                    it('should set a default name when none given', function () {
                        delete exampleViewDef.name;
                        var ps = getPrivateServices(appbuilderData);
                        var viewId = viewsDS.createView(ps, exampleViewDef);
                        var createdView = ps.dal.getByPath(pathUtils.getViewPath(viewId));
                        expect(createdView.name.indexOf('viewDef') === 0).toBeTruthy();
                    });

                    it('should set inner view references with the new view name', function () {

                        var innerItemWithReferenceToOldViewName = {
                            "id": "innerItemWithReferenceToOldViewName",
                            "value": "some value",
                            "comp": {
                                "name": exampleViewDef.name,
                                "hidden": {"$expr": "gt(String.length(this), 0)"},
                                "nestedObjWithName": {
                                    "key": 'value',
                                    "keyWithViewName": exampleViewDef.name
                                },
                                "arrayWithName": [
                                    'abc',
                                    exampleViewDef.name
                                ]
                            }
                        };
                        exampleViewDef.comp.items.push(innerItemWithReferenceToOldViewName);

                        var ps = getPrivateServices(appbuilderData);
                        var viewId = viewsDS.createView(ps, exampleViewDef);
                        var createdView = ps.dal.getByPath(pathUtils.getViewPath(viewId));

                        var expectedViewDef = _.cloneDeep(innerItemWithReferenceToOldViewName);
                        expectedViewDef.comp.name = createdView.name;
                        expectedViewDef.comp.nestedObjWithName.keyWithViewName = createdView.name;
                        expectedViewDef.comp.arrayWithName[1] = createdView.name;

                        expect(_.last(createdView.comp.items)).toEqual(expectedViewDef);
                    });

                    it('should return a key built from the view type, new name and format', function () {
                        ['Mobile', ''].forEach(function (format) {
                            exampleViewDef.format = format;
                            var ps = getPrivateServices(appbuilderData);
                            var viewId = viewsDS.createView(ps, exampleViewDef);
                            var createdView = ps.dal.getByPath(pathUtils.getViewPath(viewId));
                            var expectedViewId = _.compact([createdView.forType, createdView.name, format]).join('|');
                            expect(viewId).toEqual(expectedViewId);
                        });
                    });

                    it('should throw an error if the type does not exist', function () {
                        exampleViewDef.forType = 'nonExistingTypeId';
                        var ps = getPrivateServices(appbuilderData);
                        var createViewFunc = function () {
                            viewsDS.createView(ps, exampleViewDef);
                        };
                        expect(createViewFunc).toThrowError('Type does not exist');
                    });

                    it('should allow adding a view with type "Array"', function () {
                        exampleViewDef.forType = 'Array';
                        var ps = getPrivateServices(appbuilderData);
                        var viewId = viewsDS.createView(ps, exampleViewDef);
                        expect(viewId.indexOf('Array') === 0).toBeTruthy();
                    });

                    it('should not remove existing views', function () {
                        var existingView = {name: 'existingViewDef'};
                        appbuilderData.descriptor.views.existingViewId = existingView;
                        var ps = getPrivateServices(appbuilderData);
                        viewsDS.createView(ps, exampleViewDef);
                        var allViews = ps.dal.getByPath(pathUtils.getBaseViewsPath());
                        expect(allViews.existingViewId).toEqual(existingView);
                    });

                    it('should not modify the given view object', function () {
                        var exampleViewDefClone = _.cloneDeep(exampleViewDef);
                        var ps = getPrivateServices(appbuilderData);
                        viewsDS.createView(ps, exampleViewDef);
                        expect(exampleViewDef).toEqual(exampleViewDefClone);
                    });

                });

                describe('createViewsWithSameName', function () {
                    // TODO: copy all tests from createView ?

                    function createViewsWithTestId(baseViewDef, amount, randomFormat) {
                        var viewDefs = [];
                        for (var index = 1; index <= amount; index++) {
                            viewDefs.push(_.merge({}, baseViewDef, {
                                testId: 'testId' + index,
                                format: randomFormat ? index : baseViewDef.format
                            }));
                        }
                        return viewDefs;
                    }

                    function getViewsFromDal(ps, viewIds) {
                        return _.map(viewIds, function (id) {
                            return ps.dal.getByPath(pathUtils.getViewPath(id));
                        });
                    }

                    it('should add all views', function () {
                        var viewDefs = createViewsWithTestId(exampleViewDef, 4, true);
                        var expectedViewDefs = _.map(viewDefs, function (viewDef) {
                            return _.merge({}, viewDef, {name: jasmine.any(String)});
                        });
                        var ps = getPrivateServices(appbuilderData);
                        viewsDS.createViewsWithSameName(ps, viewDefs);
                        _.forEach(expectedViewDefs, function (expectedViewDef) {
                            expect(getViewFromDalByTestId(ps, expectedViewDef.testId)).toEqual(expectedViewDef);
                        });
                    });

                    it('should return an array of IDs for each view', function () {
                        var viewDefs = createViewsWithTestId(exampleViewDef, 4, true);
                        var expectedViewDefs = _.map(viewDefs, function (viewDef) {
                            return _.merge({}, viewDef, {name: jasmine.any(String)});
                        });
                        var ps = getPrivateServices(appbuilderData);
                        var viewIds = viewsDS.createViewsWithSameName(ps, viewDefs);
                        expect(viewIds.length).toEqual(4);
                        var createdViews = getViewsFromDal(ps, viewIds);
                        expect(_.sortBy(createdViews, 'testId')).toEqual(_.sortBy(expectedViewDefs, 'testId'));
                    });

                    it('should not allow creating multiple views with the same ID (type, name, format)', function () {
                        var viewDefs = createViewsWithTestId(exampleViewDef, 2);
                        var ps = getPrivateServices(appbuilderData);
                        var createViewsFunc = function () {
                            viewsDS.createViewsWithSameName(ps, viewDefs);
                        };
                        expect(createViewsFunc).toThrowError('Cannot created multiple views with the same type, name & format');
                    });


                    it('should set the same name on all views', function () {
                        var viewDefs = createViewsWithTestId(exampleViewDef, 4, true);
                        var ps = getPrivateServices(appbuilderData);
                        var viewIds = viewsDS.createViewsWithSameName(ps, viewDefs);
                        var createdViewNames = _.pluck(getViewsFromDal(ps, viewIds), 'name');
                        var firstCreatedName = createdViewNames[0];
                        _.forEach(createdViewNames, function (name) {
                            expect(name).toEqual(firstCreatedName);
                        });
                    });

                    it('should use the name of the first view as the new name prefix', function () {
                        var viewDefs = createViewsWithTestId(exampleViewDef, 4, true);
                        var firstViewName = viewDefs[0].name;
                        var ps = getPrivateServices(appbuilderData);
                        var viewIds = viewsDS.createViewsWithSameName(ps, viewDefs);
                        var createdViews = getViewsFromDal(ps, viewIds);
                        expect(createdViews[0].name.indexOf(firstViewName) === 0).toBeTruthy();
                    });

                    it('should use a default prefix if first view is missing a name', function () {
                        var viewDefs = createViewsWithTestId(exampleViewDef, 4, true);
                        delete viewDefs[0].name;
                        var ps = getPrivateServices(appbuilderData);
                        var viewIds = viewsDS.createViewsWithSameName(ps, viewDefs);
                        var createdViews = getViewsFromDal(ps, viewIds);
                        expect(createdViews[0].name.indexOf('viewDef') === 0).toBeTruthy();
                    });

                });

            });

            describe('getViewById', function () {

                var appbuilderData;
                beforeEach(function () {
                    appbuilderData = {
                        descriptor: {
                            views: {}
                        }
                    };
                });

                it('should get the requested view definition', function () {
                    appbuilderData.descriptor.views = {
                        'Array|ViewName|Mobile': {fake: 'fake view 1'},
                        'Type|ViewName': {fake: 'fake view 2'}
                    };
                    var ps = getPrivateServices(appbuilderData);
                    expect(viewsDS.getViewById(ps, 'Array|ViewName|Mobile')).toEqual(appbuilderData.descriptor.views['Array|ViewName|Mobile']);
                    expect(viewsDS.getViewById(ps, 'Type|ViewName')).toEqual(appbuilderData.descriptor.views['Type|ViewName']);
                });

                it('should return undefined when the view does not exist', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var returnedView = viewsDS.getViewById(ps, 'nonExistingViewId');
                    expect(returnedView).toBeUndefined();
                });

            });

            describe('getView', function () {

                var appbuilderData;
                beforeEach(function () {
                    appbuilderData = {
                        descriptor: {
                            views: {}
                        }
                    };
                });

                it('should get the requested view definition', function () {
                    appbuilderData.descriptor.views = {
                        'Array|ViewName|Mobile': {fake: 'fake view 1'},
                        'Type|ViewName': {fake: 'fake view 2'}
                    };
                    var ps = getPrivateServices(appbuilderData);
                    expect(viewsDS.getView(ps, 'Array', 'ViewName', 'Mobile')).toEqual(appbuilderData.descriptor.views['Array|ViewName|Mobile']);
                    expect(viewsDS.getView(ps, 'Type', 'ViewName')).toEqual(appbuilderData.descriptor.views['Type|ViewName']);
                });

                it('should return undefined when the view does not exist', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var returnedView = viewsDS.getView(ps, 'Array', 'ViewName', 'Mobile');
                    expect(returnedView).toBeUndefined();
                });

            });

            describe('deleteAllViewsByName', function () {

                var appbuilderData;
                beforeEach(function () {
                    appbuilderData = {
                        descriptor: {
                            views: {}
                        }
                    };
                });

                it('should delete all views with the given name', function () {
                    appbuilderData.descriptor.views = {
                        'Array|viewName|Mobile': {
                            fakeAttribute: 'fake value 1',
                            name: 'viewName'
                        },
                        'Type|viewName': {
                            fakeAttribute: 'fake value 2',
                            name: 'viewName'
                        },
                        'Type|anotherName': {
                            fakeAttribute: 'fake value 3',
                            name: 'anotherName'
                        }
                    };
                    var ps = getPrivateServices(appbuilderData);
                    viewsDS.deleteAllViewsByName(ps, 'viewName');

                    var allDalViews = ps.dal.getByPath(pathUtils.getBaseViewsPath());
                    var expectedRemainingViews = {
                        'Type|anotherName': appbuilderData.descriptor.views['Type|anotherName']
                    };

                    expect(allDalViews).toEqual(expectedRemainingViews);
                });

                it('should not fail if no views with the given name exist', function () {
                    appbuilderData.descriptor.views = {
                        'Type|viewName': {
                            fakeAttribute: 'fake value 1',
                            name: 'viewName'
                        }
                    };
                    var ps = getPrivateServices(appbuilderData);
                    var deleteFunc = function () {
                        viewsDS.deleteAllViewsByName(ps, 'nonExistingViewName');
                    };
                    expect(deleteFunc).not.toThrow();
                });

                it('should not fail if no views exist at all', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var deleteFunc = function () {
                        viewsDS.deleteAllViewsByName(ps, 'nonExistingViewName');
                    };
                    expect(deleteFunc).not.toThrow();
                });

            });

            describe('replaceView', function () {

                var appbuilderData, newView;
                beforeEach(function () {
                    appbuilderData = {
                        descriptor: {
                            views: {
                                testViewId: {
                                    name: 'oldViewName',
                                    forType: 'testTypeId'
                                }
                            }
                        }
                    };
                    newView = {
                        testId: 'newViewTestId',
                        name: 'newViewName',
                        forType: 'newViewType',
                        objField: {
                            refToName: 'newViewName',
                            innerArray: [
                                'newViewName',
                                'other value'
                            ],
                            innerObj: {
                                someKey: 'someValue',
                                anotherRefToName: 'newViewName'
                            }
                        }
                    };
                });

                it('should throw an error if the view does not exist', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var replaceViewFunc = function () {
                        viewsDS.replaceView(ps, 'nonExistingViewId', newView);
                    };
                    expect(replaceViewFunc).toThrowError('View does not exist');
                });

                it('should throw an error if no view def given', function () {
                    var ps = getPrivateServices(appbuilderData);
                    var replaceViewFunc = function () {
                        viewsDS.replaceView(ps, 'testViewId', undefined);
                    };
                    expect(replaceViewFunc).toThrowError('Must provide a view definition');
                });

                it('should replace the existing view with the given one', function () {
                    var ps = getPrivateServices(appbuilderData);
                    viewsDS.replaceView(ps, 'testViewId', newView);

                    var allDalViews = ps.dal.getByPath(pathUtils.getBaseViewsPath());
                    expect(_.values(allDalViews).length).toEqual(1);
                    expect(allDalViews.testViewId.testId).toEqual('newViewTestId');
                });

                it('should change all references to the view name and type in the new view', function () {
                    var expectedViewDef = _.cloneDeep(newView);
                    expectedViewDef.name = 'oldViewName';
                    expectedViewDef.objField.refToName = 'oldViewName';
                    expectedViewDef.objField.innerArray[0] = 'oldViewName';
                    expectedViewDef.objField.innerObj.anotherRefToName = 'oldViewName';
                    expectedViewDef.forType = 'testTypeId';

                    var ps = getPrivateServices(appbuilderData);
                    viewsDS.replaceView(ps, 'testViewId', newView);

                    var viewDefAfterReplacement = getViewFromDalByTestId(ps, 'newViewTestId');
                    expect(viewDefAfterReplacement).toEqual(expectedViewDef);
                });

            });

            describe('setValueInView', function () {
                it('desktop - sets the value in the desktop, and not mobile', function () {
                    var appbuilderData = {
                        descriptor: {
                            views: {
                                'type|viewName': {fake: {item: 'xyz1'}},
                                'type|viewName|Mobile': {fake: {item: 'xyz2'}}
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    viewsDS.setValueInView(ps, 'type', 'viewName', ['fake', 'item'], 'abc');
                    var desktopView = viewsDS.getView(ps, 'type', 'viewName');
                    var mobileView = viewsDS.getView(ps, 'type', 'viewName', 'Mobile');
                    expect(desktopView.fake.item).toEqual('abc');
                    expect(mobileView.fake.item).toEqual('xyz2');
                });
                it('mobile - sets the value in mobile, and not desktop', function () {
                    var appbuilderData = {
                        descriptor: {
                            views: {
                                'type|viewName': {fake: {item: 'xyz1'}},
                                'type|viewName|Mobile': {fake: {item: 'xyz2'}}
                            }
                        }
                    };

                    var ps = getPrivateServices(appbuilderData);
                    viewsDS.setValueInView(ps, 'type', 'viewName', ['fake', 'item'], 'abc', 'Mobile');
                    var desktopView = viewsDS.getView(ps, 'type', 'viewName');
                    var mobileView = viewsDS.getView(ps, 'type', 'viewName', 'Mobile');
                    expect(desktopView.fake.item).toEqual('xyz1');
                    expect(mobileView.fake.item).toEqual('abc');
                });
            });

        });
    });
