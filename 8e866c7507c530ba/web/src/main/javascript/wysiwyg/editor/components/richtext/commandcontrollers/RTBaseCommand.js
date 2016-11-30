define.Class('wysiwyg.editor.components.richtext.commandcontrollers.RTBaseCommand', function(classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.binds(['executeCommand']);

    def.inherits('bootstrap.utils.Events');

    def.fields({
        _commandName: '',
        _controllerComponent: null,
        _cmd: null,
        _editorInstance: null,
        _defaultValue: 2
    });

    def.methods({

        initialize: function(commandInfo, controllerComponent) {
            this._commandName = commandInfo.command;
            this._controllerComponent = controllerComponent;
            this._defaultValue = commandInfo.defaultValue || this._defaultValue;
            this._addUserActionListener();
            this._biEvent = commandInfo.biEvent;
        },

        setEditorInstance: function (editorInstance) {
            this._editorInstance = editorInstance;
            this._cmd = this._editorInstance.getCommand(this._commandName);
        },

        _addUserActionListener: function() {
            this._controllerComponent.addEvent(this.getUserActionEventName(), this.executeCommand);
        },

        getUserActionEventName: function(){
            throw new Error("getUserActionEventName isn't implemented in " + this.getOriginalClassName());
            //should be implemented
        },

        executeCommand: function(value)  {
            if(this._biEvent) {
                LOG.reportEvent(this._biEvent);
            }
        },

        addStateChangeListener: function() {
            this._cmd.on('state', this._handleStateChange, this);
        },

        removeStateChangeListener: function() {
            this._cmd.removeListener('state', this._handleStateChange);
        },

        refreshState: function() {
            this._cmd.fire('state');
        },

        _handleStateChange: function(event) {
            throw new Error("_handleStateChange isn't implemented in " + this.getOriginalClassName());
            //should be implemented
        },

        _getDefaultValueAccordingToStyle: function() {
            return this._defaultValue;
        },

        resetControllersValues: function() {
            throw new Error("resetControllersValues isn't implemented in " + this.getOriginalClassName());
            //should be implemented
        }
    });
});