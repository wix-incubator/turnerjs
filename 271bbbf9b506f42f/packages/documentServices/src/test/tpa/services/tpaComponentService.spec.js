define(['lodash',
        'utils',
        'documentServices/tpa/services/clientSpecMapService',
        'documentServices/tpa/services/provisionService',
        'documentServices/tpa/services/appStoreService',
        'documentServices/tpa/services/tpaComponentService',
        'documentServices/tpa/services/tpaWidgetService',
        'documentServices/tpa/services/tpaSectionService',
        'documentServices/tpa/services/installedTpaAppsOnSiteService',
        'documentServices/tpa/services/appMarketService',
        'documentServices/tpa/constants',
        'documentServices/tpa/services/pendingAppsService',
        'documentServices/component/component',
        'documentServices/tpa/utils/tpaUtils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/tpa/services/tpaEventHandlersService'
    ],
    function (_, utils, clientSpecMapService, provisionService, appStoreService, tpaComponentService, tpaWidgetService, tpaSectionService, installedTpaAppsOnSiteService, appMarketService, tpaConstants,
              pendingAppsService, component, tpaUtils, privateServicesHelper, tpaEventHandlersService) {

    'use strict';

    describe('tpa Component Service', function() {

        var mockPs, compRef, onSuccess, onError;

        describe('provisionApp', function() {
            beforeEach( function() {
                spyOn(utils.ajaxLibrary, 'ajax');
                onSuccess = onSuccess || jasmine.createSpy("onSuccess");
                onError = onError || jasmine.createSpy("onError");

                mockPs = privateServicesHelper.mockPrivateServices();
                compRef = component.getComponentToAddRef(mockPs, tpaConstants.TYPE.TPA_SECTION, "222");

                spyOn(appStoreService, 'preSaveAddApp');
                spyOn(appStoreService, 'provisionAppFromSourceTemplate');
                spyOn(clientSpecMapService, 'getLargestApplicationId').and.returnValue('30');
                spyOn(clientSpecMapService, 'registerAppData');
                spyOn(tpaWidgetService, 'addWidgetAfterProvision');
                spyOn(tpaSectionService, 'addSectionAfterProvision');
            });

            it('should not call provision functions if app data already exist', function() {
                spyOn(clientSpecMapService, "getAppDataByAppDefinitionId").and.returnValue({appDefId: 'appDefId'});

                tpaComponentService.provisionApp(mockPs, compRef, tpaConstants.TYPE.TPA_WIDGET, "222", 'type', onSuccess, onError);

                expect(appStoreService.preSaveAddApp).not.toHaveBeenCalled();
                expect(tpaWidgetService.addWidgetAfterProvision).toHaveBeenCalledWith(mockPs, compRef, 'type', {appDefId: 'appDefId'}, onSuccess, onError);
            });

            it('should call preSaveAddApp if app is added for the first time', function(){
                spyOn(clientSpecMapService, "getAppDataByAppDefinitionId").and.returnValue(null);

                tpaComponentService.provisionApp(mockPs, compRef, tpaConstants.TYPE.TPA_WIDGET, 'appDefId', {}, jasmine.any(Function), jasmine.any(Function));

                expect(appStoreService.preSaveAddApp).toHaveBeenCalledWith(mockPs, 'appDefId', jasmine.any(Function), jasmine.any(Function));
            });

            it('should call preSaveAddApp if app is in demo mode', function(){
                spyOn(clientSpecMapService, "getAppDataByAppDefinitionId").and.returnValue({
                    appDefId: 'appDefId',
                    demoMode: true
                });

                tpaComponentService.provisionApp(mockPs, compRef, tpaConstants.TYPE.TPA_WIDGET, 'appDefId', {}, jasmine.any(Function), jasmine.any(Function));

                expect(appStoreService.preSaveAddApp).toHaveBeenCalledWith(mockPs, 'appDefId', jasmine.any(Function), jasmine.any(Function));
            });

            it('should call pendingAppsService add if app is pending', function() {
                var appData = {
                    appDefId: 'appDefId'
                };
                spyOn(clientSpecMapService, "getAppDataByAppDefinitionId").and.returnValue(appData);

                spyOn(pendingAppsService, "isPending").and.returnValue(true);
                spyOn(pendingAppsService, "add").and.returnValue(true);

                tpaComponentService.provisionApp(mockPs, compRef, tpaConstants.TYPE.TPA_WIDGET, 'appDefId', {}, jasmine.any(Function), jasmine.any(Function));

                expect(pendingAppsService.add).toHaveBeenCalledWith(appData);
            });

            it('should call the add section function after provision if type is TPASection', function() {
                spyOn(clientSpecMapService, "getAppDataByAppDefinitionId").and.returnValue({appDefId: 'appDefId'});

                tpaComponentService.provisionApp(mockPs, compRef, tpaConstants.TYPE.TPA_SECTION, "222", {}, onSuccess, onError);


                expect(appStoreService.preSaveAddApp).not.toHaveBeenCalled();
                expect(tpaSectionService.addSectionAfterProvision).toHaveBeenCalledWith(mockPs, compRef, {}, {appDefId: 'appDefId'}, onSuccess, onError);
                expect(tpaWidgetService.addWidgetAfterProvision).not.toHaveBeenCalled();
            });

            it('should mark app is pending if no app data is available', function () {
                spyOn(clientSpecMapService, "getAppDataByAppDefinitionId").and.returnValue(undefined);

                tpaComponentService.provisionApp(mockPs, compRef, tpaConstants.TYPE.TPA_SECTION, 'appDefId', {}, _.noop, _.noop);


                expect(appStoreService.preSaveAddApp).toHaveBeenCalledWith(mockPs, 'appDefId', jasmine.any(Function), jasmine.any(Function));
            });

            it('should call provisionAppFromSourceTemplate w/ the given appDefId and sourceTemplateId when options have sourceTemplate', function () {
                tpaComponentService.provisionApp(mockPs, compRef, tpaConstants.TYPE.TPA_SECTION, 'appDefId', {
                    sourceTemplateId: 'sourceTemplateId'
                }, _.noop, _.noop);
                expect(appStoreService.provisionAppFromSourceTemplate).toHaveBeenCalledWith(mockPs, 'appDefId', 'sourceTemplateId', jasmine.any(Function), jasmine.any(Function));
            });
        });

        describe('refreshApp', function () {
            it('should add cacheKiller to given undefined query params', function () {
                var comp1 = {
                    setQueryParams: jasmine.createSpy('comp1')
                };
                var comp2 = {
                    setQueryParams: jasmine.createSpy('comp2')
                };

                var comps = [comp1, comp2];
                tpaComponentService.refreshApp(comps);
                _.forEach(comps, function (comp) {
                    expect(comp.setQueryParams).toHaveBeenCalledWith({
                        cacheKiller: jasmine.any(String)
                    });
                });
            });

            it('should add cacheKiller to given query params', function () {
                var queryParams = {
                    foo: 'bar',
                    bar: 'foo'
                };
                var comp1 = {
                    setQueryParams: jasmine.createSpy('comp1')
                };
                var comp2 = {
                    setQueryParams: jasmine.createSpy('comp2')
                };

                var expectedQueryParams = _.merge(queryParams, {cacheKiller: jasmine.any(String)});

                var comps = [comp1, comp2];
                tpaComponentService.refreshApp(comps, queryParams);
                _.forEach(comps, function (comp) {
                    expect(comp.setQueryParams).toHaveBeenCalledWith(expectedQueryParams);
                });
            });

            it('should handle comps not mounted yet', function () {
                var queryParams = {
                    foo: 'bar',
                    bar: 'foo'
                };
                var comp1 = {
                    setQueryParams: jasmine.createSpy('comp1')
                };
                var comp2 = {
                    setQueryParams: jasmine.createSpy('comp2')
                };

                var expectedQueryParams = _.merge(queryParams, {cacheKiller: jasmine.any(String)});

                var comps = [comp1, comp2, null];
                tpaComponentService.refreshApp(comps, queryParams);
                expect(comp1.setQueryParams).toHaveBeenCalledWith(expectedQueryParams);
                expect(comp2.setQueryParams).toHaveBeenCalledWith(expectedQueryParams);
            });
        });

        describe('setExternalId', function() {
            var compPointer = {};
            it('should update the comp data with the given external id and return a callback', function() {
                var callback = jasmine.createSpy('callback');
                var componentUpdateMock = spyOn(component.data, 'update');

                var externalId = 'de305d54-75b4-431b-adb2-eb6b9e546014';
                tpaComponentService.setExternalId(mockPs, compPointer, externalId, callback);

                expect(componentUpdateMock).toHaveBeenCalledWith(mockPs, compPointer, {
                    referenceId: externalId
                });

                expect(callback).toHaveBeenCalledWith('ExternalId: ' + externalId + ' will be saved when the site will be saved');
            });

            it('should return a callback w/ an error message when the given external Id is not guid', function() {
                var callback = jasmine.createSpy('callback');
                var componentUpdateMock = spyOn(component.data, 'update');
                var externalId = 'hxs0r';
                tpaComponentService.setExternalId(mockPs, compPointer, externalId, callback);
                expect(componentUpdateMock).not.toHaveBeenCalled();

                expect(callback).toHaveBeenCalledWith({
                    onError: 'The given externalId: ' + externalId + ' is not a valid UUID.'
                });
            });
        });

        describe('settingsUpdated', function () {
            it('should not call handlers with different compId', function () {
                var applicationId = 16;
                var targetCompId = 'compId';
                var handler = jasmine.createSpy();
                var message = {
                    foo: 'bar'
                };
                tpaEventHandlersService.registerSettingsUpdatedHandler(targetCompId, handler);
                tpaComponentService.settingsUpdated(mockPs, applicationId, 'other-compId', message);
                expect(handler).not.toHaveBeenCalled();
            });

            it('should call handler if one is registered', function () {
                var applicationId = 16;
                var targetCompId = 'compId';
                var handler = jasmine.createSpy();
                var message = {
                    foo: 'bar'
                };
                tpaEventHandlersService.registerSettingsUpdatedHandler(targetCompId, handler);
                tpaComponentService.settingsUpdated(mockPs, applicationId, targetCompId, message);
                expect(handler).toHaveBeenCalledWith(message);
            });

            it('should call all handlers if targetCompId is *', function () {
                var applicationId = 16;
                var compId1 = 'compId1';
                var compId2 = 'compId2';
                var handler = jasmine.createSpy();
                var message = {
                    foo: 'bar'
                };
                var comps = [
                    {
                        id: compId1
                    },
                    {
                        id: compId2
                    }
                ];
                spyOn(installedTpaAppsOnSiteService, 'getAllAppCompsByAppId').and.returnValue(comps);
                tpaEventHandlersService.registerSettingsUpdatedHandler(compId1, handler);
                tpaEventHandlersService.registerSettingsUpdatedHandler(compId2, handler);
                tpaEventHandlersService.registerSettingsUpdatedHandler(compId1 + '3', handler);

                tpaComponentService.settingsUpdated(mockPs, applicationId, '*', message);

                expect(handler).toHaveBeenCalledWith(message);
                expect(handler.calls.count()).toEqual(2);
            });
        });

        describe('component default size', function () {
            describe('section', function () {
                it('should return the widget default height and width', function () {
                    var height = '100';
                    var width = '200';

                    spyOn(clientSpecMapService, 'getMainSectionWidgetDataFromApplicationId').and.returnValue({
                        defaultWidth: width,
                        defaultHeight: height
                    });

                    var widgetDefaultSize = tpaComponentService.getDefaultLayout();
                    expect(widgetDefaultSize.height).toBe(height);
                    expect(widgetDefaultSize.width).toBe(width);
                    expect(widgetDefaultSize.x).toBe(0);
                });

                it('should return default height and width when app data has no data', function () {
                    spyOn(clientSpecMapService, 'getMainSectionWidgetDataFromApplicationId').and.returnValue({
                        defaultWidth: undefined,
                        defaultHeight: undefined
                    });

                    var widgetDefaultSize = tpaComponentService.getDefaultLayout();
                    expect(widgetDefaultSize.height).toBe(500);
                    expect(widgetDefaultSize.width).toBe(980);
                    expect(widgetDefaultSize.x).toBe(0);
                });
            });

            describe('widget', function () {
                it('should return the widget default height and width', function () {
                    var height = '100';
                    var width = '200';

                    spyOn(clientSpecMapService, 'getWidgetData').and.returnValue({
                        defaultWidth: width,
                        defaultHeight: height
                    });

                    var widgetDefaultSize = tpaComponentService.getDefaultLayout(privateServicesHelper, '1', '1');
                    expect(widgetDefaultSize.height).toBe(height);
                    expect(widgetDefaultSize.width).toBe(width);
                    expect(widgetDefaultSize.x).toBe(0);
                });
            });
        });
    });
});
