define.component('wysiwyg.editor.components.FontSelectorButton', function(ComponentDefinition) {
    var def = ComponentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        fontSelection: {type:'htmlElement'},
        font: {type:'htmlElement'}
    });

    def.utilize(['core.utils.css.Font']);

    def.resources(['W.Preview', 'W.Utils', 'W.Commands']);

    def.binds(['_openFontSelectorDialog', '_onMouseDown', '_onMouseUp', '_onMouseOver', '_onMouseOut','_fontChangedFromAdvancedSettings']);

    def.states({  'label'     : ['hasLabel', 'noLabel'],
                  'mouse'    : ['pressedFont', 'overFont']
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._font = args.currentFont;
            this._changeCB = args.cbFunc;
            this._getFontList();

        },
        render: function() {
            this.parent();
            this._setInitialFont();
        },
        _setInitialFont:function(){
           var fontLabel;
              if(this._fontObj && this._fontObj[this._font]){
                  fontLabel = this._fontObj[this._font];
            }else{
                fontLabel = this._fontObj["customized"];
            }
            this._skinParts.font.innerHTML=fontLabel;
            if (this._font){
                var fontSource = (this._font && this._font.indexOf("font_") == -1)? "value":"theme";
                var fontObj = fontSource=="theme" ? W.Preview.getPreviewManagers().Theme.getProperty(this._font) : new this.imports.Font(this._font);
                this._setFontNodeStyle(fontObj);
            }
        },
        _openFontSelectorDialog:function(){
            var pos = this.injects().Utils.getPositionRelativeToWindow(this._skinParts.fontSelection);
            var dim = this._skinParts.view.getSize();
            var params = {
                font        : this._font,
                fontLabel   : this._skinParts.font.innerHTML,
                enableAlpha : false,
                parentInstance : this,
                callbackFunc : this._fontChangedFromAdvancedSettings,
                top         : pos.y + dim.y*0.66,
                left        : pos.x + dim.x*0.66
            };
            this.injects().Commands.executeCommand('WEditorCommands.ShowAdvanceFontDialog', params);
        },
        _fontChangedFromAdvancedSettings : function (e,fontName,fontValue){
            this._changeCB(e);
            this._skinParts.font.innerHTML=fontName;
            this._font= e.value;
            var fontSource = (e.value && e.value.indexOf("font_") == -1)? "value":"theme";
            var fontObj = fontSource=="theme" ? W.Preview.getPreviewManagers().Theme.getProperty(e.value) : new this.imports.Font(e.value);
            this._setFontNodeStyle(fontObj);

        },
        _setFontNodeStyle : function (fontObj){
            if (fontObj){
                this._skinParts.font.setStyle("font-style",fontObj._style);
                this._skinParts.font.setStyle("font-variant",fontObj._variant);
                this._skinParts.font.setStyle("font-weight",fontObj._weight);
                this._skinParts.font.setStyle("font-family",fontObj._fontFamily);
                if (fontObj._fontSize > 33){
                    fontObj._fontSize = 33;  // max font size on the button is 33
                }
                this._skinParts.font.setStyle("font-size",fontObj._fontSize+"px");
            }
        },
        _onMouseDown: function(e){
         this.setState('pressedFont', 'mouse');
        },

        _onMouseUp: function(e){
            this.removeState('pressedFont', 'mouse');

        },
        _onMouseOver: function(e){
                this.setState('overFont', 'mouse');
        },

        _onMouseOut: function(e){
            this.removeState('pressedFont', 'mouse');
            this.removeState('overFont', 'mouse');

        },


        startListeningToButtonParts: function() {
            this._skinParts.fontSelection.addEvent(Constants.CoreEvents.CLICK, this._openFontSelectorDialog);
            this._skinParts.font.addEvent(Constants.CoreEvents.CLICK, this._openFontSelectorDialog);
            this._skinParts.fontSelection.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.fontSelection.addEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
            this._skinParts.fontSelection.addEvent(Constants.CoreEvents.MOUSE_OVER, this._onMouseOver);
            this._skinParts.fontSelection.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);

        },

        stopListeningToButtonParts: function() {
            this._skinParts.fontSelection.removeEvent(Constants.CoreEvents.CLICK, this._openFontSelectorDialog);
            this._skinParts.font.removeEvent(Constants.CoreEvents.CLICK, this._openFontSelectorDialog);

            this._skinParts.fontSelection.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.fontSelection.removeEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
            this._skinParts.fontSelection.removeEvent(Constants.CoreEvents.MOUSE_OVER, this._onMouseOver);
            this._skinParts.fontSelection.removeEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);
        },
        _getFontList:function(){
            this._fontObj={};
            W.Data.getDataByQuery("#FONT_STYLE_NAMES", function(fontItems){
                if(fontItems){
                    var fonts = fontItems.get('items');
                    if(fonts){
                        for(var fontKey in fonts){
                            var fontItem = fonts[fontKey];
                            var fontLabel = this.injects().Resources.get('EDITOR_LANGUAGE', fontItem.label);
                            this._fontObj[fontKey] = fontLabel;
                        }
                    }
                }
                this._fontObj["customized"]=this.injects().Resources.get('EDITOR_LANGUAGE', 'FONTADVANCESTYLE_Custom');
            }.bind(this));
        },

        setFontName: function (value) {
            this._font = value;
            this._setInitialFont();
        }
    });

});