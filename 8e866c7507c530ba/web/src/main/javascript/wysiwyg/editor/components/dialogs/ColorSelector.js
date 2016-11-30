define.component('wysiwyg.editor.components.dialogs.ColorSelector', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.utilize(['core.utils.css.Color']);

    def.binds(['_onColorButtonSelected', '_openCustomColorPicker', '_onCustomColorPickerClose', '_resetColor']);

    def.skinParts({
        content: {type: 'htmlElement'},
        customColorLink: {type: 'htmlElement', autoBindDictionary:'SELECT_COLOR_DIALOG_CUSTOM'},
        resetColorLink: {type: 'htmlElement'},
        resetColor: {type: 'htmlElement'}
    });

    def.resources(['W.Resources']);

    def.states(['nocolor']);

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);

            this._initGlobalResources();
            this._createPaletteButtons();

            this._closeCommand      = this._globals.commands.createCommand('cp');
            this._changeCB          = args.onChange;
            this._dialogWindow      = args.dialogWindow;
            this._resetCB = args.onReset;
            this._resetDisplayColor = args.resetDisplayColor;
            this._commandName = args.commandName || "";

            if(args.colorSource === 'theme') {
                this._selectedColorName = args.color;
                this._selectedColor = this._globals.preview.getPreviewManagers().Theme.getProperty(args.color);
            } else {
                this._selectedColorName = '';
                this._selectedColor = args.color;
            }

            this._dialogWindow.addEvent('onDialogClosing', this._onDialogClosing);
        },

        _initGlobalResources: function(){
            this._globals = {};
            this._globals.commands = this.injects().Commands;
            this._globals.preview = this.injects().Preview;
            this._globals.editor = this.injects().Editor;
        },

        _onAllSkinPartsReady: function () {
            this.parent();
            if (!this._resetCB) {
                this._skinParts.resetColor.style.display = "none";
                this._skinParts.resetColor.setAttribute("disable", true);
                this._skinParts.resetColorLink.style.display = "none";
            } else {
                if (this._resetDisplayColor === null) {
                    this.setState("nocolor");
                    this._skinParts.resetColorLink.textContent  = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'SELECT_COLOR_DIALOG_RESET_BACKGROUND');
                } else {
                    this._skinParts.resetColor.setStyle('background', this._resetDisplayColor);
                    this._skinParts.resetColorLink.textContent  = this.resources.W.Resources.get('EDITOR_LANGUAGE', 'SELECT_COLOR_DIALOG_RESET');
                }
            }
        },

        render: function() {
            this.parent();
            this._skinParts.customColorLink.addEvent('click', this._openCustomColorPicker);
            this._skinParts.resetColorLink.addEvent('click', this._resetColor);
            this._skinParts.resetColor.addEvent('click', this._resetColor);
        },

        _createPaletteButtons: function() {
            var theme = this._globals.preview.getPreviewManagers().Theme;
            var colorPropertiesList = theme.getPropertiesAccordingToType('color');
            this._colorProperties = [];

            for(var i = 0, l = colorPropertiesList.length; i < l; i++){
                this._colorProperties[i] = {
                    name  : colorPropertiesList[i],
                    value : theme.getProperty(colorPropertiesList[i])
                };
            }
        },

        _addColorSelectionButton: function(color){
            var selectedColorName = this._selectedColorName;
            return this.addColorSelectorButtonField(color.name, color.value)
                .addEvent(Constants.CoreEvents.CLICK, this._onColorButtonSelected)
                .runWhenReady(function(logic){
                    logic.toggleSelected(color.name == selectedColorName);
                });
        },

        _onColorButtonSelected:function(e){
            this._onColorSelected(e.value, 'theme');
        },

        _createFields:function(){
            var palettePerColor = Constants.Theme.COLOR_SUB_PALETTE_SIZE;
            var colorParams = this._globals.preview.getPreviewManagers().Theme.getPropertiesAccordingToType('color');
            var colorStartIndex = Constants.Theme.COLOR_PALETTE_INDEX;
            var colorAmount = ((colorParams.length - colorStartIndex)) / palettePerColor;

            this.setNumberOfItemsPerLine(palettePerColor, '0px');

            for(var i = 0; i < colorAmount; i++){
                var index = 0;
                while(index < palettePerColor) {
                    var colorIndex = colorStartIndex + i + (index * palettePerColor);
                    var propName = colorParams[colorIndex];
                    if(propName.indexOf('color_') == 0){
                        this._addColorSelectionButton(this._colorProperties[colorIndex]);
                    }
                    index++;
                }
            }

            this._addColorSelectionButton(this._colorProperties[1]);
            this._addColorSelectionButton(this._colorProperties[2]);
            this._addColorSelectionButton(this._colorProperties[3]);
            this._addColorSelectionButton(this._colorProperties[4]);
            this._addColorSelectionButton(this._colorProperties[5]);
        },
        
        _onColorSelected: function(colorValue, colorSource) {
            this._changeCB(colorValue, colorSource);
            this._dialogWindow.closeDialog();
        },

        _resetColor:function() {
            this._resetCB();
            this._dialogWindow.closeDialog();
        },

        _openCustomColorPicker: function(e) {
            //~ var btnPos = this._view.getPosition();
            var initColor = new this.imports.Color(this._selectedColor);
            var pos = this.injects().Utils.getPositionRelativeToWindow(this._skinParts.view);
            var dim = this._skinParts.view.getSize();
            var params = {
                color       : initColor,
                onChange    : this._onCustomColorPickerClose,
                callback    : this._closeColorDialog,
                top         : pos.y + dim.y*0.66,
                left        : pos.x + dim.x*0.66,
                enableAlpha : false
            };
            this.injects().Commands.executeCommand('WEditorCommands.ShowColorPickerDialog', params);

            if(W.Experiments.isDeployed('RTColorSelectorBIEvents')){
                LOG.reportEvent(wixEvents.MORE_COLOR_CLICKED, {c1: this._commandName});
            }
        },

        _onCustomColorPickerClose: function(e) {
            if(e.cause === 'ok') {
                this._onColorSelected(e.color, 'value');
            }
        }
    });
});