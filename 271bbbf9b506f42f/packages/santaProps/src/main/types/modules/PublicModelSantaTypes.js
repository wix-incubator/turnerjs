define(['lodash', 'react', 'santaProps/utils/propsSelectorsUtils'], function (_, React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var externalBaseUrl = applyFetch(React.PropTypes.string, function (state) {
        return _.get(state.siteData, 'publicModel.externalBaseUrl');
    });

    return {
        externalBaseUrl: externalBaseUrl
    };

});
