define(['lodash', 'coreUtils', 'experiment'], function(_, coreUtils, experiment) {
    'use strict';

  /**
   * Gets an inverted map of pageUriSEO to pageId for all pages
   * @param siteModel
   * @returns {Object}
   */
    function getMapFromPageUriSeoToPageId(siteModel) {
        if (_.has(siteModel, ['publicModel', 'pageList'])) {
            return _(siteModel.publicModel.pageList.pages)
                .indexBy(function getPageUriSEO(pageData) {
                    return _.get(siteModel, ['urlFormatModel', 'pageIdToResolvedUriSEO', pageData.pageId, 'curr']) ||
                        _.get(pageData, 'pageUriSEO') ||
                        coreUtils.siteConstants.DEFAULT_PAGE_URI_SEO;
                })
                .mapValues('pageId')
                .value();
        }
        return {};
    }

    function convertToObject(arr) {
        return _.zipObject(arr, _.times(arr.length, _.constant(true)));
    }

  /**
   * Changes siteModel to make sure it has a urlFormatModel
   * @param siteModel
   */
  function ensureUrlFormatModel(siteModel) {
        var urlFormatModel = siteModel.urlFormatModel || {};
        if (experiment.isOpen('urlFormat')) {
            urlFormatModel.format = coreUtils.siteConstants.URL_FORMATS.SLASH;
        } else {
            urlFormatModel.format = urlFormatModel.format || coreUtils.siteConstants.URL_FORMATS.HASH_BANG;
        }
        urlFormatModel.forbiddenPageUriSEOs = convertToObject(urlFormatModel.forbiddenPageUriSEOs || []);
        urlFormatModel.pageIdToResolvedUriSEO = urlFormatModel.pageIdToResolvedUriSEO || {};
        siteModel.urlFormatModel = urlFormatModel;
    }

    function pageUrlsFixer(pageList, pageJsonFileName) {
            return _.map(pageList.topology, function(URLObject) {
                return URLObject.baseUrl + URLObject.parts.replace('{filename}', pageJsonFileName);
            });
    }

    function getPageURLs(pageList, pageID) {
        var page = _.find(pageList.pages, {pageId: pageID});
        if (page) {
            return pageUrlsFixer(pageList, page.pageJsonFileName);
        }
    }

    function getMasterPageURLs(pageList) {
        return pageUrlsFixer(pageList, pageList.masterPageJsonFileName);
    }

    return {
        ensureUrlFormatModel: ensureUrlFormatModel,
        getMapFromPageUriSeoToPageId: getMapFromPageUriSeoToPageId,
        getPageURLs: getPageURLs,
        getMasterPageURLs: getMasterPageURLs
    };
});
