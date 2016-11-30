var _ = require('./lodashUtils');

var DATA = 'data',
  DESIGN = 'design',
  STATE = 'state',
  TYPE = 'type',
  PROPS = 'props',
  PARENT = 'parent',
  EVENTS = 'events',
  LAYOUT = 'layout',
  BEHAVIOR = 'behavior',
  PUBLIC_API = 'publicAPI',
  IS_DISPLAYED = 'isDisplayed',
  ID = 'id';

function RemoteModelInterface(modelJson, onUpdateCallback) {
  this._model = modelJson || {components: {}, connections: {}, pages: {}, eventHandlers: {}, EventTypes: {}};
  this._onUpdateCallback = onUpdateCallback;
}

RemoteModelInterface.prototype.addComponent = function(compId, compDescriptor) {
  var comp = {};
  comp[PARENT] = compDescriptor[PARENT];
  comp[STATE] = compDescriptor[STATE] || {};
  comp[TYPE] = compDescriptor[TYPE];
  comp[DATA] = compDescriptor[DATA] || {};
  comp[DESIGN] = compDescriptor[DESIGN] || {};
  comp[PROPS] = compDescriptor[PROPS] || {};
  comp[LAYOUT] = compDescriptor[LAYOUT] || {};
  comp[EVENTS] = compDescriptor[EVENTS] || [];
  comp[IS_DISPLAYED] = compDescriptor[IS_DISPLAYED] || false;
  comp[ID] = compDescriptor[ID];
  this._model.components[compId] = comp;
};

RemoteModelInterface.prototype.addPagesData = function(pagesData) {
  this._model.pages.pagesData = pagesData.pagesData;
  this._model.pages.currentPageId = pagesData.currentPageId;
  this._model.pages.baseUrl = pagesData.baseUrl;
};

RemoteModelInterface.prototype.addConnections = function(connectionsModel) {
  this._model.connections = connectionsModel;
};

RemoteModelInterface.prototype.addEventTypes = function(EventTypes) {
  this._model.EventTypes = EventTypes;
};

//Getters

RemoteModelInterface.prototype.getComp = function (compId) {
  return _.get(this._model.components, compId);
};

RemoteModelInterface.prototype.getState = function(compId) {
  return _.get(this._model.components, [compId, STATE]);
};

RemoteModelInterface.prototype.getData = function(compId) {
  return _.get(this._model.components, [compId, DATA]);
};

RemoteModelInterface.prototype.getDesign = function(compId) {
  return _.get(this._model.components, [compId, DESIGN]);
};

RemoteModelInterface.prototype.getType = function(compId) {
  return _.get(this._model.components, [compId, TYPE]);
};

RemoteModelInterface.prototype.getProps = function(compId) {
  return _.get(this._model.components, [compId, PROPS]);
};

RemoteModelInterface.prototype.getEvents = function(compId) {
  return _.get(this._model.components, [compId, EVENTS]);
};

RemoteModelInterface.prototype.getLayout = function(compId) {
  return _.get(this._model.components, [compId, LAYOUT]);
};

RemoteModelInterface.prototype.getId = function(compId) {
  return _.get(this._model.components, [compId, ID]);
};

RemoteModelInterface.prototype.getEventTypes = function() {
  return _.clone(this._model.EventTypes);
};

RemoteModelInterface.prototype.getPublicAPI = function(compId) {
  return _.get(this._model.components, [compId, PUBLIC_API]);
};

RemoteModelInterface.prototype.getCallbackById = function(callbackId) {
  return this._model.eventHandlers[callbackId];
};

RemoteModelInterface.prototype.getParent = function(compId) {
  return _.get(this._model.components, [compId, PARENT]);
};

RemoteModelInterface.prototype.getChildren = function(parentId) {
  var compIds = getCompIds(this._model);
  return compIds.filter(function (compId) {
    return (_.get(this._model.components, [compId, PARENT]) === parentId);
  }, this);
};

//Setters

RemoteModelInterface.prototype.setData = function(compId, partialData) {
  set(this._model, compId, DATA, partialData, this._onUpdateCallback);
};

RemoteModelInterface.prototype.setDesign = function(compId, partialData) {
  set(this._model, compId, DESIGN, partialData, this._onUpdateCallback);
};

RemoteModelInterface.prototype.setProps = function(compId, partialProps, cb) {
  set(this._model, compId, PROPS, partialProps, function (compId, property, partial) {
    this._onUpdateCallback.call(this, compId, property, partial, cb);
  }.bind(this));
};

RemoteModelInterface.prototype.setLayout = function(compId, partialLayout) {
  set(this._model, compId, LAYOUT, partialLayout, this._onUpdateCallback);
};

RemoteModelInterface.prototype.setPublicAPI = function(compId, api) {
  var comp = _.get(this._model.components, compId);
  if (comp) {
    comp[PUBLIC_API] = api;
  }
};

function executeBehavior(behaviorType, behaviorName, params, compId, callback) {
  var behavior = {
    type: behaviorType,
    name: behaviorName,
    targetId: compId,
    params: params
  };

  if (this._onUpdateCallback) {
    this._onUpdateCallback(compId, BEHAVIOR, behavior, callback);
  }
}

RemoteModelInterface.prototype.executeCompBehavior = function (compId, behaviorName, params, callback) {
  executeBehavior.call(this, 'comp', behaviorName, params, compId, callback);
};

RemoteModelInterface.prototype.executeAnimation = function (compId, animationName, params, callback) {
  executeBehavior.call(this, 'animation', animationName, params, compId, callback);
};

RemoteModelInterface.prototype.setUpdateCallback = function(onUpdateCallback) {
  this._onUpdateCallback = onUpdateCallback;
};

RemoteModelInterface.prototype.registerEvent = function(contextId, compId, eventType, callback) {
  var callbackId;

  if (_.isFunction(callback)) {
    callbackId = guid();
    this._model.eventHandlers[callbackId] = callback;
  } else {
    callbackId = callback;
  }

  var eventDescriptor = {
    contextId: contextId,
    eventType: eventType,
    callbackId: callbackId
  };

  var component = _.get(this._model, ['components', compId]);
  if (component !== undefined) {
    component.events.push(eventDescriptor);
    if (_.isFunction(this._onUpdateCallback)) {
      this._onUpdateCallback(compId, 'registerEvent', eventDescriptor);
    }
  }
};

RemoteModelInterface.prototype.unregisterAll = function (compId, eventType) {
  var component = _.get(this._model, ['components', compId]);
  if (component !== undefined) {
    var filteredDescriptors = [];
    component.events.forEach(function (descriptor) {
      if (descriptor.eventType === eventType) {
        delete this._model.eventHandlers[descriptor.callbackId];
      } else {
        filteredDescriptors.push(descriptor);
      }
    }, this);
    component.events = filteredDescriptors;
    if (_.isFunction(this._onUpdateCallback)) {
      this._onUpdateCallback(compId, 'unregisterAll', { eventType: eventType });
    }
  }
};

RemoteModelInterface.prototype.toJson = function() {
  return this._model;
};

//General

RemoteModelInterface.prototype.getScopedRMI = function(controllerId) {
  var scopedRMI = new this.constructor(this._model, this._onUpdateCallback);
  scopedRMI.getCompIdsFromRole = scopedRMI.getCompIdsFromRole.bind(scopedRMI, controllerId);
  scopedRMI.getCompIdsFromType = scopedRMI.getCompIdsFromType.bind(scopedRMI, controllerId);
  scopedRMI.getConfig = scopedRMI.getConfig.bind(scopedRMI, controllerId);
  return scopedRMI;
};

RemoteModelInterface.prototype.getCompIdsFromType = function(controllerId, type) {
  var compIds = getCompIds(this._model);
  var comps = [];
  compIds.forEach(function(compId) {
    var compType = this.getType(compId);
    if (compType === type) {
      comps.push(compId);
    }
  }, this);
  return comps;
};

RemoteModelInterface.prototype.getCompIdsFromRole = function(controllerId, role) {
  var connectionConfigs = _.get(this._model.connections, [controllerId, role]);
  return connectionConfigs ? Object.keys(connectionConfigs) : [];
};

RemoteModelInterface.prototype.getConfig = function(controllerId, compId, role) {
  var connectionConfigs = _.get(this._model.connections, [controllerId, role]);
  return connectionConfigs ? connectionConfigs[compId] : {};
};

RemoteModelInterface.prototype.getCompsFromType = function (type) {
  var comps = [];
  var compIds = getCompIds(this._model);
  compIds.forEach(function(compId) {
    var compType = this.getType(compId);
    if (compType === type) {
      comps.push(this.getComp(compId));
    }
  }, this);
  return comps;
};

RemoteModelInterface.prototype.updateModel = function (modelUpdates) {
  for (var compId in modelUpdates) {
    var comp = this.getComp(compId);
    var compUpdates = modelUpdates[compId];
    if (comp) {
      for (var keyToUpdate in compUpdates) {
        _.assign(comp[keyToUpdate], compUpdates[keyToUpdate]);
      }
    }
  }
};


//Utility

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function set(model, compId, property, partial, onUpdateCallback) {
  var comp = _.get(model, ['components', compId]);
  if (!comp) {
    return;
  }
  comp[property] = _.assign(comp[property], partial);
  if (onUpdateCallback) {
    onUpdateCallback(compId, property, partial);
  }
}

function getCompIds(model) {
  return Object.keys(model.components);
}

module.exports = RemoteModelInterface;
