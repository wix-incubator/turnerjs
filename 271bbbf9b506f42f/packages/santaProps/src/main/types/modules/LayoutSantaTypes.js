define(['react', 'santaProps/utils/propsSelectorsUtils'], function (React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var reLayoutIfPending = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.reLayoutIfPending;
    });

    var registerReLayoutPending = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.registerReLayoutPending;
    });

    return {
        reLayoutIfPending: reLayoutIfPending,
        registerReLayoutPending: registerReLayoutPending
    };

});
