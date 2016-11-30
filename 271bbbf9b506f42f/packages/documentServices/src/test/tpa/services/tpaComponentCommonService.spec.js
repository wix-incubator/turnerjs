define(['lodash',
        'documentServices/page/page',
        'documentServices/page/pageData',
        'documentServices/component/component',
        'documentServices/actionsAndBehaviors/actionsAndBehaviors',
        'documentServices/documentMode/documentModeInfo',
        'documentServices/tpa/services/tpaComponentCommonService',
        'documentServices/tpa/services/installedTpaAppsOnSiteService',
        'documentServices/tpa/constants',
        'documentServices/mockPrivateServices/privateServicesHelper'],
    function(_, page, pageData, component, actionsAndBehaviors, documentModeInfo, tpaComponentCommonService, installedTpaAppsOnSiteService, tpaConstants, privateServicesHelper) {

        'use strict';

        describe('tpaComponentCommonService', function () {
            var mockPs;

            beforeEach(function () {
                var siteData = privateServicesHelper.getSiteDataWithPages({'currentPage': {}}, 'currentPage');
                siteData.setCurrentPage('currentPage');
                mockPs = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                spyOn(page, 'add');
                spyOn(component, 'add');
                spyOn(pageData, 'getPageDataWithoutIds').and.returnValue({
                    pageBackgrounds: 'background'
                });
                this.pagePointer = {
                    id: 'page-id',
                    type: 'DESKTOP'
                };
                this.appData = {
                    appDefinitionId: "1363adbc-c783-b1e0-d8ef-4a661300ac8c",
                    appDefinitionName: "LiveChat",
                    applicationId: 18,
                    instance: "1234",
                    widgets: {
                        1: {
                            widgetId: '1',
                            appPage: {
                                defaultPage: '',
                                hidden: true,
                                id: 'testpage',
                                indexable: true,
                                multiInstanceEnabled: false,
                                name: 'testPage',
                                order: 1
                            },
                            published: true,
                            name: 'testpage'
                        },
                        2: {
                            widgetId: '2',
                            appPage: {
                                hidden: false,
                                id: 'testPage',
                                name: 'testPage'
                            },
                            published: true
                        },
                        3: {
                            widgetId: '3',
                            appPage: {
                                hidden: true,
                                id: 'testPage',
                                name: 'testPage'
                            },
                            published: true
                        },
                        4: {
                            widgetId: '4',
                            appPage: {
                                hidden: false,
                                id: 'testPage',
                                name: 'testPage'
                            },
                            published: true,
                            canBeStretched: true,
                            shouldBeStretchedByDefault: true
                        },
                        5: {
                            widgetId: '5',
                            appPage: {
                                fullPage: true,
                                hidden: false,
                                id: 'testPage',
                                name: 'testPage'
                            },
                            published: true,
                            canBeStretched: true,
                            shouldBeStretchedByDefault: true
                        }
                    }
                };
            });

            describe('addHiddenPages', function () {

                it('should add a page and section only for hidden sections', function () {
                    spyOn(tpaComponentCommonService, 'addPageAndSection');
                    tpaComponentCommonService.addHiddenPages(mockPs, this.appData);

                    expect(page.add.calls.count()).toEqual(2);
                    expect(component.add.calls.count()).toEqual(2);
                });

                it('should not add pages/sections when no sections exist', function () {
                    spyOn(tpaComponentCommonService, 'addPageAndSection');
                    this.appData.widgets = {};
                    tpaComponentCommonService.addHiddenPages(mockPs, this.appData);

                    expect(page.add).not.toHaveBeenCalled();
                    expect(component.add).not.toHaveBeenCalled();
                });
            });

            it("should add the page with the correct page structure", function (done) {
                tpaComponentCommonService.addHiddenPages(mockPs, this.appData);

                expect(page.add).toHaveBeenCalledWith(mockPs, jasmine.any(Object), 'testPage', jasmine.objectContaining({
                    data: jasmine.objectContaining({
                        pageUriSEO: 'testpage',
                        hidePage: true,
                        tpaApplicationId: 18,
                        indexable: true,
                        tpaPageId: 'testpage',
                        pageBackgrounds: 'background',
                        isLandingPage: false,
                        title: 'testPage'
                    })
                }));
                done();
            });

            describe('deleteHiddenSections', function () {

                it('should delete hidden sections', function (done) {
                    var mockHiddenPages = [
                        {pageId: "page1"},
                        {pageId: "page2"}
                    ];
                    spyOn(installedTpaAppsOnSiteService, "getHiddenSections").and.returnValue(mockHiddenPages);
                    spyOn(page, "remove").and.callFake(function (ps, pageId, callback) {
                        callback(ps);
                    });

                    tpaComponentCommonService.deleteHiddenSections(mockPs, 18, function () {
                        expect(page.remove.calls.count()).toEqual(2);
                        done();
                    });
                });

                it('should not remove pages if no hidden sections exist', function (done) {
                    var mockHiddenPages = [];
                    spyOn(installedTpaAppsOnSiteService, "getHiddenSections").and.returnValue(mockHiddenPages);
                    spyOn(page, "remove").and.callFake(function (ps, pageId, callback) {
                        callback(ps);
                    });

                    tpaComponentCommonService.deleteHiddenSections(mockPs, 18, function () {
                        expect(page.remove).not.toHaveBeenCalled();
                        done();
                    });
                });
            });


            describe('addPageAndSection', function(){

                beforeEach(function () {
                    this.expectedSectionStructure = {
                        "componentType": "wysiwyg.viewer.components.tpapps.TPAMultiSection",
                        "type": "Component",
                        "id": "id",
                        "style": "tpas0",
                        "skin": "wysiwyg.viewer.skins.TPASectionSkin",
                        "layout": {
                            "x": 0,
                            "y": 0,
                            "width": 980,
                            "height": 500
                        },
                        "data": {
                            "type": "wysiwyg.viewer.components.tpapps.TPAMultiSection",
                            "applicationId": "18",
                            "metaData": {
                                "isPreset": true,
                                "schemaVersion": "1.0",
                                "isHidden": false
                            },
                            "widgetId": 2
                        }
                    };
                    this.expectedSectionPointer = {
                        "type": "DESKTOP",
                        "id": "id"
                    };
                });

                it('should add a new page with a section with default style', function () {
                    tpaComponentCommonService.addPageAndSection(mockPs, this.pagePointer, 'id', 18, this.appData.widgets[1], null, 2, tpaConstants.COMP_TYPES.TPA_MULTI_SECTION, tpaConstants.COMP_TYPES.TPA_MULTI_SECTION);

                    expect(page.add).toHaveBeenCalled();
                    expect(component.add).toHaveBeenCalledWith(mockPs, this.expectedSectionPointer, this.pagePointer, this.expectedSectionStructure);
                });

                it('should add a section with default style if styleId is null', function () {
                    tpaComponentCommonService.addPageAndSection(mockPs, this.pagePointer, 'id', 18, this.appData.widgets[1], null, 2, tpaConstants.COMP_TYPES.TPA_MULTI_SECTION, tpaConstants.COMP_TYPES.TPA_MULTI_SECTION, null);

                    expect(component.add).toHaveBeenCalledWith(mockPs, this.expectedSectionPointer, this.pagePointer, this.expectedSectionStructure);
                });

                it('should add a section with passed style if styleId is not null', function () {
                    this.expectedSectionStructure.style = 'style1';

                    tpaComponentCommonService.addPageAndSection(mockPs, this.pagePointer, 'id', 18, this.appData.widgets[1], null, 2, tpaConstants.COMP_TYPES.TPA_MULTI_SECTION, tpaConstants.COMP_TYPES.TPA_MULTI_SECTION, 'style1');

                    expect(component.add).toHaveBeenCalledWith(mockPs, this.expectedSectionPointer, this.pagePointer, this.expectedSectionStructure);
                });

                it('should add a full width section', function(){
                    tpaComponentCommonService.addPageAndSection(mockPs, this.pagePointer, 'id', 18, this.appData.widgets[4],
                        null, 2, tpaConstants.COMP_TYPES.TPA_MULTI_SECTION, tpaConstants.COMP_TYPES.TPA_MULTI_SECTION);

                    expect(component.add.calls.mostRecent().args[3].layout.docked).toEqual({left: {vw: 0}, right: {vw: 0}});
                });

                it('should add a full-height + full-width + no-header-and-footer section', function(){
                    tpaComponentCommonService.addPageAndSection(mockPs, this.pagePointer, 'id', 18, this.appData.widgets[5],
                        null, 2, tpaConstants.COMP_TYPES.TPA_MULTI_SECTION, tpaConstants.COMP_TYPES.TPA_MULTI_SECTION);

                    expect(component.add.calls.mostRecent().args[3].layout.docked).toEqual({top: {px: 0}, right: {px: 0}, bottom: {px: 0}, left: {px: 0}});
                    expect(component.add.calls.mostRecent().args[3].layout.fixedPosition).toBe(true);
                });
            });

            describe('setPrefetchPageBehaviorIfNeeded', function() {

                var widgetPointer;

                beforeEach(function () {
                    spyOn(actionsAndBehaviors, 'updateBehavior');
                    spyOn(documentModeInfo, 'getViewMode').and.returnValue('DESKTOP');
                    spyOn(actionsAndBehaviors, 'getBehaviors').and.returnValue(undefined);
                    widgetPointer = {
                        id: 'widgetId'
                    };
                });

                it('should not set behaviour if no prefetch widgets', function () {
                    tpaComponentCommonService.setPrefetchPageBehaviorIfNeeded(mockPs, widgetPointer, this.appData);

                    expect(actionsAndBehaviors.updateBehavior).not.toHaveBeenCalled();
                });

                it('should not set behaviour if there not published prefetch widgets ', function () {

                    this.appData.widgets.newWidget = {
                        widgetId: 'newWidget',
                        appPage: {
                            hidden: true,
                            id: 'testPage',
                            name: 'testPage'
                        },
                        preFetch: true
                    };

                    tpaComponentCommonService.setPrefetchPageBehaviorIfNeeded(mockPs, widgetPointer, this.appData);

                    expect(actionsAndBehaviors.updateBehavior).not.toHaveBeenCalled();
                });

                it('should not set behaviour if there are no hidden sections installed', function () {
                    spyOn(installedTpaAppsOnSiteService, 'getHiddenSections').and.returnValue([]);

                    this.appData.widgets.newWidget = {
                        widgetId: 'newWidget',
                        appPage: {
                            hidden: true,
                            id: 'testPage',
                            name: 'testPage'
                        },
                        published: true,
                        preFetch: true
                    };

                    tpaComponentCommonService.setPrefetchPageBehaviorIfNeeded(mockPs, widgetPointer, this.appData);

                    expect(actionsAndBehaviors.updateBehavior).not.toHaveBeenCalled();
                });

                it('should set behaviour if there are prefetch widgets', function () {
                    spyOn(installedTpaAppsOnSiteService, 'getHiddenSections').and.returnValue([{
                        widgetId: 'newWidget',
                        pageId: 'page1'
                    }]);

                    var expectedBehaviorDefinition = {
                        params: {
                            prefetchFilters: {}
                        }
                    };

                    spyOn(actionsAndBehaviors, 'getBehaviorDefinition').and.returnValue(expectedBehaviorDefinition);
                    expectedBehaviorDefinition.params.prefetchFilters.id = ['page1'];
                    this.appData.widgets.newWidget = {
                        widgetId: 'newWidget',
                        appPage: {
                            hidden: true,
                            id: 'testPage',
                            name: 'testPage'
                        },
                        published: true,
                        preFetch: true
                    };

                    tpaComponentCommonService.setPrefetchPageBehaviorIfNeeded(mockPs, widgetPointer, this.appData);

                    expect(actionsAndBehaviors.updateBehavior).toHaveBeenCalledWith(mockPs, widgetPointer, jasmine.any(Object), jasmine.any(Object), expectedBehaviorDefinition);
                });

                it('should delete existing and set behaviour if there are prefetch widgets', function () {
                    spyOn(installedTpaAppsOnSiteService, 'getHiddenSections').and.returnValue([{
                        widgetId: 'newWidget',
                        pageId: 'page1'
                    }]);

                    var expectedBehaviorDefinition = {
                        params: {
                            prefetchFilters: {}
                        }
                    };

                    actionsAndBehaviors.getBehaviors.and.returnValue([
                        {
                            "action": {
                                "sourceId": "comp-irf4dc52",
                                "type": "comp",
                                "name": "screenIn"
                            },
                            "behavior": {
                                "targetId": "page1",
                                "type": "site",
                                "name": "prefetchPages",
                                "params": {
                                    "prefetchFilters": {
                                        "id": [
                                            "page1"
                                        ]
                                    }
                                }
                            }
                        }
                    ]);
                    spyOn(actionsAndBehaviors, 'getBehaviorDefinition').and.returnValue(expectedBehaviorDefinition);
                    expectedBehaviorDefinition.params.prefetchFilters.id = ['page1'];
                    this.appData.widgets.newWidget = {
                        widgetId: 'newWidget',
                        appPage: {
                            hidden: true,
                            id: 'testPage',
                            name: 'testPage'
                        },
                        published: true,
                        preFetch: true
                    };

                    tpaComponentCommonService.setPrefetchPageBehaviorIfNeeded(mockPs, widgetPointer, this.appData);

                    expect(actionsAndBehaviors.updateBehavior).toHaveBeenCalledWith(mockPs, widgetPointer, jasmine.any(Object), jasmine.any(Object), expectedBehaviorDefinition);
                });
            });

        });
    });
