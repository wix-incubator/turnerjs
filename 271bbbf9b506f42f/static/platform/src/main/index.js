'use strict';

var Worker = require('./worker');
self.worker = new Worker();

function onMessageFromViewer(message) {
  self.worker.postMessage(message.data);
}

function onMessageFromWorker(message) {
  self.parent.postMessage(message.data, '*');
}

self.addEventListener('message', onMessageFromViewer);
self.worker.addEventListener('message', onMessageFromWorker);
