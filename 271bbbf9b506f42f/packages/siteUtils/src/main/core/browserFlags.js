define([], function () {
    'use strict';

    return {
        create: function(options) {
            var os = options.os;
            var browser = options.browser;

            return {
                highlightAnchorsInMenu: !(os.ipad && browser.chrome),
                fixedSiteBackground: (!os.tablet && !os.phone) || (os.ipad && browser.safari) || ((browser.ie || browser.edge) && os.tablet),
                animateRevealScrubAction: browser.ie || browser.edge || browser.firefox,
                animateParallaxScrubAction: browser.edge,
                animateTinyMenuIcon: !(browser.safari && os.mac),
                preserve3DParallaxScrubAction: !((browser.safari && browser.version >= 9) || browser.firefox),
                fixedBackgroundColorBalata: browser.chrome,
                forceOverflowScroll: os.iphone,
                shouldDisableSmoothScrolling: browser.chrome || browser.edge
            };
        }
    };
});
