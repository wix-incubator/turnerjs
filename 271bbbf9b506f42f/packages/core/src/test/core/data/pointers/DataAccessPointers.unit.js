define([
    'lodash',
    'core/core/data/pointers/pointerGeneratorsRegistry',
    'core/core/data/pointers/DataAccessPointers',
    'core/core/data/pointers/pointersCache'], function (_, pointerGeneratorsRegistry, DataAccessPointers, PointersCache) {
    'use strict';

    describe("DataAccessPointers", function () {

        var type1GetterFunctions = {
            getPointer: function (getItemAtPath, cache, id) {
                return cache.getPointer(id, typeName, [id]);
            },

            getPointerWithValidation: function (getItemAtPath, cache, id) {
                var path = [id];
                if (getItemAtPath(path)) {
                    return this.getPointer(getItemAtPath, cache, id);
                }
                return null;
            }
        };

        var typeName = 'type1';

        function registerType(isFullJson, finderFunction) {
            pointerGeneratorsRegistry.registerDataAccessPointersGenerator(typeName, type1GetterFunctions, isFullJson);
            pointerGeneratorsRegistry.registerPointerType(typeName,
                finderFunction,
                function () {
                    return true;
                }, isFullJson);
        }

        describe("init pointers", function () {
            var siteData = {};
            beforeEach(function () {
                this.finder = jasmine.createSpy('finder').and.callFake(function (currentRootIds, getItemInPath, pointer) {
                    return getItemInPath([pointer.id]);
                });
            });
            it("should init pointers namespaces", function () {
                registerType(false, this.finder);

                var jsonData = {'id1': 1, 'id2': 2, 'id3': 3};
                var cache = new PointersCache(siteData, jsonData, jsonData);
                var pointers = new DataAccessPointers(cache);

                var pointer = pointers.type1.getPointer('id2');
                expect(pointer.id).toBe('id2');
            });

            it("should init pointers namespaces, and add a namespace for full json for those who required it", function () {
                registerType(true, this.finder);

                var jsonData = {'id1': 1, 'id2': 2};
                var fullJsonData = {'id1': 1, 'id2': 2};

                var cache = new PointersCache(siteData, jsonData, fullJsonData);
                var pointers = new DataAccessPointers(cache);

                var pointer = pointers.type1.getPointer('id2');
                expect(pointer.id).toBe('id2');

                var fullPointer = pointers.full.type1.getPointer('id2');
                expect(fullPointer.id).toBe('id2');
            });

            it("should look for the item in full if accessed with pointers.full and 'regular' json otherwise", function () {
                registerType(true, this.finder);

                var jsonData = {'id1': 1};
                var fullJsonData = {'id1': 1, 'id2': 2};

                var cache = new PointersCache(siteData, jsonData, fullJsonData);
                var pointers = new DataAccessPointers(cache);

                var pointer = pointers.type1.getPointerWithValidation('id2');
                expect(pointer).toBeNull();

                var fullPointer = pointers.full.type1.getPointerWithValidation('id2');
                expect(fullPointer.id).toBe('id2');
            });

            it("should cache the pointer for both jsons with asked for regular pointer", function () {
                registerType(true, this.finder);

                var jsonData = {'id1': 1};
                var fullJsonData = {'id1': 1, 'id2': {full: true}};

                var cache = new PointersCache(siteData, jsonData, fullJsonData);
                var pointers = new DataAccessPointers(cache);

                var pointer = pointers.type1.getPointer('id1');

                cache.getPath(false, pointer);
                cache.getPath(true, pointer);
                expect(this.finder).not.toHaveBeenCalled();
            });

            it("should cache the pointer for both jsons with asked for full json pointer", function () {
                registerType(true, this.finder);

                var jsonData = {'id1': 1};
                var fullJsonData = {'id1': 1, 'id2': {full: true}};

                var cache = new PointersCache(siteData, jsonData, fullJsonData);
                var pointers = new DataAccessPointers(cache);

                var pointer = pointers.full.type1.getPointer('id1');

                cache.getPath(false, pointer);
                cache.getPath(true, pointer);
                expect(this.finder).not.toHaveBeenCalled();
            });
        });
    });
});
