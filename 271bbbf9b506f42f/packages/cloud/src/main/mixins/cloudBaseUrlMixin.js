define([], function(){
    'use strict';

    function getCloudBaseDomain(topology) {
        var cloudBaseDomain = topology.wixCloudBaseDomain;

        if (cloudBaseDomain.substr(-1) !== '/') {
            cloudBaseDomain += '/';
        }

        return cloudBaseDomain;
    }

    /**
     * @class cloud.mixins.cloudBaseUrl
     */
    return {
        getBaseUrl: function () {
            var appData = this.getAppData();
            var extensionId = appData.extensionId;
            var signedInstance = appData.instance;
            var applicationId = appData.applicationId;
            var componentUrl = this.props.compData.componentUrl;
            var extensionVersion = this.props.siteData.rendererModel.cloudVersions[applicationId];
            var viewMode = this.getViewMode();
            var topology = this.props.siteData.serviceTopology;

            var cloudBaseDomain = getCloudBaseDomain(topology);

            // Note: unlike TPA, we put the `viewMode` parameter also as a path parameter,
            // so it will be part of the base url used inside the site extension
            return 'http://' + extensionId + '.' + cloudBaseDomain + signedInstance + '/' + extensionVersion + '/' + viewMode + '/' + componentUrl;
        }
    };
});
