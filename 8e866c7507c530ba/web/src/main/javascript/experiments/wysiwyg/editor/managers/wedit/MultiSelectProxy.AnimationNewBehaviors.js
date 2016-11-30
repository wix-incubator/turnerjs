define.experiment.Class('wysiwyg.editor.managers.wedit.MultiSelectProxy.AnimationNewBehaviors', function(classDefinition, experimentStrategy) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;
    var strategy = experimentStrategy;

    def.inherits('core.events.EventDispatcher');

    def.traits([
        'bootstrap.utils.Events'
    ]);

    def.methods({
        setSelectedComps: strategy.after(function(selected) {
            this.trigger('change', [this, selected]);
        })
    });
});
