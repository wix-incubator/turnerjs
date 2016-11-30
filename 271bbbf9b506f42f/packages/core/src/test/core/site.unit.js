define(['lodash', 'testUtils', 'core/core/site'], function(_, testUtils, site){
    'use strict';

    describe('site', function(){

        describe('renderSite', function(){

            beforeEach(function(){
                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.mockViewerPrivateServices = testUtils.mockFactory.mockViewerPrivateServices(this.mockSiteData);
                this.mockProps = testUtils.mockFactory.mockSiteProps(this.mockSiteData, this.mockViewerPrivateServices);
                spyOn(this.mockViewerPrivateServices.siteDataAPI, 'loadPage').and.callFake(function(pageInfo, pageLoadedCallback){
                    pageLoadedCallback();
                });
            });
            it('should execute the registered load_page_first_render hook after page was loaded', function(){
                var registeredHook = jasmine.createSpy('registeredHookFunc');
                site.hooks.registerHook(site.hooks.types.PAGE_LOADED_FIRST_RENDER, registeredHook);

                site.renderSite(this.mockSiteData, this.mockViewerPrivateServices, this.mockProps, _.noop);

                expect(registeredHook).toHaveBeenCalledWith(this.mockSiteData, this.mockProps.wixCodeAppApi);
            });

            it('should execute multiple registered load_page_first_render hooks', function(){
                var registeredHookA = jasmine.createSpy('registeredHookFuncA');
                var registeredHookB = jasmine.createSpy('registeredHookFuncB');
                site.hooks.registerHook(site.hooks.types.PAGE_LOADED_FIRST_RENDER, registeredHookA);
                site.hooks.registerHook(site.hooks.types.PAGE_LOADED_FIRST_RENDER, registeredHookB);

                site.renderSite(this.mockSiteData, this.mockViewerPrivateServices, this.mockProps, _.noop);

                expect(registeredHookA).toHaveBeenCalledWith(this.mockSiteData, this.mockProps.wixCodeAppApi);
                expect(registeredHookB).toHaveBeenCalledWith(this.mockSiteData, this.mockProps.wixCodeAppApi);
            });

            it('should not execute other registered hooks', function(){
                var otherRegisteredHook = jasmine.createSpy('registeredHookFunc');
                site.hooks.registerHook('some_other_hook_type', otherRegisteredHook);

                site.renderSite(this.mockSiteData, this.mockViewerPrivateServices, this.mockProps, _.noop);

                expect(otherRegisteredHook).not.toHaveBeenCalled();
            });

            it('should not throw after page was loaded if no hook was registered', function(){
                expect(site.renderSite.bind(site, this.mockSiteData, this.mockViewerPrivateServices, this.mockProps, _.noop)).not.toThrow();
            });
        });
    });
});
