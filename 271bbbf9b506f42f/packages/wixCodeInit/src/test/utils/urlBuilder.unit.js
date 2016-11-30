define(['testUtils', 'lodash', 'wixCodeInit/utils/urlBuilder', 'wixCodeInit/utils/appsUtils'], function(testUtils, _, urlBuilder, appsUtils) {
    'use strict';

    describe('urlBuilder', function() {

        // mocks

        function mockSiteModel(previewMode) {
            return testUtils.mockFactory.mockSiteModel(null, previewMode)
                .setSiteRevision('site-revision')
                .toggleRenderFlag('componentViewMode', 'component-view-mode')
                .setWixCodeModel({
                        appData: {
                            codeAppId: '55cf7bc1-13c8-495f-9181-838d935fa988'
                        },
                        signedAppRenderInfo: 'fake-scari-fake-scari-fake-scari'
                    });
        }

        function mockAppDef() {
            return {
                extensionId: 'extension-id',
                instance: 'app-instance===',
                signature: 'app-signature===',
                appDefinitionId: 'app-definition-id'
            };
        }


        // utils

        function parseUrlSearchString(search) {
            return _(search.substring(1))
                .split('&')
                .map(function(keyValueString) {
                    return keyValueString.split('=');
                })
                .zipObject()
                .value();
        }

        function parseUrl(url) {
            var parser = window.document.createElement('a');
            parser.href = url;
            return {
                hostname: parser.hostname,
                pathname: parser.pathname,
                query: parseUrlSearchString(parser.search)
            };
        }

        function getSantaRelativePath(siteModel) {
            var santaScriptLocation = siteModel.serviceTopology.scriptsLocationMap.santa;
            return santaScriptLocation.replace(siteModel.serviceTopology.scriptsDomainUrl + 'services/', '');
        }


        // tests

        describe('URL', function() {

            it('hostname should be extensionId.wixCloudBaseDomain', function() {
                var siteModel = mockSiteModel();
                var appDef = mockAppDef();

                var parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef));

                expect(parsedUrl.hostname).toEqual(appDef.extensionId + '.' + siteModel.serviceTopology.wixCloudBaseDomain);
            });

            it('path should be /_partials/santaBase/static/wixcode/target/index.html', function() {
                var siteModel = mockSiteModel();
                var appDef = mockAppDef();

                var parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef));

                expect(parsedUrl.pathname).toEqual('/_partials/' + siteModel.santaBase + 'static/wixcode/target/index.html');
            });

            it('should use index.html or index.debug.html in debug mode', function() {
                var siteModel = mockSiteModel();
                var appDef = mockAppDef();
                var options = {
                    debug: 'true'
                };

                var parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef, options));

                expect(parsedUrl.pathname).toEqual('/_partials/' + siteModel.santaBase + 'static/wixcode/target/index.debug.html');
            });

            it('should redirect to production version when santaBase is local', function () {
                var siteModel = mockSiteModel();
                siteModel.santaBase = 'http://localhost';
                var appDef = mockAppDef();

                var parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef));

                expect(parsedUrl.pathname).toEqual('/_partials/' + getSantaRelativePath(siteModel) + '/static/wixcode/target/index.html');
            });

            describe('source version', function() {
                it('path should include source version if exists', function() {
                    var siteModel = mockSiteModel();
                    var appDef = mockAppDef();
                    var sourceVersion = '1.2.3';
                    var options = {
                        runtimeSource: sourceVersion
                    };

                    var parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef, options));
                    expect(parsedUrl.pathname).toEqual('/_partials/' + sourceVersion + '/static/wixcode/target/index.html');

                    siteModel.santaBase = 'santaBase/withPath/';
                    parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef, options));
                    expect(parsedUrl.pathname).toEqual('/_partials/santaBase/withPath/' + sourceVersion + '/static/wixcode/target/index.html');
                });

                it('should ignore source vesion if it is not valid', function() {
                    var siteModel = mockSiteModel();
                    var appDef = mockAppDef();
                    var invalidSourceVersion = '1.2.3.4';
                    var options = {
                        runtimeSource: invalidSourceVersion
                    };

                    var parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef, options));
                    expect(parsedUrl.pathname).toEqual('/_partials/' + siteModel.santaBase + 'static/wixcode/target/index.html');
                });
            });
        });


        describe('query parameters', function() {
            it('should include a compId', function() {
                var siteModel = mockSiteModel();
                var appDef = mockAppDef();

                var parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef));

                expect(parsedUrl.query.compId).toEqual('wixCode_' + appDef.appDefinitionId);
            });

            it('should include the right device type', function() {
                var siteModel = mockSiteModel();
                var appDef = mockAppDef();

                var desktopOptions = {
                    isMobileView: false
                };
                var parsedDesktopUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef, desktopOptions));
                expect(parsedDesktopUrl.query.deviceType).toEqual('desktop');

                var mobileOptions = {
                    isMobileView: true
                };
                var parsedMobileUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef, mobileOptions));
                expect(parsedMobileUrl.query.deviceType).toEqual('mobile');
            });

            it('should include the view mode', function() {
                var viewerSiteModel = mockSiteModel(false); // viewer mode
                var previewSiteModel = mockSiteModel(true); // preview mode
                var appDef = mockAppDef();

                var parsedViewerUrl = parseUrl('http:' + urlBuilder.buildUrl(viewerSiteModel, appDef));
                expect(parsedViewerUrl.query.viewMode).toEqual('site');

                var parsedPreviewUrl = parseUrl('http:' + urlBuilder.buildUrl(previewSiteModel, appDef));
                expect(parsedPreviewUrl.query.viewMode).toEqual(viewerSiteModel.renderFlags.componentViewMode);
            });

            it('should include the current locale', function() {
                var siteModel = mockSiteModel();
                var appDef = mockAppDef();

                var parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef));
                expect(parsedUrl.query.locale).toEqual(siteModel.rendererModel.languageCode);
            });

            it('should include the client spec instance', function() {
                var siteModel = mockSiteModel();
                var appDef = mockAppDef();

                var parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef));
                expect(parsedUrl.query.instance).toEqual(encodeURIComponent(appDef.signature));
            });

            it('should include sdkSource if exists in options', function() {
                var siteModel = mockSiteModel();
                var appDef = mockAppDef();
                var options = {
                    sdkSource: 'sdk-source'
                };

                var parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef, options));
                expect(parsedUrl.query.sdkSource).toEqual(encodeURIComponent('sdk-source'));
            });

            it('should not include sdkSource if is undefined in options', function() {
                var siteModel = mockSiteModel();
                var appDef = mockAppDef();
                var options = {
                    sdkSource: undefined
                };

                var parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, appDef, options));
                expect(_.has(parsedUrl.query, 'sdkSource')).toBeFalsy();
            });

            it('should include applications stringified object', function(){
                var wixCodeSpec = testUtils.mockFactory.clientSpecMapMocks.wixCode();
                var siteModel = mockSiteModel().updateClientSpecMap(wixCodeSpec);
                var initOptions = {
                    applications: appsUtils.getAppsBaseInfo(siteModel.rendererModel.clientSpecMap, siteModel.serviceTopology)
                };
                var expectedResult = encodeURIComponent(JSON.stringify(initOptions.applications));

                var parsedUrl = parseUrl('http:' + urlBuilder.buildUrl(siteModel, wixCodeSpec, initOptions));

                expect(parsedUrl.query.applications).toEqual(expectedResult);
            });
        });
    });
});
