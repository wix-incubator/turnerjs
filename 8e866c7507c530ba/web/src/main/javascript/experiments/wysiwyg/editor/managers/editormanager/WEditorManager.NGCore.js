define.experiment.Class("wysiwyg.editor.managers.editormanager.WEditorManager.NGCore", function(classDefinition, experimentStrategy) {

    var def = classDefinition ;

    var strategy = experimentStrategy ;

    def.methods({
        _setEditorWiring: strategy.after(function() {
            this._editorUI.bootstrapAngularPanels() ;
        })
    }) ;
}) ;