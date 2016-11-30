'use strict';

var dataMocks = {

  pageLink: function(pageId) {
    return {
      "type": "PageLink",
      "pageId": pageId || 'somePageId'
    };
  },

  anchorLink: function(anchorDataId, pageId, anchorName) {
    var base = {
      type: 'AnchorLink',
      anchorName: anchorName || '',
      pageId: pageId,
      anchorDataId: anchorDataId
    };
    var knownAnchorNames = {
      SCROLL_TO_TOP: 'Top of Page',
      SCROLL_TO_BOTTOM: 'Bottom of Page'
    };
    var anchorName = knownAnchorNames[anchorDataId];
    if (anchorName) {
      base = Object.assign(base, {anchorName: anchorName, pageId: pageId || '#masterPage'});
    }
    return base;
  },

  documentLink: function(docId, name) {
    return {
      "type": "DocumentLink",
      "docId": docId,
      "name": name
    };
  },

  phoneLink: function(phoneNumber) {
    return {
      type: 'PhoneLink',
      phoneNumber: phoneNumber
    };
  },

  emailLink: function(recipient, subject, body) {
    return {
      type: 'EmailLink',
      recipient: recipient || 'x@example.com',
      subject: subject || 'This is a subject',
      body: body || ""
    };
  },

  externalLink: function(url) {
    return {
      "type": "ExternalLink",
      "url": url || "http://www.wix.com",
      "target": "_blank"
    }
  },

  dynamicPageLink: function(innerRoute, routerId, anchorDataId) {
    return {
      "type": 'DynamicPageLink',
      "routerId": routerId,
      "innerRoute": innerRoute,
      "anchorDataId": anchorDataId
    };
  }
};

var routersMocks = {

  routersConfigMap: function(routerConfigItems) {
    routerConfigItems = routerConfigItems || [];
    return routerConfigItems.reduce(function(acc, routerConfigItem){
      acc[routerConfigItem.id || (acc.keys().length + 1)] = routerConfigItem.config;
      return acc;
    }, {});
  },

  routerConfigItem: function(prefix, appId, pages, config) {
    return {
      prefix: prefix,
      appId: appId,
      config: config || {
        routerFunctionName: 'router_func_name',
        siteMapFunctionName: 'site_map_func_name'
      },
      pages: pages || {}
    };
  }
};

var appDefMocks = {
  dataBinding: function(){
    return {
      id: 'dataBinding',
      url: 'http://static.parastorage.com/services/dbsm-viewer-app/app.js'
    }
  },
  ecommerce: function(){
    return {
      id: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10',
      url: 'http://ecom.wix.com'
    }
  }
};

module.exports = {
  dataMocks: dataMocks,
  routersMocks: routersMocks,
  appDefMocks: appDefMocks
};
