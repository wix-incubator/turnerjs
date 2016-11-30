define(['react', 'santaProps/utils/propsSelectorsUtils'], function (React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var cannotHideIframeWithinRoundedCorners = applyFetch(React.PropTypes.bool, function (state) {
        return state.siteData.mobile.cannotHideIframeWithinRoundedCorners();
    });

    var isZoomed = applyFetch(React.PropTypes.bool, function (state) {
        return state.siteData.mobile.isZoomed();
    });

    return {
        cannotHideIframeWithinRoundedCorners: cannotHideIframeWithinRoundedCorners,
        isZoomed:isZoomed
    };

});
