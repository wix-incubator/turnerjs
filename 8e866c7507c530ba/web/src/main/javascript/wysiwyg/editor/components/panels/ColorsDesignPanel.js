define.component('wysiwyg.editor.components.panels.ColorsDesignPanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');

    def.resources(['W.Components', 'W.Preview', 'W.UndoRedoManager']);

    def.utilize(['bootstrap.utils.BufferFunction']);

    def.traits(['wysiwyg.editor.components.traits.FiltersDataByTags']);

    def.skinParts({
        scrollableArea : { type: 'htmlElement' },
        content : { type : 'htmlElement'},
        customize : {type : 'core.components.Button', autoBindDictionary:'COLOR_DESIGN_CUSTOMIZE', command : 'WEditorCommands.CustomizeColors'},
        cancel : {type : 'core.components.Button', autoBindDictionary:'DISCARD_CHANGES'},
        actions : {type : 'htmlElement'},
        beforeHelp : { type : 'htmlElement'}
    });

    def.binds(['_onPaletteReady', '_onPaletteClick', '_cancelPalletApply']);

    def.fields({_panelName : "COLOR_DESIGN_TITLE"});

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._titleKey  = "COLOR_DESIGN_TITLE";
            this._descriptionKey = "COLOR_DESIGN_DESCRIPTION2";

            this._showBackButton = true;
            this._showCancelButton = true;

            this._mediaURL = this.injects().Config.getServiceTopologyProperty('staticMediaUrl');

            var bufferFunc = new this.imports.BufferFunction(this, '_updateColors');
            bufferFunc.setBufferTime(1000);
        },

        canGoBack : function() {
            return true;
        },

        canCancel : function() {
            return true;
        },

        _createFields: function() {

            var bindFieldsToPallets = function(pallets){
                for(var i=0; i<pallets.length; i++){
//                    var newRawData = {};
//                    for (var field in pallets[i]) {
//                        newRawData[field] = pallets[i][field];
//                    }
//                    if (newRawData.type == null) {
//                        newRawData.type = 'list';
//                    }
                    var selectableComp = this.injects().Components.createComponent(
                        'wysiwyg.editor.components.panels.StaticPalettePanel',
                        'wysiwyg.editor.skins.panels.StaticPalettePanelSkin',
                        null,
                        pallets[i],
                        null,
                        this._onPaletteReady
                    );

                    selectableComp.insertInto(this._skinParts.content);
                }
            }.bind(this);
//            var bindFieldsToPallets = function(pallets){
//                this.addSelectionListInputField("", pallets, { repeatersSelectable: false },
//				{
//					type : 'wysiwyg.editor.components.panels.StaticPalettePanel',
//					skin : 'wysiwyg.editor.skins.panels.StaticPalettePanelSkin',
//                    numRepeatersInLine: 1
//
//				}).bindToDataItemAndFilterFromDataProvider(['paletteName', 'paletteTags']);
//            }.bind(this);

            this.filterEditorDataListByTags('#COLOR_PALETTES', 'palletsFilterTags', 'paletteTags', bindFieldsToPallets);
            this._skinParts.cancel.addEvent(Constants.CoreEvents.CLICK, this._cancelPalletApply);
        },

        _onPaletteReady: function(paletteButtonLogic) {
            paletteButtonLogic.addEvent('click', this._onPaletteClick);
        },

        _onPaletteClick: function(event) {
            var colors = event.target.getLogic().getColors();
            this._updateColors(colors);
            this._skinParts.cancel.enable();

            //report bi event
            LOG.reportEvent(wixEvents.COLOR_PRESET_CHANGED);
        },

        _updateColors: function(colors) {
            var keyValueMap = {};
            for (var color in colors) {
                if (color) {
                    keyValueMap[color] = colors[color].toString();
                }
            }
            var themeManager = this.resources.W.Preview.getPreviewManagers().Theme;
            this.resources.W.UndoRedoManager.startTransaction();
            themeManager.getDataItem().setFields(keyValueMap, this);
        },

        saveCurrentState:function(){
            this._skinParts.cancel.disable();
            this._initialColorProperties = {};
            var themeManager = this.injects().Preview.getPreviewManagers().Theme;
            var colorPropertiesList =  themeManager.getPropertiesAccordingToType('color');

            for(var i = 0, l = colorPropertiesList.length; i < l; i++){
                this._initialColorProperties[colorPropertiesList[i]] = themeManager.getProperty(colorPropertiesList[i]);
            }
        },

        _cancelPalletApply:function(){
            this._updateColors(this._initialColorProperties);
            this.injects().Commands.executeCommand(Constants.EditorUI.CLOSE_ALL_PANELS);
        }
    });
});