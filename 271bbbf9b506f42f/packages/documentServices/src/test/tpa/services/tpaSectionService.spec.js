define(['lodash',
    'bluebird',
    'utils',
    'documentServices/page/page',
    'documentServices/page/pageData',
    'documentServices/component/component',
    'documentServices/dataModel/dataModel',
    'documentServices/tpa/services/installedTpaAppsOnSiteService',
    'documentServices/tpa/services/tpaSectionService',
    'documentServices/tpa/services/tpaWidgetService',
    'documentServices/tpa/services/clientSpecMapService',
    'documentServices/tpa/constants',
    'documentServices/tpa/compStructure',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/tpa/services/appInstallationAndDeletionEvents',
    'documentServices/constants/constants'], function(_, Promise, utils, page, pageData, component, dataModel, installedTpaAppsOnSiteService, tpaSectionService, tpaWidgetService, clientSpecMapService, tpaConstants, compStructure, privateServicesHelper, appInstallationAndDeletionEvents, constants){

    'use strict';

    describe("Document Services - tpa - tpa Section Service", function() {
        var mockPs;
        var sectionRef = 'somePointer';
        var pagePointer = {
            id: 'page-id',
            type: 'DESKTOP'
        };

        beforeEach(function() {
            var siteData = privateServicesHelper.getSiteDataWithPages({'currentPage': {}}, 'currentPage');
            siteData.setCurrentPage('currentPage');
            mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            spyOn(mockPs.pointers.components, 'getUnattached').and.returnValue(pagePointer);
            spyOn(utils.guidUtils, "getUniqueId").and.returnValue("TPASctn123");
            spyOn(page, "add");
            spyOn(component, "add");
        });

        describe('addSectionAfterProvision', function() {
            beforeEach(function () {
                spyOn(page, 'serializePage').and.returnValue({
                    data: {
                        pageBackgrounds: 'background'
                    }
                });
                spyOn(pageData, 'getPageDataWithoutIds').and.returnValue({
                    pageBackgrounds: 'background'
                });
                spyOn(installedTpaAppsOnSiteService, 'isApplicationIdExists').and.returnValue(true);
                this.isMainSectionInstalledSpy = spyOn(installedTpaAppsOnSiteService, "isMainSectionInstalled").and.returnValue(false);
                this.isAppPermissionsIsRevoked = spyOn(clientSpecMapService, "isAppPermissionsIsRevoked").and.returnValue(false);
            });

            it("should return page title of the widget app page if exists", function (done) {
                var mockAppData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: {
                                name: "rrrr"
                            }
                        },
                        333: {
                            widgetId: "333",
                            appPage: {
                                name: "app page title"
                            },
                            hidden: false
                        }
                    }
                };

                tpaSectionService.addSectionAfterProvision(mockPs, sectionRef, {}, mockAppData, function () {
                    expect(page.add).toHaveBeenCalledWith(mockPs, sectionRef, mockAppData.widgets["333"].appPage.name, jasmine.any(Object));
                    expect(component.add).toHaveBeenCalledWith(mockPs, pagePointer, sectionRef, jasmine.any(Object));
                    done();
                });
            });

            it("should return page title of the appDefinitonName if no widgets ", function (done) {
                var mockAppData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234"
                };

                tpaSectionService.addSectionAfterProvision(mockPs, sectionRef, {}, mockAppData, function () {
                    expect(page.add).toHaveBeenCalledWith(mockPs, sectionRef, mockAppData.appDefinitionName, jasmine.any(Object));
                    expect(component.add).toHaveBeenCalledWith(mockPs, pagePointer, sectionRef, jasmine.any(Object));
                    done();
                });
            });

            it("should return page title of the appDefinitonName if all widgets are of type widget or hidden page", function (done) {

                var mockAppData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: "rrrr",
                            hidden: true
                        },
                        333: {
                            widgetId: "333"
                        }
                    }
                };

                tpaSectionService.addSectionAfterProvision(mockPs, sectionRef, {}, mockAppData, function () {
                    expect(page.add).toHaveBeenCalledWith(mockPs, sectionRef, mockAppData.appDefinitionName, jasmine.any(Object));
                    expect(component.add).toHaveBeenCalledWith(mockPs, pagePointer, sectionRef, jasmine.any(Object));
                    done();
                });
            });

            it("should not call onSuccess if it not given as parameter the page", function (done) {

                var mockAppData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: "rrrr",
                            hidden: true
                        },
                        333: {
                            widgetId: "333"
                        }
                    }
                };


                tpaSectionService.addSectionAfterProvision(mockPs, sectionRef, {}, mockAppData, function () {
                    expect(page.add).toHaveBeenCalledWith(mockPs, sectionRef, mockAppData.appDefinitionName, jasmine.any(Object));
                    expect(component.add).toHaveBeenCalledWith(mockPs, pagePointer, sectionRef, jasmine.any(Object));
                    done();
                });
            });

            it("should add section to installed apps if navigate to was successful", function (done) {
                var mockAppData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: "rrrr",
                            hidden: true
                        },
                        333: {
                            widgetId: "333"
                        }
                    }
                };

                tpaSectionService.addSectionAfterProvision(mockPs, sectionRef, {
                    sectionId: 'TPASection_TPASctn123'
                }, mockAppData, function () {
                    expect(page.add).toHaveBeenCalledWith(mockPs, sectionRef, mockAppData.appDefinitionName, jasmine.any(Object));
                    expect(component.add).toHaveBeenCalledWith(mockPs, pagePointer, sectionRef, jasmine.any(Object));
                    done();
                });
            });

            it("should add section and invoke callbacks if the app is installed in the first time", function (done) {
                installedTpaAppsOnSiteService.isApplicationIdExists.and.returnValue(false);
                spyOn(appInstallationAndDeletionEvents, 'invokeAddAppCallbacks');
                var mockAppData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: "rrrr",
                            hidden: true
                        },
                        333: {
                            widgetId: "333"
                        }
                    }
                };

                tpaSectionService.addSectionAfterProvision(mockPs, sectionRef, {
                    sectionId: 'TPASection_TPASctn123'
                }, mockAppData, function () {
                    expect(page.add).toHaveBeenCalledWith(mockPs, sectionRef, mockAppData.appDefinitionName, jasmine.any(Object));
                    expect(appInstallationAndDeletionEvents.invokeAddAppCallbacks).toHaveBeenCalled();
                    expect(component.add).toHaveBeenCalledWith(mockPs, pagePointer, sectionRef, jasmine.any(Object));
                    done();
                });
            });

            it("should not add section if it is already installed, no widgetId given", function () {
                this.isMainSectionInstalledSpy.and.returnValue(true);

                var mockAppData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: "rrrr",
                            hidden: true
                        },
                        333: {
                            widgetId: "333"
                        }
                    }
                };

                var callbackMock = jasmine.createSpy();
                var error = 'section already installed';

                tpaSectionService.addSectionAfterProvision(mockPs, sectionRef, {
                    widgetId: null
                }, mockAppData, callbackMock);
                expect(callbackMock).toHaveBeenCalledWith(mockPs, new Error(error));
            });

            it("should not add section if it is already installed, widgetId given", function () {
                this.isMainSectionInstalledSpy.and.returnValue(true);

                var mockAppData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: "rrrr",
                            hidden: true
                        },
                        333: {
                            widgetId: "333"
                        }
                    }
                };

                var callbackMock = jasmine.createSpy();
                var error = 'section already installed';

                tpaSectionService.addSectionAfterProvision(mockPs, sectionRef, {
                    widgetId: '222'
                }, mockAppData, callbackMock);
                expect(callbackMock).toHaveBeenCalledWith(mockPs, new Error(error));
            });

            it("should add the page with the correct page structure", function (done) {
                var mockAppData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: {
                                name: "rrrr"
                            }
                        },
                        333: {
                            widgetId: "333",
                            appPage: {
                                name: "app page title"
                            },
                            hidden: false
                        }
                    }
                };

                tpaSectionService.addSectionAfterProvision(mockPs, sectionRef, {}, mockAppData, function () {
                    expect(page.add).toHaveBeenCalledWith(mockPs, sectionRef, mockAppData.widgets["333"].appPage.name, jasmine.objectContaining({
                        data: jasmine.objectContaining({
                            pageUriSEO: 'app-page-title',
                            hidePage: false,
                            tpaApplicationId: 18,
                            indexable: true,
                            tpaPageId: undefined,
                            pageBackgrounds: 'background',
                            isLandingPage: false
                        })
                    }));
                    done();
                });
            });
        });

        describe('deleteSection', function() {
            var data = {
                id: 'page1',
                tpaApplicationId: 1
            };

            var pageNode = {
                tpaApplicationId: 33
            };

            beforeEach(function(){
                this.isMultiSectionInstalledSpy = spyOn(installedTpaAppsOnSiteService, "isMultiSectionInstalled").and.returnValue(true);
                spyOn(page.data, "get").and.returnValue(data);
                spyOn(page, "remove").and.callFake(function(ps, pageId, callback) {
                    callback(ps);
                });
            });

            it("should delete page and remove it from installed apps", function(done) {
                tpaSectionService.deleteSection(mockPs, data.id, {}, function() {
                    expect(page.remove).toHaveBeenCalledWith(mockPs, "page1", jasmine.any(Function));
                    done();
                });
            });

            it("should delete page and remove it from installed apps", function(done) {
                tpaSectionService.deleteSection(mockPs, data.id, {}, function() {
                    expect(page.remove).toHaveBeenCalledWith(mockPs, "page1", jasmine.any(Function));
                    done();
                });
            });

            it("should not delete hidden section if few main section installed", function(done) {
                spyOn(dataModel, "getDataItem").and.returnValue(pageNode);
                spyOn(installedTpaAppsOnSiteService, "getHiddenSections");

                tpaSectionService.deleteSection(mockPs, data.id, {}, function() {
                    expect(page.remove.calls.count()).toEqual(1);
                    done();
                });
            });

            describe('async delete hidden sections', function() {
                beforeEach(function() {
                    spyOn(installedTpaAppsOnSiteService, 'getWidgetsByAppId').and.returnValue([]);
                    this.isMultiSectionInstalledSpy.and.returnValue(false);
                });

                it("should not delete hidden section if there are no hidden sections", function(done) {
                    spyOn(installedTpaAppsOnSiteService, "getHiddenSections").and.returnValue([]);
                    spyOn(clientSpecMapService, "hasHiddenPages").and.returnValue(false);

                    tpaSectionService.deleteSection(mockPs, data.id, {}, function() {
                        expect(page.remove.calls.count()).toEqual(1);
                        done();
                    });
                });

                it("should delete hidden sections", function(done) {
                    var mockHiddenPages = [
                        {pageId: "page1"},
                        {pageId: "page2"}
                    ];

                    spyOn(installedTpaAppsOnSiteService, "getHiddenSections").and.returnValue(mockHiddenPages);
                    spyOn(clientSpecMapService, "hasHiddenPages").and.returnValue(true);

                    tpaSectionService.deleteSection(mockPs, data, {}, function() {
                        expect(page.remove.calls.count()).toEqual(3);
                        done();
                    });

                });
            });

        });

        describe('deleteSection -  error tests', function() {
            var data = {
                id: 'page1',
                tpaApplicationId: 1
            };

            it("should not remove section from installed apps and delete hidden section if remove return with an error", function(done) {
                spyOn(page.data, "get").and.returnValue(data);
                spyOn(installedTpaAppsOnSiteService, "isMultiSectionInstalled").and.returnValue(false);
                spyOn(installedTpaAppsOnSiteService, 'getWidgetsByAppId').and.returnValue([]);
                spyOn(page, "remove").and.callFake(function(ps, pageId, callback) {
                    callback(ps, "page not deleted");
                });

                tpaSectionService.deleteSection(mockPs, data.id, {}, function(ps, error) {
                    expect(error).toBeDefined();
                    done();
                });
            });
        });

        describe('multi section', function() {
            var pageNode = {
                applicationId: 18
            };

            beforeEach(function(){
                spyOn(pageData, 'getPageDataWithoutIds').and.returnValue({
                    pageBackgrounds: 'background'
                });
                spyOn(page, 'serializePage').and.returnValue({
                    data: {
                        pageBackgrounds: 'background'
                    }
                });
                spyOn(dataModel, "getDataItem").and.returnValue(pageNode);
                spyOn(installedTpaAppsOnSiteService, 'isApplicationIdExists').and.returnValue(false);
            });

            it("should not add hidden pages if there are no sub sections", function(done) {
                spyOn(installedTpaAppsOnSiteService, "isMainSectionInstalled").and.returnValue(false);
                var mockAppData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: {
                                multiInstanceEnabled: false,
                                hidden:false
                            }
                        },
                        333: {
                            widgetId: "333"
                        },
                        555: {
                            widgetId: "222",
                            appPage: {
                                multiInstanceEnabled: false,
                                hidden:true
                            }
                        }
                    }
                };

                var pageToAddRef = page.getPageIdToAdd(mockPs, {widgetId: null}, mockAppData);
                tpaSectionService.addSectionAfterProvision(mockPs, pageToAddRef, {widgetId: null}, mockAppData, function () {
                    expect(page.add.calls.count()).toEqual(1);
                    done();
                });
            });

            it('should add sub sections', function(done) {
                var mockAppData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: {
                                multiInstanceEnabled: true,
                                hidden:false,
                                name: '222',
                                order: 1
                            }
                        },
                        333: {
                            widgetId: "333",
                            appPage: {
                                multiInstanceEnabled: false,
                                hidden:true,
                                id: "1234",
                                name: "333",
                                order: 2
                            }
                        },
                        555: {
                            widgetId: "555",
                            appPage: {
                                multiInstanceEnabled: false,
                                hidden:true,
                                id: "123",
                                name: "555",
                                order: 3
                            }
                        },
                        666: {
                            widgetId: "555",
                            appPage: {
                                multiInstanceEnabled: false,
                                hidden:true,
                                id: "123",
                                name: "555",
                                order: null
                            }
                        }
                    }
                };
                spyOn(installedTpaAppsOnSiteService, "isMainSectionInstalled").and.returnValue(false);
                spyOn(clientSpecMapService, 'getAppSections').and.returnValue(mockAppData.widgets);

                var sectionPointer = {type : 'DESKTOP', id : 'rnnnn'};
                var pageToAddRef = page.getPageIdToAdd(mockPs, {widgetId: "222"}, mockAppData);
                tpaSectionService.addSectionAfterProvision(mockPs, pageToAddRef, {widgetId: "222"}, mockAppData, function () {
                    expect(page.add.calls.count()).toEqual(4);
                    expect(component.add.calls.count()).toEqual(4);

                    var serializedPage1 = compStructure.getSubSectionStructure(mockPs, mockAppData.widgets["555"], "TPAMultiSection_TPASctn123", '555');
                    serializedPage1.data.tpaPageId = mockAppData.widgets["555"].appPage.id;
                    serializedPage1.data.title = mockAppData.widgets["555"].appPage.name;

                    expect(page.add.calls.argsFor(2)[2]).toEqual(mockAppData.widgets["555"].appPage.name);
                    expect(page.add.calls.argsFor(2)[3]).toEqual(serializedPage1);
                    expect(component.add.calls.argsFor(2)).toEqual([mockPs, pagePointer, sectionPointer, jasmine.any(Object)]);

                    var serializedPage2 = compStructure.getSubSectionStructure(mockPs, mockAppData.widgets["333"], "TPAMultiSection_TPASctn123", '333');
                    serializedPage2.data.tpaPageId = mockAppData.widgets["333"].appPage.id;
                    serializedPage2.data.title = mockAppData.widgets["333"].appPage.name;

                    expect(page.add.calls.argsFor(1)[2]).toEqual(mockAppData.widgets["333"].appPage.name);
                    expect(page.add.calls.argsFor(1)[3]).toEqual(serializedPage2);
                    expect(component.add.calls.argsFor(1)).toEqual([mockPs, pagePointer, sectionPointer, jasmine.any(Object)]);

                    done();
                });
            });
        });

        describe('alreadyInstalled', function () {
            it('should check installedTpaAppsOnSiteService and see if app is installed', function () {
                spyOn(installedTpaAppsOnSiteService, 'isAppInstalledBy');
                var appDefId = 'appDefId';
                tpaSectionService.alreadyInstalled({}, appDefId);
                expect(installedTpaAppsOnSiteService.isAppInstalledBy).toHaveBeenCalledWith({}, appDefId);
            });
        });

        describe("deleteSection including widgets and hidden sections", function() {
            var mockWidgetsComps = [
                {id: "1", pageId: 'page3'},
                {id: "2", pageId: 'page3'}
            ];

            var mockSection = {
                pageId : "page1"
            };

            var options = {};

            beforeEach(function() {
                var data = {
                    id: 'page1',
                    tpaApplicationId: 1
                };
                spyOn(pageData, 'getPageDataWithoutIds').and.returnValue({
                    pageBackgrounds: 'background'
                });
                spyOn(page, 'serializePage').and.returnValue({
                    data: {
                        pageBackgrounds: 'background'
                    }
                });

                spyOn(page.data, "get").and.returnValue(data);
                spyOn(page, "remove").and.callFake(function(ps, pageId, callback) {
                    callback(ps);
                });

                var siteData = privateServicesHelper.getSiteDataWithPages({
                    masterPage: {
                        components: [
                            {id: constants.COMP_IDS.PAGES_CONTAINER}
                        ]
                    },
                    page1: {},
                    page3: {},
                    page4: {}
                });
                mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

            });

            it("should not delete widgets and hidden if more than one main section installed", function(done) {
                var assertion = function(ps, error) {
                    expect(page.remove).toHaveBeenCalled();
                    expect(tpaWidgetService.deleteWidget).not.toHaveBeenCalled();
                    expect(error).toBeUndefined();
                    done();
                };

                spyOn(installedTpaAppsOnSiteService, "isMultiSectionInstalled").and.returnValue(true);
                spyOn(installedTpaAppsOnSiteService, "isApplicationIdExists").and.returnValue(true);
                spyOn(installedTpaAppsOnSiteService, "getWidgetsByAppId").and.returnValue(mockWidgetsComps);
                spyOn(tpaWidgetService, "deleteWidget").and.callFake(function(_ps, _compRef, applicationID, resolve) {
                    resolve(_ps);
                });

                tpaSectionService.deleteSection(mockPs, mockSection.pageId, options, assertion);
            });

            it("should fail delete widgets", function(done) {
                var assertion = function(ps, error) {
                    expect(page.remove).not.toHaveBeenCalled();
                    expect(error).toBeDefined();
                    done();
                };

                spyOn(installedTpaAppsOnSiteService, "isMultiSectionInstalled").and.returnValue(false);
                spyOn(installedTpaAppsOnSiteService, "isApplicationIdExists").and.returnValue(true);
                spyOn(installedTpaAppsOnSiteService, "getWidgetsByAppId").and.returnValue(mockWidgetsComps);
                spyOn(tpaWidgetService, "deleteWidget").and.callFake(function(_ps, _compRef, applicationID, resolve) {
                    resolve(_ps, "could not delete widget");
                });

                tpaSectionService.deleteSection(mockPs, mockSection.pageId, options, assertion);
            });

            it("should delete only section if there is no widgets", function(done) {
                var assertion = function(ps, error) {
                    expect(tpaWidgetService.deleteWidget).not.toHaveBeenCalled();
                    expect(page.remove).toHaveBeenCalled();
                    expect(error).toBeUndefined();
                    done();
                };

                spyOn(installedTpaAppsOnSiteService, "isMultiSectionInstalled").and.returnValue(false);
                spyOn(installedTpaAppsOnSiteService, "isApplicationIdExists").and.returnValue(true);
                spyOn(installedTpaAppsOnSiteService, "getWidgetsByAppId").and.returnValue([]);
                spyOn(tpaWidgetService, "deleteWidget").and.callFake(function(_ps, compRef, applicationID, resolve) {
                    resolve();
                });

                tpaSectionService.deleteSection(mockPs, mockSection.pageId, options, assertion);
            });

            it("should delete widgets and section", function(done) {
                var assertion = function(ps, error) {
                    expect(tpaWidgetService.deleteWidget.calls.count()).toEqual(2);
                    expect(page.remove).toHaveBeenCalled();
                    expect(error).toBeUndefined();
                    done();
                };

                spyOn(installedTpaAppsOnSiteService, "isMultiSectionInstalled").and.returnValue(false);
                spyOn(installedTpaAppsOnSiteService, "isApplicationIdExists").and.returnValue(true);
                spyOn(installedTpaAppsOnSiteService, "getWidgetsByAppId").and.returnValue(mockWidgetsComps);
                spyOn(tpaWidgetService, "deleteWidget").and.callFake(function(_ps, compRef, applicationID, resolve) {
                    resolve();
                });

                tpaSectionService.deleteSection(mockPs, mockSection.pageId, options, assertion);
            });

            it("should not delete widgets that are on section and hidden sections", function(done) {
                mockWidgetsComps.push( {id: "3", pageId: mockSection.pageId});
                mockWidgetsComps.push( {id: "3", pageId: "page4"});
                var assertion = function(ps, error) {
                    expect(tpaWidgetService.deleteWidget.calls.count()).toEqual(3);
                    expect(page.remove).toHaveBeenCalled();
                    expect(error).toBeUndefined();
                    done();
                };

                spyOn(installedTpaAppsOnSiteService, "isMultiSectionInstalled").and.returnValue(false);
                spyOn(installedTpaAppsOnSiteService, "isApplicationIdExists").and.returnValue(true);
                spyOn(installedTpaAppsOnSiteService, "getWidgetsByAppId").and.returnValue(mockWidgetsComps);
                spyOn(tpaWidgetService, "deleteWidget").and.callFake(function(_ps, compRef, applicationID, resolve) {
                    resolve();
                });

                tpaSectionService.deleteSection(mockPs, mockSection.pageId, options, assertion);
            });
        });

        describe('multi multi section', function () {

            beforeEach(function () {
                spyOn(pageData, 'getPageDataWithoutIds').and.returnValue({
                    pageBackgrounds: 'background'
                });
                spyOn(page, 'serializePage').and.returnValue({
                    data: {
                        pageBackgrounds: 'background'
                    }
                });
                this.expectedSectionStructure = {
                    "componentType": "wysiwyg.viewer.components.tpapps.TPASection",
                    "type": "Component",
                    "id": "page-id",
                    "style": "tpas0",
                    "skin": "wysiwyg.viewer.skins.TPASectionSkin",
                    "layout": {
                        "x": 0,
                        "y": 0,
                        "width": 980,
                        "height": 500
                    },
                    "data": {
                        "type": "TPA",
                        "applicationId": "18",
                        "metaData": {
                            "isPreset": true,
                            "schemaVersion": "1.0",
                            "isHidden": false
                        },
                        "widgetId": null
                    }
                };

                this.mockAppData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        222: {
                            widgetId: "222",
                            appPage: {
                                multiInstanceEnabled: true,
                                hidden: false,
                                name: 'pageName'
                            }
                        },
                        333: {
                            widgetId: "333"
                        }
                    }
                };
            });

            it('should add another main section with default style', function (done) {
                tpaSectionService.addMultiSection(mockPs, sectionRef, {
                    widgetData: this.mockAppData.widgets[222],
                    sectionId: 'TPASection_TPASctn123',
                    applicationId: 18
                }, function () {
                    var serializedPage = compStructure.getMultiSectionStructure(mockPs, this.mockAppData.widgets[222], "TPASection_TPASctn123", 'pagename');
                    expect(page.add).toHaveBeenCalledWith(mockPs, sectionRef, 'pageName', serializedPage);
                    expect(component.add).toHaveBeenCalledWith(mockPs, pagePointer, sectionRef, this.expectedSectionStructure);
                    done();
                }.bind(this));
            });

            it('should add another main section with custom style', function (done) {
                this.expectedSectionStructure.style = 'style1';

                tpaSectionService.addMultiSection(mockPs, sectionRef, {
                    widgetData: this.mockAppData.widgets[222],
                    sectionId: 'TPASection_TPASctn123',
                    applicationId: 18,
                    styleId: 'style1'
                }, function () {
                    expect(component.add).toHaveBeenCalledWith(mockPs, pagePointer, sectionRef, this.expectedSectionStructure);
                    done();
                }.bind(this));
            });

            it('should use option page title when given', function (done) {
                tpaSectionService.addMultiSection(mockPs, sectionRef, {
                    widgetData: this.mockAppData.widgets[222],
                    sectionId: 'TPASection_TPASctn123',
                    applicationId: 18,
                    title: 'foo-bar'
                }, function () {
                    var serializedPage = compStructure.getMultiSectionStructure(mockPs, this.mockAppData.widgets[222], "TPASection_TPASctn123", 'foo-bar');
                    expect(page.add).toHaveBeenCalledWith(mockPs, sectionRef, 'foo-bar', serializedPage);
                    done();
                }.bind(this));
            });

            it('should add the page with the correct page structue', function (done) {
                this.mockAppData.widgets[222].appPage.id = 'id';

                tpaSectionService.addMultiSection(mockPs, sectionRef, {
                    widgetData: this.mockAppData.widgets[222],
                    sectionId: 'TPASection_TPASctn123',
                    applicationId: 18,
                    title: 'foo-bar'
                }, function () {
                    expect(page.add).toHaveBeenCalledWith(mockPs, sectionRef, 'foo-bar', jasmine.objectContaining({
                        data: jasmine.objectContaining({
                            pageUriSEO: 'foo-bar',
                            hidePage: false,
                            tpaApplicationId: 18,
                            indexable: true,
                            tpaPageId: 'id$TPA$TPASection_TPASctn123',
                            pageBackgrounds: 'background',
                            isLandingPage: false
                        })
                    }));
                    done();
                });
            });

        });
    });
});
