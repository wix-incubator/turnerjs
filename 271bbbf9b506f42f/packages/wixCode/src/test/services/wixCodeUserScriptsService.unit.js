define([
    'lodash',
    'coreUtils',
    'testUtils',
    'wixCode/services/wixCodeUserScriptsService'
], function (_, coreUtils, testUtils, wixCodeUserScriptsService) {
    'use strict';

    describe('wixCodeUserScriptsService', function () {
        function getSiteData(wixCodeSpec, isDocumentServices) {
            return testUtils.mockFactory.mockSiteData(null, isDocumentServices)
                .updateClientSpecMap(wixCodeSpec);
        }

        describe('getUserScript', function () {
            it('should return details for a page', function() {
                var wixCodeSpec = testUtils.mockFactory.clientSpecMapMocks.wixCode();
                var siteData = getSiteData(wixCodeSpec);
                var wixCodeModel = siteData.rendererModel.wixCodeModel;

                var widget = {
                    displayName: 'HOME',
                    id: 'c1dmp',
                    type: 'Page'
                };
                
                var entry = wixCodeUserScriptsService.getUserScript(widget, wixCodeModel, wixCodeSpec, siteData);
                
                expect(entry.scriptName).toEqual('c1dmp.js');
                expect(entry.displayName).toEqual('HOME page');
            });

            it('should return details for a popup', function() {
                var wixCodeSpec = testUtils.mockFactory.clientSpecMapMocks.wixCode();
                var siteData = testUtils.mockFactory.mockSiteData().updateClientSpecMap(wixCodeSpec);
                var wixCodeModel = siteData.rendererModel.wixCodeModel;

                var widget = {
                    displayName: 'Surprise',
                    id: 'popup1',
                    type: 'Popup'
                };
                
                var entry = wixCodeUserScriptsService.getUserScript(widget, wixCodeModel, wixCodeSpec, siteData);
                
                expect(entry.scriptName).toEqual('popup1.js');
                expect(entry.displayName).toEqual('Surprise popup');
            });

            it('should return details for the master page code', function() {
                var wixCodeSpec = testUtils.mockFactory.clientSpecMapMocks.wixCode();
                var siteData = testUtils.mockFactory.mockSiteData().updateClientSpecMap(wixCodeSpec);
                var wixCodeModel = siteData.rendererModel.wixCodeModel;

                var widget = {
                    id: 'masterPage',
                    type: 'masterPage'
                };
                
                var entry = wixCodeUserScriptsService.getUserScript(widget, wixCodeModel, wixCodeSpec, siteData);
                
                expect(entry.scriptName).toEqual('masterPage.js');
                expect(entry.displayName).toEqual('site');
            });

            describe('url', function() {
                describe('in viewMode=preview', function() {
                    it('should return editor url format', function() {
                        var wixCodeSpec = testUtils.mockFactory.clientSpecMapMocks.wixCode();
                        var siteData = getSiteData(wixCodeSpec, true);
                        siteData.wixCode = {
                            defaultFileCacheKiller: 123
                        };

                        // expect(siteData.viewMode).toEqual('preview'); // TBD remove

                        var wixCodeModel = siteData.rendererModel.wixCodeModel;

                        var widget = {
                            displayName: 'HOME',
                            id: 'c1dmp',
                            type: 'Page'
                        };
                        var urlDetails = wixCodeUserScriptsService.getUserScript(widget, wixCodeModel, wixCodeSpec, siteData);

                        var url = urlDetails.url;
                        var urlWithoutQuery = url.substring(0, url.indexOf('?'));
                        var queryParams = url.substring(url.indexOf('?') + 1);

                        var baseUrl = 'http://' + wixCodeSpec.extensionId + '.' + siteData.serviceTopology.wixCloudBaseDomain;

                        var expectedUrl = baseUrl + '/pages/' + widget.id + '.js';

                        expect(urlWithoutQuery).toEqual(expectedUrl);
                        expect(coreUtils.urlUtils.parseUrlParams(queryParams)).toEqual({
                            'module-name': widget.id,
                            'empty-if-missing': 'true',
                            viewMode: 'preview',
                            scari: wixCodeModel.signedAppRenderInfo,
                            instance: wixCodeSpec.instance,
                            cacheKiller: '123'
                        });
                    });

                    it('should use a specific cacheKiller if one exists', function() {
                        var wixCodeSpec = testUtils.mockFactory.clientSpecMapMocks.wixCode();
                        var siteData = getSiteData(wixCodeSpec, true);
                        siteData.wixCode = {
                            fileCacheKillers: {
                                'public/pages/c1dmp.js': '456'
                            },
                            defaultFileCacheKiller: '123'
                        };

                        var wixCodeModel = siteData.rendererModel.wixCodeModel;

                        var widget = {
                            displayName: 'HOME',
                            id: 'c1dmp',
                            type: 'Page'
                        };
                        var scriptDetails = wixCodeUserScriptsService.getUserScript(widget, wixCodeModel, wixCodeSpec, siteData);

                        var url = scriptDetails.url;
                        var queryParams = url.substring(url.indexOf('?') + 1);

                        expect(coreUtils.urlUtils.parseUrlParams(queryParams).cacheKiller).toEqual('456');
                    });

                    it('should use the default cacheKiller if a specific one does not exist', function() {
                        var wixCodeSpec = testUtils.mockFactory.clientSpecMapMocks.wixCode();
                        var siteData = getSiteData(wixCodeSpec, true);
                        siteData.wixCode = {
                            fileCacheKillers: {
                            },
                            defaultFileCacheKiller: '123'
                        };

                        var wixCodeModel = siteData.rendererModel.wixCodeModel;

                        var widget = {
                            displayName: 'HOME',
                            id: 'c1dmp',
                            type: 'Page'
                        };
                        var scriptDetails = wixCodeUserScriptsService.getUserScript(widget, wixCodeModel, wixCodeSpec, siteData);

                        var url = scriptDetails.url;
                        var queryParams = url.substring(url.indexOf('?') + 1);

                        expect(coreUtils.urlUtils.parseUrlParams(queryParams).cacheKiller).toEqual('123');
                    });
                });

                describe('in viewMode=site', function() {
                    it('should return cache-friendly urls', function() {
                        var wixCodeSpec = testUtils.mockFactory.clientSpecMapMocks.wixCode();

                        var siteData = getSiteData(wixCodeSpec);

                        var wixCodeModel = siteData.rendererModel.wixCodeModel;

                        var widget = {
                            displayName: 'HOME',
                            id: 'c1dmp',
                            type: 'Page'
                        };
                        var scriptDetails = wixCodeUserScriptsService.getUserScript(widget, wixCodeModel, wixCodeSpec, siteData);

                        var gridAppId = wixCodeModel.appData.codeAppId;
                        var instanceId = wixCodeSpec.instanceId;

                        var url = scriptDetails.url;
                        var urlWithoutQuery = url.substring(0, url.indexOf('?'));
                        var queryParams = url.substring(url.indexOf('?') + 1);

                        var baseUrl = 'http://' + wixCodeSpec.extensionId + '.static.' + siteData.serviceTopology.wixCloudBaseDomain;

                        var expectedUrl = baseUrl + '/static/v1/' + gridAppId + '/' + instanceId + '/pages/' + widget.id + '.js';

                        expect(urlWithoutQuery).toEqual(expectedUrl);
                        expect(coreUtils.urlUtils.parseUrlParams(queryParams)).toEqual({
                            'module-name': widget.id,
                            'empty-if-missing': 'true'
                        });
                    });
                });
            });
        });
    });
});
