'use strict';

var INIT_MESSAGE = 'init_widgets';
var LOAD_MESSAGE = 'load_widgets';
var START_MESSAGE = 'start_widgets';
var STOP_WIDGETS_MESSAGE = 'stop_widgets';

function noop() {
}

function handleBrowserAPI(windowObject, msg, msgType) {
  if (msgType === 'setToStorage') {
    var msgData = msg.data;
    windowObject[msgData.type].setItem(msgData.key, msgData.value);
    return;
  }
  throw new Error('msgType ' + msgType + ' is not supported');
}

function MessageProxy(options) {
  this._onLoadMessageCallback = options.onLoadMessageCallback || noop;
  this._onStartMessageCallback = options.onStartMessageCallback || noop;
  this._onInitMessageCallback = options.onInitMessageCallback || noop;
  this._onStopMessageCallback = options.onStopMessageCallback || noop;
  this._onMessageCallback = options.onMessageCallback || noop;
  this._window = options.window || window;
}

MessageProxy.prototype.initialize = function initialize() {
  if (this._initialized) {
    throw new Error('MessageProxy was already initialized');
  }

  this._window.addEventListener('message', function onMessageFromViewer(message) {
    switch (message.data.type) {
      case LOAD_MESSAGE:
        this._onLoadMessageCallback(message);
        break;
      case START_MESSAGE:
        this._onStartMessageCallback(message);
        break;
      case INIT_MESSAGE:
        this._onInitMessageCallback(message);
        break;
      case STOP_WIDGETS_MESSAGE:
        this._onStopMessageCallback(message);
        break;
      default:
        this._onMessageCallback(message);
    }
  }.bind(this));

  this._initialized = true;
};

MessageProxy.prototype.sendMessageToViewer = function sendMessageToViewer(messageData) {
  this._window.parent.postMessage(messageData, '*');
};

MessageProxy.prototype.getMessageHandler = function getMessageHandler(msgIntent) {
  var msgHandler = msgIntent === 'BROWSER_API' ? handleBrowserAPI.bind(null, this._window) : this.sendMessageToViewer.bind(this);
  return {
    handle: msgHandler
  };
};

module.exports = MessageProxy;
