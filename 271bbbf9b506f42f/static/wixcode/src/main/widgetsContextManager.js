'use strict';

var MessageProxy = require('./messageProxy');
var Worker = require('./worker');
var window = require('./window');
var document = require('./document');
var urlUtils = require('./urlUtils');
var wixCodeUrlUtils = require('./wixCodeUrlUtils');

var WIX_CODE_INTENT = 'WIX_CODE';
var WIX_CODE_RESPONSE = 'WIX_CODE_RESPONSE';
var IFRAME_LOADED_MESSAGE_TYPE = 'wix_code_iframe_loaded'; //TODO: extract to message type constants

function isWixCodeMessage(messageData) {
  return messageData && messageData.intent === WIX_CODE_INTENT;
}

function isWixCodeResponseMessage(messageData) {
  return messageData && messageData.intent === WIX_CODE_RESPONSE;
}

function getUserCodeBaseUrl() {
  var l = window.location;
  return l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '');
}

function isStorageEnabled() {
  function testIsEnabled() {
    try {
      window.localStorage.setItem('', '');
      window.localStorage.removeItem('');
      return true;
    } catch (exception) {
      return false;
    }
  }
  return testIsEnabled();
}

function getBrowserStorage() {
  var browserStorage = isStorageEnabled() ? {
    local: window.localStorage,
    session: window.sessionStorage
  } : {
    session: {}
  };//this should be replaced once sessionStorage fallback is implemented
  return JSON.stringify(browserStorage);
}

function getSdkParameters() {
  var parameters = urlUtils.pickQueryParameters('viewMode', 'instance', 'locale');
  parameters.storage = getBrowserStorage();
  Object.assign(parameters, { referrer: document.referrer });
  return parameters;
}

function withWixCodeValidation(cb, thisArg) {
  return function(message) {
    if (!isWixCodeMessage(message.data)) {
      return;
    }

    cb.apply(thisArg, arguments);
  };
}

function onInitMessage(initMessage) {
  var messageData = initMessage.data;
  if (!messageData.controllers) {
    throw new Error('Init message must contain controllers property');
  }

  Object.keys(messageData.controllers)
    .map(function(contextId) {
      return {
        type: 'wix_code_worker_init',
        id: contextId,
        controllers: messageData.controllers[contextId]
      };
    })
    .forEach(function(message) {
      var worker = this._workers[message.id];
      if (!worker) {
        throw new Error('Context id ' + message.id + ' is not loaded');
      }
      sendMessageToWorker(worker, message);
    }, this);
}

function onStartMessage(startMessage) {
  function createInitWidgetMessage(id) {
    return {
      type: 'wix_code_worker_start',
      context: startMessage.data.contexts[id],
      siteInfo: startMessage.data.siteInfo,
      id: id
    };
  }

  if (!startMessage.data.contexts) {
    throw new Error('Start message must contain contexts property');
  }
  Object.keys(startMessage.data.contexts)
    .map(createInitWidgetMessage)
    .forEach(function(message) {
      var worker = this._workers[message.id];
      if (!worker) {
        throw new Error('Context id ' + message.id + ' is not loaded');
      }
      sendMessageToWorker(worker, message);
    }, this);
}

function onLoadMessage(loadMessage) {
  var rootIds = loadMessage.data.rootIds;

  if (!rootIds) {
    throw new Error('Load message must contain rootIds property');
  }

  var applications = loadMessage.data.widgets.filter(function(widget) {
    return widget.type !== 'Page' && widget.type !== 'Popup' && widget.type !== 'masterPage';
  });

  var elementoryArguments = wixCodeUrlUtils.getElementoryArguments(loadMessage.data.widgets, this._userCodeBaseUrl);

  rootIds.forEach(function(rootId) {
    var wixCodeScripts = wixCodeUrlUtils.getUserCodeUrlsDetails(loadMessage.data.widgets, rootId);

    var workerLoadMessageData = {
      type: 'wix_code_worker_load',
      elementoryArguments: elementoryArguments,
      wixCode: wixCodeScripts,
      applications: applications,
      routersMap: loadMessage.data.routersMap
    };

    var worker = promoteStandbyWorker.call(this, rootId);

    sendMessageToWorker(worker, workerLoadMessageData);
  }, this);
}

function onStopMessage(stopMessage) {
  stopMessage.data.widgetIds.forEach(terminateWorker.bind(this));
}

function onMessage(message) {
  if (!isWixCodeMessage(message.data) && !isWixCodeResponseMessage(message.data)) {
    return;
  }

  var worker = this._workers[message.data.contextId];
  sendMessageToWorker(worker, message.data);
}

function promoteStandbyWorker(workerId) {
  var promotedWorker = this._standbyWorker;
  this._workers[workerId] = promotedWorker;
  this._standbyWorker = null;
  createStandbyWorker.call(this);

  return promotedWorker;
}

function terminateWorker(workerId) {
  var worker = this._workers[workerId];
  if (worker) {
    worker.terminate();
    delete this._workers[workerId];
  }
}

function sendMessageToWorker(worker, messageData) {
  if (worker) {
    worker.postMessage(messageData);
  }
}

function createStandbyWorker() {
  var worker = new Worker();
  worker.onmessage = function _onWorkerMessage(message) {
    var messageContent = message.data;
    this._messageProxy.getMessageHandler(messageContent.intent).handle(messageContent, messageContent.type);
  }.bind(this);

  this._standbyWorker = worker;

  var workerBootstrapMessageData = {
    type: 'wix_code_worker_bootstrap',
    bootstrapArguments: {
      sdkParameters: getSdkParameters(),
      debug: window.__WIX_CODE_DEBUG__,
      sdkSource: urlUtils.getQueryParameter('sdkSource'),
      applications: urlUtils.getQueryParameter('applications')
    }
  };
  sendMessageToWorker(worker, workerBootstrapMessageData);
}

function WidgetsContextManager() {
  this._initialized = false;
  this._workers = {};
  this._messageProxy = null;
}

WidgetsContextManager.prototype.initialize = function initialize() {
  if (this._initialized) {
    throw new Error('WidgetsContextManager was already initialized');
  }

  this._userCodeBaseUrl = getUserCodeBaseUrl();
  this._compId = urlUtils.getQueryParameter('compId');
  this._messageProxy = new MessageProxy({
    onLoadMessageCallback: withWixCodeValidation(onLoadMessage, this),
    onInitMessageCallback: withWixCodeValidation(onInitMessage, this),
    onStartMessageCallback: withWixCodeValidation(onStartMessage, this),
    onStopMessageCallback: withWixCodeValidation(onStopMessage, this),
    onMessageCallback: onMessage.bind(this)
  });

  this._messageProxy.initialize();

  createStandbyWorker.call(this);

  var iframeLoadedMessage = {
    intent: WIX_CODE_INTENT,
    type: IFRAME_LOADED_MESSAGE_TYPE,
    compId: this._compId
  };

  this._messageProxy.sendMessageToViewer(iframeLoadedMessage);
  //this._messageProxy.getMessageHandler(iframeLoadedMessage.intent).handle(iframeLoadedMessage);
  this._initialized = true;
};

module.exports = WidgetsContextManager;
