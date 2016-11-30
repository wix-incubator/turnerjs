define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTDualCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;


    def.inherits('wysiwyg.editor.components.richtext.commandcontrollers.RTBaseCommand');

    def.methods({

        initialize: function(commandInfo, controllerComponent) {
            this.parent(commandInfo, controllerComponent);
            this._changeControllerComponentState(this._defaultValue);
        },

        getUserActionEventName: function(){
            return Constants.CoreEvents.CLICK;
        },

        executeCommand: function()  {
            this.parent();
            if (!this._editorInstance) {
                //bi error?
                return;
            }

            if (this._commandName === 'wixUnlink') {
                this.executeUnlinkCommand();
            }
            this._editorInstance.execCommand(this._commandName);
        },

        _handleStateChange: function(event) {
            this._changeControllerComponentState(event.sender.state);
        },

        _changeControllerComponentState: function(state){
            switch (state) {
                case 0:  //Constants.CkEditor.TRISTATE.DISABLED
                    this._controllerComponent.disable();
                    break;
                case 2: //Constants.CkEditor.TRISTATE.OFF
                    this._controllerComponent.removeState('selected');
                    this._controllerComponent.enable();
                    break;
                case 1:  //Constants.CkEditor.TRISTATE.ON
                    this._controllerComponent.setState('selected');
                    break;
                default:
                    throw "there is no such command state" + state;
            }
        },

        executeUnlinkCommand: function () {
            if (!this._editorInstance) {
                //bi error?
                return;
            }
            var isLinked = CKEDITOR.plugins.wixlink.getSelectedLink(this._editorInstance);
            var isUnderlined = this._editorInstance.getCommand('underline').state === Constants.CkEditor.TRISTATE.ON;
            if (isLinked && isUnderlined) {
                this._editorInstance.execCommand('underline');
            }
        },

        resetControllersValues: function () {
            if (this._cmd.state === Constants.CkEditor.TRISTATE.DISABLED && this._defaultValue !== Constants.CkEditor.TRISTATE.DISABLED) {
                this._cmd.enable();
            }
            if (this._defaultValue !== this._cmd.state) {
                switch (this._defaultValue) {
                    case Constants.CkEditor.TRISTATE.DISABLED:
                        this._cmd.disable();
                        break;
                    case Constants.CkEditor.TRISTATE.OFF:
                    case Constants.CkEditor.TRISTATE.ON:
                        this._editorInstance.execCommand(this._commandName);
                        break;
                    default:
                        throw "there is no such command state" + this._defaultValue;
                }
            }
        }
    });
});