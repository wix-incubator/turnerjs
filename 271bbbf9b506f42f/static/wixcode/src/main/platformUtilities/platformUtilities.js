'use strict';

var linkUtils = require('./linkUtils');

module.exports = {
  getApi: function(routersMap, appStorage) {
    return {
      links: {
        toUrl: linkUtils.convertLinkObjectToUrl.bind(linkUtils, routersMap)
      },
      storage: appStorage
    };
  }
};
