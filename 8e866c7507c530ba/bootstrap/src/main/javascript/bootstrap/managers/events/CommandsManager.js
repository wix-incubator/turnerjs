/**
 * @class bootstrap.managers.events.CommandsManager
 */
define.Class("bootstrap.managers.events.CommandsManager", function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('bootstrap.managers.BaseManager');

    def.utilize([
        'bootstrap.managers.events.Command',
        'bootstrap.managers.events.ElementEventDispatching'
    ]);

    /**
     * @lends bootstrap.managers.events.CommandsManager
     */
    def.methods({
        initialize : function() {
            //!!! will this make things work??!!
            new this.imports.ElementEventDispatching();
        },

        isReady : function() {
            return true;
        },

        /**
         * returns an existing command object registered under the provided name.
         * May fail, commands may be registered at any time, so a component may know only its command's
         * name and at some point some provider will register it.
         * @param cmd The name of a registered command, or a command object
         */
        getCommand : function(cmd) {
            var ret = null;
            if (cmd) {
                if (cmd instanceof this.imports.Command) {
                    ret = cmd;
                }
                else {
                    ret = this.injects().Events.getObjectById(cmd) || null;
                }
            }
            return ret;
        },

        /**
         * Registers a command to be used in the global scope
         * @param cmdName The name by which this command is known
         */
        registerCommand: function(cmdName) {
            var cmd = this.injects().Events.getObjectById[cmdName];
            if (cmd) {
                return cmd;
            }
            return new this.imports.Command(cmdName);
        },

        registerCommandListener: function(cmdName, listener, executeCB, changedCB) {
            var cmd = this.registerCommand(cmdName);
            cmd.registerListener(listener, executeCB, changedCB);
            return cmd;
        },

        registerCommandAndListener: function(cmdName, listener, executeCB, changedCB) {
            var cmd = this.registerCommand(cmdName);
            cmd.registerListener(listener, executeCB, changedCB);
            return cmd;
        },

        /**
         * Attempts to execute the provided command.
         * @param cmd String or Command object.
         * @param param The parameter passed to the command's execute method
         * @param source The command source passed to the command's execute method
         */
        executeCommand : function(cmd, param, source) {
            cmd = this.getCommand(cmd);
            if (cmd) {
                cmd.execute(param, source);
            }
        },

        /**
         * Registers a listener to a command. If the command hasn't been registered yet, it is kept in a
         * pending queue
         * @param cmdName
         * @param listener
         * @param executeCB
         * @param changedCB
         */
        registerCommandListenerByName: function (cmdName, listener, executeCB, changedCB) {
            this.registerCommandAndListener(cmdName, listener, executeCB, changedCB);
        },

        /**
         * Creats a command without registering it, should be removed
         * @param cmdName
         */
        createCommand : function(cmdName) {
            return new this.Command(cmdName);
        },

        unregisterCommand : function(cmdName) {
            var cmd = this.getCommand(cmdName);
            cmd.exterminate();
        },

        //TODO: think what happens when an object is disposed.. (when does the command die..?)
        unregisterListener : function(listener) {
            var listenerId = this.injects().Events.getObjectId(listener);
            if(listenerId){
                this.injects().Events.deleteObjectFromMaps(listenerId);
            }
        },
        isCommandInstance: function(object){
            return object instanceof this.imports.Command;
        }
    });

});