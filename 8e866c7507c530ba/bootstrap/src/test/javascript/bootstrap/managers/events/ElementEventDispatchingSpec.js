describe("ElementEventDispatching", function(){
    beforeEach(function(){
        this.onAdd = jasmine.createSpy('onAdd');
        this.onRemove = jasmine.createSpy('onRemove');
        this.condition = jasmine.createSpy('condition').andReturn(true);
        Element.Events.testFull = {
            base: 'test',
            condition: this.condition,
            onAdd: this.onAdd,
            onRemove: this.onRemove
        };
        //could be 1..
        Element.NativeEvents.test = 2;

        this.dispatcher = new Element('div');
        this.listener = new Element('div');
        this.handler = jasmine.createSpy('handler');
    });
    describe('on', function(){
        beforeEach(function(){
            this.addNative= spyOn(this.dispatcher, 'addNativeListener');
        });
        it("should add native event on the element", function(){
            this.dispatcher.on('testFull', this.listener, this.handler);
            expect(this.onAdd).toHaveBeenCalledWith(this.handler);
            expect(this.addNative).toHaveBeenCalledWithFollowingPartialArguments('test');
        });

        it("should add custom event on element", function(){
            spyOn(W.Events, 'addEventHandler').andCallThrough();
            this.dispatcher.on('testCustom', this.listener, this.handler);
            expect(this.addNative).not.toHaveBeenCalled();
            expect(W.Events.addEventHandler).toHaveBeenCalledWith(this.dispatcher.getEventsSysId(), 'testCustom', this.listener.getEventsSysId(), this.handler, null, undefined);
        });
        //I have no idea what's the point..
        it("should add native event for NativeEvents: 1 ", function(){
            Element.NativeEvents.testPart = 1;
            this.dispatcher.on('testPart', this.listener, this.handler);
            expect(this.addNative).toHaveBeenCalledWithFollowingPartialArguments('testPart');
        });

        it("should not add an event twice", function(){
            this.dispatcher.on('testFull', this.listener, this.handler);
            this.dispatcher.on('testFull', this.listener, this.handler);
            expect(this.onAdd).toHaveBeenCalledXTimes(1);
        });
    });

    describe('trigger', function(){
        describe("native 2 (normal)", function(){
            beforeEach(function(){
                Element.Events.click = {
                    'condition': this.condition
                }
            });
            it("should trigger native event", function(){
                spyOn(this.dispatcher, '_triggerNativeEvent');
                this.dispatcher.on('click', this.listener, this.handler);
                this.dispatcher.trigger('click');
                expect(this.dispatcher._triggerNativeEvent).toHaveBeenCalledWith('click');
            });
            it("should call condition and call handler if it returns true", function(){
                this.dispatcher.on('click', this.listener, this.handler);
                this.dispatcher.trigger('click');
                expect(this.condition).toHaveBeenCalled();
                expect(this.handler).toHaveBeenCalled();
            });
            it("should call condition and not call handler if it returns false", function(){
                Element.Events.click = {
                    'condition': function(){ return false;}
                };
                this.dispatcher.on('click', this.listener, this.handler);
                this.dispatcher.trigger('click');
                expect(this.handler).not.toHaveBeenCalled();
            });
            it("should call the handler with the listener scope", function(){
                var that = this;
                var handler = jasmine.createSpy('handlerScope').andCallFake(function(){
                    expect(this).toBe(that.listener);
                });
                this.dispatcher.on('click', this.listener, handler);
                this.dispatcher.trigger('click');
            });
            it("should call the handler with moo Event object", function(){
                var handler = jasmine.createSpy('handlerScope').andCallFake(function(evt){
                    expect(typeOf(evt)).toBe('event');
                });
                this.dispatcher.on('click', this.listener, handler);
                this.dispatcher.trigger('click');
            });
        });
        describe("native 1 (like scroll)", function(){
            it("should call the handler with the listener scope", function(){
                var that = this;
                var handler = jasmine.createSpy('handlerScope').andCallFake(function(){
                    expect(this).toBe(that.listener);
                });
                this.dispatcher.on('scroll', this.listener, handler);
                this.dispatcher.trigger('scroll');
            });
            it("should trigger native event", function(){
                spyOn(this.dispatcher, '_triggerNativeEvent');
                this.dispatcher.on('scroll', this.listener, this.handler);
                this.dispatcher.trigger('scroll');
                expect(this.dispatcher._triggerNativeEvent).toHaveBeenCalledWith('scroll');
            });
            it("should not call the handler with moo Event object", function(){
                var handler = jasmine.createSpy('handlerScope').andCallFake(function(evt){
                    expect(typeOf(evt)).not.toBe('event');
                });
                this.dispatcher.on('scroll', this.listener, handler);
                this.dispatcher.trigger('scroll');
            });
        });
        describe("custom", function(){
            it("should call the handler with the listener scope", function(){
                var that = this;
                var handler = jasmine.createSpy('handlerScope').andCallFake(function(){
                    expect(this).toBe(that.listener);
                });
                this.dispatcher.on('custonEvt', this.listener, handler);
                this.dispatcher.trigger('custonEvt');
            });
            it("should call W.Events dispatch", function(){
                spyOn(W.Events, 'dispatchEvent');
                this.dispatcher.on('custonEvt', this.listener, this.handler);
                this.dispatcher.trigger('custonEvt');
                expect(W.Events.dispatchEvent).toHaveBeenCalled();
            });
            it("should not call the handler with moo Event object", function(){
                var handler = jasmine.createSpy('handlerScope').andCallFake(function(evt){
                    expect(typeOf(evt)).not.toBe('event');
                });
                this.dispatcher.on('custonEvt', this.listener, handler);
                this.dispatcher.trigger('custonEvt');
            });
        });
    });

    describe("off", function(){
        it("should remove event from element and call on remove", function(){
            spyOn(W.Events, 'removeEventHandler').andCallThrough();
            this.dispatcher.on('testFull', this.listener, this.handler);
            this.dispatcher.off('testFull', this.listener, this.handler);
            expect(this.onRemove).toHaveBeenCalledWith(this.handler);
            expect(W.Events.removeEventHandler).toHaveBeenCalledWith(this.dispatcher.getEventsSysId(), 'test', this.listener.getEventsSysId(), this.handler);
        });
        it("should do nothing if event isn't registered", function(){
            spyOn(W.Events, 'removeEventHandler').andCallThrough();
            this.dispatcher.off('testFull', this.listener, this.handler);
            expect(W.Events.removeEventHandler).not.toHaveBeenCalled();
        });
    });

    describe("exterminate", function(){
        it("should not have an id", function(){
            this.dispatcher.on('click', this.listener, this.handler);
            this.dispatcher.exterminate();
            expect(this.dispatcher.getEventsSysId()).toBeNull();
        });
        it("should not fire events any more", function(){
            this.dispatcher.on('click', this.listener, this.handler);
            this.dispatcher.exterminate();
            this.dispatcher.trigger('click');
            expect(this.handler).not.toHaveBeenCalled();
        });
        it("should remove events recursively", function(){
            this.dispatcher.innerHTML = '<div></div><div><div></div></div>';
            this.dispatcher.on('click', this.listener, this.handler);
            this.dispatcher.children[0].on('click', this.listener, this.handler);
            this.dispatcher.children[1].children[0].on('click', this.listener, this.handler);
            this.dispatcher.exterminate();
            this.dispatcher.children[0].trigger('click');
            this.dispatcher.children[1].children[0].trigger('click');
            expect(this.handler).not.toHaveBeenCalled();
        });

    });

    describe("_triggerNativeEvent", function(){
        beforeEach(function(){
            this.handler1 = jasmine.createSpy('div1');
            this.handler2 =jasmine.createSpy('div2');
            this.div1 = new Element('div');
            this.div2 = new Element('div');

        });
        it("should trigger native bubbling event", function(){
            var parentHandler = jasmine.createSpy('parent');
            this.div2.addNativeListener('click', this.handler2);
            this.div1.addNativeListener('click', parentHandler);
            this.div1.adopt(this.div2);
            getPlayGround().adopt(this.div1);

            this.div2._triggerNativeEvent('click');

            expect(parentHandler).toHaveBeenCalled();
            expect(this.handler2).toHaveBeenCalled();
        });

        it("should trigger custom bubbling event", function(){
            var parentHandler = jasmine.createSpy('parent');
            this.div2.addNativeListener('custom', this.handler2);
            this.div1.addNativeListener('custom', parentHandler);
            this.div1.adopt(this.div2);
            getPlayGround().adopt(this.div1);

            this.div2._triggerNativeEvent('custom');

            expect(parentHandler).toHaveBeenCalled();
            expect(this.handler2).toHaveBeenCalled();
        });
    });

});