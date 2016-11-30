define(['react', 'santaProps/utils/propsSelectorsUtils'], function (React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var cookie = applyFetch(React.PropTypes.string, function (state) {
        return state.siteData.requestModel.cookie;
    });

    return {
        cookie: cookie
    };

});
