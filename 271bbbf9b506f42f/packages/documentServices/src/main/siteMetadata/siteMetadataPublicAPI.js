define(['documentServices/siteMetadata/siteMetadata'], function(siteMetaData){
    "use strict";
    return {
        methods: {
            compatibility: siteMetaData.compatibility,
            seo: {
                indexing: {
                    enable: siteMetaData.seo.indexing.enable,
                    isEnabled: siteMetaData.seo.indexing.isEnabled
                },
                title: {
                    set: siteMetaData.seo.title.set,
                    get: siteMetaData.seo.title.get,
                    validate: siteMetaData.seo.title.validate
                },
                description: {
                    set: siteMetaData.seo.description.set,
                    get: siteMetaData.seo.description.get,
                    validate: siteMetaData.seo.description.validate
                },
                keywords: {
                    set: siteMetaData.seo.keywords.set,
                    get: siteMetaData.seo.keywords.get,
                    validate: siteMetaData.seo.keywords.validate
                },
                headTags: {
                    set: siteMetaData.seo.headTags.set,
                    get: siteMetaData.seo.headTags.get,
                    validate: siteMetaData.seo.headTags.validate
                },
                redirectUrls: {
                    update: siteMetaData.seo.redirectUrls.update,
                    get: siteMetaData.seo.redirectUrls.get,
                    remove: siteMetaData.seo.redirectUrls.remove,
                    validate: siteMetaData.seo.redirectUrls.validate
                },
                ERRORS: siteMetaData.seo.ERRORS
            },
            social: {
                facebook: {
                    thumbnail: {
                        set: siteMetaData.social.facebook.setThumbnail,
                        get: siteMetaData.social.facebook.getThumbnail
                    },
                    userName: {
                        set: siteMetaData.social.facebook.setUsername,
                        get: siteMetaData.social.facebook.getUsername,
                        validate: siteMetaData.social.facebook.validateUsername
                    },
                    ERRORS: siteMetaData.social.facebook.ERRORS
                }
            },
            favicon: {
                set: siteMetaData.favicon.set,
                get: siteMetaData.favicon.get,
                ERRORS: siteMetaData.favicon.ERRORS
            },
            statistics: {
                cookies: {
                    enable: siteMetaData.statistics.cookies.enable,
                    isEnabled: siteMetaData.statistics.cookies.isEnabled
                }
            },
            premiumFeatures: {
                get: siteMetaData.premiumFeatures.getFeatures,
                set: siteMetaData.premiumFeatures.setFeatures
            },
            generalInfo: {//is this namespace redundant?
                getUserInfo: siteMetaData.generalInfo.getUserInfo,
                getPublicUrl: siteMetaData.generalInfo.getPublicUrl,
                getMetaSiteId: siteMetaData.generalInfo.getMetaSiteId,
                getSiteId: siteMetaData.generalInfo.getSiteId,
                getSiteToken: siteMetaData.generalInfo.getSiteToken,
                getSiteOriginalTemplateId: siteMetaData.generalInfo.getSiteOriginalTemplateId,
                getLanguage:  siteMetaData.generalInfo.getLanguage,
                getGeo: siteMetaData.generalInfo.getGeo,
                isFirstSave: siteMetaData.generalInfo.isFirstSave,
                isSitePublished: siteMetaData.generalInfo.isSitePublished,
                isTemplate: siteMetaData.generalInfo.isTemplate,
                showCredits: siteMetaData.showCredits,
                getDocumentType: siteMetaData.generalInfo.getDocumentType,
                isSiteFromOnBoarding: siteMetaData.generalInfo.isSiteFromOnBoarding,
                setPublicUrl: siteMetaData.generalInfo.setPublicUrl,
                urlFormat: {
                    get: siteMetaData.generalInfo.getUrlFormat,
                    is: siteMetaData.generalInfo.isUsingUrlFormat,
                    isSlash: siteMetaData.generalInfo.isUsingSlashUrlFormat,
                    list: siteMetaData.generalInfo.getPossibleUrlFormats
                }
            },
            siteName: {
                set: siteMetaData.siteName.set,
                get: siteMetaData.siteName.get,
                sanitize: siteMetaData.siteName.sanitize,
                validate: siteMetaData.siteName.validate,
                getUsed: siteMetaData.siteName.getUsedSiteNames,
                markAsUsed: siteMetaData.siteName.markSiteNameAsUsed,
                ERRORS: siteMetaData.siteName.ERRORS
            }
        }
    };
});
