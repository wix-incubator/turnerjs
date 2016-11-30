define(['lodash', 'documentServices/dataModel/dataIds'], function (_, dataIds) {
    "use strict";

    describe("Data Ids module - ", function () {

        it("should generate unique IDs for all data item types", function () {
            var types = ['data', 'props', 'style', 'behaviors', 'connections'];
            var idsMap = {};

            for (var i = 0; i < types.length; i++) {
                var type = types[i];
                var id1 = dataIds.generateNewId(type);
                var id2 = dataIds.generateNewId(type);

                expect(idsMap[id1]).toBeUndefined();
                expect(idsMap[id2]).toBeUndefined();

                idsMap[id1] = id1;
                idsMap[id2] = id2;

                expect(id1).toBeDefined();
                expect(id2).toBeDefined();
                expect(id1).not.toBe(id2);
            }
        });

        it("should return a new id with the prefix 'dataItem-' for data", function(){
            var generateId = dataIds.generateNewId('data');

            expect(generateId).toMatch(/^dataItem-/);
        });
        it("should return a new id with the prefix 'propItem-' for properties", function(){
            var generateId = dataIds.generateNewId('props');

            expect(generateId).toMatch(/^propItem-/);
        });
        it("should return a new id with the prefix 'style-' for data", function(){
            var generateId = dataIds.generateNewId('style');

            expect(generateId).toMatch(/^style-/);
        });
        it("should return a new id with the prefix 'behavior-' for data", function(){
            var generateId = dataIds.generateNewId('behaviors');

            expect(generateId).toMatch(/^behavior-/);
        });
        it("should return a new id with the prefix 'connection-' for data", function(){
            var generateId = dataIds.generateNewId('connections');

            expect(generateId).toMatch(/^connection-/);
        });

    });
});
