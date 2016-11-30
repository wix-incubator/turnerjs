define([
    'siteUtils/utils/mobileUtils',
    'siteUtils/core/MobileDeviceAnalyzer',
    'siteUtils/core/browserDetection',
    'siteUtils/core/SiteData',
    'siteUtils/core/pageRequests',
    'siteUtils/core/componentsAnchorsMetaData',
    'siteUtils/core/layoutAnchorsUtils',
    'siteUtils/core/originalValuesMapGenerator',
    'siteUtils/core/compFactory',
    'siteUtils/core/constants',
    'siteUtils/core/fullToDisplayedJson',
    'siteUtils/core/modesUtils',
    'siteUtils/core/linkRenderer',
    'siteUtils/core/menuUtils',
    'siteUtils/core/layoutUtils',
    'siteUtils/core/positionAndSizeUtils',
    'siteUtils/core/structureDimensions',
    'siteUtils/core/socialShareHandler',
    'siteUtils/core/socialCounterDatabaseAPI',
    'siteUtils/core/componentVisibility',
    'siteUtils/core/compAlignmentUtils'
], function (mobileUtils,
             MobileDeviceAnalyzer,
             browserDetection,
             SiteData,
             pageRequests,
             componentsAnchorsMetaData,
             layoutAnchors,
             originalValuesMapGenerator,
             compFactory,
             constants,
             fullToDisplayedJson,
             modesUtils,
             linkRenderer,
             menuUtils,
             layoutUtils,
             positionAndSizeUtils,
             structureDimensions,
             socialShareHandler,
             socialCounterDatabaseAPI,
             componentVisibility,
             compAlignmentUtils) {
    'use strict';

    /**
     * @exports siteUtils
     */
    var exports = {
        mobileUtils: mobileUtils,
        MobileDeviceAnalyzer: MobileDeviceAnalyzer,
        browserDetection: browserDetection,
        SiteData: SiteData,
        pageRequests: pageRequests,
        componentsAnchorsMetaData: componentsAnchorsMetaData,
        layoutAnchors: layoutAnchors,
        originalValuesMapGenerator: originalValuesMapGenerator,
        compFactory: compFactory,
        constants: constants,
        fullToDisplayedJson: fullToDisplayedJson,
        modes: modesUtils,
        linkRenderer: linkRenderer,
        menuUtils: menuUtils,
        layout: layoutUtils,
        positionAndSize: positionAndSizeUtils,
        structureDimensions: structureDimensions,
        socialShareHandler: socialShareHandler,
        socialCounterDatabaseAPI: socialCounterDatabaseAPI,
        componentVisibility: {
            isComponentVisible: componentVisibility.isComponentVisible,
            registerPlugin: componentVisibility.registerPlugin
        },
        compAlignmentUtils: compAlignmentUtils
    };
    return exports;
});
