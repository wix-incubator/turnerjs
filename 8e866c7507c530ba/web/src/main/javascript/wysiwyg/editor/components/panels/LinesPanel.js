/**
 * @Class wysiwyg.editor.components.panels.LinesPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.LinesPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.binds(['_createStylePanel']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.dataTypes(['']);

    /**
     * @lends wysiwyg.editor.components.panels.LinesPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function(){
            this.injects().Data.getDataByQuery("#STYLES", this._createStylePanel);
            var options = {
                options: [
                    {value: 'fill',     label: 'Auto-Crop'},
                    {value: 'full',     label: 'Center'},
                    {value: 'stretch',  label: 'Stretch'},
                    {value: 'fitWidth', label: 'Fit-Width'}
                ]
            };

            this.addAnimationButton();
        }
    });
});