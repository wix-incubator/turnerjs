define(['lodash', 'coreUtils'], function (_, coreUtils) {
    'use strict';

    var isJsonForPage = _.matchesProperty(['structure', 'type'], 'Page');
    var isSlashFormat = _.matchesProperty('format', coreUtils.siteConstants.URL_FORMATS.SLASH);

    return {
        exec: function (pageJson, pageIdsArray, requestModel, currentUrl, urlFormatModel) {
          if (isSlashFormat(urlFormatModel) && !isJsonForPage(pageJson)) {
              _.forEach(urlFormatModel.pageIdToResolvedUriSEO, function (resolved, pageId) {
                  pageJson.data.document_data[pageId].pageUriSEO = resolved.curr;
              });
          }
        }
    };
});
