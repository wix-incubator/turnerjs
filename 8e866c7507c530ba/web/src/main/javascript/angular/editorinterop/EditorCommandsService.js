W.AngularManager.executeExperiment('NGCore', function () {
    'use strict';

    /**
     * @ngdoc service
     * @name editorInterop.factory:editorCommands
     * @description
     * Provides the ability to register and listen to editor commands and firing editor commands
     */

    angular.module('editorInterop').factory('editorCommands', function ($rootScope) {
        var commandsManager = W.Commands;

        var editorCommands = {

            _registeredCommands: [],

            /**
             * @ngdoc method
             * @name editorInterop.factory:editorCommands#listenToCommand
             * @methodOf editorInterop.factory:editorCommands
             * @description
             * Registers listenerScope to the event with the command name.
             * If this is the first listener to cmdName, it is added to editorCommands array of commands.
             * registers the given scope and callback to listen to the command
             * @param {string} cmdName The Command Name
             * @param {object} scope The scope to listen to the command
             * @param {function} callback function that will be called when the command is executed
             */
            listenToCommand: function (cmdName, scope, callback) {
                if (!_.contains(this._registeredCommands, cmdName)) {
                    this._registeredCommands.push(cmdName);
                    commandsManager.registerCommandAndListener(cmdName, this, this._broadcastCommand);
                }

                scope.$on(cmdName, callback);
            },

            _broadcastCommand: function (params, cmd) {
                var cmdName = cmd.command.getName();
                $rootScope.safeApply(function () {
                        $rootScope.$broadcast(cmdName, params);
                    }
                );
            },

            /**
             * @ngdoc method
             * @name editorInterop.factory:editorCommands#executeCommand
             * @methodOf editorInterop.factory:editorCommands
             * @description
             * Executes the command
             * If this is the first listener to cmdName, it is added to editorCommands array of commands.
             * @param {string} cmd the command name to execute
             * @param {object} param a pramaters object to pass to the command
             * @param  {string} source the source of the command
             */
            executeCommand: function (cmd, param, source) {
                commandsManager.executeCommand(cmd, param, source);
            }
        };
        return editorCommands;
    });
});