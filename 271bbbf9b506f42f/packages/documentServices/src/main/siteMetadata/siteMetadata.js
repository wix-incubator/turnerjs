define([
    'lodash',
    'documentServices/siteMetadata/dataManipulation',
    'documentServices/siteMetadata/seo',
    'documentServices/siteMetadata/social',
    'documentServices/siteMetadata/favicon',
    'documentServices/siteMetadata/premiumFeatures',
    'documentServices/siteMetadata/generalInfo',
    'documentServices/siteMetadata/siteName',
    'documentServices/siteMetadata/statistics',
    'documentServices/siteMetadata/compatibility'], function (_, dataManipulation, seo, social, favicon, premiumFeatures, generalInfo, siteName, statistics, compatibility) {
    'use strict';

    return {
        PROPERTY_NAMES: dataManipulation.PROPERTY_NAMES,
        getProperty: dataManipulation.getProperty,
        setProperty: dataManipulation.setProperty,
        getRevertibleMetaDataInfo: dataManipulation.getRevertibleMetaDataInfo,
        getNonRevertibleMetaDataInfo: dataManipulation.getNonRevertibleMetaDataInfo,

        seo: seo,
        social: social,
        favicon: favicon,
        premiumFeatures: premiumFeatures,
        generalInfo: generalInfo,
        siteName: siteName,
        statistics: statistics,
        compatibility: compatibility,

        showCredits: function (ps) {
            ps.siteAPI.getSiteAspect("siteMembers").showCreditsDialog();
        }
    };
});
