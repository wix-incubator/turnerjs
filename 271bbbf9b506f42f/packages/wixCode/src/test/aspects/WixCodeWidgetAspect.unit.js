define([
    'lodash',
    'wixCodeInit',
    'testUtils'
], function (_, wixCodeInit, testUtils) {

    'use strict';

    describe('wixCodeWidgetAspect', function () {

        describe('initApp', function () {

            it('should init the wixCodeApp', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                siteData.isDebugMode = jasmine.createSpy('isDebugMode').and.returnValue('debug-result');
                siteData.isMobileView = jasmine.createSpy('isMobileView').and.returnValue('mobile-view-result');
                var sdkSource = 'sdk-source';
                _.set(siteData, ['currentUrl', 'query', 'sdkSource'], sdkSource);
                _.set(siteData, ['currentUrl', 'query', 'WixCodeRuntimeSource'], 'runtime-source');
                var viewerPlatformAppSources = _.get(siteData, ['currentUrl', 'query', 'viewerPlatformAppSources']);
                var siteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(siteData);
                siteAPI._site.props.wixCodeAppApi.init = jasmine.createSpy('wixCodeAppInit');

                var wixCodeWidgetAspect = siteAPI.getSiteAspect('wixCodeWidgetAspect');
                wixCodeWidgetAspect.initApp();

                expect(siteAPI._site.props.wixCodeAppApi.init).toHaveBeenCalledWith(
                    siteData,
                    siteData.getClientSpecMap(), {
                        isMobileView: 'mobile-view-result',
                        debug: 'debug-result',
                        sdkSource: sdkSource,
                        runtimeSource: 'runtime-source',
                        applications: wixCodeInit.appsUtils.getAppsBaseInfo(siteData.getClientSpecMap(), siteData.serviceTopology, viewerPlatformAppSources)
                    }
                );
            });

            it('should load wix-code-sdk using service topology', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                siteData.isDebugMode = jasmine.createSpy('isDebugMode').and.returnValue('debug-result');
                siteData.isMobileView = jasmine.createSpy('isMobileView').and.returnValue('mobile-view-result');
                var sdkSource = siteData.serviceTopology.scriptsLocationMap['wix-code-sdk'] + '/lib/wix.min.js';
                _.set(siteData, ['currentUrl', 'query', 'sdkSource'], sdkSource);
                _.set(siteData, ['currentUrl', 'query', 'WixCodeRuntimeSource'], 'runtime-source');
                var viewerPlatformAppSources = _.get(siteData, ['currentUrl', 'query', 'viewerPlatformAppSources']);
                var siteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(siteData);
                siteAPI._site.props.wixCodeAppApi.init = jasmine.createSpy('wixCodeAppInit');

                var wixCodeWidgetAspect = siteAPI.getSiteAspect('wixCodeWidgetAspect');
                wixCodeWidgetAspect.initApp();

                expect(siteAPI._site.props.wixCodeAppApi.init).toHaveBeenCalledWith(
                    siteData,
                    siteData.getClientSpecMap(), {
                        isMobileView: 'mobile-view-result',
                        debug: 'debug-result',
                        sdkSource: sdkSource,
                        runtimeSource: 'runtime-source',
                        applications: wixCodeInit.appsUtils.getAppsBaseInfo(siteData.getClientSpecMap(), siteData.serviceTopology, viewerPlatformAppSources)
                    }
                );
            });
        });
    });
});
