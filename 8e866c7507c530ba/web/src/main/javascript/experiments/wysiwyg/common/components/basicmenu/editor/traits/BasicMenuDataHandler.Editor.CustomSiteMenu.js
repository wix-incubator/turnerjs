define.experiment.Class('wysiwyg.common.components.basicmenu.editor.traits.BasicMenuDataHandler.CustomSiteMenu', function(classDefinition, experimentStrategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition,
        strategy = experimentStrategy;

    def.methods({

        _onMainMenuDataChange: strategy.remove(),

        _createMenuNonPersistentData: strategy.remove(),

        _removePagesEventListeners: strategy.remove(),

        _removeHiddenPagesEventListeners: strategy.remove(),

        _addPagesEventListeners: strategy.remove(),

        _addHiddenPagesEventListeners: strategy.remove()
    });
});