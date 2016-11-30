var _ = require('underscore');

var LIOR_SITE_URL = 'http://sheferlior.wix.com/multi1';

var santaSuite = [
    {
        runner: 'getSitePagesRunner',
        siteUrl: LIOR_SITE_URL
    },
    {
        runner: 'tpaSectionRunner',
        siteUrl: LIOR_SITE_URL,
        pageId: 'multi/cpi4/#test-state'
    }];

var santaEditorSuite = [
    {
        runner: 'openBillingPageRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/openBillingPageRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'appIsAliveRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/appIsAliveRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'previewHandlersRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/previewHandlersRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'resizeComponentRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/resizeComponentRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'appEditorLinkSettings',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/directAppServiceRunner',
                etpa: '12f1fbab-8b9d-3002-87b5-2972897e8314',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'appMarketPanelsRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/appMarketPanelsRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'pendingRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/76f64aa2-3453-459c-bb80-906e24757ca4',
            query: {
                metaSiteId: '50876390-5804-45dd-ba05-920b5b1db106',
                editorSessionId: '1A3EFC9B-1C0E-4F39-9403-BB41C1351C92',
                jasmineSpec: 'tpaIntegrationEditor:/runners/pendingRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'openMediaDialog',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/openMediaDialogRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'addComponentRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/addComponentRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'settingsModalRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/settingsModalRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'dashboardAppUrlRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/dashboardAppUrlRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'deleteComponentRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/deleteComponentRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'setExternalIdRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/71e2d60f-421d-4a7f-a63d-d45479b82349',
            query: {
                metaSiteId: '13b3d780-ab04-438d-8d56-b9f4ca676a49',
                editorSessionId: '1C644228-409A-4BD6-BE8B-FF5AB993EC93',
                jasmineSpec: 'tpaIntegrationEditor:/runners/setExternalIdRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'appsInTemplatesRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/ca822e83-e2ac-48d5-8640-1827485f3bf5',
            query: {
                metaSiteId: '0959b82e-4d92-4500-bb66-2f5e54fbeb68',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/appsInTemplatesRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'setWindowPlacementRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/2eca621c-2fb6-4664-b86f-f0d28c537981',
            query: {
                metaSiteId: '4e591363-c309-4f85-b402-c7b7aba5dd82',
                editorSessionId: '555F3410-47F5-4A5C-9702-718F5BF57AA0',
                jasmineSpec: 'tpaIntegrationEditor:/runners/setWindowPlacementRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'refreshAppRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/bf9fb045-3f39-4f5e-a761-5c7a3b9c37c7',
            query: {
                metaSiteId: 'df322629-52fc-4338-90f8-3efffbe82ca6',
                editorSessionId: 'BD3031E0-A83F-4929-B443-9A869B052A55',
                jasmineSpec: 'tpaIntegrationEditor:/runners/refreshAppRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'getSiteInfoRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/245afaae-ebec-4aa6-a27f-b07744b603cb',
            query: {
                metaSiteId: '1ae128b1-7b0d-45ab-a6ba-1668fb19f870',
                editorSessionId: '50FF9417-6B88-4C11-9BF2-39ED8D7B9E2A',
                jasmineSpec: 'tpaIntegrationEditor:/runners/getSiteInfoRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'viewModeRunner',
        urlParams: {
            pathname: '/html/editor/web/renderer/edit/3fc4f523-030f-417f-98ae-68a257dfa8e4',
            query: {
                metaSiteId: '27d337b2-5838-4c4d-a3d6-64b020aa20bd',
                editorSessionId: '3F78FFD7-494A-414F-B49A-A53258511965',
                jasmineSpec: 'tpaIntegrationEditor:/runners/viewModeRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'revalidateSessionRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/revalidateSessionRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'openNewAppMarketPanelRunner',
        urlParams: {
            pathname: '/html/editor/web/renderer/edit/3fc4f523-030f-417f-98ae-68a257dfa8e4',
            query: {
                metaSiteId: '27d337b2-5838-4c4d-a3d6-64b020aa20bd',
                editorSessionId: '3F78FFD7-494A-414F-B49A-A53258511965',
                jasmineSpec: 'tpaIntegrationEditor:/runners/openNewAppMarketPanelRunner',
                experiments: 'se_AppMarketUnification',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'getViewModeRunner',
        urlParams: {
            pathname: '/html/editor/web/renderer/edit/245afaae-ebec-4aa6-a27f-b07744b603cb',
            query: {
                metaSiteId: '1ae128b1-7b0d-45ab-a6ba-1668fb19f870',
                editorSessionId: '50FF9417-6B88-4C11-9BF2-39ED8D7B9E2A',
                jasmineSpec: 'tpaIntegrationEditor:/runners/getViewModeRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'unavailableAppRunner',
        urlParams: {
            pathname: '/html/editor/web/renderer/edit/029e2820-5159-4e5e-86f4-36d11edc5a15',
            query: {
                metaSiteId: '98c3655b-39dc-46be-94e4-bdb5490181c9',
                editorSessionId: 'dfad8365-7698-4775-8b41-b251c7eb0952',
                jasmineSpec: 'tpaIntegrationEditor:/runners/unavailableAppRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'duplicateWidgetRunner',
        urlParams: {
            pathname: '/html/editor/web/renderer/edit/3fc4f523-030f-417f-98ae-68a257dfa8e4',
            query: {
                metaSiteId: '27d337b2-5838-4c4d-a3d6-64b020aa20bd',
                editorSessionId: '3F78FFD7-494A-414F-B49A-A53258511965',
                jasmineSpec: 'tpaIntegrationEditor:/runners/duplicateWidgetRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'publicDataRunner',
        urlParams: {
            pathname: '/html/editor/web/renderer/edit/a142f958-f15f-4cb7-86b8-4ab51b4d01e6',
            query: {
                metaSiteId: '5ba8f51d-ca63-463e-b4c3-cbd3490b0649',
                editorSessionId: '8F2597BE-548D-4F32-AE67-EA03382913CB',
                jasmineSpec: 'tpaIntegrationEditor:/runners/publicDataRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'wixStoresRunner',
        urlParams: {
            pathname: '/html/editor/web/renderer/edit/4dcae322-4375-414a-bcae-80408fb0fb4f',
            query: {
                metaSiteId: '2b3a6288-6983-4185-a249-a0aefae79ebb',
                editorSessionId: 'E2AEF3C3-5C43-47A1-8D6C-8843C014F4A2',
                jasmineSpec: 'tpaIntegrationEditor:/runners/wixStoresRunner',
                experiments: 'StorePagesUsability1b',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'stylesRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/acb2a67a-b4ae-4c7f-a1bf-71464bc44eaa',
            query: {
                metaSiteId: '442a4380-01fb-44df-821a-102699c70212',
                editorSessionId: '8F7E7C1C-C0C4-45AF-8FE5-8C7D7283FEF0',
                jasmineSpec: 'tpaIntegrationEditor:/runners/stylesRunner',
                disableWelcomeScreen: 'true'
            }
        }
    }
];

var rcSuite = [
    {
        runner: 'appFlowsPendingRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/002ef4b1-7cd5-46e5-8d20-32bdf4b6a82c',
            query: {
                metaSiteId: 'a3b1ddf6-1a0d-4b3c-8386-bd1fa3939765',
                editorSessionId: '1C644228-409A-4BD6-BE8B-FF5AB993EC93',
                jasmineSpec: 'tpaIntegrationEditor:/runners/appFlowsPendingRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'addAppProvisionUserSiteRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/4773cc05-9340-4ad8-8e0e-7dfae04430c9',
            query: {
                metaSiteId: '7419039f-fde2-4af1-a381-d7fc371c17b9',
                editorSessionId: '5673F653-224A-4C7E-A984-9B193C702084',
                jasmineSpec: 'tpaIntegrationEditor:/runners/addAppProvisionUserSiteRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'addAppProvisionTemplateRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/245afaae-ebec-4aa6-a27f-b07744b603cb',
            query: {
                metaSiteId: '1ae128b1-7b0d-45ab-a6ba-1668fb19f870',
                editorSessionId: '50FF9417-6B88-4C11-9BF2-39ED8D7B9E2A',
                jasmineSpec: 'tpaIntegrationEditor:/runners/addAppProvisionTemplateRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'addAppProvisionAppInDemoModeRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/new',
            query: {
                metaSiteId: 'b60a569a-5c6b-47a2-96a3-8dc687919ce6',
                siteId: 'c063226c-389a-4d04-ac82-8433bc1dfd99',
                jasmineSpec: 'tpaIntegrationEditor:/runners/addAppProvisionAppInDemoModeRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'openSettingsForAppInDemoModeRunner',
        urlParams:  {
            pathname: 'html/editor/web/renderer/new',
            query: {
                metaSiteId: '8b0cc0c4-c4f8-427e-a9c3-9429850ffc23',
                siteId: 'a1843515-6143-49b2-9d8d-58b6e5f75d22',
                jasmineSpec: 'tpaIntegrationEditor:/runners/openSettingsForAppInDemoModeRunner',
                disableWelcomeScreen: 'true'
            }
        }
    },
    {
        runner: 'openManageForAppInDemoModeRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/new',
            query: {
                metaSiteId: '8b0cc0c4-c4f8-427e-a9c3-9429850ffc23',
                siteId: 'a1843515-6143-49b2-9d8d-58b6e5f75d22',
                jasmineSpec: 'tpaIntegrationEditor:/runners/openManageForAppInDemoModeRunner',
                disableWelcomeScreen: 'true'

            }
        }
    },
    {
        runner: 'provisionAppFromMetaSiteRunner',
        urlParams: {
            pathname: 'html/editor/web/renderer/edit/47b50324-3758-4738-ac0c-afc6dbd0bd37',
            query: {
                metaSiteId: '92f717ef-3c11-4e0d-8a9f-e1105c618bb9',
                editorSessionId: '9EAB4C4B-79C3-46E7-B8B1-71C8830AE510',
                jasmineSpec: 'tpaIntegrationEditor:/runners/provisionAppFromMetaSiteRunner',
                disableWelcomeScreen: 'true'

            }
        }
    }
    //},
    //{
    //    runner: 'provisionOnSaveRunner',
    //    urlParams: {
    //        pathname: 'html/editor/web/renderer/new',
    //        query: {
    //            metaSiteId: 'e983f7b3-e9a5-40b2-9ea2-9049417cdcd5',
    //            siteId: 'b1b3473c-8124-4de4-a074-0f650b1b3ee4',
    //            experiments: 'se_appFlows',
    //            jasmineSpec: 'tpaIntegrationEditor:/runners/provisionOnSaveRunner'
    //        }
    //    }
    //}
];

var suites = {
    santaSuite: santaSuite,
    santaEditorSuite: santaEditorSuite,
    rcSuite: rcSuite
};

var getSuite = function(name){
    return suites[name];
};

var getTests = function(tests, suiteName){
    var suite =  getSuite(suiteName);
    if (tests !== undefined && !Array.isArray(tests)){
        tests = [tests];
    }

    var filteredSuite = _.filter(suite, function(testDescription){
        return _.contains(tests, testDescription.runner);
    });
    return filteredSuite;
};

module.exports = {
    getSuite: getSuite,
    getTests: getTests
};
