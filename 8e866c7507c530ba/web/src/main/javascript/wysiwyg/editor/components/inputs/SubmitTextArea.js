/**
 * @Class wysiwyg.editor.components.inputs.SubmitTextArea
 * @extends wysiwyg.editor.components.inputs.SubmitInput
 */
define.component('wysiwyg.editor.components.inputs.SubmitTextArea', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.SubmitInput");

    def.skinParts({
        label: {type: 'htmlElement'},
        input: {type: 'htmlElement'},
        button: {type: 'wysiwyg.editor.components.WButton', argsObject:{}},
        message: {type: 'htmlElement'}
    });

    /**
     * @lends wysiwyg.editor.components.inputs.SubmitTextArea
     */
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._height = args.height || null;
        },

        _onAllSkinPartsReady:function(){
            this.parent();
            this._skinParts.input.setStyle('height', this._height);
        },

        /**
         * Overide (don't submit on enter)
         * @param e
         */
        _inputEventHandler: function(e){
            // DONT Submit on Enter
            if (e && e.code && e.code == 13){
                return false;
            }
            // ignore tab and shift keys
            return !W.Utils.isInputKey(e.code);
        }
    });
});