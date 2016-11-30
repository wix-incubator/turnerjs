define(['utils', 'documentServices/structure/structure', 'documentServices/page/page', 'documentServices/siteMetadata/generalInfo', 'documentServices/hooks/componentHooks/utils/socialComp'], function (utils, structure, page, generalInfo, socialComp) {
    'use strict';

    return function (ps, compPointer) {
        var urlFormats = generalInfo.getPossibleUrlFormats();
        var hashBangUrl = page.getSocialUrl(ps, urlFormats.HASH_BANG, true);

        if (generalInfo.isUsingUrlFormat(ps, urlFormats.HASH_BANG)) {
            socialComp.updateUrlFormatIfNeeded(ps, compPointer, 'VKShareButton', urlFormats.HASH_BANG);
        } else {
            utils.socialAPI.vk(hashBangUrl, function (count) {
                var urlFormat = count > 0 ? urlFormats.HASH_BANG : urlFormats.SLASH;
                socialComp.updateUrlFormatIfNeeded(ps, compPointer, 'VKShareButton', urlFormat);
            });
        }
    };
});
