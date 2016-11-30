var _ = require('underscore');
var url = require('url');
var runnerUtils = require('../utils/runnerUtils');
var teamCityLogger = require('../utils/teamCityLogger');

var isJasmineReporterLoaded = function (driver) {
    return driver.isElementPresent(by.css('.jasmine_html-reporter'));
};

var logJasmineReporterDidNotLoad = function () {
    console.log('Jasmine reporter did not load');
};

var fetchProgress = function (driver) {
    return driver.executeScript('return window.reporter');
};

var pollingOnProgress = function (progress, cb) {
    progress.then(function (report) {
        if(report.finished) {
            browser.driver.executeScript('return window.reporter.specs()').then(function (specs) {
                cb(createResults(specs));
            });
        } else {
            pollingOnProgress(fetchProgress(browser.driver), cb);
        }
    }, function onError(err) {
        console.log('Failed while fetching tests progress', err);
    });
};

var getSpecResult = function (spec) {
    if (spec.status === "failed") {
        return {
            passed: false,
            spec: spec.description
        };
    } else {
        return {
            passed: true,
            spec: spec.description
        };
    }
};

var createResults = function (specs) {
    var results = [];
    _.each(specs, function (spec) {
        teamCityLogger.logJasmine2SpecResult(spec);
        results.push(getSpecResult(spec));
    });
    return results;
};

//TODO - take params from local.config etc...
var defaultQueryParams = {
    petri_ovr: 'specs.DisableNewRelicScriptsSantaEditor:true',
    isTpaIntegration: true,
    forceEditorVersion: 'new',
    leavePagePopUp: false
};

var urlFormat = function (config) {
    var cfg = {
        protocol: 'http',
        host: 'editor.wix.com'
    };
    var defaultQuery = _.extend(defaultQueryParams, browser.params);
    console.log(defaultQuery);
    _.extend(config.query, defaultQuery);
    _.extend(cfg, config);
    var formattedUrl = url.format(cfg);
    console.log(formattedUrl);
    return formattedUrl;
};

var pollResults = function (runnerName, testUrlParams, retries) {
    browser.driver.get(urlFormat(testUrlParams));
    browser.driver.wait(isJasmineReporterLoaded, 600 * 10000, 'Editor did not load on time!').then(function () {
        var progress = fetchProgress(browser.driver);
        pollingOnProgress(progress, function (result) {
            var failedSpecs = _.filter(result, function (spec) {
                return !spec.passed;
            });

            if (_.size(failedSpecs) > 0 && retries > 0) {
                console.log('-------------retrying ' +runnerName+ '---------------');
                pollResults(runnerName, testUrlParams, --retries);
            } else {
                _.each(result, function (spec) {
                    expect(spec.passed).toBeTruthy();
                });
                var deferred = protractor.promise.defer();
                deferred.fulfill(_.size(failedSpecs) === 0);
                teamCityLogger.logSuiteEnd(runnerName);
            }
        });
    }, logJasmineReporterDidNotLoad);
};

describe('Santa editor TPA integration runners', function () {

    var executeRunner = function(runner, urlParams, retries) {
        pollResults(runner, urlParams, retries || 2);
    };

    beforeAll(function (done) {
        runnerUtils.loginToWix(browser, done);
    });

    it('should run previewHandlersRunner', function () {
        var runner = 'previewHandlersRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSZessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/previewHandlersRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run getStateUrlRunner', function () {
        var runner = 'getStateUrlRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: '/html/editor/web/renderer/edit/1bcfef49-1aa7-46d9-ad1b-727821f090af',
            query: {
                metaSiteId: '73a8fae1-e67e-4dc3-9c44-b4fa416b3c45',
                editorSessionId: '182A4FD4-C152-4B50-B61B-59D50643E4BD',
                jasmineSpec: 'tpaIntegrationEditor:/runners/getStateUrlRunner'
            }
        };
        executeRunner(runner, urlParams);
    });

    it('should run copyPasteRunner', function () {

        var runner = 'copyPasteRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/3aa29da2-a9df-4ee8-8bbc-0a5b80d9e449',
            query: {
                metaSiteId: '2c1a89a8-351f-4708-a103-2b5027e71196',
                editorSessionId: 'C8E776AE-2AE8-4113-AF0A-CDA708771CA7',
                jasmineSpec: 'tpaIntegrationEditor:/runners/copyPasteRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run openBillingPageRunner', function () {
        var runner = 'openBillingPageRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/openBillingPageRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run appIsAliveRunner', function () {
        var runner = 'appIsAliveRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/appIsAliveRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    xit('should run resizeComponentRunner', function () {
        var runner = 'resizeComponentRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/resizeComponentRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run directAppServiceRunner', function () {
        var runner = 'appEditorLinkSettings';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/directAppServiceRunner',
                etpa: '12f1fbab-8b9d-3002-87b5-2972897e8314',
                referral_info: 'dash_market'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run appMarketTabServiceRunner', function () {
        var runner = 'appMarketTabServiceRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/appMarketTabServiceRunner',
                openpanel: 'market:appDefId:12f1fbab-8b9d-3002-87b5-2972897e8314',
                referral_info: 'sa_market'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run appMarketPanelsRunner', function () {
        var runner = 'appMarketPanelsRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/appMarketPanelsRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run pendingRunner', function () {
        var runner = 'pendingRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/76f64aa2-3453-459c-bb80-906e24757ca4',
            query: {
                metaSiteId: '50876390-5804-45dd-ba05-920b5b1db106',
                editorSessionId: '1A3EFC9B-1C0E-4F39-9403-BB41C1351C92',
                jasmineSpec: 'tpaIntegrationEditor:/runners/pendingRunner',
                disableWelcomeScreen: 'true'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run openMediaDialog', function () {
        var runner = 'openMediaDialogRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/openMediaDialogRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run addComponentRunner', function () {
        var runner = 'addComponentRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/addComponentRunner',
                experiments: 'connectionsData'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run addComponentWithStyleRunner', function () {
        var runner = 'addComponentWithStyleRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/b1c00eb9-b9e2-469c-aab7-4c9d20aff19d',
            query: {
                metaSiteId: '9a09e356-a657-4ae5-a483-4b8a544c27f1',
                editorSessionId: 'E859D463-A92A-40B3-B1F5-BFA9C3CB7238',
                jasmineSpec: 'tpaIntegrationEditor:/runners/addComponentWithStyleRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run settingsModalRunner', function () {
        var runner = 'settingsModalRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/settingsModalRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run settingsPanelRunner', function () {
        var runner = 'settingsPanelRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/settingsPanelRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run dashboardAppUrlRunner', function () {
        var runner = 'dashboardAppUrlRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/dashboardAppUrlRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run deleteComponentRunner', function () {
        var runner = 'deleteComponentRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/deleteComponentRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run setExternalId', function () {
        var runner = 'setExternalId';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/71e2d60f-421d-4a7f-a63d-d45479b82349',
            query: {
                metaSiteId: '13b3d780-ab04-438d-8d56-b9f4ca676a49',
                editorSessionId: '1C644228-409A-4BD6-BE8B-FF5AB993EC93',
                jasmineSpec: 'tpaIntegrationEditor:/runners/setExternalIdRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run appsInTemplates', function () {
        var runner = 'appsInTemplates';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/ca822e83-e2ac-48d5-8640-1827485f3bf5',
            query: {
                metaSiteId: '0959b82e-4d92-4500-bb66-2f5e54fbeb68',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/appsInTemplatesRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run setWindowPlacement', function () {
        var runner = 'setWindowPlacement';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/2eca621c-2fb6-4664-b86f-f0d28c537981',
            query: {
                metaSiteId: '4e591363-c309-4f85-b402-c7b7aba5dd82',
                editorSessionId: '555F3410-47F5-4A5C-9702-718F5BF57AA0',
                jasmineSpec: 'tpaIntegrationEditor:/runners/setWindowPlacementRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run refreshApp', function () {
        var runner = 'refreshAppRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/bf9fb045-3f39-4f5e-a761-5c7a3b9c37c7',
            query: {
                metaSiteId: 'df322629-52fc-4338-90f8-3efffbe82ca6',
                editorSessionId: 'BD3031E0-A83F-4929-B443-9A869B052A55',
                jasmineSpec: 'tpaIntegrationEditor:/runners/refreshAppRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run getSiteInfoRunner', function () {
        var runner = 'siteInfoRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/245afaae-ebec-4aa6-a27f-b07744b603cb',
            query: {
                metaSiteId: '1ae128b1-7b0d-45ab-a6ba-1668fb19f870',
                editorSessionId: '50FF9417-6B88-4C11-9BF2-39ED8D7B9E2A',
                jasmineSpec: 'tpaIntegrationEditor:/runners/getSiteInfoRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run viewModeRunner', function () {
        var runner = 'viewModeRunner';

        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: '/html/editor/web/renderer/edit/3fc4f523-030f-417f-98ae-68a257dfa8e4',
            query: {
                metaSiteId: '27d337b2-5838-4c4d-a3d6-64b020aa20bd',
                editorSessionId: '3F78FFD7-494A-414F-B49A-A53258511965',
                jasmineSpec: 'tpaIntegrationEditor:/runners/viewModeRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run revalidateSessionRunner', function () {
        var runner = 'revalidateSessionRunner';

        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/007bd98f-a125-4b4d-99ee-a1ee97bd8518',
            query: {
                metaSiteId: 'a8b6ef59-68c4-414d-9e71-7553f1233907',
                editorSessionId: '3FF3C964-B81D-40A2-AB5E-1DC610600BDE',
                jasmineSpec: 'tpaIntegrationEditor:/runners/revalidateSessionRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should open app market 2.0', function () {
        var runner = 'openNewAppMarketPanelRunner';

        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: '/html/editor/web/renderer/edit/3fc4f523-030f-417f-98ae-68a257dfa8e4',
            query: {
                metaSiteId: '27d337b2-5838-4c4d-a3d6-64b020aa20bd',
                editorSessionId: '3F78FFD7-494A-414F-B49A-A53258511965',
                jasmineSpec: 'tpaIntegrationEditor:/runners/openNewAppMarketPanelRunner',
                experiments: 'se_AppMarketUnification'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run getViewModeRunner', function () {
        var runner = 'getViewModeRunner';

        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: '/html/editor/web/renderer/edit/361b7fc2-fab1-45db-bf7d-854f952b11b4',
            query: {
                metaSiteId: '328f9efd-2551-42ac-a43a-43b45b2ce792',
                editorSessionId: '50FF9417-6B88-4C11-9BF2-39ED8D7B9E2A',
                jasmineSpec: 'tpaIntegrationEditor:/runners/getViewModeRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run unavailableAppRunner', function () {
        var runner = 'unavailableAppRunner';

        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: '/html/editor/web/renderer/edit/029e2820-5159-4e5e-86f4-36d11edc5a15',
            query: {
                metaSiteId: '98c3655b-39dc-46be-94e4-bdb5490181c9',
                editorSessionId: 'dfad8365-7698-4775-8b41-b251c7eb0952',
                jasmineSpec: 'tpaIntegrationEditor:/runners/unavailableAppRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run duplicateWidgetRunner', function () {
        var runner = 'duplicateWidgetRunner';

        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: '/html/editor/web/renderer/edit/fd7b6056-ba3f-4ecc-b463-9ccc848d474a',
            query: {
                metaSiteId: 'ea84d387-4905-4d56-a547-d1e7dd7e82bc',
                editorSessionId: '1C644228-409A-4BD6-BE8B-FF5AB993EC93',
                jasmineSpec: 'tpaIntegrationEditor:/runners/duplicateWidgetRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run publicDataRunner', function () {
        var runner = 'publicDataRunner';

        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: '/html/editor/web/renderer/edit/a142f958-f15f-4cb7-86b8-4ab51b4d01e6',
            query: {
                metaSiteId: '5ba8f51d-ca63-463e-b4c3-cbd3490b0649',
                editorSessionId: '8F2597BE-548D-4F32-AE67-EA03382913CB',
                jasmineSpec: 'tpaIntegrationEditor:/runners/publicDataRunner'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run wixStoresRunner', function () {
        var runner = 'wixStoresRunner';

        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: '/html/editor/web/renderer/edit/4dcae322-4375-414a-bcae-80408fb0fb4f',
            query: {
                metaSiteId: '2b3a6288-6983-4185-a249-a0aefae79ebb',
                editorSessionId: 'E2AEF3C3-5C43-47A1-8D6C-8843C014F4A2',
                jasmineSpec: 'tpaIntegrationEditor:/runners/wixStoresRunner',
                experiments: 'StorePagesUsability1b'
            }
        };

        executeRunner(runner, urlParams);
    });

    it('should run stylesRunner', function () {
        var runner = 'stylesRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/acb2a67a-b4ae-4c7f-a1bf-71464bc44eaa',
            query: {
                metaSiteId: '442a4380-01fb-44df-821a-102699c70212',
                editorSessionId: '8F7E7C1C-C0C4-45AF-8FE5-8C7D7283FEF0',
                jasmineSpec: 'tpaIntegrationEditor:/runners/stylesRunner'
            }
        };
        executeRunner(runner, urlParams);
    });

    it('should run addEventListenerRunner', function () {
        var runner = 'addEventListenerRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/45e55d0f-4271-4bf3-bbdc-09d855a51d13',
            query: {
                metaSiteId: 'ce61c493-9b31-4b36-92d6-efb26adc3355',
                editorSessionId: '05C79F6F-F502-45AD-BE21-507F5BC14B06',
                isqa: 'true',
                jasmineSpec: 'tpaIntegrationEditor:/runners/addEventListenerRunner'
            }
        };
        executeRunner(runner, urlParams);
    });

    it('should run passwordProtectedRunner', function () {
        var runner = 'passwordProtectedRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/086e2c9c-94f3-4ec6-9af5-7bfca83f8790',
            query: {
                metaSiteId: 'c2004090-510c-4587-b0b7-0fa0f7f3e03f',
                editorSessionId: '5945A9EA-9A0E-4018-8CDD-E55188FF74E2',
                jasmineSpec: 'tpaIntegrationEditor:/runners/passwordProtectedPagesRunner'
            }
        };
        executeRunner(runner, urlParams);
    });

    it('should run navigateAndOpenAppServiceRunner', function () {
        var runner = 'navigateAndOpenAppServiceRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/20220e45-eb12-48ba-b35f-31a9b66b8764',
            query: {
                metaSiteId: 'cde935d2-8636-4691-93c8-f47bdc9c24a4',
                editorSessionId: '1C644228-409A-4BD6-BE8B-FF5AB993EC93',
                jasmineSpec: 'tpaIntegrationEditor:/runners/navigateAndOpenAppServiceRunner'
            }
        };
        executeRunner(runner, urlParams);
    });

    it('should run superAppsGfppRunner', function () {
        var runner = 'superAppsGfppRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: '/html/editor/web/renderer/edit/19cfdf8a-bbdb-4904-86ae-2400f4d77733',
            query: {
                metaSiteId: 'fc4a42c3-4542-43e5-86a7-2b5ac90dd120',
                editorSessionId: 'fc4a42c3-4542-43e5-86a7-2b5ac90dd120',
                jasmineSpec: 'tpaIntegrationEditor:/runners/superAppsGfppRunner',
                experiments: 'StorePagesUsability1b'
            }
        };
        executeRunner(runner, urlParams);
    });

    it('should run full width runner', function () {
        var runner = 'fullWidthRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/166d2e54-cf22-4d9b-b977-fd506b619757',
            query: {
                metaSiteId: 'e3b716e8-5147-4181-8b7f-8b1de9438842',
                editorSessionId: '1C644228-409A-4BD6-BE8B-FF5AB993EC93',
                jasmineSpec: 'tpaIntegrationEditor:/runners/' + runner
            }
        };
        executeRunner(runner, urlParams);
    });

    it('should run uiLibTextParamDesignPanel runner', function () {
        var runner = 'uiLibTextParamDesignPanelRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: 'html/editor/web/renderer/edit/acb2a67a-b4ae-4c7f-a1bf-71464bc44eaa',
            query: {
                metaSiteId: '442a4380-01fb-44df-821a-102699c70212',
                editorSessionId: '8F7E7C1C-C0C4-45AF-8FE5-8C7D7283FEF0',
                jasmineSpec: 'tpaIntegrationEditor:/runners/' + runner
            }
        };
        executeRunner(runner, urlParams);
    });

    it('should run superAppsOpenDashboardRunner', function () {
        var runner = 'superAppsOpenDashboardRunner';
        teamCityLogger.logSuiteStart(runner);

        var urlParams = {
            pathname: '/html/editor/web/renderer/edit/8bc0d5b1-4643-4d17-9849-4a15a485058c',
            query: {
                metaSiteId: '76af8c6f-3fb4-46c6-aa58-7109f8216011',
                editorSessionId: 'E2AEF3C3-5C43-47A1-8D6C-8843C014F4A2',
                jasmineSpec: 'tpaIntegrationEditor:/runners/superAppsOpenDashboardRunner'
            }
        };
        executeRunner(runner, urlParams);
    });
});
