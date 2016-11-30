/**
 * User: omri
 * Date: 2/14/11
 * Time: 6:14 PM
 **/

describe('Queue', function() {
    beforeEach(function(){
        this.Queue;
        W.Classes.getClass('bootstrap.utils.Queue', function(Class){
            this.Queue = Class;
        }.bind(this));
    });

	it('add should add a value to a new queue key', function() {
		var myQueue = new this.Queue();
		myQueue.add('test', 'bla');
		var que = myQueue.getQueue('test');
		expect(que).toBeInstanceOf(Array);
		expect(que[0]).toBe('bla');
	});

	it('add should add a value to an existing queue key', function() {
		var myQueue = new this.Queue();
		myQueue.add('test', 'bla');
		myQueue.add('test', 'bla2');
		var que = myQueue.getQueue('test');
		expect(que.length).toBe(2);
		expect(que[1]).toBe('bla2');
	});

	it('addUnique should add a value to a new queue key', function() {
		var myQueue = new this.Queue();
		myQueue.addUnique('test', 'bla');
		var que = myQueue.getQueue('test');
		expect(que).toBeInstanceOf(Array);
		expect(que[0]).toBe('bla');
	});

	it('addUnique should add a value to an existing queue key', function() {
		var myQueue = new this.Queue();
		myQueue.add('test', 'bla');
		myQueue.addUnique('test', 'bla2');
		var que = myQueue.getQueue('test');
		expect(que.length).toBe(2);
		expect(que[1]).toBe('bla2');
	});

	it('addUnique should not add an existing value to an existing queue key', function() {
		var myQueue = new this.Queue();
        var obj = {label:"testLabel", value:{a:"a", b:"b"}}
		myQueue.add('test', obj);
		myQueue.addUnique('test', obj);
		var que = myQueue.getQueue('test');
		expect(que.length).toBe(1);
	});

	it('remove should remove an existing key-value pair', function(){
		var myQueue = new this.Queue();
		myQueue.add('test', 'bla');
		myQueue.remove('test', 'bla');
		expect(myQueue.getQueue('test').length).toBe(0);
	});

    describe('popQueue', function()
    {
        var myQueue;

        beforeEach(function()
        {
            myQueue = new this.Queue()
            myQueue.add('test', 'bla');
        });

        it('should return the queue associated with the supplied key', function()
        {
            var q = myQueue.popQueue('test');
            expect(q[0]).toBe('bla');
        });

        it('should call removeKey with the key supplied to it', function()
        {
            spyOn(myQueue, 'removeKey');
            myQueue.popQueue('test');

            expect(myQueue.removeKey).toHaveBeenCalledWith('test');
        });
    });

    describe('removeKey', function()
    {
        var myQueue;

        beforeEach(function()
        {
            myQueue = new this.Queue();
            myQueue.add('test_0', 'bla_0');
        });

        it('should remove the item mapped to the provided key', function()
        {
            expect(myQueue.map['test_0']).toBeEquivalentTo(['bla_0']);
            myQueue.removeKey('test_0');
            expect(myQueue.map['test_0']).not.toBeDefined();
        });
    });

    describe('removeAll', function()
    {
        var myQueue;

        beforeEach(function()
        {
            myQueue = new this.Queue();
            myQueue.add('test_0', 'bla_0');
            myQueue.add('test_1', 'bla_1');
        });

        it('should remove the item mapped to the provided key', function()
        {
            expect(myQueue.map['test_0']).toBeEquivalentTo(['bla_0']);
            expect(myQueue.map['test_1']).toBeEquivalentTo(['bla_1']);
            myQueue.removeAll();
            expect(myQueue.map['test_0']).not.toBeDefined();
            expect(myQueue.map['test_1']).not.toBeDefined();
        });
    });

    describe('getQueue', function()
    {
        var myQueue;

        beforeEach(function()
        {
            myQueue = new this.Queue();
            myQueue.add('test_0', 'bla_0');
        });

        it('should return the queue associated with the provided key', function()
        {
            expect(myQueue.getQueue('test_0')).toBeEquivalentTo(['bla_0']);
        });

        it('should return an empty array if no queue is found to be associated with the provided key', function()
        {
            expect(myQueue.getQueue('test_1')).toBeEquivalentTo([]);
        });
    });

    describe('hasQueue', function()
    {
        var myQueue;

        beforeEach(function()
        {
            myQueue = new this.Queue();
            myQueue.add('test_0', 'bla_0');
        });

        it('should return true if any queue exists', function()
        {
            expect(myQueue.hasQueue()).toBe(true);
        });

        it('should return false otherwise', function()
        {
            myQueue.removeAll();
            expect(myQueue.hasQueue()).toBe(false);
        });
    });

});