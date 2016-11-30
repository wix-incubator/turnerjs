define(['lodash',
        'core',
        'utils',
        'testUtils',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/tpa/tpa',
        'documentServices/siteMetadata/siteMetadata',
        'documentServices/hooks/hooks',
        'documentServices/component/component',
        'documentServices/structure/structure',
        'documentServices/tpa/services/installedTpaAppsOnSiteService',
        'documentServices/tpa/services/tpaComponentService',
        'documentServices/tpa/services/tpaWidgetService',
        'documentServices/tpa/services/tpaSectionService',
        'documentServices/tpa/services/clientSpecMapService',
        'documentServices/tpa/services/appMarketService',
        'documentServices/tpa/services/provisionService',
        'documentServices/tpa/services/appStoreService',
        'documentServices/tpa/services/pendingAppsService',
        'documentServices/page/page',
        'documentServices/tpa/constants',
        'documentServices/tpa/services/tpaEventHandlersService',
        'documentServices/tpa/services/experimentService',
        'documentServices/tpa/utils/tpaUtils',
        'documentServices/tpa/handlers/tpaHandlers'
    ],
    function (_, core, utils, testUtils, privateServicesHelper, tpa, siteMetadata, hooks, component, structure, installedTpaAppsOnSiteService, tpaComponentService, tpaWidgetService, tpaSectionService, clientSpecMapService, appMarketService, provisionService, appStoreService, pendingAppsService, page, tpaConstants, tpaEventHandlersService, experimentService, tpaUtils, tpaHandlers) {

    'use strict';

    describe('tpa API', function() {
        var mockPs;

        beforeEach(function () {
            mockPs = privateServicesHelper.mockPrivateServices();
            spyOn(mockPs.setOperationsQueue, 'asyncSetOperationComplete');
            spyOn(tpaHandlers, 'settpads');
            spyOn(experimentService, 'getExperiments').and.returnValue({
                isAppFlowsExperimentOn: function () {
                    return false;
                }
            });
            spyOn(appStoreService, 'settleOnLoad');
        });

        describe('initialize', function () {

            it('should set tpaHandlers tpa ds when initialize is been called', function () {
                spyOn(siteMetadata.generalInfo, "isFirstSave").and.callFake(function () {
                    return false;
                });

                tpa.initialize(mockPs, {runStylesGC: false});

                expect(tpaHandlers.settpads).toHaveBeenCalledWith(tpa);
            });

            describe('fixPageUriSEOIfNeeded', function(){

                beforeEach(function(){
                    spyOn(page.data, 'set');
                });

                it('should set the page pageUriSEO property if it\'s undefined', function () {
                    spyOn(page.data, 'get').and.returnValue({
                        tpaApplicationId: 1731,
                        tpaPageId: 'book_a_room',
                        id: 'currentPage'
                    });
                    spyOn(clientSpecMapService, "getAppData").and.returnValue({
                        appDefinitionId: '135aad86-9125-6074-7346-29dc6a3c9bcf'
                    });
                    spyOn(clientSpecMapService, "getWidgetDataFromTPAPageId").and.returnValue({
                        'appPage': {
                            'name': 'Book a Room'
                        }
                    });

                    tpa.initialize(mockPs, {});

                    expect(page.data.set).toHaveBeenCalledWith(mockPs, 'currentPage', {'pageUriSEO': 'book-a-room'});
                });

                it('should not set the page pageUriSEO property if it\'s already defined', function () {
                    spyOn(page.data, 'get').and.returnValue({
                        tpaApplicationId: 1731,
                        tpaPageId: 'book_a_room',
                        pageUriSEO: 'book-a-room'
                    });

                    tpa.initialize(mockPs, {});

                    expect(page.data.set).not.toHaveBeenCalled();
                });

                it('should not set the page pageUriSEO property if the page doesn\'t include a section', function () {
                    spyOn(page.data, 'get').and.returnValue({
                        tpaApplicationId: 0
                    });

                    tpa.initialize(mockPs, {});

                    expect(page.data.set).not.toHaveBeenCalled();
                });


            });
        });


        describe("addWidget", function() {

            it("should add widget", function () {
                spyOn(tpaComponentService, "provisionApp");
                var layout = {width: 100, height: 200, x: 10, y: 15};

                var params = {
                    widgetId: "111",
                    pageId: "page1",
                    layout: layout,
                    onError: jasmine.createSpy('onError')
                };

                var compRef = {};
                tpa.widget.add.dataManipulation(mockPs, compRef, "123", params);

                expect(tpaComponentService.provisionApp).toHaveBeenCalledWith(mockPs, compRef, tpaConstants.TYPE.TPA_WIDGET, "123", params, jasmine.any(Function), jasmine.any(Function));
            });
        });

        describe("addSection", function() {
            it("should add section", function(){
                spyOn(tpaComponentService, "provisionApp");
                var onError = jasmine.createSpy('onError');
                var pageData = tpa.section.add.dataManipulation(mockPs, {
                    page: 'pageId'
                }, "appDefinitionId", {}, onError);


                expect(pageData).toContain({
                    page: 'pageId'
                });

                expect(pageData.sectionId).toBeDefined();

                var options = {
                    sectionId: pageData.sectionId
                };
                expect(tpaComponentService.provisionApp).toHaveBeenCalledWith(mockPs, pageData, tpaConstants.TYPE.TPA_SECTION, "appDefinitionId", options, jasmine.any(Function), jasmine.any(Function));
            });
        });

        describe("alreadyInstalled", function() {
            it("should return true if section already installed", function() {
                spyOn(tpaSectionService, 'alreadyInstalled').and.returnValue(true);
                expect(tpa.section.alreadyInstalled(mockPs, "222")).toBeTruthy();
            });

            it("should return false if section is not installed", function() {
                spyOn(tpaSectionService, 'alreadyInstalled').and.returnValue(false);
                expect(tpa.section.alreadyInstalled(mockPs, "222")).toBeFalsy();
            });
        });

        describe('getPageData', function () {
            it('should be truthy if page has a section installed on it', function () {
                spyOn(page.data, 'get').and.returnValue({
                    tpaApplicationId: 1,
                    title: 'title'
                });
                spyOn(clientSpecMapService, "getAppData");
                var pageData = tpa.section.getPageData(mockPs, "pageId");
                expect(pageData.hasSection).toBeTruthy();
            });

            it('should be falsy if page has no section installed on it', function () {
                spyOn(page.data, 'get').and.returnValue({
                    tpaApplicationId: 0,
                    title: 'title'
                });
                spyOn(clientSpecMapService, "getAppData");
                var pageData = tpa.section.getPageData(mockPs, "pageId");
                expect(pageData.hasSection).toBeFalsy();
            });

            it('should return page title when page has a section installed on it', function () {
                spyOn(page.data, 'get').and.returnValue({
                    tpaApplicationId: 1,
                    title: 'title'
                });
                spyOn(clientSpecMapService, "getAppData");
                var pageData = tpa.section.getPageData(mockPs, "pageId");
                expect(pageData.title).toBe('title');
            });

            it('should return app data when page has a section installed on it', function () {
                spyOn(page.data, 'get').and.returnValue({
                    tpaApplicationId: 1,
                    title: 'title'
                });

                var appData = {
                    appDefinitionName: 'name'
                };

                spyOn(clientSpecMapService, "getAppData").and.returnValue(appData);
                var pageData = tpa.section.getPageData(mockPs, "pageId");
                expect(pageData.appData).toBe(appData);
            });
        });

        describe("delete tpa comps", function() {
            it("should call tpaWidgetService deleteWidget with the given compref and callback", function() {
                spyOn(component.data, 'get').and.returnValue({
                    applicationId: '16'
                });
                spyOn(tpaWidgetService, "deleteWidget");

                var compRef = {
                    id: "123"
                };

                tpa.widget.delete.dataManipulation(mockPs, compRef);

                expect(tpaWidgetService.deleteWidget).toHaveBeenCalledWith(mockPs, compRef, '16', jasmine.any(Function));
            });

            it("should delete section", function() {
                spyOn(page.data, 'get').and.returnValue({
                    tpaApplicationId: '16'
                });
                spyOn(tpaSectionService, "deleteSection");

                var pageId = "deletedPage";

                tpa.section.delete.dataManipulation(mockPs, pageId);

                expect(tpaSectionService.deleteSection).toHaveBeenCalledWith(mockPs, pageId, {}, jasmine.any(Function));
            });
        });

        describe('triggerSettingsUpdated', function () {
            it("should call tpaComponentService settingsUpdated with the given application id, compId and message", function() {
                spyOn(tpaComponentService, 'settingsUpdated');

                var applicationId = 16;
                var compId = 'compId';
                var message = {
                    data: 'foo-bar'
                };
                tpa.change.trigger.settingsUpdated(null, applicationId, compId, message);

                expect(tpaComponentService.settingsUpdated).toHaveBeenCalledWith(null, applicationId, compId, message);
            });
        });

        describe('editModeChange', function () {
            it("should call tpaComponentService editModeChange with the given editor mode", function() {
                spyOn(tpaEventHandlersService, 'editModeChange');

                var editMode = 'preview';
                tpa.change.editMode(null, editMode);

                expect(tpaEventHandlersService.editModeChange).toHaveBeenCalledWith(editMode);
            });
        });

        describe('registerSettingsUpdatedHandler', function () {
            it("should call tpaComponentService registerSettingsUpdatedHandler with the given compId and handler", function() {
                spyOn(tpaEventHandlersService, 'registerSettingsUpdatedHandler');

                var compId = 'compId';
                var handler = function () {};
                tpa.change.register.settingsUpdatedHandler(null, compId, handler);

                expect(tpaEventHandlersService.registerSettingsUpdatedHandler).toHaveBeenCalledWith(compId, handler);
            });
        });

        describe('registerEditModeChangeHandler', function () {
            it("should call tpaComponentService registerEditModeChangeHandler with the given compId and handler", function() {
                spyOn(tpaEventHandlersService, 'registerEditModeChangeHandler');

                var compId = 'compId';
                var handler = function () {};
                tpa.change.register.editModeChangeHandler(null, compId, handler);

                expect(tpaEventHandlersService.registerEditModeChangeHandler).toHaveBeenCalledWith(compId, handler);
            });
        });

        describe('registerDeleteCompHandler', function () {
            it("should call tpaEventHandlersService registerDeleteCompHandler with the given compId and handler", function() {
                spyOn(tpaEventHandlersService, 'registerDeleteCompHandler');

                var compId = 'compId';
                var handler = function () {};
                tpa.change.register.deleteCompHandler(null, compId, handler);

                expect(tpaEventHandlersService.registerDeleteCompHandler).toHaveBeenCalledWith(compId, handler);
            });
        });

        describe('refreshApp', function () {
            it('should call tpaComponentService refreshApp with the given comps array and query param', function() {
                spyOn(tpaComponentService, 'refreshApp');

                var comps = ['compId1', 'compId2'];
                var queryParams = {};
                tpa.app.refreshApp(null, comps, queryParams);

                expect(tpaComponentService.refreshApp).toHaveBeenCalledWith(comps, queryParams);
            });
        });

        describe("isContainerContainsPremiumTpa", function() {
            it("should return true for container containing premium tpas", function() {
                spyOn(component, "getTpaChildren").and.returnValue([{
                  id: "tpa1"
                }, {
                    id: "tpa2"
                }]);
                spyOn(component, "getType").and.returnValue('not-tpa-type');

                spyOn(component.data, "get").and.returnValue({applicationId: "18"});
                spyOn(clientSpecMapService, "isPremiumApp").and.returnValue(true);

                expect(tpa.isContainerContainsPremiumTpa(mockPs, {})).toBeTruthy();
            });

            it("should return false for container containing tpas but not premium", function() {
                spyOn(component, "getTpaChildren").and.returnValue([{
                    id: "tpa1"
                }, {
                    id: "tpa2"
                }]);
                spyOn(component.data, "get").and.returnValue({applicationId: "18"});
                spyOn(clientSpecMapService, "isPremiumApp").and.returnValue(false);
                spyOn(component, "getType").and.returnValue('not-tpa-type');

                expect(tpa.isContainerContainsPremiumTpa(mockPs, {})).toBeFalsy();
            });

            it("should return false for container not containing tpas", function() {
                spyOn(component, "getTpaChildren").and.returnValue([]);
                spyOn(component, "getType").and.returnValue('not-tpa-type');

                expect(tpa.isContainerContainsPremiumTpa(mockPs, {})).toBeFalsy();
            });
        });

        describe("getPremiumTpaChildren", function () {
            it('should get one premium app', function () {
                spyOn(component, "getTpaChildren").and.returnValue([{
                    id: "tpa1"
                }]);

                spyOn(component.data, "get").and.returnValue({applicationId: "18"});
                spyOn(component, "getType").and.returnValue('not-tpa-type');
                spyOn(clientSpecMapService, "isPremiumApp").and.returnValue(true);

                expect(tpa.getPremiumTpaChildren(mockPs, [{id: '1'}, {'id': '2'}]).length).toEqual(1);
            });

            it('should get two premium apps which the container itself is one of them', function () {
                spyOn(component, "getTpaChildren").and.returnValue([
                    {
                        id: "tpa1"
                    },
                    {
                        id: "tpa2"
                    }
                ]);

                // Simulate return of different values (just to have 2 different apps)
                spyOn(component.data, "get").and.callFake(function (ps, tpaCompData) {
                    if (tpaCompData.id === "tpa1") {
                        return {applicationId: "18"};
                    }

                    return {applicationId: "19"};
                });
                spyOn(clientSpecMapService, "isPremiumApp").and.returnValue(true);
                spyOn(component, "getType").and.returnValue(tpa.constants.COMP_TYPES.TPA_WIDGET);
                spyOn(clientSpecMapService, "getAppData").and.callFake(function (ps, appId) {
                    if (appId === "18") {
                        return {applicationId: "18"};
                    }

                    return {applicationId: "19"};
                });

                expect(tpa.getPremiumTpaChildren(mockPs, {}).length).toEqual(2);
            });

            it('should get no premium apps', function () {
                spyOn(component, "getTpaChildren").and.returnValue([{
                    id: "tpa1"
                }]);

                spyOn(component.data, "get").and.returnValue({applicationId: "18"});
                spyOn(clientSpecMapService, "isPremiumApp").and.returnValue(false);
                spyOn(component, "getType").and.returnValue('not-tpa-type');

                expect(tpa.getPremiumTpaChildren(mockPs, {}).length).toEqual(0);
            });
        });

        describe("calling getTpaPointersRecursive", function () {
            describe('with a container pointer', function(){

                it('should return the tpa children inside the container', function () {
                    spyOn(component, "getType").and.returnValue('not-tpa-type');
                    spyOn(component, "getTpaChildren").and.returnValue([{
                        id: "tpa1"
                    }]);

                    expect(tpa.getTpaPointersRecursive(mockPs, {id: 'tpaContainer'}).length).toEqual(1);
                });
            });

            describe('with component pointers', function(){
                it('for widget and container with tpas should return the tpa widget tpa children inside the container', function () {
                    spyOn(component, "getType").and.callFake(function(ps, comp){
                        return comp.id === 'tpaContainer' ? 'not-tpa-type' : tpa.constants.COMP_TYPES.TPA_WIDGET;
                    });
                    spyOn(component, "getTpaChildren").and.callFake(function(ps, comp){
                        return comp.id === 'tpaContainer' ? [{id: "tpa1"}] : [];
                    });

                    expect(tpa.getTpaPointersRecursive(mockPs, [{id: 'tpaContainer'}, {id: 'tpaWidget'}]).length).toEqual(2);
                });

                it('for widget and container with no tpas should return the tpa widget', function () {
                    spyOn(component, "getType").and.returnValue(tpa.constants.COMP_TYPES.TPA_WIDGET);
                    spyOn(component, "getTpaChildren").and.returnValue([]);

                    expect(tpa.getTpaPointersRecursive(mockPs, [{id: 'tpa1'}, {id: 'tpa2'}]).length).toEqual(2);
                });

                it('for 2 widgets should return 2 tpas', function () {
                    spyOn(component, "getType").and.callFake(function(ps, comp){
                        return comp.id === 'tpaWidget' ? tpa.constants.COMP_TYPES.TPA_WIDGET : 'not-tpa-type';
                    });
                    spyOn(component, "getTpaChildren").and.returnValue([]);

                    expect(tpa.getTpaPointersRecursive(mockPs, [{id: 'Container'}, {id: 'tpaWidget'}]).length).toEqual(1);
                });

                it('for comp and container with no tpas should return empty array', function () {
                    spyOn(component, "getType").and.returnValue('not-tpa-type');
                    spyOn(component, "getTpaChildren").and.returnValue([]);

                    expect(tpa.getTpaPointersRecursive(mockPs, [{id: 'Container'}, {id: 'comp1'}]).length).toEqual(0);
                });
            });

        });

        describe('addMultiSection', function () {
            var provisionAppDemoAfterSaveMock;
            var getAppDataMock;
            beforeEach(function () {
                provisionAppDemoAfterSaveMock = spyOn(provisionService, 'provisionAppDemoAfterSave');
                getAppDataMock = spyOn(clientSpecMapService, 'getAppData');

            });
            it('should create a multi section when main section in installed and section can be created', function () {
                var options = {
                    pageId: 'tpaPageId',
                    title: 'title'
                };

                spyOn(tpaSectionService, 'addMultiSection');
                spyOn(tpaSectionService, 'alreadyInstalled').and.returnValue(true);
                spyOn(clientSpecMapService, 'getWidgetDataFromTPAPageId').and.returnValue({
                    widgetId: 'widgetId'
                });

                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue({
                    applicationId: 'applicationId',
                    widgets: {
                        widgetId: {
                            appPage: {
                                multiInstanceEnabled: true
                            }
                        }
                    }
                });

                var pageData = tpa.section.addMultiSection.dataManipulation(mockPs, {
                    page: 'pageId'
                }, "appDefinitionId", options);


                expect(pageData).toContain({
                    page: 'pageId'
                });

                options.sectionId = pageData.id;

                expect(pageData.sectionId).toBeDefined();

                expect(tpaSectionService.addMultiSection).toHaveBeenCalledWith(mockPs, pageData, options, jasmine.any(Function));
            });

            it('should report error if main section is not installed', function () {
                var options = {
                    pageId: 'tpaPageId',
                    title: 'title'
                };

                spyOn(tpaSectionService, 'addMultiSection');
                spyOn(tpaSectionService, 'alreadyInstalled').and.returnValue(false);

                tpa.section.addMultiSection.dataManipulation(mockPs, {
                    page: 'pageId'
                }, "appDefinitionId", options);


                var error = 'Main section is not installed';
                expect(mockPs.setOperationsQueue.asyncSetOperationComplete).toHaveBeenCalledWith(new Error(error));
                expect(tpaSectionService.addMultiSection).not.toHaveBeenCalled();
            });

            it('should report error if section can not be created', function () {
                var options = {
                    pageId: 'tpaPageId',
                    title: 'title'
                };

                spyOn(tpaSectionService, 'addMultiSection');
                spyOn(tpaSectionService, 'alreadyInstalled').and.returnValue(true);
                spyOn(clientSpecMapService, 'getWidgetDataFromTPAPageId').and.returnValue({
                    widgetId: 'widgetId'
                });

                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue({
                    applicationId: 'applicationId',
                    widgets: {
                        widgetId: {
                            appPage: {
                                multiInstanceEnabled: false
                            }
                        }
                    }
                });

                tpa.section.addMultiSection.dataManipulation(mockPs, {
                    page: 'pageId'
                }, "appDefinitionId", options);


                var error = 'Creating this section is not allowed';
                expect(mockPs.setOperationsQueue.asyncSetOperationComplete).toHaveBeenCalledWith(new Error(error));
                expect(tpaSectionService.addMultiSection).not.toHaveBeenCalled();
            });

            it('should report error if given page id does not exists', function () {
                var options = {
                    pageId: 'pageId',
                    title: 'title'
                };

                spyOn(tpaSectionService, 'addMultiSection');
                spyOn(tpaSectionService, 'alreadyInstalled').and.returnValue(true);
                spyOn(clientSpecMapService, 'getWidgetDataFromTPAPageId').and.returnValue(undefined);

                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue({
                    applicationId: 'applicationId',
                    widgets: {
                        widgetId: {
                            appPage: {
                                multiInstanceEnabled: false
                            }
                        }
                    }
                });

                tpa.section.addMultiSection.dataManipulation(mockPs, {
                    page: 'pageId'
                }, "appDefinitionId", options);


                var error = 'Creating this section is not allowed';
                expect(mockPs.setOperationsQueue.asyncSetOperationComplete).toHaveBeenCalledWith(new Error(error));
                expect(tpaSectionService.addMultiSection).not.toHaveBeenCalled();
            });

            // TODO: POPUPS make it work
            xit('should provision the app if its in demo mode', function () {
                var options = {
                    pageId: 'tpaPageId',
                    title: 'title'
                };

                spyOn(tpaSectionService, 'addMultiSection');
                spyOn(tpaSectionService, 'alreadyInstalled').and.returnValue(true);
                spyOn(siteMetadata.generalInfo, "isFirstSave").and.returnValue(false);
                spyOn(clientSpecMapService, 'getWidgetDataFromTPAPageId').and.returnValue({
                    widgetId: 'widgetId'
                });

                spyOn(clientSpecMapService, 'getAppDataByAppDefinitionId').and.returnValue({
                    applicationId: 'applicationId',
                    appDefinitionId: 'appDefinitionId',
                    demoMode: true,
                    widgets: {
                        widgetId: {
                            appPage: {
                                multiInstanceEnabled: true
                            }
                        }
                    }
                });

                getAppDataMock.and.returnValue({
                    appDefinitionId: 'appDefinitionId'
                });

                provisionAppDemoAfterSaveMock.and.callFake(function (ps, appDefinitionId, cb) {
                    cb();
                });

                var pageData = tpa.section.addMultiSection.dataManipulation(mockPs, {
                    page: 'pageId',
                    dataQuery: '#pageId'
                }, 'appDefinitionId', options);

                options.sectionId = pageData.id;

                expect(pageData).toContain({
                    page: 'pageId'
                });

                expect(provisionService.provisionAppDemoAfterSave).toHaveBeenCalledWith(jasmine.any(Object), 'appDefinitionId', jasmine.any(Function), jasmine.any(Function));
                expect(pageData.sectionId).toBeDefined();
                expect(tpaSectionService.addMultiSection).toHaveBeenCalledWith(mockPs, pageData, options, jasmine.any(Function));
            });
        });

        describe('provisionAppDemoSave', function() {
            describe('new app flow experiment is open', function () {
                it('should call preSaveAddApp', function () {
                    var onError = jasmine.createSpy('onError');
                    var callback = jasmine.createSpy('callback');



                    spyOn(appStoreService, 'preSaveAddApp');
                    spyOn(clientSpecMapService, 'getAppData').and.returnValue({
                        appDefinitionId: 'appDefId'
                    });

                    tpa.provision.provisionAppDemoSave.dataManipulation(mockPs, 'applicationId', callback, onError);
                    expect(appStoreService.preSaveAddApp).toHaveBeenCalledWith(mockPs, 'appDefId', jasmine.any(Function), jasmine.any(Function));
                });
            });
        });

        describe('getSections', function() {
            var compWidget = {type : tpaConstants.DATA_TYPE.TPA_WIDGET};
            var compSection = {type : tpaConstants.DATA_TYPE.TPA_SECTION};
            var compMultiSection = {type : tpaConstants.DATA_TYPE.TPA_MULTI_SECTION};

            it('should return no section if there are no comps', function() {
                spyOn(installedTpaAppsOnSiteService, 'getAllAppCompsByAppId').and.returnValue([]);
                expect(tpa.app.getSections(mockPs, '15')).toEqual([]);
            });

            it('should return no section if comp type is widget', function() {
                spyOn(installedTpaAppsOnSiteService, 'getAllAppCompsByAppId').and.returnValue([compWidget]);
                expect(tpa.app.getSections(mockPs, '15')).toEqual([]);
            });

            it('should return one section if comp type is TPA_SECTION', function() {
                spyOn(installedTpaAppsOnSiteService, 'getAllAppCompsByAppId').and.returnValue([compWidget, compSection]);
                expect(tpa.app.getSections(mockPs, '15')).toEqual([compSection]);
            });

            it('should return one section if comp type is TPA_MULTI_SECTION', function() {
                spyOn(installedTpaAppsOnSiteService, 'getAllAppCompsByAppId').and.returnValue([compWidget, compMultiSection]);
                expect(tpa.app.getSections(mockPs, '15')).toEqual([compMultiSection]);
            });

            it('should return few sections', function() {
                spyOn(installedTpaAppsOnSiteService, 'getAllAppCompsByAppId').and.returnValue([compSection, compWidget, compMultiSection]);
                expect(tpa.app.getSections(mockPs, '15')).toEqual([compSection, compMultiSection]);
            });
        });

        describe('resizeComponent', function () {
            it('should not allow to resize when the component is stretched', function () {
                var callback = jasmine.createSpy('callback');
                var width = 100;
                var height = 100;
                spyOn(structure, 'isHorizontallyStretchedToScreen').and.returnValue(true);
                tpa.comp.resize(mockPs, {
                    compId: '1'
                }, width, height, callback);
                expect(callback).toHaveBeenCalledWith({
                    onError: 'component is already set to full width'
                });
            });

            it('should update comp layout', function () {
                var callback = jasmine.createSpy('callback');
                var width = 100;
                var height = 100;
                spyOn(structure, 'isHorizontallyStretchedToScreen').and.returnValue(false);
                spyOn(component.layout, 'get').and.returnValue({
                    width: width,
                    height: height});
                spyOn(structure, 'updateCompLayout');
                tpa.comp.resize(mockPs, {
                    compId: '1'
                }, width, height, callback);
                expect(structure.updateCompLayout).toHaveBeenCalledWith(mockPs, {
                    compId: '1'
                }, {
                    width: width,
                    height: height}
                );
                expect(callback).toHaveBeenCalledWith({
                    width: width,
                    height: height
                });
            });

            it('should update comp layout for just one attr.', function () {
                var callback = jasmine.createSpy('callback');
                var height = 100;
                spyOn(structure, 'isHorizontallyStretchedToScreen').and.returnValue(false);
                spyOn(component.layout, 'get').and.returnValue({
                    width: 100,
                    height: height});
                spyOn(structure, 'updateCompLayout');
                tpa.comp.resize(mockPs, {
                    compId: '1'
                }, undefined, height, callback);
                expect(structure.updateCompLayout).toHaveBeenCalledWith(mockPs, {
                    compId: '1'
                }, {
                    width: 100,
                    height: height
                });
                expect(callback).toHaveBeenCalledWith({
                    width: 100,
                    height: height
                });
            });
        });
    });
});
