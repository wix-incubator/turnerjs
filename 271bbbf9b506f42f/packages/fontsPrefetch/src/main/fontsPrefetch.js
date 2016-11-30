define([], function () {
    'use strict';

    if (typeof window !== 'undefined' && window.rendererModel) {
        // preconnect to googleapis so that actual connection is faster
        var pre = window.document.createElement('link');
        pre.setAttribute('rel', 'preconnect');
        pre.setAttribute('href', '//fonts.googleapis.com');
        window.document.head.appendChild(pre);

        // Prefetch font CSS files
        // By marking them as media="none" their download is made non-blocking
        // (At least for WebKit / Blink browsers)
        // (WixThemeReact may remove this attribute)
        requirejs(['lodash', 'fonts'], function (_, fonts) {
            function enableLink() {
                this.removeAttribute('media');
            }

            var fontsUrls = fonts.fontUtils.getCssUrls(window.rendererModel.siteInfo.documentType, window.serviceTopology);
            _.forEach(fontsUrls, function (url, lang) {
                var link = window.document.createElement('link');
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('href', url);
                link.setAttribute('media', 'none');
                link.setAttribute('id', 'font_' + lang);
                link.addEventListener('load', enableLink, false);
                window.document.head.appendChild(link);
            });
        });
    }
});
