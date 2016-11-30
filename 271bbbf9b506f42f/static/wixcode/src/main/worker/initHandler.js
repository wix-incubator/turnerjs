'use strict';
var bootstrapHandler = require('./bootstrapHandler');

function getControllersData(configs) {
  return Object.keys(configs).map(function(controllerId) {
    var config = configs[controllerId];
    return {
      type: config.controllerData.controllerType,
      config: config.controllerData.settings,
      connections: config.connections || [],
      $w: self.wix.getSelector(controllerId)
    };
  });
}

function registerControllerEvents(wix, controllerId, configs) { //TODO: Add context
  configs[controllerId].controllerBehaviors.forEach(function(item) {
    var fn = wix.__INTERNAL__.getEventHandler(item.behavior.params.callbackId);
    wix.emitter.on(controllerId, item.action.name, fn);
  });
}

function handleInit(messageData) {
  if (!messageData.controllers) {
    throw new Error('Init message data must include controllers property');
  }

  Object.keys(messageData.controllers)
    .forEach(function(appId) {
      var app = bootstrapHandler.getApp(appId);
      var configs = messageData.controllers[appId];
      var controllerIds = Object.keys(configs);
      var controllersReady;
      app.controllersReady = new Promise(function(resolve) {
        controllersReady = resolve;
      });
      var wix = self.wix;
      app.ready
        .then(function() {
          if (!controllerIds.length) {
            return Promise.resolve([]);
          }
          var controllers = app.module.createControllers(getControllersData(configs));
          return Promise.all(controllers);
        })
        .then(function(controllers) {
          controllersReady();
          app.controllers = controllerIds.reduce(function(acc, controllerId, index) {
            var compId = configs[controllerId].compId;
            acc[compId] = controllers[index];
            return acc;
          }, {});

          controllerIds.forEach(function(controllerId, index) {
            var controller = controllers[index];
            var $w = wix.getSelector(controllerId);
            registerControllerEvents(wix, controllerId, configs);
            $w.onReady(function() {
              if (controller.pageReady) {
                return controller.pageReady($w);
              }
              console.warn('controller.start is deprecated please export controller.pageReady method instead'); // eslint-disable-line no-console
              return controller.start($w);
            });
          });
        });
    });
}

module.exports = {
  handleInit: handleInit
};
