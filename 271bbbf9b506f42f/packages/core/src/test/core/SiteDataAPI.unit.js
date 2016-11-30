define(['lodash', 'utils', 'core/core/SiteDataAPI', 'testUtils'], function (_, utils, SiteDataAPI, testUtils) {
    'use strict';

   describe("SiteDataAPI", function () {
        var viewModes = utils.constants.VIEW_MODES;

        var openExperiments = testUtils.experimentHelper.openExperiments;
        var mockFactory = testUtils.mockFactory;
        var pagesFromServer = {};
        var defaultLayout = {
            x: 10,
            y: 10,
            height: 50,
            width: 50
        };
        var layoutInMode = _.assign({}, defaultLayout, {x: defaultLayout.x + 10, y: defaultLayout.y - 10});

        function getComponentPointer(pointers, pageId, componentId, pointerType) {
            var pagePointer = pointers.components.getPage(pageId, pointerType || viewModes.DESKTOP);
            return pointers.components.getComponent(componentId, pagePointer);
        }

        function getHiddenInDefaultComponent() {
            return {
                id: 'comp-to-hide',
                componentType: 'Image',
                layout: defaultLayout,
                modes: {
                    isHiddenByModes: true,
                    definitions: [
                        {
                            modeId: 'mode-id'
                        }
                    ],
                    overrides: [{
                        modeIds: ['mode-id']
                    }]
                }
            };
        }

        function getTextComp(withAnchors) {
            var compLayout = withAnchors ? _.assign({}, defaultLayout, {anchors: []}) : defaultLayout;
            return {
                id: 'someText',
                componentType: 'wysiwyg.viewer.components.WRichText',
                layout: compLayout,
                propertyQuery: 'aaaa'
            };
        }

        function getDisplayedInDefaultComponent() {
            return {
                id: 'displayed-comp',
                componentType: 'Image',
                layout: defaultLayout,
                modes: {
                    isHiddenByModes: false,
                    definitions: [],
                    overrides: []
                }
            };
        }

        function preparePagesForLoad(siteData, pageIds) {
            _.forEach(pageIds, function (pageId) {
                pagesFromServer[pageId] = siteData.pagesData[pageId];
                delete siteData.pagesData[pageId];
            });
        }

        beforeEach(function () {
            openExperiments('viewerGeneratedAnchors', 'sv_ignoreBottomBottomAnchors');
            this.ajaxGet = jasmine.createSpy('ajaxGet');
            this.ajaxGet.and.callFake(function (request) {
                var pageId = _.last(request.url.split('/'));
                request.success(pagesFromServer[pageId]);
            });
            pagesFromServer = {};
        });

        describe("initFullPagesFromSiteData", function () {
            beforeEach(function () {
                var siteData = mockFactory.mockSiteData();
                siteData.addPageWithData('page1', {}, [getHiddenInDefaultComponent()]);

                this.dataStuff = SiteDataAPI.createSiteDataAPIAndDal(siteData, _.noop);
                this.siteDataAPI = this.dataStuff.siteDataAPI;
                this.siteData = siteData;
            });

            it("should process existing pages in siteData on create", function () {
                expect(this.dataStuff.fullPagesData.pagesData.masterPage).toBeDefined();
                expect(this.dataStuff.fullPagesData.pagesData.currentPage).toBeDefined();
                expect(this.dataStuff.fullPagesData.pagesData.page1).toBeDefined();
                expect(this.dataStuff.fullPagesData.pagesData.page1.structure.components[0]).toEqual(getHiddenInDefaultComponent());
            });
        });

        describe('anchors creation on load', function () {
            beforeEach(function () {
                this.siteData = mockFactory.mockSiteData();
                this.urlData = {pageId: 'page1'};
                var textComp = getTextComp(true);
                this.siteData.addPageWithData('page1', {}, [getHiddenInDefaultComponent(), textComp], [textComp]);
                this.siteData.addPageWithData('pageWithoutAnchors', {}, [getDisplayedInDefaultComponent()], [getDisplayedInDefaultComponent()]);
                delete this.siteData.pagesData.pageWithoutAnchors.structure.layout.anchors;
                this.siteData.pagesData.page1.structure.layout.anchors = [];
                this.siteData.pagesData.page1.structure.isPagePackedDesktop = true;

                preparePagesForLoad(this.siteData, ['masterPage', 'page1', 'pageWithoutAnchors']);
                this.dataStuff = SiteDataAPI.createSiteDataAPIAndDal(this.siteData, this.ajaxGet);

                this.siteDataAPI = this.dataStuff.siteDataAPI;
            });

            describe('when public viewer and some pages are after packText flow and ignore bottomBottom anchors', function () {
                beforeEach(function () {
                    window.publicModel = {};
                    this.siteData = mockFactory.mockSiteData();
                    this.siteData.addPageWithData('page1', {ignoreBottomBottomAnchors: true}, [getHiddenInDefaultComponent()]);
                    this.siteData.addPageWithData('pageWithoutPackText', {ignoreBottomBottomAnchors: true}, [getHiddenInDefaultComponent(), getTextComp(true)]);
                    this.siteData.addPageWithData('pageWithoutIgnoreBottomBottomAnchors', {}, [getHiddenInDefaultComponent()]);
                    _.set(this.siteData, 'pagesData.masterPage.data.document_data.masterPage.ignoreBottomBottomAnchors', true);
                    this.urlData.pageWithoutPackText = 'pageWithoutPackText';
                    this.urlData.pageWithoutIgnoreBottomBottomAnchors = 'pageWithoutIgnoreBottomBottomAnchors';

                    preparePagesForLoad(this.siteData, ['masterPage', 'page1', 'pageWithoutPackText', 'pageWithoutIgnoreBottomBottomAnchors']);
                    this.dataStuff = SiteDataAPI.createSiteDataAPIAndDal(this.siteData, this.ajaxGet);
                });

                afterEach(function () {
                    window.publicModel = null;
                });

                it('should create anchors for pages according to viewMode, if those pages are after packtext', function () {
                    this.dataStuff.siteDataAPI.loadPage({pageId: 'page1'}, _.noop);
                    this.dataStuff.siteDataAPI.loadPage({pageId: 'pageWithoutPackText'}, _.noop);

                    var pageDesktopAnchorsMap = _.get(this.siteData, ['anchorsMap', 'page1', viewModes.DESKTOP]);
                    var pageMobileAnchorsMap = _.get(this.siteData, ['anchorsMap', 'page1', viewModes.MOBILE]);

                    var masterPageAnchorsMap = _.get(this.siteData, ['anchorsMap', 'masterPage', viewModes.DESKTOP]);
                    var pageWithoutPackTextAnchorsMap = _.get(this.siteData, ['anchorsMap', 'pageWithoutPackText', viewModes.DESKTOP]);

                    expect(pageDesktopAnchorsMap).toBeDefined();
                    expect(pageMobileAnchorsMap).not.toBeDefined();
                    expect(masterPageAnchorsMap).toBeDefined();
                    expect(pageWithoutPackTextAnchorsMap).not.toBeDefined();
                });

                it('should create anchors for components in pages if they are in the displayed json', function () {
                    this.dataStuff.siteDataAPI.loadPage({pageId: 'page1'}, _.noop);
                    this.dataStuff.siteDataAPI.loadPage({pageId: 'pageWithoutPackText'}, _.noop);

                    var pageDesktopAnchorsMap = _.get(this.siteData, ['anchorsMap', 'page1', viewModes.DESKTOP]);
                    var masterPageDesktopAnchorsMap = _.get(this.siteData, ['anchorsMap', 'masterPage', viewModes.DESKTOP]);

                    expect(pageDesktopAnchorsMap['comp-to-hide']).not.toBeDefined();
                    expect(masterPageDesktopAnchorsMap.SITE_HEADER).toBeDefined();
                });

                it('should create anchors for pages only after masterPage is loaded, if those pages loaded before masterPage', function () {
                    var pendingRequests = [];
                    this.ajaxGet.and.callFake(function (request) {
                        var pageId = _.last(request.url.split('/'));
                        if (pageId === 'masterPage') {
                            pendingRequests.push(request);
                        } else {
                            pendingRequests.unshift(request);
                        }
                    });

                    this.dataStuff.siteDataAPI.loadPage({pageId: 'page1'}, _.noop);

                    _.forEach(pendingRequests, function(request){
                        var pageId = _.last(request.url.split('/'));
                        request.success(pagesFromServer[pageId]);
                    });

                    var pageDesktopAnchorsMap = _.get(this.siteData, ['anchorsMap', 'page1', viewModes.DESKTOP]);

                    expect(pageDesktopAnchorsMap).toBeDefined();
                });

            });

            it('should create anchors for pages according to viewMode, only if those pages have no anchors in json', function () {
                this.siteDataAPI.loadPage({pageId: 'page1'}, _.noop);
                this.siteDataAPI.loadPage({pageId: 'pageWithoutAnchors'}, _.noop);

                var pageDesktopAnchorsMap = _.get(this.siteData, ['anchorsMap', 'page1', viewModes.DESKTOP]);
                var desktopAnchorsMapOfPageWithoutJsonAnchors = _.get(this.siteData, ['anchorsMap', 'pageWithoutAnchors', viewModes.DESKTOP]);
                var mobileAnchorsMapOfPageWithoutJsonAnchors = _.get(this.siteData, ['anchorsMap', 'pageWithoutAnchors', viewModes.MOBILE]);

                expect(pageDesktopAnchorsMap).not.toBeDefined();
                expect(desktopAnchorsMapOfPageWithoutJsonAnchors).toBeDefined();
                expect(mobileAnchorsMapOfPageWithoutJsonAnchors).not.toBeDefined();
            });

            it('should create anchors for master page if children of master page have no json anchors', function () {
                var nonHeaderComp = _.find(pagesFromServer.masterPage.structure.children, function (comp) {
                    return comp.id !== 'SITE_HEADER';
                });
                delete nonHeaderComp.layout.anchors;
                this.siteDataAPI.loadPage({}, _.noop);

                this.dataStuff = SiteDataAPI.createSiteDataAPIAndDal(this.siteData, _.noop);

                var masterPageAnchorsMap = _.get(this.siteData, ['anchorsMap', 'masterPage', viewModes.DESKTOP]);
                expect(masterPageAnchorsMap).toBeDefined();
            });

            it('should not create anchors for master page if children of master page have json anchors', function () {
                var chilld = _.first(pagesFromServer.masterPage.structure.children);
                chilld.layout.anchors = [];
                this.siteDataAPI.loadPage({}, _.noop);

                this.dataStuff = SiteDataAPI.createSiteDataAPIAndDal(this.siteData, _.noop);

                var masterPageAnchorsMap = _.get(this.siteData, ['anchorsMap', 'masterPage', viewModes.DESKTOP]);
                expect(masterPageAnchorsMap).not.toBeDefined();
            });

            describe('when in mobile', function () {
                beforeEach(function () {
                    this.siteData.setMobileView(true);
                });

                it('should create anchors for pages according to viewMode, only if those pages have no anchors in json', function () {
                    this.siteDataAPI.loadPage({pageId: 'page1'}, _.noop);
                    this.siteDataAPI.loadPage({pageId: 'pageWithoutAnchors'}, _.noop);

                    var pageMobileAnchorsMap = _.get(this.siteData, ['anchorsMap', 'page1', viewModes.MOBILE]);
                    var desktopAnchorsMapOfPageWithoutJsonAnchors = _.get(this.siteData, ['anchorsMap', 'pageWithoutAnchors', viewModes.DESKTOP]);
                    var mobileAnchorsMapOfPageWithoutJsonAnchors = _.get(this.siteData, ['anchorsMap', 'pageWithoutAnchors', viewModes.MOBILE]);

                    expect(pageMobileAnchorsMap).not.toBeDefined();
                    expect(desktopAnchorsMapOfPageWithoutJsonAnchors).not.toBeDefined();
                    expect(mobileAnchorsMapOfPageWithoutJsonAnchors).toBeDefined();
                });

            });

        });

        describe("loadPage", function () {
            beforeEach(function () {
                var siteData = mockFactory.mockSiteData();
                siteData.addPageWithData('page1', {}, [getHiddenInDefaultComponent(), getTextComp(true)]);
                siteData.addPageWithData('page2', {}, [getTextComp(true)]);

                this.dataStuff = SiteDataAPI.createSiteDataAPIAndDal(siteData, this.ajaxGet);
                this.siteDataAPI = this.dataStuff.siteDataAPI;
                this.siteData = siteData;
            });

            describe('when page is password protected', function () {
                it('should not load the page into the pagesData until authorization is granted', function (done) {
                    preparePagesForLoad(this.siteData, ['page2']);
                    delete this.dataStuff.fullPagesData.pagesData.page2;

                    _.set(this.siteData, 'rendererModel.passwordProtectedPages', ['page2']);

                    this.siteDataAPI.loadPage({pageId: 'page2'}, function () {
                        expect(this.dataStuff.fullPagesData.pagesData.page2).not.toBeDefined();
                        done();
                    }.bind(this));
                });
            });

            it("should load page and master, put the loaded data in full pages and processed data in siteData", function (done) {
                preparePagesForLoad(this.siteData, ['masterPage', 'page1', 'page2']);
                this.siteDataAPI.loadPage({pageId: 'page1'}, function () {
                    expect(this.dataStuff.fullPagesData.pagesData.masterPage).toBeDefined();
                    expect(this.dataStuff.fullPagesData.pagesData.page1).toBeDefined();
                    expect(this.dataStuff.fullPagesData.pagesData.page1.structure.components[0]).toEqual(getHiddenInDefaultComponent());
                    expect(this.siteData.pagesData.page1.structure.components.length).toEqual(1);
                    done();
                }.bind(this));
            });

            it("should load additional page", function (done) {
                preparePagesForLoad(this.siteData, ['masterPage', 'page1', 'page2']);
                this.siteDataAPI.loadPage({pageId: 'page1'}, function () {
                    this.siteDataAPI.loadPage({pageId: 'page2'}, function () {
                        expect(this.dataStuff.fullPagesData.pagesData.masterPage).toBeDefined();
                        expect(this.dataStuff.fullPagesData.pagesData.page1).toBeDefined();
                        expect(this.dataStuff.fullPagesData.pagesData.page2).toBeDefined();
                        expect(this.dataStuff.fullPagesData.pagesData.page1.structure.components[0]).toEqual(getHiddenInDefaultComponent());
                        expect(this.siteData.pagesData.page1.structure.components.length).toEqual(1);
                        done();
                    }.bind(this));
                }.bind(this));
            });

            it('should not call dataLoadedCallback for a page that is already loaded (navigation only)', function () {
                var dataLoadedCallback = jasmine.createSpy('dataLoadedCallback');
                this.siteDataAPI.registerDataLoadedCallback(dataLoadedCallback);

                this.siteDataAPI.loadPage({pageId: 'page1'}, _.noop);

                expect(dataLoadedCallback).not.toHaveBeenCalled();
            });
        });

        describe('registerDataLoadedCallback', function () {
            beforeEach(function () {
                var fullSiteData = mockFactory.mockSiteData();

                this.dataStuff = SiteDataAPI.createSiteDataAPIAndDal(fullSiteData, this.ajaxGet);
                this.siteDataAPI = this.dataStuff.siteDataAPI;
                this.fullSiteData = fullSiteData;
                this.dataLoadedCallback = jasmine.createSpy('dataLoadedCallback');
                this.siteDataAPI.registerDataLoadedCallback(this.dataLoadedCallback);
            });

            it('should notify data loaded callback on every data load', function () {
                var requestDescriptors = [
                    {
                        destination: ['destination1'],
                        url: 'url1'
                    },
                    {
                        destination: ['destination2'],
                        url: 'url2'
                    }
                ];
                pagesFromServer.url1 = {data: 'data1'};
                pagesFromServer.url2 = {data: 'data2'};
                this.siteDataAPI.store.loadBatch(requestDescriptors);

                expect(this.dataLoadedCallback.calls.count()).toEqual(2);
                expect(this.dataLoadedCallback).toHaveBeenCalledWith(['destination1'], pagesFromServer.url1);
                expect(this.dataLoadedCallback).toHaveBeenCalledWith(['destination2'], pagesFromServer.url2);
            });

            it('should notify data loaded callback on page load', function () {
                this.fullSiteData.addPageWithData('page1', {});
                preparePagesForLoad(this.fullSiteData, ['page1']);

                this.dataStuff.siteDataAPI.loadPage({pageId: 'page1'}, _.noop);

                expect(this.dataLoadedCallback.calls.count()).toEqual(1);
                expect(this.dataLoadedCallback).toHaveBeenCalledWith(['pagesData', 'page1'], pagesFromServer.page1);
            });

            it("should not notify  if we try to load page data directly", function () {
                var requestDescriptors = [
                    {
                        destination: ['pagesData', 'page1'],
                        url: 'url1'
                    }
                ];
                this.siteDataAPI.store.loadBatch(requestDescriptors);
                expect(this.dataLoadedCallback.calls.count()).toEqual(0);
            });
        });

        describe("components modes", function () {
            function getHiddenInModeComps() {
                return {
                    id: 'container',
                    componentType: 'Image',
                    layout: defaultLayout,
                    modes: {
                        definitions: [{
                            modeId: 'mode-id',
                            type: 'DEFAULT'
                        }, {
                            modeId: 'mode-id-2',
                            type: 'HOVER'
                        }, {
                            modeId: 'mode-id-3',
                            type: 'APPLICATIVE'
                        }]
                    },
                    components: [{
                        id: 'comp-hidden-in-mode',
                        componentType: 'Image',
                        layout: defaultLayout,
                        modes: {
                            overrides: [{
                                modeIds: ['mode-id'],
                                isHiddenByModes: true
                            }, {
                                modeIds: ['mode-id-2'],
                                layout: layoutInMode
                            }]
                        }
                    }]
                };
            }

            beforeEach(function () {
                this.siteData = mockFactory.mockSiteData();
                this.siteData.setPageComponents([getHiddenInModeComps()], 'currentPage');

                this.dataStuff = SiteDataAPI.createSiteDataAPIAndDal(this.siteData, this.ajaxGet);
                this.siteDataAPI = this.dataStuff.siteDataAPI;
                preparePagesForLoad(this.siteData, ['masterPage', 'currentPage']);
                this.dataStuff = SiteDataAPI.createSiteDataAPIAndDal(this.siteData, this.ajaxGet);
                this.dataStuff.siteDataAPI.loadPage({pageId: 'currentPage'}, _.noop);

                var pagePointer = this.dataStuff.pointers.components.getPage('currentPage', viewModes.DESKTOP);
                this.containerId = 'container';
                this.containerPointer = this.dataStuff.pointers.components.getComponent(this.containerId, pagePointer);
            });


            describe('activateMode, deactivateMode, switchMode', function () {
                it('should have default modes active after creating displayed json', function () {
                    var activeModes = this.siteDataAPI.getActiveModes();

                    expect(activeModes.currentPage['mode-id']).toEqual(true);
                });

                it("should update the component in displayedJson according to the activated mode", function () {
                    var pointers = this.dataStuff.pointers;
                    var DAL = this.dataStuff.displayedDal;
                    var pagePointer = pointers.components.getPage('currentPage', viewModes.DESKTOP);
                    var containerPointer = pointers.components.getComponent('container', pagePointer);
                    var containerBefore = DAL.get(containerPointer);

                    this.siteDataAPI.activateMode(containerPointer, 'mode-id-2');

                    var containerAfter = DAL.get(containerPointer);
                    expect(containerBefore.components.length).toBe(0);
                    expect(containerAfter.components.length).toBe(1);
                });

                it("should update the component in displayedJson according to the still active mode", function () {
                    var pointers = this.dataStuff.pointers;
                    var DAL = this.dataStuff.displayedDal;
                    var pagePointer = pointers.components.getPage('currentPage', viewModes.DESKTOP);
                    var containerPointer = pointers.components.getComponent('container', pagePointer);//{id: 'hidden-in-mode'};
                    var containerBefore = DAL.get(containerPointer);

                    this.siteDataAPI.activateMode(containerPointer, 'mode-id-2');
                    var containerWhileInMode = DAL.get(containerPointer);
                    this.siteDataAPI.deactivateMode(containerPointer, 'mode-id-2');

                    var containerAfter = DAL.get(containerPointer);
                    expect(containerBefore.components.length).toBe(0);
                    expect(containerWhileInMode.components.length).toBe(1);
                    expect(containerAfter.components.length).toBe(0);
                });

                it('should notify update listeners', function () {
                    var pointers = this.dataStuff.pointers;
                    var pagePointer = pointers.components.getPage('currentPage', viewModes.DESKTOP);
                    var containerPointer = pointers.components.getComponent('container', pagePointer);
                    var updateCallback = jasmine.createSpy('updateCallback');
                    this.siteDataAPI.registerDisplayedJsonUpdateCallback(updateCallback);

                    updateCallback.calls.reset();
                    this.siteDataAPI.activateMode(containerPointer, 'mode-id-2');
                    expect(updateCallback).toHaveBeenCalledWith('currentPage', 'container');

                    updateCallback.calls.reset();
                    this.siteDataAPI.deactivateMode(containerPointer, 'mode-id-2');
                    expect(updateCallback).toHaveBeenCalledWith('currentPage', 'container');
                });

                describe('byId', function () {

                    beforeEach(function () {
                        this.DAL = this.dataStuff.displayedDal;
                    });

                    describe('activateModeById', function () {
                        it('should remove the child from the displayedJson when "mode-id" is active (default)', function () {
                            var containerId = 'container';
                            var containerPointer = getComponentPointer(this.dataStuff.pointers, 'currentPage', containerId);
                            var containerChildren = this.DAL.get(containerPointer).components;
                            expect(containerChildren).toBeEmpty();

                            this.siteDataAPI.activateModeById(containerId, 'currentPage', 'mode-id-2');

                            expect(this.DAL.get(containerPointer).components).not.toBeEmpty();
                        });
                    });

                    describe('deactivateModeById', function () {
                        it('should show the child from the displayedJson when "mode-id" is deactivated', function () {
                            var containerId = 'container';
                            var containerPointer = getComponentPointer(this.dataStuff.pointers, 'currentPage', containerId);
                            var containerChildren = this.DAL.get(containerPointer).components;
                            expect(containerChildren).toBeEmpty();

                            this.siteDataAPI.deactivateModeById(containerId, 'currentPage', 'mode-id');

                            expect(this.DAL.get(containerPointer).components).not.toBeEmpty();
                        });
                    });

                    describe('switchModesByIds', function () {
                        it('should switch between the given modes', function () {
                            var containerId = this.containerPointer.id;
                            this.siteDataAPI.deactivateModeById(containerId, 'currentPage', 'mode-id');
                            var childPointer = getComponentPointer(this.dataStuff.pointers, 'currentPage', 'comp-hidden-in-mode');

                            this.siteDataAPI.activateModeById(containerId, 'currentPage', 'mode-id');
                            expect(this.DAL.isExist(childPointer)).toBeFalsy();

                            this.siteDataAPI.switchModesByIds(this.containerPointer, 'currentPage', 'mode-id', 'mode-id-2');

                            expect(this.siteDataAPI.getActiveModes().currentPage['mode-id']).toBeFalsy();
                            expect(this.siteDataAPI.getActiveModes().currentPage['mode-id-2']).toBeTruthy();
                            expect(this.DAL.get(childPointer)).toBeDefined();
                            expect(this.DAL.get(childPointer).layout).toEqual(layoutInMode);
                        });

                        it('when modeToDeactivate is not active, should still activate modeToActivate', function () {
                            this.siteDataAPI.deactivateModeById(this.containerPointer.id, 'currentPage', 'mode-id');
                            var childPointer = getComponentPointer(this.dataStuff.pointers, 'currentPage', 'comp-hidden-in-mode');

                            this.siteDataAPI.switchModesByIds(this.containerPointer, 'currentPage', 'mode-id', 'mode-id-2');

                            expect(this.siteDataAPI.getActiveModes().currentPage['mode-id']).toBeFalsy();
                            expect(this.siteDataAPI.getActiveModes().currentPage['mode-id-2']).toBeTruthy();
                            expect(this.DAL.get(childPointer)).toBeDefined();
                            expect(this.DAL.get(childPointer).layout).toEqual(layoutInMode);
                        });

                        it('when modeToActivate is already active, should still deactivate modeToDeactivate', function () {
                            var containerId = this.containerPointer.id;

                            this.siteDataAPI.activateModeById(containerId, 'currentPage', 'mode-id-3');
                            this.siteDataAPI.activateModeById(containerId, 'currentPage', 'mode-id-2');

                            this.siteDataAPI.switchModesByIds(this.containerPointer, 'currentPage', 'mode-id-3', 'mode-id-2');

                            var childPointer = getComponentPointer(this.dataStuff.pointers, 'currentPage', 'comp-hidden-in-mode');
                            expect(this.siteDataAPI.getActiveModes().currentPage['mode-id-2']).toBeTruthy();
                            expect(this.siteDataAPI.getActiveModes().currentPage['mode-id-3']).toBeFalsy();
                            expect(this.DAL.get(childPointer)).toBeDefined();
                            expect(this.DAL.get(childPointer).layout).toEqual(layoutInMode);
                        });

                        it('when deactivated mode is of default type, should activate the hover type mode of that component', function () {
                            this.siteDataAPI.switchModesByIds(this.containerPointer, 'currentPage', 'mode-id');

                            expect(this.siteDataAPI.getActiveModes().currentPage['mode-id-2']).toBeTruthy();
                        });

                        it('should do nothing when modeToDeactivate equals modeToActivate', function () {
                            var containerId = 'container';
                            this.siteDataAPI.activateModeById(containerId, 'currentPage', 'mode-id-2');
                            var childPointer = getComponentPointer(this.dataStuff.pointers, 'currentPage', 'comp-hidden-in-mode');
                            this.siteDataAPI.activateModeById(containerId, 'currentPage', 'mode-id');

                            this.siteDataAPI.switchModesByIds(containerId, 'currentPage', 'mode-id-2', 'mode-id-2');

                            expect(this.siteDataAPI.getActiveModes().currentPage['mode-id']).toBeTruthy();
                            expect(this.siteDataAPI.getActiveModes().currentPage['mode-id-2']).toBeFalsy();
                            expect(this.DAL.get(childPointer)).not.toBeDefined();
                        });
                    });

                    it('should notify update listeners', function () {
                        var containerId = 'container';
                        var updateCallback = jasmine.createSpy('updateCallback');
                        this.siteDataAPI.registerDisplayedJsonUpdateCallback(updateCallback);

                        updateCallback.calls.reset();
                        this.siteDataAPI.activateModeById(containerId, 'currentPage', 'mode-id-2');
                        expect(updateCallback).toHaveBeenCalledWith('currentPage', containerId);

                        updateCallback.calls.reset();
                        this.siteDataAPI.deactivateModeById(containerId, 'currentPage', 'mode-id-2');
                        expect(updateCallback).toHaveBeenCalledWith('currentPage', containerId);
                    });
                });

            });

            describe('resetAllActiveModes', function () {
                it('should reset all active modes', function () {
                    var pointers = this.dataStuff.pointers;
                    var DAL = this.dataStuff.displayedDal;
                    var pagePointer = pointers.components.getPage('currentPage', viewModes.DESKTOP);
                    var containerPointer = pointers.components.getComponent('container', pagePointer);
                    this.siteDataAPI.activateMode(containerPointer, 'mode-id-2');
                    var containerBeforeReset = DAL.get(containerPointer);
                    var modesBeforeReset = this.siteDataAPI.getActiveModes();

                    this.siteDataAPI.resetAllActiveModes();

                    var containerAfter = DAL.get(containerPointer);

                    expect(modesBeforeReset.currentPage).not.toBeEmpty();
                    expect(containerBeforeReset.components.length).toBe(1);
                    expect(containerAfter.components.length).toBe(0);
                    expect(this.siteDataAPI.getActiveModes().currentPage['mode-id']).toBeTruthy();
                });
            });

            describe('anchors creation in modes', function () {
                beforeEach(function () {
                    openExperiments('sv_removeJsonAnchors');
                    this.siteData = mockFactory.mockSiteData();
                    this.siteData.setPageComponents([getHiddenInModeComps()], 'currentPage');

                    delete this.siteData.pagesData.currentPage.structure.layout.anchors;
                    this.dataStuff = SiteDataAPI.createSiteDataAPIAndDal(this.siteData, this.ajaxGet);
                    this.siteDataAPI = this.dataStuff.siteDataAPI;
                    preparePagesForLoad(this.siteData, ['masterPage', 'currentPage']);
                    this.dataStuff.fullPagesData.pagesData = _.omit(this.dataStuff.fullPagesData.pagesData, ['masterPage', 'currentPage']);
                    this.siteDataAPI.loadPage({pageId: 'currentPage'}, _.noop);
                });

                it('should create new anchors when activating mode to the displayed components', function () {
                    var pointers = this.dataStuff.pointers;
                    var pagePointer = pointers.components.getPage('currentPage', viewModes.DESKTOP);
                    var containerPointer = pointers.components.getComponent('container', pagePointer);
                    this.siteDataAPI.deactivateMode(containerPointer, 'mode-id');
                    var anchorsMapBeforeMode = _.clone(this.siteData.anchorsMap.currentPage.DESKTOP);

                    this.siteDataAPI.activateMode(containerPointer, 'mode-id');

                    var anchorsMapAfterMode = this.siteData.anchorsMap.currentPage.DESKTOP;
                    expect(anchorsMapBeforeMode).toBeDefined();
                    expect(anchorsMapAfterMode).toBeDefined();
                    expect(anchorsMapBeforeMode['comp-hidden-in-mode']).toBeDefined();
                    expect(anchorsMapAfterMode['comp-hidden-in-mode']).not.toBeDefined();
                });

                it('should create new anchors when deactivating mode to the displayed components', function () {
                    var pointers = this.dataStuff.pointers;
                    var pagePointer = pointers.components.getPage('currentPage', viewModes.DESKTOP);
                    var containerPointer = pointers.components.getComponent('container', pagePointer);
                    this.siteDataAPI.deactivateMode(containerPointer, 'mode-id');
                    var anchorsMapBeforeMode = _.clone(this.siteData.anchorsMap.currentPage.DESKTOP);

                    this.siteDataAPI.activateMode(containerPointer, 'mode-id');
                    this.siteDataAPI.deactivateMode(containerPointer, 'mode-id');

                    var anchorsMapAfterMode = this.siteData.anchorsMap.currentPage.DESKTOP;
                    expect(anchorsMapBeforeMode).toBeDefined();
                    expect(anchorsMapAfterMode).toBeDefined();
                    expect(anchorsMapBeforeMode['comp-hidden-in-mode']).toBeDefined();
                    expect(anchorsMapAfterMode['comp-hidden-in-mode']).toBeDefined();
                });

                it('should create new anchors when reset all active modes', function () {
                    var pointers = this.dataStuff.pointers;
                    var pagePointer = pointers.components.getPage('currentPage', viewModes.DESKTOP);
                    var containerPointer = pointers.components.getComponent('container', pagePointer);
                    this.siteDataAPI.deactivateMode(containerPointer, 'mode-id');
                    var anchorsMapBeforeMode = _.clone(this.siteData.anchorsMap.currentPage.DESKTOP);

                    this.siteDataAPI.activateMode(containerPointer, 'mode-id');
                    this.siteDataAPI.resetAllActiveModes();

                    var anchorsMapAfterMode = this.siteData.anchorsMap.currentPage.DESKTOP;
                    expect(anchorsMapBeforeMode).toBeDefined();
                    expect(anchorsMapAfterMode).toBeDefined();
                    expect(anchorsMapBeforeMode['comp-hidden-in-mode']).toBeDefined();
                    expect(anchorsMapAfterMode['comp-hidden-in-mode']).not.toBeDefined();
                });
            });

            describe('returned value', function () {

                beforeEach(function () {
                    //var pointers = this.dataStuff.pointers;
                    //var pagePointer = pointers.components.getPage('currentPage', viewModes.DESKTOP);
                    //this.containerId = 'container';
                    //this.containerPointer = pointers.components.getComponent(this.containerId, pagePointer);
                });

                describe('activateMode', function () {

                    describe('when mode was not activated before', function () {
                        it('should return true', function () {
                            var returnedValue = this.siteDataAPI.activateMode(this.containerPointer, 'mode-id-2');

                            expect(returnedValue).toBeTruthy();
                        });
                    });

                    describe('when mode was activated before', function () {
                        it('should ignore the activation of the already active mode and return false', function () {
                            this.siteDataAPI.activateMode(this.containerPointer, 'mode-id');

                            var returnedValue = this.siteDataAPI.activateMode(this.containerPointer, 'mode-id');

                            expect(returnedValue).toBeFalsy();
                        });
                    });
                });

                describe('activateModeById', function () {
                    describe('when mode was not activated before', function () {
                        it('should return true', function () {
                            var returnedValue = this.siteDataAPI.activateModeById(this.containerId, 'currentPage', 'mode-id-2');

                            expect(returnedValue).toBeTruthy();
                        });
                    });

                    describe('when mode was activated before', function () {
                        it('should ignore the activation of the already active mode and return false', function () {
                            this.siteDataAPI.activateModeById(this.containerId, 'currentPage', 'mode-id');
                            var returnedValue = this.siteDataAPI.activateModeById(this.containerId, 'currentPage', 'mode-id');

                            expect(returnedValue).toBeFalsy();
                        });
                    });
                });

                describe('deactivateMode', function () {
                    describe('when mode is active', function () {
                        it('should return true', function () {
                            this.siteDataAPI.activateMode(this.containerPointer, 'mode-id');

                            var returnedValue = this.siteDataAPI.deactivateMode(this.containerPointer, 'mode-id');

                            expect(returnedValue).toBeTruthy();
                        });
                    });

                    describe('when mode is inactive', function () {
                        it('should return false', function () {
                            var returnedValue = this.siteDataAPI.deactivateMode(this.containerPointer, 'mode-id-2');

                            expect(returnedValue).toBeFalsy();
                        });
                    });
                });

                describe('deactivateModeById', function () {
                    describe('when mode is active', function () {
                        it('should return true', function () {
                            this.siteDataAPI.activateModeById(this.containerId, 'currentPage', 'mode-id');
                            var returnedValue = this.siteDataAPI.deactivateModeById(this.containerId, 'currentPage', 'mode-id');

                            expect(returnedValue).toBeTruthy();
                        });
                    });

                    describe('when mode is inactive', function () {
                        it('should return false', function () {
                            var returnedValue = this.siteDataAPI.deactivateModeById(this.containerId, 'currentPage', 'mode-id-2');

                            expect(returnedValue).toBeFalsy();
                        });
                    });
                });

                describe('switchModes', function () {
                    it('should return false if modeIdToActivate is the same as modeIdToDeactivate', function () {
                        var returnedValue = this.siteDataAPI.switchModes(this.containerPointer, 'mode-id-2', 'mode-id-2');

                        expect(returnedValue).toBeFalsy();
                    });

                    it('should return false if mode to activate is already activated, and mode to deactivate is deactivated', function () {
                        this.siteDataAPI.activateModeById(this.containerId, 'currentPage', 'mode-id');

                        var returnedValue = this.siteDataAPI.switchModes(this.containerPointer, 'mode-id-2', 'mode-id');

                        expect(returnedValue).toBeFalsy();
                    });

                    it('should return true if mode to deactivate is activated', function () {
                        this.siteDataAPI.activateModeById(this.containerId, 'currentPage', 'mode-id');

                        var returnedValue = this.siteDataAPI.switchModes(this.containerPointer, 'mode-id', 'mode-id-2');

                        expect(returnedValue).toBeTruthy();
                    });

                    it('should return true if mode to activate is deactivated', function () {
                        var returnedValue = this.siteDataAPI.switchModes(this.containerPointer, 'mode-id', 'mode-id-2');

                        expect(returnedValue).toBeTruthy();
                    });
                });

                describe('deactivateModesInPage', function () {
                    it('should return true', function () {
                        this.siteDataAPI.activateModeById(this.containerId, 'currentPage', 'mode-id');

                        var returnValue = this.siteDataAPI.deactivateModesInPage('currentPage');

                        expect(returnValue).toBeTruthy();
                    });

                    it('should return false if no active modes on page', function () {
                        var returnValue = this.siteDataAPI.deactivateModesInPage('masterPage');

                        expect(returnValue).toBeFalsy();
                    });
                });
            });
        });

        describe('anchors creation API', function () {
            beforeEach(function () {
                this.siteData = mockFactory.mockSiteData();
                this.compInPage = getDisplayedInDefaultComponent();
                this.siteData.addPageWithData('page1', {}, [this.compInPage], [this.compInPage]);
                //displayed-comp
                var dataStuff = SiteDataAPI.createSiteDataAPIAndDal(this.siteData, this.ajaxGet);
                this.siteDataAPI = dataStuff.siteDataAPI;
            });

            it('should create anchors for mobile structure if mobile is forced', function () {
                this.siteDataAPI.createPageAnchors('page1', true);

                var pageMobileAnchorsMap = _.get(this.siteData, ['anchorsMap', 'page1', viewModes.MOBILE]);

                expect(pageMobileAnchorsMap).toBeDefined();
                expect(pageMobileAnchorsMap[this.compInPage.id]).toBeDefined();
            });
        });
    });

});
