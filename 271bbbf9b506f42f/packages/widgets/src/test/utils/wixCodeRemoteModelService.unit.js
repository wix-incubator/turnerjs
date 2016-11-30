define([
    'lodash',
    'testUtils',
    'widgets/utils/wixCodeRemoteModelService'], function(_, testUtils, wixCodeRemoteModelService) {
   'use strict';

    describe('RMIService', function() {

        var compId = 'compId';
        var compId2 = 'compId2';
        var pageId = 'page1';
        var layout = {barvaz: 'oger', shahar: 'zur'};

        function getMockCompStructure(aCompId, aLayout, connectionQuery) {
            var comp = {
                id: aCompId,
                componentType: aCompId + 'Type',
                type: 'Component',
                skin: aCompId + 'skin',
                propertyQuery: aCompId + 'PropQuery',
                dataQuery: aCompId + 'DataQuery',
                styleId: aCompId + 'PropQuery',
                layout: aLayout || {},
                modes: {
                    overrides: [{
                        modeIds: ['acive-page-mode-1'],
                        layout: {
                            nir: 'likes-beer'
                        }
                    }]
                }
            };

            if (connectionQuery) {
                comp.connectionQuery = connectionQuery;
            }

            return comp;
        }

        function getMockComponentsModel(compStructures) {
            return _.transform(compStructures, function (result, compStructure) {
                result[compStructure.id] = {
                    parent: pageId,
                    type: compStructure.componentType,
                    state: {},
                    data: {},
                    design: {},
                    props: {},
                    layout: compStructure.layout,
                    isDisplayed: true,
                    id: compStructure.name || compStructure.id,
                    events: []
                };
            }, {});
        }

        function getMockPagesData() {
            return {
                currentPageId: 'page1',
                baseUrl: 'mockExternalBaseUrl',
                pagesData: [
                    {
                        id: 'currentPage',
                        fullUrl: 'mockExternalBaseUrl#!currentPage/currentPage',
                        title: '',
                        url: '/currentPage',
                        visible: ''
                    },
                    {
                        id: 'page1',
                        fullUrl: 'mockExternalBaseUrl#!pageUriSEO page1/page1',
                        title: 'title page1',
                        url: '/pageUriSEO page1',
                        visible: false
                    }
                ]
            };
        }

        beforeEach(function () {
            testUtils.experimentHelper.openExperiments('connectionsData');
            this.nickname = 'nickname';
            this.components = [getMockCompStructure(compId, layout), getMockCompStructure(compId2, layout, 'wixCodeConnection')];
            this.siteData = testUtils.mockFactory.mockSiteData()
                .addPageWithDefaults(pageId)
                .setPageComponents(this.components, pageId)
                .addConnectionsDataMap();
            this.siteData.setRootNavigationInfo({pageId: pageId});
            var connections = [
                testUtils.mockFactory.connectionMocks.wixCodeConnectionItem(this.nickname)
            ];
            this.siteData.addConnections(testUtils.mockFactory.connectionMocks.connectionList(connections, 'wixCodeConnection'), pageId);
            var siteAPI = testUtils.mockFactory.mockSiteAPI(this.siteData);
            this.runtimeDal = siteAPI.getRuntimeDal();
            this.pagesDataForRmi = getMockPagesData();
        });

        describe('generateRemoteModelInterface', function () {
            beforeEach(function () {
                this.onUpdateCallback = jasmine.createSpy('onUpdateCallback');
            });

            it('should add components data according to dal', function() {
                var RMI = wixCodeRemoteModelService.generateRemoteModelInterface(this.runtimeDal, [compId, compId2], this.pagesDataForRmi, this.onUpdateCallback, pageId);

                var model = RMI.toJson();
                var componentsModel = getMockComponentsModel(this.components);
                componentsModel.compId2.id = this.nickname;
                expect(model.components).toEqual(componentsModel);
            });

            it('should add pages data', function () {
                var RMI = wixCodeRemoteModelService.generateRemoteModelInterface(this.runtimeDal, [compId, compId2], this.pagesDataForRmi, this.onUpdateCallback, pageId);
                var model = RMI.toJson();

                expect(model.pages).toEqual(this.pagesDataForRmi);
            });

            it('should add connections data according to dal', function () {
                var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.siteData, pageId);
                var components = [getMockCompStructure(compId, layout, 'connection1'), getMockCompStructure(compId2, layout, 'connection2')];
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(pageId)
                    .setPageComponents(components, pageId);

                siteData.setRootNavigationInfo({pageId: pageId});

                var connections = [
                    testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('nickname1'),
                    testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'role1', {src: 'myPic'})
                ];
                var otherConnections = [
                    testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('nickname2'),
                    testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'role2', {src: 'myPic'})
                ];

                siteData.addConnections(testUtils.mockFactory.connectionMocks.connectionList(connections, 'connection1'), pageId);
                siteData.addConnections(testUtils.mockFactory.connectionMocks.connectionList(otherConnections, 'connection2'), pageId);

                var siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
                var runtimeDal = siteAPI.getRuntimeDal();

                var RMI = wixCodeRemoteModelService.generateRemoteModelInterface(runtimeDal, [compId, compId2], this.pagesDataForRmi, this.onUpdateCallback, pageId);

                var model = RMI.toJson();
                var expectedConnectionModel = {
                    page1: {
                        nickname1: {
                            compId: null
                        },
                        nickname2: {
                            compId2: null
                        }
                    }
                };
                expectedConnectionModel[controller.dataQuery] = {
                    role1: {
                        compId: {src: 'myPic'}
                    },
                    role2: {
                        compId2: {src: 'myPic'}
                    }
                };

                expect(model.connections).toEqual(expectedConnectionModel);
            });

            it('should set update callback', function () {
                var RMI = wixCodeRemoteModelService.generateRemoteModelInterface(this.runtimeDal, [compId, compId2], this.pagesDataForRmi, this.onUpdateCallback);
                RMI.setData('compId', {more: 'data'});
                expect(this.onUpdateCallback).toHaveBeenCalledWith('compId', 'data', {more: 'data'});
            });
        });

        describe('createRemoteModelInterface', function () {
            it('should create RMI from json', function() {
                var onUpdateCallback = jasmine.createSpy('onUpdateCallback');
                var RMI = wixCodeRemoteModelService.generateRemoteModelInterface(this.runtimeDal, [compId, compId2], this.pagesDataForRmi, onUpdateCallback);
                var model = RMI.toJson();
                var RMI2 = wixCodeRemoteModelService.createRemoteModelInterface(model, onUpdateCallback);
                expect(RMI2.toJson()).toEqual(model);
            });
        });
    });
});
