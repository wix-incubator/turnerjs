'use strict';

var wixCodeLogLevel = require('../../static/wixCodeLogLevel');
var wixCodeMessageTypes = require('../../static/wixCodeMessageTypes');

var consoleMethodsToWrap = {
  info: wixCodeLogLevel.INFO,
  warn: wixCodeLogLevel.WARN,
  error: wixCodeLogLevel.ERROR,
  log: wixCodeLogLevel.LOG
};

function _toArray(args) {
  return Array.prototype.map.call(args, function(v) {
    if (v instanceof Error && v.stack && typeof v.stack === 'string') {
      return v.stack;
    }
    var vt = typeof v;
    if (vt === 'string' || vt === 'boolean' || vt === 'number' || v === null || v === undefined) {
      return v;
    }
    if (Array.isArray(v)) {
      return _toArray(v);
    }
    if (vt === 'function') {
      return v.toString();
    }
    try {
      return JSON.stringify(v);
    } catch (e) {
      return v.toString();
    }
  });
}

function _createLogMessage(level, args) {
  return {
    intent: wixCodeMessageTypes.WIX_CODE_INTENT,
    type: wixCodeMessageTypes.CONSOLE_MESSAGE,
    data: {
      logLevel: level,
      args: args
    }
  };
}

function _wrapConsoleMethod(consoleInstance, method, sendCallback) {
  var original = consoleInstance[method];

  return function wrapper() {

    sendCallback(_createLogMessage(consoleMethodsToWrap[method], _toArray(arguments)));
    original.apply(consoleInstance, arguments);
  };
}

function wrapConsole(consoleInstance, sendCallback) {
  for (var method in consoleMethodsToWrap) {
    if (consoleMethodsToWrap.hasOwnProperty(method)) {
      consoleInstance[method] = _wrapConsoleMethod(consoleInstance, method, sendCallback);
    }
  }
  return consoleInstance;
}

function createErrorLogMessage() {
  //all arguments sent to this function will be used as arguments in the created message
  return _createLogMessage(wixCodeLogLevel.ERROR, _toArray(arguments));
}

module.exports = {
  wrapConsole: wrapConsole,
  createErrorLogMessage: createErrorLogMessage
};
