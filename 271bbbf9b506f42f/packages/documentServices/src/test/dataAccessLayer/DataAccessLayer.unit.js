define(['lodash', 'core', 'documentServices/dataAccessLayer/DataAccessLayer', 'testUtils'],
    function (_, core, DataAccessLayer, testUtils) {
        'use strict';
        var DAL, dalConfig, fullJsonCache, siteData;
        var PointersCache = core.PointersCache;

        function mockSiteData() {
            siteData = testUtils.mockFactory.mockSiteData();
            siteData.pagesData = {
                "page1": {
                    "structure": {
                        "type": "Page",
                        "layout": {
                            "width": 980,
                            "height": 3187,
                            "x": 0,
                            "y": 0
                        },
                        "components": [
                            {
                                "type": "Component",
                                "id": "ppPrt4-169c",
                                "componentType": "wixapps.integration.components.AppPart"
                            },
                            {
                                "type": "Component",
                                "id": "WRchTxt2-isn",
                                "componentType": "wysiwyg.viewer.components.WRichText"
                            }
                        ]
                    }
                },
                "masterPage": {
                    "data": {
                        "document_data": {
                            "MAIN_MENU": {
                                "type": "Menu",
                                "id": "MAIN_MENU",
                                "metaData": {
                                    "isPreset": true,
                                    "schemaVersion": "1.0",
                                    "isHidden": false
                                },
                                "items": [
                                    {
                                        "refId": "#page1",
                                        "items": [
                                            {
                                                "refId": "#cegn",
                                                "items": []
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                        "theme_data": {
                            "CntctFrm0_hljsbeau": {
                                "type": "TopLevelStyle",
                                "id": "CntctFrm0_hljsbeau",
                                "componentClassName": "wysiwyg.viewer.components.ContactForm",
                                "skin": "wysiwyg.viewer.skins.contactform.VerticalFormLabelsLeft"
                            }
                        },
                        "component_properties": {
                            "SITE_PAGES": {
                                "type": "PageGroupProperties",
                                "transition": "outIn"
                            }
                        }
                    },
                    "structure": {}
                }
            };
            siteData.imUndoable = {"pageId": "mainPage"};
            return siteData;
        }

        describe('DAL', function () {
            beforeEach(function () {
                siteData = mockSiteData();
                var cache = new PointersCache(siteData, siteData, siteData);
                fullJsonCache = cache.getBoundCacheInstance(true);
                dalConfig = {
                    pathsInJsonData: {
                        'json1': [
                            {path: ['pagesData'], optional: false},
                            {path: ['imUndoable'], optional: false},
                            {path: ['origin'], optional: false}
                        ]
                    },
                    isReadOnly: false,
                    origin: 'Editor1.4'
                };
                DAL = new DataAccessLayer({json1: siteData}, null, fullJsonCache, dalConfig);
            });

            describe('DAL Initialization', function () {
                it('should create an Immutablejs Object from siteData', function () {
                    expect(DAL.immutableSiteJsons).toBeDefined();
                });

                it('should throw error in case a non optional (mandatory) path doesnt exist in the json', function () {
                    var path = ['pagesData', 'x', 'y'];
                    var initDAL = function () {
                        dalConfig.pathsInJsonData.json1.push({path: path, optional: false});
                        DAL = new DataAccessLayer({json1: siteData}, null, fullJsonCache, dalConfig);
                    };

                    expect(initDAL).toThrow(new Error('path does not exist - ' + path));
                });

                it('should throw error in case a non optional path doesnt exist in the json', function () {
                    var initDAL = function () {
                        dalConfig.pathsInJsonData.json1.push({path: ['pagesData', 'x', 'y'], optional: true});
                        DAL = new DataAccessLayer({json1: siteData}, null, fullJsonCache, dalConfig);
                    };

                    expect(initDAL).not.toThrow();
                });

                xit('should trhow error in case there is no store in siteData', function () {
                    var initDAL = function () {
                        var siteDataWithoutStore = {};
                        return new DataAccessLayer({json1: siteDataWithoutStore});
                    };

                    expect(initDAL).toThrow();
                });

                it("should create an 'initial snapshot' for the data", function () {
                    expect(DAL.initialSnapshot).not.toBeNull();
                });
            });

            describe('Dal.immutable', function(){
                describe('.getSnapshotByTagAndIndex', function () {
                    var tag = 'save';
                    beforeEach(function () {
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 300);
                        DAL.takeSnapshot(tag);
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 500);
                        DAL.takeSnapshot(tag);
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 200);
                        DAL.takeSnapshot(tag);
                    });
                    it('should return an immutable object equal to the siteJson from the historydictionary, which when serialized, returns the same as DAL.getSnapshotByTagAndIndex', function () {
                        var index = 2;
                        var historyItem = DAL.historyDictionary[tag][index];

                        var immutableSnapshot = DAL.immutable.getSnapshotByTagAndIndex(tag, index);
                        var serializedSnapshot = DAL.getSnapshotByTagAndIndex(tag, index);

                        expect(immutableSnapshot.equals(historyItem.get('json1'))).toBe(true);
                        expect(immutableSnapshot.toJS()).toEqual(serializedSnapshot);
                    });

                    it('should throw an error for index out of bound', function () {
                        var index = 3;

                        expect(DAL.immutable.getSnapshotByTagAndIndex.bind(DAL, index)).toThrow(new Error('requested index in history stack is out of bound'));
                    });
                });
                describe('.getLastSnapshotByTagName', function () {
                    var tag = 'save';
                    beforeEach(function () {
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 300);
                        DAL.takeSnapshot(tag);
                    });
                    it('should return the data from history stack on the specified index', function () {
                        var immutablePagesData = DAL.immutable.getLastSnapshotByTagName(tag);
                        var expectedResult = siteData.pagesData;
                        expect(immutablePagesData.get('pagesData').toJS()).toEqual(expectedResult);
                    });
                    it('should return null if the snapshot does not exist, and not throw an error', function () {
                        var getNonExistingSnapshot = function () {
                            return DAL.immutable.getLastSnapshotByTagName('blablabla');
                        };
                        expect(getNonExistingSnapshot).not.toThrow();
                        expect(getNonExistingSnapshot()).toBeNull();
                    });
                    it('should return null if the snapshot tag exists, but there is no snapshot in the history, and not throw an error', function () {
                        var getNonExistingSnapshot = function () {
                            return DAL.immutable.getLastSnapshotByTagName(tag);
                        };
                        DAL.removeLastSnapshot(tag);

                        expect(getNonExistingSnapshot).not.toThrow();
                        expect(getNonExistingSnapshot()).toBeNull();
                    });
                });
                describe('.getInitialSnapshot', function () {
                    it('should return the immutable initialSnapshot for the siteJsons, which serializes to the same as DAL.getInitialSnapshot', function () {
                        var tag = 'someTag';
                        DAL.takeSnapshot(tag); //took snapshot without any changes in site
                        var initialSnapshot = DAL.getInitialSnapshot();
                        var initialSnapshotAsImmutable = DAL.immutable.getInitialSnapshot();
                        expect(initialSnapshotAsImmutable.toJS()).toEqual(initialSnapshot);
                    });
                    it('should always return the same initial snapshot- it should never change', function () {
                        var tag = 'someTag';
                        var initialSnapshot = DAL.getInitialSnapshot();
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 300);
                        DAL.takeSnapshot(tag);
                        var initialSnapshotAsImmutable = DAL.immutable.getInitialSnapshot();
                        expect(initialSnapshotAsImmutable.toJS()).toEqual(initialSnapshot);
                    });
                });
                describe('.getByPath', function () {
                    it('should return entry as an immutable object given path to an object, which serializes to the same as DAL.getByPath', function () {
                        var path = ['pagesData', 'page1'];

                        var immutablePage = DAL.immutable.getByPath(path);
                        expect(immutablePage.toJS()).toEqual(DAL.getByPath(path));
                    });
                    it('should return a value given the path to a simple value (number, string)', function () {
                        var path = ['pagesData', 'page1', 'structure', 'layout', 'width'];

                        var width = DAL.immutable.getByPath(path);
                        expect(width).toEqual(siteData.pagesData.page1.structure.layout.width);
                    });
                    it('should return undefined for path to non existing value/entry/object', function () {
                        var nonExistingPath = ['pagesData', 'page7'];

                        var entry = DAL.immutable.getByPath(nonExistingPath);

                        expect(entry).not.toBeDefined();
                    });
                    it('should throw if trying to access a property under a non existing path', function () {
                        var nonExistingPathProperty = ['pagesData', 'page789', "language"];

                        expect(DAL.immutable.getByPath.bind(DAL, nonExistingPathProperty)).toThrow(new Error('path does not exist - ' + nonExistingPathProperty));
                    });

                });
            });
            describe('path validation', function () {
                it("should be an array", function () {
                    var path = {};
                    var errorToThrow = new Error('path type is not an array - ' + path);

                    expect(DAL.getByPath.bind(DAL, path)).toThrow(errorToThrow);
                    expect(DAL.setByPath.bind(DAL, path, {x: 200})).toThrow(errorToThrow);
                    expect(DAL.removeByPath.bind(DAL, path)).toThrow(errorToThrow);
                });

                it("should throw an error in case path contains values that are not strings or numbers", function () {
                    var path = ['pagesData', "orange", "apple", {}];
                    var errorToThrow = new Error('path does not exist - ' + path);

                    expect(DAL.getByPath.bind(DAL, path)).toThrow(errorToThrow);
                    expect(DAL.setByPath.bind(DAL, path, {x: 200})).toThrow(errorToThrow);
                    expect(DAL.removeByPath.bind(DAL, path)).toThrow(errorToThrow);
                });

                it("should throw an error in case the given path doesn't exist", function () {
                    var invalidPath = ['pagesData', 'page2', 'structure'];

                    expect(DAL.getByPath.bind(DAL, invalidPath)).toThrow(new Error('path does not exist - ' + invalidPath));
                });

                it("should accept valid path", function () {
                    var path = ['pagesData', 'page1', 'structure', 'layout', 'width'];

                    expect(DAL.getByPath(path)).toEqual(980);
                });
            });

            describe('set', function () {
                it('should change a property in an object', function () {
                    var path = ['pagesData', 'page1'];
                    var pageJson = {id: 'newPage1'};

                    DAL.setByPath(path, pageJson);

                    expect(siteData.pagesData.page1).toEqual(pageJson);
                });

                it('should change an item in an array', function () {
                    var path = ['pagesData', 'page1', 'structure', 'components'];
                    var componentJson = {
                        "type": "Component",
                        "layout": {
                            "width": 265,
                            "height": 23,
                            "x": 708,
                            "y": 1261,
                            "scale": 1
                        },
                        "skin": "wysiwyg.viewer.skins.WRichTextNewSkin",
                        "componentType": "wysiwyg.viewer.components.WRichText"
                    };
                    var components = DAL.getByPath(path);
                    components[0] = componentJson;

                    DAL.setByPath(path, components);

                    expect(DAL.getByPath(path)[0]).toEqual(componentJson);
                });

                it('should change the property width in page1 data', function () {
                    var path = ['pagesData', 'page1', 'structure', 'layout', 'width'];
                    var newWidth = 100;

                    DAL.setByPath(path, newWidth);

                    expect(DAL.getByPath(path)).toEqual(newWidth);
                });

                it("should throw an error if path to set value is undefined", function () {
                    var path = ['pagesData', 'page1', 'structure', 'layout', 'width', 'minWidth'];
                    var newWidth = 100;

                    expect(DAL.setByPath.bind(DAL, path, newWidth)).toThrow(new Error('path does not exist - ' + path));
                });

                it('should add an entry to an object', function () {
                    var path = ['pagesData', 'page2'];
                    var pageJson = {id: 'page2', title: 'Page 2 Title', data: {}, structure: {}};

                    DAL.setByPath(path, pageJson);

                    expect(siteData.pagesData.page2).toEqual(pageJson);
                });

                it("should add an item to an array", function () {
                    var path = ['pagesData', 'page1', 'structure', 'components'];
                    var componentJson = {
                        "type": "Component",
                        "layout": {
                            "width": 265,
                            "height": 23,
                            "x": 708,
                            "y": 1261,
                            "scale": 1,
                            "rotationInDegrees": 0,
                            "anchors": [
                                {
                                    "distance": -8,
                                    "topToTop": 15,
                                    "originalValue": 668,
                                    "type": "BOTTOM_TOP",
                                    "locked": true,
                                    "targetComponent": "FvGrdLn1-k1u"
                                }
                            ],
                            "fixedPosition": false
                        },
                        "styleId": "txtNew",
                        "id": "WRchTxt2-isn",
                        "dataQuery": "#c1prn",
                        "skin": "wysiwyg.viewer.skins.WRichTextNewSkin",
                        "componentType": "wysiwyg.viewer.components.WRichText"
                    };
                    var components = DAL.getByPath(path);
                    components.push(componentJson);

                    DAL.setByPath(path, components);

                    var componentsLength = siteData.pagesData.page1.structure.components.length;
                    expect(siteData.pagesData.page1.structure.components[componentsLength - 1]).toEqual(componentJson);
                });

                it("should add an item to an array given array last index", function () {
                    var path = ['pagesData', 'page1', 'structure', 'components'];
                    var componentJson = {
                        "type": "Component",
                        "layout": {
                            "width": 265,
                            "height": 23,
                            "x": 708,
                            "y": 1261,
                            "scale": 1,
                            "rotationInDegrees": 0,
                            "anchors": [
                                {
                                    "distance": -8,
                                    "topToTop": 15,
                                    "originalValue": 668,
                                    "type": "BOTTOM_TOP",
                                    "locked": true,
                                    "targetComponent": "FvGrdLn1-k1u"
                                }
                            ],
                            "fixedPosition": false
                        },
                        "styleId": "txtNew",
                        "id": "WRchTxt2-isn",
                        "dataQuery": "#c1prn",
                        "skin": "wysiwyg.viewer.skins.WRichTextNewSkin",
                        "componentType": "wysiwyg.viewer.components.WRichText"
                    };
                    var components = DAL.getByPath(path);
                    var newPath = path;
                    newPath.push(components.length);

                    DAL.setByPath(newPath, componentJson);

                    var componentsLength = siteData.pagesData.page1.structure.components.length;
                    expect(siteData.pagesData.page1.structure.components[componentsLength - 1]).toEqual(componentJson);
                });

                it("should throw error if path to add node is undefined", function () {
                    var path = ['pagesData', 'page1', 'structure', 'ipadComponents', 'comp'];
                    var componentJson = {
                        "type": "Component",
                        "layout": {
                            "width": 265,
                            "height": 23,
                            "x": 708,
                            "y": 1261,
                            "scale": 1,
                            "rotationInDegrees": 0,
                            "anchors": [
                                {
                                    "distance": -8,
                                    "topToTop": 15,
                                    "originalValue": 668,
                                    "type": "BOTTOM_TOP",
                                    "locked": true,
                                    "targetComponent": "FvGrdLn1-k1u"
                                }
                            ],
                            "fixedPosition": false
                        },
                        "styleId": "txtNew",
                        "id": "WRchTxt2-isn",
                        "dataQuery": "#c1prn",
                        "skin": "wysiwyg.viewer.skins.WRichTextNewSkin",
                        "componentType": "wysiwyg.viewer.components.WRichText"
                    };

                    expect(DAL.setByPath.bind(DAL, path, componentJson)).toThrow(new Error('path does not exist - ' + path));
                });

                it("should not set the original value to the json, but a cloned one", function () {
                    var pathToPageLayout = ['pagesData', 'page1', 'structure', 'layout'];
                    var pageLayout = DAL.getByPath(pathToPageLayout);
                    var pageWidthBeforeSet = pageLayout.width;

                    DAL.setByPath(pathToPageLayout, pageLayout);
                    pageLayout.width = 100;

                    expect(DAL.getByPath(pathToPageLayout).width).toEqual(pageWidthBeforeSet);
                });
            });

            describe('push', function () {
                it('should add an item to the array in path', function () {
                    var path = ['pagesData', 'page1', 'structure', 'components'];
                    var itemToPush = "I'm another component";
                    var expected = DAL.getByPath(path).concat([itemToPush]);

                    DAL.pushByPath(path, itemToPush);

                    expect(DAL.getByPath(path)).toEqual(expected);
                });
                it('should add an item to the array in the given index', function () {
                    var path = ['pagesData', 'page1', 'structure', 'components'];
                    var itemToPush = "I'm another component";
                    var index = 1;
                    var expectedComponentArr = DAL.getByPath(path);
                    expectedComponentArr.splice(index, 0, itemToPush);

                    DAL.pushByPath(path, itemToPush, index);

                    expect(DAL.getByPath(path)).toEqual(expectedComponentArr);
                });
                it('should an item to the beginning of the array', function () {
                    var path = ['pagesData', 'page1', 'structure', 'components'];
                    var itemToPush = "I'm another component";
                    var index = 0;
                    var expectedComponentArr = DAL.getByPath(path);
                    expectedComponentArr = [itemToPush].concat(expectedComponentArr);

                    DAL.pushByPath(path, itemToPush, index);

                    expect(DAL.getByPath(path)).toEqual(expectedComponentArr);
                });
                it("should throw an error in case the path doesn't lead to an array", function () {
                    var path = ['pagesData', 'page1', 'structure'];

                    expect(DAL.pushByPath.bind(DAL, path, 'item')).toThrow(new Error('item at path - ' + ['json1'].concat(path) + ' is not an array'));
                });
                it('should throw an error in case the index is out of bound', function () {
                    var path = ['pagesData', 'page1', 'structure', 'components'];
                    var itemToPush = "I'm another component";
                    var index = 3;

                    expect(DAL.pushByPath.bind(DAL, path, itemToPush, index)).toThrow(new Error('Index out of bound'));
                });
                it('should throw an error in case the index is negative', function () {
                    var path = ['pagesData', 'page1', 'structure', 'components'];
                    var itemToPush = "I'm another component";
                    var index = -1;

                    expect(DAL.pushByPath.bind(DAL, path, itemToPush, index)).toThrow(new Error('Index out of bound'));
                });
            });

            describe('merge', function () {
                it('should merge the given object to the object in path', function () {
                    var path = ['pagesData', 'page1', 'structure', 'components', 0];
                    var objectToMerge = {'animation': 'spin'};
                    var expected = _.merge(DAL.getByPath(path), objectToMerge);

                    DAL.mergeByPath(path, objectToMerge);

                    expect(DAL.getByPath(path)).toEqual(expected);
                });
                it("should throw an error in case the path doesn't lead to an object", function () {
                    var path = ['pagesData', 'page1', 'structure', 'components'];

                    expect(DAL.mergeByPath.bind(DAL, path, {key: 'value'})).toThrow(new Error('value in path - ' + ['json1'].concat(path) + ' is not an object'));
                });
                it('should throw an error in case the given value is not an object', function () {
                    var path = ['pagesData', 'page1', 'structure'];
                    var valueToMerge = 'value';

                    expect(DAL.mergeByPath.bind(DAL, path, valueToMerge)).toThrow(new Error(valueToMerge + ' is not an object'));
                });
            });

            describe('get', function () {
                it('should return entry as an object given path to an object', function () {
                    var path = ['pagesData', 'page1'];

                    var entry = DAL.getByPath(path);

                    expect(entry).toEqual(siteData.pagesData.page1);
                });
                it('should return a value given the path to a simple value (number, string)', function () {
                    var path = ['pagesData', 'page1', 'structure', 'layout', 'width'];

                    var width = DAL.getByPath(path);

                    expect(width).toEqual(siteData.pagesData.page1.structure.layout.width);
                });
                it('should return undefined for path to non existing value/entry/object', function () {
                    var nonExistingPath = ['pagesData', 'page7'];

                    var entry = DAL.getByPath(nonExistingPath);

                    expect(entry).not.toBeDefined();
                });
                it('should return array item if provided index', function () {
                    var path = ['pagesData', 'page1', 'structure', 'components'];
                    var componentJson = {
                        "type": "Component",
                        "layout": {
                            "width": 265,
                            "height": 23,
                            "x": 708,
                            "y": 1261,
                            "scale": 1
                        },
                        "skin": "wysiwyg.viewer.skins.WRichTextNewSkin",
                        "componentType": "wysiwyg.viewer.components.WRichText"
                    };
                    var components = DAL.getByPath(path);
                    components[0] = componentJson;
                    DAL.setByPath(path, components);
                    var newPath = ['pagesData', 'page1', 'structure', 'components', 0];

                    expect(DAL.getByPath(newPath)).toEqual(componentJson);
                });
                it('should throw if trying to access a property under a non existing path', function () {
                    var nonExistingPathProperty = ['pagesData', 'page789', "language"];

                    expect(DAL.getByPath.bind(DAL, nonExistingPathProperty)).toThrow(new Error('path does not exist - ' + nonExistingPathProperty));
                });

                it("should return 'undefined' in case the given path doesn't exist", function () {
                    var nonExistPath = ['pagesData', 'page2'];

                    expect(DAL.getByPath(nonExistPath)).toBeUndefined();
                });
            });

            describe('getKeysByPath', function () {
                it('should return the keys of the object in the given path', function () {
                    var path = ['pagesData', 'page1'];

                    var result = DAL.getKeysByPath(path);

                    expect(result).toEqual(['structure']);
                });
                it('should throw an error if there is an array in the given path', function () {
                    var path = ['pagesData', 'page1', 'structure', 'components'];

                    expect(DAL.getKeysByPath.bind(DAL, path)).toThrow(new Error("Can not get keys of an element that isn't a plain object"));
                });
                it('should throw an error if there is a string in the given path', function () {
                    var path = ['pagesData', 'page1', 'structure', 'type'];

                    expect(DAL.getKeysByPath.bind(DAL, path)).toThrow(new Error("Can not get keys of an element that isn't a plain object"));
                });
                it('should throw an error if there is a number in the given path', function () {
                    var path = ['pagesData', 'page1', 'structure', 'layout', 'width'];

                    expect(DAL.getKeysByPath.bind(DAL, path)).toThrow(new Error("Can not get keys of an element that isn't a plain object"));
                });
                it('should throw an error if the given path does not exist', function () {
                    var path = ['pagesData', 'page1', 'structure', 'layout', 'width', 'notExist'];

                    expect(DAL.getKeysByPath.bind(DAL, path)).toThrow(new Error("path does not exist - " + path));
                });
            });

            describe('isPathExist', function () {
                it('should return true if value in path is defined', function () {
                    var path = ['pagesData', 'page1'];

                    var result = DAL.isPathExist(path);

                    expect(result).toEqual(true);
                });
                it('should return false if value in path is undefined', function () {
                    var path = ['pagesData', 'page1', 'bla'];

                    var result = DAL.isPathExist(path);

                    expect(result).toEqual(false);
                });
                it('should return false if value in path parent is undefined', function () {
                    var path = ['pagesData', 'page1', 'bla', 'bli'];

                    var result = DAL.isPathExist(path);

                    expect(result).toEqual(false);
                });
            });

            describe("get after set", function () {
                var newData = "alexa";
                var path = ['pagesData', 'masterPage', 'structure', 'type'];
                var pagesDataOld;

                beforeEach(function () {
                    pagesDataOld = DAL.getByPath(path);
                    DAL.setByPath(path, newData);
                });
                it("should return a different value after changing it by a set", function () {
                    expect(DAL.getByPath(['pagesData', 'masterPage', 'structure', 'type'])).toEqual(newData);
                    expect(DAL.jsonData.json1.pagesData.masterPage.structure.type).toEqual(newData);
                });
                it('should test get', function () {
                    var pagesDataNew = DAL.getByPath(path);
                    expect(pagesDataOld).not.toEqual(pagesDataNew);
                });
            });

            describe('remove', function () {
                it('should remove entry', function () {
                    var path = ['pagesData', 'page1'];
                    var oldPath = _.clone(path);
                    DAL.removeByPath(path);

                    expect(DAL.getByPath(oldPath)).not.toBeDefined();
                    expect(siteData.pagesData.page1).not.toBeDefined();
                });
                it('should remove the first component from page1 children', function () {
                    var path = ['pagesData', 'page1', 'structure', 'components', 0];
                    var expectedChildrenArray = [siteData.pagesData.page1.structure.components[1]];

                    DAL.removeByPath(path);

                    expect(DAL.getByPath(path)).toEqual(expectedChildrenArray[0]);
                    expect(siteData.pagesData.page1.structure.components).toEqual(expectedChildrenArray);
                });
                xit('should throw an error when trying to remove a non existing entry', function () {
                    var nonExistingPath = ['pagesData', 'page777'];

                    expect(DAL.removeByPath.bind(DAL, nonExistingPath)).toThrow(new Error('path does not exist - ' + nonExistingPath));
                });
                it('should not change the original path', function () {
                    var path = ['pagesData', 'page1', 'structure', 'components', 0];
                    var clonedPath = [].concat(path);

                    DAL.removeByPath(path);

                    expect(path).toEqual(clonedPath);
                });
            });

            describe('DAL history', function () {

                describe('takeSnapshot', function () {
                    var tag = 'undo';
                    it('should push the latest site immutable jsons to the history stack', function () {
                        var expected = DAL.immutableSiteJsons;

                        DAL.takeSnapshot(tag);

                        expect(_.last(DAL.historyDictionary[tag])).toEqual(expected);
                    });
                    it('should return the entry index in the stack', function () {
                        var result = DAL.takeSnapshot(tag);
                        expect(result).toEqual(0);
                        result = DAL.takeSnapshot(tag);
                        expect(result).toEqual(1);
                    });
                });

                describe('removeLastSnapshot', function () {
                    var tag = 'undo';
                    it('should pop the latest snapshot from the history stack by tag name', function () {
                        DAL.takeSnapshot(tag);
                        DAL.takeSnapshot(tag);
                        var currentHistoryStack = DAL.historyDictionary[tag];
                        var expected = _.initial(currentHistoryStack);

                        DAL.removeLastSnapshot(tag);

                        expect(DAL.historyDictionary[tag]).toEqual(expected);
                    });
                    it('should do nothing in case the history stack is empty', function () {
                        var currentHistoryStack = DAL.historyDictionary[tag];

                        DAL.removeLastSnapshot(tag);

                        expect(DAL.historyDictionary[tag]).toEqual(currentHistoryStack);
                    });
                });

                describe('duplicateLastSnapshot', function () {
                    var tag = 'undo';
                    it('should duplicate the last snapshot and add it to history dictionary', function () {
                        var index = DAL.takeSnapshot(tag);
                        var dupIndex = DAL.duplicateLastSnapshot(tag);

                        var originalSnapshot = DAL.getSnapshotByTagAndIndex(tag, index);
                        var duplicateSnapshot = DAL.getSnapshotByTagAndIndex(tag, dupIndex);
                        expect(index + 1).toEqual(dupIndex);
                        expect(originalSnapshot).toEqual(duplicateSnapshot);
                    });

                    it('should add the initialState first item in the history if the history dictionary has no items for this tag', function () {
                        var index = DAL.duplicateLastSnapshot(tag);

                        var initialSnapshot = DAL.getInitialSnapshot();
                        var duplicateSnapshot = DAL.getSnapshotByTagAndIndex(tag, index);
                        expect(initialSnapshot).toEqual(duplicateSnapshot);
                    });

                    it('should apply changes to the last snapshot and add the modified snapshot to the history dictionary', function () {
                        var path = ['pagesData', 'page1', 'structure', 'layout', 'width'];
                        DAL.setByPath(path, 300);
                        var index = DAL.takeSnapshot(tag);
                        var changes = {};
                        changes[path.join('.')] = 305;
                        var dupIndex = DAL.duplicateLastSnapshot(tag, changes);

                        var originalSnapshot = DAL.getSnapshotByTagAndIndex(tag, index);
                        var duplicateSnapshot = DAL.getSnapshotByTagAndIndex(tag, dupIndex);
                        expect(duplicateSnapshot.pagesData.page1.structure.layout.width).toEqual(305);
                        expect(originalSnapshot.pagesData.page1.structure.layout.width).toEqual(300);
                    });

                    it('should apply all changes to the duplicated snapshot', function () {
                        var path = ['pagesData', 'page1', 'structure', 'layout'];
                        var widthPath = path.concat(['width']);
                        var heightPath = path.concat(['height']);
                        DAL.setByPath(widthPath, 300);
                        DAL.setByPath(heightPath, 400);
                        DAL.takeSnapshot(tag);

                        var changes = {};
                        changes[widthPath.join('.')] = 305;
                        changes[heightPath.join('.')] = 305;
                        var dupIndex = DAL.duplicateLastSnapshot(tag, changes);

                        var duplicateSnapshot = DAL.getSnapshotByTagAndIndex(tag, dupIndex);
                        expect(duplicateSnapshot.pagesData.page1.structure.layout.width).toEqual(305);
                        expect(duplicateSnapshot.pagesData.page1.structure.layout.height).toEqual(305);
                    });

                    it('should remove undefined changes from the snapshot', function () {
                        var path = ['pagesData', 'page1', 'structure', 'layout'];
                        var widthPath = path.concat(['width']);
                        var heightPath = path.concat(['height']);
                        DAL.setByPath(widthPath, 300);
                        DAL.setByPath(heightPath, 400);
                        DAL.takeSnapshot(tag);
                        var layout = DAL.getByPath(path);

                        var changes = {};
                        changes[widthPath.join('.')] = undefined;
                        var dupIndex = DAL.duplicateLastSnapshot(tag, changes);

                        var duplicateSnapshot = DAL.getSnapshotByTagAndIndex(tag, dupIndex);
                        var expected = _.omit(layout, 'width');
                        expect(duplicateSnapshot.pagesData.page1.structure.layout).toEqual(expected);
                    });
                });

                describe('getLastSnapshotByTagName', function () {
                    var tag = 'save';
                    beforeEach(function () {
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 300);
                        DAL.takeSnapshot(tag);
                    });
                    it('should return the data from history stack on the specified index', function () {
                        var expectedResult = {pagesData: siteData.pagesData};

                        var actualResult = DAL.getLastSnapshotByTagName(tag, {pagesData: 'pagesData'});

                        expect(actualResult).toEqual(expectedResult);
                    });
                    it('should return null if the snapshot does not exist, and not throw an error', function () {
                        var getNonExistingSnapshot = function () {
                            return DAL.getLastSnapshotByTagName('blablabla');
                        };
                        expect(getNonExistingSnapshot).not.toThrow();
                        expect(getNonExistingSnapshot()).toBeNull();
                    });
                    it('should return null if the snapshot tag exists, but there is no snapshot in the history, and not throw an error', function () {
                        var getNonExistingSnapshot = function () {
                            return DAL.getLastSnapshotByTagName(tag);
                        };
                        DAL.removeLastSnapshot(tag);

                        expect(getNonExistingSnapshot).not.toThrow();
                        expect(getNonExistingSnapshot()).toBeNull();
                    });
                });

                describe('getSnapshotByTagAndIndex', function () {
                    var tag = 'save';
                    beforeEach(function () {
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 300);
                        DAL.takeSnapshot(tag);
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 500);
                        DAL.takeSnapshot(tag);
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 200);
                        DAL.takeSnapshot(tag);
                    });
                    it('should return the site immutable jsons from history stack on the specified index', function () {
                        var index = 2;
                        var historyItem = DAL.historyDictionary[tag][index].toJS();

                        var actualResult = DAL.getSnapshotByTagAndIndex(tag, index);

                        expect(actualResult.pagesData).toEqual(historyItem.json1.pagesData);
                        expect(actualResult.imUndoable).toEqual(historyItem.json1.imUndoable);
                        expect(actualResult.origin).toEqual(historyItem.json1.origin);
                    });

                    it('should throw an error for index out of bound', function () {
                        var index = 3;

                        expect(DAL.getSnapshotByTagAndIndex.bind(DAL, index)).toThrow(new Error('requested index in history stack is out of bound'));
                    });
                });

                describe('getInitialSnapshot', function () {
                    it('should return the initialSnapshot for the siteJsons', function () {
                        var tag = 'someTag';
                        DAL.takeSnapshot(tag); //took snapshot without any changes in site
                        var initialSnapshot = DAL.getInitialSnapshot();
                        var someTagSnapshotBeforeChangesInDAL = DAL.getLastSnapshotByTagName(tag);
                        expect(initialSnapshot).toEqual(someTagSnapshotBeforeChangesInDAL);
                    });
                    it('should always return the same initial snapshot- it should never change', function () {
                        var tag = 'someTag';
                        var initialSnapshot = DAL.getInitialSnapshot();
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 300);
                        DAL.takeSnapshot(tag);
                        expect(initialSnapshot).toEqual(DAL.getInitialSnapshot());
                        expect(DAL.getInitialSnapshot()).not.toEqual(DAL.getLastSnapshotByTagName(tag));
                    });
                });
            });

            describe("Dynamically loading data", function () {
                beforeEach(function () {
                    this.loadedCallback = null;
                    var self = this;
                    this.dataLoadedRegistrar = function (callback) {
                        self.loadedCallback = callback;
                    };
                });

                var newData;

                it("should retrieve the new loaded data according to the provided path", function () {
                    siteData = mockSiteData();

                    DAL = new DataAccessLayer({json1: siteData}, this.dataLoadedRegistrar, fullJsonCache, dalConfig);
                    newData = {
                        page99: {
                            structure: {
                                components: [],
                                layout: {}
                            }
                        }
                    };

                    var path = ['pagesData', 'page99'];
                    this.loadedCallback(path, newData.page99);
                    expect(DAL.getByPath(path)).toEqual(newData.page99);
                });

                describe("Retrieve History after Loading data", function () {
                    var tag;
                    beforeEach(function () {
                        this.loadedCallback = null;
                        var self = this;
                        this.dataLoadedRegistrar = function (callback) {
                            self.loadedCallback = callback;
                        };
                        this.configIncludingDeletedPagesMap = _.cloneDeep(dalConfig);
                        this.configIncludingDeletedPagesMap.pathsInJsonData.json1.push({
                            path: ['deletedPagesMap'],
                            optional: false
                        });
                        DAL = new DataAccessLayer({json1: siteData}, this.dataLoadedRegistrar, fullJsonCache, this.configIncludingDeletedPagesMap);
                        tag = 'save';
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 300);
                        DAL.takeSnapshot(tag, 'first page width change');
                    });
                    it("should return the history merged with new loaded page", function () {
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 500);
                        DAL.takeSnapshot(tag, 'second page width change');
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 200);
                        DAL.takeSnapshot(tag, 'third page width change');
                        var index = 2;

                        newData = {
                            page99: {
                                structure: {
                                    components: [],
                                    layout: {}
                                }
                            }
                        };
                        var path = ['pagesData', 'page99'];

                        var snapshotBeforeLoadingPage = DAL.getSnapshotByTagAndIndex(tag, index);
                        this.loadedCallback(path, newData.page99);
                        var snapshotAfterLoadingPage = DAL.getSnapshotByTagAndIndex(tag, index);

                        expect(snapshotAfterLoadingPage.pagesData).toEqual(_.merge(snapshotBeforeLoadingPage.pagesData, newData));
                    });

                    it("should return the history merged with new loaded pages", function () {
                        newData = {
                            page99: {
                                structure: {
                                    components: [],
                                    layout: {}
                                }
                            }
                        };
                        var path = ['pagesData', 'page99'];
                        this.loadedCallback(path, newData.page99);

                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 500);
                        DAL.takeSnapshot(tag, 'second page width change');
                        DAL.setByPath(['pagesData', 'page1', 'structure', 'layout', 'width'], 200);
                        var index = DAL.takeSnapshot(tag, 'third page width change');

                        newData = _.merge(newData, {
                            page54: {
                                structure: {
                                    components: [],
                                    layout: {width: 47}
                                }
                            }
                        });

                        path = ['pagesData', 'page54'];
                        this.loadedCallback(path, newData.page54);


                        var actualResult = DAL.getSnapshotByTagAndIndex(tag, index);
                        expect(actualResult.pagesData.page99).toEqual(newData.page99);
                        expect(actualResult.pagesData.page54).toEqual(newData.page54);
                    });

                    it('should not return a deleted page that was dynamically loaded', function () {
                        var pagePath = ['pagesData', 'page7'];
                        var deletedPagesMapPath = ['deletedPagesMap'];
                        DAL.setByPath(deletedPagesMapPath, {});
                        this.loadedCallback(pagePath, 'data for page7');
                        var beforeDeleteSnapshotIndex = DAL.takeSnapshot(tag);
                        DAL.removeByPath(pagePath);
                        var deletedPagePartialMap = {};
                        deletedPagePartialMap.page7 = true;
                        DAL.mergeByPath(deletedPagesMapPath, deletedPagePartialMap);
                        var afterDeleteSnapshotIndex = DAL.takeSnapshot(tag);

                        var beforeDeleteSnapshotData = DAL.getSnapshotByTagAndIndex(tag, beforeDeleteSnapshotIndex);
                        var afterDeleteSnapshotData = DAL.getSnapshotByTagAndIndex(tag, afterDeleteSnapshotIndex);
                        expect(beforeDeleteSnapshotData.pagesData.page7).toEqual('data for page7');
                        expect(afterDeleteSnapshotData.pagesData.page7).toBeUndefined();
                    });

                    it('should successfully get a snapshot in the case where data for a path is loaded before the data of a sub-path', function () {
                        var path = ['a', 'b'];
                        this.configIncludingDeletedPagesMap.pathsInJsonData.json1.push({path: ['a'], optional: true});
                        DAL = new DataAccessLayer({json1: siteData}, this.dataLoadedRegistrar, fullJsonCache, this.configIncludingDeletedPagesMap);
                        var subPath = path.slice(0, 1);
                        var index = DAL.takeSnapshot(tag);
                        this.loadedCallback(subPath, {});
                        this.loadedCallback(path, {});
                        DAL.getSnapshotByTagAndIndex(tag, index);
                    });

                    it('should not return a component data that was loaded dynamically if the component page was deleted', function () {
                        var pagePath = ['pagesData', 'page7'];
                        var compDataPath = pagePath.concat(['data', 'document_data', 'compData']);
                        var deletedPagesMapPath = ['deletedPagesMap'];
                        var pageObject = {data: {'document_data': {}}, structure: {components: []}};
                        var compData = {id: 'myCompData', type: 'someType', fieldA: 'valA', fieldB: 'valB'};

                        DAL.setByPath(pagePath, pageObject);
                        this.loadedCallback(compDataPath, compData);
                        DAL.removeByPath(pagePath);
                        DAL.setByPath(deletedPagesMapPath, {page7: true});
                        DAL.takeSnapshot('myStack');

                        expect(_.has(DAL.getLastSnapshotByTagName('myStack'), compDataPath)).toBe(false);
                    });

                    it('should not return a component data that was updated dynamically if the component page was deleted', function () {
                        var pagePath = ['pagesData', 'page7'];
                        var compDataPath = pagePath.concat(['data', 'document_data', 'compData']);
                        var deletedPagesMapPath = ['deletedPagesMap'];
                        var pageObject = {
                            data: {
                                'document_data': {
                                    myCompData: {
                                        id: 'myCompData',
                                        type: 'someType',
                                        fieldA: 'valC'
                                    }
                                }
                            }, structure: {components: []}
                        };
                        var compData = {id: 'myCompData', type: 'someType', fieldA: 'valA', fieldB: 'valB'};

                        DAL.setByPath(pagePath, pageObject);
                        this.loadedCallback(compDataPath, compData);
                        DAL.removeByPath(pagePath);
                        DAL.setByPath(deletedPagesMapPath, {page7: true});
                        DAL.takeSnapshot('myStack');

                        expect(_.has(DAL.getLastSnapshotByTagName('myStack'), compDataPath)).toBe(false);
                    });
                });
            });

            describe('wasValueChangedSinceLastSnapshot', function () {
                it('should return false if value in path was not changed', function () {
                    var tagName = 'myTagName';
                    var path = ['pagesData', 'page1', 'structure'];
                    DAL.takeSnapshot(tagName);
                    var pointer = fullJsonCache.getPointer('page1', 'DESKTOP', path);

                    var result = DAL.wasValueChangedSinceLastSnapshot(tagName, pointer);

                    expect(result).toEqual(false);
                });
                it('should return true if value in path was not changed', function () {
                    var tagName = 'someTagName';
                    var path = ['pagesData', 'page1', 'structure'];
                    DAL.takeSnapshot(tagName);
                    var pointer = fullJsonCache.getPointer('page1', 'DESKTOP', path);
                    DAL.set(pointer, {id: 'changed value'});

                    var result = DAL.wasValueChangedSinceLastSnapshot(tagName, pointer);

                    expect(result).toEqual(true);
                });
                it('should throw an exception in case of unfamiliar tag name', function () {
                    var tagName = 'unfamiliarTagName';
                    var path = ['pagesData', 'page1', 'structure'];
                    var pointer = fullJsonCache.getPointer('page1', 'DESKTOP', path);

                    expect(DAL.wasValueChangedSinceLastSnapshot.bind(DAL, tagName, pointer)).toThrow(new Error('No such tag name - ' + tagName));
                });
                it('should throw an exception in case of no snapshot under the passed tag name', function () {
                    var tagName = 'yetAnotherTagName';
                    var path = ['pagesData', 'page1', 'structure'];
                    DAL.takeSnapshot(tagName);
                    var pointer = fullJsonCache.getPointer('page1', 'DESKTOP', path);
                    DAL.removeLastSnapshot('yetAnotherTagName');

                    expect(DAL.wasValueChangedSinceLastSnapshot.bind(DAL, tagName, pointer)).toThrow(new Error('There is no snapshot under tag name - ' + tagName));

                });
            });

            describe('multiple jsons', function(){
                beforeEach(function(){
                    var someJson = {
                        someJsonPath: {
                            someProp: 'someValue'
                        }
                    };
                    this.jsons = {
                        json1: _.pick(siteData, 'pagesData'),
                        json2: _.omit(siteData, 'pagesData'),
                        json3: someJson
                    };
                    dalConfig = {
                        pathsInJsonData: {
                            'json1': [
                                {path: ['pagesData'], optional: false}
                            ],
                            'json2': [
                                {path: ['imUndoable'], optional: false},
                                {path: ['origin'], optional: false}
                            ],
                            json3: [
                                {path: ['someJsonPath'], optional: false}
                            ]
                        },
                        isReadOnly: false,
                        origin: 'Editor1.4'
                    };

                    this.DAL = new DataAccessLayer(this.jsons, null, fullJsonCache, dalConfig);
                });
                it('should get values from the correct json', function(){
                    var pagesData = DAL.getByPath(['pagesData']);
                    var secondJsonData = DAL.getByPath(['imUndoable']);

                    expect(pagesData).toEqual(this.jsons.json1.pagesData);
                    expect(secondJsonData).toEqual(this.jsons.json2.imUndoable);
                });

                it('should set values to the correct json', function(){
                    var firstJsonPath = ['pagesData', 'page1', 'newProp'];
                    var secondJsonPath = ['imUndoable', 'newProp'];

                    this.DAL.setByPath(firstJsonPath, 1);
                    this.DAL.setByPath(secondJsonPath, 5);

                    expect(this.DAL.getByPath(firstJsonPath)).toEqual(1);
                    expect(this.DAL.getByPath(secondJsonPath)).toEqual(5);
                });

                it('should return the json type for given path', function(){
                    var jsonType = this.DAL.getPathJsonType(['pagesData']);
                    var anotherJsonType = this.DAL.getPathJsonType(['someJsonPath']);

                    expect(jsonType).toEqual('json1');
                    expect(anotherJsonType).toEqual('json3');
                });

                it('should combine all jsons when taking and returning a snapshot', function(){
                    var tag = 'undo';

                    this.DAL.takeSnapshot(tag);
                    var lastSnapshot = this.DAL.getLastSnapshotByTagName(tag);

                    expect(lastSnapshot.pagesData).toEqual(this.jsons.json1.pagesData);
                    expect(lastSnapshot.imUndoable).toEqual(this.jsons.json2.imUndoable);
                    expect(lastSnapshot.someJsonPath).toEqual(this.jsons.json3.someJsonPath);
                });
            });
        });
    });
