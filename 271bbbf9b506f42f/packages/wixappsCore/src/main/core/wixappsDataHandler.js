define(["lodash"], function (_) {
    "use strict";

    function getApplicationDataStore(siteData, packageName) {
        if (!siteData) {
            return null;
        }
        siteData.wixapps = siteData.wixapps || {};
        siteData.wixapps[packageName] = siteData.wixapps[packageName] || {};

        return siteData.wixapps[packageName];
    }

    //

    function getDescriptor (siteData, packageName) {
        var dataStore = getApplicationDataStore(siteData, packageName);
        if (dataStore.descriptor) {
            return dataStore.descriptor;
        }
        return null;
    }

    function getBlogCategoriesFromPackageData(dataStore) {
        return _.get(dataStore, 'categories', null);
    }

    function getBlogCategories (siteData) {
        var dataStore = getApplicationDataStore(siteData, 'blog');
        return getBlogCategoriesFromPackageData(dataStore);
    }

    function getBlogCategoryByName(siteData, name) {
        var categoryStore = getBlogCategories(siteData);
        var category;
        if (categoryStore) {
            category = _.find(categoryStore.categoryById, {name: name});
        }
        return (category || null);
    }

    function getDataByCompId (siteData, packageName, compId) {
        var dataStore = getApplicationDataStore(siteData, packageName);
        if (dataStore[compId]) {
            return dataStore[compId];
        }
        return null;
    }

    function setDataForCompId (siteData, packageName, compId, path) {
        var dataStore = getApplicationDataStore(siteData, packageName);
        dataStore[compId] = path;
    }

    function clearDataForCompId (siteData, packageName, compId) {
        var dataStore = getApplicationDataStore(siteData, packageName);
        delete dataStore[compId];
    }

    function getExtraDataByCompId (siteData, packageName, compId) {
        var dataStore = getApplicationDataStore(siteData, packageName);
        return dataStore[compId + '_extraData'] || null;
    }

    function getDataByPath (siteData, packageName, path) {
        if (!_.isArray(path) || path.length === 0) {
            return [];
        }

        // if the path is an array of arrays resolve each inner array as an item.
        if (_.every(path, _.isArray)) {
            return _.map(path, function (itemPath) {
                return getDataByPath(siteData, packageName, itemPath);
            });
        }

        var pathParts = _.clone(path);
        var dataStore = getApplicationDataStore(siteData, packageName);
        if (!dataStore.items) {
            return null;
        }

        var currentScope = dataStore.items;
        while (pathParts.length) {
            var prop = pathParts.shift();
            currentScope = currentScope[prop];
        }
        return currentScope;
    }

    function setDataByPath (siteData, packageName, path, value) {
        var pathParts = _.clone(path);
        var dataStore = getApplicationDataStore(siteData, packageName);
        var currentScope = dataStore.items;
        while (pathParts.length > 1) {
            var prop = pathParts.shift();
            currentScope = currentScope[prop];
        }
        currentScope[pathParts.shift()] = value;
    }

    function getSiteDataDestination(packageName) {
        return ['wixapps', packageName];
    }

    function setCompMetadata(metadata, siteData, packageName, compId) {
        var currentMetadata = getCompMetadata(siteData, packageName, compId);
        _.merge(currentMetadata, metadata);
    }

    function getCompMetadata(siteData, packageName, compId) {
        var dataStore = getApplicationDataStore(siteData, packageName);
        dataStore.metadata = dataStore.metadata || {};
        dataStore.metadata[compId] = dataStore.metadata[compId] || {};
        return dataStore.metadata[compId];
    }

    function clearCompMetadata(siteData, packageName, compId){
        var dataStore = getApplicationDataStore(siteData, packageName);
        if (dataStore.metadata && dataStore.metadata[compId]) {
            dataStore.metadata[compId] = {};
        }
    }

    function getPackageMetadata(siteData, packageName){
        var dataStore = getApplicationDataStore(siteData, packageName);
        dataStore.metadata = dataStore.metadata || {};
        dataStore.metadata[packageName + "_metadata"] = dataStore.metadata[packageName + "_metadata"] || {};
        return dataStore.metadata[packageName + "_metadata"];
    }

    function setPackageMetadata(metadata, siteData, packageName){
        var currentMetadata = getPackageMetadata(siteData, packageName);
        _.merge(currentMetadata, metadata);
    }

    /**
     * @class wixappsCore.wixappsDataHandler
     */
    return {

        getDescriptor: getDescriptor,

        getDataByCompId: getDataByCompId,

        setDataForCompId: setDataForCompId,

        clearDataForCompId: clearDataForCompId,

        getExtraDataByCompId: getExtraDataByCompId,

        getDataByPath: getDataByPath,

        setDataByPath: setDataByPath,

        getPackageData: getApplicationDataStore,

        getSiteDataDestination: getSiteDataDestination,

        setCompMetadata: setCompMetadata,

        getCompMetadata: getCompMetadata,

        getPackageMetadata: getPackageMetadata,

        setPackageMetadata: setPackageMetadata,

        clearCompMetadata: clearCompMetadata,

        getBlogCategoriesFromPackageData: getBlogCategoriesFromPackageData,

        getBlogCategories: getBlogCategories,

        getBlogCategoryByName: getBlogCategoryByName
    };
});
