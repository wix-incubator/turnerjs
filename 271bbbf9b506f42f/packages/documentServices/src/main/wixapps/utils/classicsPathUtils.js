define(['lodash'], function (_) {
    'use strict';

    /**
     * @param {string} packageName
     * @returns {!Array.<string>}
     */
    function getPackagePath(packageName) {
        return ['wixapps', packageName];
    }

    /**
     * @param {string} packageName
     * @returns {!Array.<string>}
     */
    function getPackageDescriptorPath(packageName) {
        return getPackagePath(packageName).concat(['descriptor']);
    }

    function getPackageMetaDataPath(packageName) {
        return _.compact(getPackagePath(packageName).concat(['metadata']));
    }

    function getBlogTagNamesPath() {
        return ['wixapps', 'blog', 'tagNames'];
    }

    function getCategoriesPath(packageName) {
        return _.compact(getPackagePath(packageName).concat(['categories', 'categories']));
    }

    function getAppPartDataPath(packageName, compId) {
        return getPackagePath(packageName).concat([compId]);
    }

    function getAppPartExtraDataPath(packageName, compId) {
        return getPackagePath(packageName).concat([compId + '_extraData']);
    }

    return {
        getPackagePath: getPackagePath,
        getPackageDescriptorPath: getPackageDescriptorPath,
        getPackageMetaDataPath: getPackageMetaDataPath,
        getBlogTagNamesPath: getBlogTagNamesPath,
        getCategoriesPath: getCategoriesPath,
        getAppPartDataPath: getAppPartDataPath,
        getAppPartExtraDataPath: getAppPartExtraDataPath
    };
});
