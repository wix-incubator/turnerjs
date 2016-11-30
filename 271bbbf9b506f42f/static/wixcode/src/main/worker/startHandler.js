'use strict';

var RemoteModelInterface = require('../../../static/RMI/RemoteModelInterface');
var bootstrapHandler = require('./bootstrapHandler');

function createRemoteModelInterface(context) {
  var RMI = new RemoteModelInterface(context);
  bootstrapHandler.getAllApps().forEach(function(app) {
    Object.keys(app.controllers).forEach(function(controllerId) {
      RMI.setPublicAPI(controllerId, app.controllers[controllerId].exports);
    });
  });

  return RMI;
}

function initSdk(messageData, RMI) {
  self.wix.__INTERNAL__.initModel(RMI, messageData.siteInfo, messageData.id);
  self.$w = self.wix.getSelector(messageData.id);
  self.ga = self.wix.ga;
}

function handleStart(messageData) {
  if (!messageData.id) {
    throw new Error('Could not init sdk: `context.id` is missing');
  }
  if (!messageData.context) {
    throw new Error('Could not init sdk: `context.context` is missing');
  }

  var allReady = bootstrapHandler.getAllApps().map(function(app) {
    return app.controllersReady;
  });

  Promise.all(allReady)
    .then(function() {
      var RMI = createRemoteModelInterface(messageData.context);
      initSdk(messageData, RMI);
      self.wix.__INTERNAL__.triggerOnReady(function() {
        self.postMessage({
          intent: 'WIX_CODE',
          type: 'widget_ready',
          widgetId: messageData.id
        });
      });
    });
}

module.exports = {
  handleStart: handleStart
};
