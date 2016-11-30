describe('Que', function(){
    "use strict";

    testRequire().classes('bootstrap.utils.Que');

    var que;
    var outputRate = 100;
    var outputChunkSize = 1;
    var items = function(){return [1,2,3,4,5,6];};
    var initSize;
    var expectDrain = function (que){
        var size = que.size();
        while(size--){
            jasmine.Clock.tick(que.outputRate);
            expect(que.size()).toBe(size);
        }
    }

    beforeEach(function(){
        jasmine.Clock.useMock();
        que = new this.Que({
            items: items(),
            outputRate:outputRate,
            outputChunkSize: outputChunkSize,
            onprocess: getSpy('process')
        });
        initSize = que.size();
    });

    it('should start the tests with initilaized values', function(){
        expect(que.size()).toBe(items().length);
        expect(que.outputRate).toBe(outputRate);
    });

    it('should add more items to the que', function(){
        que.add(7);
        que.add(8,9,10);
        expect(que.size()).toBe(initSize + 4);
    });

    it('should outputs data in constant rate', function(){
        que.start();
        expectDrain(que);
    });

    it('should process items in chunks size of que.outputChunkSize=7', function(){
        que.outputChunkSize = 7;
        que.add(7);
        jasmine.Clock.tick(que.outputRate);
        expect(que.size()).toBe(0);
    });

    it('should process items in chunks size of que.outputChunkSize=2', function(){
        que.outputChunkSize = 2;
        que.start()
        jasmine.Clock.tick(que.outputRate);
        expect(que.size()).toBe(initSize - que.outputChunkSize);
    });

    it('should process items in chunks size of que.outputChunkSize and handle less items', function(){
        que.outputChunkSize = 15;
        que.add(7);
        jasmine.Clock.tick(que.outputRate);
        expect(que.size()).toBe(0);
    });

    it('should clear the buffer', function(){
        que.add(7,8,9,10);
        que.clear();
        expect(que.size()).toBe(0);
    });


    it('should start call the process function on each item test with chunks', function(){
        que.outputChunkSize = 3;
        que.start();
        jasmine.Clock.tick(que.outputRate);
        jasmine.Clock.tick(que.outputRate);
        expect(que.onprocess).toHaveBeenCalledXTimes(6);
    });

    it('should report status', function(){
        que.start();
        expect(que.active).toBe(true);
        expectDrain(que);
        expect(que.active).toBe(false);
    });

    it('should start call the process function on each item', function(){
        que.start();
        expectDrain(que);
        expect(que.onprocess).toHaveBeenCalledXTimes(initSize)
    });

    it('should start process the items when new item added', function(){
        que.add(7);
        expectDrain(que);
    });

    it('should stop the process when stop() is called', function(){
        que.add(7);
        que.stop();
        jasmine.Clock.tick(que.outputRate);
        expect(que.size()).toBe(initSize + 1);
    });



});