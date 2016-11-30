define([
    'lodash',
    'wixCodeInit/api/initMainR',
    'testUtils'
], function (_, initMainR, testUtils) {
    'use strict';

    describe('initMainR', function () {

        function getMockAppApi() {
            return {
                init: jasmine.createSpy('init'),
                sendMessage: jasmine.createSpy('sendMessage'),
                registerMessageHandler: jasmine.createSpy('registerMessageHandler'),
                preLoadWidgets: jasmine.createSpy('preLoadWidgets')
            };
        }

        function mockQueryUtil(params) {
            return {
                getParameterByName: jasmine.createSpy('getParameterByName').and.callFake(function (name) {
                    return params && params[name];
                })
            };
        }

        beforeEach(function () {
            testUtils.experimentHelper.openExperiments(['wixCodeBinding']);
        });

        describe('dynamic model fetching', function () {
            it('should fetch dynamic model in viewer mode', function () {
                var appApi = getMockAppApi();
                var viewerSiteModel = testUtils.mockFactory.mockSiteModel().overrideClientSpecMap({});

                var isMobileView = 'is-mobile-view-value';
                var queryUtil = mockQueryUtil();

                initMainR(appApi, viewerSiteModel, isMobileView, queryUtil);

                expect(appApi.init).toHaveBeenCalledWith(
                    viewerSiteModel,
                    jasmine.any(Object),
                    jasmine.any(Object)
                );
            });

            it('should not fetch dynamic model in the case the noDynamicModelOnFirstLoad experiment is open', function () {
                testUtils.experimentHelper.openExperiments(['noDynamicModelOnFirstLoad']);

                var appApi = getMockAppApi();
                var viewerSiteModel = testUtils.mockFactory.mockSiteModel().overrideClientSpecMap({});

                var isMobileView = 'is-mobile-view-value';
                var queryUtil = mockQueryUtil();

                initMainR(appApi, viewerSiteModel, isMobileView, queryUtil);

                expect(appApi.init).toHaveBeenCalled();
            });

            it('should not fetch dynamic model in preview mode', function () {
                var previewSiteModel = testUtils.mockFactory.mockSiteModel();
                var appApi = getMockAppApi();
                var isMobileView = false;
                var queryUtil = mockQueryUtil();

                initMainR(appApi, previewSiteModel, isMobileView, queryUtil);

                expect(appApi.init).toHaveBeenCalledWith(
                    previewSiteModel,
                    previewSiteModel.rendererModel.clientSpecMap,
                    jasmine.any(Object)
                );
            });

            it('should not fetch dynamic model, it has already been fetched', function () {
                var viewerSiteModel = testUtils.mockFactory.mockSiteModel();
                var appApi = getMockAppApi();
                var isMobileView = false;
                var queryUtil = mockQueryUtil();

                initMainR(appApi, viewerSiteModel, isMobileView, queryUtil);

                expect(appApi.init).toHaveBeenCalledWith(
                    viewerSiteModel,
                    viewerSiteModel.rendererModel.clientSpecMap,
                    jasmine.any(Object)
                );
            });
        });

        function withoutUrl(result) {
            return _.mapValues(result, function (val) {
                return _.isArray(val) ? _.map(val, _.partialRight(_.omit, 'url')) : val;
            });
        }

        it('should call appApi.init with the right options extracted from passed arguments', function () {
            var appApi = getMockAppApi();
            var appSpec = testUtils.mockFactory.clientSpecMapMocks.wixCode();
            var siteModel = testUtils.mockFactory.mockSiteModel().updateClientSpecMap(appSpec);

            var isMobileView = 'is-mobile-view-value';
            var debug = 'debug-value';
            var sdkSource = 'sdk-source-value';
            var wixCodeRuntimeSource = 'runtime-source-value';
            var queryUtil = mockQueryUtil({
                debug: debug,
                sdkSource: sdkSource,
                WixCodeRuntimeSource: wixCodeRuntimeSource
            });
            var expectedOptionsObject = {
                isMobileView: isMobileView,
                debug: debug,
                sdkSource: sdkSource,
                runtimeSource: wixCodeRuntimeSource,
                applications: [{id: 'dataBinding', displayName: 'Data Binding', type: 'Application'}]
            };

            initMainR(appApi, siteModel, isMobileView, queryUtil);

            var initCallArgs = appApi.init.calls.argsFor(0);
            expect(initCallArgs.length).toEqual(3);
            expect(initCallArgs[0]).toEqual(siteModel);
            expect(initCallArgs[1]).toEqual(siteModel.rendererModel.clientSpecMap);
            expect(withoutUrl(initCallArgs[2])).toEqual(expectedOptionsObject);
            var appUrl = _.get(initCallArgs, [2, 'applications', 0, 'url']);
            expect(appUrl).toMatch(/http:\/\/static\.parastorage\.com\/services\/dbsm-viewer-app\/\d+\.\d+\.\d+\/app\.js/);
        });

        it('should load wix-code-sdk from query param', function () {
            var appApi = getMockAppApi();
            var appSpec = testUtils.mockFactory.clientSpecMapMocks.wixCode();
            var siteModel = testUtils.mockFactory.mockSiteModel().updateClientSpecMap(appSpec);

            var isMobileView = 'is-mobile-view-value';
            var sdkSource = 'sdk-source-value';
            var queryUtil = mockQueryUtil({
                sdkSource: sdkSource
            });

            initMainR(appApi, siteModel, isMobileView, queryUtil);

            var initCallArgs = appApi.init.calls.argsFor(0);
            expect(initCallArgs.length).toEqual(3);
            expect(initCallArgs[2].sdkSource).toEqual(sdkSource);
        });

        it('should load wix-code-sdk using service topology', function () {
            var appApi = getMockAppApi();
            var appSpec = testUtils.mockFactory.clientSpecMapMocks.wixCode();
            var siteModel = testUtils.mockFactory.mockSiteModel().updateClientSpecMap(appSpec);

            var isMobileView = 'is-mobile-view-value';
            var sdkSource = siteModel.serviceTopology.scriptsLocationMap['wix-code-sdk'] + '/lib/wix.min.js';
            var queryUtil = mockQueryUtil({});

            initMainR(appApi, siteModel, isMobileView, queryUtil);

            var initCallArgs = appApi.init.calls.argsFor(0);
            expect(initCallArgs.length).toEqual(3);
            expect(initCallArgs[2].sdkSource).toEqual(sdkSource);
        });

        it('should preload widgets in viewer mode', function () {
            var appApi = getMockAppApi();
            var viewerSiteModel = testUtils.mockFactory.mockSiteModel()
                .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());

            var isMobileView = 'is-mobile-view-value';
            var queryUtil = mockQueryUtil({
                debug: 'debug-value',
                sdkSource: 'sdk-source-value',
                WixCodeRuntimeSource: 'runtime-source-value'
            });

            initMainR(appApi, viewerSiteModel, isMobileView, queryUtil);

            expect(appApi.preLoadWidgets).toHaveBeenCalledWith(
                viewerSiteModel,
                window.document.location.href
            );
        });

        it('should not preload widgets when not in viewer mode', function () {
            var appApi = getMockAppApi();

            var previewSiteModel = testUtils.mockFactory.mockSiteModel();
            delete previewSiteModel.publicModel; // preview mode

            var isMobileView = 'is-mobile-view-value';
            var queryUtil = mockQueryUtil({
                debug: 'debug-value',
                sdkSource: 'sdk-source-value',
                WixCodeRuntimeSource: 'runtime-source-value'
            });

            initMainR(appApi, previewSiteModel, isMobileView, queryUtil);

            expect(appApi.preLoadWidgets).not.toHaveBeenCalled();
        });
    });
});
