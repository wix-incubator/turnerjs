/**
 * @Class wysiwyg.editor.components.panels.FacebookCommentPanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.FacebookCommentPanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    /**
     * @lends wysiwyg.editor.components.panels.FacebookCommentPanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function(){

            this.addInputGroupField(function(){
                this.addSliderField(this._translate('FB_COMMENTS_NUM_OF_COMMENTS'), 1, 10, 1, false, true).bindToProperty("numPosts");
                this.addComboBox(this._translate('GENERAL_COLOR_SCHEME')).bindToProperty('colorScheme');
            });

            this.addAnimationButton();
        }
    });
});
