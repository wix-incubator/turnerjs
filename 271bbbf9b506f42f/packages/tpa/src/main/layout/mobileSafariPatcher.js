define([], function () {
    'use strict';

    return {
        /*
         * Patches width of TPA iframes on mobile Safari. Solves known issue in Safari where
         * width: 100% is not calculated right.
         */
        patchWidth: function (id, patchers, measureMap, flatStructure, siteData) {
            var isIOSSafari = siteData.os.ios && siteData.browser.safari;

            if (isIOSSafari && measureMap.custom[id].hasIframe) {
                patchers.css(id + 'iframe', {
                    width: 1,
                    minWidth: '100%'
                });
            }
        }
    };
});
