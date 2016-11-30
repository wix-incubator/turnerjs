define.component('wysiwyg.editor.components.panels.CustomizeFontsPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');
    def.resources(['W.UndoRedoManager', 'W.Preview', 'W.Commands']);
    def.utilize(['core.utils.css.Font']);

    def.skinParts({
        content: {type: 'htmlElement'},
        scrollableArea: {type: 'htmlElement'},
        cancel : {type : 'wysiwyg.editor.components.WButton', autoBindDictionary:'DISCARD_CHANGES'}
    });

    def.binds(['_cancelPalletApply','_onThemeDataChanged']);

    def.fields({_fontsData: {
        'font_0':  {name: 'FONT_0_NAME'     , label: 'FONT_0_LABEL'},
        'font_1':  {name: 'FONT_1_NAME'     , label: 'FONT_1_LABEL'},
        'font_2':  {name: 'FONT_2_NAME'     , label: 'FONT_2_LABEL'},
        'font_3':  {name: 'FONT_3_NAME'     , label: 'FONT_3_LABEL'},
        'font_4':  {name: 'FONT_4_NAME'     , label: 'FONT_4_LABEL'},
        'font_5':  {name: 'FONT_5_NAME'     , label: 'FONT_5_LABEL'},
        'font_6':  {name: 'FONT_6_NAME'     , label: 'FONT_6_LABEL'},
        'font_7':  {name: 'FONT_7_NAME'     , label: 'FONT_7_LABEL'},
        'font_8':  {name: 'FONT_8_NAME'     , label: 'FONT_8_LABEL'},
        'font_9':  {name: 'FONT_9_NAME'     , label: 'FONT_9_LABEL'},
        'font_10': {name: 'FONT_10_NAME'    , label: 'FONT_10_LABEL'}
    }});

    def.methods({

        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._titleKey  = "FONTS_CUSTOMIZE_TITLE";
            this._descriptionKey = "FONTS_CUSTOMIZE_DESCRIPTION";

            this._themeManagerData = this.injects().Preview.getPreviewManagers().Theme.getDataItem();
            this._themeManagerData.addEvent(Constants.DataEvents.DATA_CHANGED, this._onThemeDataChanged);

        },


        _onThemeDataChanged: function() {
            this._skinParts.cancel.enable();
        },



        _onAllSkinPartsReady: function() {
            this.parent();
            this._skinParts.cancel.addEvent(Constants.CoreEvents.CLICK, this._cancelPalletApply);
        },

        canGoBack : function() {
            return true;
        },

        canCancel : function() {
            return true;
        },
        _addFontButtonWithFontData: function(themeFontRef){
            var res = this.injects().Resources;
            return this.addFontButtonField('', res.get('EDITOR_LANGUAGE', this._fontsData[themeFontRef].label), res.get('EDITOR_LANGUAGE', this._fontsData[themeFontRef].name), null, null, themeFontRef).bindToThemeProperty(themeFontRef);
        },
        _createFields: function() {
            this._addFontButtonWithFontData('font_0');
            this._addFontButtonWithFontData('font_1');
            this._addFontButtonWithFontData('font_2');
            this._addFontButtonWithFontData('font_3');
            this._addFontButtonWithFontData('font_4');

            this._addFontButtonWithFontData('font_5');
            this._addFontButtonWithFontData('font_6');

            this._addFontButtonWithFontData('font_7');
            this._addFontButtonWithFontData('font_8');
            this._addFontButtonWithFontData('font_9');
            this._addFontButtonWithFontData('font_10');
        },

        saveCurrentState: function(){
            this._skinParts.cancel.disable();
            this._initialFontProperties = {};
            var themeManager = this.injects().Preview.getPreviewManagers().Theme;
            var colorPropertiesList =  themeManager.getPropertiesAccordingToType('font');

            for(var i = 0, l = colorPropertiesList.length; i < l; i++){
                this._initialFontProperties[colorPropertiesList[i]] = themeManager.getProperty(colorPropertiesList[i]);
            }
        },

        _cancelPalletApply:function(){
            this.resources.W.UndoRedoManager.startTransaction();
            this._updateFonts(this._initialFontProperties);
            this.injects().Commands.executeCommand(Constants.EditorUI.CLOSE_ALL_PANELS);
        },

        _updateFonts: function(fonts) {
            var themeManager = this.injects().Preview.getPreviewManagers().Theme;
            var keyValueMap = {};
            for (var font in fonts) {
                if (font) {
                    var item = fonts[font];
                    var dataFont = new this.imports.Font(item, themeManager);
                    keyValueMap[font] =  dataFont.getThemeString();
                }
            }
            themeManager.getDataItem().setFields(keyValueMap, this);
        },

        dispose: function() {
            this._themeManagerData.removeEvent(Constants.DataEvents.DATA_CHANGED, this._onThemeDataChanged);
            this.parent();
        }
    });
});
