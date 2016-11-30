describe("TimersHandler", function(){
    testRequire().classes('bootstrap.managers.events.EventDispatcherBase');

    describe("init", function(){
        it("should be initialized for an event dispatcher", function(){
            var dispatcher = new this.EventDispatcherBase();
            expect(dispatcher.setTimeout).toBeDefined();
        });
    });
    beforeEach(function(){
        this._dispatcher = new this.EventDispatcherBase();
        this._function = jasmine.createSpy('toExecute');
    });
    describe("setTimeout", function(){
        it("should call the function passed with the dispatcher as the context", function(){
            var that = this;
            spyOn(window, 'setTimeout').andCallThrough();
            var toExecute = jasmine.createSpy('toExecute').andCallFake(function(){
                expect(this).toBe(that._dispatcher);
            });

            this._dispatcher.setTimeout(toExecute, 100);

            expect(window.setTimeout.mostRecentCall.args[1]).toBe(100);
            waits(120);
            runs(function(){
                expect(toExecute).toHaveBeenCalled();
            });
        });
        it("should call the function after 0 milliseconds if no delay passed", function(){
            spyOn(window, 'setTimeout').andCallThrough();

            this._dispatcher.setTimeout(this._function);

            expect(window.setTimeout.mostRecentCall.args[1]).toBe(0);
            waits(20);
            runs(function(){
                expect(this._function).toHaveBeenCalled();
            });
        });
        it("should flag the timer as active", function(){
            var timerId = this._dispatcher.setTimeout(this._function, 100);

            expect(this._dispatcher.isActiveTimer(timerId)).toBeTruthy();
        });
        it("should flag the timer as not active after the execution of the function", function(){
            var timerId = this._dispatcher.setTimeout(this._function, 100);

            waits(120);
            runs(function(){
                expect(this._dispatcher.isActiveTimer(timerId)).toBeFalsy();
            });
        });

        it("should return the window timeout id", function(){
            spyOn(window, 'setTimeout').andReturn(3);

            var timerId = this._dispatcher.setTimeout(this._function);

            expect(timerId).toBe(3);
        })
    });

    describe("setInterval", function(){
        xit("should call the function at each interval", function(){
            this._dispatcher.setInterval(this._function, 20);

            waits(55);
            runs(function(){
                expect(this._function).toHaveBeenCalledXTimes(2);
            });
        });

        it("should call the function with the dispatcher as context", function(){
            var that = this;
            spyOn(window, 'setInterval').andCallThrough();
            var toExecute = jasmine.createSpy('toExecute').andCallFake(function(){
                expect(this).toBe(that._dispatcher);
            });

            this._dispatcher.setInterval(toExecute, 20);

            expect(window.setInterval.mostRecentCall.args[1]).toBe(20);
        });

        it("should flag the timer as active", function(){
            var timerID = this._dispatcher.setInterval(this._function, 20);

            expect(this._dispatcher.isActiveTimer(timerID)).toBeTruthy();
        });

        it("should return the window interval id", function(){
            spyOn(window, 'setInterval').andReturn(3);

            var timerId = this._dispatcher.setInterval(this._function, 4);

            expect(timerId).toBe(3);
        })
    });

    describe("exterminate", function(){
        it("should clear all active timeout timers when the object terminates", function(){
            spyOn(window, 'clearTimeout').andCallThrough();
            var timerId1 =  this._dispatcher.setTimeout(this._function, 100);
            var timerId2 = this._dispatcher.setTimeout(function(){}, 150);


            this._dispatcher.exterminate();
            expect(window.clearTimeout).toHaveBeenCalledWith(timerId1);
            expect(window.clearTimeout).toHaveBeenCalledWith(timerId2);
        });
        it("should clear all active intervals whe the object terminates", function(){
            spyOn(window, 'clearInterval').andCallThrough();
            var timerId1 =  this._dispatcher.setInterval(this._function, 100);
            var timerId2 = this._dispatcher.setInterval(function(){}, 150);

            this._dispatcher.exterminate();

            expect(window.clearInterval).toHaveBeenCalledWith(timerId1);
            expect(window.clearInterval).toHaveBeenCalledWith(timerId2);
        });

    });
});