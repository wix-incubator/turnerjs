define(['react', 'santaProps/utils/propsSelectorsUtils'], function (React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var staticMediaUrl = applyFetch(React.PropTypes.string, function (state) {
        return state.siteData.getStaticMediaUrl();
    });

    var staticHTMLComponentUrl = applyFetch(React.PropTypes.string, function (state) {
        return state.siteData.getStaticHTMLComponentUrl();
    });

    var getMediaFullStaticUrl = applyFetch(React.PropTypes.func, function (state) {
        return state.siteData.getMediaFullStaticUrl;  // already bound to siteData
    });

    var serviceTopology = applyFetch(React.PropTypes.object, function (state) {
        return state.siteData.serviceTopology;
    });

    return {
        staticMediaUrl: staticMediaUrl,
        getMediaFullStaticUrl: getMediaFullStaticUrl,
        serviceTopology: serviceTopology,
        getStaticHTMLComponentUrl: staticHTMLComponentUrl,
        staticHTMLComponentUrl: staticHTMLComponentUrl
    };

});
