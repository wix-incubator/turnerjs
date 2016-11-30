/**
 * Created by avim on 31/10/2016.
 */
/**
 * Created by avim on 30/10/2016.
 */
'use strict';

const _ = require('lodash');

module.exports = (santaRequire, siteModel, currentUrl, ajaxHandler) => {
    const utils = santaRequire('utils');

    santaRequire.initializeContext(siteModel, ajaxHandler);
    siteModel.forceMobileView = _.get(siteModel, 'publicModel.deviceInfo.deviceType', 'Desktop') !== 'Desktop';
    siteModel.requestModel = siteModel.requestModel || {
        userAgent: 'None',
        cookie: '',
        storage: {}
    };

    if (siteModel.publicModel) {
        siteModel.currentUrl = currentUrl || siteModel.currentUrl || siteModel.publicModel.externalBaseUrl;
        if (_.isString(siteModel.currentUrl)) {
            siteModel.currentUrl = utils.urlUtils.parseUrl(siteModel.currentUrl);
        }
    }

    const siteAsJson = siteModel.siteAsJson || siteModel.partialSiteAsJson;
    if (siteAsJson) {
        const pagesData = _(siteAsJson.pages)
            .mapKeys((page) => page.structure.id)
            .assign( {masterPage: siteAsJson.masterPage})
            .value();
        siteModel.pagesData = pagesData;
    }
    if (siteModel.pagesData) {
        var pageIds = _(siteModel.pagesData).keys().pull('masterPage').value();
        siteModel.pagesData = _.mapValues(siteModel.pagesData, function (data) {
            return utils.dataFixer.fix(data, pageIds.slice(), siteModel.requestModel, siteModel.currentUrl, siteModel.urlFormatModel);
        });
    }


    const fullSiteData = new utils.SiteData(siteModel);
    fullSiteData.updateScreenSize({width: 980, height: 800});

    if (siteModel.currentUrl) {
        var pageInfo = utils.wixUrlParser.parseUrl(fullSiteData, siteModel.currentUrl);
        fullSiteData.setRootNavigationInfo(pageInfo);
    }
    return fullSiteData;
};
