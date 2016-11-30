define(['lodash', 'coreUtils'], function (_, coreUtils) {
  'use strict';

  function CompsMigrationHelper(compsMigrationMap) {
    this.migrationMap = compsMigrationMap;
  }

  CompsMigrationHelper.prototype.getComponentData = function(pageJson, comp) {
    return comp.dataQuery && pageJson.data.document_data[comp.dataQuery.replace('#', '')];
  };

  CompsMigrationHelper.prototype.setComponentData = function(pageJson, comp, dataItem, cache) {
    var newId = comp.dataQuery || _.get(cache, [comp.id, 'dataQuery']) ||
    coreUtils.guidUtils.getUniqueId('dataItem', '-');
    newId = newId.replace('#', '');
    comp.dataQuery = '#' + newId;
    dataItem.id = newId;
    pageJson.data.document_data[newId] = dataItem;
    _.set(cache, [comp.id, 'dataQuery'], newId);
  };

  CompsMigrationHelper.prototype.deleteComponentData = function(pageJson, comp) {
    var dataQuery = comp.dataQuery && comp.dataQuery.replace('#', '');
    if (dataQuery && pageJson.data.document_data[dataQuery]) {
      delete pageJson.data.document_data[dataQuery];
    }
  };


  CompsMigrationHelper.prototype.getComponentDesignData = function(pageJson, comp) {
    return comp.designQuery && pageJson.data.design_data[comp.designQuery.replace('#', '')];
  };

  CompsMigrationHelper.prototype.deleteComponentDesignData = function(pageJson, comp) {
      var designQuery = comp.designQuery && comp.designQuery.replace('#', '');
      if (designQuery && pageJson.data.design_data[designQuery]) {
          delete pageJson.data.design_data[designQuery];
      }
  };


    CompsMigrationHelper.prototype.getComponentProperties = function(pageJson, comp) {
        return comp.propertyQuery && pageJson.data.component_properties[comp.propertyQuery.replace('#', '')];
    };
  CompsMigrationHelper.prototype.deleteComponentProperties = function(pageJson, comp) {
      var propertyQuery = comp.propertyQuery && comp.propertyQuery.replace('#', '');
      if (propertyQuery && pageJson.data.component_properties[propertyQuery]) {
          delete pageJson.data.component_properties[propertyQuery];
      }
      if (comp.propertyQuery) {
          delete comp.propertyQuery;
      }
  };

  CompsMigrationHelper.prototype.setComponentDesignData = function(pageJson, comp, designDataItem, cache) {
    var newId = comp.designQuery || _.get(cache, [comp.id, 'designQuery']) ||
    coreUtils.guidUtils.getUniqueId('dataItem', '-');
    newId = newId.replace('#', '');
    comp.designQuery = '#' + newId;
    designDataItem.id = newId;
    if (_.isObject(designDataItem.background)) {
        var bg = _.clone(designDataItem.background);
        bg.id = (bg.id || coreUtils.guidUtils.getUniqueId('dataItem', '-')).replace('#', '');
        designDataItem.background = '#' + bg.id;
        pageJson.data.design_data[bg.id] = bg;
    }
    pageJson.data.design_data[newId] = designDataItem;
    _.set(cache, [comp.id, 'designQuery'], comp.designQuery);
  };

  CompsMigrationHelper.prototype.setComponentProperties = function(pageJson, comp, properties, cache) {
      var newId = comp.propertyQuery || _.get(cache, [comp.id, 'propertyQuery']) ||
          coreUtils.guidUtils.getUniqueId('propItem', '-');
      newId = newId.replace('#', '');
      comp.propertyQuery = newId;
      properties.id = newId;
      pageJson.data.component_properties[newId] = properties;
      _.set(cache, [comp.id, 'propertyQuery'], newId);
  };

  CompsMigrationHelper.prototype.migrateComps = function(pageJson, cache, mobileView, comps) {
    _.forEach(comps, function (comp) {
      if (this.migrationMap[comp.componentType]) {
        this.migrationMap[comp.componentType].call(this, pageJson, cache, mobileView, comp);
      }
      this.migrateComps(pageJson, cache, mobileView, comp.components);
    }, this);
  };

  CompsMigrationHelper.prototype.migratePage = function(pageJson) {
    var structureData = pageJson.structure;
    if (structureData) {
      var cache = {
      };

      var desktopComps = structureData.components || structureData.children;
      var mobileComps = structureData.mobileComponents;

      if (desktopComps) {
        this.migrateComps(pageJson, cache, false, desktopComps);
      }
      if (mobileComps) {
        this.migrateComps(pageJson, cache, true, mobileComps);
      }
    }
  };

  return CompsMigrationHelper;
});
