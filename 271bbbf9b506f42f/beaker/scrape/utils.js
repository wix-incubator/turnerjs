var _ = require('lodash');

module.exports = {

    getMasterPageURLS: function (wixSiteModel) {
        'use strict';
        var masterPageJSON = wixSiteModel.publicModel.pageList.masterPageJsonFileName;
        var topologyObjects = wixSiteModel.publicModel.pageList.topology;
        return _.map(topologyObjects, function(topologyObject){
            return topologyObject.baseUrl + topologyObject.parts.replace('{filename}', masterPageJSON);
        });
    },

    getPageURLS: function (pageInfo, wixSiteModel) {
        'use strict';
        var pageURL = pageInfo.pageJsonFileName;
        var topologyObjects = wixSiteModel.publicModel.pageList.topology;
        return _.map(topologyObjects, function(topologyObject){
            return topologyObject.baseUrl + topologyObject.parts.replace('{filename}', pageURL);
        });
    }
};
