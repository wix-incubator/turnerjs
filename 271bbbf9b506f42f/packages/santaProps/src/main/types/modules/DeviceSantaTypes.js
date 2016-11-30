define(['react', 'santaProps/utils/propsSelectorsUtils'], function (React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var isTouchDevice = applyFetch(React.PropTypes.bool, function (state) {
        return state.siteData.isTouchDevice();
    });

    var devicePixelRatio = applyFetch(React.PropTypes.number, function (state) {
        return state.siteData.mobile.getDevicePixelRatio();
    });

    var isMobileDevice = applyFetch(React.PropTypes.bool, function (state) {
        return state.siteData.isMobileDevice();
    });

    var isTabletDevice = applyFetch(React.PropTypes.bool, function (state) {
        return state.siteData.isTabletDevice();
    });

    var isDesktopDevice = applyFetch(React.PropTypes.bool, function (state) {
        return !state.siteData.isTouchDevice();
    });

    return {
        devicePixelRatio: devicePixelRatio,
        isTouchDevice: isTouchDevice,
        isTabletDevice: isTabletDevice,
        isMobileDevice: isMobileDevice,
        isDesktopDevice: isDesktopDevice
    };

});
