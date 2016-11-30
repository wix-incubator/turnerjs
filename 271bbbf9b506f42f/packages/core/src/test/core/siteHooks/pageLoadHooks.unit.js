define(['lodash', 'testUtils', 'definition!core/core/siteHooks/pageLoadHooks', 'core/core/site', 'experiment', 'wixCodeInit', 'widgets'], function(_, testUtils, pageLoadHooksDef, site, experiment, wixCodeInit) {
    'use strict';

    describe('pageLoadHooks', function(){
        beforeEach(function(){
            this.hooks = {};
        });

        function executeHook(hooks, hookName, args) {
            _.forEach(hooks[hookName], function (hookFunc) {
                hookFunc.apply(null, args);
            }, this);
        }

        function mockRegisterHooks(hooks) {
            spyOn(site.hooks, 'registerHook').and.callFake(function (hookName, hookFunc) {
                hooks[hookName] = hooks[hookName] || [];
                hooks[hookName].push(hookFunc);
            });
        }

        it('should register hooks', function(){
            spyOn(site.hooks, 'registerHook').and.callThrough();

            pageLoadHooksDef(experiment, site);

            expect(site.hooks.registerHook.calls.allArgs()).toEqual([['page_loaded_first_render', jasmine.any(Function)], [site.hooks.types.PAGE_LOADED, jasmine.any(Function)]]);
        });

        describe('page_loaded hook - sv_platform exp open', function(){

            beforeEach(function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.newPageId = 'newPageId';
                this.mockSiteData.addPageWithDefaults(this.newPageId);
                testUtils.experimentHelper.openExperiments('sv_platform1');
                this.mockSite = testUtils.mockFactory.mockWixSiteReact(this.mockSiteData, null, {});
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData, this.mockSite);
                this.widgetAspect = this.mockSite.siteAPI.getSiteAspect('WidgetAspect');
                spyOn(this.widgetAspect, 'initApps').and.callThrough();
            });

            it('should init apps when primary page was changed', function(){
                var mockedNavInfo = testUtils.mockFactory.mockNavInfo(this.mockSiteData, this.newPageId);
                mockRegisterHooks(this.hooks);

                pageLoadHooksDef(experiment, site);
                executeHook(this.hooks, site.hooks.types.PAGE_LOADED, [this.mockSiteAPI, mockedNavInfo]);

                expect(this.widgetAspect.initApps).toHaveBeenCalledWith([mockedNavInfo.pageId]);
            });

            it('should not init apps when primary page was not changed but focused page did (close popup)', function(){
                var popupId = 'somePopupId';
                this.mockSiteData.addPopupPageWithDefaults(popupId).setCurrentPage(popupId);
                var primaryPageNavInfo = testUtils.mockFactory.mockNavInfo(this.mockSiteData, this.mockSiteData.getCurrentUrlPageId());
                mockRegisterHooks(this.hooks);

                pageLoadHooksDef(experiment, site);
                executeHook(this.hooks, site.hooks.types.PAGE_LOADED, [this.mockSiteAPI, primaryPageNavInfo]);

                expect(this.widgetAspect.initApps).not.toHaveBeenCalled();
            });

            it('should init apps when primary page was not changed but focused page did (open popup)', function(){
                var popupId = 'somePopupId';
                this.mockSiteData.addPopupPageWithDefaults(popupId);
                var popupPageNavInfo = testUtils.mockFactory.mockNavInfo(this.mockSiteData, popupId);
                mockRegisterHooks(this.hooks);

                pageLoadHooksDef(experiment, site);
                executeHook(this.hooks, site.hooks.types.PAGE_LOADED, [this.mockSiteAPI, popupPageNavInfo]);

                expect(this.widgetAspect.initApps).toHaveBeenCalledWith([popupId]);
            });

            it('should not init apps when focused page was not changed', function(){
                var mockedNavInfo = testUtils.mockFactory.mockNavInfo(this.mockSiteData, this.mockSiteData.getCurrentUrlPageId());
                mockRegisterHooks(this.hooks);

                pageLoadHooksDef(experiment, site);
                executeHook(this.hooks, site.hooks.types.PAGE_LOADED, [this.mockSiteAPI, mockedNavInfo]);

                expect(this.widgetAspect.initApps).not.toHaveBeenCalled();
            });
        });

        describe('page_loaded hook - sv_platform exp closed', function(){
            beforeEach(function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.newPageId = 'newPageId';
                this.mockSiteData.addPageWithDefaults(this.newPageId);
                this.mockSite = testUtils.mockFactory.mockWixSiteReact(this.mockSiteData, null, {});
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData, this.mockSite);
                this.widgetAspect = this.mockSite.siteAPI.getSiteAspect('WidgetAspect');
                spyOn(this.widgetAspect, 'initApps').and.callThrough();
            });

            it('should not init apps if primary page was changed', function(){
                var mockedNavInfo = testUtils.mockFactory.mockNavInfo(this.mockSiteData, this.newPageId);
                mockRegisterHooks(this.hooks);

                pageLoadHooksDef(experiment, site);
                executeHook(this.hooks, site.hooks.types.PAGE_LOADED, [this.mockSiteAPI, mockedNavInfo]);

                expect(this.widgetAspect.initApps).not.toHaveBeenCalled();
            });

            it('should not init apps when primary page was not changed but focused page did (close popup)', function(){
                var popupId = 'somePopupId';
                this.mockSiteData.addPopupPageWithDefaults(popupId).setCurrentPage(popupId);
                var primaryPageNavInfo = testUtils.mockFactory.mockNavInfo(this.mockSiteData, this.mockSiteData.getCurrentUrlPageId());
                mockRegisterHooks(this.hooks);

                pageLoadHooksDef(experiment, site);
                executeHook(this.hooks, site.hooks.types.PAGE_LOADED, [this.mockSiteAPI, primaryPageNavInfo]);

                expect(this.widgetAspect.initApps).not.toHaveBeenCalled();
            });

            it('should not init apps when primary page was not changed but focused page did (open popup)', function(){
                var popupId = 'somePopupId';
                this.mockSiteData.addPopupPageWithDefaults(popupId);
                var popupPageNavInfo = testUtils.mockFactory.mockNavInfo(this.mockSiteData, popupId);
                mockRegisterHooks(this.hooks);

                pageLoadHooksDef(experiment, site);
                executeHook(this.hooks, site.hooks.types.PAGE_LOADED, [this.mockSiteAPI, popupPageNavInfo]);

                expect(this.widgetAspect.initApps).not.toHaveBeenCalled();
            });

            it('should not init apps in case focuse page was not changed', function(){
                var mockedNavInfo = testUtils.mockFactory.mockNavInfo(this.mockSiteData, this.mockSiteData.getCurrentUrlPageId());
                mockRegisterHooks(this.hooks);

                pageLoadHooksDef(experiment, site);
                executeHook(this.hooks, site.hooks.types.PAGE_LOADED, [this.mockSiteAPI, mockedNavInfo]);

                expect(this.widgetAspect.initApps).not.toHaveBeenCalled();
            });
        });

        describe('page_loaded_first_render - sv_platform exp open', function(){
            beforeEach(function(){
                testUtils.experimentHelper.openExperiments('sv_platform1');
            });

            it('should init apps in viewer mode', function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.newPageId = 'newPageId';
                this.mockSiteData.addPageWithDefaults(this.newPageId);
                var appApi = wixCodeInit.getAppApi();
                this.mockSite = testUtils.mockFactory.mockWixSiteReact(this.mockSiteData, null, {wixCodeAppApi: appApi});
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData, this.mockSite);
                spyOn(appApi, 'preInitWidgets').and.callThrough();
                mockRegisterHooks(this.hooks);

                pageLoadHooksDef(experiment, site);
                executeHook(this.hooks, site.hooks.types.PAGE_LOADED_FIRST_RENDER, [this.mockSiteData, this.mockSiteAPI.getWixCodeAppApi()]);

                expect(appApi.preInitWidgets).toHaveBeenCalledWith(this.mockSiteData, this.mockSiteData.currentUrl.full);
            });

            it('should not init apps in document services mode', function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData(null, true);
                this.newPageId = 'newPageId';
                this.mockSiteData.addPageWithDefaults(this.newPageId);
                var appApi = wixCodeInit.getAppApi();
                this.mockSite = testUtils.mockFactory.mockWixSiteReact(this.mockSiteData, null, {wixCodeAppApi: appApi});
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData, this.mockSite);
                spyOn(appApi, 'preInitWidgets').and.callThrough();
                mockRegisterHooks(this.hooks);

                pageLoadHooksDef(experiment, site);
                executeHook(this.hooks, site.hooks.types.PAGE_LOADED_FIRST_RENDER, [this.mockSiteData, this.mockSiteAPI.getWixCodeAppApi()]);

                expect(appApi.preInitWidgets).not.toHaveBeenCalled();
            });
        });

        describe('page_loaded_first_render - sv_platform exp closed', function(){
            it('should not init apps in viewer mode', function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.newPageId = 'newPageId';
                this.mockSiteData.addPageWithDefaults(this.newPageId);
                var appApi = wixCodeInit.getAppApi();
                this.mockSite = testUtils.mockFactory.mockWixSiteReact(this.mockSiteData, null, {wixCodeAppApi: appApi});
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData, this.mockSite);
                this.widgetAspect = this.mockSite.siteAPI.getSiteAspect('WidgetAspect');
                spyOn(appApi, 'preInitWidgets').and.callThrough();
                mockRegisterHooks(this.hooks);

                pageLoadHooksDef(experiment, site);
                executeHook(this.hooks, site.hooks.types.PAGE_LOADED_FIRST_RENDER, [this.mockSiteData, this.mockSiteAPI.getWixCodeAppApi()]);

                expect(appApi.preInitWidgets).not.toHaveBeenCalled();
            });

            it('should not init apps in document services mode', function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData(null, true);
                this.newPageId = 'newPageId';
                this.mockSiteData.addPageWithDefaults(this.newPageId);
                var appApi = wixCodeInit.getAppApi();
                this.mockSite = testUtils.mockFactory.mockWixSiteReact(this.mockSiteData, null, {wixCodeAppApi: appApi});
                this.mockSiteAPI = testUtils.mockFactory.mockSiteAPI(this.mockSiteData, this.mockSite);
                this.widgetAspect = this.mockSite.siteAPI.getSiteAspect('WidgetAspect');
                spyOn(appApi, 'preInitWidgets').and.callThrough();
                mockRegisterHooks(this.hooks);

                pageLoadHooksDef(experiment, site);
                executeHook(this.hooks, site.hooks.types.PAGE_LOADED_FIRST_RENDER, [this.mockSiteData, this.mockSiteAPI.getWixCodeAppApi()]);

                expect(appApi.preInitWidgets).not.toHaveBeenCalled();
            });
        });

    });
});
