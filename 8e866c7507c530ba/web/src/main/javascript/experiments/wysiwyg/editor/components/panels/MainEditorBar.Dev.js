define.experiment.component('wysiwyg.editor.components.panels.MainEditorBar.Dev',  function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    /** @type bootstrap.managers.experiments.ExperimentStrategy */
    var strategy = experimentStrategy;

   def.resources(['W.EditorDialogs']);
    def.methods({
       initialize: strategy.after(function(compId, viewNode, args){
           this._isDebugActions = true;
       })
   });
});
