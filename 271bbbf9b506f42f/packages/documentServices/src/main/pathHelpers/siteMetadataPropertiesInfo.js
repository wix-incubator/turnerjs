define([], function () {
    'use strict';

    /**
     * @exports documentServices/siteMetadata/propertiesInfo
     */
    return {
        GEO: {path: ['rendererModel', 'geo'], revertible: false},
        LANGUAGE_CODE: {path: ['rendererModel', 'languageCode'], revertible: true},
        SITE_META_DATA: {path: ['rendererModel', 'siteMetaData'], revertible: true},
        SE_INDEXABLE: {path: ['documentServicesModel', 'metaSiteData', 'indexable'], revertible: true},
        SOCIAL_THUMBNAIL: {path: ['documentServicesModel', 'metaSiteData', 'thumbnail'], revertible: true},
        FAVICON: {path: ['documentServicesModel', 'metaSiteData', 'favicon'], revertible: true},
        SUPPRESS_COOKIES: {path: ['documentServicesModel', 'metaSiteData', 'suppressTrackingCookies'], revertible: true},
        META_TAGS: {path: ['documentServicesModel', 'metaSiteData', 'metaTags'], revertible: true},
        EXTERNAL_URI_MAPPINGS: {path: ['documentServicesModel', 'metaSiteData', 'externalUriMappings'], revertible: true},
        USE_ONBOARDING: {path: ['documentServicesModel', 'metaSiteData', 'useOnboarding'], revertible: true, optional: true},
        ORIGINAL_TEMPLATE_ID: {path: ['documentServicesModel', 'originalTemplateId'], revertible: false},
        CUSTOM_HEAD_TAGS: {path: ['documentServicesModel', 'customHeadTags'], revertible: false},
        SEO_TITLE: {path: ['documentServicesModel', 'metaSiteData', 'title'], revertible: true},
        SITE_ID: {path: ['rendererModel', 'siteInfo', 'siteId'], revertible: true},
        META_SITE_ID: {path: ['rendererModel', 'metaSiteId'], revertible: true},
        USER_ID: {path: ['rendererModel', 'userId'], revertible: true},
        EDITOR_SESSION_ID: {path: ['documentServicesModel', 'editorSessionId'], revertible: false}, //todo Shimi_Liderman 10/28/14 15:07 not revertible right?
        META_SITE_DATA: {path: ['documentServicesModel', 'metaSiteData'], revertible: false},
        USER_INFO: {path: ['documentServicesModel', 'userInfo'], revertible: false},
        SITE_NAME: {path: ['documentServicesModel', 'siteName'], revertible: false},
        SITE_REVISION: {path: ['documentServicesModel', 'revision'], revertible: false}, //todo Shimi_Liderman 10/28/14 15:37 what about ['editorMode', 'siteHeader', 'revision'] ? AND IS THIS REVERTIBLE?
        SITE_VERSION: {path: ['documentServicesModel', 'version'], revertible: false}, //todo Shimi_Liderman 10/28/14 15:37 what about ['editorMode', 'siteHeader', 'revision'] ? AND IS THIS REVERTIBLE?
        NEVER_SAVED: {path: ['documentServicesModel', 'neverSaved'], revertible: false},
        IS_PUBLISHED: {path: ['documentServicesModel', 'isPublished'], revertible: false},
        PUBLIC_URL: {path: ['documentServicesModel', 'publicUrl'], revertible: false},
        USED_META_SITE_NAMES: {path: ['documentServicesModel', 'usedMetaSiteNames'], revertible: false},
        CLIENT_SPEC_MAP: {path: ['rendererModel', 'clientSpecMap'], revertible: false},
        APPLICATION_TYPE: {path: ['rendererModel', 'siteInfo', 'applicationType'], revertible: false},
        DOCUMENT_TYPE: {path: ['rendererModel', 'siteInfo', 'documentType'], revertible: false},
        PREMIUM_FEATURES: {path: ['rendererModel', 'premiumFeatures'], revertible: false},
        PENDING_APPS: {path: ['documentServicesModel', 'pendingApps'], revertible: false},
        PASSWORD_PROTECTED_PAGES: {path: ['rendererModel', 'passwordProtectedPages'], revertible: false},
        SESSION_PAGES_TO_HASH_PASSWORD: {path: ['rendererModel', 'pageToHashedPassword'], revertible: false},
        PERMISSIONS: {path: ['documentServicesModel', 'permissionsInfo', 'permissions'], revertible: false},
        IS_OWNER: {path: ['documentServicesModel', 'permissionsInfo', 'isOwner'], revertible: false},
        SITE_TOKEN: {path: ['documentServicesModel', 'permissionsInfo', 'siteToken'], revertible: false, optional: true} //TODO: remove optional when server will merge their experiment
    };
});
