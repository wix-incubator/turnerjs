define.experiment.component('wysiwyg.editor.components.inputs.Input.OnlineClock', function (componentDefinition, strategy) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.binds(strategy.merge(['_fireFocus']));

    def.methods({
        _fireFocus: function (e) {
            this.fireEvent(Constants.CoreEvents.FOCUS, e);
        },

        _listenToInput: strategy.after(function () {
            this._skinParts.input.addEvent(Constants.CoreEvents.FOCUS, this._fireFocus);
        }),

        _stopListeningToInput: strategy.after(function () {
            this._skinParts.input.removeEvent(Constants.CoreEvents.FOCUS, this._fireFocus);
        })
    });
});