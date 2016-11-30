'use strict';

var scriptsValidator = require('./scriptsValidator');

var es6RuntimeUrl = 'http://static.parastorage.com/services/cloud-runtime/1.46.0/lib/es6runtime.min.js';
var _apps = {};

function loadES6Runtime() {
  self.importScripts(es6RuntimeUrl);
}

function loadSdk(parameters, debug, sdkSource) {
  var sdkUrl = debug ? sdkSource.replace('.min', '') : sdkSource;

  self.importScripts(sdkUrl);
  self.wix.__INTERNAL__.initEnv(parameters);
}

function importScriptsAsNpmModule(workerGlobalScope, url) {
  var module = workerGlobalScope.module = {};
  workerGlobalScope.module.exports = {};
  workerGlobalScope.exports = workerGlobalScope.module.exports;

  workerGlobalScope.importScripts(url);
  delete workerGlobalScope.module;

  return module.exports;
}

function loadModules(modules) {
  _apps = modules.reduce(function(acc, module) {
    var app = importScriptsAsNpmModule(self, module.url);
    acc[module.id] = {
      module: app,
      controllers: {}
    };
    return acc;
  }, {});
}

function handleBootstrap(messageData) {
  var bootstrapArgs = messageData.bootstrapArguments;
  if (!bootstrapArgs.sdkParameters) {
    throw new Error('Could not load user code: `sdkParameters` has an invalid value: ' + bootstrapArgs.sdkParameters);
  }

  loadES6Runtime();
  loadSdk(bootstrapArgs.sdkParameters, bootstrapArgs.debug, bootstrapArgs.sdkSource);

  var scripts = JSON.parse(decodeURIComponent(bootstrapArgs.applications));
  scriptsValidator.validate(scripts, ['id', 'url']);
  loadModules(scripts);
}

module.exports = {
  handleBootstrap: handleBootstrap,
  getApp: function(appId) {
    return _apps[appId];
  },
  getAllApps: function() {
    return Object.keys(_apps).map(function(appId) {
      return _apps[appId];
    });
  }
};
