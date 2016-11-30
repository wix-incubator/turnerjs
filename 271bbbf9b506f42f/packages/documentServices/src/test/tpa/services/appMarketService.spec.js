define(['lodash',
        'utils',
        'testUtils',
        'documentServices/siteMetadata/siteMetadata',
        'documentServices/tpa/constants',
        'documentServices/tpa/services/appMarketService',
        'documentServices/tpa/services/appMarketCacheService',
        'documentServices/tpa/services/installedTpaAppsOnSiteService',
        'documentServices/tpa/services/billingService',
        'documentServices/mockPrivateServices/privateServicesHelper'
    ],
    function (_, utils, testUtils, siteMetadata, tpaConstants, appMarketService, cache, installedTpaAppsOnSiteService, billing, privateServicesHelper) {
        'use strict';

        describe('appMarketService', function () {

            var ajaxSpy;
            var mockMetaSiteId = 'meta-site-id';
            var mockViewerParams = {
                lang: 'en',
                compId: 'MarketPanel',
                siteId: 'site-id',
                newWixStores: 'true'
            };
            var mockAppData;
            var mockPs;
            beforeEach(function () {
                mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL();
                var serviceTopologyPointer = mockPs.pointers.general.getServiceTopology();
                var appMarketEditorApiUrlPointer = mockPs.pointers.getInnerPointer(serviceTopologyPointer, ['appMarketEditorApiUrl']);
                siteMetadata.setProperty(mockPs, siteMetadata.PROPERTY_NAMES.META_SITE_ID, mockMetaSiteId);
                siteMetadata.setProperty(mockPs, siteMetadata.PROPERTY_NAMES.SITE_ID, mockViewerParams.siteId);
                mockPs.dal.set(appMarketEditorApiUrlPointer, 'http://editor.wix.com/_api/app-market-api/apps');

                ajaxSpy = spyOn(utils.ajaxLibrary, 'ajax');

                mockAppData = {
                    "upgradedToYearly": false,
                    "appDefinitionId": "12e18cab-200b-e8bb-bd72-ce5398890fa4",
                    "slug": "iplayerhd-video-hosting",
                    "isTrial": false,
                    "appType": "tpa",
                    "widgets": [
                        {
                            "mobileUrl": "http://iplayerhd.com/player/wix",
                            "mobilePublished": true,
                            "published": true,
                            "title": "iPlayerHD Video Hosting",
                            "description": "iPlayerHD Video player widget.",
                            "widgetUrl": "http://iplayerhd.com/player/wix",
                            "widgetId": "12e86bdf-ecac-5e7c-94b6-a61791c329ef",
                            "tpaWidgetId": "iplayerhd_video_hosting",
                            "refreshOnWidthChange": true,
                            "settings": {
                                "settingsUrl": "http://wix.iplayerhd.com/settingsV3",
                                "width": 580,
                                "height": 720,
                                "languages": [],
                                "helpId": "6d5e947c-454f-4de8-b978-15dcb242e2ea"
                            },
                            "default": true,
                            "essential": false,
                            "type": "widget",
                            "pictures": [],
                            "defaultWidth": 600,
                            "defaultHeight": 338,
                            "defaultShowOnAllPages": false,
                            "helpId": "6d5e947c-454f-4de8-b978-15dcb242e2ea",
                            "mobileHelpId": "6d5e947c-454f-4de8-b978-15dcb242e2ea"
                        }
                    ],
                    "name": "iPlayerHD Video Hosting",
                    "appIcon": "//static.wixstatic.com/media/2412211374054dc98a2a831027e688fec4c7e8066.jpg",
                    "hasSection": false,
                    "hasWidget": true,
                    "hasDashboard": false,
                    "hasEditorEndpoints": true,
                    "hasPublishedDashboard": false,
                    "listedInMarket": true,
                    "description": "<p>Ad-Free Video Hosting for Wix!</p><p><br />iPlayerHD is an inexpensive, simple, ad-free alternative to the ad-infested YouTube video hosting option.&nbsp;Smart businesses today are realizing the value non-branded, ad-free video has for a quality user experience for their web site visitors. So while YouTube is useful in many cases, when it comes to your own site, trust iPlayerHD to provide a top quality video experience.</p><p><br />At iPlayerHD, you&#39;ll get dozens of robust features backed up by obsessive support. And we&#39;ll automatically detect and deliver your videos to all devices.</p><p><br />Features include single video embeds, playlists, Facebook embedding, social sharing, analytics, and much more.</p><p><br />Don&rsquo;t Delay. Add the iPlayerHD app to your Wix site today!</p><p dir=\"ltr\">&nbsp;</p>",
                    "pictures": [
                        "//static.wixstatic.com/media/134243683b4a85f905338e5605a4c213721376b6.png"
                    ],
                    "teaser": "Upload, manage and publish video to your Wix site without pesky third party ads.",
                    "liveDemoUrl": "http://www.iplayerhd.com/playerframe/nofullscreen/progressive/4f5ba6d6-c9c2-4422-9803-92a47901ae1b.aspx?autostart=false&width=700&height=393&cbartype=none",
                    "companyWebsite": "",
                    "upgradeBenefits": [
                        "100 GB Monthly Bandwidth - 1000's of Views Per Month",
                        "Unlimited Videos - up to 100 GB of Storage.",
                        "Playlists, Email Capture, Popover Videos, Analytics Including GEO and IP Data",
                        "FrameCatch Image Capture/Share Tool"
                    ],
                    "frontPageImage": "//static.wixstatic.com/media/764177039d9ba935b76a19204fe24b5e5c218246.png",
                    "socialShareImage": "//static.wixstatic.com/media/6680941975a6dd34f48925ed8f12933cea0cf2f9.png",
                    "by": "iPlayerHD",
                    "packages": [
                        {
                            "id": "WixTier1",
                            "name": "iPlayerHD for Wix",
                            "price": "9.99",
                            "is_active": true,
                            "freeMonth": false,
                            "monthly": {
                                "price": "9.99"
                            },
                            "yearly": {},
                            "oneTime": {},
                            "bestSellingFeature": "",
                            "discountPercent": 0
                        }
                    ],
                    "billingPanelType": "benefits",
                    "isWixComponent": false,
                    "isWixLabs": false,
                    "hasPremium": true,
                    "hasFree": true,
                    "dashboardImage": "//static.wixstatic.com/media/6138275853cd29560ce9651a1270a48c77f675a4.png",
                    "overrideDashboardUrl": false,
                    "dashboard": {},
                    "supportInfo": {
                        "supportUrl": "",
                        "supportPhone": "",
                        "supportMail": "wixsupport@iplayerhd.com"
                    },
                    "publishedAt": 1371733859,
                    "premiumOnly": false,
                    "externalPremium": false,
                    "alwaysOnDashboard": false,
                    "developerInfo": "<p>iPlayerHD introduced it&#39;s video hosting platform in April of 2008 to address a growing need by businesses and other organizations to deliver an ad-free video experience to their web-ste vistors.&nbsp;</p><p>While we believe it is important to use YouTube&#39;s free video hosting to promote products, services and ideas, and to use YouTube to drive traffic to your web site, we also believe that once that traffic arrives at your site, they should have an unbranded experience free of those pesky ads that appear in YouTube videos.</p><p>You work hard to drive traffic to your website. Why risk losing that traffic because your visitor clicks on an ad or the YouTube logo? iPlayerHD&#39;s unbranded, ad-free video hosting platform will keep vital site visitors on your website.</p><p>Support Info<br />Need more help? Please contact us:</p><p>Email: wixsupport@iplayerhd.com<br />&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>",
                    "openAppButton": false,
                    "hidePricing": false,
                    "downloads": 27346,
                    "downloadsAllTime": 480810,
                    "isFullPage": false,
                    "permissions": {
                        "policy": "TPA",
                        "permissions": [
                            "ContactsUpdate",
                            "ContactsWrite",
                            "PostFormsActivities"
                        ]
                    },
                    "isTPA": true,
                    "bestByWix": false,
                    "upgradeTitle": "Upgrade now to unlock these features!",
                    "roundIcon": "//static.wixstatic.com/media/20562667823cf61a14190f5e1a1f0e39773ecc66d.png",
                    "categories": [
                        "269",
                        "2119",
                        "2479",
                        "2128",
                        "2114",
                        "1025",
                        "2441"
                    ],
                    "purchaseStartUrl": "https://premium.wix.com/wix/api/tpaStartPurchase",
                    "weights": {
                        "categories": {
                            "2": -18,
                            "269": -6,
                            "788": -17,
                            "795": -28,
                            "1025": 0,
                            "2114": -3,
                            "2119": -1,
                            "2128": -21,
                            "2441": -87
                        }
                    },
                    "relatedAppsTeaser": "Upload, manage and publish ad-free videos",
                    "hideAppFirstTimeMsg": false,
                    "editorGfpp": {
                        "openInDashboard": false
                    },
                    "editorCompNonEssential": false
                };
                testUtils.experimentHelper.openExperiments('appMarketCache');
            });

            describe('getAppMarketData', function () {
                var data = {
                    price: 'foo'
                };

                beforeEach(function () {
                    siteMetadata.setProperty(mockPs, siteMetadata.PROPERTY_NAMES.LANGUAGE_CODE, 'kr');
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        expect(ajaxArgs.url).toContain('priced-app?metaSiteId=');
                        expect(ajaxArgs.url).toContain('&lang=kr');
                        ajaxArgs.success(data);
                    });
                });

                it('should execute one priced-app server request per appDefId', function () {

                    appMarketService.getAppMarketData(mockPs, 'appDefId1');
                    appMarketService.getAppMarketData(mockPs, 'appDefId1');
                    appMarketService.getAppMarketData(mockPs, 'appDefId1');
                    appMarketService.getAppMarketData(mockPs, 'appDefId1');

                    expect(cache.get('appDefId1')).toEqual(data);
                    expect(ajaxSpy.calls.count()).toBe(1);
                });

                it('should execute one more priced-app server request in case cache contains data with no price and merge the data', function () {
                    cache.set('appDefId2', mockAppData);
                    expect(cache.get('appDefId2')).toEqual(mockAppData);

                    appMarketService.getAppMarketData(mockPs, 'appDefId2');
                    appMarketService.getAppMarketData(mockPs, 'appDefId2');
                    appMarketService.getAppMarketData(mockPs, 'appDefId2');
                    appMarketService.getAppMarketData(mockPs, 'appDefId2');

                    expect(cache.get('appDefId2')).toEqual(_.merge(data, mockAppData));
                    expect(ajaxSpy.calls.count()).toBe(1);
                });

                it('should get data from cache if already made a call to get data', function () {
                    expect(cache.get('appDefId2')).toEqual(data);
                    appMarketService.getAppMarketData(mockPs, 'appDefId2');
                    expect(ajaxSpy.calls.count()).toBe(0);
                });
            });

            describe("getAppMarketDataAsync", function () {
                var successResponse;

                beforeEach(function () {
                    successResponse = {
                        foo: 'bar'
                    };
                });

                it('should clear cache from prev tests', function () {
                    cache.clear();
                    expect(cache.get('appDefId2')).toEqual(undefined);
                });

                it('should reject the promise if appDefId property was not given', function () {
                    var marketPromise = appMarketService.getAppMarketDataAsync({});
                    marketPromise.then().catch(function (message) {
                        expect(message).toEqual({
                            error: 'appDefinitionId was not given'
                        });
                    });
                    expect(ajaxSpy.calls.mostRecent()).not.toBeDefined();
                });

                it('should return market data from ajax', function (done) {
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success(successResponse);
                    });
                    var marketPromise = appMarketService.getAppMarketDataAsync(mockPs, 'appDefId');
                    marketPromise.then(function (data) {
                        expect(data).toBe(successResponse);
                        done();
                    });
                });

                it('should return market data from ajax and merge it with existing cache data when exists', function (done) {
                    spyOn(cache, 'get').and.returnValue(mockAppData);
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success(successResponse);
                    });

                    var marketPromise = appMarketService.getAppMarketDataAsync(mockPs, 'appDefId');
                    marketPromise.then(function (data) {
                        expect(data).toEqual(_.merge(successResponse, mockAppData));
                        done();
                    });
                });

                it('should return market data from cache', function (done) {
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success(successResponse);
                    });

                    appMarketService.getAppMarketData(mockPs, 'appDefId1');
                    var marketPromise = appMarketService.getAppMarketDataAsync(mockPs, 'appDefId1');

                    marketPromise.then(function (data) {
                        expect(data).toEqual(successResponse);
                        done();
                    });
                });

                it('should resolve with an error data when an error happens', function (done) {
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.error();
                    });

                    var marketPromise = appMarketService.getAppMarketDataAsync(mockPs, 'appDefId2');
                    marketPromise.then(function (data) {
                        expect(data).toEqual({
                            error: 'app market response error for appDefinitionId: appDefId2'
                        });
                        done();
                    });
                });
            });

            describe('App market URL builder', function () {
                var mockEditorParams,
                    origin = 'http://editor.wix.com',
                    params,
                    appMarketBaseUrl = 'http://editor.wix.com/wix-app-market/';

                beforeEach(function () {
                    mockEditorParams = {
                        origin: origin,
                        appDefinitionId: 'dev-app-id',
                        tests: ['exp1', 'exp2'],
                        query: 'tag1,tag2',
                        openAppDefId: 'app-id-to-open',
                        openMarketOrigin: 'blog_button'
                    };

                    var serviceTopologyPointer = mockPs.pointers.general.getServiceTopology();
                    var appMarketEditorApiUrlPointer = mockPs.pointers.getInnerPointer(serviceTopologyPointer, ['appMarketEditorNewUrl']);
                    mockPs.dal.set(appMarketEditorApiUrlPointer, appMarketBaseUrl);

                    params = _.merge(mockEditorParams, mockViewerParams);
                });

                it('should build App market URL', function () {
                    var url = appMarketService.getAppMarketUrl(mockPs, mockEditorParams);

                    // Remove and openMarketOrigin origin to test it in separate
                    delete params.origin;
                    delete params.openMarketOrigin;
                    delete params.tests;

                    _.forEach(params, function (val, key) {
                        expect(url).toContain(key + '=' + encodeURIComponent(val));
                    });

                    expect(url).toContain('eo=' + window.btoa(origin));
                    expect(url).toContain(appMarketBaseUrl);
                    expect(url).toContain('referralInfo=blog_button');
                    expect(url).toContain('experiment=exp1');
                    expect(url).toContain('experiment=exp2');
                });

                it('should init new builder and not add meta site ID twice', function () {
                    var urlFirst = appMarketService.getAppMarketUrl(mockPs, mockEditorParams);
                    var urlSecond = appMarketService.getAppMarketUrl(mockPs, mockEditorParams);

                    expect(urlFirst).toEqual(urlSecond);
                });

                it('should build app market url in old format in case newURl is not passed in editorParams', function() {
                    testUtils.experimentHelper.openExperiments('reactAppMarket');

                    var url = appMarketService.getAppMarketUrl(mockPs, mockEditorParams);

                    // Remove and openMarketOrigin origin to test it in separate
                    delete params.origin;
                    delete params.openMarketOrigin;
                    delete params.tests;

                    _.forEach(params, function (val, key) {
                        expect(url).toContain(key + '=' + encodeURIComponent(val));
                    });

                    expect(url).toContain('eo=' + window.btoa(origin));
                    expect(url).toContain(appMarketBaseUrl);
                    expect(url).toContain('referralInfo=blog_button');
                    expect(url).toContain('experiment=exp1');
                    expect(url).toContain('experiment=exp2');
                });

                it('should build app market url with the react app market url and a new param metaSiteId', function() {
                    testUtils.experimentHelper.openExperiments('reactAppMarket');

                    mockEditorParams.newUrl = true;

                    var url = appMarketService.getAppMarketUrl(mockPs, mockEditorParams);

                    var appMarkeReacttBaseUrl = 'http://editor.wix.com/one-app-market/';

                    // Remove and openMarketOrigin origin to test it in separate
                    delete params.origin;
                    delete params.openMarketOrigin;
                    delete params.tests;
                    delete params.newUrl;
                    params.metaSiteId = 'meta-site-id';
                    _.forEach(params, function (val, key) {
                        expect(url).toContain(key + '=' + encodeURIComponent(val));
                    });

                    expect(url).toContain('eo=' + window.btoa(origin));
                    expect(url).toContain(appMarkeReacttBaseUrl);
                    expect(url).toContain('referralInfo=blog_button');
                    expect(url).toContain('experiment=exp1');
                    expect(url).toContain('experiment=exp2');

                });
            });

            describe('getAppMarketDataForPage', function () {

                it('should clear cache from prev tests', function () {
                    cache.clear();
                    expect(cache.get('appDefId1')).toEqual(undefined);
                });

                it('should reject in case no page id was given', function () {
                    spyOn(installedTpaAppsOnSiteService, 'getInstalledAppsOnPage').and.returnValue([]);
                    var reject = jasmine.createSpy('reject');
                    appMarketService.getAppMarketDataForPage(mockPs, undefined, jasmine.any(Function), reject);
                    expect(reject).toHaveBeenCalledWith({
                        error: 'pageId was not given'
                    });
                });

                it('should reject when an error and no resolve is given', function () {
                    spyOn(installedTpaAppsOnSiteService, 'getInstalledAppsOnPage').and.returnValue([{appDefinitionId: 'appDefId2'}, {appDefinitionId: '222'}]);
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.error();
                    });
                    var reject = jasmine.createSpy('reject');
                    appMarketService.getAppMarketDataForPage(mockPs, 'mainPage', null, reject);
                    expect(reject).toHaveBeenCalledWith({
                        error: 'app market response error for appDefinitionIds: appDefId2,222'
                    });
                });

                it('should resolve with an error data on error', function () {
                    spyOn(installedTpaAppsOnSiteService, 'getInstalledAppsOnPage').and.returnValue([{appDefinitionId: 'appDefId2'}, {appDefinitionId: '222'}]);
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.error();
                    });
                    var resolve = jasmine.createSpy('resolve');
                    var reject = jasmine.createSpy('reject');
                    appMarketService.getAppMarketDataForPage(mockPs, 'mainPage', resolve, reject);
                    expect(resolve).toHaveBeenCalledWith({
                        error: 'app market response error for appDefinitionIds: appDefId2,222'
                    });
                    expect(cache.get('appDefId3')).toEqual(undefined);
                });

                it('should return market data form ajax and store appDefId3 in cache', function () {
                    var successResponse = {
                        foo: 'bar',
                        appDefinitionId: 'appDefId3'
                    };
                    spyOn(installedTpaAppsOnSiteService, 'getInstalledAppsOnPage').and.returnValue([{appDefinitionId: 'appDefId3'}, {appDefinitionId: '12aacf69-f3fb-5334-2847-e00a8f13c12f'}]);
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success([successResponse]);
                    });
                    var resolve = jasmine.createSpy('resolve');
                    var reject = jasmine.createSpy('reject');
                    appMarketService.getAppMarketDataForPage(mockPs, 'mainPage', resolve, reject);

                    expect(resolve).toHaveBeenCalledWith([successResponse]);
                    expect(cache.get('appDefId3')).toEqual(successResponse);
                });

                xit('should return market data form ajax and merge it with data from cache', function () {
                    spyOn(cache, 'get').and.returnValue(mockAppData);
                    var successResponse = {
                        foo: 'bar',
                        appDefinitionId: 'appDefId3'
                    };
                    spyOn(installedTpaAppsOnSiteService, 'getInstalledAppsOnPage').and.returnValue([{appDefinitionId: 'appDefId3'}]);
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success([successResponse]);
                    });
                    var resolve = jasmine.createSpy('resolve');
                    var reject = jasmine.createSpy('reject');
                    appMarketService.getAppMarketDataForPage(mockPs, 'mainPage', resolve, reject);

                    expect(resolve).toHaveBeenCalledWith([_.merge(successResponse, mockAppData)]);
                });

                it('should call bulk appMarket apps url with all appDefIds in case non are cached', function () {
                    spyOn(installedTpaAppsOnSiteService, 'getInstalledAppsOnPage').and.returnValue([{appDefinitionId: 'appDefId4'}, {appDefinitionId: '12aacf69-f3fb-5334-2847-e00a8f13c12f'}]);
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success({});
                    });
                    var resolve = jasmine.createSpy('resolve');
                    var reject = jasmine.createSpy('reject');
                    appMarketService.getAppMarketDataForPage(mockPs, 'mainPage', resolve, reject);
                    expect(utils.ajaxLibrary.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'GET',
                        url: 'http://editor.wix.com/_api/app-market-api/apps/?id=appDefId4,12aacf69-f3fb-5334-2847-e00a8f13c12f'
                    }));
                });

                it('should call bulk appMarket apps url with uncached appDefIds only', function () {
                    expect(cache.keys()).toEqual(['appDefId3']);
                    cache.set('appDefId4', {});
                    spyOn(installedTpaAppsOnSiteService, 'getInstalledAppsOnPage').and.returnValue([{appDefinitionId: 'appDefId4'}, {appDefinitionId: 'appDefId5'}]);
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success({});
                    });
                    var resolve = jasmine.createSpy('resolve');
                    var reject = jasmine.createSpy('reject');
                    appMarketService.getAppMarketDataForPage(mockPs, 'mainPage', resolve, reject);
                    expect(utils.ajaxLibrary.ajax).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'GET',
                        url: 'http://editor.wix.com/_api/app-market-api/apps/?id=appDefId5'
                    }));
                });
            });

            describe('getRelatedApps', function () {
                var appData = {
                    appDefinitionId: "",
                    slug: "",
                    isTrial: true,
                    trialDays: 30,
                    appType: "",
                    widgets: [],
                    name: "",
                    appIcon: "",
                    hasSection: false,
                    hasWidget: true,
                    hasDashboard: false,
                    hasEditorEndpoints: true,
                    hasPublishedDashboard: false,
                    listedInMarket: true,
                    description: "",
                    pictures: [],
                    teaser: "",
                    features: [],
                    companyWebsite: "",
                    upgradeBenefits: [],
                    frontPageImage: "",
                    socialShareImage: "",
                    by: "",
                    packages: [],
                    isWixComponent: false,
                    isWixLabs: false,
                    hasPremium: false,
                    hasFree: true,
                    hasMobile: false,
                    dashboardImage: "",
                    overrideDashboardUrl: false,
                    dashboard: {},
                    supportInfo: {},
                    publishedAt: 1404893360,
                    premiumOnly: false,
                    externalPremium: true,
                    alwaysOnDashboard: false,
                    developerInfo: "",
                    openAppButton: false,
                    hidePricing: false,
                    downloads: 5429,
                    downloadsAllTime: 34540,
                    isFullPage: false,
                    promotionIcon: "",
                    isTPA: true,
                    bestByWix: false,
                    categories: [],
                    weights: {},
                    hideAppFirstTimeMsg: false
                };
                it('should reject when an error happens', function () {
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.error();
                    });
                    var resolve = jasmine.createSpy('resolve');
                    var reject = jasmine.createSpy('reject');
                    appMarketService.getRelatedApps(mockPs, resolve, reject);
                    expect(reject).toHaveBeenCalled();
                });

                it('should return related apps data from ajax', function () {
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success({});
                    });
                    var resolve = jasmine.createSpy('resolve');
                    var reject = jasmine.createSpy('reject');
                    appMarketService.getRelatedApps(mockPs, resolve, reject);
                    expect(resolve).toHaveBeenCalled();
                });

                it('should call related apps url', function () {
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success({});
                    });
                    var resolve = jasmine.createSpy('resolve');
                    var reject = jasmine.createSpy('reject');
                    appMarketService.getRelatedApps(mockPs, resolve, reject);
                    expect(utils.ajaxLibrary.ajax).toHaveBeenCalledWith({
                        type: 'GET',
                        url: 'http://editor.wix.com/_api/app-market-api/apps/?market=related_apps',
                        data: {},
                        dataType: 'json',
                        contentType: 'application/json',
                        success: jasmine.any(Function),
                        error: reject
                    });
                });

                var assertRelatedAppsNeededData = function (result) {
                    var keysToReturn = ['appDefinitionId', 'slug', 'widgets', 'name', 'appIcon', 'weights', 'categories', 'by', 'description', 'hasSection'];
                    _.forEach(result, function (app) {
                        _.forEach(keysToReturn, function (key) {
                            expect(_.has(app, key)).toBeTruthy();
                        });
                    });

                    _.forEach(result, function (app) {
                        expect(_.has(app, 'hideAppFirstTimeMsg')).toBeFalsy();
                    });
                };

                it('should map results data if data is an array', function () {
                    var data = [appData];
                    assertRelatedAppsNeededData(appMarketService.relatedAppsNeededData(data));
                });

                it('should map results data if data is obj', function () {
                    assertRelatedAppsNeededData(appMarketService.relatedAppsNeededData(appData));
                });
            });

            describe('getYearlyPremiumApps', function () {

                it('should pass arguments to billing service call', function () {
                    spyOn(billing, 'getPremiumApps');
                    var resolve = jasmine.createSpy('resolve');
                    var reject = jasmine.createSpy('reject');
                    appMarketService.getPremiumApps({}, 'metasiteId', resolve, reject);
                    expect(billing.getPremiumApps).toHaveBeenCalledWith({}, 'metasiteId', jasmine.any(Function), reject);
                });

                it('should return empty array to callback in case no premiums', function () {
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success({
                            payload: {
                                tpaPackages: []
                            }
                        });
                    });
                    var resolve = jasmine.createSpy('callback');
                    appMarketService.getPremiumApps(mockPs, 'metasiteId', resolve);
                    expect(resolve).toHaveBeenCalledWith([]);
                });

                it('should add upgraded applications upgradedToYearly param to cached data', function () {
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success({
                            payload: {
                                'tpaPackages': [
                                    {
                                        'appDefinitionId': '135aad86-9125-6074-7346-29dc6a3c9bcf',
                                        'vendorProductId': 'sale_monthly',
                                        'cycle': 3
                                    },
                                    {
                                        'appDefinitionId': '111111-9125-6074-7346-29dc6a3c9bcf',
                                        'vendorProductId': 'sale_yearly',
                                        'cycle': 6
                                    }
                                ]
                            }
                        });
                    });

                    var resolve = jasmine.createSpy('callback');
                    spyOn(cache, 'get').and.returnValue(mockAppData);
                    spyOn(cache, 'set');
                    appMarketService.getPremiumApps(mockPs, 'metasiteId', resolve);

                    expect(cache.set).toHaveBeenCalledWith('111111-9125-6074-7346-29dc6a3c9bcf', _.merge(mockAppData, {upgradedToYearly: true}));
                    expect(cache.set).toHaveBeenCalledWith('135aad86-9125-6074-7346-29dc6a3c9bcf', _.merge(mockAppData, {upgradedToYearly: false}));
                });

                it('should get data from server and add the upgradedToYearly param to it when cache is empty', function () {
                    spyOn(cache, 'set').and.callThrough();
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        if (_.includes(ajaxArgs.url, 'http://editor.wix.com/_api/app-market-api')) {
                            ajaxArgs.success(mockAppData);
                        } else {
                            ajaxArgs.success({
                                payload: {
                                    'tpaPackages': [
                                        {
                                            'appDefinitionId': '135aad86-9125-6074-7346-29dc6a3c9bcf',
                                            'vendorProductId': 'sale_monthly',
                                            'cycle': 3
                                        },
                                        {
                                            'appDefinitionId': '111111-9125-6074-7346-29dc6a3c9bcf',
                                            'vendorProductId': 'sale_yearly',
                                            'cycle': 6
                                        }
                                    ]
                                }
                            });
                        }
                    });

                    var resolve = jasmine.createSpy('callback');
                    appMarketService.getPremiumApps(mockPs, 'metasiteId', resolve);

                    expect(cache.set).toHaveBeenCalledWith('111111-9125-6074-7346-29dc6a3c9bcf', _.merge(mockAppData, {upgradedToYearly: true}));
                    expect(cache.set).toHaveBeenCalledWith('135aad86-9125-6074-7346-29dc6a3c9bcf', _.merge(mockAppData, {upgradedToYearly: false}));
                });
            });

            describe('getAppReviewsUrl', function () {
                it('should return the app info url on the reviews tab ', function () {
                    var mockEditorParams = {
                        origin: 'http://editor.wix.com',
                        openMarketOrigin: 'settings_panel'
                    };
                    var appName = 'comments';
                    var url = appMarketService.getAppReviewsUrl(mockPs, mockEditorParams, appName);
                    expect(url).toContain('#/' + appName + '/reviews');
                });
            });

            describe('getPackages', function () {

                beforeEach(function () {
                    this.packages = [{
                        "id": "Premium3",
                        "name": "Basic",
                        "description": "Premium3",
                        "price": "4.59",
                        "is_active": true,
                        "freeMonth": false,
                        "monthly": {
                            "price": "4.59"
                        },
                        "yearly": {
                            "price": "3.99"
                        },
                        "oneTime": {
                            "price": "6.99"
                        },
                        "bestSellingFeature": "30 Forms Fields",
                        "discountPercent": 13
                    }];
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.success({
                            purchaseStartUrl: 'https://premium.wix.com/wix/api/tpaPriceQuote',
                            price: {
                                currencyCode: 'USD',
                                currencySymbol: '$'
                            },
                            packages: this.packages
                        });
                    }.bind(this));
                    cache.clear();
                });

                it('should return parsed packages json with all cycles', function (done) {
                    appMarketService.getPackages(mockPs, 'appDefId', 'instanceId').then(function (data) {
                        expect(data).toEqual([{
                            "currencyCode": "USD",
                            "currencySymbol": "$",
                            "id": "Premium3",
                            "name": "Basic",
                            "description": "Premium3",
                            "price": "4.59",
                            "is_active": true,
                            "freeMonth": false,
                            "monthly": {
                                "price": "4.59",
                                "url": "https://premium.wix.com/wix/api/tpaPriceQuote?appInstanceId=instanceId&appDefinitionId=appDefId&paymentCycle=MONTHLY&vendorProductId=Premium3"
                            },
                            "yearly": {
                                "price": "3.99",
                                "url": "https://premium.wix.com/wix/api/tpaPriceQuote?appInstanceId=instanceId&appDefinitionId=appDefId&paymentCycle=YEARLY&vendorProductId=Premium3"
                            },
                            "oneTime": {
                                "price": "6.99",
                                "url": "https://premium.wix.com/wix/api/tpaPriceQuote?appInstanceId=instanceId&appDefinitionId=appDefId&paymentCycle=ONE_TIME&vendorProductId=Premium3"
                            },
                            "bestSellingFeature": "30 Forms Fields",
                            "discountPercent": 13
                        }]);
                        done();
                    });
                });

                it('should not add url to a cycle that it is not defined', function (done) {
                    delete this.packages[0].yearly;
                    delete this.packages[0].oneTime;

                    appMarketService.getPackages(mockPs, 'appDefId', 'instanceId').then(function (data) {
                        expect(data).toEqual([{
                            "currencyCode": "USD",
                            "currencySymbol": "$",
                            "id": "Premium3",
                            "name": "Basic",
                            "description": "Premium3",
                            "price": "4.59",
                            "is_active": true,
                            "freeMonth": false,
                            "monthly": {
                                "price": "4.59",
                                "url": "https://premium.wix.com/wix/api/tpaPriceQuote?appInstanceId=instanceId&appDefinitionId=appDefId&paymentCycle=MONTHLY&vendorProductId=Premium3"
                            },
                            "bestSellingFeature": "30 Forms Fields",
                            "discountPercent": 13
                        }]);
                        done();
                    });
                });

                it('should remove a cycle that has no price', function (done) {
                    delete this.packages[0].monthly.price;

                    appMarketService.getPackages(mockPs, 'appDefId', 'instanceId').then(function (data) {
                        expect(data[0]).not.toEqual(jasmine.objectContaining({
                            "monthly": jasmine.any(Object)
                        }));
                        done();
                    });
                });

                it('should call onError callback if error occurs', function (done) {
                    ajaxSpy.and.callFake(function (ajaxArgs) {
                        ajaxArgs.error({
                            error: 'error'
                        });
                    });

                    appMarketService.getPackages(mockPs, 'appDefId', 'instanceId').then(_.noop, function (error) {
                        expect(error).toEqual({error: 'app market response error for appDefinitionId: appDefId'});
                        done();
                    });
                });
            });
        });
    });
