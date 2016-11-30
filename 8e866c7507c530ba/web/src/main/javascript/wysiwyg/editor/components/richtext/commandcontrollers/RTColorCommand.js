define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTColorCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTBaseCommand');

    def.fields({
        //the weired flag that saves whether there is a color override currently
        _isDefaultColor: false
    });

    def.statics({
        WHITE: "#FFFFFF"
    });

    def.methods({

        initialize: function(commandInfo, controllerComponent) {
            this.parent(commandInfo, controllerComponent);
        },

        _addUserActionListener: function() {
            this._controllerComponent.startListeningToButtonParts();
            this.parent();
        },

        getUserActionEventName: function(){
            return Constants.CoreEvents.CHANGE;
        },

        executeCommand: function(event)  {
            if (!this._editorInstance) {
                //bi error?
                return;
            }
            var value = event.value;
            if(value === this._controllerComponent.RESET_COLOR_FLAG){
                value = Constants.CkEditor.TRISTATE.OFF;
            }
            this._editorInstance.execCommand(this._commandName, value);
        },

        _styleValueChanged: function(value){
            this._controllerComponent.setResetDisplayColor(value);
        },

        _handleStateChange: function(event) {
            var state = event.sender.state;
            if (state === Constants.CkEditor.TRISTATE.OFF || state === Constants.CkEditor.TRISTATE.DISABLED) {
                this._controllerComponent.setColor(this.WHITE);
            } else {
                var value = state.substring(state.indexOf("(") + 1, state.indexOf(")"));
                this._controllerComponent.setColor(value);
            }
        },

        resetControllersValues: function() {
            var defaultValue = this._defaultValue;
            this._editorInstance.execCommand(this._commandName, defaultValue);
        }

    });
});