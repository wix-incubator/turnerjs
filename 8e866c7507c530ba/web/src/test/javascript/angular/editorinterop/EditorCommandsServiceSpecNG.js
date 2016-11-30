describe('Unit: editorCommands', function () {
    'use strict';

    var editorCommands;

    var commandName = 'someCommand';
    var command = {
        command: {
            getName: function() {
                return commandName;
            }
        }
    };
    var params = {
        param1: 'val1'
    };

    beforeEach(module('editorInterop'));

    beforeEach(inject(function (_editorCommands_) {
        editorCommands = _editorCommands_;
    }));

    describe('executeCommand', function() {
        it('Should trigger CommandsManager.executeCommand with the command name and params', function() {
            spyOn(W.Commands, 'executeCommand').and.returnValue();
            editorCommands.executeCommand(commandName, params, editorCommands);

            expect(W.Commands.executeCommand).toHaveBeenCalledWith(commandName, params, editorCommands);
        });
    });

    describe('listenToCommand', function() {
        it('should call commandsManager.registerCommandAndListener once for the same command', inject(function ($rootScope) {
            spyOn(W.Commands, 'registerCommandAndListener').and.returnValue();

            editorCommands.listenToCommand(commandName, $rootScope);
            editorCommands.listenToCommand(commandName, $rootScope);

            expect(W.Commands.registerCommandAndListener.calls.count()).toEqual(1);
        }));

        it('should call commandsManager.registerCommandAndListener with the command name', inject(function ($rootScope) {
            spyOn(W.Commands, 'registerCommandAndListener').and.returnValue();

            editorCommands.listenToCommand(commandName, $rootScope);

            expect(W.Commands.registerCommandAndListener.calls.mostRecent().args[0]).toEqual(commandName);
        }));
    });

    describe('_broadcastCommand', function() {
        it('should broadcast the command name and parameters on the root scope', inject(function($rootScope) {
            $rootScope.safeApply = $rootScope.$apply; // no need for safe apply here...
            spyOn($rootScope, '$broadcast').and.returnValue();

            editorCommands._broadcastCommand(params, command);

            expect($rootScope.$broadcast).toHaveBeenCalledWith(commandName, params);
        }));
    });
});