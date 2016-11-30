define.component('wysiwyg.editor.components.panels.FontsPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');

    def.resources(['W.UndoRedoManager', 'W.Commands', 'W.Preview', 'W.Components', 'W.Experiments']);

    def.utilize(['bootstrap.utils.BufferFunction', 'core.utils.css.Font']);

    def.traits(['wysiwyg.editor.components.traits.FiltersDataByTags']);

    def.skinParts({
        content : { type : 'htmlElement'},
        customize : {
            type : 'wysiwyg.editor.components.WButton',
            autoBindDictionary:'FONTS_DESIGN_CUSTOMIZE',
            command : 'WEditorCommands.CustomizeFonts',
            commandParameter : {source: 'fontsPanel'}
        },
        languagesBtn : {
            type : 'wysiwyg.editor.components.WButton',
            autoBindDictionary:'FONTS_DESIGN_LANGUAGES',
            command : 'WEditorCommands.OpenCharacterSetsDialog',
            commandParameter : {source: 'fontsPanel'}
        },
        cancel : {type : 'wysiwyg.editor.components.WButton', autoBindDictionary:'DISCARD_CHANGES'},
        actions : {type : 'htmlElement'},
        beforeHelp : { type : 'htmlElement'}
    });

    def.binds(['_onPaletteReady', '_onPaletteClick', '_cancelPalletApply']);

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._titleKey  = "FONTS_DESIGN_TITLE";
            this._descriptionKey = "FONTS_DESIGN_DESCRIPTION";
            this._panelName  = "FONTS_DESIGN_TITLE";

            var bufferFunc = new this.imports.BufferFunction(this, '_updateFonts');
            bufferFunc.setBufferTime(1000);
        },

        _onAllSkinPartsReady: function () {
            this.parent() ;
            this._skinParts.languagesBtn.setCollapsed(true);
            this._skinParts.languagesBtn.setCollapsed(false);
        },

        _createFields: function() {

            this.filterEditorDataListByTags('#FONT_STYLES', 'fontsFilterTags', 'tags', function(filteredFonts){
                for(var i=0; i<filteredFonts.length; i++){
                    var selectableComp = this.injects().Components.createComponent(
                        'wysiwyg.editor.components.inputs.font.FontPresetSelector',
                        'wysiwyg.editor.skins.inputs.font.FontPresetSelectorSkin',
                        null,
                        filteredFonts[i],
                        null,
                        this._onPaletteReady
                    );

                    selectableComp.insertInto(this._skinParts.content);
                }

//                this.addSelectionListInputField("", filteredFonts,
//                    {repeatersSelectable: false},
//                    {
//                        type : 'wysiwyg.editor.components.inputs.font.FontPresetSelector',
//                        skin : 'wysiwyg.editor.skins.inputs.font.FontPresetSelectorSkin',
//                        numRepeatersInLine: 1
//                    }
//                ).bindToDataItemAndFilterFromDataProvider(['name', 'tags']).bindHooks(this._discardFontColor);
            }.bind(this));
            this._skinParts.cancel.addEvent(Constants.CoreEvents.CLICK, this._cancelPalletApply);
        },

        _onPaletteReady: function(paletteButtonLogic) {
            paletteButtonLogic.addEvent(Constants.CoreEvents.CLICK, this._onPaletteClick);
        },

        _onPaletteClick: function(event) {
            this._skinParts.cancel.enable();
            var fonts = event.target.getLogic().getFonts();
            this.resources.W.UndoRedoManager.startTransaction();
            this._updateFonts(fonts);

            //report bi event
            LOG.reportEvent(wixEvents.FONT_PRESET_CHANGED);
        },

        _updateFonts: function(fonts) {
            var keyValueMap = {};
            var fontWithoutColors = this._discardFontColor(fonts);
            for (var font in fontWithoutColors) {
                if (font) {
                    keyValueMap[font] = fontWithoutColors[font];
                }
            }
            var themeManager = this.resources.W.Preview.getPreviewManagers().Theme;
            themeManager.getDataItem().setFields(keyValueMap, this);
        },

        _discardFontColor: function(value) {
            var themeManager = this.injects().Preview.getPreviewManagers().Theme;

            var newValue = {};

            for (var key in value){
                var item = value[key];
                var dataFont = new this.imports.Font(item, themeManager);
                var themeFont = themeManager.getProperty(key);
                var colorReference = themeFont.getColorReference();
                if(colorReference !== '') {
                    dataFont.setColorReference(colorReference);
                } else {
                    dataFont.setColor(themeFont.getColor());
                }
                dataFont.setSize(themeFont.getSize());
                newValue[key] =  dataFont.getThemeString();
            }

            return newValue;
        },

        canGoBack : function() {
            return true;
        },

        canCancel : function() {
            return true;
        },

        saveCurrentState:function(){
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
        }
    });

});