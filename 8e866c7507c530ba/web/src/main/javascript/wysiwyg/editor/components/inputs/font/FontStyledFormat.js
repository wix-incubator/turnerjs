/**
 * @Class wysiwyg.editor.components.inputs.font.FontFamily
 * @extends wysiwyg.editor.components.inputs.BaseInput
 */
define.component('wysiwyg.editor.components.inputs.font.FontStyledFormat', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.utilize(['core.utils.css.Font']);

    def.resources(['W.Data', 'W.Preview', 'W.Css']);

    def.skinParts({
        comboBox: {
            type: 'wysiwyg.editor.components.richtext.ToolBarDropDown',
            dataType: 'SelectableList',
            argObject: {
                numberOfColumns: 1,
                singleOptionInfo: {compType: 'wysiwyg.editor.components.BasicFontButton', compSkin: 'wysiwyg.editor.skins.richtext.FontButtonSkin'},
                selectionOption: 0
            }
        },
        label:  {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel'] });

    def.statics({
        _comboDataId: 'DESIGN_PANEL_FORMAT_FONTS_DROP_DOWN',
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
            this._fontListDataItem = this.injects().Data.createDataItem({'items':[], type:'list'});
            this._optionsData = this.resources.W.Data.getDataByQuery('#' + this._comboDataId);
           if(!this._optionsData){
                this._createOptionsDataInner();
            }
            var previewManagers = this.resources.W.Preview.getPreviewManagers();
            this._themeManager = previewManagers.Theme;
            previewManagers.Commands.registerCommandAndListener('W.CssCommands.CharacterSetChange', this, this._createOptionsDataInner);
        },
        _createOptionsDataInner: function(){
            var  optionItems = [],
                dataMngr = this.resources.W.Data;

            var fontObj = dataMngr.getDataByQuery('#CK_EDITOR_FONT_STYLES').get('items');
            for (var prop in fontObj) {
                var ElemData = fontObj[prop];
                var rawData = {'type': 'ButtonWithIcon' ,format:prop, cssClass:prop , disabled:false,label: ElemData.label,seoTag:ElemData.seoTag,tag:ElemData.seoTag};
                optionItems.push(this.resources.W.Data.createDataItem(rawData, 'ButtonWithIcon'));
            }

            var rawData = {'type': 'ButtonWithIcon', disabled:false,label:this.injects().Resources.get('EDITOR_LANGUAGE', 'FONTADVANCESTYLE_Custom'),format:"customized"};
            optionItems.push(this.resources.W.Data.createDataItem(rawData, 'ButtonWithIcon'));
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
            var fontOption = this._getOptionDataByCssValue(value);
            this._skinParts.comboBox.setSelected(fontOption);
        },
        getValue: function(e){
            return this._optionsData.get('selected')._data.value;
        },
        _getOptionDataByCssValue: function(value){
            var self = this;
            var canonizedValue = this._canonizeValue(value);

            return this._optionsData.get('items').first(function(optionData){
                var optionValue = self._canonizeValue(optionData.get('format'));
                return canonizedValue === optionValue;
            });
        },

        _canonizeValue: function(value) {
            return typeOf(value) === 'string' ?
                value.toLowerCase().replace(/'/gi, '').replace(/\s/g, '') :
                value;
        },

        _onEnabled: function(){
            this.parent();
            this._skinParts.comboBox.enable();
        },


        _onDisabled: function(){
            this.parent();
            if (this.isReady()){
                this._skinParts.comboBox.disable();
            }
        },
        onCustomizedOptionChange:function (fontObj){
            var customizedOptionPosition = this._skinParts.comboBox._skinParts.options.items.length-1;
            var elemLogic = this._skinParts.comboBox._skinParts.options.items[customizedOptionPosition].getLogic();
            elemLogic._skinParts.label.style.fontSize= fontObj.fontSize;
            elemLogic._skinParts.label.style.fontFamily=fontObj.fontFamilyText;
            elemLogic._skinParts.label.style.fontWeight = fontObj.weight;
            elemLogic._skinParts.label.style.fontStyle = fontObj.style;
            elemLogic._skinParts.fontName.innerHTML = this._canonizeValue(fontObj.fontFamily);
            elemLogic._skinParts.extraLabel.innerHTML = fontObj.fontSize;
    },

    _listenToInput: function() {
            this._skinParts.comboBox.addEvent('change', this._changeEventHandler);
     },

     _stopListeningToInput: function() {
            this._skinParts.comboBox.removeEvent('change', this._changeEventHandler);
     }
    });
});