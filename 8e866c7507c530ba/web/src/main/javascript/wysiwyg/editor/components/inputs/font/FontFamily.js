/**
 * @Class wysiwyg.editor.components.inputs.font.FontFamily
 * @extends wysiwyg.editor.components.inputs.BaseInput
 */
define.component('wysiwyg.editor.components.inputs.font.FontFamily', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.utilize(['core.utils.css.Font']);

    def.resources(['W.Data', 'W.Preview', 'W.Css']);

    def.skinParts({
        comboBox: {
            type: 'wysiwyg.editor.components.richtext.FontsDesignDropDown',
            dataType: 'SelectableList',
            argObject: {
                numberOfColumns: 1,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.WButton', compSkin: 'wysiwyg.editor.skins.richtext.RichTextEditorOptionButton', 'compStyleId': 'RTFontOptionButton'},
                selectionOption: 0
            }
        },
        label:  {type: 'htmlElement'}
    });

    def.states({
          'label': ['hasLabel', 'noLabel'],
         'showLabelAndBoxOneLine': ['regular', 'oneLine']
    });

    def.statics({
        _comboDataId: 'DESIGN_PANEL_FONTS_DROP_DOWN',
        _optionsData: null,
        _value: ''
    });

    /**
     * @lends wysiwyg.editor.components.inputs.font.FontFamily
     */
    def.methods({
        /**
         * Initialize Input
         * Each input should get it's parameters through 'args'
         * 'labelText' is the only mandatory parameter
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * labelText: the value of the label to show above/next to the field
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._optionsData = this.resources.W.Data.getDataByQuery('#' + this._comboDataId);
            if(!this._optionsData){
                this._createOptionsDataInner();
            }
            var previewManagers = this.resources.W.Preview.getPreviewManagers();
            this._themeManager = previewManagers.Theme;
            previewManagers.Commands.registerCommandAndListener('W.CssCommands.CharacterSetChange', this, this._createOptionsDataInner);
            if (args.showLabelAndBoxOneLine)
                this.setState('oneLine', 'showLabelAndBoxOneLine');
            else
                this.setState('regular', 'showLabelAndBoxOneLine');
        },

        _createOptionsDataInner: function(){
            var cssManager = this.resources.W.Preview.getPreviewManagers().Css,
                languagesFontLists = cssManager.getLanguagesFontsLists(),
                optionItems = [],
                iconBgUrl = cssManager.getFontsListSpriteUrl(),
                siteCharacterSets = cssManager.getCharacterSets(),
                j,i;
            for (j = 0; j < cssManager.possibleCharacterSets.length; j++){
                var currentCharacterSet = cssManager.possibleCharacterSets[j];
                if (_.contains(siteCharacterSets, currentCharacterSet)){
                    var fontList = languagesFontLists[currentCharacterSet];
                    for (i = 0; i < fontList.length; i++) {
                        var font = fontList[i];
                        if (font.permissions !== 'legacy'){
                            var name = font.displayName,
                                fontFamily = font.fontFamily,
                                index = font.spriteIndex + font.characterSets.indexOf(currentCharacterSet),
                                rawData = {'type': 'ButtonWithIcon', value: fontFamily, label: name, iconSrc: iconBgUrl, spriteOffset: {x: 0, y: index * (-24)}};
                            optionItems.push(this.resources.W.Data.createDataItem(rawData, 'ButtonWithIcon'));
                        }
                    }
                }
            }
            var rawListData = {type: 'SelectableList', items: optionItems, selected: null};
            define.dataItem(this._comboDataId, rawListData);
            this._optionsData = this.resources.W.Data.getDataByQuery('#' + this._comboDataId);
        },

        _onAllSkinPartsReady : function() {
            this.parent();
            this._skinParts.comboBox.setDataItem(this._optionsData);
            if (this.isEnabled()){
                this._skinParts.comboBox.enable();
            }else{
                this._skinParts.comboBox.disable();
            }
        },
        /**
         * @param value should be a W.Background string or obj
         */

        setValue: function(value){
            var font = new this.imports.Font(value, this._themeManager);
            this._value = value;
            var fontName = font.getFontFamily();
            var fontOption = this._getOptionDataByValue(fontName);
            this._skinParts.comboBox.setSelected(fontOption);
        },
        getValue: function(){
            if (!this._value){
                 return '';
            }
            var selectedOption = this._optionsData.get('selected');
            var fontName = selectedOption.get('value');
            var font = new this.imports.Font(this._value, this._themeManager);

            font.setFontFamily(fontName);
            this._value = font.getThemeString();

            return this._value;
        },

        _getOptionDataByValue: function(value){
            var self = this;
            var canonizedValue = this._canonizeValue(value);

            return this._optionsData.get('items').first(function(optionData){
                var optionValue = self._canonizeValue(optionData.get('value'));
                return canonizedValue === optionValue;
            });
        },

        _canonizeValue: function(value) {
            return typeOf(value) === 'string' ?
                value.toLowerCase().replace(/['"\s]/g, '') : value;
        },

        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.comboBox.enable();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            if (this.isReady()){
                this._skinParts.comboBox.disable();
            }
        },

        /**
         * Assign change events.
         * Must be overridden by children components
         */
        _listenToInput: function() {
            this._skinParts.comboBox.addEvent('change', this._changeEventHandler);
        },

        /**
         * Remove change events.
         * Must be overridden by children components
         */
        _stopListeningToInput: function() {
            this._skinParts.comboBox.removeEvent('change', this._changeEventHandler);
        }
    });
});