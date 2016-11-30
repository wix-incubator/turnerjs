define.component('wysiwyg.editor.components.panels.PinterestFollowPanel', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Resources']);

    def.binds(['_validatePinterestAddress']);

    def.traits(['core.editor.components.traits.DataPanel']);

    def.dataTypes(['PinterestFollow']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
        },
        _createFields: function(){
//            var data = this.getDataItem();
            var panel = this,
                inputUrl;

            this.addInputGroupField(function(){
                this.addLabel(this._translate('PINTEREST_FOLLOW_CHANGE_URL'));
                inputUrl = this.addInputField('http://pinterest.com/', null, 0, 70, {validators:[panel._validatePinterestAddress]}, null, null).bindToField('urlChoice');
                this.addInputField(this._translate('PINTEREST_FOLLOW_BUTTON_TEXT'), null, 0, 50, {validators:[panel._inputValidators.htmlCharactersValidator]}, null, null).bindToField('label');

                inputUrl.runWhenReady(function(logic){
                    logic._skinParts.input.setStyles({
                        'width': 140,
                        'position': 'relative',
                        'left': 5
                    });
                    logic._skinParts.label.setStyles({
                        'display': 'inline-block'
                    });
                    logic._skinParts.input.parentNode.parentNode.setStyles({
                        'display': 'inline-block',
                        'position': 'relative',
                        'top': -10,
                        'margin-bottom': -5
                    });
                });
            });

            this.addAnimationButton();
        },

        //return error if url does not starts as pinteres.com/
        _validatePinterestAddress: function(text){
            var errorText = "";

            if(text.match(/(^http|^www\.|^\/)/)){
                errorText = this._translate('PINTEREST_FOLLOW_ERROR_INVALID_URL'); //"The url entered is invalid";
            }
            else if(text.match(/(\&|\%|\#|\*|\?|\\|\_|\=|\+|\#|\.|\!|\<|\>|\|)/g)){
                errorText = this._translate('PINTEREST_FOLLOW_ERROR_INVALID_SYMBOL'); //"Invalid symbol is entered";
            }

            return errorText;
        }
    });

});
