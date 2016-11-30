define.experiment.component('wysiwyg.viewer.components.inputs.ComboBoxInput.AppBuilderTagsEditor', function (def, strategy) {
    def.binds(strategy.merge(['_onFocus']));

    def.methods({
        _onAllSkinPartsReady: strategy.after(function () {
            this._skinParts.collection.addEvent(Constants.CoreEvents.FOCUS, this._onFocus);
        }),

        _onFocus: function () {
            this.fireEvent('focus');
        }
    });
});

