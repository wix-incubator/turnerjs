define(['lodash',
    'documentServices/page/page',
    'documentServices/page/pageData',
    'documentServices/component/component',
    'documentServices/structure/structure',
    'documentServices/tpa/services/installedTpaAppsOnSiteService',
    'documentServices/tpa/services/tpaWidgetService',
    'documentServices/tpa/compStructure',
    'documentServices/tpa/constants',
    'documentServices/tpa/services/tpaWidgetLayoutService',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/tpa/services/appInstallationAndDeletionEvents'
    ], function(_, page, pageData, component, structure, installedTpaAppsOnSiteService, tpaWidgetService, compStructure, tpaConstants, tpaWidgetLayoutHelper, clientSpecMapService, privateServicesHelper, appInstallationAndDeletionEvents) {

    'use strict';

    describe('tpa Widget Service', function() {
        var mockPs;
        var siteData;
        beforeEach(function(){
            siteData = privateServicesHelper.getSiteDataWithPages({'page1': {}, 'page2': {}});
            siteData.setCurrentPage('page1');
            mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            spyOn(installedTpaAppsOnSiteService, 'isApplicationIdExists').and.returnValue(true);
            spyOn(structure, 'setContainer');
            spyOn(structure, 'setDock');


            this.addCompSpy = spyOn(component, "add");
        });


        describe("addWidgetAfterProvision - getDefaultWidgetId", function() {
            beforeEach(function(){
                spyOn(compStructure, "getWidgetStructure");
            });

            var params = {};
            it("should return null if there is no app data for the app", function() {
                expect(function () {
                    var componentToAddPointer = component.getComponentToAddRef(mockPs, params, {});
                    tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, {}, function () {});
                }).toThrowError("invalid params");
            });

            it("should return empty string if there are no widgets", function() {
                var appData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234"

                };
                expect(function () {
                    var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                    tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {});
                }).toThrowError("invalid params");
            });

            it("should return null if widgets is empty", function() {
                var appData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {}
                };
                expect(function () {
                    var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                    tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {});
                }).toThrowError("invalid params");
            });

            it('should return widget id if there is only one', function(done) {
                var appData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222"
                        }
                    }
                };
                var layout = {
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                };

                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue(layout);
                var componentToAddPointer = component.getComponentToAddRef(mockPs, {}, appData);

                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, {}, appData, function () {
                    expect(compStructure.getWidgetStructure).toHaveBeenCalledWith(appData.applicationId, appData.widgets["222"].widgetId, layout, undefined);
                    done();
                });
            });

            it('should return the first widget id if there are few', function(done) {
                var appData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222"
                        },
                        333: {
                            widgetId: "333"
                        }
                    }
                };
                var layout = {
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                };

                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue(layout);
                var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {
                    expect(compStructure.getWidgetStructure).toHaveBeenCalledWith(appData.applicationId, appData.widgets["222"].widgetId, layout, undefined);
                    done();
                });
            });

            it("should return the first widget that is not section", function(done) {
                var appData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: "eee"
                        },
                        333: {
                            widgetId: "333"
                        }
                    }
                };

                var layout = {
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                };
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue(layout);

                var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {
                    expect(compStructure.getWidgetStructure).toHaveBeenCalledWith(appData.applicationId, appData.widgets["333"].widgetId, layout, undefined);
                    done();
                });
            });

            it("should return null if all widgets are section", function() {
                var appData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: "rrrr"
                        },
                        333: {
                            widgetId: "333",
                            appPage: "ffff"
                        }
                    }
                };
                expect(function () {
                    var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                    tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {});
                }).toThrowError("invalid params");
            });
        });

        describe("addWidgetAfterProvision - page id is not given as parameter", function() {
            var layout = {width: 100, height: 200, x: 10, y: 15};
            var params = {widgetId : "222", layout: layout};

            var appData = {
                appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                appDefinitionName: "LiveChat",
                applicationId: 18,
                instance: "1234",
                widgets: {
                    222: {
                        widgetId: "222"
                    }
                }
            };
            var addedComp;

            beforeEach( function() {
                this.addCompSpy.and.callFake(function(ps, compPointer, containerPointer){
                    addedComp = {
                        pageId: containerPointer.id,
                        id: compPointer.id
                    };
                });
            });

            it("should add widget to current page if no page id is given", function(done) {
                layout = {
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                };
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue(layout);

                var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {
                    expect(addedComp.pageId).toBe('page1');
                    done();
                });
            });

            it("should fail to add widget if no page id is given and page.getCurrentPageId is failing", function() {
                siteData.setCurrentPage(null);

                expect(function () {
                    var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                    tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {});
                }).toThrowError("invalid params");
            });
        });

        describe("addWidgetAfterProvision", function() {
            var appData = {
                appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                appDefinitionName: "LiveChat",
                applicationId: 18,
                instance: "1234",
                widgets: {
                    222: {
                        widgetId: "222",
                        appPage: "rrrr"
                    },
                    333: {
                        widgetId: "333",
                        appPage: "ffff"
                    },
                    666: {
                        widgetId: "666",
                        gluedOptions: {
                            horizontalMargin: -0.85,
                            placement: "TOP_CENTER",
                            verticalMargin: 0
                        }
                    }
                }
            };
            var addedComp;

            var getTpaWidgetDefinition = function(applicationId, widgetId, layout) {
                return {
                    "layout": {
                        "anchors": [],
                        "height": layout && layout.height || 200,
                        "width": layout && layout.width || 300,
                        "x": layout && layout.x || 300,
                        "y": layout && layout.y || 200
                    },
                    data: {
                        widgetId: widgetId,
                        applicationId: applicationId.toString(),
                        type: tpaConstants.TYPE.TPA_WIDGET,
                        metaData: {
                            isHidden: false,
                            isPreset: true,
                            schemaVersion: "1.0"
                        }
                    },
                    "type": "Component",
                    "skin": tpaConstants.SKINS.TPA_WIDGET,
                    "componentType": tpaConstants.COMP_TYPES.TPA_WIDGET,
                    "style": 'tpaw0'
                };
            };

            var getTpaGluedWidgetDefinition = function(applicationId, widgetData, layout) {
                return {
                    "layout": {
                        "width": layout && layout.width || 300,
                        "height": layout && layout.height || 200,
                        "x": layout && layout.x || 300,
                        "y": layout && layout.y || 120,
                        "anchors": [],
                        "fixedPosition": true
                    },
                    "data": {
                        widgetId: widgetData.widgetId,
                        applicationId: applicationId.toString(),
                        type: tpaConstants.TYPE.TPA_WIDGET,
                        metaData: {
                            isHidden: false,
                            isPreset: true,
                            schemaVersion: "1.0"
                        }
                    },
                    "type": "Component",
                    "skin": tpaConstants.SKINS.TPA_WIDGET,
                    "componentType": tpaConstants.COMP_TYPES.TPA_GLUED_WIDGET,
                    "style": 'tpagw0',
                    "props":  {
                        placement: widgetData.gluedOptions.placement,
                        verticalMargin: widgetData.gluedOptions.verticalMargin,
                        horizontalMargin: widgetData.gluedOptions.horizontalMargin,
                        type: "TPAGluedProperties",
                        metaData: {
                            schemaVersion: "1.0"
                        }
                    }
                };
            };

            beforeEach( function() {
                this.addCompSpy.and.callFake(function(ps, compPointer, containerPointer, compDef){
                    var pageId = ps.pointers.components.isPage(containerPointer) ? containerPointer.id :
                        ps.pointers.components.getPageOfComponent(containerPointer).id;

                    addedComp = {
                        id: compPointer.id,
                        def: compDef,
                        pageId: pageId,
                        containerPointer: containerPointer
                    };
                });

            });

            it("should return with an error when widget data does not exist", function() {
                var params = {
                    pageId: "page1",
                    widgetId: "444",
                    layout: {}
                };

                expect(function () {
                    var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                    tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {});
                }).toThrowError("invalid params");
            });

            it("should add glued widget", function (done) {
                var params = {
                    pageId: "masterPage",
                    widgetId: "666",
                    layout: {}
                };


                var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {
                    var compStructureGlued = getTpaGluedWidgetDefinition(appData.applicationId, appData.widgets[params.widgetId], params.layout);
                    expect(addedComp.def).toEqual(compStructureGlued);
                    expect(addedComp.pageId).toBe('masterPage');
                    done();
                });
            });

            it("should return an error when add component to container fails", function () {
                this.addCompSpy.and.throwError("component.addComponentToContainer error");
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom');

                var params = {
                    pageId: "page1",
                    widgetId: "222",
                    layout: {}
                };


                expect(function () {
                    var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                    tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {});
                }).toThrowError("component.addComponentToContainer error");
            });

            it("should not call onError if it is not given as parameter and add component to container fails", function () {
                this.addCompSpy.and.throwError("component.addComponentToContainer error");
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom');

                var params = {
                    pageId: "page1",
                    widgetId: "222",
                    layout: {}
                };

                expect(function () {
                    var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                    tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {});
                }).toThrowError("component.addComponentToContainer error");
            });

            it("should add the widget with the default layout if no layout is given as parameter", function(done) {
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                });

                var params = {
                    pageId: "page1",
                    widgetId: "222",
                    layout: null
                };

                var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {
                    var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);
                    expect(addedComp.def).toEqual(compStructureWidget);
                    expect(addedComp.pageId).toBe('page1');
                    done();
                });
            });

            it("should add the widget with the default layout if layout is empty", function(done) {
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                });

                var params = {
                    pageId: "page1",
                    widgetId: "222",
                    layout: {}
                };

                var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {
                    var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);
                    expect(addedComp.def).toEqual(compStructureWidget);
                    expect(addedComp.pageId).toBe('page1');
                    done();
                });
            });

            it("should add the widget with the layout defined", function(done) {
                var layout = {width: 200, height: 300, x: 50, y: 20, defaultPosition: 'TOP_CENTER'};
                var params = {
                    pageId: "page1",
                    widgetId: "222",
                    layout: layout
                };
                var clonedAppData = _.cloneDeep(appData);
                clonedAppData.widgets['222'].defaultHeight = 50;
                clonedAppData.widgets['222'].defaultWidth = 50;
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.callThrough();


                var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, clonedAppData, function () {
                    var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);
                    expect(tpaWidgetLayoutHelper.getCompLayoutFrom).toHaveBeenCalledWith(mockPs, {
                        width: 50,
                        height: 50,
                        defaultPosition: layout.defaultPosition
                    }, layout);
                    expect(addedComp.def).toEqual(compStructureWidget);
                    expect(addedComp.pageId).toBe('page1');
                    delete addedComp.def.layout.anchors;
                    expect(addedComp.def.layout).toEqual({width: 200, height: 300, x: 50, y: 20});
                    done();
                });
            });

            it("should add the widget with the layout defined and not call onSuccess if not given as parameter", function(done) {
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                    "width": 300,
                    "height": 200,
                    "x": 50,
                    "y": 20,
                    "anchors": []
                });

                var layout = {width: 300, height: 200, x: 50, y: 20};
                var params = {
                    pageId: "page1",
                    widgetId: "222",
                    layout: layout
                };

                var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {
                    var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);
                    expect(addedComp.def).toEqual(compStructureWidget);
                    expect(addedComp.pageId).toBe('page1');

                    done();
                });
            });

            it("should add the widget and invoke app callbacks if app is installed in the first time", function(done) {
                installedTpaAppsOnSiteService.isApplicationIdExists.and.returnValue(false);
                spyOn(appInstallationAndDeletionEvents, 'invokeAddAppCallbacks');
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                    "width": 300,
                    "height": 200,
                    "x": 50,
                    "y": 20,
                    "anchors": []
                });

                var layout = {width: 300, height: 200, x: 50, y: 20};
                var params = {
                    pageId: "page1",
                    widgetId: "222",
                    layout: layout
                };

                var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {
                    var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);
                    expect(addedComp.def).toEqual(compStructureWidget);
                    expect(addedComp.pageId).toBe('page1');
                    expect(appInstallationAndDeletionEvents.invokeAddAppCallbacks).toHaveBeenCalled();
                    done();
                });
            });

            it("should set the comp container if options showOnAllPages is truthy", function(done) {
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                });

                var params = {
                    widgetId: "222",
                    showOnAllPages: true
                };

                var componentToAddRef = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, params, appData, function () {
                    var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);

                    expect(addedComp.def).toEqual(compStructureWidget);
                    expect(structure.setContainer).toHaveBeenCalled();
                    done();
                });
            });

            it("should set the comp container if widgetData has default header position", function(done) {
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                });

                var params = {
                    widgetId: "222"
                };

                var _appData = _.cloneDeep(appData);
                _appData.widgets['222'].defaultPosition = {
                    region: 'header'
                };

                var componentToAddRef = component.getComponentToAddRef(mockPs, params, _appData);

                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, params, _appData, function () {
                    var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);



                    expect(addedComp.def).toEqual(compStructureWidget);
                    expect(structure.setContainer).toHaveBeenCalled();
                    done();
                });
            });

            it("should set the comp container if widget is glued", function(done) {
                var params = {
                    widgetId: "666",
                    layout: {}
                };

                var _appData = _.clone(appData);
                _appData.gluedOptions = {};


                var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {
                    var compStructureGlued = getTpaGluedWidgetDefinition(appData.applicationId, appData.widgets[params.widgetId], params.layout);
                    expect(addedComp.def).toEqual(compStructureGlued);
                    done();
                });
            });

            it("should add the widget to the current pages if options showOnAllPages is false", function(done) {
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                });

                var params = {
                    widgetId: "222",
                    showOnAllPages: false,
                    pageId: "page1"
                };

                var componentToAddRef = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, params, appData, function () {
                    var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);

                    expect(addedComp.def).toEqual(compStructureWidget);
                    expect(addedComp.pageId).toBe('page1');
                    done();
                });
            });

            it("should add the widget to the given page if options pageId is defined", function(done) {
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                });

                var pagePointer = mockPs.pointers.components.getPage('page2', 'DESKTOP');
                var params = {
                    widgetId: "222",
                    showOnAllPages: false,
                    pageId: "page2"
                };

                var componentToAddRef = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, params, appData, function () {

                    var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);

                    expect(addedComp.def).toEqual(compStructureWidget);
                    expect(addedComp.pageId).toBe('page2');
                    expect(addedComp.containerPointer).toEqual(pagePointer);
                    done();
                });
            });

            it("should add the widget to the given parentContainer if options parentContainer is defined", function(done){
                var pagePointer = mockPs.pointers.components.getPage('page2', 'DESKTOP');
                mockPs.dal.addDesktopComps([{id: 'someContainer'}], pagePointer);
                var containerPointer = mockPs.pointers.components.getComponent('someContainer', pagePointer);

                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                });

                var params = {
                    widgetId: "222",
                    showOnAllPages: false,
                    pageId: "page2",
                    parentContainerRef: containerPointer
                };

                var componentToAddRef = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, params, appData, function () {

                    var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);

                    expect(addedComp.def).toEqual(compStructureWidget);
                    expect(addedComp.pageId).toBe('page2');
                    expect(addedComp.containerPointer).toEqual(containerPointer);
                    done();
                });
            });

            it('should add the widget to the page if the given parentContainer is not in the calculated page', function(done){
                var pagePointer = mockPs.pointers.components.getPage('page1', 'DESKTOP');
                mockPs.dal.addDesktopComps([{id: 'someContainer'}], pagePointer);
                var containerPointer = mockPs.pointers.components.getComponent('someContainer', pagePointer);

                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                });

                var params = {
                    widgetId: "222",
                    showOnAllPages: false,
                    pageId: "page2",
                    parentContainerRef: containerPointer
                };

                var componentToAddRef = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, params, appData, function () {

                    var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);

                    expect(addedComp.def).toEqual(compStructureWidget);
                    expect(addedComp.pageId).toBe('page2');
                    expect(addedComp.containerPointer.id).toEqual('page2');
                    done();
                });
            });

            describe('docking', function () {
                var params = {widgetId: "222"};

                beforeEach(function () {
                    spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                        "width": 300,
                        "height": 200,
                        "x": 300,
                        "y": 200,
                        "anchors": []
                    });
                });

                it("should set the comp dock if widgetData has shouldBeStretchedByDefault", function (done) {
                    var _appData = _.cloneDeep(appData);
                    _appData.widgets['222'].canBeStretched = true;
                    _appData.widgets['222'].shouldBeStretchedByDefault = true;

                    var componentToAddRef = component.getComponentToAddRef(mockPs, params, _appData);

                    tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, params, _appData, function () {
                        var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);

                        expect(addedComp.def).toEqual(compStructureWidget);
                        expect(structure.setDock).toHaveBeenCalled();
                        done();
                    });
                });

                it("should not set the comp dock if widgetData has shouldBeStretchedByDefault but does not have canBeStretched", function (done) {
                    var _appData = _.cloneDeep(appData);
                    _appData.widgets['222'].shouldBeStretchedByDefault = true;

                    var componentToAddRef = component.getComponentToAddRef(mockPs, params, _appData);

                    tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, params, _appData, function () {
                        expect(structure.setDock).not.toHaveBeenCalled();
                        done();
                    });
                });

                it("should not set the comp dock if dontStretch is passed", function (done) {
                    params.dontStretch = true;

                    var _appData = _.cloneDeep(appData);
                    _appData.widgets['222'].canBeStretched = true;
                    _appData.widgets['222'].shouldBeStretchedByDefault = true;

                    var componentToAddRef = component.getComponentToAddRef(mockPs, params, _appData);

                    tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, params, _appData, function () {
                        expect(structure.setDock).not.toHaveBeenCalled();
                        done();
                    });
                });
            });

            it("should add the widget with custom style if styleId is passed", function(done) {
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                });
                var params = {
                    pageId: "page1",
                    widgetId: "222",
                    layout: null,
                    styleId: 'style1'
                };

                var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {
                    var compStructureWidget = getTpaWidgetDefinition(appData.applicationId, params.widgetId, params.layout);
                    compStructureWidget.style = 'style1';
                    expect(addedComp.def).toEqual(compStructureWidget);
                    done();
                });
            });

            it("should add glued widget with custom style if styleId is passed", function (done) {
                var params = {
                    pageId: "masterPage",
                    widgetId: "666",
                    layout: {},
                    styleId: 'style1'
                };

                var componentToAddPointer = component.getComponentToAddRef(mockPs, params, appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, params, appData, function () {
                    var compStructureGlued = getTpaGluedWidgetDefinition(appData.applicationId, appData.widgets[params.widgetId], params.layout);
                    compStructureGlued.style = 'style1';
                    expect(addedComp.def).toEqual(compStructureGlued);
                    done();
                });
            });
        });

        describe("duplicateWidget", function() {
            var pointer = {id: 'comp'};
            var duplicatedComp;

            beforeEach(function() {
                spyOn(component, "duplicate").and.callFake(function(ps, newCompPointer, oldCompPointer, containerPointer){
                    duplicatedComp = {
                        pageId: containerPointer.id,
                        oldCompId: oldCompPointer.id
                    };
                });
            });

            it("should call onError callback and not duplicate if no page ref exist", function() {
                expect(function () {
                    tpaWidgetService.duplicateWidget(mockPs, pointer, "page3");
                }).toThrowError("no such component");
            });

            it("should duplicate and return success", function() {
                tpaWidgetService.duplicateWidget(mockPs, pointer, "page1");
                expect(duplicatedComp.pageId).toBe('page1');
                expect(duplicatedComp.oldCompId).toBe('comp');
            });


        });

        describe("isGlued", function() {
            it("should return false if no gluedOptions exist on widgetData", function() {
                var isGlued = tpaWidgetService.isGlued({});
                expect(isGlued).toBeFalsy();
            });

            it("should return false if gluedOptions exist on widgetData and is null", function() {
                var isGlued = tpaWidgetService.isGlued({'gluedOptions': null});
                expect(isGlued).toBeFalsy();
            });

            it("should return true if gluedOptions exist on widgetData and is undefined", function() {
                var isGlued = tpaWidgetService.isGlued({'gluedOptions': undefined});
                expect(isGlued).toBeTruthy();
            });

            it("should return true if gluedOptions exist on widgetData and is defined", function() {
                var isGlued = tpaWidgetService.isGlued({'gluedOptions': 'someOptions'});
                expect(isGlued).toBeTruthy();
            });
        });

        describe('trying to add a widget for the first time which has sections', function () {

            beforeEach(function () {
                spyOn(clientSpecMapService, 'hasSections').and.returnValue(true);
                spyOn(tpaWidgetLayoutHelper, 'getCompLayoutFrom').and.returnValue({
                    "width": 300,
                    "height": 200,
                    "x": 300,
                    "y": 200,
                    "anchors": []
                });
                spyOn(page, "add");
                spyOn(pageData, 'getPageDataWithoutIds').and.returnValue({
                    pageBackgrounds: 'background'
                });
                installedTpaAppsOnSiteService.isApplicationIdExists.and.returnValue(false);
                this.appData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: {
                                defaultPage: "",
                                hidden: false,
                                id: "testpage",
                                indexable: true,
                                multiInstanceEnabled: false,
                                name: "testPage",
                                order: 1
                            },
                            published: true
                        }
                    }
                };
                this.params = {
                    widgetId: "222",
                    showOnAllPages: false,
                    pageId: "page2"
                };
            });

            it('should call the onError cb if a main section exists', function (done) {
                var componentToAddRef = component.getComponentToAddRef(mockPs, this.params, this.appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, this.params, this.appData, _.noop, function () {
                    expect(true).toBeTruthy();
                    done();
                });
            });

            it('should add the widget and a new page with the hidden section', function(done) {
                this.appData.widgets[222].appPage.hidden = true;

                var componentToAddRef = component.getComponentToAddRef(mockPs, this.params, this.appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, this.params, this.appData, function () {
                    expect(page.add.calls.count()).toEqual(1);
                    expect(component.add.calls.count()).toEqual(2);
                    done();
                }, function() {});
            });

            it('should not a add a new page with section if no hidden sections exist', function (done) {
                delete this.appData.widgets[222].appPage;

                var componentToAddRef = component.getComponentToAddRef(mockPs, this.params, this.appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, this.params, this.appData, function () {
                    expect(page.add).not.toHaveBeenCalled();
                    expect(component.add.calls.count()).toEqual(1);
                    done();
                }, function() {});
            });

            it('should not add hidden sections if this is not the first install', function (done) {
                installedTpaAppsOnSiteService.isApplicationIdExists.and.returnValue(true);

                var componentToAddRef = component.getComponentToAddRef(mockPs, this.params, this.appData);
                tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddRef, this.params, this.appData, function () {
                    expect(page.add).not.toHaveBeenCalled();
                    expect(component.add.calls.count()).toEqual(1);
                    done();
                }, function () {
                });
            });
        });

        it('should add widget with predefined componentDefinition', function(done) {
            var compParams = {
                componentDefinition: {
                    id: "1233",
                    layout: {}
                },
                widgetId: "222",
                showOnAllPages: false
            };

            var appData = {
                appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                appDefinitionName: "LiveChat",
                applicationId: 18,
                instance: "1234",
                widgets: {
                    222: {
                        widgetId: "222",
                        appPage: {
                            defaultPage: "",
                            hidden: false,
                            id: "testpage",
                            indexable: true,
                            multiInstanceEnabled: false,
                            name: "testPage",
                            order: 1
                        },
                        published: true
                    }
                }
            };

            var componentToAddPointer = component.getComponentToAddRef(mockPs, compParams, appData);
            tpaWidgetService.addWidgetAfterProvision(mockPs, componentToAddPointer, compParams, appData, function () {
                expect(component.add).toHaveBeenCalledWith(mockPs, componentToAddPointer, mockPs.pointers.components.getPage('page1', 'DESKTOP'), compParams.componentDefinition);
                done();
            });
        });

        describe('deleteWidget', function () {

            beforeEach(function () {
                spyOn(component, 'remove');
                spyOn(page, 'remove');
                this.appData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        1: {
                            widgetId: "1",
                            appPage: {
                                defaultPage: "",
                                hidden: true,
                                id: "testpage",
                                indexable: true,
                                multiInstanceEnabled: false,
                                name: "testPage",
                                order: 1
                            },
                            published: true
                        },
                        2: {
                            widgetId: "2",
                            published: true
                        }
                    }
                };
                this.params = {
                    widgetId: "2",
                    showOnAllPages: false,
                    pageId: "page2"
                };
                spyOn(clientSpecMapService, 'getAppData').and.returnValue(this.appData);
                spyOn(installedTpaAppsOnSiteService, "getHiddenSections").and.returnValue([
                    {
                        "id": "TPAMultiSection_in4iwqqo",
                        "type": "TPAMultiSection",
                        "applicationId": "18",
                        "metaData": {
                            "isPreset": false,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "widgetId": "1",
                        "referenceId": "",
                        "pageId": "gslta"
                    }
                ]);
            });

            it('should remove the widget but not hidden sections if a main section exists', function () {
                this.appData.widgets[3] = {
                    widgetId: "3",
                    appPage: {
                        hidden: false
                    },
                    published: true
                };

                var onComplete = function () {
                    expect(page.remove).not.toHaveBeenCalled();
                    expect(component.remove).toHaveBeenCalledWith(mockPs, componentToAddRef, onComplete);
                };
                var componentToAddRef = component.getComponentToAddRef(mockPs, this.params, this.appData);
                tpaWidgetService.deleteWidget(mockPs, componentToAddRef, this.appData.applicationId, onComplete);
            });

            it('should remove the widget but not hidden sections if another installed widget exists', function () {
                spyOn(installedTpaAppsOnSiteService, "getWidgetsByAppId").and.returnValue([
                    {"widgetId": "2"}, {"widgetId": "2"}
                ]);

                var onComplete = function () {
                    expect(page.remove).not.toHaveBeenCalled();
                    expect(component.remove).toHaveBeenCalledWith(mockPs, componentToAddRef, onComplete);
                };
                var componentToAddRef = component.getComponentToAddRef(mockPs, this.params, this.appData);
                tpaWidgetService.deleteWidget(mockPs, componentToAddRef, this.appData.applicationId, function () {
                });
            });

            it('should remove the widget and hidden sections if a main section doesn\'t exist and this it the last widget', function () {
                spyOn(installedTpaAppsOnSiteService, "getWidgetsByAppId").and.returnValue([
                    {"widgetId": "2"}
                ]);
                var onComplete = function () {
                    expect(page.remove).toHaveBeenCalledWith(mockPs, 'gslta', jasmine.any(Function));
                    expect(component.remove).toHaveBeenCalledWith(mockPs, componentToAddRef, onComplete);
                };
                var componentToAddRef = component.getComponentToAddRef(mockPs, this.params, this.appData);
                tpaWidgetService.deleteWidget(mockPs, componentToAddRef, this.appData.applicationId, onComplete);
            });
        });
    });
});
