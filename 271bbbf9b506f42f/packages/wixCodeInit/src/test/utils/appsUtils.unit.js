define(['lodash', 'testUtils', 'wixCodeInit/utils/appsUtils'], function(_, testUtils, appsUtils){
    'use strict';

    describe('appsUtils', function(){
        function withoutUrl(result) {
            return _.map(result, _.partialRight(_.omit, 'url'));
        }
        describe('getApplications', function(){
            it('should return the platformApps from clientSpecMap', function(){
                var clientSpecMapMocks = testUtils.mockFactory.clientSpecMapMocks;
	            var ecommerceSpecMap = clientSpecMapMocks.hybridApp(clientSpecMapMocks.ecommerce());
                var mockSiteData = testUtils.mockFactory.mockSiteData()
                    .overrideClientSpecMap({})
                    .updateClientSpecMap(clientSpecMapMocks.wixapps())
                    .updateClientSpecMap(ecommerceSpecMap);
                var expectedResult = [{
                    id: ecommerceSpecMap.appDefinitionId,
                    displayName: ecommerceSpecMap.type,
                    appInnerId: ecommerceSpecMap.applicationId,
                    url: ecommerceSpecMap.platformApp.viewerUrl,
                    type: 'Application'
                }];

                var result = appsUtils.getApplications(mockSiteData.getClientSpecMap(), mockSiteData.getAllPossiblyRenderedRoots(), mockSiteData);

                expect(result).toEqual(expectedResult);
            });

            it('should return an empty array if no app in client spec map is a platformApp', function(){
                var clientSpecMap = {
                    14: {
                        type: 'wixapps',
                        applicationId: 15,
                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad7',
                        datastoreId: '138fd00e-ef2f-903d-d5e7-41c895e75d46',
                        state: 'Template'
                    },
                    20: {
                        type: 'ecommerce',
                        applicationId: 21,
                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10',
                        magentoStoreId: '',
                        state: false
                    }
                };
                var mockSiteData = testUtils.mockFactory.mockSiteData().overrideClientSpecMap(clientSpecMap);

                var result = appsUtils.getApplications(mockSiteData.getClientSpecMap(), mockSiteData.getAllPossiblyRenderedRoots(), mockSiteData);

                expect(result).toEqual([]);
            });

            it('should return also dataBinding spec map if wixCode is in clientSpecMap', function(){
                var clientSpecMap = {
                    14: {
                        type: 'wixapps',
                        applicationId: 15,
                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad7',
                        datastoreId: '138fd00e-ef2f-903d-d5e7-41c895e75d46',
                        state: 'Template'
                    },
                    20: {
                        type: 'ecommerce',
                        applicationId: 21,
                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10',
                        magentoStoreId: '',
                        state: false
                    },
                    22: {
                        type: 'siteextension',
                        applicationId: 22,
                        appDefinitionId: '77e2b284-88a3-40f6-81b9-47b551d36dac',
                        extensionId: 'extension-id1',
                        instanceId: 'instance-id1',
                        instance: 'signed-instance1',
                        cloudNotProvisioned: true
                    }
                };
                var mockSiteData = testUtils.mockFactory.mockSiteData();
                _.forEach(mockSiteData.getAllPossiblyRenderedRoots(), function (rootId) {
                    mockSiteData.setPagePlatformApp(rootId, 'wixCode', true);
                });
                mockSiteData.overrideClientSpecMap(clientSpecMap);
                var dataBindingSpec = {id: 'dataBinding', displayName: 'Data Binding', type: 'Application'};
                var currentUrlPageId = mockSiteData.getCurrentUrlPageId();
                var pageWixCodeExpectedData = {
                    id: currentUrlPageId,
                    displayName: mockSiteData.getData(currentUrlPageId).title,
                    type: 'Page'
                };
                var masterPageWixCodeExpectedData = {
                    type: 'masterPage',
                    id: currentUrlPageId
                };
                var expectedResult = [dataBindingSpec, pageWixCodeExpectedData, masterPageWixCodeExpectedData];

                var result = appsUtils.getApplications(mockSiteData.getClientSpecMap(), mockSiteData.getAllPossiblyRenderedRoots(), mockSiteData);

                expect(withoutUrl(result)).toEqual(withoutUrl(expectedResult));
                expect(_(result).chain().find('url').get('url')).toMatch(/http:\/\/static\.parastorage\.com\/services\/dbsm-viewer-app\/\d+\.\d+\.\d+\/app\.js/);
            });

            it("should not return page's wix code app if it's wixCode value in pagesPlatformApplications is falsy", function(){
                var clientSpecMap = {
                    22: {
                        type: 'siteextension',
                        applicationId: 22,
                        appDefinitionId: '77e2b284-88a3-40f6-81b9-47b551d36dac',
                        extensionId: 'extension-id1',
                        instanceId: 'instance-id1',
                        instance: 'signed-instance1',
                        cloudNotProvisioned: true
                    }
                };

                var mockSiteData = testUtils.mockFactory.mockSiteData()
                    .overrideClientSpecMap(clientSpecMap);
                mockSiteData.setPagePlatformApp('masterPage', 'wixCode', true);
                var dataBindingSpec = {id: 'dataBinding', displayName: 'Data Binding', type: 'Application'};
                var masterPageWixCodeExpectedData = {
                    id: mockSiteData.getPrimaryPageId(),
                    type: 'masterPage'
                };
                var expectedResult = [dataBindingSpec, masterPageWixCodeExpectedData];

                var result = appsUtils.getApplications(mockSiteData.getClientSpecMap(), mockSiteData.getAllPossiblyRenderedRoots(), mockSiteData);

                expect(withoutUrl(result)).toEqual(withoutUrl(expectedResult));
            });

            it("should not return masterPage's wix code app if there is no rootId of type Page", function(){
                var popupId = 'popupId';
                var clientSpecMap = {
                    22: {
                        type: 'siteextension',
                        applicationId: 22,
                        appDefinitionId: '77e2b284-88a3-40f6-81b9-47b551d36dac',
                        extensionId: 'extension-id1',
                        instanceId: 'instance-id1',
                        instance: 'signed-instance1',
                        cloudNotProvisioned: true
                    }
                };

                var mockSiteData = testUtils.mockFactory.mockSiteData()
                    .overrideClientSpecMap(clientSpecMap)
                    .addPopupPageWithDefaults(popupId);
                mockSiteData.setPagePlatformApp(popupId, 'wixCode', true);
                mockSiteData.setPagePlatformApp('masterPage', 'wixCode', true);
                var dataBindingSpec = {id: 'dataBinding', displayName: 'Data Binding', type: 'Application'};
                var popupWixCodeExpectedData = {
                    id: popupId,
                    displayName: mockSiteData.getData(popupId).title,
                    type: 'Popup'
                };

                var expectedResult = [dataBindingSpec, popupWixCodeExpectedData];

                var result = appsUtils.getApplications(mockSiteData.getClientSpecMap(), [popupId], mockSiteData);

                expect(withoutUrl(result)).toEqual(withoutUrl(expectedResult));
            });

            it('should return also local type, id, url and name', function(){
                var mockSiteData = testUtils.mockFactory.mockSiteData()
                    .overrideClientSpecMap({})
                    .updateCurrentUrl({query: {viewerPlatformAppSources: 'port:3000,path:javascripts/viewer.js,id:btn'}});
                var localAppExpectedData = [{
                    type: 'Application',
                    id: 'btn',
                    url: 'http://localhost:3000/javascripts/viewer.js',
                    displayName: 'btn'
                }];

                var result = appsUtils.getApplications(mockSiteData.getClientSpecMap(), mockSiteData.getAllPossiblyRenderedRoots(), mockSiteData);

                expect(result).toEqual(localAppExpectedData);
            });

            describe('customRouterData', function(){
                var clientSpecMap = {
                    1317: {
                        "type": "siteextension",
                        "applicationId": 1317,
                        "appDefinitionId": "3ac1a124-fc08-448c-8fe2-46d12fa64368",
                        "extensionId": "3ac1a124-fc08-448c-8fe2-46d12fa64368",
                        "instanceId": "35f575a0-996b-4d50-a7ad-4fd4be4d83b9"
                    },
                    21: {
                        type: 'ecommerce',
                        applicationId: 21,
                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10',
                        magentoStoreId: '',
                        state: false,
                        platformApp: {
                            viewerUrl: 'http://ecom.wix.com',
                            editorUrl: 'http://ecom.editor.wix.com',
                            routerUrl: 'http://ecom.router.wix.com',
                            dependencies: ['e4c4a4fb-673d-493a-9ef1-661fa3823ad7']
                        }
                    }
                };

                beforeEach(function(){
                    testUtils.experimentHelper.openExperiments('sv_dpages');
                    this.pageId = 'page1';
                    this.prefix = 'prefix';

                    var baseUrl = 'http://david.wix.com/david-site';
                    this.siteData = testUtils.mockFactory.mockSiteData()
                      .setExternalBaseUrl(baseUrl)
                      .useSlashUrl()
                      .addPageWithData(this.pageId, testUtils.mockFactory.dataMocks.pageData({title: 'some dynamic router page title'}))
                      .setCurrentPage(this.pageId)
                      .overrideClientSpecMap(clientSpecMap)
                      .updateCurrentUrl({full: baseUrl + '/' + this.prefix});
                });

                function testRouterOnlyForApp(appType, appId, expectationCB) {
                    _.forEach(this.siteData.getAllPossiblyRenderedRoots(), function (rootId) {
                        this.siteData.setPagePlatformApp(rootId, 'wixCode', true);
                    }, this);
                    appId = appId || _.first(this.siteData.getClientSpecMapEntriesByType(appType)).appDefinitionId;
                    var routerConfig = testUtils.mockFactory.routerMocks.routerConfig(this.prefix, appId, {blank: this.pageId});
                    this.siteData.addDynamicPageData(this.pageId, 'your dynamic page data', routerConfig);
                    this.siteData.addRouterConfig(routerConfig);
                    var result = appsUtils.getApplications(clientSpecMap, [this.pageId], this.siteData);
                    expect(_.size(result) >= _.size(this.clientSpecMap)).toBeTruthy();

                    expectationCB(result);
                }

                it('should add customRouterData only to wixCode app for user defined custom router', function(){
                    testRouterOnlyForApp.call(this, 'siteextension', 'wix-code', function(platformApplications) {
                        var appsWithRouterData = _.filter(platformApplications, 'routerData');
                        expect(appsWithRouterData.length).toEqual(2);
                        _.forEach(appsWithRouterData, function(appWithRouterData) {
                            var isPage = appWithRouterData.type === 'Page';
                            var isMasterPage = appWithRouterData.type === 'masterPage';
                            expect(isPage || isMasterPage).toBeTruthy();
                        });
                    });
                });

                it('should add customRouterData only to app that owns the router', function(){
                    testRouterOnlyForApp.call(this, 'ecommerce', undefined, function (platformApplications) {
                        var appsWithRouterData = _.filter(platformApplications, 'routerData');
                        expect(appsWithRouterData.length).toEqual(1);
                        expect(appsWithRouterData[0].displayName).toEqual('ecommerce');
                    });
                });
            });
        });

        describe('getAppsBaseInfo', function(){
            it('should return the platformApps from clientSpecMap', function(){
                var clientSpecMapMocks = testUtils.mockFactory.clientSpecMapMocks;
                var ecommerceSpecMap = clientSpecMapMocks.hybridApp(clientSpecMapMocks.ecommerce());
                var mockSiteData = testUtils.mockFactory.mockSiteData()
                    .overrideClientSpecMap({})
                    .updateClientSpecMap(clientSpecMapMocks.wixapps())
                    .updateClientSpecMap(ecommerceSpecMap);
                var expectedResult = [{
                    id: ecommerceSpecMap.appDefinitionId,
                    displayName: ecommerceSpecMap.type,
                    appInnerId: ecommerceSpecMap.applicationId,
                    url: ecommerceSpecMap.platformApp.viewerUrl,
                    type: 'Application'
                }];

                var result = appsUtils.getAppsBaseInfo(mockSiteData.getClientSpecMap(), mockSiteData.serviceTopology, null, mockSiteData.getAllPossiblyRenderedRoots());

                expect(result).toEqual(expectedResult);
            });

            it('should return an empty array if no app in client spec map is a platformApp', function(){
                var clientSpecMap = {
                    14: {
                        type: 'wixapps',
                        applicationId: 15,
                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad7',
                        datastoreId: '138fd00e-ef2f-903d-d5e7-41c895e75d46',
                        state: 'Template'
                    },
                    20: {
                        type: 'ecommerce',
                        applicationId: 21,
                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10',
                        magentoStoreId: '',
                        state: false
                    }
                };
                var mockSiteData = testUtils.mockFactory.mockSiteData().overrideClientSpecMap(clientSpecMap);

                var result = appsUtils.getAppsBaseInfo(mockSiteData.getClientSpecMap(), mockSiteData.serviceTopology, null, mockSiteData.getAllPossiblyRenderedRoots());

                expect(result).toEqual([]);
            });

            it('should return dataBinding only when wixCode is in clientSpecMap', function(){
                var clientSpecMap = {
                    14: {
                        type: 'wixapps',
                        applicationId: 15,
                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad7',
                        datastoreId: '138fd00e-ef2f-903d-d5e7-41c895e75d46',
                        state: 'Template'
                    },
                    20: {
                        type: 'ecommerce',
                        applicationId: 21,
                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10',
                        magentoStoreId: '',
                        state: false
                    },
                    22: {
                        type: 'siteextension',
                        applicationId: 22,
                        appDefinitionId: '77e2b284-88a3-40f6-81b9-47b551d36dac',
                        extensionId: 'extension-id1',
                        instanceId: 'instance-id1',
                        instance: 'signed-instance1',
                        cloudNotProvisioned: true
                    }
                };

                var mockSiteData = testUtils.mockFactory.mockSiteData().overrideClientSpecMap(clientSpecMap);

                var result = appsUtils.getAppsBaseInfo(mockSiteData.getClientSpecMap(), mockSiteData.serviceTopology, null, mockSiteData.getAllPossiblyRenderedRoots());

                expect(withoutUrl(result)).toEqual([{id: 'dataBinding', type: 'Application', displayName: 'Data Binding'}]);
                expect(_(result).chain().find('url').get('url')).toMatch(/http:\/\/static\.parastorage\.com\/services\/dbsm-viewer-app\/\d+\.\d+\.\d+\/app\.js/);
            });

            it('should return also local type, id, url and name', function(){
                var viewerPlatformAppSources = 'port:3000,path:javascripts/viewer.js,id:btn';
                var mockSiteData = testUtils.mockFactory.mockSiteData()
                    .overrideClientSpecMap({})
                    .updateCurrentUrl({query: {viewerPlatformAppSources: viewerPlatformAppSources}});
                var localAppExpectedData = [{
                    type: 'Application',
                    id: 'btn',
                    url: 'http://localhost:3000/javascripts/viewer.js',
                    displayName: 'btn'
                }];

                var result = appsUtils.getAppsBaseInfo(mockSiteData.getClientSpecMap(), mockSiteData.serviceTopology, viewerPlatformAppSources, mockSiteData.getAllPossiblyRenderedRoots());

                expect(result).toEqual(localAppExpectedData);
            });

            it('should not customRouterData to app that owns the router', function(){
                testUtils.experimentHelper.openExperiments('sv_dpages');
                var clientSpecMap = {
                    1317: {
                        "type": "siteextension",
                        "applicationId": 1317,
                        "appDefinitionId": "3ac1a124-fc08-448c-8fe2-46d12fa64368",
                        "extensionId": "3ac1a124-fc08-448c-8fe2-46d12fa64368",
                        "instanceId": "35f575a0-996b-4d50-a7ad-4fd4be4d83b9"
                    },
                    21: {
                        type: 'ecommerce',
                        applicationId: 21,
                        appDefinitionId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10',
                        magentoStoreId: '',
                        state: false,
                        platformApp: {
                            viewerUrl: 'http://ecom.wix.com',
                            editorUrl: 'http://ecom.editor.wix.com',
                            routerUrl: 'http://ecom.router.wix.com',
                            dependencies: ['e4c4a4fb-673d-493a-9ef1-661fa3823ad7']
                        }
                    }
                };
                this.pageId = 'page1';
                this.prefix = 'prefix';

                var baseUrl = 'http://david.wix.com/david-site';
                this.siteData = testUtils.mockFactory.mockSiteData()
                    .setExternalBaseUrl(baseUrl)
                    .useSlashUrl()
                    .addPageWithData(this.pageId, testUtils.mockFactory.dataMocks.pageData({title: 'some dynamic router page title'}))
                    .setCurrentPage(this.pageId)
                    .overrideClientSpecMap(clientSpecMap)
                    .updateCurrentUrl({full: baseUrl + '/' + this.prefix});

                var appType = 'ecommerce';
                var appId = _.first(this.siteData.getClientSpecMapEntriesByType(appType)).appDefinitionId;
                var routerConfig = testUtils.mockFactory.routerMocks.routerConfig(this.prefix, appId, {blank: this.pageId});
                this.siteData.addDynamicPageData(this.pageId, 'your dynamic page data', routerConfig);
                this.siteData.addRouterConfig(routerConfig);


                var result = appsUtils.getAppsBaseInfo(this.siteData.getClientSpecMap(), this.siteData.serviceTopology, null, [this.pageId]);

                var appsWithRouterData = _.filter(result, 'routerData');
                expect(appsWithRouterData.length).toEqual(0);
            });
        });
    });
});
