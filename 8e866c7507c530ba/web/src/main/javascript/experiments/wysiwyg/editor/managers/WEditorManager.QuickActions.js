define.experiment.Class('wysiwyg.editor.managers.editormanager.WEditorManager.QuickActions', function (classDefinition, experimentStrategy) {
    /**@type core.managers.component.ClassDefinition*/
    var def = classDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.utilize(strategy.merge([
        'wysiwyg.editor.components.quickactions.AddComponentActionsProvider',
        'wysiwyg.editor.components.quickactions.HelpCenterActionsProvider',
        'wysiwyg.editor.components.quickactions.ShortcutActionsProvider'
    ]));

    def.methods({
        initialize: strategy.after(function() {
            var addComponentActionsProvider = new this.imports.AddComponentActionsProvider();
            var helpCenterActionsProvider = new this.imports.HelpCenterActionsProvider();
            var shortcutActionsProvider = new this.imports.ShortcutActionsProvider();
        })
    });
});

//bootCamp
