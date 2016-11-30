define(['testUtils', 'core/core/siteAspectsRegistry'], function (testUtils, /** core.siteAspectsRegistry */ siteAspectsRegistry) {
    'use strict';

    var WindowKeyboardEventAspect;
    var windowKeyboardEventAspect;

    function createComponent(id) {
        this.components[id] = {
            props: {
                id: id
            },
            onEscapeKey: jasmine.createSpy(id),
            onArrowRightKey: jasmine.createSpy(id),
            onArrowLeftKey: jasmine.createSpy(id)
        };
        return this.components[id];
    }

    describe('WindowKeyboardEventAspect tests', function () {
        beforeEach(function (done) {
            WindowKeyboardEventAspect = siteAspectsRegistry.getSiteAspectConstructor('windowKeyboardEvent');
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
                windowKeyboardEventAspect = new WindowKeyboardEventAspect(self.siteAPI);
                done();
            });
        });

        describe('Testing "Escape" key event', function() {

            beforeEach(function() {
                this.keyEvent = {
                    keyCode: 27,
                    which: 27,
                    preventDefault: function() {}
                };
            });

            it('Should notify the last registered component about "Escape" key event', function(){
                var comp1 = createComponent.call(this, 'comp1');
                var comp2 = createComponent.call(this, 'comp2');
                var comp3 = createComponent.call(this, 'comp3');
                windowKeyboardEventAspect.registerToEscapeKey(comp1);
                windowKeyboardEventAspect.registerToEscapeKey(comp2);

                windowKeyboardEventAspect.propagateKeyboardEvent(this.keyEvent);

                expect(comp1.onEscapeKey).not.toHaveBeenCalled();
                expect(comp2.onEscapeKey).toHaveBeenCalled();
                expect(comp3.onEscapeKey).not.toHaveBeenCalled();
            });

            it('Should not notify unregistered components about "Escape" key event', function(){
                var comp1 = createComponent.call(this, 'comp1');
                var comp2 = createComponent.call(this, 'comp2');
                windowKeyboardEventAspect.registerToEscapeKey(comp1);
                windowKeyboardEventAspect.registerToEscapeKey(comp2);
                windowKeyboardEventAspect.unRegisterKeys(comp1);

                windowKeyboardEventAspect.propagateKeyboardEvent(this.keyEvent);

                expect(comp2.onEscapeKey).toHaveBeenCalled();
                expect(comp1.onEscapeKey).not.toHaveBeenCalled();
            });

            it('Should remove component from "Escape" keys list if it cannot find it', function(){
                var comp1 = createComponent.call(this, 'comp1');
                var comp2 = createComponent.call(this, 'comp2');
                windowKeyboardEventAspect.registerToEscapeKey(comp1);
                windowKeyboardEventAspect.registerToEscapeKey(comp2);
                delete this.components.comp1;

                windowKeyboardEventAspect.propagateKeyboardEvent(this.keyEvent);

                expect(comp2.onEscapeKey).toHaveBeenCalled();
                expect(comp1.onEscapeKey).not.toHaveBeenCalled();
            });
        });

        describe('Testing "ArrowLeft" key event', function() {

            beforeEach(function() {
                this.keyEvent = {
                    keyCode: 37,
                    which: 37,
                    preventDefault: function() {}
                };
            });

            it('Should notify the last registered component about "ArrowLeft" key event', function(){
                var comp1 = createComponent.call(this, 'comp1');
                var comp2 = createComponent.call(this, 'comp2');
                var comp3 = createComponent.call(this, 'comp3');
                windowKeyboardEventAspect.registerToArrowLeftKey(comp1);
                windowKeyboardEventAspect.registerToArrowLeftKey(comp2);

                windowKeyboardEventAspect.propagateKeyboardEvent(this.keyEvent);

                expect(comp1.onArrowLeftKey).not.toHaveBeenCalled();
                expect(comp2.onArrowLeftKey).toHaveBeenCalled();
                expect(comp3.onArrowLeftKey).not.toHaveBeenCalled();
            });

            it('Should not notify unregistered components about "ArrowLeft" key event', function(){
                var comp1 = createComponent.call(this, 'comp1');
                var comp2 = createComponent.call(this, 'comp2');
                windowKeyboardEventAspect.registerToArrowLeftKey(comp1);
                windowKeyboardEventAspect.registerToArrowLeftKey(comp2);
                windowKeyboardEventAspect.unRegisterKeys(comp1);

                windowKeyboardEventAspect.propagateKeyboardEvent(this.keyEvent);

                expect(comp2.onArrowLeftKey).toHaveBeenCalled();
                expect(comp1.onArrowLeftKey).not.toHaveBeenCalled();
            });

            it('Should remove component from "ArrowLeft" keys list if it cannot find it', function(){
                var comp1 = createComponent.call(this, 'comp1');
                var comp2 = createComponent.call(this, 'comp2');
                windowKeyboardEventAspect.registerToArrowLeftKey(comp1);
                windowKeyboardEventAspect.registerToArrowLeftKey(comp2);
                delete this.components.comp1;

                windowKeyboardEventAspect.propagateKeyboardEvent(this.keyEvent);

                expect(comp2.onArrowLeftKey).toHaveBeenCalled();
                expect(comp1.onArrowLeftKey).not.toHaveBeenCalled();
            });
        });

        describe('Testing "ArrowRight" key event', function() {

            beforeEach(function() {
                this.keyEvent = {
                    keyCode: 39,
                    which: 39,
                    preventDefault: function() {}
                };
            });

            it('Should notify the last registered component about "ArrowRight" key event', function(){
                var comp1 = createComponent.call(this, 'comp1');
                var comp2 = createComponent.call(this, 'comp2');
                var comp3 = createComponent.call(this, 'comp3');
                windowKeyboardEventAspect.registerToArrowRightKey(comp1);
                windowKeyboardEventAspect.registerToArrowRightKey(comp2);

                windowKeyboardEventAspect.propagateKeyboardEvent(this.keyEvent);

                expect(comp1.onArrowRightKey).not.toHaveBeenCalled();
                expect(comp2.onArrowRightKey).toHaveBeenCalled();
                expect(comp3.onArrowRightKey).not.toHaveBeenCalled();
            });

            it('Should not notify unregistered components about "ArrowRight" key event', function(){
                var comp1 = createComponent.call(this, 'comp1');
                var comp2 = createComponent.call(this, 'comp2');
                windowKeyboardEventAspect.registerToArrowRightKey(comp1);
                windowKeyboardEventAspect.registerToArrowRightKey(comp2);
                windowKeyboardEventAspect.unRegisterKeys(comp1);

                windowKeyboardEventAspect.propagateKeyboardEvent(this.keyEvent);

                expect(comp2.onArrowRightKey).toHaveBeenCalled();
                expect(comp1.onArrowRightKey).not.toHaveBeenCalled();
            });

            it('Should remove component from "ArrowRight" keys list if it cannot find it', function(){
                var comp1 = createComponent.call(this, 'comp1');
                var comp2 = createComponent.call(this, 'comp2');
                windowKeyboardEventAspect.registerToArrowRightKey(comp1);
                windowKeyboardEventAspect.registerToArrowRightKey(comp2);
                delete this.components.comp1;

                windowKeyboardEventAspect.propagateKeyboardEvent(this.keyEvent);

                expect(comp2.onArrowRightKey).toHaveBeenCalled();
                expect(comp1.onArrowRightKey).not.toHaveBeenCalled();
            });
        });
    });
});
