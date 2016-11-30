/**
 * @Class wysiwyg.editor.components.panels.GooglePlusOnePanel
 * @extends wysiwyg.editor.components.panels.base.AutoPanel
 */
define.component('wysiwyg.editor.components.panels.GooglePlusOnePanel', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.panels.base.AutoPanel");

    def.traits(['core.editor.components.traits.DataPanel']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    /**
     * @lends wysiwyg.editor.components.panels.GooglePlusOnePanel
     */
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },

        _createFields: function(){
            this.addComboBox(this._translate('GOOGLE_PLUS_ONE_BUTTON_SIZE')).bindToProperty('size');
            this.addComboBox(this._translate('GOOGLE_PLUS_ONE_BUTTON_STYLE')).bindToProperty('annotation');

            this.addAnimationButton();
        }
    });
});
