define(['documentServices/site/Site',
    'documentServices/privateServices/fullFunctionalityConfig',
    'documentServices/privateServices/listsDataConfig',
    'documentServices/privateServices/siteInfoConfig',
    'documentServices/privateServices/testConfig',
    'documentServices/privateServices/siteInfo_v2Config',
    'documentServices/constants/constants'], function (Site, fullFunctionalityConfig, listsDataConfig, siteInfoConfig, testConfig, siteInfo_v2Config, constants) {
    'use strict';

    return {
        Site: Site,
        constants: constants,
        configs: {
            fullFunctionality: fullFunctionalityConfig,
            listsData: listsDataConfig,
            siteInfo: siteInfoConfig,
            test: testConfig,
            siteInfo_v2: siteInfo_v2Config
        }
    };
});
