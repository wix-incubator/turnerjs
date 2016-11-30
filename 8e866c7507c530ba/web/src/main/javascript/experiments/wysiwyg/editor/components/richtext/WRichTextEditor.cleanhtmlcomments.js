define.experiment.component('wysiwyg.editor.components.richtext.WRichTextEditor.cleanhtmlcomments', function(componentDefinition, experimentStrategy) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    /**@type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        _getCKData:function() {
            if (this._ckEditor) {
                this._removeRedundantAttributes(this._ckEditor.editable().$);
                return this._removeHtmlComments(this._ckEditor.getData());
            } else {
                return this._dataBeforeStartEditing;
            }
        },
        _removeHtmlComments: function(text) {
            return text.replace(/<!--[^>]*>/g, "");
        }
    });
});
