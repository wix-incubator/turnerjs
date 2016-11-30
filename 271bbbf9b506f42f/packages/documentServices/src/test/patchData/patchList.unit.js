define(['lodash', 'documentServices/mockPrivateServices/privateServicesHelper', 'documentServices/patchData/patchList'], function (_, privateServicesHelper, patchList) {
    'use strict';

  /**
   * Gets a path inside an object as an array, and returns a slash-delimited JSON pointer, the standard in JSON Patch
   */
    function toJsonPointer(pathArray) {
        return '/' + pathArray.join('/');
    }

    describe('applyPatchList', function () {

        beforeEach(function () {
            this.mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL();
        });

        it('should not change the document if given an empty patch list', function () {
            var beforeSave = this.mockPrivateServices.dal.takeSnapshot('before');
            patchList.applyPatchList(this.mockPrivateServices, []);
            expect(this.mockPrivateServices.dal.takeSnapshot('after')).toBe(beforeSave);
        });

        it('should throw error on illegal command', function () {
            var boundToThrow = patchList.applyPatchList.bind(null, this.mockPrivateServices, [{op: 'illegal'}]);
            expect(boundToThrow).toThrow();
        });

        describe('add operation', function () {

            beforeEach(function () {
                this.masterPageChildrenPath = ['pagesData', 'masterPage', 'structure', 'children'];
                this.masterPageChildren = this.mockPrivateServices.dal.full.getByPath(this.masterPageChildrenPath);
            });

            it('should set a value to the path for an add operation', function () {
                patchList.applyPatchList(this.mockPrivateServices, [{op: 'add', path: '/pagesData/masterPage/data/component_properties/newStyleItem', value: {a: 1}}]);
                expect(this.mockPrivateServices.dal.full.getByPath(['pagesData', 'masterPage', 'data', 'component_properties', 'newStyleItem'])).toEqual({a:1});
            });

            it('should push a value when the add operation ends with an array index that does not exist', function() {
                var newItemPath = toJsonPointer(this.masterPageChildrenPath) + '/' + this.masterPageChildren.length;
                patchList.applyPatchList(this.mockPrivateServices, [{op: 'add', path: newItemPath, value: '1'}]);
                expect(this.mockPrivateServices.dal.full.getByPath(this.masterPageChildrenPath.concat([this.masterPageChildren.length]))).toEqual('1');
            });

            it('should splice to the array at an index if it exists and is different', function(){
                var newItemPath = toJsonPointer(this.masterPageChildrenPath) + '/0';
                var firstMasterPageChildPath = this.masterPageChildrenPath.concat([0]);
                patchList.applyPatchList(this.mockPrivateServices, [{op: 'add', path: newItemPath, value: '1'}, {op: 'add', path: newItemPath, value: '2'}]);
                expect(this.mockPrivateServices.dal.full.getByPath(firstMasterPageChildPath)).toEqual('2');
                var secondMasterPageChildPath = this.masterPageChildrenPath.concat([1]);
                expect(this.mockPrivateServices.dal.full.getByPath(secondMasterPageChildPath)).toEqual('1');
            });
        });

        it('should remove a value at the path for a remove operation', function () {
            var path = ['pagesData', 'mainPage', 'structure', 'layout'];
            patchList.applyPatchList(this.mockPrivateServices, [{op: 'remove', path: toJsonPointer(path)}]);
            expect(this.mockPrivateServices.dal.full.isPathExist(path)).toBe(false);
        });

        it('should replace existing value in path for a replace operation', function () {
            var path = ['pagesData', 'mainPage', 'structure', 'layout'];
            patchList.applyPatchList(this.mockPrivateServices, [{op: 'replace', path: toJsonPointer(path), value: 'd'}]);
            expect(this.mockPrivateServices.dal.full.getByPath(path)).toEqual('d');
        });

        it('should throw on nonexisting current value for a replace operation', function () {
            var boundToThrow = patchList.applyPatchList.bind(null, this.mockPrivateServices, [{op: 'replace', path: '/non/existing', value: 'd'}]);
            expect(boundToThrow).toThrow();
        });

        it('should remove path from one place and put in the other on move command', function () {
            var from = ['pagesData', 'mainPage', 'structure', 'layout'];
            var path = ['pagesData', 'masterPage', 'structure', 'layout'];
            var valueBefore = this.mockPrivateServices.dal.full.getByPath(from);

            patchList.applyPatchList(this.mockPrivateServices, [{op: 'move', from: toJsonPointer(from), path: toJsonPointer(path)}]);
            expect(this.mockPrivateServices.dal.full.isPathExist(from)).toBe(false);
            expect(this.mockPrivateServices.dal.full.getByPath(path)).toEqual(valueBefore);
        });

        it('should get path from one place and set it in the other on copy command', function () {
            var from = ['pagesData', 'mainPage', 'structure', 'layout'];
            var path = ['pagesData', 'masterPage', 'structure', 'layout'];
            var valueBefore = this.mockPrivateServices.dal.full.getByPath(from);

            patchList.applyPatchList(this.mockPrivateServices, [{op: 'copy', from: toJsonPointer(from), path: toJsonPointer(path)}]);
            expect(this.mockPrivateServices.dal.getByPath(from)).toEqual(valueBefore);
            expect(this.mockPrivateServices.dal.getByPath(path)).toEqual(valueBefore);
        });

        it('should test if object has the value in a test command and not throw if it has', function () {
            var path = ['pagesData', 'masterPage', 'structure', 'layout'];
            var value = this.mockPrivateServices.dal.full.getByPath(path);
            var boundNotToThrow = patchList.applyPatchList.bind(null, this.mockPrivateServices, [{
                op: 'test',
                path: toJsonPointer(path),
                value: value
            }]);
            expect(boundNotToThrow).not.toThrow();
        });

        it('should handle multiple actions', function () {
            var addPath = ['pagesData', 'masterPage', 'structure', 'children'];
            var removePath = ['pagesData', 'masterPage', 'structure', 'layout'];
            var patches = [
                {op: 'add', path: toJsonPointer(addPath), value: 'val'},
                {op: 'remove', path: toJsonPointer(removePath)}
            ];
            patchList.applyPatchList(this.mockPrivateServices, patches);
            expect(this.mockPrivateServices.dal.full.getByPath(addPath)).toBe('val');
            expect(this.mockPrivateServices.dal.full.isPathExist(removePath)).toBe(false);
        });
    });
});
