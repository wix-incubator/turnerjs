/**
 * @class wysiwyg.editor.components.richtext.ToolBar
 */
define.experiment.component('wysiwyg.editor.components.richtext.ToolBar.SuperRichTextMenuToggle', function (componentDefinition, experimentStrategy) {
    /** @type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;
    /** @type bootstrap.managers.experiments.ExperimentStrategy*/
    var strategy = experimentStrategy;

    def.methods({
        initialize: strategy.after(function(){
            this._isRichMedia = true;
        })
    });
});
