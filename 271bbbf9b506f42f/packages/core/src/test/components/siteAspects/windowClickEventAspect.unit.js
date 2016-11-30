define(['testUtils', 'core/core/siteAspectsRegistry'], function (testUtils, /** core.siteAspectsRegistry */ siteAspectsRegistry) {
    'use strict';

    describe('windowClickEventAspect tests', function () {
        var WindowClickEventAspectConstructor;
        var windowClickEventAspect;
        var eventTarget = {target: {className: 'clickedClassName'}};

        function createComponent(id, styleId) {
            this.components[id] = {
                props: {
                    id: id,
                    styleId: styleId ? styleId : 'defaultStyleId'
                },
                onDocumentClick: jasmine.createSpy(id)
            };
            return this.components[id];
        }

        beforeEach(function (done) {
            WindowClickEventAspectConstructor = siteAspectsRegistry.getSiteAspectConstructor('windowClickEventAspect');
            this.components = {};
            var self = this;
            testUtils.mockModules(['siteUtils/core/SiteData', 'core/siteRender/SiteAspectsSiteAPI'], {
                'core/siteRender/SiteAspectsSiteAPI': {
                    getComponentById: function (id) {
                        return self.components[id];
                    }
                }
            }, function (SiteData, SiteAPI) {
                self.siteAPI = new SiteAPI();
                windowClickEventAspect = new WindowClickEventAspectConstructor(self.siteAPI);
                done();
            });
        });

        it("should notify registered components about document click", function () {
            var comp1 = createComponent.call(this, 'comp1');
            var comp2 = createComponent.call(this, 'comp2');
            var comp3 = createComponent.call(this, 'comp3');
            windowClickEventAspect.registerToDocumentClickEvent('comp1');
            windowClickEventAspect.registerToDocumentClickEvent('comp2');

            windowClickEventAspect.propagateDocumentClickEvent(eventTarget);

            expect(comp1.onDocumentClick).toHaveBeenCalledWith(eventTarget);
            expect(comp2.onDocumentClick).toHaveBeenCalledWith(eventTarget);
            expect(comp3.onDocumentClick).not.toHaveBeenCalled();
        });

        it("should not notify unregistered components about document click", function () {
            var comp1 = createComponent.call(this, 'comp1');
            var comp2 = createComponent.call(this, 'comp2');

            windowClickEventAspect.registerToDocumentClickEvent('comp1');
            windowClickEventAspect.registerToDocumentClickEvent('comp2');

            windowClickEventAspect.unRegisterToDocumentClickEvent('comp1');

            windowClickEventAspect.propagateDocumentClickEvent(eventTarget);

            expect(comp2.onDocumentClick).toHaveBeenCalledWith(eventTarget);
            expect(comp1.onDocumentClick).not.toHaveBeenCalled();
        });

        it("should remove component from registered list if it can't find it", function () {
            var comp1 = createComponent.call(this, 'comp1');
            var comp2 = createComponent.call(this, 'comp2');
            windowClickEventAspect.registerToDocumentClickEvent('comp1');
            windowClickEventAspect.registerToDocumentClickEvent('comp2');
            delete this.components.comp1;

            windowClickEventAspect.propagateDocumentClickEvent(eventTarget);

            expect(comp2.onDocumentClick).toHaveBeenCalledWith(eventTarget);
            expect(comp1.onDocumentClick).not.toHaveBeenCalled();
        });
    });
});
