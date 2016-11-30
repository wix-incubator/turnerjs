define.component('wysiwyg.editor.components.inputs.ColorGroup', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    def.utilize(['core.utils.css.Color']);
    def.resources(['W.Preview', 'W.Resources', 'W.UndoRedoManager']);
    def.skinParts({
        mainColor: {type: 'wysiwyg.editor.components.inputs.ColorInput', argObject:{'enableAlpha':false}},
        content  : {type: 'htmlElement'}
    });
    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');
    def.states({'label': ['hasLabel', 'noLabel'], 'mouse': ['over']});
    def.binds(['_colorGroupChanged', '_setOver', '_removeOver']);
    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            args = args || {};
            this._colorList = args.colorList || [];
        },

        _onAllSkinPartsReady: function() {
            this.parent();
            this._themeData = this.resources.W.Preview.getPreviewManagers().Theme.getDataItem();
            var midColor = this._colorList[Math.round((this._colorList.length - 1)/2)];
            this._skinParts.mainColor.bindToDataItemField(this._themeData, 'color_' + midColor);
            this._listenToInput();
        },

        render: function() {
            this.parent();
        },

        _createFields: function () {
            var i, l, color;
            if (!this._colorList || !this._colorList.length) {
                return;
            }
            for (i = 0, l = this._colorList.length; i < l; i++) {
                color = this._colorList[i];
                this.addColorField(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'color_' + color), false, 'small').bindToThemeProperty('color_' + color);
            }
        },

        _colorGroupChanged: function(e){
            //var palettePerColor = Constants.Theme.COLOR_SUB_PALETTE_SIZE;
            var i, l, color, newSat, newLumious, newColor, themeIndex;
            var origColor = new this.imports.Color(e.value);
            var luminous = origColor.getBrightness();
            var distanceToWhite = this._getDistanceToWhite(origColor);
            var lBucket = Math.floor(5 * luminous / (luminous + distanceToWhite));

            var firstColor = new this.imports.Color(this._themeData.get('color_' + this._colorList[0]));
            var lastColor = new this.imports.Color(this._themeData.get('color_' + this._colorList.getLast()));
            var firstDistanceFromWhite = this._getDistanceToWhite(firstColor);
            var lastDistanceFromWhite = this._getDistanceToWhite(lastColor);

            var wasColorSelected = e && e.origEvent && (e.origEvent.cause === 'ok');
            if (!wasColorSelected) {
                this.oldChangeMap = this.changeMap && Object.clone(this.changeMap);
            }
            this.changeMap = {};
            for (i = 0, l = this._colorList.length; i < l; i++ ){
                color = this._colorList[i];
                newSat = origColor.getSaturation();

                if (i < lBucket) {
                    newLumious = (i + 1) / (lBucket + 1) * luminous;
                }
                else if (i == lBucket){
                    newLumious = luminous;
                }
                else {
                    newLumious = (i - lBucket) / (5 - lBucket) * (100 - luminous) + luminous;
                    newSat = origColor.getSaturation() / (i - lBucket + 1);
                }

                newColor = new this.imports.Color();
                newColor.setHsb(origColor.getHue() + ',' + newSat + ',' + newLumious);

                if(firstDistanceFromWhite > lastDistanceFromWhite) {
                    themeIndex = this._colorList[i];
                } else {
                    themeIndex = this._colorList[l - 1 - i];
                }
                this.changeMap['color_' + themeIndex] = newColor.toString();
            }

            if (wasColorSelected) {
                this.resources.W.UndoRedoManager.startTransaction();
                this.resources.W.Preview.getPreviewManagers().Theme.fireEvent('undoDataChangedEvent', [undefined, this.changeMap, this.oldChangeMap, e.compLogic]);
                this.resources.W.UndoRedoManager.endTransaction();
            }
            this._themeData.setFields(this.changeMap);
        },

        _getDistanceToWhite: function(color) {
            return Math.sqrt((100-color.getBrightness()) * (100-color.getBrightness()) + color.getSaturation() * color.getSaturation());
        },

        dispose: function() {
            this._stopListeningToInput();
            this.parent();
        },

        _setOver: function(){
            this.setState('over', 'mouse');
        },
        _removeOver: function(){
            this.removeState('over', 'mouse');
        },

        _stopListeningToInput: function() {
            this._skinParts.mainColor.removeEvent('inputChanged', this._colorGroupChanged);
            this._skinParts.mainColor.removeEvent(Constants.CoreEvents.MOUSE_OVER, this._setOver);
            this._skinParts.mainColor.removeEvent(Constants.CoreEvents.MOUSE_OUT, this._removeOver);
        },

        _listenToInput: function() {
            this._skinParts.mainColor.addEvent('inputChanged', this._colorGroupChanged);
            this._skinParts.mainColor.addEvent(Constants.CoreEvents.MOUSE_OVER, this._setOver);
            this._skinParts.mainColor.addEvent(Constants.CoreEvents.MOUSE_OUT, this._removeOver);
        }
    });
});