define(['react', 'santaProps/utils/propsSelectorsUtils'], function (React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var browser = applyFetch(React.PropTypes.object, function (state) {
        return state.siteData.getBrowser();
    });

    var os = applyFetch(React.PropTypes.object, function (state) {
        return state.siteData.getOs();
    });

    var isAndroidOldBrowser = applyFetch(React.PropTypes.bool, function (state) {
        return state.siteData.mobile.isAndroidOldBrowser();
    });

    var browserFlags = applyFetch(React.PropTypes.object, function (state) {
        return state.siteData.browserFlags();
    });

    return {
        browser: browser,
        os: os,
        isAndroidOldBrowser: isAndroidOldBrowser,
        browserFlags: browserFlags
    };

});
