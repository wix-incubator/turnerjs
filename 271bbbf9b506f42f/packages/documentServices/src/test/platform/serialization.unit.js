define([
    'lodash',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/platform/serialization',
    'documentServices/component/component'
], function(_, testUtils, privateServicesHelper, platformSerialization, component){
    'use strict';

    describe('platform serialization', function(){

        beforeEach(function(){
            testUtils.experimentHelper.openExperiments('connectionsData');
        });

        function addControllerToPage(siteData) {
            var pageId = siteData.getPrimaryPageId();
            var data = testUtils.mockFactory.dataMocks.controllerData();
            var structure = testUtils.mockFactory.mockComponent('platform.components.AppController', siteData, pageId, {data: data});
            structure.styleId = 'controller1';
            return structure;
        }

        function getCompPointer(ps, compId, pageId){
            var page = ps.pointers.components.getPage(pageId, 'DESKTOP');
            return ps.pointers.components.getComponent(compId, page);
        }

        function addControllerWithConnectedComponent(mockSiteData, pageId) {
            var controller = addControllerToPage(mockSiteData);
            var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole');
            var connectionB = testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'anotherRole');
            var compConnections = [connectionA, connectionB];
            testUtils.mockFactory.mockComponent('mobile.core.components.Container', mockSiteData, pageId, {connections: compConnections});
            return controller;
        }

        describe('setConnectedComponents', function(){
            it('should add connectedComponents in case there is no custom serialized data', function(){
                var mockSiteData = testUtils.mockFactory.mockSiteData(null, true);
                var controller = addControllerToPage(mockSiteData);
                var pageId = mockSiteData.getPrimaryPageId();
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                var controllerPointer = getCompPointer(ps, controller.id, pageId);
                var serializedController = component.serialize(ps, controllerPointer);
                var connectedComponents = {compId: [testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole')]};

                var result = platformSerialization.setConnectedComponents(ps, serializedController, connectedComponents);

                expect(platformSerialization.getConnectedComponents(ps, result)).toEqual(connectedComponents);
            });

            it('should override the existing connectedComponents', function(){
                var mockSiteData = testUtils.mockFactory.mockSiteData(null, true);
                var pageId = mockSiteData.getPrimaryPageId();
                var controller = addControllerWithConnectedComponent(mockSiteData, pageId);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                var controllerPointer = getCompPointer(ps, controller.id, pageId);
                var serializedController = component.serialize(ps, controllerPointer);
                var connectedComponents = {compId: [testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole')]};

                var result = platformSerialization.setConnectedComponents(ps, serializedController, connectedComponents);

                expect(platformSerialization.getConnectedComponents(ps, result)).toEqual(connectedComponents);
            });

            it('should add connectedComponents in case there is other custom serialized data and not override it', function(){
                var mockSiteData = testUtils.mockFactory.mockSiteData(null, true);
                var pageId = mockSiteData.getPrimaryPageId();
                var controller = addControllerToPage(mockSiteData);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                var controllerPointer = getCompPointer(ps, controller.id, pageId);
                var serializedController = component.serialize(ps, controllerPointer);
                _.merge(serializedController, {custom: {someKey: 'someValue'}});
                var connectedComponents = {compId: [testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole')]};

                var result = platformSerialization.setConnectedComponents(ps, serializedController, connectedComponents);

                expect(platformSerialization.getConnectedComponents(ps, result)).toEqual(connectedComponents);
                expect(_.get(result, 'custom.someKey')).toEqual('someValue');
            });

            it('should do nothing in case connectedComponents was passed empty and there were no serialized connected components before', function(){
                var mockSiteData = testUtils.mockFactory.mockSiteData(null, true);
                var pageId = mockSiteData.getPrimaryPageId();
                var controller = addControllerToPage(mockSiteData);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                var controllerPointer = getCompPointer(ps, controller.id, pageId);
                var serializedController = component.serialize(ps, controllerPointer);
                _.merge(serializedController, {custom: {someKey: 'someValue'}});

                var result = platformSerialization.setConnectedComponents(ps, serializedController, undefined);

                expect(result).toEqual(serializedController);
            });

            it('should omit custom entry in case connectedComponents were passed empty and it was the only custom serialized data', function(){
                var mockSiteData = testUtils.mockFactory.mockSiteData(null, true);
                var pageId = mockSiteData.getPrimaryPageId();
                var controller = addControllerWithConnectedComponent(mockSiteData, pageId);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                var controllerPointer = getCompPointer(ps, controller.id, pageId);
                var serializedController = component.serialize(ps, controllerPointer);

                var result = platformSerialization.setConnectedComponents(ps, serializedController, undefined);

                expect(_.has(result, 'custom')).toBe(false);
            });
        });

        describe('getConnectedComponents', function(){
            it('should return the connectedComponents in case there is also other custom serializedData for controller', function(){
                var mockSiteData = testUtils.mockFactory.mockSiteData(null, true);
                var pageId = mockSiteData.getPrimaryPageId();
                var controller = addControllerWithConnectedComponent(mockSiteData, pageId);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                var controllerPointer = getCompPointer(ps, controller.id, pageId);
                var serializedController = component.serialize(ps, controllerPointer);
                _.merge(serializedController, {custom: {someKey: 'someValue'}});
                var expectedResult = _.get(serializedController, 'custom.relatedConnections');

                var result = platformSerialization.getConnectedComponents(ps, serializedController);

                expect(result).toEqual(expectedResult);
            });

            it('should return undefined in case there are no connected components', function(){
                var mockSiteData = testUtils.mockFactory.mockSiteData(null, true);
                var pageId = mockSiteData.getPrimaryPageId();
                var controller = addControllerToPage(mockSiteData);
                var ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                var controllerPointer = getCompPointer(ps, controller.id, pageId);
                var serializedController = component.serialize(ps, controllerPointer);
                _.merge(serializedController, {custom: {someKey: 'someValue'}});

                var result = platformSerialization.getConnectedComponents(ps, serializedController);

                expect(result).toBeUndefined();
            });
        });
    });
});
