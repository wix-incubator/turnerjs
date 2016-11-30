define(['react', 'santaProps/utils/propsSelectorsUtils', 'utils'], function (React, propsSelectorsUtils, utils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var siteMenuWithRender = applyFetch(React.PropTypes.object, function (state, props) {
        return utils.menuUtils.getSiteMenuWithRender(state.siteData, false, props.rootNavigationInfo);
    });


    return {
        siteMenuWithRender: siteMenuWithRender
    };

});
