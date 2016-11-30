define(['core/siteRender/SiteAPI', 'core/core/SiteDataAPI', 'utils', 'testUtils', 'lodash'], function(SiteAPI, SiteDataAPI, utils, testUtils, _) {
    'use strict';

    var factory = testUtils.mockFactory;

    describe('SiteAPI Tests', function() {

        function initSiteAPI() {
            spyOn(utils.logger, 'reportBI');
            spyOn(utils.logger, 'reportPageEvent');

            var siteData = factory.mockSiteData();
            siteData.siteId = 'mockSiteId';
            var siteDataWrapper = SiteDataAPI.createSiteDataAPIAndDal(siteData, _.noop);
            var viewerPrivateServices = {
                siteDataAPI: siteDataWrapper.siteDataAPI,
                pointers: siteDataWrapper.pointers,
                displayedDAL: siteDataWrapper.displayedDal
            };
            var site = factory.mockWixSiteReact(siteData, viewerPrivateServices);
            this.site = site;
            this.siteData = siteData;

            this.siteAPI = new SiteAPI(site);
        }

        beforeEach(initSiteAPI);

        it('Should create a new SiteAPI', function() {
            expect(this.siteAPI).toBeDefined();
        });

        it('should reset all apps when moving from desktop to mobile view or vice versa', function () {
	        var widgetAspect = this.siteAPI.getSiteAspect('WidgetAspect');
            spyOn(widgetAspect, 'restartApps').and.callThrough();

	        var isMobile = !this.siteData.isMobileView();
            this.siteAPI.setMobileView(isMobile);

            expect(this.siteData.isMobileView()).toBe(isMobile);
            expect(widgetAspect.restartApps).toHaveBeenCalledWith();
        });

        it('should not reset apps if the mobile view was not changed', function () {
	        var widgetAspect = this.siteAPI.getSiteAspect('WidgetAspect');
            spyOn(widgetAspect, 'restartApps').and.callThrough();

            this.siteAPI.setMobileView(this.siteData.isMobileView());

            expect(widgetAspect.restartApps).not.toHaveBeenCalled();
        });

        describe('reportBI function', function() {

            it('Should have a report function', function() {
                expect(this.siteAPI.reportBI).toBeDefined();
                expect(typeof this.siteAPI.reportBI).toBe('function');
            });

            it('Should send biLogger report', function() {
                this.siteAPI.reportBI();

                expect(utils.logger.reportBI).toHaveBeenCalled();
            });

            it('Should send a biLogger report with parameters', function() {
                var eventDef = {a: 1};
                var params = {b: 1};

                this.siteAPI.reportBI(eventDef, params);

                expect(utils.logger.reportBI).toHaveBeenCalledWith(this.site.props.siteData, eventDef, params);
            });
        });

        describe('reportCurrentPageEvent function', function() {

            it('Should have a reportCurrentPageEvent function', function() {
                expect(this.siteAPI.reportCurrentPageEvent).toBeDefined();
                expect(typeof this.siteAPI.reportCurrentPageEvent).toBe('function');
            });

            it('Should send biLogger reportPageEvent report', function() {
                this.siteAPI.reportCurrentPageEvent();

                expect(utils.logger.reportPageEvent).toHaveBeenCalledWith(this.site.props.siteData, 'full');
            });
        });

        describe('isZoomOpened', function () {
            beforeEach(function(){

            });
            it('should return true when there is a pageItem in the url', function () {
                this.siteData.setRootNavigationInfo({
                    pageId: this.siteData.getCurrentUrlPageId(),
                    pageItemId: 'pageItemId'
                });
                expect(this.siteAPI.isZoomOpened()).toBeTruthy();
            });

            it('should return true when there is a zoomed item in memory (instead of the url)', function () {
                spyOn(utils.nonPageItemZoom, 'getZoomedImageData').and.returnValue({});
                expect(this.siteAPI.isZoomOpened()).toBeTruthy();
            });

            it('should return false when there is no pageItem in the url nor zoomed image in memory', function () {
                spyOn(utils.nonPageItemZoom, 'getZoomedImageData').and.returnValue(undefined);
                expect(this.siteAPI.isZoomOpened()).toBeFalsy();
            });
        });

        describe('YandexMetrika', function () {

            it('initYandexMetrika function should call logger.initYandexMetrika with siteData', function () {
                spyOn(utils.logger, 'initYandexMetrika');
                this.siteAPI.initYandexMetrika();

                expect(utils.logger.initYandexMetrika).toHaveBeenCalledWith(this.site.props.siteData);
            });

            it('reportYandexPageHit function should call logger.reportYandexPageHit', function () {
                spyOn(utils.logger, 'reportYandexPageHit').and.callFake(function () {});
                this.siteAPI.reportYandexPageHit('http://www.mockUrl.com/site');

                expect(utils.logger.reportYandexPageHit).toHaveBeenCalledWith('http://www.mockUrl.com/site');
            });
        });

        describe('popups', function () {

            describe('getCurrentPopupId:', function(){
                beforeEach(function(){
                    var currentPopupId;

                    this.siteDataMock = {
                        getCurrentPopupId: jasmine.createSpy('getCurrentPopupId')
                    };

                    spyOn(this.siteAPI, 'getSiteData').and.returnValue(this.siteDataMock);

                    this.run = function(sets){
                        this.siteDataMock.getCurrentPopupId.and.returnValue(sets.currentPopupId);

                        return this;
                    };

                    this.expect = function(actualPoupId){
                        currentPopupId = actualPoupId;

                        return this;
                    };

                    this.toBe = function(expectedPopupId){
                        expect(currentPopupId).toBe(expectedPopupId);
                    };
                });

                it('should return current popup id from "siteData"', function(){
                    this.run({currentPopupId: 'testId'})
                        .expect(this.siteAPI.getCurrentPopupId())
                        .toBe('testId');

                    this
                        .run({currentPopupId: 'otherId'})
                        .expect(this.siteAPI.getCurrentPopupId())
                        .toBe('otherId');
                });
            });

            describe('isPopupOpened:', function(){
                beforeEach(function(){
                    this.siteDataMock = {
                        isPopupOpened: jasmine.createSpy('isPopupOpened')
                    };

                    spyOn(this.siteAPI, 'getSiteData').and.returnValue(this.siteDataMock);
                });

                it('should return "true" if a popup is opened', function(){
                    this.siteAPI.getSiteData().isPopupOpened.and.returnValue(true);

                    expect(this.siteAPI.isPopupOpened()).toBe(true);
                });

                it('should return "false" if a popup is NOT opened', function(){
                    this.siteAPI.getSiteData().isPopupOpened.and.returnValue(false);

                    expect(this.siteAPI.isPopupOpened()).toBe(false);
                });
            });

            describe('openPopupPage:', function(){
                beforeEach(function(){
                    var currentFunc;

                    this.run = function(sets){
                        this.siteAPI.openPopupPage(sets.openPopupId);

                        return this;
                    };

                    this.expect = function(func){
                        currentFunc = func;

                        return this;
                    };

                    this.toHaveBeenCalledWith = function(page, skipHistory){
                        expect(currentFunc).toHaveBeenCalledWith(page, skipHistory);
                    };
                });

                it('should open a popup', function(){
                    spyOn(this.siteAPI, 'navigateToPage');

                    this
                        .run({openPopupId: 'testId'})
                        .expect(this.siteAPI.navigateToPage)
                        .toHaveBeenCalledWith({pageId: 'testId'}, true);

                    this
                        .run({openPopupId: 'otherId'})
                        .expect(this.siteAPI.navigateToPage)
                        .toHaveBeenCalledWith({pageId: 'otherId'}, true);
                });

                it('should load apps - when sv_platform1 experiment is open', function(){
                    testUtils.experimentHelper.openExperiments('sv_platform1');
                    var widgetAspect = this.siteAPI.getSiteAspect('WidgetAspect');
                    var popupId = 'somePopupId';
                    this.siteData.addPopupPageWithDefaults(popupId);
                    spyOn(widgetAspect, 'loadApps').and.callThrough();

                    this.siteAPI.openPopupPage(popupId);

                    expect(widgetAspect.loadApps).toHaveBeenCalledWith([popupId]);
                });

                it('should not load apps - when sv_platform1 experiment is close', function(){
                    var widgetAspect = this.siteAPI.getSiteAspect('WidgetAspect');
                    var popupId = 'somePopupId';
                    this.siteData.addPopupPageWithDefaults(popupId);
                    spyOn(widgetAspect, 'loadApps').and.callThrough();

                    this.siteAPI.openPopupPage(popupId);

                    expect(widgetAspect.loadApps).not.toHaveBeenCalled();
                });
            });

            describe('closePopupPage:', function(){
                it('should close a popup', function(){
                    spyOn(this.siteAPI, 'navigateToPage');

                    this.siteAPI.closePopupPage();

                    expect(this.siteAPI.navigateToPage).toHaveBeenCalledWith({
                        pageId: this.site.props.siteData.getPrimaryPageId()
                    }, true);
                });


                it('should not load apps - when sv_platform1 experiment is open', function(){
                    testUtils.experimentHelper.openExperiments('sv_platform1');
                    var widgetAspect = this.siteAPI.getSiteAspect('WidgetAspect');
                    var popupId = 'somePopupId';
                    this.siteData.addPopupPageWithDefaults(popupId).setCurrentPage(popupId);
                    spyOn(widgetAspect, 'loadApps').and.callThrough();

                    this.siteAPI.closePopupPage();

                    expect(widgetAspect.loadApps).not.toHaveBeenCalled();
                });

                it('should not load apps - when sv_platorm1 experiment is close ', function(){
                    var widgetAspect = this.siteAPI.getSiteAspect('WidgetAspect');
                    var popupId = 'somePopupId';
                    this.siteData.addPopupPageWithDefaults(popupId).setCurrentPage(popupId);
                    spyOn(widgetAspect, 'loadApps').and.callThrough();

                    this.siteAPI.closePopupPage();

                    expect(widgetAspect.loadApps).not.toHaveBeenCalled();
                });

            });
        });

       describe('modes', function() {

            function getPageStructure(compsPrefix) {
                compsPrefix = compsPrefix || '';
                return [{
                    id: compsPrefix + 'comp1',
                    type: 'Container',
                    componentType: 'Container',
                    layout: {
                        x: 0, y: 0,
                        width: 500, height: 500
                    },
                    components: [{
                            id: compsPrefix + 'comp2',
                            type: 'Container',
                            componentType: 'Container',
                            layout: {
                                x: 1000, y: 0,
                                width: 500, height: 500
                            }
                        }, {
                            id: compsPrefix + 'comp3',
                            type: 'Container',
                            componentType: 'Container',
                            layout: {
                                x: 0, y: 1000,
                                width: 500, height: 500
                            }
                        }, {
                            id: compsPrefix + 'comp4',
                            type: 'Container',
                            componentType: 'Container',
                            layout: {
                                x: 1000, y: 1000,
                                width: 500, height: 500
                            }
                        }],
                    modes: {
                        definitions: [{
                            modeId: compsPrefix + 'mode-x',
                            type: 'APPLICATIVE'
                        }, {
                            modeId: compsPrefix + 'mode-y',
                            type: 'APPLICATIVE'
                        }, {
                            modeId: compsPrefix + 'mode-z',
                            type: 'APPLICATIVE'
                        }]
                    }
                }];
            }

            beforeEach(function() {
                this.siteData.addPageWithData('mainPage', {}, getPageStructure());
                this.siteData.addPageWithData('page2', {}, getPageStructure('page2-'));
                var siteDataWrapper = SiteDataAPI.createSiteDataAPIAndDal(this.siteData, _.noop);
                this.displayedJsonUpdater = siteDataWrapper.displayedJsonUpdater;
                this.pointers = siteDataWrapper.pointers;
                var viewerPrivateServices = {
                    siteDataAPI: siteDataWrapper.siteDataAPI,
                    pointers: siteDataWrapper.pointers,
                    displayedDAL: siteDataWrapper.displayedDal
                };
                this.site = factory.mockWixSiteReact(this.siteData, viewerPrivateServices);
                //this.siteAPI = new SiteAPI(this.site);
                this.siteAPI = factory.mockSiteAPI(this.siteData, this.site);
                this.siteAPI.setCurrentPage('mainPage');
            });

            describe('getActiveModes', function() {
                describe('when no modes were activated', function() {
                    it('should return an empty map', function() {
                        expect(this.siteAPI.getActiveModes(this.siteAPI)).toEqual({});
                    });
                });

                describe('when modes were activated', function() {
                    describe('and not deactivated', function() {
                        it('should return a map containing the activated modes', function() {
                            this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-x');

                            expect(this.siteAPI.getActiveModes()).toEqual({
                                'mainPage': {'mode-x': true}
                            });
                        });
                    });

                    describe('and deactivated', function() {
                        it('should return an empty map', function() {
                            this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-x');
                            this.siteAPI.deactivateModeById('comp1', 'mainPage', 'mode-x');

                            expect(this.siteAPI.getActiveModes()).toEqual({
                                'mainPage': {}
                            });
                        });
                    });
                });
            });

            describe('activateMode', function() {

                beforeEach(function() {
                    var pagePointer = this.pointers.components.getPage('mainPage', 'DESKTOP');
                    this.compPointer = this.pointers.components.getComponent('comp1', pagePointer);
                });

                describe('when mode was not activated before', function() {
                    it('should add the mode to the active modes map', function() {
                        this.siteAPI.activateMode(this.compPointer, 'mode-x');
                        this.siteAPI.activateMode(this.compPointer, 'mode-y');
                        this.siteAPI.activateMode(this.compPointer, 'mode-z');

                        expect(this.siteAPI.getActiveModes()).toEqual({
                            'mainPage': {'mode-x': true, 'mode-y': true, 'mode-z': true}
                        });
                    });
                });

                describe('when mode was activated before', function() {
                    it('should ignore the activation of the already active mode', function () {
                        this.siteAPI.activateMode(this.compPointer, 'mode-x');
                        this.siteAPI.activateMode(this.compPointer, 'mode-y');
                        this.siteAPI._site.forceUpdate.calls.reset();

                        this.siteAPI.activateMode(this.compPointer, 'mode-x');

                        expect(this.siteAPI.getActiveModes()).toEqual({
                            'mainPage': {'mode-x': true, 'mode-y': true}
                        });
                        expect(this.siteAPI._site.forceUpdate.calls.count()).toEqual(0);
                    });
                });

                describe('when component is animating', function () {
                    it('should not activate mode', function () {
                        spyOn(this.site, 'getComponentsByPageId').and.returnValue({
                            comp1: {isAnimating: true},
                            mainPage: {}
                        });

                        this.siteAPI.activateMode(this.compPointer, 'mode-x');

                        expect(this.siteAPI.getActiveModes()).toEqual({});
                    });
                });
            });

            describe('activateModeById', function() {
                describe('when mode was not activated before', function() {
                    it('should add the mode to the active modes map', function() {
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-x');
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-y');
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-z');

                        expect(this.siteAPI.getActiveModes()).toEqual({
                            'mainPage': {'mode-x': true, 'mode-y': true, 'mode-z': true}
                        });
                    });
                });

                describe('when mode was activated before', function() {
                    it('should ignore the activation of the already active mode', function() {
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-x');
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-y');

                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-x');

                        expect(this.siteAPI.getActiveModes()).toEqual({
                            'mainPage': {'mode-x': true, 'mode-y': true}
                        });
                    });

                    it('should not render', function(){
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-x');
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-y');
                        this.siteAPI._site.forceUpdate.calls.reset();

                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-x');

                        expect(this.siteAPI._site.forceUpdate.calls.count()).toEqual(0);
                    });
                });
            });

            describe('deactivateMode', function() {

                beforeEach(function() {
                    var pagePointer = this.pointers.components.getPage('mainPage', 'DESKTOP');
                    this.compPointer = this.pointers.components.getComponent('comp1', pagePointer);
                });

                describe('when mode is active', function() {
                    it('should remove it from the Active Modes map', function() {
                        var activeModesBefore = this.siteAPI.getActiveModes();
                        this.siteAPI.activateMode(this.compPointer, 'mode-y');

                        this.siteAPI.deactivateMode(this.compPointer, 'mode-y');

                        expect(this.siteAPI.getActiveModes()).toEqual({'mainPage': activeModesBefore});
                    });
                });

                describe('when mode is inactive', function() {
                    it('should not change the active modes map', function() {
                        this.siteAPI.activateMode(this.compPointer, 'mode-x');
                        this.siteAPI.activateMode(this.compPointer, 'mode-y');
                        this.siteAPI.deactivateMode(this.compPointer, 'mode-y');

                        var currentActiveModes = this.siteAPI.getActiveModes();
                        this.siteAPI.deactivateMode(this.compPointer, 'mode-y');

                        expect(this.siteAPI.getActiveModes()).toEqual(currentActiveModes);
                    });

                    it('should not render', function(){
                        this.siteAPI.activateMode(this.compPointer, 'mode-x');
                        this.siteAPI.activateMode(this.compPointer, 'mode-y');
                        this.siteAPI.deactivateMode(this.compPointer, 'mode-y');
                        this.siteAPI._site.forceUpdate.calls.reset();

                        this.siteAPI.deactivateMode(this.compPointer, 'mode-y');

                        expect(this.siteAPI._site.forceUpdate.calls.count()).toEqual(0);
                    });
                });
            });

            describe('deactivateModeById', function() {
                describe('when mode is active', function() {
                    it('should remove it from the Active Modes map', function() {
                        var activeModesBefore = this.siteAPI.getActiveModes();
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-y');

                        this.siteAPI.deactivateModeById('comp1', 'mainPage', 'mode-y');

                        expect(this.siteAPI.getActiveModes()).toEqual({'mainPage': activeModesBefore});
                    });
                });

                describe('when mode is inactive', function() {
                    it('should not change the active modes map', function() {
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-x');
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-y');
                        this.siteAPI.deactivateModeById('comp1', 'mainPage', 'mode-y');

                        var currentActiveModes = this.siteAPI.getActiveModes();
                        this.siteAPI.deactivateModeById('comp1', 'mainPage', 'mode-y');

                        expect(this.siteAPI.getActiveModes()).toEqual(currentActiveModes);
                    });

                    it('should not render', function() {
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-x');
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-y');
                        this.siteAPI.deactivateModeById('comp1', 'mainPage', 'mode-y');
                        this.siteAPI._site.forceUpdate.calls.reset();

                        this.siteAPI.deactivateModeById('comp1', 'mainPage', 'mode-y');

                        expect(this.siteAPI._site.forceUpdate.calls.count()).toEqual(0);
                    });
                });
            });

            describe('switch modes', function(){

                beforeEach(function() {
                    var pagePointer = this.pointers.components.getPage('mainPage', 'DESKTOP');
                    this.comp1Pointer = this.pointers.components.getComponent('comp1', pagePointer);
                });

                it('should render and replace modes', function(){
                    this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-y');
                    this.siteAPI.deactivateModeById('comp1', 'mainPage', 'mode-x');
                    this.siteAPI._site.forceUpdate.calls.reset();

                    this.siteAPI.switchModesByIds(this.comp1Pointer, 'mainPage', 'mode-y', 'mode-x');

                    var pageActiveModes = this.siteAPI.getActiveModes().mainPage;

                    expect(pageActiveModes['mode-y']).toBeFalsy();
                    expect(pageActiveModes['mode-x']).toBeTruthy();
                    expect(this.siteAPI._site.forceUpdate.calls.count()).toEqual(1);
                });

                it('should not render if mode to activate is already activated, and mode to deactivate is deactivated', function(){
                    this.siteAPI.activateModeById('comp1', 'mainPage', 'mode-y');
                    this.siteAPI.deactivateModeById('comp1', 'mainPage', 'mode-x');
                    this.siteAPI._site.forceUpdate.calls.reset();

                    this.siteAPI.switchModesByIds(this.comp1Pointer, 'mainPage', 'mode-x', 'mode-y');

                    var pageActiveModes = this.siteAPI.getActiveModes().mainPage;
                    expect(pageActiveModes['mode-x']).toBeFalsy();
                    expect(pageActiveModes['mode-y']).toBeTruthy();
                    expect(this.siteAPI._site.forceUpdate.calls.count()).toEqual(0);
                });
            });

            xdescribe('deactivateModesInPage', function() {
                beforeEach(function() {
                    for (var i = 1; i <= this.NUM_OF_ACTIVE_MODES_ON_PAGE; i++) {
                        this.siteAPI.activateModeById('comp' + i, 'mainPage', 'mode-' + i);
                        this.siteAPI.setCurrentPage('page2');
                        this.siteAPI.activateModeById('page2-comp' + i, 'page2', 'page2-mode-' + i);
                    }
                    this.activeModesBefore = this.siteAPI.getActiveModes();
                });

                it('should deactivate all modes in the page', function() {
                    this.siteAPI.deactivateModesInPage('page2');

                    var activeModes = this.siteAPI.getActiveModes();
                    expect(activeModes).not.toEqual(this.activeModesBefore);
                    expect(activeModes.page2).toBeEmpty();
                    expect(_.size(activeModes.mainPage)).toEqual(this.NUM_OF_ACTIVE_MODES_ON_PAGE);
                    expect(_.keys(activeModes.mainPage)).toEqual(['mode-1', 'mode-2', 'mode-3', 'mode-4']);
                });

                it('should perform a single render', function() {
                    this.siteAPI._site.forceUpdate.calls.reset();

                    this.siteAPI.deactivateModesInPage('page2');

                    expect(this.siteAPI._site.forceUpdate.calls.count()).toEqual(1);
                });

                it('should not render if no active modes on page', function(){
                    this.siteAPI._site.forceUpdate.calls.reset();

                    this.siteAPI.deactivateModesInPage('page2');
                    this.siteAPI.deactivateModesInPage('page2');

                    expect(this.siteAPI._site.forceUpdate.calls.count()).toEqual(1);
                });
            });

            describe('resetAllActiveModes', function() {
                describe('when there are active modes', function() {
                    it('should reset the map and remove all active modes', function() {
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode1');
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode2');
                        this.siteAPI.activateModeById('comp1', 'mainPage', 'mode3');

                        this.siteAPI.resetAllActiveModes();

                        expect(this.siteAPI.getActiveModes()).toEqual({mainPage: {}});
                    });
                });

                describe('when there are no active modes', function() {
                    it('should return an empty modes map', function() {
                        expect(this.siteAPI.getActiveModes()).toEqual({});

                        this.siteAPI.resetAllActiveModes();

                        expect(this.siteAPI.getActiveModes()).toEqual({});
                    });
                });
            });
        });

        describe('getRootIdsWhichShouldBeRendered', function(){
            beforeEach(function(){
                this.siteAPI = factory.mockSiteAPI(this.siteData, this.site);
            });
            it("should return empty array if nothing should be rendered (page is password protected)", function(){
                this.siteData.addPageWithData('page1', {
                    pageSecurity: {requireLogin: true}
                });
                this.siteAPI.setCurrentPage('page1');
                this.site.refs = {};

                expect(this.siteAPI.getRootIdsWhichShouldBeRendered()).toEqual([]);
            });


            it("should return master page and primary even if not rendered YET, but according to site they should be", function(){
                this.siteData.addPageWithDefaults('page1');
                this.siteAPI.setCurrentPage('page1');
                this.site.refs = {};

                expect(this.siteAPI.getRootIdsWhichShouldBeRendered()).toEqual(['masterPage', 'page1']);
            });

        });

        describe('getAllRenderedRootIds', function(){
            beforeEach(function(){
                this.siteAPI = factory.mockSiteAPI(this.siteData, this.site);
            });
            it("should return empty array if nothing is rendered (page is password protected)", function(){
                this.siteData.addPageWithData('page1', {
                    pageSecurity: {requireLogin: true}
                });
                this.siteAPI.setCurrentPage('page1');
                this.site.refs = {};

                expect(this.siteAPI.getAllRenderedRootIds()).toEqual([]);
            });

            it("should return master page and primary page", function(){
                this.siteData.addPageWithDefaults('page1');
                this.siteAPI.setCurrentPage('page1');

                expect(this.siteAPI.getAllRenderedRootIds()).toEqual(['masterPage', 'page1']);
            });

            it("should NOT return master page and primary if not rendered YET", function(){
                this.siteData.addPageWithDefaults('page1');
                this.siteAPI.setCurrentPage('page1');
                this.site.refs = {};

                expect(this.siteAPI.getAllRenderedRootIds()).toEqual([]);
            });

            //TODO: Alissa add tests for the popup case
            xit("should return master page, primary page and popup page if popup opened", function(){
                this.siteData.addPageWithDefaults('page1');
                this.siteAPI.setCurrentPage('page1');
                this.siteData.addPageWithData('popup1', {isPopup: true});

                expect(this.siteAPI.getAllRenderedRootIds()).toEqual(['masterPage', 'page1', 'popup1']);
            });
        });

        it('scrollToAnchor', function() {
           var anchorQuery = 'dataItem-123';
           spyOn(utils.scrollAnchors, 'calcAnchorScrollToPosition');
           spyOn(this.siteAPI._site, 'scrollToAnchor');
           this.siteAPI.scrollToAnchor(anchorQuery);
           expect(utils.scrollAnchors.calcAnchorScrollToPosition).toHaveBeenCalledWith(anchorQuery, this.siteAPI);
        });

        //TODO: Alissa implement
        describe("getComponentsByPageId", function(){
            it("it should return null if page does not exist", function(){

            });

            it("should return comps for masterPage", function(){

            });

            it("should return comps for primary page", function(){

            });

            it("should return comps for popup page", function(){

            });
        });

        describe('set page metadata', function(){
            var pageData;
            beforeEach(function(){
                this.siteAPI = factory.mockSiteAPI(this.siteData, this.site);

                pageData = {};
                this.siteDataMock = {
                    getDataByQuery: function() {return pageData;},
                    getCurrentUrlPageId: jasmine.createSpy('getCurrentUrlPageId').and.returnValue('currentPage')
                };

                spyOn(this.siteAPI, 'getSiteData').and.returnValue(this.siteDataMock);
            });
            it("should update page title", function(){
                this.siteAPI.setPageTitle('title', 'description', 'titleSEO');

                expect(pageData.title).toEqual('title');
                expect(pageData.descriptionSEO).toEqual('description');
                expect(pageData.pageTitleSEO).toEqual('titleSEO');
            });

            it("should update run time page title", function(){
                spyOn(this.siteAPI, 'getRuntimeDal').and.returnValue({_siteData: this.siteDataMock});

                this.siteAPI.setRunTimePageTitle('title', 'description');

                expect(pageData.title).toEqual('title');
                expect(pageData.descriptionSEO).toEqual('description');
            });

            it("should update page metaKeywordsSEO", function(){
                this.siteAPI.setPageMetaKeywords('key1, key2');

                expect(pageData.metaKeywordsSEO).toEqual('key1, key2');
            });

            it("should update page Meta OgTags", function(){
                this.siteAPI.setPageMetaOgTags([{'property': 'og:image', 'content': 'aaa.jpg'}]);

                expect(pageData.metaOgTags).toEqual([{'property': 'og:image', 'content': 'aaa.jpg'}]);
            });
        });

        describe('setUserSession', function () {

            beforeEach(function () {
                spyOn(utils.cookieUtils, 'deleteCookie');
                spyOn(utils.cookieUtils, 'setCookie');
                spyOn(this.siteData, 'pubSvSession');
                this.siteData.svSession = '123';
            });

            it('should update cookie and call pubSvSession with new svSession', function () {
                this.siteAPI.setUserSession('abc');

                expect(this.siteData.pubSvSession).toHaveBeenCalledWith('abc');
                expect(utils.cookieUtils.deleteCookie).toHaveBeenCalledWith('svSession', undefined, 'mockExternalBaseUrl');
                expect(utils.cookieUtils.setCookie).toHaveBeenCalledWith('svSession', 'abc', null, undefined, 'mockExternalBaseUrl');
            });

            it('should notify listeners on svSession change with new session', function () {
                var comp1 = {
                    id: 'comp1',
                    sendPostMessage: jasmine.createSpy('sendPostMessage')
                };
                this.site.siteAspects.svSessionChangeEvent._registeredComps.comp1 = comp1;

                this.siteAPI.setUserSession('abc');

                expect(comp1.sendPostMessage).toHaveBeenCalledWith({
                    intent: 'addEventListener',
                    eventType: 'SESSION_CHANGED',
                    params: {
                        userSession: 'abc'
                    }
                });
            });

        });

        describe('getControllerStageData', function () {
            it('should return controllerStageData of given appId, controller type and controller state', function () {
                var appId = 'appId';
                var controllerState = 'state';
                var controllerType = 'type';
                var data = {some: 'data'};
                var controllerStageData = testUtils.mockFactory.platformMocks.controllerStageData(controllerType, controllerState, data);
                this.siteData.addControllerStageData(controllerStageData, appId);
                expect(this.siteAPI.getControllerStageData(appId, controllerType, controllerState)).toEqual(data);
            });
        });

        describe('getControllerState', function () {
            it('should return the appState of a given controller', function () {
                var controllerId = 'controllerId';
                var controllerState = 'state';
                this.siteData.addControllerToStateMap(controllerId, controllerState);
                expect(this.siteAPI.getControllerState(controllerId)).toEqual(controllerState);
            });

            it('should return default state if the controller state is not defined in appState', function () {
                expect(this.siteAPI.getControllerState('controllerId')).toEqual('default');
            });
        });
    });
});
