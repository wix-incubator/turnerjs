define(['wixappsClassics/blog/utils', 'wixappsClassics/blog/blogSettings'], function (blogUtils, blogSettings) {
    'use strict';
    function translateToBlogLocale(translationKey) {
        var settings = blogSettings.get(this.siteData);
        var locale = settings.locale;

        return blogUtils.translate(locale, translationKey);
    }

    return {
        translateToBlogLocale: translateToBlogLocale
    };
});
