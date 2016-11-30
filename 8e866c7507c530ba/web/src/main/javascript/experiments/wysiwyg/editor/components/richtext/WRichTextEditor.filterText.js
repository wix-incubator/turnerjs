define.experiment.component('wysiwyg.editor.components.richtext.WRichTextEditor.filterText', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _getCKData:function() {
            if (this._ckEditor) {
                this.resources.W.Data.removeRedundantNodesAndAttributes(this._ckEditor.editable().$);
                return this.resources.W.Data._removeHtmlComments(this._ckEditor.getData());
            } else {
                return this._dataBeforeStartEditing;
            }
        }
    });
});
