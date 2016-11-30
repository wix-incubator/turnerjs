define(['lodash', 'coreUtils'], function(_, coreUtils) {
    'use strict';

    var IS_BROWSER = typeof window !== 'undefined';
    var IS_PREVIEW = IS_BROWSER && window.queryUtil && window.queryUtil.isParameterTrue('isEdited');

    var defaultOptions = {
        biUrl: 'http://frog.wixpress.com',
        adapter: '',
        params: {}
    };

    var isBot = (function () {
        if (!IS_BROWSER) {
            return true;
        }
        var re = [/bot/i, /Google Web Preview/i, /^Mozilla\/4\.0$/];
        var ua = window.navigator.userAgent;
        for (var i = 0; i < re.length; ++i) {
            if (re[i].test(ua)) {
                return true;
            }
        }
        return false;
    }());

    var sendBIReport = isBot ?
        function () {
        } : function (host, adapter, queryString) {
            var pixel = new window.Image();
            if (host.substr(-1) !== '/') {
                host += '/';
            }
            pixel.src = host + adapter + "?" + queryString;
        };

    function getCurrentTimeStamp(siteData, options) {
        // TODO: get mainLoaded value through DS and not through parent
        var start = IS_PREVIEW && options.adapter === 'editor' ? window.parent.mainLoaded : 0;
        start = start || siteData.wixBiSession.initialTimestamp || siteData.wixBiSession.mainLoaded;
        return _.now() - start;
    }

    function report(siteData, options) {
        var queryString;
        _.defaults(options, defaultOptions);
        if (typeof options.queryString === 'string') {
            queryString = options.queryString;
        } else {
            queryString = coreUtils.urlUtils.toQueryString(_.defaults(options.params, {
                ts: getCurrentTimeStamp(siteData, options)
            }));
        }
        sendBIReport(options.biUrl, options.adapter, queryString);
    }

    return {
        report: report
    };

});
