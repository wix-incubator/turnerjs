define([], function() {
    'use strict';
    function throttledForEach(queue, processElement, chunkSize, timeout) {
        function processChunk() {
            queue.splice(0, chunkSize).forEach(processElement);
            if (queue.length) {
                setTimeout(processChunk, timeout);
            }
        }

        processChunk();
    }

    return {
        throttledForEach: throttledForEach
    };
});