define.component('wysiwyg.editor.components.panels.DynamicPalettePanel', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.SideContentPanel');

    def.resources(['W.UndoRedoManager', 'W.Preview']);

    def.skinParts({
        content: {type: 'htmlElement'},
        scrollableArea: {type: 'htmlElement'}
    });

    def.binds(['_invertColors']);

    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._titleKey  = "COLOR_DESIGN_CUSTOMIZE";
            this._descriptionKey = "COLOR_DYNAMIC_DESCRIPTION";
        },

        canGoBack : function() {
            return true;
        },

        canCancel : function() {
            return true;
        },

        _createFields: function(){
            var res = this.injects().Resources;
            var buttonsPerLine = 5;
            var colorMap = [
                [11, 12, 13, 14, 15],
                [16, 17, 18, 19, 20],
                [21, 22, 23, 24, 25],
                [26, 27, 28, 29, 30],
                [31, 32, 33, 34, 35]
            ];

            this.addInputGroupField(function(panel){
                this.addLabel( res.get('EDITOR_LANGUAGE', 'DYNAMIC_PALETTE_MAIN_COLORS'), {'textAlign':'left', 'margin':'0 20px'}, null, null, null, null, "Customize_Palette_Main_Colors_ttid" );
                this.addBreakLine();
                this.setNumberOfItemsPerLine(buttonsPerLine);
                this.addColorGroupField(colorMap[0]);
                this.addColorGroupField(colorMap[1]);
                this.addColorGroupField(colorMap[2]);
                this.addColorGroupField(colorMap[3]);
                this.addColorGroupField(colorMap[4]);

            }, 'skinless', null, null, null, 'center');

            this.addBreakLine(20, '1px solid #ccc', 20);

            this.addInputGroupField(function(panel){
                this.addLabel(res.get('EDITOR_LANGUAGE', 'DYNAMIC_PALETTE_MORE_COLORS'),{'textAlign':'left', 'margin':'0 20px'},null,null,null,null,"Customize_Palette_More_Colors_ttid");
                this.addBreakLine();
                this.setNumberOfItemsPerLine(buttonsPerLine);
                this.addColorField(res.get('EDITOR_LANGUAGE','color_1'), false, 'narrow').bindToThemeProperty('color_1');
                this.addColorField(res.get('EDITOR_LANGUAGE','color_2'), false, 'narrow').bindToThemeProperty('color_2');
                this.addColorField(res.get('EDITOR_LANGUAGE','color_3'), false, 'narrow').bindToThemeProperty('color_3');
                this.addColorField(res.get('EDITOR_LANGUAGE','color_4'), false, 'narrow').bindToThemeProperty('color_4');
                this.addColorField(res.get('EDITOR_LANGUAGE','color_5'), false, 'narrow').bindToThemeProperty('color_5');

            }, 'skinless', null, null, null, 'center');

            this.addBreakLine(20, '1px solid #ccc', 20);

            this.addInputGroupField(function(panel){
                this.setNumberOfItemsPerLine(0);
                var icon = {
                    iconSrc     : 'button/inverse_icon.png',
                    iconSize    : {width:20, height:20}
                };
                this.addButtonField(null, res.get('EDITOR_LANGUAGE','COLOR_PALETTE_INVERT'), null, icon, null, null, "Customize_Palette_Invert_Palette_ttid").addEvent('inputChanged', panel._invertColors);
            },'skinless', null, null, {padding: '0 15px'}, 'right');
        },

        _invertColors: function() {
            LOG.reportEvent(wixEvents.COLOR_PALETTE_INVERTED, {});
            var changeMap = {};
            var themeManager = this.resources.W.Preview.getPreviewManagers().Theme;

            this._saveSwapValuesToMap('color_1', 'color_2', changeMap);

            var colorParams = themeManager.getPropertiesAccordingToType('color');
            var palettePerColor = Constants.Theme.COLOR_SUB_PALETTE_SIZE;
            var colorStartIndex = Constants.Theme.COLOR_PALETTE_INDEX;
            var colorAmount = ((colorParams.length - colorStartIndex)) / palettePerColor;

            for(var i = 0; i < colorAmount; i++){
                var initIndex = colorStartIndex + (i * palettePerColor);
                this._saveSwapValuesToMap('color_' + initIndex, 'color_' + (initIndex+4), changeMap);
                this._saveSwapValuesToMap('color_' + (initIndex+1), 'color_' + (initIndex+3), changeMap);
            }
            this.resources.W.UndoRedoManager.startTransaction();

            themeManager.getDataItem().setFields(changeMap, this);
        },


        _saveSwapValuesToMap: function(themeId1, themeId2, map) {
            var themeManager = this.injects().Preview.getPreviewManagers().Theme;
            var color1Value = themeManager.getProperty(themeId1);
            var color2Value = themeManager.getProperty(themeId2);
            map[themeId1] = color2Value.toString();
            map[themeId2] = color1Value.toString();
        }
    });
});