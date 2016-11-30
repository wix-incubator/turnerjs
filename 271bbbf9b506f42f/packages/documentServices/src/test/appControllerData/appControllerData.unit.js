define([
    'lodash',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/appControllerData/appControllerData',
    'documentServices/component/componentsDefinitionsMap',
    'documentServices/componentDetectorAPI/componentDetectorAPI',
    'documentServices/platform/platform',
    'documentServices/platform/common/constants',
    'documentServices/constants/constants'],
    function (_,
              testUtils,
              privateServicesHelper,
              appControllerData,
              componentsDefinitionsMap,
              componentDetectorAPI,
              platform,
              platformConstants,
              constants) {

    'use strict';

    var controllerType = 'platform.components.AppController';

    describe('appControllerData API', function () {
        var ERROR_MSG = 'controllerRef component type is invalid - should be an AppController';

        function addCompToSite(compType, dataItemOverride) {
            var mockSiteData = testUtils.mockFactory.mockSiteData();
            var currentPageId = mockSiteData.getCurrentUrlPageId();
            dataItemOverride = dataItemOverride || {settings: JSON.stringify({hello: 'world', live: 'work'})};
            var compDataItem = testUtils.mockFactory.dataMocks.controllerData(dataItemOverride);
            var compStructure = testUtils.mockFactory.mockComponent(compType, mockSiteData, currentPageId, {data: compDataItem});
            this.mockPS = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
            var currentPageRef = this.mockPS.pointers.components.getPage(currentPageId, constants.VIEW_MODES.DESKTOP);
            this.compRef = this.mockPS.pointers.components.getComponent(compStructure.id, currentPageRef);
        }

        function createSiteWithControllers(controllerIds) {
            var siteData = testUtils.mockFactory.mockSiteData();
            var currentPageId = siteData.getCurrentUrlPageId();
            addControllers(siteData, currentPageId, controllerIds);
            this.privateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            this.currentPageRef = this.privateServices.pointers.components.getPage(currentPageId, constants.VIEW_MODES.DESKTOP);
            var platformPointer = this.privateServices.pointers.platform.getPlatformPointer();
            this.privateServices.dal.full.set(platformPointer, {
                appState: {},
                controllersStageData: {}
            });
        }

        function addControllers(siteData, pageId, controllerIds) {
            _.forEach(controllerIds, function (controllerId) {
                testUtils.mockFactory.mockComponent(controllerType, siteData, pageId, {}, false, controllerId);
            });
        }

        describe('when the given controller has settings', function () {
            describe('setSettings', function () {
                it('should set settings to given controller', function () {
                    var settings = {goodbye: 'world'};
                    addCompToSite.call(this, 'platform.components.AppController');

                    appControllerData.setSettings(this.mockPS, this.compRef, settings);
                    var result = appControllerData.getSettings(this.mockPS, this.compRef);

                    expect(result).toEqual(settings);
                });

                it('should throw an error in case controllerRef component type is not a controller', function () {
                    addCompToSite.call(this, 'wysiwyg.viewer.components.SiteButton');
                    var settings = {goodbye: 'world'};
                    var getSettingsMethod = appControllerData.setSettings.bind(appControllerData, this.mockPS, this.compRef, settings);

                    expect(getSettingsMethod).toThrow(new Error(ERROR_MSG));
                });

                it('should throw an error in case the settings item is not stringifiable', function () {
                    addCompToSite.call(this, 'platform.components.AppController');
                    var invalidSettings = {};
                    invalidSettings.a = {b: invalidSettings};
                    var getSettingsMethod = appControllerData.setSettings.bind(appControllerData, this.mockPS, this.compRef, invalidSettings);

                    expect(getSettingsMethod).toThrow(new Error('Invalid settings item - should be JSON stringifiable'));
                });
            });

            describe('setSettingsIn', function () {
                it('should set settings to given controller in given path', function () {
                    addCompToSite.call(this, 'platform.components.AppController');

                    appControllerData.setSettingsIn(this.mockPS, this.compRef, 'hello', 'wix');
                    var result = appControllerData.getSettings(this.mockPS, this.compRef);

                    expect(result.hello).toEqual('wix');
                });

                it('should throw an error in case controllerRef component type is not a controller', function () {
                    addCompToSite.call(this, 'wysiwyg.viewer.components.SiteButton');
                    var getSettingsMethod = appControllerData.setSettingsIn.bind(appControllerData, this.mockPS, this.compRef, 'hello', 'wix');
                    expect(getSettingsMethod).toThrow(new Error(ERROR_MSG));
                });
            });

            describe('getSettings', function () {
                it('should return the parsed settings object', function () {
                    var settings = {hello: 'world'};
                    addCompToSite.call(this, 'platform.components.AppController', {settings: JSON.stringify(settings)});

                    var result = appControllerData.getSettings(this.mockPS, this.compRef);

                    expect(result).toEqual(settings);
                });

                it('should throw an error in case controllerRef component type is not a controller', function () {
                    addCompToSite.call(this, 'wysiwyg.viewer.components.SiteButton');
                    var getSettingsMethod = appControllerData.getSettings.bind(appControllerData, this.mockPS, this.compRef);

                    expect(getSettingsMethod).toThrow(new Error(ERROR_MSG));
                });
            });

            describe('getSettingsIn', function () {
                it('should return the value of the given path in the parsed settings object', function () {
                    var settings = {hello: 'world'};
                    addCompToSite.call(this, 'platform.components.AppController', {settings: JSON.stringify(settings)});

                    var result = appControllerData.getSettingsIn(this.mockPS, this.compRef, 'hello');

                    expect(result).toEqual(settings.hello);
                });

                it('should throw an error in case controllerRef component type is not a controller', function () {
                    addCompToSite.call(this, 'wysiwyg.viewer.components.SiteButton');
                    var getSettingsMethod = appControllerData.getSettingsIn.bind(appControllerData, this.mockPS, this.compRef);

                    expect(getSettingsMethod).toThrow(new Error(ERROR_MSG));
                });
            });

        });

        describe('when the given controller does not have settings', function () {
            describe('setSettings', function () {
                it('should set settings to given controller', function () {
                    var settings = {goodbye: 'world'};
                    addCompToSite.call(this, 'platform.components.AppController', {});

                    appControllerData.setSettings(this.mockPS, this.compRef, settings);
                    var result = appControllerData.getSettings(this.mockPS, this.compRef);

                    expect(result).toEqual(settings);
                });
            });

            describe('setSettingsIn', function () {
                it('should set settings to given controller in given path', function () {
                    addCompToSite.call(this, 'platform.components.AppController', {});

                    appControllerData.setSettingsIn(this.mockPS, this.compRef, 'hello', 'wix');
                    var result = appControllerData.getSettings(this.mockPS, this.compRef);

                    expect(result.hello).toEqual('wix');
                });

                it('should set settings to given controller in given path more than one level deep', function () {
                    addCompToSite.call(this, 'platform.components.AppController', {});

                    appControllerData.setSettingsIn(this.mockPS, this.compRef, 'hello.world', 'wix');
                    var result = appControllerData.getSettings(this.mockPS, this.compRef);

                    expect(result.hello.world).toEqual('wix');
                });
            });

            describe('getSettings', function () {
                it('should return an empty object', function () {
                    addCompToSite.call(this, 'platform.components.AppController', {});

                    var result = appControllerData.getSettings(this.mockPS, this.compRef);

                    expect(result).toEqual({});
                });
            });
        });


        describe('getName', function () {
            it('should return the controller name', function () {
                addCompToSite.call(this, 'platform.components.AppController', {name: 'controllerName'});

                var result = appControllerData.getName(this.mockPS, this.compRef);

                expect(result).toEqual('controllerName');
            });

            it('should throw an error in case controllerRef component type is not a controller', function () {
                addCompToSite.call(this, 'wysiwyg.viewer.components.SiteButton');
                var getSettingsMethod = appControllerData.getName.bind(appControllerData, this.mockPS, this.compRef);

                expect(getSettingsMethod).toThrow(new Error(ERROR_MSG));
            });
        });

        describe('setName', function () {
            it('should set the given controller name', function () {
                addCompToSite.call(this, 'platform.components.AppController');

                appControllerData.setName(this.mockPS, this.compRef, 'controllerName');
                var result = appControllerData.getName(this.mockPS, this.compRef);

                expect(result).toEqual('controllerName');
            });

            it('should throw an error in case controllerRef component type is not a controller', function () {
                addCompToSite.call(this, 'wysiwyg.viewer.components.SiteButton');
                var getSettingsMethod = appControllerData.setName.bind(appControllerData, this.mockPS, this.compRef, 'controllerName');

                expect(getSettingsMethod).toThrow(new Error(ERROR_MSG));
            });
        });

        describe('setState', function () {
            it('should set the given controllers state to siteData', function () {
                createSiteWithControllers.call(this, ['controller1', 'controller2', 'controller3']);
                var controllerRefs = _.indexBy(componentDetectorAPI.getComponentByType(this.privateServices, controllerType, this.currentPageRef), 'id');
                var stateMap = {
                    unconfigured: [controllerRefs.controller1],
                    configured: [controllerRefs.controller2, controllerRefs.controller3]
                };

                appControllerData.setState(this.privateServices, stateMap);

                expect(appControllerData.getState(this.privateServices, controllerRefs.controller1.id)).toEqual('unconfigured');
                expect(appControllerData.getState(this.privateServices, controllerRefs.controller2.id)).toEqual('configured');
                expect(appControllerData.getState(this.privateServices, controllerRefs.controller3.id)).toEqual('configured');
            });

            it('should update the state of a controller if it already had one', function () {
                createSiteWithControllers.call(this, ['controller1', 'controller2']);
                var controllerRefs = _.indexBy(componentDetectorAPI.getComponentByType(this.privateServices, controllerType, this.currentPageRef), 'id');

                appControllerData.setState(this.privateServices, {unconfigured: [controllerRefs.controller1, controllerRefs.controller2]});
                appControllerData.setState(this.privateServices, {configured: [controllerRefs.controller1]});

                expect(appControllerData.getState(this.privateServices, controllerRefs.controller1.id)).toEqual('configured');
                expect(appControllerData.getState(this.privateServices, controllerRefs.controller2.id)).toEqual('unconfigured');
            });
        });

        describe('getState', function () {
            it('should return the state of the given controller', function () {
                createSiteWithControllers.call(this, ['controller1']);
                var controllerRef = componentDetectorAPI.getComponentByType(this.privateServices, controllerType, this.currentPageRef)[0];
                var stateMap = {
                    configured: [controllerRef]
                };

                appControllerData.setState(this.privateServices, stateMap);

                expect(appControllerData.getState(this.privateServices, controllerRef.id)).toEqual('configured');
            });

            it('should return default state if the state of the controller is not defined', function () {
                createSiteWithControllers.call(this, ['controller1']);
                var controllerRef = componentDetectorAPI.getComponentByType(this.privateServices, controllerType, this.currentPageRef)[0];

                expect(appControllerData.getState(this.privateServices, controllerRef.id)).toEqual(platformConstants.Controller.DEFAULT_STATE);
            });
        });
    });
});
