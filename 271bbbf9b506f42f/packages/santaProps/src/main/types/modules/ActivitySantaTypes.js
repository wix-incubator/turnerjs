define(['lodash', 'react', 'santaProps/utils/propsSelectorsUtils'], function (_, React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var activityInfo = applyFetch(React.PropTypes.shape({
        currentUrl: React.PropTypes.object,
        hubSecurityToken: React.PropTypes.string,
        metaSiteId: React.PropTypes.string,
        svSession: React.PropTypes.string
    }), function (state) {
        return {
            currentUrl: state.siteData.currentUrl,
            hubSecurityToken: state.siteData.getHubSecurityToken(),
            metaSiteId: state.siteData.getMetaSiteId(),
            svSession: state.siteData.getSvSession()
        };
    });


    return {
        activityInfo: activityInfo
    };

});
