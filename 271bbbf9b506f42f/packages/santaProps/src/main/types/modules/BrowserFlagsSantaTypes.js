define(['react', 'santaProps/utils/propsSelectorsUtils'], function (React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var fixedBackgroundColorBalata = applyFetch(React.PropTypes.bool, function (state) {
        return state.siteData.browserFlags().fixedBackgroundColorBalata;
    });

    return {
        fixedBackgroundColorBalata: fixedBackgroundColorBalata
    };

});
