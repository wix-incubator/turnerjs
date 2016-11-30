define(['lodash', 'coreUtils/core/throttleUtils'], function(_, throttleUtils) {
    'use strict';

    describe('throttleUtils', function() {
        describe('_throttledForEach', function() {
            var throttledForEach = throttleUtils.throttledForEach;

            beforeEach(function() {
                jasmine.clock().install();
            });

            afterEach(function() {
                jasmine.clock().uninstall();
            });

            it('should invoke all the callbacks', function() {
                var NUM_CALLBACKS = 10, CHUNK_INTERVAL = 2;

                [1, 3].forEach(function(chunkSize) {
                    var ar = _.range(NUM_CALLBACKS);
                    var clonedAr = ar.slice(0);
                    var result = [];
                    var callback = function(x) {
                        result.push(x);
                    };

                    throttledForEach(ar, callback, chunkSize, CHUNK_INTERVAL);

                    var totalChunks = Math.ceil(NUM_CALLBACKS / chunkSize);
                    var waitTime = totalChunks * CHUNK_INTERVAL + 100;
                    jasmine.clock().tick(waitTime);

                    expect(JSON.stringify(result)).toEqual(JSON.stringify(clonedAr));
                });
            });

            it('should invoke callbacks in chunks according to chunkSize', function() {
                var NUM_CALLBACKS = 7, CHUNK_INTERVAL = 20;

                var chunkSize = 3;
                var ar = _.range(NUM_CALLBACKS);
                var result = [];
                var chunkNum = 1;
                var callback = function(x) {
                    result.push({chunk: chunkNum, param: x});
                    setTimeout(function() {
                        chunkNum++;
                    }, 0);
                };

                throttledForEach(ar, callback, chunkSize, CHUNK_INTERVAL);

                var totalChunks = Math.ceil(NUM_CALLBACKS / chunkSize);
                var waitTime = totalChunks * CHUNK_INTERVAL + 100;
                jasmine.clock().tick(waitTime);

                var expectedResult = [
                    {chunk: 1, param: 0},
                    {chunk: 1, param: 1},
                    {chunk: 1, param: 2},
                    {chunk: 4, param: 3},
                    {chunk: 4, param: 4},
                    {chunk: 4, param: 5},
                    {chunk: 7, param: 6}
                ];

                expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedResult));
            });

            it('should wait the specified interval between chunks', function() {
                var NUM_CALLBACKS = 7,
                    CHUNK_INTERVAL = 50,
                    CHUNK_SIZE = 3;

                var ar = _.range(NUM_CALLBACKS);
                var index = 0;

                var callback = function() {
                    index++;
                };

                throttledForEach(ar, callback, CHUNK_SIZE, CHUNK_INTERVAL);

                var quotient = Math.floor(NUM_CALLBACKS / CHUNK_SIZE);
                for (var i = 1; i <= quotient; ++i) {
                    expect(index).toBe(CHUNK_SIZE * i);
                    jasmine.clock().tick(CHUNK_INTERVAL);
                }

                expect(index).toBe(NUM_CALLBACKS);
            });
        });
    });
});
