'use strict';

var MESSAGE_TYPE = {
  BOOTSTRAP: 'wix_code_worker_bootstrap',
  LOAD: 'wix_code_worker_load',
  INIT: 'wix_code_worker_init',
  START: 'wix_code_worker_start'
};

var workerLogger = require('./workerLogger');
var bootstrapHandler = require('./worker/bootstrapHandler');
var loadHandler = require('./worker/loadHandler');
var initHandler = require('./worker/initHandler');
var startHandler = require('./worker/startHandler');

var devConsole = workerLogger.wrapConsole(console, self.postMessage);

self.onerror = function onError(message, filename, lineno, colno, e) {
  devConsole.error(e ? e : message);
};

self.onmessage = function onMessage(message) {
  if (!message.data) {
    return;
  }

  switch (message.data.type) {
    case MESSAGE_TYPE.BOOTSTRAP:
      bootstrapHandler.handleBootstrap(message.data);
      break;
    case MESSAGE_TYPE.LOAD:
      loadHandler.handleLoad(message.data);
      break;
    case MESSAGE_TYPE.INIT:
      initHandler.handleInit(message.data);
      break;
    case MESSAGE_TYPE.START:
      startHandler.handleStart(message.data);
      break;
    default:
      delegateMessageToSDK(message);
      break;
  }
};

function delegateMessageToSDK(message) {
  if (self.wix) {
    self.wix.__INTERNAL__.onMessage(message);
  }
}
