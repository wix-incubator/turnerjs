define(['lodash'], function (_) {
    'use strict';

    /**
     * @param ps Private Services
     * @param {string} packageName
     * @returns {object} the json describing the package.
     */
    function getDescriptor(ps, packageName) {
        return ps.siteAPI.getWixappsPackageDescriptor(packageName);
    }

    /**
     * @param ps Private Services
     * @param {number} applicationId
     * @returns {string}.
     */
    function getPackageName(ps, applicationId) {
        var clientSpecMapPointer = ps.pointers.general.getClientSpecMap();
        var packageNamePointer = ps.pointers.getInnerPointer(clientSpecMapPointer, [applicationId, 'packageName']);
        return ps.dal.get(packageNamePointer);
    }

    function getAppPartRole(ps, packageName, appPartName) {
        var part = getAppPartDefinition(ps, packageName, appPartName);
        return _.get(part, 'role');
    }

    function getAppPartDefinition(ps, packageName, appPartName) {
        var descriptor = getDescriptor(ps, packageName);
        var parts = _.get(descriptor, 'parts');
        return _.find(parts, {id: appPartName});
    }

    return {
        getDescriptor: getDescriptor,
        getPackageName: getPackageName,
        getAppPartRole: getAppPartRole,
        getAppPartDefinition: getAppPartDefinition
    };
});
