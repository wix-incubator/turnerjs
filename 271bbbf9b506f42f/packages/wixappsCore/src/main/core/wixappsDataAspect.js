define(["lodash", "core", "wixappsCore/core/wixappsDataHandler"], function (_, /** core */ core, /** wixappsCore.wixappsDataHandler */ wixappsDataHandler) {
    "use strict";

    /**
     * @type {core.siteAspectsRegistry}
     */
    var aspectsRegistry = core.siteAspectsRegistry;

    /**
     * @typedef {ClassicsDataAspect} wixappsClassics.ClassicsDataAspect
     *
     * @property {core.SiteAspectsSiteAPI} aspectSiteApi
     * @property {core.SiteAPI} siteApi
     */

    /**
     * @param {core.SiteAspectsSiteAPI} aspectSiteApi
     * @constructor
     */
    function DataAspect(aspectSiteApi) {
        this.aspectSiteApi = aspectSiteApi;
    }

    DataAspect.prototype = {

        getDescriptor: function (packageName) {
            return wixappsDataHandler.getDescriptor(this.aspectSiteApi.getSiteData(), packageName);
        },

        getDataByCompId: function (packageName, compId) {
            return wixappsDataHandler.getDataByCompId(this.aspectSiteApi.getSiteData(), packageName, compId);
        },

        getExtraDataByCompId: function (packageName, compId) {
            return wixappsDataHandler.getExtraDataByCompId(this.aspectSiteApi.getSiteData(), packageName, compId);
        },

        getDataByPath: function (packageName, path) {
            return wixappsDataHandler.getDataByPath(this.aspectSiteApi.getSiteData(), packageName, path);
        },

        setDataByPath: function (packageName, path, value) {
            wixappsDataHandler.setDataByPath(this.aspectSiteApi.getSiteData(), packageName, path, value);
            this.aspectSiteApi.forceUpdate();
        },

        setBatchedData: function (packageName, batch, silent) {
            if (batch.length === 0) {
                return;
            }
            var siteData = this.aspectSiteApi.getSiteData();
            _.forEach(batch, function (dataToSet) {
                wixappsDataHandler.setDataByPath(siteData, packageName, dataToSet.path, dataToSet.value);
            });
            if (!silent) {
                this.aspectSiteApi.forceUpdate();
            }
        },

        /**
         * Gets the metadata of the comp iff compId is set, otherwise the metadata of the package.
         * @param {string} packageName
         * @param {string?} compId
         * @returns {object} The metadata of the comp iff compId is set, otherwise the metadata of the package.
         */
        getMetadata: function (packageName, compId) {
            if (!compId) {
                return wixappsDataHandler.getPackageMetadata(this.aspectSiteApi.getSiteData(), packageName);
            }
            return wixappsDataHandler.getCompMetadata(this.aspectSiteApi.getSiteData(), packageName, compId);
        },

        /**
         * Sets the metadata on the component iff compId is set, otherwise sets the package metadata.
         * @param {object} metadata
         * @param {string} packageName
         * @param {string?} compId
         */
        setMetadata: function (metadata, packageName, compId) {
            wixappsDataHandler.setPackageMetadata(metadata, this.aspectSiteApi.getSiteData(), packageName, compId);
            this.aspectSiteApi.forceUpdate();
        }

    };

    aspectsRegistry.registerSiteAspect("wixappsDataAspect", DataAspect);

});
