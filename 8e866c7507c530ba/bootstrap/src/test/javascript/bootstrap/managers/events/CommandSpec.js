describe("events.Command", function(){
    testRequire().classes('bootstrap.managers.events.Command');
    beforeEach(function(){
        this._cmd = new this.Command('testCmd');
        this._listener = {
            onExecute: jasmine.createSpy('onExecute'),
            onStateChange: jasmine.createSpy('onStateChange')
        };
    });

    describe("registerListener and execute", function(){
        it("should do nothing if no cb passed", function(){
            this._cmd.registerListener(this._listener);
        });
        it("should register on execute listener", function(){
            this._cmd.registerListener(this._listener, this._listener.onExecute);

            this._cmd.execute();

            expect(this._listener.onExecute).toHaveBeenCalled();
        });
        it("should register on enabled state change listener", function(){
            this._cmd.registerListener(this._listener, null, this._listener.onStateChange);

            this._cmd.disable();

            expect(this._listener.onStateChange).toHaveBeenCalled();
        });
        it("should register multiple handler for same listener and event", function(){
            this._listener.onExecute1 = jasmine.createSpy('onExecute1');
            this._cmd.registerListener(this._listener, this._listener.onExecute);
            this._cmd.registerListener(this._listener, this._listener.onExecute1);

            this._cmd.execute();

            expect(this._listener.onExecute).toHaveBeenCalled();
            expect(this._listener.onExecute1).toHaveBeenCalled();
        });
    });

    describe("unregisterListener", function(){
        it("should do nothing if no handlers", function(){
            this._cmd.unregisterListener(this._listener);
        });
        it("should remove execute and change state handlers for listener", function(){
            this._cmd.registerListener(this._listener, this._listener.onExecute, this._listener.onStateChange);

            this._cmd.unregisterListener(this._listener);
            this._cmd.execute();

            expect(this._listener.onExecute).not.toHaveBeenCalled();
        });
        it("should remove only this listener handlers", function(){
            var obj = {onExecute: jasmine.createSpy('onExecute1')};
            this._cmd.registerListener(obj, obj.onExecute);
            this._cmd.registerListener(this._listener, this._listener.onExecute);
            this._cmd.unregisterListener(obj);
            this._cmd.execute();

            expect(obj.onExecute).not.toHaveBeenCalled();
            expect(this._listener.onExecute).toHaveBeenCalled();
        });
        it("should remove all handlers for listener", function(){
            this._listener.onExecute1 = jasmine.createSpy('onExecute1');
            this._cmd.registerListener(this._listener, this._listener.onExecute);
            this._cmd.registerListener(this._listener, this._listener.onExecute1);

            this._cmd.unregisterListener(this._listener);
            this._cmd.execute();

            expect(this._listener.onExecute).not.toHaveBeenCalled();
            expect(this._listener.onExecute1).not.toHaveBeenCalled();
        });
    });

    describe("execute", function(){
        it("should call the listener handlers for multiple listeners", function(){
            this._listener.onExecute1 = jasmine.createSpy('onExecute1');
            var obj = {onExecute: jasmine.createSpy('onExecute')};
            this._cmd.registerListener(this._listener, this._listener.onExecute);
            this._cmd.registerListener(this._listener, this._listener.onExecute1);
            this._cmd.registerListener(obj, obj.onExecute);

            this._cmd.execute();

            expect(this._listener.onExecute).toHaveBeenCalled();
            expect(this._listener.onExecute1).toHaveBeenCalled();
            expect(obj.onExecute).toHaveBeenCalled();
        });
        it("should do nothing if no one listens", function(){
            this._cmd.execute();
            expect(this._listener.onExecute).not.toHaveBeenCalled();
        });
        it("should increase _numTimesExecuted", function(){
            this._cmd.execute();
            expect(this._cmd.getNumTimesExecuted()).toBe(1);

            this._cmd.execute();
            expect(this._cmd.getNumTimesExecuted()).toBe(2);
        });
        it("should call the listener with the command as target", function(){
            var that = this;
             this._listener.onExecute = function(eventObj){
                 expect(eventObj.data).toBeDefined();
                 expect(eventObj.data.source).toBeUndefined();
                 expect(eventObj.type).toBe(that._cmd.EXECUTE_EVENT_NAME);
                 expect(eventObj.target).toBe(that._cmd);
             };
            spyOn(this._listener, 'onExecute').andCallThrough();
            this._cmd.registerListener(this._listener, this._listener.onExecute);

            this._cmd.execute();

            expect(this._listener.onExecute).toHaveBeenCalled();
        });
        it("should pass param and source when given to execute", function(){
            var that = this;
            this._listener.onExecute = function(eventObj){
                expect(eventObj.data).toBeDefined();
                expect(eventObj.data.source).toBe(3);
                expect(eventObj.data.passedData).toBe(2);
                expect(eventObj.type).toBe(that._cmd.EXECUTE_EVENT_NAME);
             };
            spyOn(this._listener, 'onExecute').andCallThrough();
            this._cmd.registerListener(this._listener, this._listener.onExecute);

            this._cmd.execute(2, 3);

            expect(this._listener.onExecute).toHaveBeenCalled();
        });
    });
    describe("enabled state", function(){
        it("should init enabled", function(){
            expect(this._cmd.isEnabled()).toBe(true);
        });
        it("should call the change state handlers on disables", function(){
            this._cmd.registerListener(this._listener, null, this._listener.onStateChange);

            this._cmd.disable();

            expect(this._cmd.isEnabled()).toBe(false);
            expect(this._listener.onStateChange).toHaveBeenCalled();
        });
        it("should call the change state handlers on enable", function(){
            this._cmd.registerListener(this._listener, null, this._listener.onStateChange);
            this._cmd.disable();

            this._cmd.enable();

            expect(this._cmd.isEnabled()).toBe(true);
            expect(this._listener.onStateChange).toHaveBeenCalled();
        });
        it("should not call listener handlers on execute if command is disabled", function(){
            this._cmd.registerListener(this._listener, this._listener.onExecute, this._listener.onStateChange);

            this._cmd.disable();
            this._cmd.execute();

            expect(this._listener.onExecute).not.toHaveBeenCalled();
        });
        it("should call listener handlers on execute when command is enabled again", function(){
             this._cmd.registerListener(this._listener, this._listener.onExecute, this._listener.onStateChange);
            this._cmd.disable();

            this._cmd.enable();
            this._cmd.execute();

            expect(this._listener.onExecute).toHaveBeenCalled();
        });
        it("should call the handlers with the new state as data", function(){

            var that = this;
            this._listener.onStateChange = function(eventObj){
                expect(eventObj.target).toBe(that._cmd);
                expect(eventObj.type).toBe(that._cmd.STATE_CHANGED_EVENT_NAME);
                expect(eventObj.data.currentState).toBeFalsy();
            };
            spyOn(this._listener, 'onStateChange').andCallThrough();
            this._cmd.registerListener(this._listener, null, this._listener.onStateChange);
            this._cmd.disable();

            expect(this._listener.onStateChange).toHaveBeenCalled();
        });
    });

});