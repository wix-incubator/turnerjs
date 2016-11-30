define(['lodash', 'testUtils',
        'core/core/data/pointers/DataAccessPointers',
        'core/core/data/pointers/pointersCache',
        'core/core/data/DisplayedJsonDal'], function(_, testUtils, DataAccessPointers, PointersCache, DisplayedJsonDal) {
    'use strict';

    describe('DisplayedJsonDal', function() {

        function getUnattachedComponent(pointers, id, type) {
            return pointers.components.getUnattached(id, type || 'DESKTOP');
        }

        beforeEach(function() {
            this.mockSiteData = testUtils.mockFactory.mockSiteData();
            this.mockSiteData.addPageWithData('mainPage', {}, [{
                id: 'container-1',
                type: 'Container',
                layout: {
                    x: 0, y: 0,
                    width: 500, height: 500
                },
                foo: {
                    'bar': 'barVal',
                    'deep': {
                        'a': 'b'
                    }
                },
                components: []
            }]);

            var displayedJson = {pagesData: _.cloneDeep(this.mockSiteData.pagesData)};

            var cache = new PointersCache(this.mockSiteData, displayedJson, this.mockSiteData);
            var displayedCache = cache.getBoundCacheInstance(false);
            this.displayedJsonDal = new DisplayedJsonDal(displayedJson, displayedCache);
            this.pointers = new DataAccessPointers(cache);
        });

        describe('set', function() {
            describe('when setting a value to an inexisting path', function() {
                it('should throw errer', function() {
                    var value = {key: 'value'};
                    var pointer = getUnattachedComponent(this.pointers, 'fakeId');
                    var self = this;

                    var displayedDalSet = function(){
                        self.displayedJsonDal.set(self.displayedJsonDal, pointer, value);
                    };

                    expect(displayedDalSet).toThrow();
                });
            });

            describe('when setting a value to a reachable (existing) path', function() {
                it('should set the value to it', function() {
                    var value = {id: 'container-1', key: 'value'};
                    var pagePointer = this.pointers.components.getPage('mainPage', 'DESKTOP');
                    var pointer = this.pointers.components.getComponent('container-1', pagePointer);

                    this.displayedJsonDal.set(pointer, value);

                    expect(this.displayedJsonDal.get(pointer)).toEqual(value);
                });
            });
        });

        describe('isExist', function() {
            describe('when there is a cached value to the pointer', function() {
                it('should return true', function() {
                    var pagePointer = this.pointers.components.getPage('mainPage', 'DESKTOP');
                    var containerPointer = this.pointers.components.getComponent('container-1', pagePointer);

                    expect(this.displayedJsonDal.isExist(containerPointer)).toBe(true);
                });
            });

            describe('when there is no cached value to the pointer', function() {
                it('should return false', function() {
                    var containerPointer = getUnattachedComponent(this.pointers, 'bubu');

                    expect(this.displayedJsonDal.isExist(containerPointer)).toBe(false);
                });
            });
        });

        describe('isPathExist', function() {
            describe('when the path leads to an actual value in the JSON', function() {
                it('should return true', function() {
                    var isPathExist = this.displayedJsonDal.isPathExist(['pagesData', 'mainPage', 'structure', 'components', '0']);

                    expect(isPathExist).toBeTruthy();
                });
            });

            describe('when the path does not lead to any value in the JSON', function() {
                it('should return false', function() {
                    var isPathExist = this.displayedJsonDal.isPathExist(['pagesData', 'mainPage', 'nonExistingPageId']);

                    expect(isPathExist).toBeFalsy();
                });
            });
        });

        describe('merge', function() {
            describe('when merging data to a non-existing one', function() {
                it('should not assign the given data - nothing should happen', function() {
                    var pagePointer = this.pointers.components.getPage('mainPage', 'DESKTOP');
                    var componentPointer = this.pointers.components.getComponent('container-1', pagePointer);
                    var mooPointer = this.pointers.getInnerPointer(componentPointer, 'Moo');

                    this.displayedJsonDal.merge(mooPointer, {'abc': 'def'});

                    expect(this.displayedJsonDal.get(mooPointer)).toBeUndefined();
                });
            });

            describe('when a path to existing data is valid and valid data object is merged', function() {
                it('should perform a flat merge of the data', function() {
                    var dataToMerge = {
                        'deep': {
                            'deepkey': 'deep-value'
                        },
                        'foo2': 'foo2-val'
                    };

                    var pagePointer = this.pointers.components.getPage('mainPage', 'DESKTOP');
                    var containerPointer = this.pointers.components.getComponent('container-1', pagePointer);
                    var compFooPointer = this.pointers.getInnerPointer(containerPointer, 'foo');

                    this.displayedJsonDal.merge(compFooPointer, dataToMerge);

                    var expectedValue = {
                        'bar': 'barVal',
                        'foo2': 'foo2-val',
                        'deep': {
                            'deepkey': 'deep-value'
                        }
                    };
                    expect(this.displayedJsonDal.get(compFooPointer)).toEqual(expectedValue);
                });
            });

            describe('when a path to existing data is valid and an invalid data object is merged', function() {
                it('should keep the original data as it was', function() {
                    var dataToMerge = 'abcdefg';
                    var pagePointer = this.pointers.components.getPage('mainPage', 'DESKTOP');
                    var containerPointer = this.pointers.components.getComponent('container-1', pagePointer);
                    var compFooPointer = this.pointers.getInnerPointer(containerPointer, 'foo');

                    expect(this.displayedJsonDal.merge.bind(this.displayedJsonDal, compFooPointer, dataToMerge)).toThrow();
                    var expectedValue = {
                        'bar': 'barVal',
                        'deep': {
                            'a': 'b'
                        }
                    };
                    expect(this.displayedJsonDal.get(compFooPointer)).toEqual(expectedValue);
                });
            });
        });

        describe('push', function() {

            function addArrayDataToContainer1(pointers, displayedJsonDal) {
                var pagePointer = pointers.components.getPage('mainPage', 'DESKTOP');
                var containerPointer = pointers.components.getComponent('container-1', pagePointer);
                displayedJsonDal.merge(containerPointer, {
                    arrayData: ['1', '2']
                });
            }

            function getArrayPointer(pointers, compId, arrayKey) {
                var compPointer = getUnattachedComponent(pointers, compId);
                return pointers.getInnerPointer(compPointer, arrayKey);
            }

            beforeEach(function() {
                addArrayDataToContainer1(this.pointers, this.displayedJsonDal);
            });

            describe('when trying to push a value at index to an invalid array pointer', function() {
                it('should not do anything', function() {
                    var invalidArrayPointer = getUnattachedComponent(this.pointers, 'container-z');

                    var failedPush = this.displayedJsonDal.push.bind(this.displayedJsonDal, invalidArrayPointer, 'value', false, 14);

                    expect(failedPush).toThrow();
                });
            });

            describe('when trying to push a value at an invalid index to an array pointer', function() {

                describe('when the index is not a number', function() {
                    it('should throw an exception for it not being a number', function() {
                        var arrayPointer = getArrayPointer(this.pointers, 'container-1', 'arrayData');

                        var failedPush = this.displayedJsonDal.push.bind(this.displayedJsonDal, arrayPointer, 'value', false, '2');

                        expect(failedPush).toThrow();
                    });
                });

                describe('when the index is out of bounds', function() {
                    it('should throw an out of bounds error when the index is larger than the size of the array + 1', function() {
                        var arrayPointer = getArrayPointer(this.pointers, 'container-1', 'arrayData');

                        var failedPush = this.displayedJsonDal.push.bind(this.displayedJsonDal, arrayPointer, 'value', false, 3);

                        expect(failedPush).toThrow();
                    });

                    it('should throw an out of bounds error when the index is smaller than 0', function() {
                        var arrayPointer = getArrayPointer(this.pointers, 'container-1', 'arrayData');

                        var failedPush = this.displayedJsonDal.push.bind(this.displayedJsonDal, arrayPointer, 'value', false, -1);

                        expect(failedPush).toThrow();
                    });
                });
            });

            describe('when trying to push a value at a valid index to an array pointer', function() {
                it('should push the value into the array at the specified index', function() {
                    var arrayPointer = getArrayPointer(this.pointers, 'container-1', 'arrayData');
                    var expectedArray = ['1', '2', 'my-Value'];

                    this.displayedJsonDal.push(arrayPointer, 'my-Value', false, 2);

                    expect(this.displayedJsonDal.get(arrayPointer)).toEqual(expectedArray);
                });
            });
        });

        describe('remove', function() {
            describe('when trying to remove a non-existing item', function() {
                it('should throw an error and do no changes to the structure', function() {
                    var pagePointer = this.pointers.components.getPage('mainPage', 'DESKTOP');
                    var containerPointer = this.pointers.components.getComponent('container-1', pagePointer);
                    var pointerToErase = this.pointers.getInnerPointer(containerPointer, 'foo2');
                    var container = this.displayedJsonDal.get(containerPointer);

                    var failedRemove = this.displayedJsonDal.remove.bind(this.displayedJsonDal, pointerToErase);

                    expect(failedRemove).toThrow();
                    expect(this.displayedJsonDal.get(containerPointer)).toEqual(container);
                });
            });

            describe('when trying to remove an existing item', function() {
                it('should delete that item from the displayed json', function() {
                    var pagePointer = this.pointers.components.getPage('mainPage', 'DESKTOP');
                    var containerPointer = this.pointers.components.getComponent('container-1', pagePointer);
                    var pointerToErase = this.pointers.getInnerPointer(containerPointer, 'foo');
                    var existingData = this.displayedJsonDal.get(pointerToErase);

                    this.displayedJsonDal.remove(pointerToErase);

                    expect(existingData).toBeDefined();
                    expect(this.displayedJsonDal.get(pointerToErase)).toBeUndefined();
                });
            });
        });

        describe('getKeys', function() {
            describe('when an invalid / non-existing pointer path is passed', function() {
                it('should return undefined', function() {
                    var pagePointer = this.pointers.components.getPage('mainPage', 'DESKTOP');
                    var containerPointer = this.pointers.components.getComponent('container-1', pagePointer);
                    var nonExistingPointer = this.pointers.getInnerPointer(containerPointer, 'boo');

                    expect(this.displayedJsonDal.getKeys(nonExistingPointer)).not.toBeDefined();
                });
            });

            describe('when a valid pointer is passed', function() {
                it('should return all the keys', function() {
                    var pagePointer = this.pointers.components.getPage('mainPage', 'DESKTOP');
                    var containerPointer = this.pointers.components.getComponent('container-1', pagePointer);
                    expect(this.displayedJsonDal.getKeys(containerPointer)).toContain(['id', 'type', 'foo', 'layout', 'components']);
                });
            });
        });
    });
});
