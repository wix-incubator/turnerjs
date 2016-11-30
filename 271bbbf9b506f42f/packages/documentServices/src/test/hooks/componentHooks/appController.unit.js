define([
    'lodash',
    'testUtils',
    'coreUtils/core/siteConstants',
    'documentServices/platform/platform',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/component/component',
    'documentServices/page/page',
    'documentServices/connections/connections',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/hooks/componentHooks/appController',
    'documentServices/appControllerData/appControllerData',
    'documentServices/constants/constants',
    'documentServices/platform/common/constants',
    'documentServices/structure/structure'
], function (_,
             testUtils,
             siteConstants,
             platform,
             privateServicesHelper,
             componentServices,
             pageServices,
             connections,
             componentDetectorAPI,
             appControllerHooks,
             appControllerData,
             constants,
             platformConstants,
             structureService) {

    'use strict';
    describe('appController hooks', function () {
        function addControllerToPage(siteData, pageId, optionalControllerId, optionalDataItemId) {
            var controllerDataOverrides = {};
            if (optionalDataItemId) {
                controllerDataOverrides.id = optionalDataItemId;
            }
            var data = testUtils.mockFactory.dataMocks.controllerData(controllerDataOverrides);
            var structure = testUtils.mockFactory.mockComponent('platform.components.AppController', siteData, pageId, {data: data}, false, optionalControllerId);
            structure.styleId = 'controller1';
            return structure;
        }

        function addComponentWithConnections(siteData, pageId, connectionItem, optionalCompId) {
            var compStructure = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, pageId, {connections: connectionItem}, false, optionalCompId);
            compStructure.style = 'c1';
            return compStructure;
        }

        function getCompPointer(ps, compId, pageId){
            var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
            return ps.pointers.components.getComponent(compId, page);
        }

        function isComponentConnectedToController(ps, compRef, controllerRef) {
            return _.some(connections.get(ps, compRef), {controllerRef: controllerRef});
        }

        describe('Remove controller', function () {
            beforeEach(function () {
                testUtils.experimentHelper.openExperiments('connectionsData');
                this.otherPageId = 'otherPage';
                this.mockSiteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults(this.otherPageId)
                    .addMeasureMap();
                this.currentPageId = this.mockSiteData.getCurrentUrlPageId();
            });

            it('should remove the controller connections from all the components it was connected to', function () {
                var controllerId = 'controller';
                var otherControllerId = 'otherController';

                var controller = addControllerToPage(this.mockSiteData, this.currentPageId, controllerId);
                var otherController = addControllerToPage(this.mockSiteData, this.currentPageId, otherControllerId);

                var connectionItem = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole');
                var connectionItemWithOtherController = testUtils.mockFactory.connectionMocks.connectionItem(otherController.dataQuery, 'someRole');

                var firstCompStructure = addComponentWithConnections(this.mockSiteData, this.currentPageId, [connectionItem, connectionItemWithOtherController]);

                var secondCompStructure = addComponentWithConnections(this.mockSiteData, this.currentPageId, [connectionItem]);

                var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(mockPS);

                var currentPageRef = mockPS.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                var firstCompRef = mockPS.pointers.components.getComponent(firstCompStructure.id, currentPageRef);
                var secondCompRef = mockPS.pointers.components.getComponent(secondCompStructure.id, currentPageRef);

                var controllerRef = mockPS.pointers.components.getComponent(controllerId, currentPageRef);
                var otherControllerRef = mockPS.pointers.components.getComponent(otherControllerId, currentPageRef);

                var expectedConnectionItem = testUtils.mockFactory.connectionMocks.dsConnectionItem(otherControllerRef, 'someRole');

                componentServices.deleteComponent(mockPS, controllerRef);

                expect(connections.get(mockPS, firstCompRef)).toEqual([expectedConnectionItem]);
                expect(connections.get(mockPS, secondCompRef)).toEqual([]);
            });

            it('should remove the controller connections from all the components it was connected to when the controller was on master page', function () {
                var masterPageControllerId = 'masterPageController';
                var masterPageController = addControllerToPage(this.mockSiteData, siteConstants.MASTER_PAGE_ID, masterPageControllerId);

                var connectionToMasterPageController = testUtils.mockFactory.connectionMocks.connectionItem(masterPageController.dataQuery, 'someRole');

                var firstCompStructure = addComponentWithConnections(this.mockSiteData, this.currentPageId, [connectionToMasterPageController]);
                var secondCompStructure = addComponentWithConnections(this.mockSiteData, this.otherPageId, [connectionToMasterPageController]);

                var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(mockPS);

                var masterPageRef = mockPS.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                var currentPageRef = mockPS.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                var otherPageRef = mockPS.pointers.components.getPage(this.otherPageId, constants.VIEW_MODES.DESKTOP);

                var firstCompRef = mockPS.pointers.components.getComponent(firstCompStructure.id, currentPageRef);
                var secondCompRef = mockPS.pointers.components.getComponent(secondCompStructure.id, otherPageRef);

                var controllerRef = mockPS.pointers.components.getComponent(masterPageControllerId, masterPageRef);

                componentServices.deleteComponent(mockPS, controllerRef);

                expect(connections.get(mockPS, firstCompRef)).toEqual([]);
                expect(connections.get(mockPS, secondCompRef)).toEqual([]);
            });

            it('should remove the controller connections from a component on master page if it was connected to a controller on master page', function () {
                var masterPageControllerId = 'masterPageController';
                var masterPageController = addControllerToPage(this.mockSiteData, siteConstants.MASTER_PAGE_ID, masterPageControllerId);

                var connectionItem = testUtils.mockFactory.connectionMocks.connectionItem(masterPageController.dataQuery, 'someRole');

                var compStructure = addComponentWithConnections(this.mockSiteData, siteConstants.MASTER_PAGE_ID, [connectionItem]);

                var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(mockPS);

                var masterPageRef = mockPS.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                var compRef = mockPS.pointers.components.getComponent(compStructure.id, masterPageRef);
                var controllerRef = mockPS.pointers.components.getComponent(masterPageControllerId, masterPageRef);

                componentServices.deleteComponent(mockPS, controllerRef);

                expect(connections.get(mockPS, compRef)).toEqual([]);
            });

            it('should remove the controller connections from a component inside a container if its controller was deleted', function () {
                var controllerId = 'controller';
                var controller = addControllerToPage(this.mockSiteData, this.currentPageId, controllerId);

                var connectionItem = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole');
                var compStructure = addComponentWithConnections(this.mockSiteData, this.currentPageId, [connectionItem]);
                var containerStructure = testUtils.mockFactory.mockComponent('mobile.core.components.Container', this.mockSiteData, this.currentPageId, null, false, null, {components: []});

                var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(mockPS);

                var currentPageRef = mockPS.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                var compRef = mockPS.pointers.components.getComponent(compStructure.id, currentPageRef);
                var containerRef = mockPS.pointers.components.getComponent(containerStructure.id, currentPageRef);
                var controllerRef = mockPS.pointers.components.getComponent(controllerId, currentPageRef);
                structureService.setContainer(mockPS, compRef, compRef, containerRef);

                componentServices.deleteComponent(mockPS, controllerRef);

                expect(connections.get(mockPS, compRef)).toEqual([]);
            });

            it('should remove the application form pagesPlatformApplications if this was the last controller from this application in the page', function () {
                var applicationId = 'applicationId';
                var data = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
                var controllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: data, style: 'controller1'});

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                var newControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);

                componentServices.add(ps, newControllerPointer, pagePointer, controllerStructure);
                componentServices.deleteComponent(ps, newControllerPointer);

                expect(this.mockSiteData.isPlatformAppOnPage(this.currentPageId, applicationId)).toBeFalsy();
            });

            it('should not touch the pagesPlatformApplications if there are more controllers from this application in the page', function () {
                var applicationId = 'applicationId';

                var data = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
                var anotherData = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
                var controllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: data, style: 'controller1'});
                var anotherControllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: anotherData, style: 'controller1'});

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                var controllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);
                var anotherControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);

                componentServices.add(ps, controllerPointer, pagePointer, controllerStructure);
                componentServices.add(ps, anotherControllerPointer, pagePointer, anotherControllerStructure);

                componentServices.deleteComponent(ps, controllerPointer);

                expect(this.mockSiteData.isPlatformAppOnPage(this.currentPageId, applicationId)).toBeTruthy();
            });

            it('should remove the controller from appState map', function () {
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);
                var data = testUtils.mockFactory.dataMocks.controllerData();
                var controllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: data, style: 'controller1'});
                var pagePointer = ps.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                var controllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);
                componentServices.add(ps, controllerPointer, pagePointer, controllerStructure);
                var controllerState = 'state';
                appControllerData.setState(ps, _.set({}, controllerState, [controllerPointer]));

                componentServices.deleteComponent(ps, controllerPointer);

                var newControllerState = ps.dal.get(ps.pointers.platform.getControllerStatePointer(controllerPointer.id));
                expect(newControllerState).toBeUndefined();
            });

            it('should not touch other controllers state in appState map', function () {
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);
                var data = testUtils.mockFactory.dataMocks.controllerData();
                var controllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: data, style: 'controller1'});
                var pagePointer = ps.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                var controllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);
                var anotherControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);
                componentServices.add(ps, controllerPointer, pagePointer, controllerStructure);
                componentServices.add(ps, anotherControllerPointer, pagePointer, controllerStructure);

                var state = 'state';
                appControllerData.setState(ps, _.set({}, state, [controllerPointer, anotherControllerPointer]));

                componentServices.deleteComponent(ps, controllerPointer);

                var controllerState = ps.dal.get(ps.pointers.platform.getControllerStatePointer(controllerPointer.id));
                var otherControllerState = ps.dal.get(ps.pointers.platform.getControllerStatePointer(anotherControllerPointer.id));
                expect(controllerState).toBeUndefined();
                expect(otherControllerState).toEqual(state);
            });
        });

        describe('serialize controller', function(){
            beforeEach(function(){
                testUtils.experimentHelper.openExperiments('connectionsData');
                this.secondPageId = 'secondPageId';
                this.mockSiteData = testUtils.mockFactory.mockSiteData(null, true).addPageWithDefaults(this.secondPageId);
                this.currentPageController = addControllerToPage(this.mockSiteData, this.mockSiteData.getPrimaryPageId());
            });

            function getExpectedRelatedConnections(ps, compPointers, controllerPointer) {
                var connectionsToController = _.zipObject(_.map(compPointers, 'id'), _.map(compPointers, connections.get.bind(connections, ps)));
                return _.mapValues(connectionsToController, function(compConnections){
                    return _.filter(compConnections, {controllerRef: controllerPointer});
                });
            }

            it("should serialize the connections of a single component that's connected to controller under 'relatedConnections'", function(){
                var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(this.currentPageController.dataQuery, 'someRole');
                var connectionB = testUtils.mockFactory.connectionMocks.connectionItem(this.currentPageController.dataQuery, 'anotherRole');
                var compConnections = [connectionA, connectionB];
                var pageId = this.mockSiteData.getPrimaryPageId();
                var comp = addComponentWithConnections(this.mockSiteData, pageId, compConnections);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                var controllerPointer = getCompPointer(ps, this.currentPageController.id, pageId);
                var compPointer = getCompPointer(ps, comp.id, pageId);
                var expectedRelatedConnections = _.zipObject([comp.id], [connections.get(ps, compPointer)]);

                var serializationResult = componentServices.serialize(ps, controllerPointer);

                expect(_.get(serializationResult, 'custom.relatedConnections')).toEqual(expectedRelatedConnections);
            });

            it("should serialize the connections of multiple components that are connected to it under 'relatedConnections'", function(){
                var pageId = this.mockSiteData.getPrimaryPageId();
                var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(this.currentPageController.dataQuery, 'someRole');
                var connectionB = testUtils.mockFactory.connectionMocks.connectionItem(this.currentPageController.dataQuery, 'anotherRole');
                var compAConnections = [connectionA];
                var compBConnections = [connectionB];
                var compA = addComponentWithConnections(this.mockSiteData, pageId, compAConnections);
                var compB = addComponentWithConnections(this.mockSiteData, pageId, compBConnections);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                var controllerPointer = getCompPointer(ps, this.currentPageController.id, pageId);
                var compAPointer = getCompPointer(ps, compA.id, pageId);
                var compBPointer = getCompPointer(ps, compB.id, pageId);
                var expectedRelatedConnections = getExpectedRelatedConnections(ps, [compAPointer, compBPointer], controllerPointer);

                var serializationResult = componentServices.serialize(ps, controllerPointer);

                expect(_.get(serializationResult, 'custom.relatedConnections')).toEqual(expectedRelatedConnections);
            });

            it('should not serialize component connections that are connected to another controller', function(){
                var pageId = this.mockSiteData.getPrimaryPageId();
                var anotherController = addControllerToPage(this.mockSiteData, pageId);
                var connectionToSerializedController = testUtils.mockFactory.connectionMocks.connectionItem(this.currentPageController.dataQuery, 'someRole');
                var connectionToAnotherController = testUtils.mockFactory.connectionMocks.connectionItem(anotherController.dataQuery, 'anotherRole');
                var compConnections = [connectionToSerializedController, connectionToAnotherController];
                var comp = addComponentWithConnections(this.mockSiteData, pageId, compConnections);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                var serializedControllerPointer = getCompPointer(ps, this.currentPageController.id, pageId);
                var compPointer = getCompPointer(ps, comp.id, pageId);
                var expectedRelatedConnections = getExpectedRelatedConnections(ps, [compPointer], serializedControllerPointer);

                var serializationResult = componentServices.serialize(ps, serializedControllerPointer);

                expect(_.get(serializationResult, 'custom.relatedConnections')).toEqual(expectedRelatedConnections);
            });

            it('should not serialize relatedConnections if no component is connected to it', function(){
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                var controllerPointer = getCompPointer(ps, this.currentPageController.id, this.mockSiteData.getPrimaryPageId());

                var serializationResult = componentServices.serialize(ps, controllerPointer);

                expect(_.get(serializationResult, 'custom.relatedConnections')).toBeUndefined();
            });

            it('when controller is on the master page and components are on 2 different pages', function(){
                var firstPageId = this.mockSiteData.getPrimaryPageId();
                var masterPageController = addControllerToPage(this.mockSiteData, siteConstants.MASTER_PAGE_ID);
                var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(masterPageController.dataQuery, 'someRole');
                var connectionB = testUtils.mockFactory.connectionMocks.connectionItem(masterPageController.dataQuery, 'anotherRole');
                var compOnFirstPage = addComponentWithConnections(this.mockSiteData, firstPageId, [connectionA]);
                var compOnSecondPage = addComponentWithConnections(this.mockSiteData, this.secondPageId, [connectionB]);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                var masterPageControllerPointer = getCompPointer(ps, masterPageController.id, siteConstants.MASTER_PAGE_ID);
                var compOnFirstPagePointer = getCompPointer(ps, compOnFirstPage.id, firstPageId);
                var compOnSecondPagePointer = getCompPointer(ps, compOnSecondPage.id, this.secondPageId);
                var expectedRelatedConnections = getExpectedRelatedConnections(ps, [compOnFirstPagePointer, compOnSecondPagePointer], masterPageControllerPointer);

                var serializationResult = componentServices.serialize(ps, masterPageControllerPointer);

                expect(_.get(serializationResult, 'custom.relatedConnections')).toEqual(expectedRelatedConnections);
            });

            it('when controller is on the master page and component is on the masterPage', function(){
                var masterPageController = addControllerToPage(this.mockSiteData, siteConstants.MASTER_PAGE_ID);
                var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(masterPageController.dataQuery, 'someRole');
                var compOnMasterPage = addComponentWithConnections(this.mockSiteData, siteConstants.MASTER_PAGE_ID, [connectionA]);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                var masterPageControllerPointer = getCompPointer(ps, masterPageController.id, siteConstants.MASTER_PAGE_ID);
                var compOnMasterPagePointer = getCompPointer(ps, compOnMasterPage.id, siteConstants.MASTER_PAGE_ID);
                var expectedRelatedConnections = getExpectedRelatedConnections(ps, [compOnMasterPagePointer], masterPageControllerPointer);

                var serializationResult = componentServices.serialize(ps, masterPageControllerPointer);

                expect(_.get(serializationResult, 'custom.relatedConnections')).toEqual(expectedRelatedConnections);
            });

            it('when the connected component is under a container', function(){
                var pageId = this.mockSiteData.getPrimaryPageId();
                var controller = addControllerToPage(this.mockSiteData, pageId);
                var connectionItem = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole');
                var comp = addComponentWithConnections(this.mockSiteData, pageId, [connectionItem]);
                var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', this.mockSiteData, pageId);
                container.components = [];
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var compPointer = ps.pointers.components.getComponent(comp.id, pagePointer);
                var containerPointer = ps.pointers.components.getComponent(container.id, pagePointer);
                var controllerPointer = ps.pointers.components.getComponent(controller.id, pagePointer);
                structureService.setContainer(ps, compPointer, compPointer, containerPointer);
                var expectedRelatedConnections = getExpectedRelatedConnections(ps, [compPointer], controllerPointer);

                var serializationResult = componentServices.serialize(ps, controllerPointer);

                expect(_.get(serializationResult, 'custom.relatedConnections')).toEqual(expectedRelatedConnections);
            });

            it('should serialize the controller state if it is defined', function () {
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);
                var pageId = this.mockSiteData.getPrimaryPageId();
                var controllerPointer = getCompPointer(ps, this.currentPageController.id, pageId);
                var controllerState = 'state';
                appControllerData.setState(ps, _.set({}, controllerState, [controllerPointer]));
                var serializationResult = componentServices.serialize(ps, controllerPointer);

                expect(serializationResult.custom.state).toEqual(controllerState);
            });

            it('should not serialize the controller state if it is not defined', function () {
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);
                var pageId = this.mockSiteData.getPrimaryPageId();
                var controllerPointer = getCompPointer(ps, this.currentPageController.id, pageId);

                var serializationResult = componentServices.serialize(ps, controllerPointer);

                expect(_.get(serializationResult, ['custom', 'state'])).not.toBeDefined();
            });
        });

        describe('add (deserialize) controller', function(){
            beforeEach(function(){
                testUtils.experimentHelper.openExperiments('connectionsData');
                this.secondPageId = 'secondPageId';
                this.mockSiteData = testUtils.mockFactory.mockSiteData(null, true).addPageWithDefaults(this.secondPageId);
            });

            function removeCompAndAddToAnotherPage(ps, compPointer) {
                var serializedComp = componentServices.serialize(ps, compPointer);
                componentServices.deleteComponent(ps, compPointer);
                var anotherPagePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                var newCompRef = componentServices.getComponentToAddRef(ps, anotherPagePointer);
                componentServices.add(ps, newCompRef, anotherPagePointer, serializedComp);
                return newCompRef;
            }

            function addControllerWithState(optionalState) {
                this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(this.ps);
                var data = testUtils.mockFactory.dataMocks.controllerData();
                var controllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {
                    data: data,
                    style: 'controller1'
                });
                var pageId = this.mockSiteData.getPrimaryPageId();
                this.pagePointer = this.ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);

                this.controllerPointer = componentServices.getComponentToAddRef(this.ps, this.pagePointer);
                componentServices.add(this.ps, this.controllerPointer, this.pagePointer, controllerStructure);
                if (optionalState) {
                    appControllerData.setState(this.ps, _.set({}, optionalState, [this.controllerPointer]));
                }
                this.serializedController = componentServices.serialize(this.ps, this.controllerPointer);
                this.newControllerPointer = componentServices.getComponentToAddRef(this.ps, this.pagePointer);
            }

            describe('when controller is on a regular page', function(){

                it('should add back the connections for a component that exists on the page', function(){
                    var currentPageController = addControllerToPage(this.mockSiteData, this.mockSiteData.getPrimaryPageId());
                    var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(currentPageController.dataQuery, 'someRole');
                    var connectionB = testUtils.mockFactory.connectionMocks.connectionItem(currentPageController.dataQuery, 'anotherRole');
                    var compConnections = [connectionA, connectionB];
                    var pageId = this.mockSiteData.getPrimaryPageId();
                    var comp = addComponentWithConnections(this.mockSiteData, pageId, compConnections);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    platform.init(ps);

                    var oldControllerPointer = getCompPointer(ps, currentPageController.id, pageId);
                    var compPointer = getCompPointer(ps, comp.id, pageId);
                    var serializedController = componentServices.serialize(ps, oldControllerPointer);
                    var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                    var newControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);
                    var expectedCompConnections = connections.get(ps, compPointer);

                    componentServices.deleteComponent(ps, oldControllerPointer);

                    componentServices.add(ps, newControllerPointer, pagePointer, serializedController);

                    _.forEach(expectedCompConnections, function(connection){
                        connection.controllerRef = newControllerPointer;
                    });
                    expect(connections.get(ps, compPointer)).toEqual(expectedCompConnections);
                });

                it('should add back the connections for a component in a container on the page', function(){
                    var currentPageController = addControllerToPage(this.mockSiteData, this.mockSiteData.getPrimaryPageId());
                    var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(currentPageController.dataQuery, 'someRole');
                    var connectionB = testUtils.mockFactory.connectionMocks.connectionItem(currentPageController.dataQuery, 'anotherRole');
                    var pageId = this.mockSiteData.getPrimaryPageId();
                    var comp = addComponentWithConnections(this.mockSiteData, pageId, [connectionA, connectionB]);
                    var container = testUtils.mockFactory.mockComponent('mobile.core.components.Container', this.mockSiteData, pageId, null, false, null, {components: []});
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    platform.init(ps);

                    var oldControllerPointer = getCompPointer(ps, currentPageController.id, pageId);
                    var compPointer = getCompPointer(ps, comp.id, pageId);
                    var containerPointer = getCompPointer(ps, container.id, pageId);
                    structureService.setContainer(ps, compPointer, compPointer, containerPointer);
                    var serializedController = componentServices.serialize(ps, oldControllerPointer);
                    var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                    var newControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);
                    var expectedCompConnections = connections.get(ps, compPointer);

                    componentServices.deleteComponent(ps, oldControllerPointer);

                    componentServices.add(ps, newControllerPointer, pagePointer, serializedController);

                    _.forEach(expectedCompConnections, function(connection){
                        connection.controllerRef = newControllerPointer;
                    });
                    expect(connections.get(ps, compPointer)).toEqual(expectedCompConnections);
                });

                it('should add back the connections for multiple component that exist on the page', function(){
                    var currentPageController = addControllerToPage(this.mockSiteData, this.mockSiteData.getPrimaryPageId());
                    var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(currentPageController.dataQuery, 'someRole');
                    var connectionB = testUtils.mockFactory.connectionMocks.connectionItem(currentPageController.dataQuery, 'anotherRole');
                    var pageId = this.mockSiteData.getPrimaryPageId();
                    var compA = addComponentWithConnections(this.mockSiteData, pageId, [connectionA]);
                    var compB = addComponentWithConnections(this.mockSiteData, pageId, [connectionB]);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    platform.init(ps);

                    var oldControllerPointer = getCompPointer(ps, currentPageController.id, pageId);
                    var compAPointer = getCompPointer(ps, compA.id, pageId);
                    var compBPointer = getCompPointer(ps, compB.id, pageId);
                    var serializedController = componentServices.serialize(ps, oldControllerPointer);
                    var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                    var newControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);
                    var expectedCompAConnections = connections.get(ps, compAPointer);
                    var expectedCompBConnections = connections.get(ps, compBPointer);

                    componentServices.deleteComponent(ps, oldControllerPointer);

                    componentServices.add(ps, newControllerPointer, pagePointer, serializedController);

                    _.forEach(expectedCompAConnections.concat(expectedCompBConnections), function(connection){
                        connection.controllerRef = newControllerPointer;
                    });
                    expect(connections.get(ps, compAPointer)).toEqual(expectedCompAConnections);
                    expect(connections.get(ps, compBPointer)).toEqual(expectedCompBConnections);
                });

                it('should not add connections for components that does not exist on page', function(){
                    var currentPageController = addControllerToPage(this.mockSiteData, this.mockSiteData.getPrimaryPageId());
                    var compConnections = [testUtils.mockFactory.connectionMocks.connectionItem(currentPageController.dataQuery, 'someRole')];
                    var pageId = this.mockSiteData.getPrimaryPageId();
                    var comp = addComponentWithConnections(this.mockSiteData, pageId, compConnections);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    platform.init(ps);

                    var oldControllerPointer = getCompPointer(ps, currentPageController.id, pageId);
                    var compPointer = getCompPointer(ps, comp.id, pageId);
                    var serializedController = componentServices.serialize(ps, oldControllerPointer);
                    var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                    var newControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);

                    componentServices.deleteComponent(ps, oldControllerPointer);
                    var compAfterMovePointer = removeCompAndAddToAnotherPage(ps, compPointer);

                    componentServices.add(ps, newControllerPointer, pagePointer, serializedController);

                    expect(connections.get(ps, compAfterMovePointer)).toEqual([]);
                });

                it('should add back connections when duplicating page with component connected to a controller', function(){
                    var controllerId = 'someControllerId';
                    var controllerDataId = 'controllerDataItemId';
                    var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(controllerDataId, 'someRole');
                    var connectionB = testUtils.mockFactory.connectionMocks.connectionItem(controllerDataId, 'anotherRole');
                    var compConnections = [connectionA, connectionB];
                    var pageId = this.mockSiteData.getPrimaryPageId();
                    var comp = addComponentWithConnections(this.mockSiteData, pageId, compConnections);
                    addControllerToPage(this.mockSiteData, this.mockSiteData.getPrimaryPageId(), controllerId, controllerDataId);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    platform.init(ps);

                    var compPointer = getCompPointer(ps, comp.id, pageId);
                    var expectedCompConnections = connections.get(ps, compPointer);

                    var duplicatedPagePointer = pageServices.getPageIdToAdd(ps);
                    pageServices.duplicate(ps, duplicatedPagePointer, pageId);

                    var duplicatedControllerPointer = _.first(componentDetectorAPI.getComponentByType(ps, 'platform.components.AppController', duplicatedPagePointer));
                    var duplicatedComponentPointer = _.first(componentDetectorAPI.getComponentByType(ps, 'mobile.core.components.Container', duplicatedPagePointer));
                    _.forEach(expectedCompConnections, function(connection){
                        connection.controllerRef = duplicatedControllerPointer;
                    });
                    expect(connections.get(ps, duplicatedComponentPointer)).toEqual(expectedCompConnections);
                });
            });

            describe('when controller is on the masterPage', function(){

                it('should add back the connection for a component that exist on the masterPage', function(){
                    var masterPageController = addControllerToPage(this.mockSiteData, siteConstants.MASTER_PAGE_ID);
                    var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(masterPageController.dataQuery, 'someRole');
                    var connectionB = testUtils.mockFactory.connectionMocks.connectionItem(masterPageController.dataQuery, 'anotherRole');
                    var compConnections = [connectionA, connectionB];
                    var pageId = siteConstants.MASTER_PAGE_ID;
                    var comp = addComponentWithConnections(this.mockSiteData, pageId, compConnections);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    platform.init(ps);

                    var oldControllerPointer = getCompPointer(ps, masterPageController.id, pageId);
                    var compPointer = getCompPointer(ps, comp.id, pageId);
                    var serializedController = componentServices.serialize(ps, oldControllerPointer);
                    var masterPagePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                    var newControllerPointer = componentServices.getComponentToAddRef(ps, masterPagePointer);
                    var expectedCompConnections = connections.get(ps, compPointer);

                    componentServices.deleteComponent(ps, oldControllerPointer);

                    componentServices.add(ps, newControllerPointer, masterPagePointer, serializedController);

                    _.forEach(expectedCompConnections, function(connection){
                        connection.controllerRef = newControllerPointer;
                    });
                    expect(connections.get(ps, compPointer)).toEqual(expectedCompConnections);
                });

                it('should add back the connection for a component that exist on the current page', function(){
                    var masterPageController = addControllerToPage(this.mockSiteData, siteConstants.MASTER_PAGE_ID);
                    var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(masterPageController.dataQuery, 'someRole');
                    var connectionB = testUtils.mockFactory.connectionMocks.connectionItem(masterPageController.dataQuery, 'anotherRole');
                    var compConnections = [connectionA, connectionB];
                    var pageId = this.mockSiteData.getPrimaryPageId();
                    var comp = addComponentWithConnections(this.mockSiteData, pageId, compConnections);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    platform.init(ps);

                    var oldControllerPointer = getCompPointer(ps, masterPageController.id, siteConstants.MASTER_PAGE_ID);
                    var compPointer = getCompPointer(ps, comp.id, pageId);
                    var serializedController = componentServices.serialize(ps, oldControllerPointer);
                    var masterPagePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                    var newControllerPointer = componentServices.getComponentToAddRef(ps, masterPagePointer);
                    var expectedCompConnections = connections.get(ps, compPointer);

                    componentServices.deleteComponent(ps, oldControllerPointer);

                    componentServices.add(ps, newControllerPointer, masterPagePointer, serializedController);

                    _.forEach(expectedCompConnections, function(connection){
                        connection.controllerRef = newControllerPointer;
                    });
                    expect(connections.get(ps, compPointer)).toEqual(expectedCompConnections);
                });

                it('should add back the connection for a component under the header (container under masterPage)', function(){
                    var masterPageController = addControllerToPage(this.mockSiteData, siteConstants.MASTER_PAGE_ID);
                    var compConnections = [testUtils.mockFactory.connectionMocks.connectionItem(masterPageController.dataQuery, 'someRole')];
                    var pageId = siteConstants.MASTER_PAGE_ID;
                    var comp = addComponentWithConnections(this.mockSiteData, pageId, compConnections);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    platform.init(ps);

                    var oldControllerPointer = getCompPointer(ps, masterPageController.id, pageId);
                    var compPointer = getCompPointer(ps, comp.id, pageId);
                    structureService.setContainer(ps, compPointer, compPointer, ps.pointers.components.getHeader(constants.VIEW_MODES.DESKTOP));
                    var serializedController = componentServices.serialize(ps, oldControllerPointer);
                    var masterPagePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                    var newControllerPointer = componentServices.getComponentToAddRef(ps, masterPagePointer);
                    var expectedCompConnections = connections.get(ps, compPointer);

                    componentServices.deleteComponent(ps, oldControllerPointer);

                    componentServices.add(ps, newControllerPointer, masterPagePointer, serializedController);

                    _.forEach(expectedCompConnections, function(connection){
                        connection.controllerRef = newControllerPointer;
                    });
                    expect(connections.get(ps, compPointer)).toEqual(expectedCompConnections);
                });

                it('should add back connections when duplicating page with component connected to a controller', function(){
                    var masterPageControllerId = 'someControllerId';
                    var controllerDataId = 'controllerDataItemId';
                    var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(controllerDataId, 'someRole');
                    var connectionB = testUtils.mockFactory.connectionMocks.connectionItem(controllerDataId, 'anotherRole');
                    var compConnections = [connectionA, connectionB];
                    var pageId = this.mockSiteData.getPrimaryPageId();
                    var comp = addComponentWithConnections(this.mockSiteData, pageId, compConnections);
                    addControllerToPage(this.mockSiteData, siteConstants.MASTER_PAGE_ID, masterPageControllerId, controllerDataId);
                    var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    platform.init(ps);

                    var controllerPointer = getCompPointer(ps, masterPageControllerId, siteConstants.MASTER_PAGE_ID);
                    var compPointer = getCompPointer(ps, comp.id, pageId);
                    var expectedCompConnections = connections.get(ps, compPointer);

                    var duplicatedPagePointer = pageServices.getPageIdToAdd(ps);
                    pageServices.duplicate(ps, duplicatedPagePointer, pageId);

                    var duplicatedComponentPointer = _.first(componentDetectorAPI.getComponentByType(ps, 'mobile.core.components.Container', duplicatedPagePointer));
                    _.forEach(expectedCompConnections, function(connection){
                        connection.controllerRef = controllerPointer;
                    });
                    expect(connections.get(ps, duplicatedComponentPointer)).toEqual(expectedCompConnections);
                });
            });

            it('should set the controller page application to true', function () {
                var pageId = this.mockSiteData.getPrimaryPageId();
                var applicationId = 'applicationId';
                var data = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
                var controllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: data, style: 'controller1'});

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var newControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);

                componentServices.add(ps, newControllerPointer, pagePointer, controllerStructure);

                expect(this.mockSiteData.isPlatformAppOnPage(pageId, applicationId)).toBeTruthy();
            });

            it('should set the controller masterPage application to true when adding controller to masterPage', function () {
                var applicationId = 'applicationId';
                var data = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
                var controllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: data, style: 'controller1'});

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var masterPagePointer = ps.pointers.components.getPage('masterPage', constants.VIEW_MODES.DESKTOP);
                var newControllerPointer = componentServices.getComponentToAddRef(ps, masterPagePointer);

                componentServices.add(ps, newControllerPointer, masterPagePointer, controllerStructure);

                expect(this.mockSiteData.isPlatformAppOnPage('masterPage', applicationId)).toBeTruthy();
            });

            it('should keep the controller application when adding second controller', function () {
                var pageId = this.mockSiteData.getPrimaryPageId();
                var applicationId = 'applicationId';
                var data = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
                var controllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: data, style: 'controller1'});
                var anotherControllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: data, style: 'controller1'});

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var newControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);
                var anotherControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);

                componentServices.add(ps, newControllerPointer, pagePointer, controllerStructure);
                componentServices.add(ps, anotherControllerPointer, pagePointer, anotherControllerStructure);

                expect(this.mockSiteData.isPlatformAppOnPage(pageId, applicationId)).toBeTruthy();
            });

            it('should keep the controller page application when adding another controller of a different application', function () {
                var pageId = this.mockSiteData.getPrimaryPageId();
                var applicationId = 'applicationId';
                var anotherApplicationId = 'anotherApplicationId';

                var data = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
                var anotherData = testUtils.mockFactory.dataMocks.controllerData({applicationId: anotherApplicationId});
                var controllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: data, style: 'controller1'});
                var anotherControllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: anotherData, style: 'controller1'});

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var newControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);
                var anotherControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);

                componentServices.add(ps, newControllerPointer, pagePointer, controllerStructure);
                componentServices.add(ps, anotherControllerPointer, pagePointer, anotherControllerStructure);

                expect(this.mockSiteData.isPlatformAppOnPage(pageId, applicationId)).toBeTruthy();
                expect(this.mockSiteData.isPlatformAppOnPage(pageId, anotherApplicationId)).toBeTruthy();
            });

            it('should keep the controller page application when adding another controller to a different page', function () {
                var pageId = 'pageId';
                var secondPageId = 'secondPageId';
                this.mockSiteData.addPageWithDefaults(pageId).addPageWithDefaults(secondPageId);
                var applicationId = 'applicationId';

                var data = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
                var anotherData = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
                var controllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: data, style: 'controller1'});
                var anotherControllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: anotherData, style: 'controller1'});

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var secondPagePointer = ps.pointers.components.getPage(secondPageId, constants.VIEW_MODES.DESKTOP);

                var newControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);
                var anotherControllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);

                componentServices.add(ps, newControllerPointer, pagePointer, controllerStructure);
                componentServices.add(ps, anotherControllerPointer, secondPagePointer, anotherControllerStructure);

                expect(this.mockSiteData.isPlatformAppOnPage(pageId, applicationId)).toBeTruthy();
                expect(this.mockSiteData.isPlatformAppOnPage(secondPageId, applicationId)).toBeTruthy();
            });

            it('should add the controller to appState map if its serialized data contained state - cut + paste', function () {
                var controllerState = 'state';
                addControllerWithState.call(this, controllerState);

                componentServices.deleteComponent(this.ps, this.controllerPointer);

                componentServices.add(this.ps, this.newControllerPointer, this.pagePointer, this.serializedController);

                expect(appControllerData.getState(this.ps, this.newControllerPointer.id)).toEqual(controllerState);
            });

            it('should add the controller to appState map if its serialized data contained state - copy + paste', function () {
                var controllerState = 'state';
                addControllerWithState.call(this, controllerState);

                componentServices.add(this.ps, this.newControllerPointer, this.pagePointer, this.serializedController);

                expect(appControllerData.getState(this.ps, this.newControllerPointer.id)).toEqual(controllerState);
            });

            it('should not touch appState map if the controller state is not defined', function () {
                addControllerWithState.call(this);

                componentServices.deleteComponent(this.ps, this.controllerPointer);

                componentServices.add(this.ps, this.newControllerPointer, this.pagePointer, this.serializedController);

                var newControllerState = this.ps.dal.get(this.ps.pointers.platform.getControllerStatePointer(this.newControllerPointer.id));

                expect(newControllerState).toBeUndefined();
            });
        });

        describe('change parent of controller', function () {
            it('should update the pagesPlatformApplications map accordingly', function () {
                var siteData = testUtils.mockFactory.mockSiteData().addMeasureMap();
                var pageId = siteData.getPrimaryPageId();
                var applicationId = 'applicationId';
                var data = testUtils.mockFactory.dataMocks.controllerData({applicationId: applicationId});
                var controllerStructure = testUtils.mockFactory.createStructure('platform.components.AppController', {data: data, style: 'controller1'});

                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                platform.init(ps);

                var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                var masterPagePointer = ps.pointers.components.getPage('masterPage', constants.VIEW_MODES.DESKTOP);
                var controllerPointer = componentServices.getComponentToAddRef(ps, pagePointer);

                componentServices.add(ps, controllerPointer, pagePointer, controllerStructure);
                structureService.setContainer(ps, controllerPointer, controllerPointer, masterPagePointer);

                expect(siteData.isPlatformAppOnPage(pageId, applicationId)).toBeFalsy();
                expect(siteData.isPlatformAppOnPage('masterPage', applicationId)).toBeTruthy();
            });

            it('should remove invalid connections when moving controller from masterPage to page', function () {
                testUtils.experimentHelper.openExperiments('connectionsData');
                var masterPage = siteConstants.MASTER_PAGE_ID;
                var pageId = 'pageId';
                var otherPageId = 'otherPageId';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addMeasureMap()
                    .addPageWithDefaults(pageId)
                    .addPageWithDefaults(otherPageId);
                var controllerStructure = addControllerToPage(siteData, masterPage);
                var connectionItem = testUtils.mockFactory.connectionMocks.connectionItem(controllerStructure.dataQuery, 'role');
                var compInMasterPageStructure = addComponentWithConnections(siteData, masterPage, [_.clone(connectionItem)]);
                var compInPageStructure = addComponentWithConnections(siteData, pageId, [_.clone(connectionItem)]);
                var compInOtherPageStructure = addComponentWithConnections(siteData, otherPageId, [_.clone(connectionItem)]);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                platform.init(ps);
                var controllerRef = getCompPointer(ps, controllerStructure.id, masterPage);
                var masterPageCompRef = getCompPointer(ps, compInMasterPageStructure.id, masterPage);
                var pageCompRef = getCompPointer(ps, compInPageStructure.id, pageId);
                var otherPageCompRef = getCompPointer(ps, compInOtherPageStructure.id, otherPageId);

                var pagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);

                structureService.setContainer(ps, controllerRef, controllerRef, pagePointer);

                expect(isComponentConnectedToController(ps, pageCompRef, controllerRef)).toBe(true);
                expect(isComponentConnectedToController(ps, masterPageCompRef, controllerRef)).toBe(false);
                expect(isComponentConnectedToController(ps, otherPageCompRef, controllerRef)).toBe(false);
            });

            it('should keep all connections when moving controller from page to masterPage', function () {
                testUtils.experimentHelper.openExperiments('connectionsData');
                var pageId = 'pageId';
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addMeasureMap()
                    .addPageWithDefaults(pageId);
                var controllerStructure = addControllerToPage(siteData, pageId);
                var connectionItem = testUtils.mockFactory.connectionMocks.connectionItem(controllerStructure.dataQuery, 'role');
                var compInPageStructure = addComponentWithConnections(siteData, pageId, [connectionItem]);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                platform.init(ps);
                var controllerRef = getCompPointer(ps, controllerStructure.id, pageId);
                var compRef = getCompPointer(ps, compInPageStructure.id, pageId);

                var masterPagePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);

                structureService.setContainer(ps, controllerRef, controllerRef, masterPagePointer);

                expect(isComponentConnectedToController(ps, compRef, controllerRef)).toBe(true);
            });
        });
    });
});
