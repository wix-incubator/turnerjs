describe("ObjectsByIds", function(){
    testRequire().classes('bootstrap.managers.events.ObjectsByIds');
    beforeEach(function(){
        this._objectsByIds = new this.ObjectsByIds();
    });
    describe("getObjectId", function(){
        it("should return the same id for the same object", function(){
            var obj = {};
            var id1 = this._objectsByIds.getObjectId(obj, true);
            var id2 = this._objectsByIds.getObjectId(obj, true);
            expect(id1).toBeTruthy();
            expect(id2).toBeTruthy();
            expect(id1).toBe(id2);
        });
        it("should return different ids for different objects", function(){
            var obj1 = {};
            var obj2 = {};
            var id1 = this._objectsByIds.getObjectId(obj1, true);
            var id2 = this._objectsByIds.getObjectId(obj2, true);
            expect(id1).not.toBe(id2);
        });
        it("should enable get object by id for that object", function(){
            var obj1 = {};
            var id1 = this._objectsByIds.getObjectId(obj1, true);
            expect(this._objectsByIds.getObjectById(id1)).toBe(obj1);
        });
        it("should return the same id for the object even after it was deleted", function(){
            var obj1 = {};
            var id1 = this._objectsByIds.getObjectId(obj1, true);
            this._objectsByIds.removeObjectById(id1);
            expect(this._objectsByIds.getObjectId(obj1, true)).toBe(id1);
        });
    });

    describe("getObjectById", function(){
        it("should return undefined if there is no object with that id", function(){
            expect(this._objectsByIds.getObjectById(200)).toBeUndefined();
        });
        it("should return the object with that id", function(){
            var obj = {'a': 1};
            var objId = this._objectsByIds.getObjectId(obj, true);
            expect(this._objectsByIds.getObjectById(objId)).toBeEquivalentTo(obj);
        });
        it("should not work after the object was removed", function(){
            var obj1 = {};
            var id1 = this._objectsByIds.getObjectId(obj1, true);
            this._objectsByIds.removeObjectById(id1);
            expect(this._objectsByIds.getObjectById(id1)).toBeUndefined();
        });
        it("should work if object was removed and then getObjectId was called", function(){
            var obj1 = {};
            var id1 = this._objectsByIds.getObjectId(obj1, true);
            this._objectsByIds.removeObjectById(id1);
            this._objectsByIds.getObjectId(obj1, true);
            expect(this._objectsByIds.getObjectById(id1)).toBe(obj1);
        });
    });

    describe("multiple instances", function(){
        beforeEach(function(){
            this._objectsByIds1 = new this.ObjectsByIds();
        });
        it("should return the same id for both of the instances", function(){
            var obj = {};
            var id1 = this._objectsByIds.getObjectId(obj, true);
            var id2 = this._objectsByIds1.getObjectId(obj, true);
            expect(id1).toBe(id2);
        });
        it("should return different ids for different objects for both of the instances", function(){
            var obj1 = {};
            var obj2 = {};
            var id1 = this._objectsByIds.getObjectId(obj1, true);
            var id2 = this._objectsByIds1.getObjectId(obj2, true);
            expect(id1).not.toBe(id2);
        });
    })
});