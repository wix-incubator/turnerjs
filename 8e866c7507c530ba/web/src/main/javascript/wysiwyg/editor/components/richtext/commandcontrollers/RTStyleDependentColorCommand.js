define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTStyleDependentColorCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTBaseCommand');

    def.traits(['wysiwyg.editor.components.richtext.commandcontrollers.traits.RTStyleDependent']);

    def.fields({
        //the weired flag that saves whether there is a color override currently
        _isDefaultColor: false
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
        _getColorFromState: function(state) {
            if (state) {
                return state.substring(state.indexOf("(") + 1, state.indexOf(")"));
            }

            return undefined;
        },
        _handleStateChange: function(event) {
            var state = event.sender.state;
            var colorDefaultValue = this._getDefaultValueAccordingToStyle();
            this._isDefaultColor = (state === Constants.CkEditor.TRISTATE.OFF || state === Constants.CkEditor.TRISTATE.DISABLED);
            var value = this._isDefaultColor ? colorDefaultValue : this._getColorFromState(state);
            this._controllerComponent.setColor(value);
        },

        _isDefaultOptionSelected: function() {
            return this._isDefaultColor != false;
        },

        _setControllerSelection: function(value) {
            this._controllerComponent.setColor(value);
        },

        resetControllersValues: function() {
            var defaultValue = this._getDefaultValueAccordingToStyle();
            this._editorInstance.execCommand(this._commandName, defaultValue);
        },
        _styleValueChanged: function(value){
            this._controllerComponent.setResetDisplayColor(value);
        }

    });
});