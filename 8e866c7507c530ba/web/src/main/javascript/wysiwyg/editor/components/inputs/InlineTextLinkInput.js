/**
 * this button input imitates a link, which is in the middle of a test.
 * it is composed of three parts:
 * a. the button - InputButton, with a ref link like skin.
 * b. prefixText - the text that precedes the link
 * c. prefixText - the text that follows the link
 *
 * at the end, the result will be:  <prefixText> <link> <postfixText>
 *
 * please remember to add space tail to the prefixText, in order that the prefix text and the link text
 * will not be stuck together (same thing with postfix text)
 */
define.component('wysiwyg.editor.components.inputs.InlineTextLinkInput', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.ButtonInput');

    def.skinParts({
        label: {type: 'htmlElement'},
        prefixText: {type: 'htmlElement'},
        postfixText: {type: 'htmlElement'},
        button: {type: 'wysiwyg.editor.components.WButton'}
    });

    def.methods({

        /**
         * Initialize Input
         *
         * prefixText - the text that precedes the link
         * prefixText - the text that follows the link
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._prefixText = args.prefixText || "";
            this._postfixText = args.postfixText || "";
            this._styleOverride = args.style;
            this._noSpaces = args && args.noSpaces ;
        },

        _onAllSkinPartsReady: function(){
            this.parent();
            var prefixTextToSet = this._prefixText ;
            var postfixTextToSet = this._postfixText ;
            if(!this._noSpaces || !this._noSpaces.preText) {
                prefixTextToSet = prefixTextToSet + ' ' ;
            }
            if(!this._noSpaces || !this._noSpaces.postText) {
                postfixTextToSet = ' ' + postfixTextToSet ;
            }
            this._skinParts.prefixText.set('html', prefixTextToSet);
            this._skinParts.postfixText.set('html', postfixTextToSet);
            if(this._styleOverride){
                this._view.setStyles(this._styleOverride);
            }
        }
    });
});

