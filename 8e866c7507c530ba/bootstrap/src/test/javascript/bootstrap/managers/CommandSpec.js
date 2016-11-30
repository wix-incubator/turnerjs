xdescribe("Command manager and Command objects", function () {
    var testCommand,
        testParam = "param!";

    beforeEach(function () {

        testCommand = W.Commands.registerCommand("test.TestCommand");
        this.comp = window.ComponentsTestUtil.createAndBuildComp("test.basecomponent.Props", "test.basecomponent.props.Skin");

    });


    it('Should bind component enabled state to the command enabled state', function () {
        this.comp.compLogic.setCommand(testCommand.getName(), testParam);
        testCommand.disable();
        expect(this.comp.compLogic.isEnabled(), "Component should be disabled").toBeFalsy();
        testCommand.enable();
        expect(this.comp.compLogic.isEnabled(), "Component should be enabled").toBeTruthy();
    });

    it("Should bind component default action to the command and not call the command callback after the listener is unregistered", function () {
        this.comp.compLogic.setCommand(testCommand.getName(), testParam);
        this.onTestCommand = function (param, cmd) {
            expect(cmd.source, "Command source should be the component that activated it").toEqual(this.comp.compLogic);
            expect(param, "Component commandParameter should be sent to the command execute method").toEqual(testParam);
        };
        spyOn(this, 'onTestCommand').andCallThrough();
        testCommand.registerListener(this, this.onTestCommand, null);
        this.comp.compLogic.getViewNode().fireEvent('click');
        expect(this.onTestCommand).toHaveBeenCalled();
        this.onTestCommand.reset();
        testCommand.unregisterListener(this);
        this.comp.compLogic.getViewNode().fireEvent('click');
        expect(this.onTestCommand, "Command listener should not be called after the listener was unregistered").toHaveBeenCalledXTimes(0);


    });

    it("Should execute the component's command when the command is defined after the binding of the component and the command name", function () {
        var cmdName = "TestCommands.deferTest";
        this.comp.compLogic.setCommand(cmdName);
        this.cmdCallback = function (param) {
        };
        spyOn(this, 'cmdCallback').andCallThrough();
        this.comp.compLogic.getViewNode().fireEvent('click');
        expect(this.cmdCallback).toHaveBeenCalledXTimes(0);
        var cmd = W.Commands.registerCommand("TestCommands.deferTest")
        cmd.registerListener(this, this.cmdCallback, null);
        this.comp.compLogic.getViewNode().fireEvent('click');
        expect(this.cmdCallback, "Command listener should not be called after the listener was unregistered").toHaveBeenCalled();


    });

});

describe("Command Manager (W.Commands)", function () {
    var CMD_NAME = "test.TestCommand";
    var callback1 = function () {};
    var callback2 = function () {};

    beforeEach(function () {
        this.obj = {};
    });

    describe("createCommand", function () {
        it('should create new command without registering it', function () {
            var cmd = W.Commands.createCommand(CMD_NAME);
            var isCommand = cmd instanceof W.Commands.Command;
            expect(isCommand).toBeTruthy();
        });
    });

    describe("getCommand", function () {

        it('should return a command from the commandMap by name', function () {
            var cmd = W.Commands.registerCommand(CMD_NAME);
            var cmd1 = W.Commands.getCommand(CMD_NAME);
            expect(cmd === cmd1).toBeTruthy();
        });

        it('should return the command passed as argument if its a Command instance', function () {
            var cmd = W.Commands.registerCommand(CMD_NAME);
            var cmd1 = W.Commands.getCommand(cmd);
            expect(cmd === cmd1).toBeTruthy();
        });

        it('should return null if given non Command instance', function () {
            var cmd = W.Commands.getCommand({});
            expect(cmd).toBeNull();
        });

        it('should return null if command not found', function () {
            W.Commands.registerCommand(CMD_NAME);
            var cmd = W.Commands.getCommand('myCommand');
            expect(cmd).toBeNull();
        });

    });

    describe("registerCommand", function () {
        it('should register a new Command and add it to the command map', function () {
            W.Commands.registerCommand(CMD_NAME);
            expect(W.Commands._commandMap[CMD_NAME]).toBeDefined();
        });

        it('should register all pending listeners when a command is registered', function () {
            W.Commands.registerCommandListenerByName(CMD_NAME, this.obj, callback1, callback2);
            W.Commands.registerCommandListenerByName(CMD_NAME, this.obj, callback1, callback2);
            expect(W.Commands._pendingMap[CMD_NAME]).toBeDefined();
            W.Commands.registerCommand(CMD_NAME);
            expect(W.Commands._pendingMap[CMD_NAME]).toBeUndefined();

        });
    });

    describe("unregisterCommand", function () {
        it('should unregister Command and remove it from the command map', function () {
            W.Commands.unregisterCommand(CMD_NAME);
            expect(W.Commands._commandMap[CMD_NAME], 'Command is still defined after unregistering').toBeUndefined();
        });
    });

    describe("registerCommandListenerByName", function () {
        it('should add listener to a pendingMap queue if the command is not registered yet', function () {
            W.Commands.registerCommandListenerByName(CMD_NAME, this.obj, function cb() {
            }, function ccb() {
            });
            expect(W.Commands._pendingMap[CMD_NAME].length).toBe(1);
        });

        it('should push anther listener to a pendingMap queue if the command is not registered yet', function () {
            W.Commands.registerCommandListenerByName(CMD_NAME, this.obj, callback1, callback2);
            W.Commands.registerCommandListenerByName(CMD_NAME, this.obj, callback1, callback2);
            W.Commands.registerCommandListenerByName(CMD_NAME, this.obj, callback1, callback2);
            expect(W.Commands._pendingMap[CMD_NAME].length).toBe(3);
        });
    });

    describe("executeCommand", function () {
        it('should execute the command listeners', function () {
            var cmd = W.Commands.registerCommand(CMD_NAME);
            spyOn(cmd, 'execute');
            var param = {param:'param'};
            var source = {source:'source'};
            W.Commands.executeCommand(CMD_NAME, param, source);
            expect(cmd.execute).toHaveBeenCalledWith(param, source);
            // expect(cmd.execute.mostRecentCall.args[0]).toBe(param);
            // expect(cmd.execute.mostRecentCall.args[1]).toBe(source);
        });

    });

});

describe("Command Object", function () {

    var CMD_NAME = "test.TestCommand";


    beforeEach(function () {
        this.obj = {};
        this.cmd = W.Commands.registerCommand(CMD_NAME);
        this.callback1 = jasmine.createSpy('callback1');
        this.callback2 = jasmine.createSpy('callback2');
    });

    describe("getNumTimesExecuted", function () {
        it('should return the number of executions for a command', function () {
            this.cmd.execute({},{});
            expect(this.cmd.getNumTimesExecuted()).toBe(1);
        });

        it('should return the number of executions for a command', function () {
            this.cmd.execute({},{});
            this.cmd.execute({},{});
            this.cmd.execute({},{});
            this.cmd.execute({},{});
            expect(this.cmd.getNumTimesExecuted()).toBe(4);
        });

    });

    describe("registerListener", function () {
        it('should add listener object to the _listeners array', function () {
            this.cmd.registerListener(this.obj, this.callback1);
            expect(this.cmd._listeners.length).toBe(1);
        });

        it('should call the onExecuteStateChangedCB (this.callback2) on registration', function () {
            this.cmd.registerListener(this.obj, this.callback1, this.callback2);
            expect(this.callback2).toHaveBeenCalled();
        });

    });

    describe("unregisterListener", function () {
        it('should remove listener object to the _listeners array', function () {
            this.cmd.registerListener(this.obj, this.callback1);
            this.cmd.unregisterListener(this.obj);
            expect(this.cmd._listeners.length).toBe(0);
        });
    });

    describe("dispose", function () {
        it('should remove all listener objects from _listeners array', function () {
            this.cmd.registerListener(this.obj, this.callback1);
            this.cmd.registerListener(this.obj, this.callback1);
            this.cmd.registerListener(this.obj, this.callback1);
            this.cmd.dispose();
            expect(this.cmd._listeners.length).toBe(0);
        });

    });


    describe("getName", function () {
        it('should return the name of the registered command', function () {
            expect(this.cmd.getName()).toBe(CMD_NAME);
        });
    });

    describe("execute", function () {
        it('should increment the _numTimesExecuted', function () {
            this.cmd.execute({},{});
            expect(this.cmd.getNumTimesExecuted()).toBe(1);
            this.cmd.execute({},{});
            expect(this.cmd.getNumTimesExecuted()).toBe(2);
            this.cmd.execute({},{});
            expect(this.cmd.getNumTimesExecuted()).toBe(3);
            this.cmd.execute({},{});
            expect(this.cmd.getNumTimesExecuted()).toBe(4);
        });

        it('should do nothing if disabled', function () {
            this.cmd.disable();
            this.cmd.execute({},{});
            expect(this.cmd.getNumTimesExecuted()).toBe(0);
        });

    });

    describe("setState", function () {

        it('should change the state of the command', function () {
            this.cmd.setState(false);
            expect(this.cmd.isEnabled()).toBe(false);
            this.cmd.setState(true);
            expect(this.cmd.isEnabled()).toBe(true);
            this.cmd.setState(false);
            expect(this.cmd.isEnabled()).toBe(false);
        });

    });


    describe("isEnabled", function () {

        it('should return the state of the command', function () {
            this.cmd.isEnabled();
            expect(this.cmd.isEnabled()).toBe(true);
        });

        it('should return the state of the command', function () {
            this.cmd.setState(false);
            this.cmd.isEnabled();
            expect(this.cmd.isEnabled()).toBe(false);
        });

    });



});
