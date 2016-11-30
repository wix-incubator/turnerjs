define.experiment.component('wysiwyg.editor.components.panels.MultiSelectProxyPanel.animationNewBehaviors', function(classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    var strategy = experimentStrategy;

    def.methods({
        initialize: strategy.after(function(compId, viewNode, args) {
            args.previewComponent.on('change', this, this._updatePanel);
            this._renderTriggers.push(Constants.DisplayEvents.DISPLAYED);
        }),
        _updatePanel: function(multiComp, selectedComps) {
            this.disposeFields();
            this._createFieldsOnRender = true;
            this._renderIfReady();
        }

    });
});
