define(['lodash', 'react', 'santaProps/utils/propsSelectorsUtils'], function (_, React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var cookie = applyFetch(React.PropTypes.string, function (state) {
        return _.get(state.siteData, 'requestModel.cookie');
    });

    return {
        cookie: cookie
    };

});
