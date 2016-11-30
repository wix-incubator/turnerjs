define(['lodash', 'core/core/data/pointers/pointersCache',
    'core/core/data/pointers/pointerGeneratorsRegistry',
    'core/core/data/pathValidationUtil',
    'testUtils'], function (_, PointerCache, pointerGeneratorsRegistry, pathValidationUtil, testUtils) {
    "use strict";

    describe("pointersCache", function () {
        var cache;
        var regularJsonInstance;
        var fullJsonInstance;
        var type1 = 'type1';
        var type2 = 'type2';
        var type3 = 'type3';

        function prepareFull(thisScope) {
            thisScope.findItem1.and.callFake(function (currentPage, getItemInPath, pointer) {
                var path = pointer.id.split('_');
                var obj = getItemInPath(path);
                return obj ? path : null;
            });

            thisScope.findItem3.and.callFake(function (currentPage, getItemInPath, pointer) {
                var path = pointer.id.split('_');
                var obj = getItemInPath(path);
                return obj ? path : null;
            });
        }

        beforeEach(function () {
            this.findItem1 = jasmine.createSpy('findItem1').and.returnValue(null);
            this.findItem2 = jasmine.createSpy('findItem2').and.returnValue(null);
            this.findItem3 = jasmine.createSpy('findItem3').and.returnValue(null);
            this.identityCheck = jasmine.createSpy('identityCheck').and.returnValue(true);
            this.identityCheck2 = jasmine.createSpy('identityCheck').and.returnValue(true);
            this.identityCheck3 = jasmine.createSpy('identityCheck').and.returnValue(true);

            pointerGeneratorsRegistry.registerPointerType(type1, this.findItem1, this.identityCheck, true, true);
            pointerGeneratorsRegistry.registerPointerType(type2, this.findItem2, this.identityCheck2);
            pointerGeneratorsRegistry.registerPointerType(type3, this.findItem3, this.identityCheck3, false, true);

            this.json = {items: [[], [], [], []]};
            var mockSiteData = _.assign(testUtils.mockFactory.mockSiteData(null, true), this.json);
            this.fullJson = {items: [{isFull: true}, {isFull: true}], itemsF: [{isFull: true}]};
            cache = new PointerCache(mockSiteData, this.json, this.fullJson);
            regularJsonInstance = cache.getBoundCacheInstance(false);
            fullJsonInstance = cache.getBoundCacheInstance(true);
        });

        it("should return null when creating a pointer with no path", function () {
            var pointer = regularJsonInstance.getPointer('itemId', type1);
            expect(pointer).toBe(null);
        });

        it("should return a pointer to the object if the path valid", function () {
            var path1 = ['items', 1];
            var pointer1 = regularJsonInstance.getPointer('item1', type1, path1);
            expect(regularJsonInstance.getPath(pointer1)).toBe(path1);
        });

        it("should return pointer even if the path is not valid, but getPath will return null", function () {
            var path1 = ['items', 33];
            var pointer1 = regularJsonInstance.getPointer('item1', type1, path1);
            expect(regularJsonInstance.getPath(pointer1)).toBe(null);
        });

        it("should separate items by type", function () {
            var path1 = ['items', 1];
            var pointer1 = regularJsonInstance.getPointer('item1', type1, path1);
            var path2 = ['items', 2];
            var pointer2 = regularJsonInstance.getPointer('item1', type2, path2);
            expect(regularJsonInstance.getPath(pointer1)).toBe(path1);
            expect(regularJsonInstance.getPath(pointer2)).toBe(path2);
        });

        it("should return a pointer, and you can get a path from both full and 'regular' json with it", function () {
            prepareFull(this);
            var pointer = regularJsonInstance.getPointer('items_1', type1, ['items', 1]);

            var path = regularJsonInstance.getPath(pointer);
            var fullPath = regularJsonInstance.getPath(pointer, false, true);

            expect(_.get(this.json, path)).toEqual([]);
            expect(_.get(this.fullJson, fullPath)).toEqual({isFull: true});
        });

        it("should return a pointer to an object existing only in full json, and not look for it", function () {
            prepareFull(this);
            var pointer = fullJsonInstance.getPointer('itemsF_0', type1, ['itemsF', 0]);

            var path = regularJsonInstance.getPath(pointer);
            expect(this.findItem1).toHaveBeenCalled();
            this.findItem1.calls.reset();
            var fullPath = fullJsonInstance.getPath(pointer);
            expect(this.findItem1).not.toHaveBeenCalled();

            expect(path).toBeNull();
            expect(_.get(this.fullJson, fullPath)).toEqual({isFull: true});
        });

        it('should search the json and return the correct path', function () {
            prepareFull(this);
            var wrongPath = ['items', 2];
            var realPath = ['items', 1];
            this.findItem2.and.returnValue(realPath);
            this.identityCheck2.and.callFake(function(item){
                return item === 'Hello';
            });
            this.fullJson.items[1] = 'hello';

            var pointer = fullJsonInstance.getPointer('item1', type2, realPath);
            fullJsonInstance.getPath(pointer);
            pointer = fullJsonInstance.getPointer('item1', type2, wrongPath);
            var fullPath = fullJsonInstance.getPath(pointer);

            expect(fullPath).toEqual(realPath);
        });

        it('should return the correct path on consecutive calls from full json path', function () {
            var wrongPath = ['a'];
            var realPath = ['a', 'b'];
            this.findItem3.and.returnValue(realPath);
            var pointer = regularJsonInstance.getPointer('item1', type3, wrongPath);
            var path = fullJsonInstance.getPath(pointer);
            pointer = regularJsonInstance.getPointer('item1', type3, wrongPath);
            path = fullJsonInstance.getPath(pointer);

            expect(path).toEqual(realPath);
        });

        it('should return the correct path on consecutive calls from displayed json path', function () {
            var wrongPath = ['a'];
            var realPath = ['a', 'b'];
            this.findItem3.and.returnValue(realPath);
            var pointer = fullJsonInstance.getPointer('item1', type3, wrongPath);
            var path = regularJsonInstance.getPath(pointer);
            pointer = fullJsonInstance.getPointer('item1', type3, wrongPath);
            path = regularJsonInstance.getPath(pointer);

            expect(path).toEqual(realPath);
        });

        it("should return a pointer to an object existing only in 'regular' json, and not look for it", function () {
            prepareFull(this);
            var pointer = regularJsonInstance.getPointer('items_3', type1, ['items', 3]);

            var path = regularJsonInstance.getPath(pointer);
            expect(this.findItem1).not.toHaveBeenCalled();
            var fullPath = fullJsonInstance.getPath(pointer);
            expect(this.findItem1).toHaveBeenCalled();

            expect(fullPath).toBeNull();
            expect(_.get(this.json, path)).toEqual([]);
        });

        describe("getPath", function () {
            describe("correctness", function () {
                it("should return path for a pointer if item exists", function () {
                    var assignedPath = ['items', 2];
                    var pointer = regularJsonInstance.getPointer('itemId', type1, assignedPath);
                    var path = regularJsonInstance.getPath(pointer);
                    expect(path).toBe(assignedPath);
                });

                it("should return path for a pointer with inner path if exists", function () {
                    var assignedPath = ['items', 2];
                    var pointer = regularJsonInstance.getPointer('itemId', type1, ['items']);
                    pointer.innerPath = [2];

                    var path = regularJsonInstance.getPath(pointer);

                    expect(path).toEqual(assignedPath);
                });

                it("should return correct path to the pointer, if assigned a wrong one", function () {
                    this.identityCheck.and.callFake(function (id, item) {
                        return parseInt(id, 10) === item;
                    });
                    var pointer = regularJsonInstance.getPointer('2', type1, ['items', 2]);
                    var newPath = ['items', 1];
                    this.findItem1.and.returnValue(newPath);

                    var path = regularJsonInstance.getPath(pointer);

                    expect(path).toBe(newPath);
                });

                it("should return null for a pointer to an item that does not exist", function () {
                    this.identityCheck.and.returnValue(false);
                    var pointer1 = regularJsonInstance.getPointer('item1', type1, ['items', 1]);
                    expect(regularJsonInstance.getPath(pointer1)).toBe(null);
                });

                it("should return null for a pointer to an item that exists, but inner path is wrong", function () {
                    var pointer = regularJsonInstance.getPointer('itemId', type1, ['items']);
                    pointer.innerPath = [33];

                    var path = regularJsonInstance.getPath(pointer);

                    expect(path).toBe(null);
                });

                describe("ignoreLastPartInValidation", function () {
                    it("should return path if last part of pointer path doesn't exist", function () {
                        var assignedPath = ['items', 33];
                        var pointer = regularJsonInstance.getPointer('itemId', type1, assignedPath);

                        var path = regularJsonInstance.getPath(pointer, true);

                        expect(path).toBe(assignedPath);
                    });

                    it("should return path if last part of innerPath doesn't exist", function () {
                        var assignedPath = ['items', 2, 33];
                        var pointer = regularJsonInstance.getPointer('itemId', type1, ['items']);
                        pointer.innerPath = [2, 33];

                        var path = regularJsonInstance.getPath(pointer, true);

                        expect(path).toEqual(assignedPath);
                    });

                    it("should return null if pointer path without the last part is wrong", function () {
                        var assignedPath = ['items', 33, 44];
                        var pointer = regularJsonInstance.getPointer('itemId', type1, assignedPath);

                        var path = regularJsonInstance.getPath(pointer, true);

                        expect(path).toBe(null);
                    });

                    it("should return null if innerPath without the last part is wrong", function () {
                        var pointer = regularJsonInstance.getPointer('itemId', type1, ['items']);
                        pointer.innerPath = [33, 44];

                        var path = regularJsonInstance.getPath(pointer, true);

                        expect(path).toBe(null);
                    });
                });
            });

            describe("path validations - performance", function () {
                beforeEach(function () {
                    this.pathValidationSpy = spyOn(pathValidationUtil, 'validatePathExistsAndCorrect').and.callThrough();
                });

                function getPointerAndValidatePath(scope) {
                    var pointer = regularJsonInstance.getPointer('itemId', type1, ['items', 2]);
                    regularJsonInstance.getPath(pointer); //this has validated the path
                    scope.pathValidationSpy.calls.reset();
                    return pointer;
                }

                it("should run validation on first try, but not the finder", function () {
                    var pointer = regularJsonInstance.getPointer('itemId', type1, ['items', 2]);

                    regularJsonInstance.getPath(pointer);

                    expect(this.pathValidationSpy.calls.count()).toBe(1);
                    expect(this.findItem1).not.toHaveBeenCalled();
                });

                it("should not run the validation if path has been validated, and not the finder", function () {
                    var pointer = getPointerAndValidatePath(this);

                    regularJsonInstance.getPath(pointer);

                    expect(this.pathValidationSpy).not.toHaveBeenCalled();
                    expect(this.findItem1).not.toHaveBeenCalled();
                });

                it("should run the validation if path has been invalidated, if found valid should not run the finder", function () {
                    var pointer = getPointerAndValidatePath(this);

                    regularJsonInstance.resetValidations();
                    regularJsonInstance.getPath(pointer);

                    expect(this.pathValidationSpy.calls.count()).toBe(1);
                    expect(this.findItem1).not.toHaveBeenCalled();
                });

                it("should not run the validation if path has been set to the same path, and not the finder", function () {
                    var pointer = getPointerAndValidatePath(this);

                    pointer = regularJsonInstance.getPointer('itemId', type1, ['items', 2]);
                    regularJsonInstance.getPath(pointer);

                    expect(this.findItem1).not.toHaveBeenCalled();
                    expect(this.pathValidationSpy).not.toHaveBeenCalled();
                });

                it("should run the validation if path has been set to a different pat, but not the finder", function () {
                    var pointer = getPointerAndValidatePath(this);

                    pointer = regularJsonInstance.getPointer('itemId', type1, ['items', 1]);
                    regularJsonInstance.getPath(pointer);

                    expect(this.pathValidationSpy.calls.count()).toBe(1);
                    expect(this.findItem1).not.toHaveBeenCalled();
                });

                it("should run the finder if path found not valid", function () {
                    var pointer = regularJsonInstance.getPointer('itemId', type1, ['items', 33]);

                    regularJsonInstance.getPath(pointer);

                    expect(this.findItem1.calls.count()).toBe(1);
                });

                it("should run the finder if path has been invalidated and found not valid", function () {
                    var pointer = getPointerAndValidatePath(this);

                    regularJsonInstance.getPointer('itemId', type1, ['items', 33]);
                    regularJsonInstance.getPath(pointer);

                    expect(this.findItem1.calls.count()).toBe(1);
                });

                it("should not run the finder if path is valid, but inner path isn't", function () {
                    var pointer = regularJsonInstance.getPointer('itemId', type1, ['items', 1]);
                    pointer.innerPath = ['someField'];

                    regularJsonInstance.getPath(pointer);

                    expect(this.findItem1).not.toHaveBeenCalled();
                });

                it("should run the finder if path points to something, but not the right item", function () {
                    var pointer = regularJsonInstance.getPointer('itemId', type1, ['items', 1]);
                    this.identityCheck.and.returnValue(false);

                    regularJsonInstance.getPath(pointer);

                    expect(this.findItem1.calls.count()).toBe(1);
                });

                it("should cache the returned value of the finder", function () {
                    this.findItem1.and.returnValue(['items', 1]);
                    var pointer = regularJsonInstance.getPointer('itemId', type1, ['items', 33]);
                    regularJsonInstance.getPath(pointer);
                    this.findItem1.calls.reset();

                    regularJsonInstance.getPath(pointer);
                    expect(this.findItem1).not.toHaveBeenCalled();
                });

                describe("ignoreLastPartInValidation", function () {
                    beforeEach(function () {
                        this.isExistsCheckSpy = spyOn(pathValidationUtil, 'validatePathExist').and.callThrough();
                    });

                    it("should not run the validation if whole path is validated", function () {
                        var pointer = getPointerAndValidatePath(this);

                        regularJsonInstance.getPath(pointer, true);

                        expect(this.isExistsCheckSpy).not.toHaveBeenCalled();
                        expect(this.pathValidationSpy).not.toHaveBeenCalled();
                    });

                    it("should run the validation on the whole path if innerPath is provided", function () {
                        var pointer = regularJsonInstance.getPointer('itemId', type1, ['items', 1]);
                        pointer.innerPath = ['someField'];

                        regularJsonInstance.getPath(pointer, true);

                        expect(this.pathValidationSpy.calls.count()).toBe(1);
                    });

                    it("should check only if path, without the last part, exists (no identity check) if not validated and no innerPath", function () {
                        var pointer = regularJsonInstance.getPointer('itemId', type1, ['items', 1]);

                        regularJsonInstance.getPath(pointer, true);

                        expect(this.isExistsCheckSpy.calls.count()).toBe(1);
                    });

                    it("should not run the finder if no innerPath", function () {
                        var pointer = regularJsonInstance.getPointer('itemId', type1, ['nonExisting', 1]);

                        regularJsonInstance.getPath(pointer, true);

                        expect(this.isExistsCheckSpy.calls.count()).toBe(1);
                        expect(this.findItem1).not.toHaveBeenCalled();
                    });

                    it("should not run this check on the second call as well", function () {
                        var pointer = regularJsonInstance.getPointer('itemId', type1, ['items', 33]);

                        regularJsonInstance.getPath(pointer, true);
                        regularJsonInstance.getPath(pointer, true);

                        expect(this.isExistsCheckSpy.calls.count()).toBe(1);
                        expect(this.pathValidationSpy).not.toHaveBeenCalled();
                    });

                    it("should not run check again, even if getPath was called with ignoreLastPartInValidation=false before (validation failed)", function () {
                        var pointer = regularJsonInstance.getPointer('itemId', type1, ['items', 33]);

                        regularJsonInstance.getPath(pointer, true);
                        regularJsonInstance.getPath(pointer);
                        this.isExistsCheckSpy.calls.reset();
                        this.pathValidationSpy.calls.reset();

                        regularJsonInstance.getPath(pointer, true);

                        expect(this.isExistsCheckSpy).not.toHaveBeenCalled();
                        expect(this.pathValidationSpy).not.toHaveBeenCalled();
                    });
                });
            });
        });

        describe("setPath", function () {
            it("should set a path to a pointer", function () {
                var pointer = regularJsonInstance.getPointer('item_3', type1, []);
                expect(regularJsonInstance.getPath(pointer)).toEqual([]); //because the identity checker returns true always
                regularJsonInstance.setPath(pointer, ['items', 3]);
                expect(regularJsonInstance.getPath(pointer)).toEqual(['items', 3]);
            });
        });
    });
});
