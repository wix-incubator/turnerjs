describe("events.CommandsManager", function(){
    testRequire().classes('bootstrap.managers.events.CommandsManager');
    beforeEach(function(){
        this._cmdMng = new this.CommandsManager();
        this._listener = {
            onExecute: jasmine.createSpy('onExecute'),
            onStateChange: jasmine.createSpy('onStateChange')
        };
    });

    describe("registerCommand", function(){
        it("should return create a command and return the instance", function(){
            var cmd = this._cmdMng.registerCommand('testCmd');
            expect(cmd.getName()).toBe('testCmd');
        });
        it("should return the command instance if it already exists", function(){
            this._cmdMng.registerCommand('testCmd');
            var cmd = this._cmdMng.registerCommand('testCmd');
            expect(cmd.getName()).toBe('testCmd');
        });
    });
    describe("getCommand", function(){
        it("should return null if no such command", function(){
            expect(this._cmdMng.getCommand('testCmd')).toBeNull();
        });
        it("should return the command when the command is registered", function(){
            var cmd = this._cmdMng.registerCommand('testCmd');

            expect(this._cmdMng.getCommand(cmd)).toBe(cmd);
        });
        it("should return the command with the specified name when the command is registered", function(){
            var cmd = this._cmdMng.registerCommand('testCmd');

            expect(this._cmdMng.getCommand('testCmd')).toBe(cmd);
        });
        it("should return null if a non string or command object is passed", function(){
            expect(this._cmdMng.getCommand({})).toBeNull();
        });
        it("should return the command even after all the listeners have been removed", function(){
            var cmd = this._cmdMng.registerCommand('testCmd');
            this._cmdMng.registerCommandListenerByName('testCmd', this._listener, this._listener.onExecute);
            cmd.unregisterListener(this._listener);

            cmd = this._cmdMng.getCommand('testCmd');
            expect(cmd.getName()).toBe('testCmd');
        });
        it("should not return the command if the command has been unregistered", function(){
            var cmd = this._cmdMng.registerCommand('testCmd');
            this._cmdMng.unregisterCommand('testCmd');

            expect(this._cmdMng.getCommand('testCmd')).toBeNull();
        });
    });

    describe("register listener and execute", function(){
        it("should register the command if there isn't one", function(){
            this._cmdMng.registerCommandListenerByName('testCmd', this._listener);
            var cmd = this._cmdMng.getCommand('testCmd');

            expect(cmd.getName()).toBe('testCmd');
        });
        it("should call the handler function on execute", function(){
            this._cmdMng.registerCommandListenerByName('testCmd', this._listener, this._listener.onExecute);
            this._cmdMng.executeCommand('testCmd');

            expect(this._listener.onExecute).toHaveBeenCalled();
        });
        it("should call the change state handler on disable", function(){
            this._cmdMng.registerCommandListenerByName('testCmd', this._listener, this._listener.onExecute, this._listener.onStateChange);
            var cmd = this._cmdMng.getCommand('testCmd');

            cmd.disable();

            expect(this._listener.onStateChange).toHaveBeenCalled();
        });
        it("should do nothing if there is no such command to execute", function(){
            this._cmdMng.executeCommand('testCmd');
            expect(this._listener.onExecute).not.toHaveBeenCalled();
        });
    });
});