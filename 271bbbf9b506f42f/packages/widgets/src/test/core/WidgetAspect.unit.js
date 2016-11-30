define([
        'lodash',
        'testUtils',
        'utils',
        'widgets/core/widgetService'
    ],
    function (_, /** testUtils */ testUtils, utils, widgetService) {
        'use strict';

        describe('WidgetAspect', function () {
            function fakeSiteRender(aspectSiteAPI) {
                aspectSiteAPI._site.notifyAspects(aspectSiteAPI._site.supportedEvents.willMount);
                aspectSiteAPI._site.notifyAspects(aspectSiteAPI._site.supportedEvents.willUpdate);
            }

            it('should register widgetHandler', function(){
                this.siteAPI = testUtils.mockFactory.mockSiteAPI();
                var aspect = this.siteAPI.getSiteAspect('WidgetAspect');

                expect(aspect.getWidgetHandler()).toBeDefined();
            });

            describe('handleRuntimeDalCompChange', function(){
                var aspect;
                beforeEach(function(){
                    this.anotherPageId = 'somePageId';
                    this.mockSiteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(this.anotherPageId);
                    this.pageId = this.mockSiteData.getCurrentUrlPageId();
                    this.siteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                    aspect = this.siteAPI.getSiteAspect('WidgetAspect');
                });

                describe('change types', function() {
                    it('should notify the handler on changes from runtimeDal', function() {
                        var compId = 'testCompId';
                        var handler = aspect.getWidgetHandler();
                        spyOn(handler, 'handleWidgetUpdate').and.callThrough();
                        testUtils.mockFactory.mockComponent('compTypeA', this.mockSiteData, this.pageId, null, false, compId);

                        var testCases = [
                            {runtimeDalMethod: 'setCompData', valueKey: 'data'},
                            {runtimeDalMethod: 'setCompProps', valueKey: 'data'},
                            {runtimeDalMethod: 'setCompData', valueKey: 'data'},
                            {runtimeDalMethod: 'updateCompLayout', valueKey: 'layout'}
                        ];

                        _.forEach(testCases, function(testCase) {
                            this.siteAPI.getRuntimeDal()[testCase.runtimeDalMethod](compId, {key: 'new value'});
                            var expectedUpdates = {testCompId: {}};
                            expectedUpdates.testCompId[testCase.valueKey] = {key: 'new value'};
                            expect(handler.handleWidgetUpdate).toHaveBeenCalledWith(expectedUpdates);
                        }, this);
                    });
                });

                it('should notify the handler on change - component is under an active root', function(){
                    var compIdA = 'compIdA', compIdB = 'compIdB';
                    testUtils.mockFactory.mockComponent('compTypeA', this.mockSiteData, this.pageId, null, false, compIdA);
                    testUtils.mockFactory.mockComponent('compTypeA', this.mockSiteData, this.pageId, null, false, compIdB);
                    var widgetHandler = aspect.getWidgetHandler();
                    spyOn(widgetHandler, 'handleWidgetUpdate');

                    this.siteAPI.getRuntimeDal().setCompState(compIdA, {currentSlide: 0});
                    var expectedUpdates = {};
                    expectedUpdates[compIdA] = {state: {currentSlide: 0}};

                    expect(widgetHandler.handleWidgetUpdate).toHaveBeenCalledWith(expectedUpdates);
                });

                it('should notify the handler on change - component is not under any active root', function(){
                    var compId = 'compIdA';
                    testUtils.mockFactory.mockComponent('compTypeA', this.mockSiteData, this.anotherPageId, null, false, compId);
                    var widgetHandler = aspect.getWidgetHandler();
                    spyOn(widgetHandler, 'handleWidgetUpdate');

                    this.siteAPI.getRuntimeDal().setCompState(compId, {currentSlide: 0});
                    var expectedUpdates = {};
                    expectedUpdates[compId] = {state: {currentSlide: 0}};

                    expect(widgetHandler.handleWidgetUpdate).toHaveBeenCalledWith(expectedUpdates);
                });
            });

            describe('when changing modes (handleDisplayedJsonUpdates)', function() {

                beforeEach(function() {
                    testUtils.experimentHelper.openExperiments('sv_hoverBox');

                    this.testPageId = 'testPageId';
                    this.testContainerId = 'containerWithModes';
                    this.testButtonId = 'buttonWithModeOverrides';
                    this.testPhotoId = 'photoWithModeOverrides';
                    this.notRelatedButtonId = 'notRelatedButton';
                    this.testModeId = 'testModeId';
                    this.fullSiteData = testUtils.mockFactory.mockSiteData()
                        .addPageWithDefaults(this.testPageId)
                        .setCurrentPage(this.testPageId)
                        .setPageComponents([
                            testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton', null, this.notRelatedButtonId),
                            testUtils.mockFactory.createStructure('mobile.core.components.Container', {
                                modes: {definitions: [{modeId: this.testModeId}]},
                                components: [
                                    testUtils.mockFactory.createStructure('wysiwyg.viewer.components.SiteButton', {
                                        layout: {testParam: 'original'},
                                        modes: {
                                            overrides: [{
                                                modeIds: [this.testModeId],
                                                layout: {testParam: 'override'}
                                            }]
                                        }
                                    }, this.testButtonId),
                                    testUtils.mockFactory.createStructure('wysiwyg.viewer.components.WPhoto', {
                                        layout: {testParam: 'original'},
                                        modes: {
                                            overrides: [{
                                                modeIds: [this.testModeId],
                                                layout: {testParam: 'override'},
                                                isHiddenByModes: true
                                            }]
                                        }
                                    }, this.testPhotoId)
                                ]}, this.testContainerId)
                        ], this.testPageId);

                    this.fullSiteData.setRootNavigationInfo({pageId: this.testPageId});
                    this.site = testUtils.mockFactory.mockWixSiteReactFromFullJson(this.fullSiteData);
                    this.siteAPI = this.site.siteAPI;
                    this.runtimeDal = this.siteAPI.getRuntimeDal();
                    this.aspect = this.siteAPI.getSiteAspect('WidgetAspect');
                    this.handler = this.aspect.getWidgetHandler();
                });

                it('should send an updated model for all components that relate to the mode change', function() {
                    spyOn(this.handler, 'handleWidgetUpdate');

                    this.handler.handleWidgetUpdate.calls.reset();
                    this.siteAPI.activateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    var expectedUpdates = {};
                    expectedUpdates[this.testContainerId] = utils.widgetModel.getCompModel(this.runtimeDal, this.testContainerId);
                    expectedUpdates[this.testButtonId] = _.merge({}, utils.widgetModel.getCompModel(this.runtimeDal, this.testButtonId), {layout: {testParam: 'override'}});
                    expectedUpdates[this.testPhotoId] = utils.widgetModel.getCompModel(this.runtimeDal, this.testPhotoId); // not displayed in test mode
                    expect(this.handler.handleWidgetUpdate.calls.count()).toEqual(1);
                    expect(this.handler.handleWidgetUpdate).toHaveBeenCalledWith(expectedUpdates);

                    this.handler.handleWidgetUpdate.calls.reset();
                    this.siteAPI.deactivateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    expectedUpdates = {};
                    expectedUpdates[this.testContainerId] = utils.widgetModel.getCompModel(this.runtimeDal, this.testContainerId);
                    expectedUpdates[this.testButtonId] = _.merge({}, utils.widgetModel.getCompModel(this.runtimeDal, this.testButtonId), {layout: {testParam: 'original'}});
                    expectedUpdates[this.testPhotoId] = _.merge({}, utils.widgetModel.getCompModel(this.runtimeDal, this.testPhotoId), {layout: {testParam: 'original'}});
                    expect(this.handler.handleWidgetUpdate.calls.count()).toEqual(1);
                    expect(this.handler.handleWidgetUpdate).toHaveBeenCalledWith(expectedUpdates);
                });

                it('should notify handler once for each mode change', function() {
                    spyOn(this.handler, 'handleWidgetUpdate');

                    this.handler.handleWidgetUpdate.calls.reset();
                    this.siteAPI.activateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    expect(this.handler.handleWidgetUpdate.calls.count()).toEqual(1);
                    expect(this.handler.handleWidgetUpdate).toHaveBeenCalledWith(jasmine.any(Object));

                    this.handler.handleWidgetUpdate.calls.reset();
                    this.siteAPI.deactivateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    expect(this.handler.handleWidgetUpdate.calls.count()).toEqual(1);
                    expect(this.handler.handleWidgetUpdate).toHaveBeenCalledWith(jasmine.any(Object));
                });

                it('should not send an updated model for a component that is not part of the mode change', function() {
                    spyOn(this.handler, 'handleWidgetUpdate').and.callThrough();

                    this.handler.handleWidgetUpdate.calls.reset();
                    this.siteAPI.activateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    var compIdsInUpdateNotification = _.keys(this.handler.handleWidgetUpdate.calls.argsFor(0)[0]);
                    expect(compIdsInUpdateNotification).not.toContain(this.notRelatedButtonId);

                    this.handler.handleWidgetUpdate.calls.reset();
                    this.siteAPI.deactivateModeById(this.testContainerId, this.testPageId, this.testModeId);
                    compIdsInUpdateNotification = _.keys(this.handler.handleWidgetUpdate.calls.argsFor(0)[0]);
                    expect(compIdsInUpdateNotification).not.toContain(this.notRelatedButtonId);
                });
            });

            describe('updateSite', function() {
                it('should call forceUpdate after animation frame', function (done) {
                    var siteAPI = testUtils.mockFactory.mockSiteAPI();
                    var widgetAspect = siteAPI.getSiteAspect('WidgetAspect');
                    var site = siteAPI.getSite();

                    spyOn(utils.animationFrame, 'request').and.callFake(function (callback) {
                        setTimeout(function () {
                            callback();
                            expect(site.forceUpdate).toHaveBeenCalled();
                            done();
                        }, 0);
                    });

                    widgetAspect.updateSite();
                });

                it('should call forceUpdate w/ the given callback', function (done) {
                    var siteAPI = testUtils.mockFactory.mockSiteAPI();
                    var widgetAspect = siteAPI.getSiteAspect('WidgetAspect');
                    var site = siteAPI.getSite();
                    var cb = _.noop;

                    spyOn(utils.animationFrame, 'request').and.callFake(function (callback) {
                        setTimeout(function () {
                            callback();
                            expect(site.forceUpdate).toHaveBeenCalledWith(cb);
                            done();
                        }, 0);
                    });

                    widgetAspect.updateSite(cb);
                });

                it('should not call forceUpdate twice in the same animation frame', function () {
                    var siteAPI = testUtils.mockFactory.mockSiteAPI();
                    var widgetAspect = siteAPI.getSiteAspect('WidgetAspect');

                    spyOn(utils.animationFrame, 'request');

                    widgetAspect.updateSite();
                    widgetAspect.updateSite();

                    expect(utils.animationFrame.request.calls.count()).toEqual(1);
                });
            });

            describe('when site is mounted', function () {
                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments('sv_platform1');
                    this.mockSiteData = testUtils.mockFactory.mockSiteData();
                    this.aspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(this.mockSiteData);
                    this.widgetAspect = this.aspectSiteAPI.getSiteAspect('WidgetAspect');
                    this.handler = this.widgetAspect.getWidgetHandler();
                });

                describe('when initWixCode render flag is on', function () {

                    beforeEach(function () {
                        this.mockSiteData.toggleRenderFlag('initWixCode', true);
                    });

                    describe('when there are installed apps', function () {
                        beforeEach(function () {
                            this.mockSiteData.updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
                        });

                        describe('when apps in rendered roots were loaded but not started', function(){
                            beforeEach(function(){
                                this.rootId = this.mockSiteData.getCurrentUrlPageId();
                                this.widgetAspect.loadApps([this.rootId]);
                            });
                            it('should start but not load and init apps', function () {
                                spyOn(this.handler, 'loadWidgets').and.callThrough();
                                spyOn(this.handler, 'initWidgets').and.callThrough();
                                spyOn(this.handler, 'startWidgets').and.callThrough();

                                this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willMount);

                                expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                                expect(this.handler.initWidgets).not.toHaveBeenCalled();
                                expect(this.handler.startWidgets).toHaveBeenCalledWith([this.rootId]);
                            });
                        });

                        describe("when apps in rendered roots haven't been loaded", function(){
                            it("should load, init and start apps", function () {
                                _.forEach(this.mockSiteData.getAllPossiblyRenderedRoots(), function (rootId) {
                                    this.mockSiteData.setPagePlatformApp(rootId, 'wixCode', true);
                                }, this);
                                var rootId = this.mockSiteData.getCurrentUrlPageId();
                                testUtils.mockFactory.mockComponent('platform.components.AppController', this.mockSiteData, rootId);
                                spyOn(this.handler, 'loadWidgets').and.callThrough();
                                spyOn(this.handler, 'initWidgets').and.callThrough();
                                spyOn(this.handler, 'startWidgets').and.callThrough();
                                var rootTitle = this.mockSiteData.getPageData(rootId).title;
                                var expectedLoadData = [
                                    testUtils.mockFactory.widgetMocks.messages.mockLoadDataBindingInfo(this.mockSiteData),
                                    testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Page', rootId, rootTitle),
                                    testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('masterPage', rootId)
                                ];
                                var expectedControllersData = _.zipObject([rootId], [widgetService.getControllersToInit(this.mockSiteData, rootId)]);

                                this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willMount);

                                expect(this.handler.loadWidgets).toHaveBeenCalledWith(expectedLoadData, [rootId]);
                                expect(this.handler.initWidgets).toHaveBeenCalledWith(expectedControllersData);
                                expect(this.handler.startWidgets).toHaveBeenCalledWith([rootId]);
                            });
                        });
                    });

                    describe('when there are no installed apps', function(){
                        it('should not load, init and start', function () {
                            spyOn(this.handler, 'loadWidgets').and.callThrough();
                            spyOn(this.handler, 'initWidgets').and.callThrough();
                            spyOn(this.handler, 'startWidgets').and.callThrough();

                            this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willMount);

                            expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                            expect(this.handler.initWidgets).not.toHaveBeenCalled();
                            expect(this.handler.startWidgets).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('when initWixCode render flag is off', function(){
                    beforeEach(function(){
                        this.mockSiteData
                            .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                            .toggleRenderFlag('initWixCode', false);
                    });
                    it('should not load, init and start', function () {
                        spyOn(this.handler, 'loadWidgets').and.callThrough();
                        spyOn(this.handler, 'initWidgets').and.callThrough();
                        spyOn(this.handler, 'startWidgets').and.callThrough();

                        this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willMount);

                        expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                        expect(this.handler.initWidgets).not.toHaveBeenCalled();
                        expect(this.handler.startWidgets).not.toHaveBeenCalled();
                    });
                });
            });

            describe('then site is updated', function () {

                beforeEach(function () {
                    testUtils.experimentHelper.openExperiments('sv_platform1');
                    this.newPageId = 'anotherPageId';
                    this.mockSiteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults(this.newPageId);
                    this.aspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(this.mockSiteData);
                    this.widgetAspect = this.aspectSiteAPI.getSiteAspect('WidgetAspect');
                    this.handler = this.widgetAspect.getWidgetHandler();
                });

                describe('when initWixCode render flag is on', function () {

                    beforeEach(function () {
                        this.mockSiteData.toggleRenderFlag('initWixCode', true);
                    });

                    describe('when there are installed apps', function () {
                        beforeEach(function () {
                            this.mockSiteData.updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
                        });

                        it('should stop apps that were loaded in roots that are not rendered on page change', function () {
                            var rootId = this.mockSiteData.getCurrentUrlPageId();
                            this.widgetAspect.loadApps([rootId]);
                            this.mockSiteData.setCurrentPage(this.newPageId);
                            spyOn(this.handler, 'stopWidgets').and.callThrough();

                            this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                            expect(this.handler.stopWidgets).toHaveBeenCalledWith([rootId]);
                        });

                        it('should stop apps in popup only when closing popup', function(){
                            var popupId = 'somePopupId';
                            this.mockSiteData.addPopupPageWithDefaults(popupId);
                            var rootId = this.mockSiteData.getCurrentUrlPageId();
                            this.widgetAspect.loadApps([rootId]);
                            this.mockSiteData.setCurrentPage(popupId);
                            this.widgetAspect.loadApps([popupId]);
                            this.mockSiteData.setCurrentPage(rootId, null, true);
                            spyOn(this.handler, 'stopWidgets').and.callThrough();

                            this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                            expect(this.handler.stopWidgets).toHaveBeenCalledWith([popupId]);
                        });

                        it('should not load again apps in primary page after closing popup', function(){
                            var popupId = 'somePopupId';
                            this.mockSiteData.addPopupPageWithDefaults(popupId);
                            var rootId = this.mockSiteData.getCurrentUrlPageId();
                            this.widgetAspect.loadApps([rootId]);
                            this.mockSiteData.setCurrentPage(popupId);
                            this.widgetAspect.loadApps([popupId]);
                            this.mockSiteData.setCurrentPage(rootId, null, true);
                            spyOn(this.handler, 'loadWidgets').and.callThrough();

                            this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                            expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                        });

                        it('should not call stop if no apps in non rendered roots were loaded', function () {
                            spyOn(this.handler, 'stopWidgets').and.callThrough();

                            this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                            expect(this.handler.stopWidgets).not.toHaveBeenCalled();
                        });

                        describe('when apps in rendered roots were loaded but not started', function(){

                            it('should start but not load and init apps', function () {
                                var rootId = this.mockSiteData.getCurrentUrlPageId();
                                this.widgetAspect.loadApps([rootId]);
                                spyOn(this.handler, 'loadWidgets').and.callThrough();
                                spyOn(this.handler, 'initWidgets').and.callThrough();
                                spyOn(this.handler, 'startWidgets').and.callThrough();

                                this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                                expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                                expect(this.handler.initWidgets).not.toHaveBeenCalled();
                                expect(this.handler.startWidgets).toHaveBeenCalledWith([rootId]);
                            });
                        });

                        describe('when apps in rendered roots were loaded and started', function(){
                            beforeEach(function(){
                                this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willMount);
                            });

                            it('should not load, init and start apps', function () {
                                spyOn(this.handler, 'loadWidgets').and.callThrough();
                                spyOn(this.handler, 'initWidgets').and.callThrough();
                                spyOn(this.handler, 'startWidgets').and.callThrough();

                                this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                                expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                                expect(this.handler.initWidgets).not.toHaveBeenCalled();
                                expect(this.handler.startWidgets).not.toHaveBeenCalled();
                            });
                        });

                        describe("when apps in rendered roots haven't been loaded", function(){
                            it('should load, init and start apps', function () {
                                _.forEach(this.mockSiteData.getAllPossiblyRenderedRoots(), function (rootId) {
                                    this.mockSiteData.setPagePlatformApp(rootId, 'wixCode', true);
                                }, this);
                                var rootId = this.mockSiteData.getCurrentUrlPageId();
                                testUtils.mockFactory.mockComponent('platform.components.AppController', this.mockSiteData, rootId);
                                spyOn(this.handler, 'loadWidgets').and.callThrough();
                                spyOn(this.handler, 'initWidgets').and.callThrough();
                                spyOn(this.handler, 'startWidgets').and.callThrough();
                                var rootTitle = this.mockSiteData.getPageData(rootId).title;
                                var expectedLoadData = [
                                    testUtils.mockFactory.widgetMocks.messages.mockLoadDataBindingInfo(this.mockSiteData),
                                    testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Page', rootId, rootTitle),
                                    testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('masterPage', rootId)
                                ];
                                var expectedControllersData = _.zipObject([rootId], [widgetService.getControllersToInit(this.mockSiteData, rootId)]);

                                this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                                expect(this.handler.loadWidgets).toHaveBeenCalledWith(expectedLoadData, [rootId]);
                                expect(this.handler.initWidgets).toHaveBeenCalledWith(expectedControllersData);
                                expect(this.handler.startWidgets).toHaveBeenCalledWith([rootId]);
                            });
                        });
                    });

                    describe('when there are no apps installed', function () {
                        it('should not load, init and start', function () {
                            spyOn(this.handler, 'loadWidgets').and.callThrough();
                            spyOn(this.handler, 'initWidgets').and.callThrough();
                            spyOn(this.handler, 'startWidgets').and.callThrough();

                            this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                            expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                            expect(this.handler.initWidgets).not.toHaveBeenCalled();
                            expect(this.handler.startWidgets).not.toHaveBeenCalled();
                        });

                        it('should not stop', function () {
                            spyOn(this.handler, 'stopWidgets').and.callThrough();

                            this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                            expect(this.handler.stopWidgets).not.toHaveBeenCalled();
                        });

                        it('should not reset runtimeDal', function(){
                            var runtimeDal = this.aspectSiteAPI.getRuntimeDal();
                            spyOn(runtimeDal, 'reset').and.callThrough();

                            this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                            expect(runtimeDal.reset).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('when initWixCode render flag is off', function () {

                    beforeEach(function () {
                        this.mockSiteData.updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
                    });

                    it('should not load, init and start', function () {
                        this.mockSiteData.toggleRenderFlag('initWixCode', false);
                        spyOn(this.handler, 'loadWidgets').and.callThrough();
                        spyOn(this.handler, 'initWidgets').and.callThrough();
                        spyOn(this.handler, 'startWidgets').and.callThrough();

                        this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                        expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                        expect(this.handler.initWidgets).not.toHaveBeenCalled();
                        expect(this.handler.startWidgets).not.toHaveBeenCalled();
                    });

                    it('should stop all apps in the rendered roots that were already loaded', function () {
                        var rootId = this.mockSiteData.getCurrentUrlPageId();
                        this.widgetAspect.loadApps([rootId]);
                        this.mockSiteData.toggleRenderFlag('initWixCode', false);
                        spyOn(this.handler, 'stopWidgets').and.callThrough();

                        this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                        expect(this.handler.stopWidgets).toHaveBeenCalledWith([rootId]);
                    });

                    it('should not stop if no apps were loaded', function () {
                        this.mockSiteData.toggleRenderFlag('initWixCode', false);
                        spyOn(this.handler, 'stopWidgets').and.callThrough();

                        this.aspectSiteAPI._site.notifyAspects(this.aspectSiteAPI._site.supportedEvents.willUpdate);

                        expect(this.handler.stopWidgets).not.toHaveBeenCalled();
                    });
                });
            });

            describe('isContextReady', function() {
                beforeEach(function(){
                    testUtils.experimentHelper.openExperiments('sv_platform1');
                });

                it('should return false if there are active roots but no root is ready', function() {
                    var siteData = testUtils.mockFactory.mockSiteData()
                        .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
                    var aspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(siteData);
                    var widgetAspect = aspectSiteAPI.getSiteAspect('WidgetAspect');
                    var contextId = 'currentPage';

                    fakeSiteRender(aspectSiteAPI);

                    expect(widgetAspect.isContextReady(contextId)).toEqual(false);
                });

                it('should return true if all active widgets are ready', function() {
                    var mockSiteData = testUtils.mockFactory.mockSiteData()
                        .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
                    var aspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(mockSiteData);
                    var widgetAspect = aspectSiteAPI.getSiteAspect('WidgetAspect');
                    var contextId = 'currentPage';
                    var widgetHandler = widgetAspect.getWidgetHandler();
                    spyOn(widgetHandler, 'isWidgetReady').and.returnValue(true);

                    fakeSiteRender(aspectSiteAPI);

                    expect(widgetAspect.isContextReady(contextId)).toEqual(true);
                });

                it('should return false if root is active but not ready', function() {
                    var mockSiteData = testUtils.mockFactory.mockSiteData()
                        .addPopupPageWithDefaults('popupId')
                        .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                        .setCurrentPage('popupId');
                    var aspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(mockSiteData);
                    var widgetAspect = aspectSiteAPI.getSiteAspect('WidgetAspect');
                    var widgetHandler = widgetAspect.getWidgetHandler();

                    fakeSiteRender(aspectSiteAPI);

                    spyOn(widgetHandler, 'isWidgetReady').and.callFake(function(rootId){
                        return rootId === 'currentPage';
                    });

                    expect(widgetAspect.isContextReady('popupId')).toEqual(false);
                });

                describe('for master page', function() {
                    it('should return false if there are no active roots', function() {
                        var siteData = testUtils.mockFactory.mockSiteData()
                            .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());

                        var aspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(siteData);
                        var widgetAspect = aspectSiteAPI.getSiteAspect('WidgetAspect');
                        var widgetHandler = widgetAspect.getWidgetHandler();

                        fakeSiteRender(aspectSiteAPI);

                        spyOn(widgetHandler, 'isWidgetReady').and.returnValue(false);

                        expect(widgetAspect.isContextReady('masterPage')).toEqual(false);
                    });

                    it('should return false if the only active root is a popup page', function(){
                        var popupId = 'popupId';
                        var mockSiteData = testUtils.mockFactory.mockSiteData()
                            .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                            .addPopupPageWithDefaults(popupId)
                            .setCurrentPage(popupId);
                        var aspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(mockSiteData);
                        var widgetAspect = aspectSiteAPI.getSiteAspect('WidgetAspect');
                        var widgetHandler = widgetAspect.getWidgetHandler();
                        spyOn(widgetHandler, 'isWidgetReady').and.callFake(function(rootId){
                            return rootId === popupId;
                        });

                        fakeSiteRender(aspectSiteAPI);

                        expect(widgetAspect.isContextReady('masterPage')).toEqual(false);
                    });

                    it('should return true if a regular page is active', function() {
                        var popupId = 'popupId';
                        var mockSiteData = testUtils.mockFactory.mockSiteData()
                            .addPopupPageWithDefaults(popupId);
                        var aspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(mockSiteData);
                        var widgetAspect = aspectSiteAPI.getSiteAspect('WidgetAspect');
                        var widgetHandler = widgetAspect.getWidgetHandler();
                        var regularPageId = mockSiteData.getCurrentUrlPageId();
                        mockSiteData.setCurrentPage(popupId);
                        widgetHandler.startWidgets([regularPageId, popupId]);
                        spyOn(widgetHandler, 'isWidgetReady').and.callFake(function(rootId){
                            return rootId === regularPageId;
                        });

                        fakeSiteRender(aspectSiteAPI);

                        expect(widgetAspect.isContextReady('masterPage')).toEqual(true);
                    });

                    it('should return true if there are no active widgets', function(){
                        var aspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI();
                        var widgetAspect = aspectSiteAPI.getSiteAspect('WidgetAspect');

                        // site did not yet render so no widgets are active

                        expect(widgetAspect.isContextReady('currentPage')).toEqual(true);
                    });
                });
            });

            describe('allContextsReady', function () {
                beforeEach(function(){
                    testUtils.experimentHelper.openExperiments('sv_platform1');
                });

                it('should return false if there is active roots but no root is ready', function () {
                    var siteData = testUtils.mockFactory.mockSiteData()
                        .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
                    var aspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(siteData);
                    var widgetAspect = aspectSiteAPI.getSiteAspect('WidgetAspect');

                    fakeSiteRender(aspectSiteAPI);

                    expect(widgetAspect.allContextsReady()).toBe(false);
                });

                it('should return true if all active widgets are ready', function () {
                    var mockSiteData = testUtils.mockFactory.mockSiteData()
                        .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
                    var aspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(mockSiteData);
                    var widgetAspect = aspectSiteAPI.getSiteAspect('WidgetAspect');
                    var widgetHandler = widgetAspect.getWidgetHandler();
                    spyOn(widgetHandler, 'isWidgetReady').and.returnValue(true);

                    fakeSiteRender(aspectSiteAPI);

                    expect(widgetAspect.allContextsReady()).toEqual(true);
                });

                it("should return false if there is active root but it's not ready", function() {
	                var popupId = 'popupId';
                    var mockSiteData = testUtils.mockFactory.mockSiteData()
                        .addPopupPageWithDefaults(popupId)
                        .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode())
                        .setCurrentPage(popupId);
                    var aspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(mockSiteData);
                    var widgetAspect = aspectSiteAPI.getSiteAspect('WidgetAspect');
                    var widgetHandler = widgetAspect.getWidgetHandler();

                    fakeSiteRender(aspectSiteAPI);

                    spyOn(widgetHandler, 'isWidgetReady').and.callFake(function(rootId){
                        if (rootId === 'currentPage') {
                            return true;
                        } else if (rootId === popupId) {
                            return false;
                        }
                    });

                    expect(widgetAspect.allContextsReady()).toEqual(false);
                });
            });

            describe('initApps', function(){
                var controllerCompType = 'platform.components.AppController';

                beforeEach(function(){
                    testUtils.experimentHelper.openExperiments('connectionsData');
                    this.anotherPageId = 'somePageId';
	                var clientSpecMapMocks = testUtils.mockFactory.clientSpecMapMocks;
                    this.mockSiteData = testUtils.mockFactory.mockSiteData()
                        .updateClientSpecMap(clientSpecMapMocks.wixCode())
                        .updateClientSpecMap(clientSpecMapMocks.hybridApp(clientSpecMapMocks.ecommerce()))
                        .updateClientSpecMap(clientSpecMapMocks.hybridApp(clientSpecMapMocks.tpa()))
                        .addPageWithDefaults(this.anotherPageId);
                    this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData);
                    this.pageId = this.mockSiteData.getFocusedRootId();
                    this.aspect = this.mockSiteAPI.getSiteAspect('WidgetAspect');
                });
                it('should not call init if there are no controllers on the passed root id', function(){
                    var handler = this.aspect.getWidgetHandler();
                    spyOn(handler, 'initWidgets').and.callThrough();

                    this.aspect.initApps([this.anotherPageId]);

                    expect(handler.initWidgets).not.toHaveBeenCalled();
                });

                describe('When a single app has 2 controllers on the current root', function(){
                    var compType = 'wysiwyg.viewer.components.WPhoto';
                    beforeEach(function(){
                        this.controllerAData = testUtils.mockFactory.dataMocks.controllerData({applicationId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10', id: 'someId'});
                        this.controllerA = testUtils.mockFactory.mockComponent(controllerCompType, this.mockSiteData, this.pageId, {data: this.controllerAData});
                        this.controllerBData = testUtils.mockFactory.dataMocks.controllerData({applicationId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10', id: 'anotherId'});
                        this.controllerB = testUtils.mockFactory.mockComponent(controllerCompType, this.mockSiteData, this.pageId, {data: this.controllerBData});
                        this.handler = this.aspect.getWidgetHandler();
                        spyOn(this.handler, 'initWidgets').and.callThrough();
                    });

                    it('should call init for root id with the controllers and their single connected component', function(){
                        var connectionA = testUtils.mockFactory.connectionMocks.connectionItem(this.controllerA.dataQuery, 'someRole');
                        var connectionB = testUtils.mockFactory.connectionMocks.connectionItem(this.controllerB.dataQuery, 'someRole');
                        testUtils.mockFactory.mockComponent(compType, this.mockSiteData, this.pageId, {connections: [connectionA, connectionB]});
                        var expectedControllers = {};
                        _.set(expectedControllers, [this.pageId, this.controllerAData.applicationId, this.controllerA.dataQuery], {
                            controllerData: this.controllerAData,
                            controllerBehaviors: [],
                            connections: [connectionA],
                            compId: this.controllerA.id
                        });
                        _.set(expectedControllers, [this.pageId, this.controllerAData.applicationId, this.controllerB.dataQuery], {
                            controllerData: this.controllerBData,
                            controllerBehaviors: [],
                            connections: [connectionB],
                            compId: this.controllerB.id
                        });

                        this.aspect.initApps([this.pageId]);

                        expect(this.handler.initWidgets).toHaveBeenCalledWith(expectedControllers);
                    });

                });

                describe('When 2 apps have controllers on the current root', function(){

                    beforeEach(function(){
                        this.controllerAData = testUtils.mockFactory.dataMocks.controllerData({applicationId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10', id: 'a'});
                        this.controllerA = testUtils.mockFactory.mockComponent(controllerCompType, this.mockSiteData, this.pageId, {data: this.controllerAData});
                        this.controllerBData = testUtils.mockFactory.dataMocks.controllerData({applicationId: 'e4c4a4fb-673d-493a-9ef1-661fa3823ad9', id: 'b'});
                        this.controllerB = testUtils.mockFactory.mockComponent(controllerCompType, this.mockSiteData, this.pageId, {data: this.controllerBData});
                        this.handler = this.aspect.getWidgetHandler();
                        spyOn(this.handler, 'initWidgets').and.callThrough();
                    });

                    it('should call init for root id controllers of both installed apps', function(){
                        var expectedControllers = {};
                        _.set(expectedControllers, [this.pageId, this.controllerAData.applicationId, this.controllerA.dataQuery], {
                            controllerData: this.controllerAData,
                            controllerBehaviors: [],
                            compId: this.controllerA.id
                        });
                        _.set(expectedControllers, [this.pageId, this.controllerBData.applicationId, this.controllerB.dataQuery], {
                            controllerData: this.controllerBData,
                            controllerBehaviors: [],
                            compId: this.controllerB.id
                        });

                        this.aspect.initApps([this.pageId]);

                        expect(this.handler.initWidgets).toHaveBeenCalledWith(expectedControllers);
                    });
                });


                it('should call init for controllers from both current page and master page (if page is not a popup)', function(){
                    this.controllerAData = testUtils.mockFactory.dataMocks.controllerData({applicationId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10', id: 'a'});
                    var controllerA = testUtils.mockFactory.mockComponent(controllerCompType, this.mockSiteData, this.pageId, {data: this.controllerAData});
                    this.controllerBData = testUtils.mockFactory.dataMocks.controllerData({applicationId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10', id: 'b'});
                    var controllerB = testUtils.mockFactory.mockComponent(controllerCompType, this.mockSiteData, 'masterPage', {data: this.controllerBData});
                    var handler = this.aspect.getWidgetHandler();
                    spyOn(handler, 'initWidgets').and.callThrough();
                    var expectedControllers = {};
                    _.set(expectedControllers, [this.pageId, this.controllerAData.applicationId, controllerA.dataQuery], {
                        controllerData: this.controllerAData,
                        controllerBehaviors: [],
                        compId: controllerA.id
                    });
                    _.set(expectedControllers, [this.pageId, this.controllerAData.applicationId, controllerB.dataQuery], {
                        controllerData: this.controllerBData,
                        controllerBehaviors: [],
                        compId: controllerB.id
                    });

                    this.aspect.initApps([this.pageId]);

                    expect(handler.initWidgets).toHaveBeenCalledWith(expectedControllers);
                });

                it('should call init for controllers from popup only (without master page controllers)', function(){
                    var popupId = 'somePopupId';
                    this.mockSiteData.addPopupPageWithDefaults(popupId);
                    this.controllerAData = testUtils.mockFactory.dataMocks.controllerData({applicationId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10', id: 'a'});
                    var controllerA = testUtils.mockFactory.mockComponent(controllerCompType, this.mockSiteData, popupId, {data: this.controllerAData});
                    this.controllerBData = testUtils.mockFactory.dataMocks.controllerData({applicationId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10', id: 'b'});
                    testUtils.mockFactory.mockComponent(controllerCompType, this.mockSiteData, 'masterPage', {data: this.controllerBData});
                    var handler = this.aspect.getWidgetHandler();
                    spyOn(handler, 'initWidgets').and.callThrough();
                    var expectedControllers = {};
                    _.set(expectedControllers, [popupId, this.controllerAData.applicationId, controllerA.dataQuery], {
                        controllerData: this.controllerAData,
                        controllerBehaviors: [],
                        compId: controllerA.id
                    });

                    this.aspect.initApps([popupId]);

                    expect(handler.initWidgets).toHaveBeenCalledWith(expectedControllers);
                });

                it('should call init for controllers from popup and current page', function(){
                    var popupId = 'somePopupId';
                    this.mockSiteData.addPopupPageWithDefaults(popupId);
                    this.controllerAData = testUtils.mockFactory.dataMocks.controllerData({applicationId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10', id: 'a'});
                    var controllerA = testUtils.mockFactory.mockComponent(controllerCompType, this.mockSiteData, popupId, {data: this.controllerAData});
                    this.controllerBData = testUtils.mockFactory.dataMocks.controllerData({applicationId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10', id: 'b'});
                    var controllerB = testUtils.mockFactory.mockComponent(controllerCompType, this.mockSiteData, 'masterPage', {data: this.controllerBData});
                    this.controllerCData = testUtils.mockFactory.dataMocks.controllerData({applicationId: 'e4c4a4fb-673d-493a-9ef1-661fa3823a10', id: 'c'});
                    var controllerC = testUtils.mockFactory.mockComponent(controllerCompType, this.mockSiteData, this.pageId, {data: this.controllerCData});
                    var handler = this.aspect.getWidgetHandler();
                    spyOn(handler, 'initWidgets').and.callThrough();
                    var expectedControllers = {};
                    _.set(expectedControllers, [this.pageId, this.controllerCData.applicationId, controllerC.dataQuery], {
                        controllerData: this.controllerCData,
                        controllerBehaviors: [],
                        compId: controllerC.id
                    });
                    _.set(expectedControllers, [this.pageId, this.controllerBData.applicationId, controllerB.dataQuery], {
                        controllerData: this.controllerBData,
                        controllerBehaviors: [],
                        compId: controllerB.id
                    });
                    _.set(expectedControllers, [popupId, this.controllerAData.applicationId, controllerA.dataQuery], {
                        controllerData: this.controllerAData,
                        controllerBehaviors: [],
                        compId: controllerA.id
                    });

                    this.aspect.initApps([this.pageId, popupId]);

                    expect(handler.initWidgets).toHaveBeenCalledWith(expectedControllers);
                });
            });

            describe('loadApps', function(){
                beforeEach(function(){
                    testUtils.experimentHelper.openExperiments('sv_platform1');
                    this.anotherPageId = 'somePageId';
                    this.mockSiteData = testUtils.mockFactory.mockSiteData()
                        .addPageWithData(this.anotherPageId, {title: 'anotherPageTitle'});
                    this.pageId = this.mockSiteData.getFocusedRootId();
                    this.siteAspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(this.mockSiteData);
                    this.aspect = this.siteAspectSiteAPI.getSiteAspect('WidgetAspect');
                    this.handler = this.aspect.getWidgetHandler();
                });

                function withoutUrl(result) {
                    return _.map(result, _.partialRight(_.omit, 'url'));
                }

                describe('when wixCode and data binding are the only installed apps', function() {
                    beforeEach(function () {
                        this.mockSiteData
                            .overrideClientSpecMap({})
                            .updateClientSpecMap(testUtils.mockFactory.clientSpecMapMocks.wixCode());
                    });

                    it('first time (before app was loaded) - should call handler.loadWidgets with dataBinding app, passed rootId and masterPage', function () {
                        _.forEach(this.mockSiteData.getAllPossiblyRenderedRoots(), function (rootId) {
                            this.mockSiteData.setPagePlatformApp(rootId, 'wixCode', true);
                        }, this);
                        var displayName = this.mockSiteData.getPageData(this.pageId).title;
                        var wixCodeAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Page', this.pageId, displayName);
                        var dataBindingAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Application', 'dataBinding', 'Data Binding', 'http://static.parastorage.com/services/dbsm-viewer-app/1.3.0/app.js');
                        var masterPageAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('masterPage', this.pageId);

                        var expectedResult = [dataBindingAppInfo, wixCodeAppInfo, masterPageAppInfo];

                        spyOn(this.handler, 'loadWidgets').and.callThrough();

                        this.aspect.loadApps([this.pageId]);

                        var methodCallArgs = this.handler.loadWidgets.calls.argsFor(0);
                        expect(withoutUrl(methodCallArgs[0])).toEqual(withoutUrl(expectedResult));
                        expect(methodCallArgs[1]).toEqual([this.pageId]);
                        expect(_.find(methodCallArgs[0], 'url').url).toMatch(/http:\/\/static\.parastorage\.com\/services\/dbsm-viewer-app\/\d+\.\d+\.\d+\/app\.js/);
                    });

                    it('after app was loaded and root was changed - should call handler.loadWidgets with dataBinding app and the passed rootId', function () {
                        _.forEach(this.mockSiteData.getAllPossiblyRenderedRoots(), function (rootId) {
                            this.mockSiteData.setPagePlatformApp(rootId, 'wixCode', true);
                        }, this);
                        var displayName = this.mockSiteData.getPageData(this.pageId).title;
                        var wixCodeAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Page', this.pageId, displayName);
                        var dataBindingAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Application', 'dataBinding', 'Data Binding', 'http://static.parastorage.com/services/dbsm-viewer-app/1.3.0/app.js');
                        var masterPageAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('masterPage', this.pageId);

                        var expectedResult = [dataBindingAppInfo, wixCodeAppInfo, masterPageAppInfo];
                        fakeSiteRender(this.siteAspectSiteAPI);
                        this.aspect.loadApps([this.pageId]);
                        this.mockSiteData.setCurrentPage(this.anotherPageId);
                        fakeSiteRender(this.siteAspectSiteAPI);
                        spyOn(this.handler, 'loadWidgets').and.callThrough();

                        this.aspect.loadApps([this.pageId]);

                        var methodCallArgs = _.first(this.handler.loadWidgets.calls.argsFor(0));
                        expect(withoutUrl(methodCallArgs)).toEqual(withoutUrl(expectedResult));
                        expect(_.find(methodCallArgs, 'url').url).toMatch(/http:\/\/static\.parastorage\.com\/services\/dbsm-viewer-app\/\d+\.\d+\.\d+\/app\.js/);
                    });

                    it('when app is already loaded - should not call handler.loadWidgets', function () {
                        this.aspect.loadApps([this.pageId]);
                        spyOn(this.handler, 'loadWidgets').and.callThrough();

                        this.aspect.loadApps([this.pageId]);

                        expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                    });

                    it('when app is already loaded - should not call handler.loadWidgets after site render', function () {
                        this.aspect.loadApps([this.pageId]);
                        fakeSiteRender(this.siteAspectSiteAPI);
                        spyOn(this.handler, 'loadWidgets').and.callThrough();

                        this.aspect.loadApps([this.pageId]);

                        expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                    });

                    it('should not call handler.loadWidgets if root id is not a valid pageId which is not masterPage', function(){
                        spyOn(this.handler, 'loadWidgets').and.callThrough();

                        this.aspect.loadApps(['someInvalidRootId']);

                        expect(this.handler.loadWidgets).not.toHaveBeenCalled();

                        this.aspect.loadApps(['masterPage']);

                        expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                    });

                    it('should call handler.loadWidgets with the passed ids (multiple)', function(){
                        var popupId = 'somePopupId';
                        var popupDisplayName = 'popupTitle';
                        this.mockSiteData.addPopupWithData(popupId, {title: popupDisplayName}).setCurrentPage(popupId);
                        _.forEach(this.mockSiteData.getAllPossiblyRenderedRoots(), function (rootId) {
                            this.mockSiteData.setPagePlatformApp(rootId, 'wixCode', true);
                        }, this);
                        var pageDisplayName = this.mockSiteData.getPageData(this.pageId).title;
                        var wixCodePageAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Page', this.pageId, pageDisplayName);
                        var wixCodePopupAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Popup', popupId, popupDisplayName);
                        var dataBindingAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Application', 'dataBinding', 'Data Binding', 'http://static.parastorage.com/services/dbsm-viewer-app/1.3.0/app.js');
                        var masterPageAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('masterPage', this.pageId);

                        var expectedResult = [dataBindingAppInfo, wixCodePageAppInfo, wixCodePopupAppInfo, masterPageAppInfo];
                        spyOn(this.handler, 'loadWidgets').and.callThrough();

                        this.aspect.loadApps([this.pageId, popupId]);

                        var methodCallArgs = this.handler.loadWidgets.calls.argsFor(0);
                        expect(withoutUrl(methodCallArgs[0])).toContain(withoutUrl(expectedResult));
                        expect(methodCallArgs[0].length).toEqual(expectedResult.length);
                        expect(methodCallArgs[1]).toEqual([this.pageId, popupId]);
                    });
                });

                describe('When there are more installed apps', function(){
                    beforeEach(function(){
                        var clientSpecMapMocks = testUtils.mockFactory.clientSpecMapMocks;
	                    this.ecommerce = clientSpecMapMocks.hybridApp(clientSpecMapMocks.ecommerce());
                        this.mockSiteData
                           .overrideClientSpecMap({})
                           .updateClientSpecMap(clientSpecMapMocks.wixCode())
                           .updateClientSpecMap(this.ecommerce);
                    });

                    it('first time (before app was loaded) - should call handler.loadWidgets with dataBinding app, the passed rootId and ecommerce', function () {
                        _.forEach(this.mockSiteData.getAllPossiblyRenderedRoots(), function (rootId) {
                            this.mockSiteData.setPagePlatformApp(rootId, 'wixCode', true);
                        }, this);
                        var displayName = this.mockSiteData.getPageData(this.pageId).title;
                        var wixCodeAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Page', this.pageId, displayName);
                        var dataBindingAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Application', 'dataBinding', 'Data Binding');
                        var ecomAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Application', this.ecommerce.appDefinitionId, this.ecommerce.type, this.ecommerce.platformApp.viewerUrl, this.ecommerce.applicationId);
                        var masterPageAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('masterPage', this.pageId);

                        var expectedResult = [ecomAppInfo, dataBindingAppInfo, wixCodeAppInfo, masterPageAppInfo];
                        spyOn(this.handler, 'loadWidgets').and.callThrough();

                        this.aspect.loadApps([this.pageId]);

                        var methodCallArgs = _.first(this.handler.loadWidgets.calls.argsFor(0));
                        var dataBindingUrlRegex = /http:\/\/static\.parastorage\.com\/services\/dbsm-viewer-app\/\d+\.\d+\.\d+\/app\.js/;
                        expect(withoutUrl(methodCallArgs)).toEqual(withoutUrl(expectedResult));
                        expect(_.find(methodCallArgs, {id: 'dataBinding'}).url).toMatch(dataBindingUrlRegex);
                        expect(_.find(methodCallArgs, {id: this.ecommerce.appDefinitionId}).url).toEqual(this.ecommerce.platformApp.viewerUrl);
                    });

                    it('after app was loaded and root was changed - should call handler.loadWidgets with dataBinding app, the passed rootId and ecommerce', function () {
                        _.forEach(this.mockSiteData.getAllPossiblyRenderedRoots(), function (rootId) {
                            this.mockSiteData.setPagePlatformApp(rootId, 'wixCode', true);
                        }, this);
                        var displayName = this.mockSiteData.getPageData(this.pageId).title;
                        var wixCodeAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Page', this.pageId, displayName);
                        var dataBindingAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Application', 'dataBinding', 'Data Binding', 'http://static.parastorage.com/services/dbsm-viewer-app/1.3.0/app.js');
                        var ecomAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('Application', this.ecommerce.appDefinitionId, this.ecommerce.type, this.ecommerce.platformApp.viewerUrl, this.ecommerce.applicationId);
                        var masterPageAppInfo = testUtils.mockFactory.widgetMocks.messages.mockLoadWidgetInfo('masterPage', this.pageId);

                        var expectedResult = [ecomAppInfo, dataBindingAppInfo, wixCodeAppInfo, masterPageAppInfo];
                        fakeSiteRender(this.siteAspectSiteAPI);
                        this.aspect.loadApps([this.pageId]);
                        this.mockSiteData.setCurrentPage(this.anotherPageId);
                        fakeSiteRender(this.siteAspectSiteAPI);
                        spyOn(this.handler, 'loadWidgets').and.callThrough();

                        this.aspect.loadApps([this.pageId]);

                        var methodCallArgs = _.first(this.handler.loadWidgets.calls.argsFor(0));
                        var dataBindingUrlRegex = /http:\/\/static\.parastorage\.com\/services\/dbsm-viewer-app\/\d+\.\d+\.\d+\/app\.js/;
                        expect(withoutUrl(methodCallArgs)).toEqual(withoutUrl(expectedResult));
                        expect(_.find(methodCallArgs, {id: 'dataBinding'}).url).toMatch(dataBindingUrlRegex);
                        expect(_.find(methodCallArgs, {id: this.ecommerce.appDefinitionId}).url).toEqual(this.ecommerce.platformApp.viewerUrl);
                    });

                    it('when apps are already loaded - should not call handler.loadWidgets', function () {
                        this.aspect.loadApps([this.pageId]);
                        spyOn(this.handler, 'loadWidgets').and.callThrough();

                        this.aspect.loadApps([this.pageId]);

                        expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                    });
                });

                describe('when no apps are installed', function(){
                    it('should not call handler.loadWidgets', function(){
                        spyOn(this.handler, 'loadWidgets').and.callThrough();

                        this.aspect.loadApps(this.pageId);

                        expect(this.handler.loadWidgets).not.toHaveBeenCalled();
                    });
                });
            });

            describe('stopApps', function(){
                beforeEach(function(){
                    testUtils.experimentHelper.openExperiments('sv_platform1');
                    this.anotherPageId = 'somePageId';
                    this.mockSiteData = testUtils.mockFactory.mockSiteData()
                        .addPageWithData(this.anotherPageId, {title: 'anotherPageTitle'});
                    this.pageId = this.mockSiteData.getFocusedRootId();
                    this.siteAspectSiteAPI = testUtils.mockFactory.mockSiteAspectSiteAPI(this.mockSiteData);
                    this.aspect = this.siteAspectSiteAPI.getSiteAspect('WidgetAspect');
                    this.handler = this.aspect.getWidgetHandler();
                });

                it('should stop the initialized apps under the passed rootId', function(){
	                var clientSpecMapMocks = testUtils.mockFactory.clientSpecMapMocks;
                    this.mockSiteData
                        .overrideClientSpecMap({})
                        .updateClientSpecMap(clientSpecMapMocks.wixCode())
                        .updateClientSpecMap(clientSpecMapMocks.hybridApp(clientSpecMapMocks.ecommerce()));
                    this.aspect.loadApps([this.pageId]);
                    spyOn(this.handler, 'stopWidgets').and.callThrough();

                    this.aspect.stopApps([this.pageId]);

                    expect(this.handler.stopWidgets).toHaveBeenCalledWith([this.pageId]);
                });

                it('should stop the initialized apps under both passed root ids', function(){
                    var clientSpecMapMocks = testUtils.mockFactory.clientSpecMapMocks;
                    var popupId = 'somePopupId';
                    this.mockSiteData
                        .overrideClientSpecMap({})
                        .updateClientSpecMap(clientSpecMapMocks.wixCode())
                        .updateClientSpecMap(clientSpecMapMocks.hybridApp(clientSpecMapMocks.ecommerce()))
                        .addPopupPageWithDefaults(popupId)
                        .setCurrentPage(popupId);
                    this.aspect.loadApps([this.pageId, popupId]);
                    spyOn(this.handler, 'stopWidgets').and.callThrough();

                    this.aspect.stopApps([this.pageId, popupId]);

                    expect(this.handler.stopWidgets).toHaveBeenCalledWith([this.pageId, popupId]);

                });

                it('should not call stop if no apps are initialized under the passed rootId', function(){
                    this.aspect.loadApps([this.pageId]);
                    spyOn(this.handler, 'stopWidgets').and.callThrough();

                    this.aspect.stopApps([this.pageId]);

                    expect(this.handler.stopWidgets).not.toHaveBeenCalled();
                });

                it('should not stop initialized apps that are not under the passed rootId', function(){
	                var clientSpecMapMocks = testUtils.mockFactory.clientSpecMapMocks;
                    this.mockSiteData
                        .overrideClientSpecMap({})
                        .updateClientSpecMap(clientSpecMapMocks.wixCode())
                        .updateClientSpecMap(clientSpecMapMocks.hybridApp(clientSpecMapMocks.ecommerce()));
                    _.forEach(this.mockSiteData.getAllPossiblyRenderedRoots(), function (rootId) {
                        this.mockSiteData.setPagePlatformApp(rootId, 'wixCode', true);
                    }, this);
                    this.aspect.loadApps([this.pageId]);
                    this.mockSiteData.setCurrentPage(this.anotherPageId);
                    spyOn(this.handler, 'stopWidgets').and.callThrough();

                    this.aspect.stopApps([this.anotherPageId]);

                    expect(this.handler.stopWidgets).not.toHaveBeenCalled();
                });

                it('should be able to initialize an app after it was stopped', function(){
	                var clientSpecMapMocks = testUtils.mockFactory.clientSpecMapMocks;
	                var ecommerceSpecMap = clientSpecMapMocks.hybridApp(clientSpecMapMocks.ecommerce());
                    this.mockSiteData
                        .overrideClientSpecMap({})
                        .updateClientSpecMap(clientSpecMapMocks.wixCode())
                        .updateClientSpecMap(ecommerceSpecMap);
                    _.forEach(this.mockSiteData.getAllPossiblyRenderedRoots(), function (rootId) {
                        this.mockSiteData.setPagePlatformApp(rootId, 'wixCode', true);
                    }, this);
                    this.aspect.loadApps([this.pageId]);
                    spyOn(this.handler, 'loadWidgets').and.callThrough();

                    this.aspect.stopApps([this.pageId]);
                    this.aspect.loadApps([this.pageId]);

	                var appsIds = _.map(this.handler.loadWidgets.calls.argsFor(0)[0], 'id');
                    expect(appsIds).toContain([ecommerceSpecMap.appDefinitionId, 'dataBinding', this.pageId]);
                });
            });

            describe('restartApps', function () {
                beforeEach(function(){
                    testUtils.experimentHelper.openExperiments('connectionsData');
                    testUtils.experimentHelper.openExperiments('sv_platform1');
	                var clientSpecMapMocks = testUtils.mockFactory.clientSpecMapMocks;
                    this.siteData = testUtils.mockFactory.mockSiteData()
                        .updateClientSpecMap(clientSpecMapMocks.wixCode())
                        .updateClientSpecMap(clientSpecMapMocks.hybridApp(clientSpecMapMocks.ecommerce()));
                    this.siteAPI = testUtils.mockFactory.mockSiteAPI(this.siteData);
                    this.pageId = this.siteData.getFocusedRootId();
                    this.aspect = this.siteAPI.getSiteAspect('WidgetAspect');
                });

                it('should do nothing if there are no apps running', function () {
                    spyOn(this.aspect, 'loadApps').and.callThrough();
                    spyOn(this.aspect, 'initApps').and.callThrough();
                    spyOn(this.aspect, 'stopApps').and.callThrough();

                    this.aspect.restartApps();

                    expect(this.aspect.stopApps).not.toHaveBeenCalled();
                    expect(this.aspect.loadApps).not.toHaveBeenCalled();
                    expect(this.aspect.initApps).not.toHaveBeenCalled();
                });

                it('should restart the rootId that were loaded', function () {
                    this.aspect.loadApps([this.pageId]);

                    spyOn(this.aspect, 'loadApps').and.callThrough();
                    spyOn(this.aspect, 'initApps').and.callThrough();
                    spyOn(this.aspect, 'stopApps').and.callThrough();

                    this.aspect.restartApps();

                    expect(this.aspect.stopApps).toHaveBeenCalledWith([this.pageId]);
                    expect(this.aspect.loadApps).toHaveBeenCalledWith([this.pageId]);
                    expect(this.aspect.initApps).toHaveBeenCalledWith([this.pageId]);
                });

                it('should restart all rootIds that were loaded', function () {
	                var popupId = 'popupId';
                    this.aspect.loadApps([this.pageId]);
                    this.siteData.addPopupPageWithDefaults(popupId);
                    this.siteAPI.openPopupPage(popupId); // This will load popup apps.

                    spyOn(this.aspect, 'loadApps').and.callThrough();
                    spyOn(this.aspect, 'initApps').and.callThrough();
                    spyOn(this.aspect, 'stopApps').and.callThrough();

                    this.aspect.restartApps();

                    expect(this.aspect.stopApps).toHaveBeenCalledWith([this.pageId, popupId]);
                    expect(this.aspect.loadApps).toHaveBeenCalledWith([this.pageId, popupId]);
                    expect(this.aspect.initApps).toHaveBeenCalledWith([this.pageId, popupId]);
                });

                it('should restart all rootIds that were init', function () {
                    this.aspect.loadApps([this.pageId]);
                    this.aspect.initApps([this.pageId]);

                    spyOn(this.aspect, 'loadApps').and.callThrough();
                    spyOn(this.aspect, 'initApps').and.callThrough();
                    spyOn(this.aspect, 'stopApps').and.callThrough();

                    this.aspect.restartApps();

                    expect(this.aspect.stopApps).toHaveBeenCalledWith([this.pageId]);
                    expect(this.aspect.loadApps).toHaveBeenCalledWith([this.pageId]);
                    expect(this.aspect.initApps).toHaveBeenCalledWith([this.pageId]);
                });
            });

        });
    });
