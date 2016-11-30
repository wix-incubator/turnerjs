define.Class('bootstrap.managers.InputBindings', function(classDefinition){
    /*@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('bootstrap.managers.BaseManager');

    def.binds(['isStopCallback']);

    def.methods({
        initialize: function(){
            this._listener = Mousetrap;
            try{
                this._listener.unpause();
            } catch(errorMousetrap){
                console.error("throw new Error('Mousetrap not loaded');");
            }
        },

        isReady: function(){
            return true;
        },

        clone: function(){
            return new this.$class();
        },

        addBinding: function(keySequence, options, global){
            options = options || {};
            if(!keySequence){
                return;
            }
            var bind = (global)? 'bindGlobal': 'bind';
            var keypress = options.keypressType;
            var command = options.command;
            var param = options.commandParameter;
            if(!command && options.commandName){
                command = W.Commands.getCommand(options.commandName);
            }
            this._listener[bind](keySequence, function(e, combo){
                if(command && command.isEnabled()){
                    e.combo = combo;
                    command.execute(param, e);
                }
                // Canceling default even if the command is disabled.
                // Not testing for browser compatibility because we do not support IE<9 in editor
                e.preventDefault();
                e.stopPropagation();
                // Returning false to be on the safe side of preventing event propagation
                return false;
            }, keypress);
        },

        removeBinding: function(keySequence, keypressType){
            this._listener.unbind(keySequence, keypressType);
        },

        setKeysEnabled: function(isEnabled){
            if(isEnabled){
                this._listener.unpause();
            } else {
                this._listener.pause();
            }
        },

        getKeysEnabled: function(){
            return this._listener.isEnabled();
        },

        isStopCallback: function(event, element, combo, forceCheck){
            return this._listener.stopCallback(event, element, combo, forceCheck);
        }
    });
});