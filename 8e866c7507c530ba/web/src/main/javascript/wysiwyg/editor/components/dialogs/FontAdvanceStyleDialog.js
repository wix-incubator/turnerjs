define.component('wysiwyg.editor.components.dialogs.FontAdvanceStyleDialog', function (componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Preview', 'W.Resources', 'W.Data', 'W.UndoRedoManager', 'W.Commands', 'W.Utils']);

    def.binds(['_onBlur', '_onBeforeClose','_fontDataChanged','_formatFontChanged']);

    def.utilize(['core.utils.css.Font']);

    def.skinParts({
        content: { type: 'htmlElement' }
    });
    def.dataTypes(['', 'Font']);
    def.statics({
        _selectedFont: "",
        _selectedFormat:"",
        _allFieldsCreated:0
    });

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._fontSource = (args.font && args.font.indexOf("font_") == -1)? "value":"theme";
            this._originalFont = this._fontSource=="theme" ? W.Preview.getPreviewManagers().Theme.getProperty(args.font) : new this.imports.Font(args.font);
            this._dialogWindow = args.dialogWindow;
            this._lineHeight = this._originalFont ? (this._originalFont._lineHeightSize + this._originalFont._lineHeightUnit) : "1.3em";
            this.callbackFunc = args.callbackFunc;
            this._fontName = args.font;
            this._selectedFormat = args.fontLabel;
            this._originalFormat = args.fontLabel;
            this._selectedFormatValue = this._fontSource=="theme" ? args.font : "customized";
            this._originalFormatValue =   this._selectedFormatValue;
            this._dialogWindow.addEvent('onDialogClosing', this._onBeforeClose);
            this._dialogInitPromise = Q.defer();
            this._AllFieldsCreated=0;
            this.parentInstance = args.parentInstance;
        },
        _createFields: function () {
            var self =this;
            this.addInputGroupField(function () {
                     self._formatField = this.addFontFormatStyledField(this.injects().Resources.get('EDITOR_LANGUAGE', 'FONTADVANCESTYLE_Style')).runWhenReady( function( compLogic ) {
                         self._fontFormatLogic=compLogic;
                         self._onAllFieldsCreatedSendPromise();

                     });

                    self._familyField = this.addFontFamilyField(this.injects().Resources.get('EDITOR_LANGUAGE', 'FONTADVANCESTYLE_Font'),null,true).runWhenReady( function( compLogic ) {
                        self._familyFieldLogic=compLogic;
                        self._onAllFieldsCreatedSendPromise();
                    });
                    this.setNumberOfItemsPerLine(3, '10px');

                    this.addBreakLine();
                    self._sizeField = this.addFontSizeField().runWhenReady( function( compLogic ) {
                        self._sizeFieldLogic=compLogic;
                        self._sizeFieldLogic._skinParts.view.setStyle("margin-left","77px");
                        self._sizeFieldLogic._skinParts.view.setStyle("margin-top","9px");
                        self._onAllFieldsCreatedSendPromise();
                    });
                    self._fontStyle = this.addFontStyleField().runWhenReady( function( compLogic ) {
                        self._fontStyleLogic=compLogic;
                        self._fontStyleLogic._skinParts.view.setStyle("margin-top","9px");
                        self._onAllFieldsCreatedSendPromise();
                    });
                self._setIntialState(self._originalFont,self._fontName);
                self._addListeners();
           });


        },
        _onAllFieldsCreatedSendPromise :function (){
            this._AllFieldsCreated++;
            if (this._AllFieldsCreated == 4){
               this._dialogInitPromise.resolve(this);
            }
        },
        getDialogPromise : function (){
            return this._dialogInitPromise.promise;
        },
        _addListeners :function (){
            this._formatField.addEvent("inputChanged",this._formatFontChanged);
            this._familyField.addEvent("inputChanged",this._fontDataChanged);
            this._sizeField.addEvent("inputChanged",this._fontDataChanged);
            this._fontStyle.addEvent("inputChanged",this._fontDataChanged);
        },
        _onBeforeClose: function(e){
            var cause = 'cancel';
            var font = { "value" :this._fontName };
            if (e && e.result == 'OK'){
                cause = 'ok';
                font = this._selectedFont;
            }else{
                this._selectedFormat = this._originalFormat;
                this._selectedFormatValue= this._originalFormatValue;
            }
            this.callbackFunc(font,this._selectedFormat,this._selectedFormatValue);
        },
        _fontDataChanged : function(data){
                var valuesArr = data.value ? data.value.split(" ") : undefined;
                this._formatField.setValue("customized");

                var bold   = (this._fontStyleLogic._skinParts.bold.getValue())?   'bold'   : 'normal';
                var italic = (this._fontStyleLogic._skinParts.italic.getValue())? 'italic' : 'normal';
                var style= italic + " normal " +bold;
                var returnObj = {
                        fontFamily: this._replaceSpaces(this._familyFieldLogic._optionsData.get("selected")._data.value),
                        fontFamilyText:this._familyFieldLogic._skinParts.comboBox._skinParts.select._skinParts.label.innerHTML,
                        fontSize:this._sizeFieldLogic._skinParts.input._value+"px",
                        fontStyle:style,
                        fontem: (valuesArr&&valuesArr.length>3) ? valuesArr[3].split("/")[1] :this._lineHeight,
                        style : italic,
                        weight : bold
                };
                    W.Css.loadFont(this._familyFieldLogic._optionsData.get("selected")._data.value);
                    this._fontFormatLogic.onCustomizedOptionChange(returnObj);
                    font = returnObj.fontStyle+" "+returnObj.fontSize+"/"+returnObj.fontem+" "+returnObj.fontFamily;

                    var obj = {"value":font};
                    this._selectedFont = obj;
                    this._selectedFormat =this.injects().Resources.get('EDITOR_LANGUAGE', 'FONTADVANCESTYLE_Custom');
                    this._selectedFormatValue = "customized";
                    this.callbackFunc(obj,this._selectedFormat,this._selectedFormatValue);

        },
        _formatFontChanged: function (data){

            this._selectedFormat =data.compLogic._skinParts.comboBox._skinParts.select._skinParts.label.innerHTML;
            this._selectedFormatValue = data.compLogic._optionsData.get("selected")._data.format;

            if (this._selectedFormatValue != "customized"){
                var currentFont = W.Preview.getPreviewManagers().Theme.getProperty(this._selectedFormatValue);
                this._selectedFont = { "value" :this._selectedFormatValue };
                this._updateAllFields(currentFont,{ "value" :this._selectedFormatValue });
            }
        },
        _updateAllFields : function (fontObj,data){
            this._fontStyle.setValue(fontObj);
            this._sizeField.setValue(fontObj);
            this._familyField.setValue(fontObj);
            this.callbackFunc(data,this._selectedFormat,this._selectedFormatValue);
        },
        _setIntialState : function (intialState,fontName){
            this._formatField.setValue(this._fontSource=="theme" ? fontName : "customized");
            this._selectedFont={ "value" : fontName };
            this._updateAllFields(intialState,{ "value" :fontName });
        },
        _replaceSpaces: function (str){
            var find = " ";
            var re = new RegExp(find, 'g');
            str = str.replace(re, '+');
            return str;
        }
    });
});
