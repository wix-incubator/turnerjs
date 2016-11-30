define.component('wysiwyg.editor.components.MobileActivationAlert', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition*/
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Commands', 'W.Config']);

    def.skinParts({
        content: {type: 'htmlElement'}
    });

    def.binds(['_updateTextOnDataChange', '_setVisibilityAccordingToState']);

    def.dataTypes('MultipleStructureOffering');

    def.statics({
        OPTIMIZED_DISABLED: {
            prefix: 'MOBILE_ACTIVATION_TEXT_PRE',
            postfix: 'MOBILE_ACTIVATION_TEXT_POST',
            link: 'MOBILE_ACTIVATION_TEXT_LINK'
        },
        OPTIMIZED_ENABLED: {
            prefix: 'MOBILE_DEACTIVATION_TEXT_PRE',
            postfix: ' ',
            link: 'MOBILE_DEACTIVATION_TEXT_LINK'
        }
    });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.SetViewerMode', this, this._setVisibilityAccordingToState);
            this.resources.W.Commands.registerCommandAndListener('WEditorCommands.WSetEditMode', this, this._setVisibilityAccordingToState);

            this._setVisibilityAccordingToState() ;
        },

        _setVisibilityAccordingToState: function() {
            var shouldShow = !this.resources.W.Config.env.isEditorInPreviewMode() &&
                this.resources.W.Config.env.isViewingSecondaryDevice() ;
            if(shouldShow) {
                this.$view.uncollapse() ;
            } else {
                this.$view.collapse() ;
            }
        },

        _createFields: function(){

            this.setNumberOfItemsPerLine(0);
            this.addIcon('mobile/activate_msg_icon2.png', null, {width:'35px', height:'37px'});
            var translatedTextObj = this._getTranslatedTextObject();
            this.addInlineTextLinkField(
                null,
                translatedTextObj.prefix,
                translatedTextObj.link,
                translatedTextObj.postfix,
                null, null, null, null, null,
                {'width': '240px'}
            )
                .runWhenReady(function(inputLogic){
                    this._textField = inputLogic;
                }.bind(this))
                .addEvent('click', function(event){
                    W.Commands.executeCommand('WEditorCommands.MobileSettings');
                    W.Commands.executeCommand('WEditorCommands.ShowMobileViewSelector', {"src": "tooltip"});
                });

            this._data.addEvent(Constants.DataEvents.DATA_CHANGED, this._updateTextOnDataChange);
        },

        _getTranslatedTextObject: function() {
            var textObject = {};
            var textsType = this._data.get('hasMobileStructure') ? 'OPTIMIZED_ENABLED' : 'OPTIMIZED_DISABLED';
            textObject.prefix = this._translate(this[textsType].prefix);
            textObject.postfix = this._translate(this[textsType].postfix, this[textsType].postfix);
            textObject.link = this._translate(this[textsType].link);
            return textObject;
        },

        _updateTextOnDataChange: function(){
            var textObj = this._getTranslatedTextObject();
            this._textField._skinParts.prefixText.set('html', textObj.prefix + ' ');
            this._textField._skinParts.postfixText.set('html', ' ' + textObj.postfix);
            this._textField.setButtonLabel(textObj.link);
        }
    });
});
