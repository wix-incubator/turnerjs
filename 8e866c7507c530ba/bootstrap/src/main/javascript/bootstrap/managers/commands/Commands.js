/**
 * @class bootstrap.managers.commands.Commands
 */
define.Class("bootstrap.managers.commands.Commands", function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits("bootstrap.managers.BaseManager");

    def.utilize(['bootstrap.managers.commands.Command']);

    /**
     * @lends bootstrap.managers.commands.Commands
     */
    def.methods({
        initialize : function() {
            this._commandMap = {};
            this._pendingMap = {};
            this.Command = this.imports.Command;
            return this;
        },

        ///// Begin general manager interface //////////
        isReady : function() {
            return true;
        },

        clone: function(newDefine) {
            return this.parent(newDefine);
        },

        ///// End general manager interface //////////

        toString : function() {
            return "[Commands Manager]";
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
                if (cmd instanceof this.Command) {
                    ret = cmd;
                }
                else {
                    ret = this._commandMap[cmd] || null;
                }
            }
            return ret;
        },

        /**
         * Registers a command to be used in the global scope
         * @param cmdName The name by which this command is known
         */
        registerCommand : function(cmdName, acceptDuplicate) {
            var cmd = this._commandMap[cmdName];
            if (cmd) {
                return cmd;
            }
            cmd  = this.createCommand(cmdName);
            this._commandMap[cmdName] = cmd;
            var queue = this._pendingMap[cmdName];
            if (queue) {
                for (var i = 0; i < queue.length; ++i) {
                    var rec = queue[i];
                    cmd.registerListener(rec.listener, rec.executeCB, rec.changedCB);
                }
                delete this._pendingMap[cmdName];
            }
            return cmd;
        },

        /**
         *
         * @param cmdName
         * @param listener
         * @param executeCB
         * @param changedCB
         * @param acceptDuplicate
         * @returns {*}
         */
        registerCommandAndListener : function(cmdName, listener, executeCB, changedCB, acceptDuplicate) {
            var cmd = this.registerCommand(cmdName, acceptDuplicate);
            cmd.registerListener(listener, executeCB, changedCB);
            return cmd;
        },

        /**
         * Attempts to execute the provided command.
         * @param cmd String or Command object.
         * @param param The parameter passed to the command's execute method
         * @param [source] The command source passed to the command's execute method
         */
        executeCommand : function(cmd, param, source) {
            var t = typeof(cmd);
            if ('string' == t) {
                cmd = this.getCommand(cmd);
            }
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
         * @param [changedCB]
         */
        registerCommandListenerByName : function (cmdName, listener, executeCB, changedCB) {
            var cmd = this.getCommand(cmdName);
            if (cmd) {
                cmd.registerListener(listener, executeCB, changedCB);
            }
            else {
                var queue = this._pendingMap[cmdName] || [];
                queue.push({
                    listener : listener,
                    executeCB : executeCB,
                    changedCB : changedCB
                });
                this._pendingMap[cmdName] = queue;
            }
        },

        /**
         * Creats a command without registering it
         * @param cmdName
         */
        createCommand : function(cmdName) {
            return new this.Command(cmdName);
        },

        unregisterCommand : function(cmdName) {
            var cmd = this._commandMap[cmdName];
            if (cmd) {
                cmd.dispose();
                delete this._commandMap[cmdName];
            }
        },

        unregisterListener : function(listener) {
            for (var key in this._commandMap) {
                var cmd  = this._commandMap[key];
                cmd.unregisterListener(listener);
            }
        }
    });
});