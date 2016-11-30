define(['lodash', 'testUtils', 'widgets/core/modelBuilder', 'utils', 'siteUtils', 'components/components/sliderGallery/sliderGallery'], function(_, testUtils, modelBuilder, utils, siteUtils, sliderGallery){
    'use strict';

    describe('modelBuilder', function(){

        describe('build', function(){
            var newPageId = 'myNewPageId';
            var componentType = 'wysiwyg.viewer.components.WRichText';

            beforeEach(function(){
                testUtils.experimentHelper.openExperiments('connectionsData');
                this.mockSiteData = testUtils.mockFactory.mockSiteData()
                    .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                    .addPageWithDefaults(newPageId)
                    .setCurrentPage(newPageId);
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
            });

            it('should contain EventTypes', function() {
                var siteDataDocumentAPI = this.mockSiteAPI.getSiteDataAPI().document;
                var componentsFetcher = siteDataDocumentAPI.getAllCompsUnderRoot.bind(siteDataDocumentAPI);
                var model = modelBuilder.build(this.mockSiteAPI.getRuntimeDal(), this.mockSiteData, [newPageId], _.noop, componentsFetcher);

                var modelJson = model[newPageId].toJson();
                expect(modelJson.EventTypes).toEqual(siteUtils.constants.ACTION_TYPES);
            });

            it('should collect the current page and master page components', function() {
                var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.mockSiteData, utils.siteConstants.MASTER_PAGE_ID);
                var compConnections = [testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole', {src: 'pic'})];
                var currentPageComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, newPageId, {connections: compConnections});
                var masterPageComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, utils.siteConstants.MASTER_PAGE_ID, {connections: compConnections});
                var expectedCompIdArr = ['SITE_FOOTER', 'SITE_HEADER', masterPageComponent.id, currentPageComponent.id, newPageId, controller.id];
                var siteDataDocumentAPI = this.mockSiteAPI.getSiteDataAPI().document;
                var componentsFetcher = siteDataDocumentAPI.getAllCompsUnderRoot.bind(siteDataDocumentAPI);

                var model = modelBuilder.build(this.mockSiteAPI.getRuntimeDal(), this.mockSiteData, [newPageId], _.noop, componentsFetcher);

                var modelJson = model[newPageId].toJson();
                expect(_(modelJson.components).keys().sortBy().value()).toEqual(_.sortBy(expectedCompIdArr));
                expect(_.get(modelJson, 'pages.currentPageId')).toEqual(newPageId);
                expect(_.size(modelJson)).toEqual(5);
            });

            it('should collect the current page and master page connections', function() {
                var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.mockSiteData, utils.siteConstants.MASTER_PAGE_ID);
                var config = {src: 'pic'};
                var compConnections = [testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole', config)];
                var currentPageComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, newPageId, {connections: _.clone(compConnections)});
                var masterPageComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, utils.siteConstants.MASTER_PAGE_ID, {connections: _.clone(compConnections)});
                var siteDataDocumentAPI = this.mockSiteAPI.getSiteDataAPI().document;
                var componentsFetcher = siteDataDocumentAPI.getAllCompsUnderRoot.bind(siteDataDocumentAPI);

                var expectedConnections = {};
                _.set(expectedConnections, [controller.dataQuery, 'someRole', currentPageComponent.id], config);
                _.set(expectedConnections, [controller.dataQuery, 'someRole', masterPageComponent.id], config);

                var model = modelBuilder.build(this.mockSiteAPI.getRuntimeDal(), this.mockSiteData, [newPageId], _.noop, componentsFetcher);

                var modelJson = model[newPageId].toJson();
                expect(modelJson.connections).toEqual(expectedConnections);
            });

            it('should collect components for the current view mode (desktop/mobile) only', function(){
                var desktopPageComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, newPageId);
                var mobilePageComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, newPageId, undefined, true);
                var siteDataDocumentAPI = this.mockSiteAPI.getSiteDataAPI().document;
                var componentsFetcher = siteDataDocumentAPI.getAllCompsUnderRoot.bind(siteDataDocumentAPI);

                this.mockSiteData.setMobileView(true);
                var model = modelBuilder.build(this.mockSiteAPI.getRuntimeDal(), this.mockSiteData, [newPageId], _.noop, componentsFetcher);

                var modelJson = model[newPageId].toJson();
                var modelComponentIds = _.keys(modelJson.components);
                expect(modelComponentIds).toContain(mobilePageComponent.id);
                expect(modelComponentIds).not.toContain(desktopPageComponent.id);
                expect(_.get(modelJson, 'pages.currentPageId')).toEqual(newPageId);
                expect(_.size(modelJson)).toEqual(5);
            });

            it('should collect components from master page only, in case there are no components on the current page', function(){
                var masterPageComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, utils.siteConstants.MASTER_PAGE_ID);
                var siteDataDocumentAPI = this.mockSiteAPI.getSiteDataAPI().document;
                var componentsFetcher = siteDataDocumentAPI.getAllCompsUnderRoot.bind(siteDataDocumentAPI);

                var model = modelBuilder.build(this.mockSiteAPI.getRuntimeDal(), this.mockSiteData, [newPageId], _.noop, componentsFetcher);

                var modelJson = model[newPageId].toJson();
                var modelComponentIds = _.keys(modelJson.components);
                expect(modelComponentIds).toEqual([newPageId, 'SITE_HEADER', 'SITE_FOOTER', masterPageComponent.id]);
                expect(_.get(modelJson, 'pages.currentPageId')).toEqual(newPageId);
                expect(_.size(modelJson)).toEqual(5);
            });

            it('should collect components from current page only, in case there are no components on the master page', function(){
                var currentPageComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, newPageId);
                var siteDataDocumentAPI = this.mockSiteAPI.getSiteDataAPI().document;
                var componentsFetcher = siteDataDocumentAPI.getAllCompsUnderRoot.bind(siteDataDocumentAPI);

                var model = modelBuilder.build(this.mockSiteAPI.getRuntimeDal(), this.mockSiteData, [newPageId], _.noop, componentsFetcher);

                var modelJson = model[newPageId].toJson();
                expect(_.keys(modelJson.components)).toEqual([newPageId, currentPageComponent.id, 'SITE_HEADER', 'SITE_FOOTER']);
                expect(_.get(modelJson, 'pages.currentPageId')).toEqual(newPageId);
                expect(_.size(modelJson)).toEqual(5);
            });

            xit('should not collect master page components for root whose widget type is not a page', function(){
                var popupId = 'myPopup';
                this.mockSiteData.addPopupPageWithDefaults(popupId).setCurrentPage(popupId);
                var popupComponent = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, popupId);
                var siteDataDocumentAPI = this.mockSiteAPI.getSiteDataAPI().document;
                var componentsFetcher = siteDataDocumentAPI.getAllCompsUnderRoot.bind(siteDataDocumentAPI);

                var model = modelBuilder.build(this.mockSiteAPI.getRuntimeDal(), this.mockSiteData, [newPageId, popupId], _.noop, componentsFetcher);

                var modelJson = model[popupId].toJson();
                expect(_(modelJson.components).keys().sortBy().value()).toEqual(_.sortBy([popupComponent.id, popupId]));
                expect(_.get(modelJson, 'pages.currentPageId')).toEqual(newPageId);
                expect(_.size(modelJson)).toEqual(3);
            });

            xit('should build model to contexts that contain widgets only, in case there is no wix code widget in clientSpecMap', function() {//TODO: complete this test once I discover how to get the information from CSM
                this.mockSiteData = testUtils.mockFactory.mockSiteData()
                    .overrideClientSpecMap({applicationId: 18, type: 'editor'})
                    .addPageWithDefaults(newPageId)
                    .setCurrentPage(newPageId);
                var mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, newPageId);
                testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, utils.siteConstants.MASTER_PAGE_ID);
                var siteDataDocumentAPI = mockSiteAPI.getSiteDataAPI().document;
                var componentsFetcher = siteDataDocumentAPI.getAllCompsUnderRoot.bind(siteDataDocumentAPI);

                var model = modelBuilder.build(mockSiteAPI.getRuntimeDal(), this.mockSiteData, this.mockSiteData.getAllPossiblyRenderedRoots(), _.noop, componentsFetcher);

                var modelJson = model[this.testPageId].toJson();
                var compsInModel = _(modelJson.children).map('compId').sortBy().value();
                expect(compsInModel).toEqual([]);
            });

            it('should collect components from both displayed and full json', function() {
                var testPageId = 'testPageId';
                var testContainerId = 'containerWithModes';
                var onlyInMasterCompId = 'onlyInMasterCompId';
                var onlyInModeCompId = 'onlyInModeCompId';
                var testModeId = 'testModeId';
                var fullSiteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(testPageId)
                    .setPageComponents([
                        testUtils.mockFactory.createStructure('mobile.core.components.Container', {
                            modes: {definitions: [{modeId: testModeId}]},
                            components: [
                                testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton', {
                                    layout: {testParam: 'original'},
                                    modes: {
                                        isHiddenByModes: false,
                                        overrides: [{
                                            modeIds: [testModeId],
                                            layout: {testParam: 'override'},
                                            isHiddenByModes: true
                                        }]
                                    }
                                }, onlyInMasterCompId),
                                testUtils.mockFactory.createStructure('wysiwyg.viewer.components.WPhoto', {
                                    layout: {testParam: 'original'},
                                    modes: {
                                        isHiddenByModes: true,
                                        overrides: [{
                                            modeIds: [testModeId],
                                            layout: {testParam: 'override'},
                                            isHiddenByModes: false
                                        }]
                                    }
                                }, onlyInModeCompId)
                            ]}, testContainerId)
                    ], testPageId)
                    .setCurrentPage(testPageId);

                var mockSiteAPI = testUtils.mockFactory.mockWixSiteReactFromFullJson(fullSiteData).siteAPI;
                var runtimeDal = mockSiteAPI.getRuntimeDal();
                var siteDataDocumentAPI = mockSiteAPI.getSiteDataAPI().document;
                var componentsFetcher = siteDataDocumentAPI.getAllCompsUnderRoot.bind(siteDataDocumentAPI);

                mockSiteAPI.activateModeById(testContainerId, testPageId, testModeId);
                var modelWithActiveMode = modelBuilder.build(runtimeDal, fullSiteData, fullSiteData.getAllPossiblyRenderedRoots(), _.noop, componentsFetcher);

                var modelWithActiveModeJson = modelWithActiveMode[testPageId].toJson();
                var compsInMode = _(modelWithActiveModeJson.components).keys().sortBy().value();
                expect(compsInMode).toContain(onlyInMasterCompId);
                expect(compsInMode).toContain(onlyInModeCompId);

                mockSiteAPI.deactivateModeById(testContainerId, testPageId, testModeId);
                var modelNoActiveMode = modelBuilder.build(runtimeDal, fullSiteData, fullSiteData.getAllPossiblyRenderedRoots(), _.noop, componentsFetcher);

                var modelNoActiveModeJson = modelNoActiveMode[testPageId].toJson();
                var compsInMaster = _(modelNoActiveModeJson.components).keys().sortBy().value();
                expect(compsInMaster).toContain(onlyInMasterCompId);
                expect(compsInMaster).toContain(onlyInModeCompId);
            });

            it('should create initialState for components with public state', function () {
                var noStateComp = testUtils.mockFactory.mockComponent(componentType, this.mockSiteData, utils.siteConstants.MASTER_PAGE_ID);
                var dataInfo = {props: testUtils.mockFactory.dataMocks.sliderGalleryProperties()};
                var compWithState = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SliderGallery', this.mockSiteData, utils.siteConstants.MASTER_PAGE_ID, dataInfo);
                var siteDataDocumentAPI = this.mockSiteAPI.getSiteDataAPI().document;
                var componentsFetcher = siteDataDocumentAPI.getAllCompsUnderRoot.bind(siteDataDocumentAPI);

                siteUtils.compFactory.register('wysiwyg.viewer.components.SliderGallery', sliderGallery);

                var model = modelBuilder.build(this.mockSiteAPI.getRuntimeDal(), this.mockSiteData, [newPageId], _.noop, componentsFetcher);

                var modelJson = model[newPageId].toJson();
                expect(modelJson.components[noStateComp.id].state).toEqual({});
                expect(modelJson.components[compWithState.id].state).not.toEqual({});
            });
        });
    });
});
