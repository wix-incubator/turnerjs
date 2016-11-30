define(['lodash', 'testUtils', 'core',
    'documentServices/constants/constants',
    'documentServices/dataAccessLayer/DataAccessLayer',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/privateServices/GeneralSuperDal'], function
    (_, testUtils, core,
     constants,
     DAL,
     privateServicesHelper,
     GeneralSuperDal) {
    'use strict';

    describe('GeneralSuperDal', function () {
        function getPageComps() {
            return [
                {
                    id: 'container-id',
                    components: [
                        {
                            id: 'child-always-displayed',
                            componentType: 'mockComp',
                            layout: {
                                width: '100px',
                                height: '100px'
                            }
                        },
                        {
                            id: 'child-hidden-in-default',
                            componentType: 'mockComp',
                            layout: {
                                width: '100px',
                                height: '100px'
                            },
                            modes: {
                                isHiddenByModes: true,
                                overrides: [
                                    {
                                        modeIds: ['mode-id'],
                                        isHiddenByModes: false,
                                        layout: {
                                            width: '200px'
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            id: 'child-hidden-in-mode',
                            componentType: 'mockComp',
                            layout: {
                                width: '100px',
                                height: '100px'
                            },
                            modes: {
                                overrides: [
                                    {
                                        modeIds: ['mode-id'],
                                        isHiddenByModes: true,
                                        layout: {
                                            width: '200px'
                                        }
                                    }
                                ]
                            }
                        }
                    ],
                    modes: {
                        definitions: [{
                            modeId: 'mode-id'
                        }]
                    }
                }
            ];
        }

        beforeEach(function () {
            this.siteData = testUtils.mockFactory.mockSiteData(null, true);
            this.siteData.setPageComponents(getPageComps(), 'currentPage');

            var dalInners = privateServicesHelper.mockDalInners(this.siteData);

            this.pointers = dalInners.pointers;
            this.dal = new GeneralSuperDal(dalInners.fullJsonDal, dalInners.displayedDal, dalInners.fullJsonUpdater, dalInners.displayedJsonUpdater, dalInners.pointers);
            this.dal.full.setByPath(['pagesData'], dalInners.fullPagesData.pagesData);
            this.containerChildrenPath = ['pagesData', 'currentPage', 'structure', 'components', 0, 'components'];
        });

        describe('setByPath', function () {
            it('should set value to full and then update displayed', function () {
                var fullPath = this.containerChildrenPath.concat(2);
                var displayedPath = this.containerChildrenPath.concat(1);
                var value = {
                    id: 'child-hidden-in-mode',
                    componentType: 'mockType',
                    shtut: 'new'
                };
                this.dal.full.setByPath(fullPath, value);

                expect(this.dal.getByPath(displayedPath)).toEqual(value);
            });

            it('should set value to full and not update displayed', function () {
                var fullPath = this.containerChildrenPath.concat(1);
                var value = {
                    'newKey': 'newValue',
                    modes: {
                        isHiddenByModes: true
                    }
                };

                this.dal.full.setByPath(fullPath, value);

                expect(this.dal.getByPath(this.containerChildrenPath).length).toEqual(2);
                expect(this.dal.getByPath(this.containerChildrenPath.concat(0))).not.toEqual(value);
                expect(this.dal.getByPath(this.containerChildrenPath.concat(1))).not.toEqual(value);
            });

            describe('when path is NOT in pagesData', function () {
                it('should update both jsons and snapshots', function () {
                    var path = ['editorData', 'whos'];
                    var newValue = 'on first';

                    this.dal.full.setByPath(path, newValue);
                    this.dal.takeSnapshot('tagish');
                    var snapshot = this.dal.getLastSnapshotByTagName('tagish');

                    expect(this.dal.getByPath(path)).toEqual(newValue);
                    expect(this.dal.full.getByPath(path)).toEqual(newValue);
                    expect(_.get(snapshot, path)).toEqual(newValue);
                });
            });
        });

        describe('set', function () {
            it('should set value to displayed and then update full', function () {
                var pagePointer = this.pointers.components.getPage(this.siteData.getCurrentUrlPageId(), 'DESKTOP');
                var pointer = this.pointers.components.getComponent('child-hidden-in-mode', pagePointer);
                var value = {
                    id: 'child-hidden-in-mode',
                    componentType: 'mockType',
                    shtut: 'new'
                };
                this.dal.set(pointer, value);

                expect(_.omit(this.dal.full.get(pointer), 'modes')).toEqual(value);
            });

            it('should set value to full and then update displayed', function () {
                var pagePointer = this.pointers.full.components.getPage(this.siteData.getCurrentUrlPageId(), 'DESKTOP');
                var compPointer = this.pointers.full.components.getComponent('child-hidden-in-mode', pagePointer);
                var value = {
                    id: 'child-hidden-in-mode',
                    componentType: 'mockType',
                    shtut: 'new'
                };
                this.dal.full.set(compPointer, value);

                var actual = this.dal.get(compPointer);

                expect(_.omit(actual, 'modes')).toEqual(value);
            });

            describe('when pointer is NOT in pagesData', function () {
                it('should update both jsons and snapshots', function () {
                    var pointer = this.pointers.general.getEditorData();
                    var innerEditorDataPointer = this.pointers.getInnerPointer(pointer, 'whos');
                    var newValue = 'on first';

                    this.dal.set(innerEditorDataPointer, newValue);
                    this.dal.takeSnapshot('tagish');
                    var snapshot = this.dal.getLastSnapshotByTagName('tagish');

                    expect(this.dal.get(innerEditorDataPointer)).toEqual(newValue);
                    expect(this.dal.full.get(innerEditorDataPointer)).toEqual(newValue);
                    expect(_.get(snapshot, ['editorData', 'whos'])).toEqual(newValue);
                });
            });
        });

        describe('push', function () {
            it('should push value to displayed and then update full', function () {
                var compPointers = this.pointers.components;
                var pagePointer = compPointers.getPage(this.siteData.getCurrentUrlPageId(), 'DESKTOP');
                var containerPointer = compPointers.getComponent('container-id', pagePointer);
                var containerChildrenPointer = compPointers.getChildrenContainer(containerPointer);
                var newComp = {
                    id: 'new-comp',
                    componentType: 'mockType'
                };

                this.dal.push(containerChildrenPointer, newComp);

                var newCompPointer = compPointers.getComponent('new-comp', pagePointer);
                expect(this.dal.full.get(newCompPointer)).toEqual(newComp);
            });

            it('should push value to full and then update displayed', function () {
                var fullJsonCompPointers = this.pointers.full.components;
                var pagePointer = fullJsonCompPointers.getPage(this.siteData.getCurrentUrlPageId(), 'DESKTOP');
                var containerPointer = fullJsonCompPointers.getComponent('container-id', pagePointer);
                var containerChildrenPointer = fullJsonCompPointers.getChildrenContainer(containerPointer);
                var newComp = {
                    id: 'new-comp',
                    componentType: 'mockType'
                };

                this.dal.push(containerChildrenPointer, newComp);

                var newCompPointer = this.pointers.components.getComponent('new-comp', pagePointer);
                expect(this.dal.get(newCompPointer)).toEqual(newComp);
            });

            describe('when pointer is NOT in pagesData', function () {
                it('should update both jsons and snapshots', function () {
                    var pointer = this.pointers.general.getCompsToUpdateAnchors();
                    this.dal.set(pointer, []);
                    var newValue = {'whos': 'on first'};

                    this.dal.push(pointer, newValue);
                    this.dal.takeSnapshot('tagish');
                    var snapshot = this.dal.getLastSnapshotByTagName('tagish');

                    expect(this.dal.get(pointer)).toEqual([newValue]);
                    expect(this.dal.full.get(pointer)).toEqual([newValue]);
                    expect(_.get(snapshot, ['compsToUpdateAnchors'])).toEqual([newValue]);
                });
            });
        });

        describe('pushByPath', function () {
            describe('path is part of pagesData/structure', function () {
                it('should push value to full JSON and update the displayedJson', function () {
                    var newComp = {
                        id: 'new-comp',
                        componentType: 'mockType'
                    };
                    this.dal.full.pushByPath(this.containerChildrenPath, newComp);

                    var indexInDisplayedJson = 2;
                    var indexInFullJson = 3;
                    expect(this.dal.getByPath(this.containerChildrenPath.concat(indexInDisplayedJson))).toEqual(newComp);
                    expect(this.dal.full.getByPath(this.containerChildrenPath.concat(indexInFullJson))).toEqual(newComp);
                });

                it('should push value to full JSON to a specific index and update the displayedJson', function () {
                    var indexToPushTo = 0;
                    var newComp = {
                        id: 'new-comp',
                        componentType: 'mockType'
                    };
                    this.dal.full.pushByPath(this.containerChildrenPath, newComp, indexToPushTo);

                    expect(this.dal.getByPath(this.containerChildrenPath.concat(indexToPushTo))).toEqual(newComp);
                    expect(this.dal.full.getByPath(this.containerChildrenPath.concat(indexToPushTo))).toEqual(newComp);
                });
            });

            describe('path is NOT part of pagesData/structure', function () {
                it('should update both jsons and snapshots', function () {
                    var pathToSetTo = 'wixapps.foo'.split('.');
                    var value = ['item1', 'item2'];
                    this.dal.full.setByPath(pathToSetTo, value);

                    var valueToPush = 'new-item';
                    var indexToPush = 1;

                    this.dal.full.pushByPath(pathToSetTo, valueToPush, indexToPush);
                    this.dal.takeSnapshot('tagish');
                    var snapshot = this.dal.getLastSnapshotByTagName('tagish');

                    expect(this.dal.getByPath(pathToSetTo)).toEqual(['item1', valueToPush, 'item2']);
                    expect(this.dal.full.getByPath(pathToSetTo)).toEqual(['item1', valueToPush, 'item2']);
                    expect(_.get(snapshot, pathToSetTo)).toEqual(['item1', valueToPush, 'item2']);
                });

                it('should update displayedJson if path is to an object directly on siteData', function(){
                    var pathToSetTo = ['compsToUpdateAnchors'];
                    var value = ['item1', 'item2'];
                    this.dal.full.setByPath(pathToSetTo, value);

                    var valueToPush = 'new-item';

                    this.dal.full.pushByPath(pathToSetTo, valueToPush);
                    this.dal.takeSnapshot('tagish');
                    var snapshot = this.dal.getLastSnapshotByTagName('tagish');

                    expect(this.dal.full.getByPath(pathToSetTo)).toEqual(['item1', 'item2', valueToPush]);
                    expect(this.dal.getByPath(pathToSetTo)).toEqual(['item1', 'item2', valueToPush]);
                    expect(_.get(snapshot, pathToSetTo)).toEqual(['item1', 'item2', valueToPush]);
                    expect(true).toEqual(true);
                });
            });
        });

        describe('mergeByPath', function () {
            it('should merge <value> to full JSON and update the displayedJson', function () {
                var compPropertiesToMerge = {
                    layout: {
                        height: '200px'
                    }
                };
                var compBeforeMerge = this.dal.getByPath(this.containerChildrenPath.concat(0));
                var expectedComp = _.merge({}, compBeforeMerge, compPropertiesToMerge);
                expect(this.dal.getByPath(this.containerChildrenPath.concat(0))).not.toEqual(expectedComp);

                this.dal.full.mergeByPath(this.containerChildrenPath.concat(0, 'layout'), compPropertiesToMerge.layout);

                expect(this.dal.getByPath(this.containerChildrenPath.concat(0))).toEqual(expectedComp);
            });

            describe('when path is NOT in pagesData', function () {
                it('should update both jsons and snapshots', function () {
                    var path = ['editorData', 'foo'];
                    this.dal.full.setByPath(path, {'whos': 'on first'});

                    this.dal.full.mergeByPath(path, {'whats': 'on second'});
                    this.dal.takeSnapshot('tagish');
                    var snapshot = this.dal.getLastSnapshotByTagName('tagish');
                    var expected = {
                        whos: 'on first',
                        whats: 'on second'
                    };

                    expect(this.dal.getByPath(path)).toEqual(expected);
                    expect(this.dal.full.getByPath(path)).toEqual(expected);
                    expect(_.get(snapshot, path)).toEqual(expected);
                });
            });
        });

        describe('merge', function () {
            it('should merge displayed item and then update full', function () {
                var updatedCompProperties = {
                    layout: {
                        height: '200px'
                    }
                };
                var comp = this.dal.getByPath(this.containerChildrenPath.concat(0));
                var compPointersInDisplayed = this.pointers.components;
                var pagePointer = compPointersInDisplayed.getPage(this.siteData.getCurrentUrlPageId(), 'DESKTOP');
                var compPointerInDisplayed = compPointersInDisplayed.getComponent('child-always-displayed', pagePointer);
                var compPointerInFull = this.pointers.full.components.getComponent('child-always-displayed', pagePointer);

                this.dal.merge(compPointerInDisplayed, updatedCompProperties);

                var expectedComp = _.assign(comp, updatedCompProperties);
                expect(this.dal.full.get(compPointerInFull)).toEqual(expectedComp);
            });

            it('should merge item in full JSON and then update displayed JSON', function () {
                var updatedCompProperties = {
                    layout: {
                        height: '200px'
                    }
                };
                var comp = this.dal.getByPath(this.containerChildrenPath.concat(0));
                var compPointersInFull = this.pointers.full.components;
                var pagePointer = compPointersInFull.getPage(this.siteData.getCurrentUrlPageId(), 'DESKTOP');
                var compPointerInFull = compPointersInFull.getComponent('child-always-displayed', pagePointer);
                var compPointerInDisplayed = this.pointers.components.getComponent('child-always-displayed', pagePointer);

                this.dal.full.merge(compPointerInFull, updatedCompProperties);

                var expectedComp = _.assign(comp, updatedCompProperties);
                expect(this.dal.get(compPointerInDisplayed)).toEqual(expectedComp);
            });

            describe('when pointer is NOT in pagesData', function () {
                it('should update both jsons and snapshots', function () {
                    var editorDataPointer = this.pointers.general.getEditorData();
                    var innerEditorDataPointer = this.pointers.getInnerPointer(editorDataPointer, 'foo');
                    this.dal.set(innerEditorDataPointer, {'whos': 'on first'});

                    this.dal.merge(innerEditorDataPointer, {
                        whats: 'on second'
                    });

                    this.dal.takeSnapshot('tagish');
                    var snapshot = this.dal.getLastSnapshotByTagName('tagish');
                    var expected = {
                        whos: 'on first',
                        whats: 'on second'
                    };

                    expect(this.dal.get(innerEditorDataPointer)).toEqual(expected);
                    expect(this.dal.full.get(innerEditorDataPointer)).toEqual(expected);
                    expect(_.get(snapshot, ['editorData', 'foo'])).toEqual(expected);
                });
            });
        });

        describe('isExist', function () {
            it('should return true for both displayed and full if exists on displayed', function () {
                var pagePointer = this.pointers.components.getPage(this.siteData.getCurrentUrlPageId(), 'DESKTOP');
                var compPointer = this.pointers.components.getComponent('child-hidden-in-mode', pagePointer);

                expect(this.dal.isExist(compPointer)).toBe(true);
            });

            it('should return false for displayed and true for full if not displayed', function () {
                var pagePointer = this.pointers.components.getPage(this.siteData.getCurrentUrlPageId(), 'DESKTOP');
                var compPointer = this.pointers.components.getComponent('child-hidden-in-default', pagePointer);
                var compPointerToFull = this.pointers.full.components.getComponent('child-hidden-in-default', pagePointer);

                expect(compPointer).toBe(null);
                expect(this.dal.full.isExist(compPointerToFull)).toBe(true);
            });
        });

        describe('isPathExist', function () {
            it('should return true for both displayed and full if exists on displayed', function () {
                var displayedPath = this.containerChildrenPath.concat(1);

                expect(this.dal.isPathExist(displayedPath)).toBe(true);
            });

            it('should return false for displayed and true for full if not displayed', function () {
                var fullPath = this.containerChildrenPath.concat(2);

                expect(this.dal.isPathExist(fullPath)).toBe(false);
                expect(this.dal.full.isPathExist(fullPath)).toBe(true);
            });
        });

        describe('remove', function () {
            it('should remove from displayed and from full', function () {
                var pagePointer = this.pointers.components.getPage(this.siteData.getCurrentUrlPageId(), 'DESKTOP');
                var compPointer = this.pointers.components.getComponent('child-always-displayed', pagePointer);

                this.dal.remove(compPointer);

                expect(this.dal.isExist(compPointer)).toBe(false);
                expect(this.dal.full.isExist(compPointer)).toBe(false);
            });

            it('should remove from full and from displayed', function () {
                var pagePointer = this.pointers.components.getPage(this.siteData.getCurrentUrlPageId(), 'DESKTOP');
                var compPointer = this.pointers.components.getComponent('child-always-displayed', pagePointer);

                this.dal.full.remove(compPointer);

                expect(this.dal.isExist(compPointer)).toBe(false);
                expect(this.dal.full.isExist(compPointer)).toBe(false);
            });

            describe('when pointer is NOT in pagesData', function () {
                it('should update both jsons and snapshots', function () {
                    var pointer = this.pointers.general.getEditorData();
                    var innerEditorDataPointer = this.pointers.getInnerPointer(pointer, 'whos');
                    this.dal.set(innerEditorDataPointer, 'on first');

                    this.dal.remove(innerEditorDataPointer);
                    this.dal.takeSnapshot('tagish');
                    var snapshot = this.dal.getLastSnapshotByTagName('tagish');

                    expect(this.dal.get(innerEditorDataPointer)).not.toBeDefined();
                    expect(this.dal.full.get(innerEditorDataPointer)).not.toBeDefined();
                    expect(_.get(snapshot, ['editorData', 'whos'])).not.toBeDefined();
                });
            });
        });

        describe('removeByPath', function () {
            it('should remove from displayed', function () {
                //todo Shimi_Liderman 31/12/2015 14:28 what about fullUpdater
                var displayedPath = this.containerChildrenPath.concat(0);
                var comp = this.dal.getByPath(displayedPath);

                this.dal.full.removeByPath(displayedPath);

                expect(this.dal.getByPath(this.containerChildrenPath).length).toEqual(1);
                expect(_.pick(this.dal.getByPath(displayedPath), 'id')).not.toEqual(_.pick(comp, 'id'));
            });

            describe('when path is NOT in pagesData', function () {
                it('should update both jsons and snapshots', function () {
                    var path = ['editorData', 'whats'];
                    this.dal.full.setByPath(path, 'on first');

                    this.dal.full.removeByPath(path);
                    this.dal.takeSnapshot('tagish');
                    var snapshot = this.dal.getLastSnapshotByTagName('tagish');

                    expect(this.dal.getByPath(path)).not.toBeDefined();
                    expect(this.dal.full.getByPath(path)).not.toBeDefined();
                    expect(_.get(snapshot, path)).not.toBeDefined();
                });
            });
        });

        describe('getKeysByPath', function () {
            it('should get an object keys from displayed', function () {
                var displayedPath = this.containerChildrenPath.concat(1);
                var comp = this.dal.getByPath(displayedPath);

                expect(this.dal.getKeysByPath(displayedPath)).toEqual(_.keys(comp));
            });

            it('should get an object keys from full', function () {
                var fullPath = this.containerChildrenPath.concat(1);
                var comp = this.dal.full.getByPath(fullPath);

                expect(this.dal.full.getKeysByPath(fullPath)).toEqual(_.keys(comp));
                expect(this.dal.getKeysByPath(fullPath)).not.toEqual(_.keys(comp));
            });
        });

        describe('getKeys', function () {
            it('should get an object keys from displayed', function () {
                var pagePointer = this.pointers.components.getPage(this.siteData.getCurrentUrlPageId(), 'DESKTOP');
                var compPointer = this.pointers.components.getComponent('child-hidden-in-mode', pagePointer);
                var comp = this.dal.get(compPointer);

                expect(this.dal.getKeys(compPointer)).toEqual(_.keys(comp));
            });

            it('should get an object keys from full', function () {
                var pagePointer = this.pointers.full.components.getPage(this.siteData.getCurrentUrlPageId(), 'DESKTOP');
                var compPointer = this.pointers.full.components.getComponent('child-hidden-in-mode', pagePointer);
                var comp = this.dal.full.get(compPointer);

                expect(this.dal.full.getKeys(compPointer)).toEqual(_.keys(comp));
                expect(this.dal.getKeys(compPointer)).not.toEqual(_.keys(comp));
            });
        });
    });
});
