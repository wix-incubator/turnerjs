define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTJustifyCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTDropDownCommand');

    def.statics({
        justifyCommands: ['justifyleft', 'justifyright', 'justifycenter', 'justifyblock']
    });

    def.fields({
        _cmdInstances: []
    });

    def.methods({

        initialize: function(commandInfo, controllerComponent) {
            this.parent(commandInfo, controllerComponent);
        },

        setEditorInstance: function (editorInstance) {
            this._editorInstance = editorInstance;
        },

        executeCommand: function(event)  {
            if (!this._editorInstance) {
                //bi error?
                return;
            }

            var value = event.get(this._key);
            this._editorInstance.execCommand(value);
            if (this._biEvent) {
                var commandValue = event.get("command");
                LOG.reportEvent(this._biEvent,{c1: commandValue });
            }
        },

        _handleStateChange: function(event) {
            var selectedOption;
            var state = event.sender.state;
            var commandName = event.sender.name;

            if (state === Constants.CkEditor.TRISTATE.ON) {
                selectedOption = this._getOptionFromMenu(commandName);
                selectedOption && this._controllerComponent.setSelected(selectedOption);
            }
        },

        addStateChangeListener: function() {
            this.justifyCommands.forEach(function(commandName){
                var cmd = this._editorInstance.getCommand(commandName);
                this._cmdInstances.push(cmd);
                cmd.on('state', this._handleStateChange, this);
            }, this);
        },

        removeStateChangeListener: function() {
            this._cmdInstances.forEach(function(cmd){
                cmd.removeListener('state', this._handleStateChange);
            }, this);

        }
    });
});