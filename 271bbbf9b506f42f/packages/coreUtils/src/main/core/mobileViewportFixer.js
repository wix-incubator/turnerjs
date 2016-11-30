/**
 * Created by moranw on 6/15/14.
 */
define(['experiment'], function (experiment) {
    'use strict';

    return {
        fixViewportTag: function(siteData){
            if (typeof window === 'undefined') {
                return;
            }
            var document = window.document;
            var viewport = document && document.getElementById("wixMobileViewport");
            var screen = window.screen;
            if (!viewport || !screen) {
                return;
            }

            var siteWidth = siteData.getSiteWidth();
            var mobile = siteData.isMobileView();

            if (!experiment.isOpen('sv_alwaysEnableMobileZoom')) {
                viewport.setAttribute('content', 'width=' + siteWidth + ', user-scalable=' + (mobile ? 'no' : 'yes'));
                return;
            }

            if (document.head.querySelector('#wixViewportZoom')) {
                return;
            }

            viewport.setAttribute('content', 'width=device-width, minimum-scale=1.0');
            var landscapeZoom = Math.max(screen.width, screen.height) / siteWidth;
            var portraitZoom = Math.min(screen.width, screen.height) / siteWidth;

            var style =
                '@media (orientation: portrait) { body { zoom: ' + portraitZoom + ' } }' +
                '@media (orientation: landscape) { body { zoom: ' + landscapeZoom + ' } }';

            var tag = document.createElement('style');
            tag.setAttribute('id', 'wixViewportZoom');
            tag.innerHTML = style;
            document.head.appendChild(tag);
        }
    };
});
