/**
 * @class bootstrap.managers.commands.Command
 */
define.Class("bootstrap.managers.commands.Command", function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    /**
     * @lends bootstrap.managers.commands.Command
     */
    def.methods({
        initialize:function (_name) {
            /**
             * The listeners bound to this command
             */
            this._listeners = [];
            this._zombies = [];
            this._isEnabled = true;
            this._name = _name;
            this._numTimesExecuted = 0;

            /**
             * A flag that indicates that we're in the process of looping over listeners
             */
            this._broadcasting = false;
        },

        getNumTimesExecuted:function () {
            return this._numTimesExecuted;
        },

        registerListener:function (listener, onExecuteCB, onExecuteStateChangedCB) {
            var ind = this._findListenerIndex(listener, onExecuteCB);
            //TODO report error if the listener is already registered
            if (ind < 0) {

                this._listeners.push({
                    listener:listener,
                    onExecute:onExecuteCB,
                    onEnabledChanged:onExecuteStateChangedCB
                });
                // set initial enabled state
                if (onExecuteStateChangedCB) {
                    onExecuteStateChangedCB.call(listener, this);
                }
            }
        },

        unregisterListener:function (listener) {
            if (this._broadcasting) {
                this._zombies.push(listener);
            }
            else {
                var ind;
                while ((ind = this._findListenerIndex(listener)) >= 0) {
                    this._listeners.splice(ind, 1);
                }
            }
        },

        dispose:function () {
            this._listeners = [];
        },

        getName:function () {
            return this._name;
        },

        execute:function (param, source) {
            if (!this._isEnabled) {
                return;
            }
            var cmd = {
                command:this,
                source:source
            };
            //W.Utils.log('Commands', this._name);
            this._numTimesExecuted++;
            this._broadcast("onExecute", [param, cmd]);
        },

        setState:function (isEnabled) {
            this._setEnabled(!!isEnabled);
        },

        enable:function () {
            this._setEnabled(true);
        },

        disable:function () {
            this._setEnabled(false);
        },

        /**
         * Returns whether or not this command is enabled.
         */
        isEnabled:function () {
            return this._isEnabled;
        },

        _broadcast:function (cbName, args) {
            var len = this._listeners.length;
            this._broadcasting = true;
            for (var ind = 0; ind < len; ++ind) {
                try {
                    var rec = this._listeners[ind];
                    var cb = rec[cbName];
                    if (cb) {
                        cb.apply(rec.listener, args);
                    }
                }
                catch (e) {
                    // report errors
                    W.Utils.debugTrace("Exception while processing command", this.getName(), e, e.stack || '');
                    if (W.Config.getDebugMode() == 'debug'){
                        throw e;
                    }
                    // Always report save command failure
                    if (this.getName() === 'WEditorCommands.Save') {
                        LOG.reportError(wixErrors.SAVE_COMMAND_EXECUTE_EXCEPTION, this.$className, this.getName(), e.stack);
                        W.Commands.executeCommand('WEditorCommands.UnlockSaveFreezeAfterException', null, null);
                    } else {
                        var description = ('source: ' +  W.Config.env.$frameName + ', stack: ' + e.stack);
                        LOG.reportError(wixErrors.COMMAND_EXECUTE_EXCEPTION, this.$className, this.getName(), description);
                    }
                }
            }
            this._broadcasting = false;
            this._cleanupZombies();
        },

        /**
         * Set the enabled state of this command
         * @param isEnabled
         */
        _setEnabled:function (isEnabled) {
            isEnabled = !!isEnabled; // convert to bool
            if (isEnabled != this._isEnabled) {
                this._isEnabled = isEnabled;
                this._broadcastEnabledChanged();
            }
        },

        _broadcastEnabledChanged:function () {
            this._broadcast("onEnabledChanged", [this]);
        },

        _cleanupZombies:function () {
            var ind;

            if (0 >= this._zombies.length) {
                return;
            }
            for (var i = this._zombies.length - 1; i >= 0; --i) {
                var zombie = this._zombies[i];
                while ((ind = this._findListenerIndex(zombie)) >= 0) {
                    this._listeners.splice(ind, 1);
                }
            }
            this._zombies = [];
        },

        /**
         * Returns first occurrence of listener registered with the specified criterias.
         * @param listener      Listener object
         * @param onExecuteCB   Callback function (optional)
         */
        _findListenerIndex:function (listener, onExecuteCB) {
            var l = this._listeners;
            for (var i = l.length - 1; i >= 0; --i) {
                if (l[i].listener === listener &&
                    (onExecuteCB === undefined || l[i].onExecute === onExecuteCB)) {
                    return i;
                }
            }
            return -1;
        }
    });
});
