define(['testUtils', 'core/core/siteAspectsRegistry'], function (testUtils, /** core.siteAspectsRegistry */ siteAspectsRegistry) {
    'use strict';

    var WindowTouchEventAspect;
    var windowTouchEventAspect;
    var propagateTouchEvent;
    var touchEvents = [
        'TouchStart',
        'TouchMove',
        'TouchEnd',
        'TouchCancel'
    ];

    function createComponent(id){
        var methodName;

        this.components[id] = {
            props: {
                id: id
            }
        };

        touchEvents.forEach(function(type){
            methodName = 'onWindow' + type;
            this.components[id][methodName] = jasmine.createSpy(methodName + ' ' + id);
        }, this);

        return this.components[id];
    }

    describe('Touch events aspects', function () {
        beforeEach(function (done){
            var self = this;

            WindowTouchEventAspect = siteAspectsRegistry.getSiteAspectConstructor('windowTouchEvents');
            this.components = {};

            testUtils.mockModules(['siteUtils/core/SiteData', 'core/siteRender/SiteAspectsSiteAPI'], {
                'core/siteRender/SiteAspectsSiteAPI': {
                    getComponentById: function (id) {
                        return self.components[id];
                    },

                    registerToWindowTouchEvent: function(type, callback){
                        propagateTouchEvent = callback;
                    }
                }
            }, function(SiteData, SiteAPI){
                self.siteAPI = new SiteAPI();
                windowTouchEventAspect = new WindowTouchEventAspect(self.siteAPI);
                done();
            });
        });

        describe('Registration to touch events', function(){
            it("should notify registered components about touch events", function(){
                var comp1 = createComponent.call(this, 'comp1');
                var comp2 = createComponent.call(this, 'comp2');
                var comp3 = createComponent.call(this, 'comp3');

                touchEvents.forEach(function(type){
                    windowTouchEventAspect.registerToWindowTouchEvent(type, comp1);
                    windowTouchEventAspect.registerToWindowTouchEvent(type, comp2);
                });

                touchEvents.forEach(function(type){
                    propagateTouchEvent({type: type.toLowerCase()});

                    expect(comp1['onWindow' + type]).toHaveBeenCalled();
                    expect(comp2['onWindow' + type]).toHaveBeenCalled();
                    expect(comp3['onWindow' + type]).not.toHaveBeenCalled();
                });
            });

            it('should pass original Event object to the listener', function(){
                var comp1 = createComponent.call(this, 'comp1');
                var event;

                touchEvents.forEach(function(type){
                    windowTouchEventAspect.registerToWindowTouchEvent(type, comp1);
                });

                touchEvents.forEach(function(type){
                    event = {type: type.toLowerCase()};
                    propagateTouchEvent(event);

                    expect(comp1['onWindow' + type]).toHaveBeenCalledWith(event);
                });
            });
        });

        describe('Unregistration from touch events', function(){
            it("should not notify unregistered components about touch events", function(){
                var comp1 = createComponent.call(this, 'comp1');
                var comp2 = createComponent.call(this, 'comp2');

                touchEvents.forEach(function(type){
                    windowTouchEventAspect.registerToWindowTouchEvent(type, comp1);
                    windowTouchEventAspect.registerToWindowTouchEvent(type, comp2);
                    windowTouchEventAspect.unregisterFromWindowTouchEvent(type, comp1);
                });

                touchEvents.forEach(function(type){
                    propagateTouchEvent({type: type.toLowerCase()});

                    expect(comp1['onWindow' + type]).not.toHaveBeenCalled();
                    expect(comp2['onWindow' + type]).toHaveBeenCalled();
                });
            });

            it("should unregister destroyed components", function(){
                var comp1 = createComponent.call(this, 'comp1');

                touchEvents.forEach(function(type){
                    windowTouchEventAspect.registerToWindowTouchEvent(type, comp1);
                });

                delete this.components[comp1.props.id];

                touchEvents.forEach(function(type){
                    propagateTouchEvent({type: type.toLowerCase()});

                    expect(comp1['onWindow' + type]).not.toHaveBeenCalled();
                });
            });
        });
    });
});
