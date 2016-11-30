define(['lodash', 'react', 'santaProps/utils/propsSelectorsUtils', 'wixUrlParser'], function (_, React, propsSelectorsUtils, wixUrlParser) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var linkRenderInfo = applyFetch(React.PropTypes.shape({
        // TODO: KADURI - split these to own object
        primaryPageId: React.PropTypes.string,
        currentUrl: React.PropTypes.object,
        currentUrlPageId: React.PropTypes.string,

        // TODO: KADURI - split these to own object
        urlFormat: React.PropTypes.string,
        mainPageId: React.PropTypes.string,
        externalBaseUrl: React.PropTypes.string,
        unicodeExternalBaseUrl: React.PropTypes.string,
        publicBaseUrl: React.PropTypes.string,
        isFeedbackEndpoint: React.PropTypes.bool,
        isViewerMode: React.PropTypes.bool,
        isWixSite: React.PropTypes.bool,
        isTemplate: React.PropTypes.bool,
        isUsingSlashUrlFormat: React.PropTypes.bool,
        isPremiumDomain: React.PropTypes.bool,
        serviceTopology: React.PropTypes.shape({
            staticDocsUrl: React.PropTypes.string,
            basePublicUrl: React.PropTypes.string,
            baseDomain: React.PropTypes.string
        }),

        // TODO: KADURI - split these to own object
        routersConfigMap: React.PropTypes.object,
        allPageIds: React.PropTypes.array,
        pagesDataItemsMap: React.PropTypes.object,
        mapFromPageUriSeoToPageId: React.PropTypes.object,
        permalinksMap: React.PropTypes.object
    }), function (state) {
        return wixUrlParser.utils.getResolvedSiteData(state.siteData);
    });


    return {
        linkRenderInfo: linkRenderInfo
    };

});
