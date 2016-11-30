/**
 * @Class wysiwyg.editor.components.inputs.font.FontSelectorField
 * @extends wysiwyg.editor.components.inputs.BaseInput
 */
define.component('wysiwyg.editor.components.inputs.font.FontSelectorField', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.binds(['_fontSelected', '_getFontList', '_setComboInit','fontChangedFromAdvancedSettings' ]);

    def.skinParts({
        label: {type: 'htmlElement'},
        fontSelectorButton: {type: 'wysiwyg.editor.components.FontSelectorButton', hookMethod : 'getCurrentFont'}
    });

    def.states({'label': ['hasLabel', 'noLabel']});

    /**
     * @lends wysiwyg.editor.components.inputs.font.FontSelectorField
     */
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._fontName = args.fontName;
            this._fontListDataItem = this.injects().Data.createDataItem({'items':[], type:'list'});
            this._getFontList();
            this.CurrentValue = args.fontName;
            this.propertyName = args.propertyName;
        },

        _setComboInit: function(definition) {
            definition.argObject.dataProvider = this._fontListDataItem;
            return definition;
        },

        _getFontList:function(){
            this._fontList=[];
            W.Data.getDataByQuery("#FONT_STYLE_NAMES", function(fontItems){
                if(fontItems){
                    var fonts = fontItems.get('items');
                    if(fonts){
                        for(var fontKey in fonts){
                            var fontItem = fonts[fontKey];
                            var fontLabel = this.injects().Resources.get('EDITOR_LANGUAGE', fontItem.label);
                            this._fontList.push({value:fontKey, label:fontLabel});
                        }
                    }
                }
                this._fontListDataItem.setData({'items':this._fontList, type:'list'});
            }.bind(this));
        },

        _fontSelected:function(e){
            this.fireEvent('fontChanged', e);
        },

        _listenToInput: function() {
            this._skinParts.fontSelectorButton.startListeningToButtonParts();
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function() {
            this._skinParts.fontSelectorButton.stopListeningToButtonParts();
        },
        fontChangedFromAdvancedSettings : function (e){
            this.fireEvent('fontChanged', e);
        },
        getCurrentFont: function(definition) {
            definition.argObject['currentFont'] = this.CurrentValue;
            definition.argObject['cbFunc'] = this.fontChangedFromAdvancedSettings;
            return definition;
        },
        setFontName: function(value) {
            this._fontName = value;
            this.CurrentValue = value;
            this._skinParts.fontSelectorButton.setFontName(value);
        }
    });
});