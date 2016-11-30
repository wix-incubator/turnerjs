define(['lodash', 'coreUtils', 'experiment'], function(_, coreUtils, experiment){
    'use strict';

    function initOldRemarketingPixel(accountId){
        if (!isValidAccountId(accountId)) {
            return;
        }

        var _fbq = window._fbq || (window._fbq = []);
        if (!_fbq.loaded) {
            var fbds = window.document.createElement('script');
            fbds.async = true;
            fbds.src = '//connect.facebook.net/en_US/fbds.js';
            var s = window.document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(fbds, s);
            _fbq.loaded = true;
        }
        _fbq.push(['addPixelId', accountId[0]]);
        window._fbq.push(['track', 'PixelInitialized', {}]);

    }

    /*
     Implements https://developers.facebook.com/docs/marketing-api/facebook-pixel/v2.5

     Original:

     !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
     n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
     n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
     t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
     document,'script','//connect.facebook.net/en_US/fbevents.js');
     // Insert Your Facebook Pixel ID below.
     fbq('init', '<FB_PIXEL_ID>');
     fbq('track', 'PageView');

     */

    function initNewRemarketingPixel(accountId) {
        var fbqGlobal, scriptElem, firstScriptElem;
        if (window.fbq || !isValidAccountId(accountId)) {
            return;
        }

        fbqGlobal = window.fbq = function() {
            if (fbqGlobal.callMethod) {
                fbqGlobal.callMethod.apply(fbqGlobal, arguments);
            } else {
                fbqGlobal.queue.push(arguments);
            }
        };

        if (!window._fbq) {
            window._fbq = fbqGlobal;
        }

        fbqGlobal.push = fbqGlobal;
        fbqGlobal.loaded = true;
        fbqGlobal.version = '2.0';
        fbqGlobal.queue = [];
        scriptElem = window.document.createElement('script');
        scriptElem.async = true;
        scriptElem.src = '//connect.facebook.net/en_US/fbevents.js';
        firstScriptElem = window.document.getElementsByTagName('script')[0];
        firstScriptElem.parentNode.insertBefore(scriptElem, firstScriptElem);

        window.fbq('init', accountId[0]);
        window.fbq('track', 'PageView');
    }

    function isValidAccountId(accountId) {
        return Number(accountId[0]) && _.isString(accountId[0]) && accountId.length === 1;
    }

    return {
        initRemarketingPixel: function(siteData, accountId) {
            if (siteData.isUsingUrlFormat(coreUtils.siteConstants.URL_FORMATS.SLASH) && experiment.isOpen('sv_NewFacebookConversionPixel')) {
                initNewRemarketingPixel(accountId);
            } else {
                initOldRemarketingPixel(accountId);
            }
        }
    };
});
