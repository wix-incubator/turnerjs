define(['lodash'], function(_) {
  'use strict';

  // CLNT-4002 - fix document media icon not showing due to storage url change

  var exports = {
    exec: function (pageJson) {
      if (pageJson.structure.type === 'Page') {
        var components = pageJson.structure.components;
        var compProps = pageJson.data.document_data;
        _.forEach(components, function (comp) {
          if (_.includes(comp.componentType, 'DocumentMedia')) {
            var dataQuery = comp.dataQuery;
            var docCompData = compProps[dataQuery.replace('#', '')];
            if (docCompData.uri.indexOf('media/') === 0) {
              docCompData.uri = docCompData.uri.replace('media/', '');
            }
          }
        });
      }
      return pageJson;
    }
  };

  return exports;
});
