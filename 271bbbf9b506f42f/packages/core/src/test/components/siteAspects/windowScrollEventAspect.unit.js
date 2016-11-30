define(['testUtils', 'core/core/siteAspectsRegistry'], function (testUtils, /** core.siteAspectsRegistry */ siteAspectsRegistry) {
    'use strict';

    var WindowScrollEventAspect;
    var windowScrollEventAspect;

    function createComponent(id) {
        this.components[id] = {
            props: {
                id: id
            },
            onScroll: jasmine.createSpy(id)
        };
        return this.components[id];
    }

    describe('WindowScrollEventAspect tests', function () {
        beforeEach(function (done) {
            WindowScrollEventAspect = siteAspectsRegistry.getSiteAspectConstructor('windowScrollEvent');
            this.components = {};
            var self = this;
            testUtils.mockModules(['siteUtils/core/SiteData', 'core/siteRender/SiteAspectsSiteAPI'], {
                'core/siteRender/SiteAspectsSiteAPI':{
                    getComponentById: function (id) {
                        return self.components[id];
                    }
                }
            }, function(SiteData, SiteAPI){
                self.siteAPI = new SiteAPI();
                windowScrollEventAspect = new WindowScrollEventAspect(self.siteAPI);
                done();
            });
        });

        describe('WindowScrollEventAspect calculate scroll direction', function () {
            it("should return DOWN if scrolled to the bottom of the page", function () {
                var scrollDirection = windowScrollEventAspect.getScrollDirection({x: 0, y: 30});
                expect(scrollDirection).toEqual('DOWN');
            });


            it("should return UP if scrolled to the top of the page", function () {
                windowScrollEventAspect._prevScrollPosition = {x: 0, y: 100};
                var scrollDirection = windowScrollEventAspect.getScrollDirection({x: 0, y: 30});
                expect(scrollDirection).toEqual('UP');
            });

            it("should return RIGHT if scrolled right", function () {
                var scrollDirection = windowScrollEventAspect.getScrollDirection({x: 30, y: 0});
                expect(scrollDirection).toEqual('RIGHT');
            });


            it("should return LEFT  if scrolled left", function () {
                windowScrollEventAspect._prevScrollPosition = {x: 100, y: 0};
                var scrollDirection = windowScrollEventAspect.getScrollDirection({x: 30, y: 0});
                expect(scrollDirection).toEqual('LEFT');
            });
        });

        it("should notify registered components about scroll", function(){
            var comp1 = createComponent.call(this, 'comp1');
            var comp2 = createComponent.call(this, 'comp2');
            var comp3 = createComponent.call(this, 'comp3');
            windowScrollEventAspect.registerToScroll(comp1);
            windowScrollEventAspect.registerToScroll(comp2);

            windowScrollEventAspect.propagateScrollEvent();

            expect(comp1.onScroll).toHaveBeenCalled();
            expect(comp2.onScroll).toHaveBeenCalled();
            expect(comp3.onScroll).not.toHaveBeenCalled();
        });

        it("should not notify unregistered components about scroll", function(){
            var comp1 = createComponent.call(this, 'comp1');
            var comp2 = createComponent.call(this, 'comp2');
            windowScrollEventAspect.registerToScroll(comp1);
            windowScrollEventAspect.registerToScroll(comp2);
            windowScrollEventAspect.unregisterToScroll(comp1);

            windowScrollEventAspect.propagateScrollEvent();

            expect(comp2.onScroll).toHaveBeenCalled();
            expect(comp1.onScroll).not.toHaveBeenCalled();
        });

        it("should remove component from registered list if it can't find it", function(){
            var comp1 = createComponent.call(this, 'comp1');
            var comp2 = createComponent.call(this, 'comp2');
            windowScrollEventAspect.registerToScroll(comp1);
            windowScrollEventAspect.registerToScroll(comp2);
            delete this.components.comp1;

            windowScrollEventAspect.propagateScrollEvent();

            expect(comp2.onScroll).toHaveBeenCalled();
            expect(comp1.onScroll).not.toHaveBeenCalled();
        });
    });
});
