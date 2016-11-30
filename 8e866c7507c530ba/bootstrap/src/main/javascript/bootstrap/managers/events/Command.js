/**
 * @class bootstrap.managers.events.Command
 */
define.Class("bootstrap.managers.events.Command", function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits("bootstrap.managers.events.EventDispatcherBase");

    def.utilize(["bootstrap.managers.commands.Command"]);

    def.statics({
        'EXECUTE_EVENT_NAME': 'execute',
        'STATE_CHANGED_EVENT_NAME': 'stateChanged'
    });

    /**
     * @lends bootstrap.managers.events.Command
     */
    def.methods({
        initialize: function(name){
            this._isEnabled = true;
            this._name = name;
            this._numTimesExecuted = 0;
            this._setEventSysId(name);
        },

        getNumTimesExecuted: function() {
            return this._numTimesExecuted;
        },

        registerListener : function(listener, onExecuteCB, onExecuteStateChangedCB) {
            if(onExecuteCB){
                this.on(this.EXECUTE_EVENT_NAME, listener, onExecuteCB);
            }
            if(onExecuteStateChangedCB){
                this.on(this.STATE_CHANGED_EVENT_NAME, listener, onExecuteStateChangedCB);
                // set initial enabled state, not sure why it's here..
                // onExecuteStateChangedCB.call(listener, this);
            }
        },

        unregisterListener : function(listener) {
            var listenerId = this._getObjectId(listener);
            this.injects().Events.removeEventsForListener(this.getEventsSysId(), listenerId);
        },

        getName : function() {
            return this._name;
        },

        execute : function(param, source) {
            if (! this._isEnabled) {
                return;
            }
            this._numTimesExecuted++;
            //think what to do with the source
            this.trigger(this.EXECUTE_EVENT_NAME, {'passedData': param, 'source': source});
        },

        enable : function() {
            this.setState(true);
        },

        disable : function() {
            this.setState(false);
        },
        setState : function(isEnabled) {
            if(this._isEnabled != isEnabled){
                this._isEnabled = isEnabled;
                this.trigger(this.STATE_CHANGED_EVENT_NAME, {'currentState': this._isEnabled});
            }
        },

        /**
         * Returns whether or not this command is enabled.
         */
        isEnabled : function() {
            return this._isEnabled;
        },

        isRemovingFromObjectsMapOnlyUponDeath: function(){
            return true;
        }
    });

});