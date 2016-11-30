define(['utils', 'documentServices/structure/structure', 'documentServices/page/page', 'documentServices/siteMetadata/generalInfo', 'documentServices/hooks/componentHooks/utils/socialComp'], function (utils, structure, page, generalInfo, socialComp) {
    'use strict';

    return function (ps, compPointer, compDefinition, optionalCustomId, oldToNewIdMap, containerPointer) {
        var urlFormats = generalInfo.getPossibleUrlFormats();
        var forceMainPage = structure.isShowOnAllPages(ps, containerPointer);
        var hashBangUrl = page.getSocialUrl(ps, urlFormats.HASH_BANG, forceMainPage);

        if (generalInfo.isUsingUrlFormat(ps, urlFormats.HASH_BANG)) {
            socialComp.updateUrlFormatIfNeeded(ps, compPointer, 'WFacebookLike', urlFormats.HASH_BANG);
        } else {
            utils.socialAPI.facebook(hashBangUrl, function (likes) {
                var urlFormat = likes > 0 ? urlFormats.HASH_BANG : urlFormats.SLASH;
                socialComp.updateUrlFormatIfNeeded(ps, compPointer, 'WFacebookLike', urlFormat);
            });
        }
    };
});
