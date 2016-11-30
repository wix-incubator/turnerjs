define([
    'lodash',
    'testUtils',
    'documentServices/constants/constants',
    'coreUtils/core/siteConstants',
    'documentServices/platform/platform',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/component/component',
    'documentServices/component/componentCode',
    'documentServices/page/page',
    'documentServices/structure/structure',
    'documentServices/connections/connections'
], function(_,
            testUtils,
            constants,
            siteConstants,
            platform,
            privateServicesHelper,
            componentDetectorAPI,
            componentService,
            componentCodeService,
            pageService,
            structureService,
            connectionService){
    'use strict';

    describe('connectionsHooks', function(){
        var CONTAINER_TYPE = 'mobile.core.components.Container';
        var BUTTON_TYPE = 'wysiwyg.viewer.components.SiteButton';

        beforeEach(function(){
            testUtils.experimentHelper.openExperiments('connectionsData');
            this.anotherPageId = 'anotherPageId';
            this.mockSiteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(this.anotherPageId);
            this.pageId = this.mockSiteData.getPrimaryPageId();
        });

        function addComponentToPage(mockSiteData, pageId, compConnections, compType, containerId) {
            compType = compType || CONTAINER_TYPE;
            var compDataObj = compConnections ? {connections: compConnections} : {};
            var compStructure = testUtils.mockFactory.mockComponent(compType, mockSiteData, pageId, compDataObj, false, null, null, containerId);
            compStructure.styleId = 'c1';
            return compStructure;
        }

        function addControllerToPage(siteData, pageId) {
            var data = testUtils.mockFactory.dataMocks.controllerData();
            var structure = testUtils.mockFactory.mockComponent('platform.components.AppController', siteData, pageId, {data: data});
            structure.styleId = 'controller1';
            return structure;
        }

        function getCompPointer(ps, compId, pageId){
            var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            return ps.pointers.components.getComponent(compId, page);
        }

        describe('add component - when component serialized data contains connections', function(){

            it('should remove connections whose controller was deleted', function(){
                var controller = addControllerToPage(this.mockSiteData, this.pageId);
                var compStructure = addComponentToPage(this.mockSiteData, this.pageId, [testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole')]);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);
                var pagePointer = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var controllerRef = ps.pointers.components.getComponent(controller.id, pagePointer);
                var compWithConnectionsPointer = ps.pointers.components.getComponent(compStructure.id, pagePointer);
                var serializedComponent = componentService.serialize(ps, compWithConnectionsPointer);
                var compToAddRef = componentService.getComponentToAddRef(ps, pagePointer, serializedComponent);

                componentService.deleteComponent(ps, controllerRef);

                componentService.add(ps, compToAddRef, pagePointer, serializedComponent);

                expect(connectionService.get(ps, compToAddRef)).toEqual([]);
            });

            it('should remove connections whose controller was moved to another page which is not masterPage', function(){
                var controller = addControllerToPage(this.mockSiteData, this.pageId);
                var compStructure = addComponentToPage(this.mockSiteData, this.pageId, [testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole')]);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var anotherPagePointer = ps.pointers.components.getPage(this.anotherPageId, constants.VIEW_MODES.DESKTOP);
                var controllerRef = ps.pointers.components.getComponent(controller.id, pagePointer);
                var compWithConnectionsPointer = ps.pointers.components.getComponent(compStructure.id, pagePointer);
                var serializedComponent = componentService.serialize(ps, compWithConnectionsPointer);
                var serializedController = componentService.serialize(ps, controllerRef);
                var compToAddRef = componentService.getComponentToAddRef(ps, pagePointer, serializedComponent);

                componentService.deleteComponent(ps, controllerRef);
                componentService.add(ps, controllerRef, anotherPagePointer, serializedController);

                componentService.add(ps, compToAddRef, pagePointer, serializedComponent);

                expect(connectionService.get(ps, compToAddRef)).toEqual([]);
            });

            it('should remove connections whose controller was deleted but not connections whose controller is still on the page', function(){
                var controllerToDelete = addControllerToPage(this.mockSiteData, this.pageId);
                var controller = addControllerToPage(this.mockSiteData, this.pageId);
                var connectionToDelete = testUtils.mockFactory.connectionMocks.connectionItem(controllerToDelete.dataQuery, 'someRole');
                var connectionToKeep = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole', {a: 'a'});
                var connections = [connectionToDelete, connectionToKeep];
                var compStructure = addComponentToPage(this.mockSiteData, this.pageId, connections);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var compWithConnectionsPointer = ps.pointers.components.getComponent(compStructure.id, pagePointer);
                var serializedComponent = componentService.serialize(ps, compWithConnectionsPointer);
                var compToAddRef = componentService.getComponentToAddRef(ps, pagePointer, serializedComponent);
                var deleteControllerRef = ps.pointers.components.getComponent(controllerToDelete.id, pagePointer);
                var controllerRef = ps.pointers.components.getComponent(controller.id, pagePointer);
                var expectedCompConnections = [testUtils.mockFactory.connectionMocks.dsConnectionItem(controllerRef, 'someRole', {a: 'a'})];

                componentService.deleteComponent(ps, deleteControllerRef);

                componentService.add(ps, compToAddRef, pagePointer, serializedComponent);

                expect(connectionService.get(ps, compToAddRef)).toEqual(expectedCompConnections);
            });

            it('should not remove connections whose controller is on the current page', function(){
                var controller = addControllerToPage(this.mockSiteData, this.pageId);
                var compStructure = addComponentToPage(this.mockSiteData, this.pageId, [testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole')]);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var compWithConnectionsPointer = ps.pointers.components.getComponent(compStructure.id, pagePointer);
                var serializedComponent = componentService.serialize(ps, compWithConnectionsPointer);
                var compToAddRef = componentService.getComponentToAddRef(ps, pagePointer, serializedComponent);
                var expectedCompConnections = connectionService.get(ps, compWithConnectionsPointer);

                componentService.add(ps, compToAddRef, pagePointer, serializedComponent);

                expect(connectionService.get(ps, compToAddRef)).toEqual(expectedCompConnections);
            });

            it('should not remove connections whose controller is on masterPage', function(){
                var controller = addControllerToPage(this.mockSiteData, siteConstants.MASTER_PAGE_ID);
                var compStructure = addComponentToPage(this.mockSiteData, this.pageId, [testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole')]);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var compWithConnectionsPointer = ps.pointers.components.getComponent(compStructure.id, pagePointer);
                var serializedComponent = componentService.serialize(ps, compWithConnectionsPointer);
                var compToAddRef = componentService.getComponentToAddRef(ps, pagePointer, serializedComponent);
                var expectedCompConnections = connectionService.get(ps, compWithConnectionsPointer);

                componentService.add(ps, compToAddRef, pagePointer, serializedComponent);

                expect(connectionService.get(ps, compToAddRef)).toEqual(expectedCompConnections);
            });
        });

        describe('duplicate page', function(){

            it('should maintain connections - when controller is on page', function(){
                var controller = addControllerToPage(this.mockSiteData, this.pageId);
                var compStructure = addComponentToPage(this.mockSiteData, this.pageId, [testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole')]);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var compWithConnectionsPointer = ps.pointers.components.getComponent(compStructure.id, pagePointer);
                var expectedCompConnections = connectionService.get(ps, compWithConnectionsPointer);

                var duplicatedPagePointer = pageService.getPageIdToAdd(ps);
                pageService.duplicate(ps, duplicatedPagePointer, this.pageId);

                var duplicatedComponentPointer = _.first(componentDetectorAPI.getComponentByType(ps, 'mobile.core.components.Container', duplicatedPagePointer));
                var duplicatedControllerPointer = _.first(componentDetectorAPI.getComponentByType(ps, 'platform.components.AppController', duplicatedPagePointer));
                _.forEach(expectedCompConnections, function(connection){
                    connection.controllerRef = duplicatedControllerPointer;
                });
                expect(connectionService.get(ps, duplicatedComponentPointer)).toEqual(expectedCompConnections);
            });

            //this case is currently not supported - test should pass when #CLNT- is completed
            xit('should maintain connections - when connected component is page', function(){
                var controller = addControllerToPage(this.mockSiteData, this.pageId);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var controllerPointer = ps.pointers.components.getComponent(controller.id, pagePointer);
                var role = 'someRole';
                connectionService.connect(ps, pagePointer, controllerPointer, role);
                var expectedPageConnections = _.reject(connectionService.get(ps, pagePointer), {type: 'WixCodeConnectionItem'});

                var duplicatedPagePointer = pageService.getPageIdToAdd(ps);
                pageService.duplicate(ps, duplicatedPagePointer, this.pageId);

                expect(connectionService.get(ps, duplicatedPagePointer)).toEqual(expectedPageConnections);
            });

            it('should maintain both connections of types WixCodeConnectionItem and connectionItem', function(){
                var controller = addControllerToPage(this.mockSiteData, this.pageId);
                var role = 'someRole';
                var connections = [testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('nicki'), testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, role)];
                var compStructure = addComponentToPage(this.mockSiteData, this.pageId, connections);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var compWithConnectionsPointer = ps.pointers.components.getComponent(compStructure.id, pagePointer);
                var expectedCompConnections = connectionService.get(ps, compWithConnectionsPointer);

                var duplicatedPagePointer = pageService.getPageIdToAdd(ps);
                pageService.duplicate(ps, duplicatedPagePointer, this.pageId);

                var duplicatedComponentPointer = _.first(componentDetectorAPI.getComponentByType(ps, 'mobile.core.components.Container', duplicatedPagePointer));
                var duplicatedControllerPointer = _.first(componentDetectorAPI.getComponentByType(ps, 'platform.components.AppController', duplicatedPagePointer));
                _.set(expectedCompConnections, [1, 'controllerRef'], duplicatedControllerPointer);
                expect(connectionService.get(ps, duplicatedComponentPointer)).toEqual(expectedCompConnections);
            });

            it('should maintain connection of type wixCodeConnectionItem when component is a page', function(){
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                componentCodeService.setNickname(ps, pagePointer, 'nickinick');
                var expectedPageConnections = connectionService.get(ps, pagePointer);

                var duplicatedPagePointer = pageService.getPageIdToAdd(ps);
                pageService.duplicate(ps, duplicatedPagePointer, this.pageId);

                expect(connectionService.get(ps, duplicatedPagePointer)).toEqual(expectedPageConnections);
            });

            it('should maintain connections - when controller is on masterPage', function(){
                var masterPageController = addControllerToPage(this.mockSiteData, siteConstants.MASTER_PAGE_ID);
                var compStructure = addComponentToPage(this.mockSiteData, this.pageId, [testUtils.mockFactory.connectionMocks.connectionItem(masterPageController.dataQuery, 'someRole')]);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(this.pageId, constants.VIEW_MODES.DESKTOP);
                var compWithConnectionsPointer = ps.pointers.components.getComponent(compStructure.id, pagePointer);
                var expectedCompConnections = connectionService.get(ps, compWithConnectionsPointer);

                var duplicatedPagePointer = pageService.getPageIdToAdd(ps);
                pageService.duplicate(ps, duplicatedPagePointer, this.pageId);

                var duplicatedComponentPointer = _.first(componentDetectorAPI.getComponentByType(ps, 'mobile.core.components.Container', duplicatedPagePointer));
                var duplicatedControllerPointer = _.first(componentDetectorAPI.getComponentByType(ps, 'platform.components.AppController', ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP)));
                _.forEach(expectedCompConnections, function(connection){
                    connection.controllerRef = duplicatedControllerPointer;
                });
                expect(connectionService.get(ps, duplicatedComponentPointer)).toEqual(expectedCompConnections);
            });
        });

        describe('change parent', function () {
            it('should keep connection to master page controller when moving comp from masterPage to page', function () {
                this.mockSiteData.addMeasureMap();
                var controllerStructure = addControllerToPage(this.mockSiteData, siteConstants.MASTER_PAGE_ID);
                var connectionItem = testUtils.mockFactory.connectionMocks.connectionItem(controllerStructure.dataQuery, 'role');
                var compStructure = addComponentToPage(this.mockSiteData, siteConstants.MASTER_PAGE_ID, [connectionItem]);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);
                var compRef = getCompPointer(ps, compStructure.id, siteConstants.MASTER_PAGE_ID);
                var pagePointer = getCompPointer(ps, this.pageId, this.pageId);

                var compConnections = connectionService.get(ps, compRef);
                structureService.setContainer(ps, compRef, compRef, pagePointer);

                var newCompConnections = connectionService.get(ps, compRef);
                expect(newCompConnections).toEqual(compConnections);
            });

            it('should remove connection to page controller when moving comp from page to masterPage', function () {
                this.mockSiteData.addMeasureMap();
                var controllerStructure = addControllerToPage(this.mockSiteData, this.pageId);
                var connectionItem = testUtils.mockFactory.connectionMocks.connectionItem(controllerStructure.dataQuery, 'role');
                var compStructure = addComponentToPage(this.mockSiteData, this.pageId, [connectionItem]);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);
                var compRef = getCompPointer(ps, compStructure.id, this.pageId);
                var masterPagePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                structureService.setContainer(ps, compRef, compRef, masterPagePointer);

                var compConnections = connectionService.get(ps, compRef);
                expect(compConnections).toBeEmpty();
            });

            it('should remove connections recursively when moving container from page to masterPage', function () {
                this.mockSiteData.addMeasureMap();
                var containerId = 'containerId';
                var compId = 'compId';
                var controllerStructure = addControllerToPage(this.mockSiteData, this.pageId);
                var connectionItem = [testUtils.mockFactory.connectionMocks.connectionItem(controllerStructure.dataQuery, 'role')];
                testUtils.mockFactory.mockComponent(CONTAINER_TYPE, this.mockSiteData, this.pageId, {}, false, containerId);
                testUtils.mockFactory.mockComponent(BUTTON_TYPE, this.mockSiteData, this.pageId, {connections: connectionItem}, false, compId, {}, containerId);

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);
                var containerRef = getCompPointer(ps, containerId, this.pageId);
                var compRef = getCompPointer(ps, compId, this.pageId);
                var masterPagePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                structureService.setContainer(ps, containerRef, containerRef, masterPagePointer);

                var compConnections = connectionService.get(ps, compRef);
                expect(compConnections).toBeEmpty();
            });

            it('should keep connection to page controller when moving comp to a container inside the page', function () {
                this.mockSiteData.addMeasureMap();
                var containerId = 'containerId';
                var compId = 'compId';
                var controllerStructure = addControllerToPage(this.mockSiteData, this.pageId);
                var connectionItem = [testUtils.mockFactory.connectionMocks.connectionItem(controllerStructure.dataQuery, 'role')];
                testUtils.mockFactory.mockComponent(CONTAINER_TYPE, this.mockSiteData, this.pageId, {}, false, containerId, {components: []});
                testUtils.mockFactory.mockComponent(BUTTON_TYPE, this.mockSiteData, this.pageId, {connections: connectionItem}, false, compId);

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);
                var containerRef = getCompPointer(ps, containerId, this.pageId);
                var compRef = getCompPointer(ps, compId, this.pageId);

                var compConnections = connectionService.get(ps, compRef);

                structureService.setContainer(ps, compRef, compRef, containerRef);
                var newCompConnections = connectionService.get(ps, compRef);

                expect(newCompConnections).toEqual(compConnections);
            });
        });
    });
});
