define([
    'wixCodeInit/api/wixCodeAppApi',
    'wixCodeInit/api/initMainR',
    'wixCodeInit/utils/specMapUtils',
    'wixCodeInit/utils/appsUtils'
    // should not require any other package
], function(wixCodeAppApi, initMainR, specMapUtils, appsUtils) {
    'use strict';

    return {
        getAppApi: wixCodeAppApi.getApi,
        initMainR: initMainR,
        specMapUtils: specMapUtils,
        appsUtils: appsUtils
    };
});
