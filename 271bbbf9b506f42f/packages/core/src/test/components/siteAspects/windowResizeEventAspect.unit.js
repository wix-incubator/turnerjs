define(['testUtils', 'core/core/siteAspectsRegistry'], function (testUtils, /** core.siteAspectsRegistry */ siteAspectsRegistry) {
    'use strict';

    var WindowResizeEventAspect;
    var windowResizeEventAspect;

    function createComponent(id) {
        this.components[id] = {
            props: {
                id: id
            },
            onResize: jasmine.createSpy(id)
        };
        return this.components[id];
    }

    describe('WindowResizeEventAspect tests', function () {
        beforeEach(function (done) {
            WindowResizeEventAspect = siteAspectsRegistry.getSiteAspectConstructor('windowResizeEvent');
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
                windowResizeEventAspect = new WindowResizeEventAspect(self.siteAPI);
                done();
            });
        });



        it("should notify registered components about resize", function(){
            var comp1 = createComponent.call(this, 'comp1');
            var comp2 = createComponent.call(this, 'comp2');
            var comp3 = createComponent.call(this, 'comp3');
            windowResizeEventAspect.registerToResize(comp1);
            windowResizeEventAspect.registerToResize(comp2);

            windowResizeEventAspect.propagateResizeEvent();

            expect(comp1.onResize).toHaveBeenCalled();
            expect(comp2.onResize).toHaveBeenCalled();
            expect(comp3.onResize).not.toHaveBeenCalled();
        });

        it("should not notify unregistered components about resize", function(){
            var comp1 = createComponent.call(this, 'comp1');
            var comp2 = createComponent.call(this, 'comp2');
            windowResizeEventAspect.registerToResize(comp1);
            windowResizeEventAspect.registerToResize(comp2);
            windowResizeEventAspect.unregisterToResize(comp1);

            windowResizeEventAspect.propagateResizeEvent();

            expect(comp2.onResize).toHaveBeenCalled();
            expect(comp1.onResize).not.toHaveBeenCalled();
        });

        it("should remove component from registered list if it can't find it", function(){
            var comp1 = createComponent.call(this, 'comp1');
            var comp2 = createComponent.call(this, 'comp2');
            windowResizeEventAspect.registerToResize(comp1);
            windowResizeEventAspect.registerToResize(comp2);
            delete this.components.comp1;

            windowResizeEventAspect.propagateResizeEvent();

            expect(comp2.onResize).toHaveBeenCalled();
            expect(comp1.onResize).not.toHaveBeenCalled();
        });
    });
});
