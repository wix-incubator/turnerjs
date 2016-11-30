var _ = require('underscore');
var teamCityLogger = require('../utils/teamCityLogger');

var santa = browser.params.santaUrl;

var getTpaIntegrationSpecInitialParams = function () {
    return {
        isTpaIntegration: true,
        debug: 'tpaIntegration'
    };
};

var getSpecUrl = function(initialParams, siteUrl, runner, pagePath, urlParams){
    var defaultParams = _.assign(initialParams, {
        jasmineSpec: initialParams.debug + ':/runners/' + runner,
        debug: initialParams.debug + santa
    });
    var params = _.assign(defaultParams, urlParams || {});
    var queryParams = _.reduce(params, function(result, value, key) {
        return (!_.isNull(value) && !_.isUndefined(value)) ? (result += key + '=' + value + '&') : result;
    }, '?').slice(0, -1);

    return siteUrl + queryParams + (pagePath ? '#!' + pagePath : '');
};

var LIOR_SITE_URL = 'http://sheferlior.wixsite.com/multi1';
var TOMER_SITE_URL = 'http://tomergabwork.wixsite.com/tyty';
var MAYA_SITE_URL = 'http://mayah4.wixsite.com/publicdataintsite';
var MILA_SITE_URL = 'http://milak41.wixsite.com/multi1';
var YAARA_SITE_URL = 'http://yaarac1.wixsite.com/integration1';
var RONEN_SITE_URL = 'http://yaarac1.wixsite.com/buttons'; //'http://ronenb7.wix.com/testing-code-1';
var LIOR_CODE_SITE_URL = 'http://liorshefer.wixsite.com/mysite-3';
var LUKAS_CODE_SITE_URL = 'http://saltenas6.wixsite.com/behaviors-test';
var YAARA_LINK_SITE_URL = 'http://yaarac1.wixsite.com/links';
var MARIYA_CODE_SITE_URL = 'http://mariao3.wixsite.com/slidergallerytest';
var DROPDOWN_CODE_SITE_URL = 'http://alexandrer6.wixsite.com/dev-test';
var NAVIGATE_TO_TEST_SITE_URL = 'http://talm61.wixsite.com/testsnavigateto';
var SHOP_SITE_URL = 'http://naamaa.wixsite.com/sitewithshop';
var POPUP_SITE_URL = 'http://naamaa.wixsite.com/site-popup';

var fetchProgress = function (driver) {
    return driver.executeScript('return window.reporter');
};

var pollingOnProgress = function (progress, cb) {
    progress.then(function (report) {
        if (_.isUndefined(report)) {
            driver.executeScript('return window.onload()');
            pollingOnProgress(fetchProgress(browser.driver), cb);
        }
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
    if(spec.status === "failed") {
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

var isJasmineReporterLoaded = function (driver) {
    return driver.isElementPresent(by.css('.jasmine_html-reporter'));
};

var logJasmineReporterDidNotLoad = function (driver, name) {
    console.log('Jasmine reporter did not load trying to force it');
    browser.driver.executeScript('window.onload()');
    console.log('Did window.onload');
    var progress = fetchProgress(driver);
    pollingOnProgress(progress, function (result) {
        _.each(result, function (spec) {
            expect(spec.passed).toBeTruthy();
        });
        teamCityLogger.logSuiteEnd(name);
    });
};

var reportResults = function (result) {
    _.each(result, function (spec) {
        expect(spec.passed).toBeTruthy();
    });
};

xdescribe('Santa TPA integration runners: increase DEFAULT_TIMEOUT_INTERVAL to 10 minutes', function () {
    var originalTimeout;
    beforeEach(function () {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.getEnv().defaultTimeoutInterval = 10 * 60 * 1000;
    });

    afterEach(function () {
        jasmine.getEnv().defaultTimeoutInterval = originalTimeout;
    });

    it('should run popupRunnerAbsolute', function () {
        teamCityLogger.logSuiteStart('popupRunnerAbsolute');
        var specUrl = getSpecUrl('http://adiela0.wixsite.com/popu-prunner-site', 'popupRunnerAbsolute');
        console.log(specUrl);

        browser.driver.manage().window().setSize(800, 600);
        browser.driver.get(specUrl);

        browser.driver.wait(isJasmineReporterLoaded, 10 * 1000, 'Viewer did not load on time!').then(function () {
            var progress = fetchProgress(browser.driver);
            pollingOnProgress(progress, function (result) {
                _.each(result, function (spec) {
                    expect(spec.passed).toBeTruthy();
                });
                teamCityLogger.logSuiteEnd('popupRunnerAbsolute');
            });
        }, logJasmineReporterDidNotLoad.bind(undefined, browser.driver, 'popupRunnerAbsolute'));
    });
});

var santaIntegrationTests = {
    description: 'Santa TPA integration runners',
    subtests: [


        {
            runnerName: 'navigateToPageRunner',
            parameters: {
                siteUrl: LIOR_SITE_URL
            }
        },
        {
            runnerName: 'heightChangeRunner',
            parameters: {
                siteUrl: LIOR_SITE_URL
            }
        },
        {
            runnerName: 'styleRunner',
            parameters: {
                siteUrl: MILA_SITE_URL
            }
        },
        {
            runnerName: 'getViewModeRunner',
            parameters: {
                siteUrl: MILA_SITE_URL
            }
        },
        {
            runnerName: 'tpaWidgetRunner',
            parameters: {
                siteUrl: MILA_SITE_URL
            }
        },
        {
            runnerName: 'getSitePagesRunner',
            parameters: {
                siteUrl: MILA_SITE_URL
            }
        },
        {
            runnerName: 'getSectionUrl',
            parameters: {
                siteUrl: 'http://milak41.wixsite.com/mysite-529'
            }
        },
        {
            runnerName: 'getStateUrl',
            parameters: {
                siteUrl: 'http://milak41.wixsite.com/mysite-529'
            }
        },
        {
            runnerName: 'scrollRunner',
            parameters: {
                siteUrl: 'http://mayah4.wixsite.com/scrollinttest'
            }
        },
        {
            runnerName: 'modalRunner',
            parameters: {
                siteUrl: TOMER_SITE_URL,
                pagePath: 'blank/c1gsg'
            }
        },
        {
            runnerName: 'styleParamsRunner',
            parameters: {
                siteUrl: 'http://mayah4.wixsite.com/mysite-114'
            }
        },

        {
            runnerName: 'navigateToComponentRunner',
            parameters: {
                siteUrl: 'http://mayah4.wixsite.com/navtocomp',
                viewerLoadingTimeout: 25 * 1000
            }
        },
        {
            runnerName: 'pubSubRunner',
            parameters: {
                siteUrl: 'http://adiela0.wixsite.com/pubsubrunnersite'
            }
        },
        {
            runnerName: 'wixStyleTemplatingRunner',
            parameters: {
                siteUrl: 'http://adiela0.wixsite.com/tpatemplatingrunner'
            }
        },


        {
            runnerName: 'getSiteInfoRunner',
            parameters: {
                siteUrl: 'http://yaarac1.wixsite.com/info'
            }
        },
        {
            runnerName: 'gluedWidgetRunner',
            parameters: {
                siteUrl: TOMER_SITE_URL
            }
        },
        {
            runnerName: 'mobileModalRunner',
            parameters: {
                siteUrl: 'http://adiela0.wixsite.com/start-from-scrat-137',
                urlParams: {showMobileview: true}
            }
        },
        {
            runnerName: 'anchorRunner',
            parameters: {
                siteUrl: 'http://lotemh.wixsite.com/anchors'
            }
        },
        {
            runnerName: 'publicDataRunner',
            parameters: {
                siteUrl: MAYA_SITE_URL
            }
        },
        {
            runnerName: 'tpaSectionRunner',
            parameters: {
                siteUrl: 'http://sheferlior.wixsite.com/multi1/'
            }
        },
        {
            runnerName: 'deepLinkingRunner',
            parameters: {
                siteUrl: 'http://sheferlior.wixsite.com/multi1/multi/test-state'
            }
        },
        {
            runnerName: 'passwordProtectedPagesRunner',
            parameters: {
                siteUrl: 'http://adiela0.wixsite.com/runner-ppp',
                pagePath: 'password-protected/ggrsh'
            }
        },
        {
            runnerName: 'setPageMetadataRunner',
            parameters: {
                siteUrl: SHOP_SITE_URL
            }
        },
        {
            runnerName: 'sitePopupRunner',
            parameters: {
                siteUrl: POPUP_SITE_URL,
                urlParams: {experiments: 'popups,sv_popups,fast_save,boxSlideShow,se_multiColumns,columns'}
            }
        },
        {
            runnerName: 'smRequestLoginRunner',
            parameters: {
                siteUrl: SHOP_SITE_URL
            }
        }
    ],
    setUpTest: function (runnerName, params) {
        var initialParams = getTpaIntegrationSpecInitialParams();
        var specUrl = getSpecUrl(initialParams, params.siteUrl, runnerName, params.pagePath, params.urlParams);
        console.log(specUrl);
        browser.driver.get(specUrl);
    }
};
var santaPopupIntegrationTests = {
   description: 'Santa TPA integration runners: popup runners',
   subtests: [
       {
           runnerName: 'popupRunnerGeneral',
           parameters: {
               viewerLoadingTimeout: 30 * 1000
           }
       },
       {
           runnerName: 'popupRunnerRelative',
           parameters: {}
       },
       {
           runnerName: 'popupRunnerFixed',
           parameters: {
               pagePath: 'blank/c1gsg'
           }
       },
       {
           runnerName: 'popupRunnerDefault',
           parameters: {
               pagePath: 'blank/c1gsg'
           }
       }
   ],
   parameters: {
       siteUrl: 'http://adiela0.wixsite.com/popu-prunner-site'
   },
   setUpTest: function (runnerName, params) {
       var initialParams = getTpaIntegrationSpecInitialParams();
       var specUrl = getSpecUrl(initialParams, params.siteUrl, runnerName, params.pagePath, params.urlParams);
       console.log(specUrl);
       browser.driver.manage().window().setSize(800, 600);
       browser.driver.get(specUrl);
   }
};
var tests = [
    santaIntegrationTests
];

_.forEach(tests, function (testData) {

    describe(testData.description, function () {

        _.forEach(testData.subtests, function (subtestData) {

            it('should run ' + subtestData.runnerName, function () {
                teamCityLogger.logSuiteStart(subtestData.runnerName);

                var allParams = _.assign(testData.parameters || {}, subtestData.parameters || {});
                testData.setUpTest(subtestData.runnerName, allParams);

                var viewerLoadingTimeout = subtestData.parameters.viewerLoadingTimeout || 10 * 1000;

                browser.driver.wait(isJasmineReporterLoaded, viewerLoadingTimeout, 'Viewer did not load on time!').then(function () {
                    var progress = fetchProgress(browser.driver);
                    pollingOnProgress(progress, function (result) {
                        _.each(result, function (spec) {
                            expect(spec.passed).toBeTruthy();
                        });
                        teamCityLogger.logSuiteEnd(subtestData.runnerName);
                    });
                }, logJasmineReporterDidNotLoad.bind(undefined, browser.driver, subtestData.runnerName));
            });
        });
    });
});
