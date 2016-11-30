define([], function () {
    'use strict';

    var BASE_PATH = ['wixCode'];

    var WIX_CODE_MODEL_PATH = ['rendererModel', 'wixCodeModel'];
    var WIX_CODE_APP_DATA_PATH = WIX_CODE_MODEL_PATH.concat('appData');
    var GRID_APP_ID_PATH = WIX_CODE_APP_DATA_PATH.concat('codeAppId');
    var SCARI_PATH = WIX_CODE_MODEL_PATH.concat('signedAppRenderInfo');
    var IS_APP_READ_ONLY_PATH = BASE_PATH.concat('isAppReadOnly');

    var paths = {
        BASE: BASE_PATH,
        MODIFIED_FILE_CONTENTS: BASE_PATH.concat('modifiedFileContents'),
        FILE_CACHE_KILLERS: BASE_PATH.concat('fileCacheKillers'),
        DEFAULT_FILE_CACHE_KILLER: BASE_PATH.concat('defaultFileCacheKiller'),
        WIX_CODE_MODEL: WIX_CODE_MODEL_PATH,
        WIX_CODE_APP_DATA: WIX_CODE_APP_DATA_PATH,
        GRID_APP_ID: GRID_APP_ID_PATH,
        SCARI: SCARI_PATH,
        IS_APP_READ_ONLY: IS_APP_READ_ONLY_PATH
    };

    return {
        paths: paths,
        WIX_CODE_IDE_SERVER_URL_KEY: 'wixCloudEditorBaseUrl',
        WIX_CODE_SERVICE_URL_KEY: 'wixCloudSiteExtensionsServiceUrl',
        WIX_CODE_SPEC_TYPE: 'siteextension'
    };
});
