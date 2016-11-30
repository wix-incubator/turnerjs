define([
    'lodash',
    'testUtils',
    'documentServices/dataModel/dataModel',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/connections/connections',
    'documentServices/constants/constants'], function(_, testUtils, dataModel, privateServicesHelper, connections, constants){
    'use strict';

    describe('connections API', function(){

        describe('getConnections', function(){
            beforeEach(function(){
                testUtils.experimentHelper.openExperiments('connectionsData');
                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.currentPageId = this.mockSiteData.getCurrentUrlPageId();
            });

            describe('desktop mode', function(){
                it('should return the passed compRef connections', function(){
                    var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.mockSiteData, this.currentPageId);
                    var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    var currentPageRef = mockPS.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                    var controllerRef = mockPS.pointers.components.getComponent(controller.id, currentPageRef);
                    var compConnections = [testUtils.mockFactory.connectionMocks.dsConnectionItem(controllerRef, 'someRole')];
                    var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.mockSiteData, this.currentPageId, {connections: compConnections});
                    mockPS.syncDisplayedJsonToFull();
                    var compRef = mockPS.pointers.components.getComponent(compStructure.id, currentPageRef);

                    var result = connections.get(mockPS, compRef);
                    expect(result).toEqual(compConnections);
                });

                it('should return an empty array in case component has no connections', function(){
                    var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.mockSiteData, this.currentPageId);
                    var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    var currentPageRef = mockPS.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                    var compRef = mockPS.pointers.components.getComponent(compStructure.id, currentPageRef);

                    var result = connections.get(mockPS, compRef);

                    expect(result).toEqual([]);
                });
            });

            describe('mobile mode', function(){

                beforeEach(function(){
                    this.mockSiteData.setMobileView(true);
                });

                it('should return the passed compRef connections', function(){
                    var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.mockSiteData, this.currentPageId);
                    var compConnections = [testUtils.mockFactory.connectionMocks.connectionItem(controller.dataQuery, 'someRole')];
                    var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.mockSiteData, this.currentPageId, {connections: compConnections}, true);

                    var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    var mobilePageRef = mockPS.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.MOBILE);
                    var desktopPageRef = mockPS.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                    var compRef = mockPS.pointers.components.getComponent(compStructure.id, mobilePageRef);
                    var controllerRef = mockPS.pointers.components.getComponent(controller.id, desktopPageRef);

                    var result = connections.get(mockPS, compRef);

                    var expectedResult = [testUtils.mockFactory.connectionMocks.dsConnectionItem(controllerRef, 'someRole')];
                    expect(result).toEqual(expectedResult);
                });

                it('should return an empty array in case component has no connections', function(){
                    var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.mockSiteData, this.currentPageId, {}, true);
                    var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                    var currentPageRef = mockPS.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.MOBILE);
                    var compRef = mockPS.pointers.components.getComponent(compStructure.id, currentPageRef);

                    var result = connections.get(mockPS, compRef);

                    expect(result).toEqual([]);
                });

            });

        });

        describe('getPlatformAppConnections', function () {
            beforeEach(function(){
                testUtils.experimentHelper.openExperiments('connectionsData');
                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.currentPageId = this.mockSiteData.getCurrentUrlPageId();
            });

            it('should return the passed compRef connections without wixCodeConnectionItem', function(){
                var controller = testUtils.mockFactory.mockComponent('platform.components.AppController', this.mockSiteData, this.currentPageId);
                var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                var currentPageRef = mockPS.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                var controllerRef = mockPS.pointers.components.getComponent(controller.id, currentPageRef);
                var appConnection = testUtils.mockFactory.connectionMocks.dsConnectionItem(controllerRef, 'someRole');
                var wixCodeConnection = testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('someNickname');
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.mockSiteData, this.currentPageId, {connections: [appConnection, wixCodeConnection]});
                mockPS.syncDisplayedJsonToFull();
                var compRef = mockPS.pointers.components.getComponent(compStructure.id, currentPageRef);

                var result = connections.getPlatformAppConnections(mockPS, compRef);
                expect(result).toEqual([appConnection]);
            });

            it('should return an empty array in case component has no connections other than wixCodeConnectionItem', function(){
                var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                var currentPageRef = mockPS.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                var wixCodeConnection = testUtils.mockFactory.connectionMocks.wixCodeConnectionItem('someNickname');
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.mockSiteData, this.currentPageId, {connections: [wixCodeConnection]});
                mockPS.syncDisplayedJsonToFull();
                var compRef = mockPS.pointers.components.getComponent(compStructure.id, currentPageRef);

                var result = connections.getPlatformAppConnections(mockPS, compRef);

                expect(result).toEqual([]);
            });

            it('should return an empty array in case component has no connections', function(){
                var compStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', this.mockSiteData, this.currentPageId);
                var mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(this.mockSiteData);
                var currentPageRef = mockPS.pointers.components.getPage(this.currentPageId, constants.VIEW_MODES.DESKTOP);
                var compRef = mockPS.pointers.components.getComponent(compStructure.id, currentPageRef);

                var result = connections.get(mockPS, compRef);

                expect(result).toEqual([]);
            });
        });

        describe('connect', function(){
            beforeEach(function(){
                testUtils.experimentHelper.openExperiments('connectionsData');
                var mockSiteData = testUtils.mockFactory.mockSiteData();
                var currentPageId = mockSiteData.getCurrentUrlPageId();
                var fromCompStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', mockSiteData, currentPageId);
                var toCompStructure = testUtils.mockFactory.mockComponent('platform.components.AppController', mockSiteData, currentPageId);
                this.mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                this.currentPageRef = this.mockPS.pointers.components.getPage(currentPageId, constants.VIEW_MODES.DESKTOP);
                this.fromCompRef = this.mockPS.pointers.components.getComponent(fromCompStructure.id, this.currentPageRef);
                this.controllerRef = this.mockPS.pointers.components.getComponent(toCompStructure.id, this.currentPageRef);
                this.connectionConfig = {src: 'myPic'};
            });

            it('should update the component connection data according to the passed arguments', function(){
                var connectionRole = 'someRole';
                var expectedConnections = [testUtils.mockFactory.connectionMocks.dsConnectionItem(this.controllerRef, connectionRole, this.connectionConfig)];

                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, connectionRole, this.connectionConfig);

                expect(connections.get(this.mockPS, this.fromCompRef)).toEqual(expectedConnections);
            });

            it('should add a connection to the existing component connection data', function(){
                var roleA = 'firstConnectionRole';
                var roleB = 'secondConnectionRole';
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, roleA, this.connectionConfig);
                var connectionMocks = testUtils.mockFactory.connectionMocks;
                var expectedConnections = [
                    connectionMocks.dsConnectionItem(this.controllerRef, roleA, this.connectionConfig),
                    connectionMocks.dsConnectionItem(this.controllerRef, roleB, this.connectionConfig)
                ];

                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, roleB, this.connectionConfig);

                expect(connections.get(this.mockPS, this.fromCompRef)).toEqual(expectedConnections);
            });

            it('should not change the connections data if component is already connected to the passed controller with the passed role and connectionConfig', function(){
                var role = 'someRole';
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, role, this.connectionConfig);
                var expectedConnections = connections.get(this.mockPS, this.fromCompRef);

                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, role, this.connectionConfig);

                expect(connections.get(this.mockPS, this.fromCompRef)).toEqual(expectedConnections);
            });

            it('should update the existing connection item if a new config was given', function(){
                var role = 'someRole';
                var otherConnectionConfig = {shahar: "zur"};
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, role, this.connectionConfig);

                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, role, otherConnectionConfig);

                var expectedConnections = [testUtils.mockFactory.connectionMocks.dsConnectionItem(this.controllerRef, role, otherConnectionConfig)];

                expect(connections.get(this.mockPS, this.fromCompRef)).toEqual(expectedConnections);
            });

            it('should update the existing connection item if the new given config was changed partially', function(){
                var role = 'someRole';
                var fullConnectionConfig = {src: 'myPic', title: 'myTitle'};
                var partialConnectionConfig = {src: 'myPic'};
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, role, fullConnectionConfig);

                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, role, partialConnectionConfig);

                var expectedConnections = [testUtils.mockFactory.connectionMocks.dsConnectionItem(this.controllerRef, role, partialConnectionConfig)];

                expect(connections.get(this.mockPS, this.fromCompRef)).toEqual(expectedConnections);
            });

            it('should throw an error in case controllerRef component type is not a controller', function(){
                var connectMethod = connections.connect.bind(connections, this.mockPS, this.fromCompRef, this.fromCompRef, 'someRole', this.connectionConfig);

                expect(connectMethod).toThrow(new Error('controllerRef component type is invalid - should be a controller or current context'));
            });
        });

        describe('disconnect', function(){
            beforeEach(function(){
                testUtils.experimentHelper.openExperiments('connectionsData');
                var mockSiteData = testUtils.mockFactory.mockSiteData();
                var currentPageId = mockSiteData.getCurrentUrlPageId();
                var fromCompStructure = testUtils.mockFactory.mockComponent('wysiwyg.viewer.components.SiteButton', mockSiteData, currentPageId);
                var toCompStructure = testUtils.mockFactory.mockComponent('platform.components.AppController', mockSiteData, currentPageId);
                this.mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
                this.currentPageRef = this.mockPS.pointers.components.getPage(currentPageId, constants.VIEW_MODES.DESKTOP);
                this.fromCompRef = this.mockPS.pointers.components.getComponent(fromCompStructure.id, this.currentPageRef);
                this.controllerRef = this.mockPS.pointers.components.getComponent(toCompStructure.id, this.currentPageRef);
                this.connectionConfig = {src: 'myPic'};
            });

            it('should remove the relevant connection item from the component data', function(){
                var role = 'roleA';
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, role);

                connections.disconnect(this.mockPS, this.fromCompRef, this.controllerRef, role);

                expect(connections.get(this.mockPS, this.fromCompRef)).toEqual([]);
            });

            it('should remove the relevant connection item from the component data when the connection item has configuration', function(){
                var role = 'roleA';
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, role, this.connectionConfig);

                connections.disconnect(this.mockPS, this.fromCompRef, this.controllerRef, role);

                expect(connections.get(this.mockPS, this.fromCompRef)).toEqual([]);
            });

            it('should do nothing in case component has no connections', function(){
                connections.disconnect(this.mockPS, this.fromCompRef, this.controllerRef, 'roleA');

                expect(connections.get(this.mockPS, this.fromCompRef)).toEqual([]);
            });

            it('should do nothing in case no such connection item exists', function(){
                var roleA = 'roleA';
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, roleA);
                var expectedConnections = [testUtils.mockFactory.connectionMocks.dsConnectionItem(this.controllerRef, roleA)];

                connections.disconnect(this.mockPS, this.fromCompRef, this.controllerRef, 'roleB');

                expect(connections.get(this.mockPS, this.fromCompRef)).toEqual(expectedConnections);
            });

            it('should remove only the requested item and not touch the other connection items', function(){
                var roleA = 'roleA';
                var roleB = 'roleB';
                var roleC = 'roleC';
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, roleA);
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, roleB);
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, roleC);
                var expectedResult = [
                    testUtils.mockFactory.connectionMocks.dsConnectionItem(this.controllerRef, roleA),
                    testUtils.mockFactory.connectionMocks.dsConnectionItem(this.controllerRef, roleC)
                ];

                connections.disconnect(this.mockPS, this.fromCompRef, this.controllerRef, roleB);

                expect(connections.get(this.mockPS, this.fromCompRef)).toEqual(expectedResult);
            });

            it('should remove all controller connections from a component if role is not passed', function () {
                var roleA = 'roleA';
                var roleB = 'roleB';
                var roleC = 'roleC';
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, roleA);
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, roleB);
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, roleC);

                connections.disconnect(this.mockPS, this.fromCompRef, this.controllerRef);

                expect(connections.get(this.mockPS, this.fromCompRef)).toEqual([]);
            });

            it('should remove the connections data item from the component in case the new connections item is empty', function () {
                var role = 'roleA';
                connections.connect(this.mockPS, this.fromCompRef, this.controllerRef, role);

                connections.disconnect(this.mockPS, this.fromCompRef, this.controllerRef, role);

                expect(dataModel.getConnectionsItem(this.mockPS, this.fromCompRef)).toBeNull();
            });
        });
    });
});
