'use strict';
/**
 * Created by avim on 9/7/16.
 */
const packages = require('./packages');
const siteDataFromModel = require('../common/siteDataFromModel');

module.exports = (santaRequire) => {
    packages.forEach(santaRequire);
    const core = santaRequire('core');
    const coreUtils = santaRequire('coreUtils');
    return function renderSiteModel(siteModel, callback, url, ajaxHandler) {
        var fullSiteData = siteDataFromModel(santaRequire, siteModel, url, ajaxHandler);
        fullSiteData.updateScreenSize({width: 980, height: 800});
        var siteDataWrapper = core.SiteDataAPI.createSiteDataAPIAndDal(fullSiteData, coreUtils.ajaxLibrary.ajax);
        var displayedSiteData = siteDataWrapper.siteData;
        var siteDataAPI = siteDataWrapper.siteDataAPI;
        var viewerPrivateServices = {
            pointers: siteDataWrapper.pointers,
            displayedDAL: siteDataWrapper.displayedDal,
            siteDataAPI: siteDataAPI
        };
        core.renderer.renderSite(displayedSiteData, viewerPrivateServices, {}, callback);
    };

};
