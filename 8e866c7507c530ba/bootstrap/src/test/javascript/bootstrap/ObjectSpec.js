describe("Object", function(){
    describe('isEquivalent', function() {
        it('should compare booleans', function() {
            expect(Object.isEquivalent(true, true)).toBeTruthy();
            expect(Object.isEquivalent(true, false)).toBeFalsy();
        });

        it('should compare strings', function() {
            expect(Object.isEquivalent('', '')).toBeTruthy();
            expect(Object.isEquivalent('foo bar baz qux', 'foo bar baz qux')).toBeTruthy();
            expect(Object.isEquivalent('', 'foo bar')).toBeFalsy();
            expect(Object.isEquivalent('foo bar', 'baz qux')).toBeFalsy();
        });

        it('should compare numbers', function() {
            expect(Object.isEquivalent(33, 44)).toBeFalsy();
            expect(Object.isEquivalent(55, 55)).toBeTruthy();
            expect(Object.isEquivalent(55, (typeof 1 / 0))).toBeFalsy();
            expect(Object.isEquivalent(55, null)).toBeFalsy();
        });

        it('should compare functions', function() {
            var f1 = function() {
            };
            var f2 = function() {
            };
            f1.bla = "hello";
            f2.bla = "hello";
            expect(Object.isEquivalent(f1, f2)).toBeFalsy();
        });

        it('should compare arrays', function() {
            expect(Object.isEquivalent([], [])).toBeTruthy();
            expect(Object.isEquivalent([1,2,3], [1,2,3])).toBeTruthy();
            expect(Object.isEquivalent([], [4,5,6])).toBeFalsy();
            expect(Object.isEquivalent([4,5,6], [])).toBeFalsy();
            expect(Object.isEquivalent([1,2,3], [4,5,6])).toBeFalsy();
            expect(Object.isEquivalent([], undefined)).toBeFalsy();
            expect(Object.isEquivalent([1,2,3], undefined)).toBeFalsy();
            expect(Object.isEquivalent([], null)).toBeFalsy();
            expect(Object.isEquivalent([1,2,3], null)).toBeFalsy();
        });

        it('should compare objects', function() {
            var sameObj1 = {sameKey: {foo: 'bar', baz: 'qux'}, anotherSameKey: {anotherSameKey: {qux: 'baz', bar: 'foo'}}},
                sameObj2 = {sameKey: {foo: 'bar', baz: 'qux'}, anotherSameKey: {anotherSameKey: {qux: 'baz', bar: 'foo'}}},
                diffObj = {diffKey: {goo: 'boo'}, anotherDifferentKey: {diffObj: {diff: 'far'}}},
                wackyObj1 = {one: {foo: 'bar', boo: 'far', baz: ['foo','bar','baz']}, two: {roo: 'dub', doo: [], quo: [1,2,3,4, {}, {goo: 'doo', doo: 'goo'}]}},
                wackyObj2 = {one: {foo: 'bar', boo: 'far', baz: ['foo','bar','baz']}, two: {roo: 'dub', doo: [], quo: [1,2,3,4, {}, {goo: 'doo', doo: 'goo'}]}},
                wackyObj3 = {one: {foo: 'bar', boo: 'far', baz: ['foo','bar','baz']}, let: {us: 'go', then: [], you: [1,2,3,4, {}, {and: 'i', where: 'the evening is spread out against the sky'}]}};

            expect(Object.isEquivalent({}, {})).toBeTruthy();
            expect(Object.isEquivalent(sameObj1, sameObj2)).toBeTruthy();
            expect(Object.isEquivalent(sameObj1, diffObj)).toBeFalsy();
            expect(Object.isEquivalent(sameObj2, diffObj)).toBeFalsy();
            expect(Object.isEquivalent(wackyObj1, wackyObj2)).toBeTruthy();
            expect(Object.isEquivalent(wackyObj1, wackyObj3)).toBeFalsy();
            expect(Object.isEquivalent({foo: 'bar', baz: 'qux', length: 2}, {foo: 'bar', baz: 'qux', length: 2})).toBeTruthy();
            expect(Object.isEquivalent({foo123: 'bar123', baz123: 'qux123', length: 5}, {foo: 'bar', baz: 'qux', length: 2})).toBeFalsy();
        });
    });
});