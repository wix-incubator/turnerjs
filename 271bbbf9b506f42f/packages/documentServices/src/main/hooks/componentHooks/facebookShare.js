define(['utils', 'documentServices/structure/structure', 'documentServices/page/page', 'documentServices/siteMetadata/generalInfo', 'documentServices/dataModel/dataModel', 'documentServices/hooks/componentHooks/utils/socialComp'], function (utils, structure, page, generalInfo, dataModel, socialComp) {
    'use strict';

    return function (ps, compPointer) {
        var urlFormats = generalInfo.getPossibleUrlFormats();
        var compData = dataModel.getDataItem(ps, compPointer);
        var forceMainPage = compData.urlChoice && compData.urlChoice.toLowerCase() === 'site';
        var hashBangUrl = page.getSocialUrl(ps, urlFormats.HASH_BANG, forceMainPage);

        if (generalInfo.isUsingUrlFormat(ps, urlFormats.HASH_BANG)) {
            socialComp.updateUrlFormatIfNeeded(ps, compPointer, 'FacebookShareButton', urlFormats.HASH_BANG);
        } else {
            utils.socialAPI.facebook(hashBangUrl, function (shares) {
                var urlFormat = shares > 0 ? urlFormats.HASH_BANG : urlFormats.SLASH;
                socialComp.updateUrlFormatIfNeeded(ps, compPointer, 'FacebookShareButton', urlFormat);
            });
        }
    };
});
