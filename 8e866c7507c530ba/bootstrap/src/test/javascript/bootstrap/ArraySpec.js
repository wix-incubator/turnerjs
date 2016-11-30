/**
 * User: omri
 * Date: 2/15/11
 * Time: 7:23 PM
 **/
describe('Array functional additions', function(){
	it('Array functional additions should exist', function(){
		expect([].moveItem).toBeInstanceOf(Function);
	});

	it('moveItem should swap adjacent items', function(){
        var i;
        var arr = ['a','b','c','d','e','f','g'];
        var expectedArr = ['a','b','c','e','f','d','g'];
        arr.moveItem(3, 5);
        for(i = 0;i < expectedArr.length; i++)
        {
            expect(arr[i]).toBe(expectedArr[i]);
        }
        arr = ['a','b','c','d','e','f','g'];
        arr.moveItem(5, 2);
        expectedArr = ['a','b','f','c','d','e','g'];
        for(i = 0; i < expectedArr.length; i++)
        {
            expect(arr[i]).toBe(expectedArr[i]);
        }
    });

    describe('getIndexByField', function()
    {
        it('should return the index of the first item where item.field == value', function(){
            expect([{'foo': 'air'},{'foo': 'bar'},{'foo': 'cat'}].getIndexByField('foo', 'air')).toBe(0);
            expect([{'foo': 'air'},{'foo': 'bar'},{'foo': 'cat'}].getIndexByField('foo', 'bar')).toBe(1);
        });

        it('should return -1 if no item was found', function(){
            expect([{'foo': 'air'},{'foo': 'bar'},{'foo': 'cat'}].getIndexByField('foo', 'bat')).toBe(-1);
        });
    });

    describe('getByField', function()
    {
        it('should return the first item where item.field == value', function(){
            expect([{'foo': 'air'},{'foo': 'bar'},{'foo': 'cat'}].getByField('foo', 'bar')).toBeEquivalentTo({'foo': 'bar'});
        });

        it('should return undefined if no item was found', function(){
            expect([{'foo': 'air'},{'foo': 'bar'},{'foo': 'cat'}].getByField('foo', 'bat')).not.toBeDefined();
        });
    });

    describe('should support indexOfByPredicate', function()
    {
        it('should handle when target is first', function(){
            expect( [{'foo': 'air'},{'foo': 'bar'},{'foo': 'cat'}].indexOfByPredicate(function(obj){ return obj.foo=='air'}) ).toBe(0);
            expect( [{'foo': 'air'},{'foo': 'bar'},{'foo': 'cat'}].indexOfByPredicate(function(obj){ return obj.foo=='bar'}) ).toBe(1);
        });

        it('should return undefined if no item was found', function(){
            expect( [{'foo': 'air'},{'foo': 'bar'},{'foo': 'cat'}].indexOfByPredicate(function(obj){ return obj.foo=='moshe'}) ).toBe(-1)
        });
    });

    describe("isIntersecting", function(){
        it("should return false on not intersecting arrays with default comparer", function(){
            expect(['a', 'b'].isIntersecting(['g', 't'])).toBeFalsy();
        });
        it("should return false custom comparer returns false", function(){
            expect(['a', 'b'].isIntersecting(['a', 'b'], function(objA, objB){return false;})).toBeFalsy();
        });
        it("should return true on intersecting arrays with default comparer", function(){
            expect(['a', 'b'].isIntersecting(['g', 't', 'a'])).toBeTruthy();
        });
        it("should return true custom comparer returns true", function(){
            expect(['a', 'b'].isIntersecting(['a', 'b'], function(objA, objB){return true;})).toBeTruthy();
        });
    });

    describe("intersect", function(){
        it("should return the intersection between 2 arrays with default comparer", function(){
            expect(['a', 'b', 'c', 'd'].intersect(['b','r','t','c'])).toBeEquivalentTo(['b', 'c']);
        });
         it("should return the intersection between 2 arrays with custom comparer", function(){
             var comp = function(objA, objB){
                return objA === objB;
             }
            expect(['a', 'b', 'c', 'd'].intersect(['b','r','t','c'], comp)).toBeEquivalentTo(['b', 'c']);
        });
        it("should return empty array if the intersection between 2 arrays is empty", function(){
            expect(['a', 'b'].intersect(['r','t']).length).toBe(0);
        })
    });
    
});