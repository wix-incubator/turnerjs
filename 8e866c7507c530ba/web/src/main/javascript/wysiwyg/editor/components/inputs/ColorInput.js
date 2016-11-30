define.component('wysiwyg.editor.components.inputs.ColorInput', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    def.skinParts({
        colorButton: {type: 'wysiwyg.editor.components.ColorDialogButton'}
    });
    def.inherits('wysiwyg.editor.components.inputs.BaseInput');
    def.resources(['W.UndoRedoManager', 'W.Preview']);
    def.states({'label': ['hasLabel', 'noLabel'], 'mouse': ['over', 'pressed']});
    def.binds(['_showPicker', '_onMouseOver', '_onMouseOut', '_onMouseDown', '_onMouseUp']);
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._enableAlpha = (typeof args.enableAlpha != 'undefined') ? args.enableAlpha : true;
        },
        render    : function(){
            this.parent();
            this._skinParts.colorButton.enableAlpha(this._enableAlpha);
            this._skinParts.colorButton.handleClickEvent(false);

        },
        /**
         * @override
         * Set the value of the label
         * @param text The text to set
         * @param isPreset optional, if set to true the isPreset flag is set to true
         */
        setValue  : function(text){
            this.setColor(text);
        },
        /**
         * @override
         * Returns a Color object
         */
        getValue  : function(){
            return this._skinParts.colorButton.getColor().getRgba();
        },

        setColor: function(value){
            this._skinParts.colorButton.setColor(value);
        },

        _showPicker          : function(event){
            this._skinParts.colorButton.openColorDialog(event);
        },
        _onMouseOver         : function(){
            this.setState('over', 'mouse');
            this.fireEvent(Constants.CoreEvents.MOUSE_OVER);
        },
        _onMouseOut          : function(){
            this.removeState('over', 'mouse');
            this.removeState('pressed', 'mouse');
            this.fireEvent(Constants.CoreEvents.MOUSE_OUT);
        },
        _onMouseDown         : function(){
            this.setState('pressed', 'mouse');
            this.fireEvent(Constants.CoreEvents.MOUSE_DOWN);
        },
        _onMouseUp           : function(){
            this.removeState('pressed', 'mouse');
            this.fireEvent(Constants.CoreEvents.MOUSE_UP);
        },
        /**
         * @override
         * Assign change events
         */
        _listenToInput       : function(){
            this._skinParts.view.addEvent(Constants.CoreEvents.CLICK, this._showPicker);
            this._skinParts.view.addEvent(Constants.CoreEvents.MOUSE_OVER, this._onMouseOver);
            this._skinParts.view.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);
            this._skinParts.view.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.view.addEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
            this._skinParts.colorButton.addEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
        },
        /**
         * @override
         * Remove change events
         */
        _stopListeningToInput: function(){
            this._skinParts.view.removeEvent(Constants.CoreEvents.CLICK, this._showPicker);
            this._skinParts.view.removeEvent(Constants.CoreEvents.MOUSE_OVER, this._onMouseOver);
            this._skinParts.view.removeEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);
            this._skinParts.view.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.view.removeEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
            this._skinParts.colorButton.removeEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);
        },

        _changeEventHandler: function(e) {
            var value = this.getValue();
            if (typeof value == 'string'){
                value = this.injects().Utils.convertToHtmlText(value);
            }
            if (e && e.colorDetails) {
                this._handleUndoData(e.colorDetails);
            }
            var event = {value: value, origEvent: e, compLogic: this};
            this.fireEvent('inputChanged', event);
        },

        _handleUndoData: function(colorData) {
            var newValue = {}, oldValue = {},
                schemaType = this._data.getSchemaType && this._data.getSchemaType(),
                className = this._data.$className,
                dataManager;

            newValue[this._dataFieldName] = colorData.newColor;
            oldValue[this._dataFieldName] = colorData.oldColor;

            if (schemaType === 'WFlatTheme' && !this._isMainColor()) {
                dataManager = this.resources.W.Preview.getPreviewManagers().Theme;
            } else if (className === 'core.managers.data.PropertiesItem'){
                dataManager =  this.resources.W.Preview.getPreviewManagers().ComponentData;
            } else if (className === 'core.managers.data.DataItemWithSchema'){
                dataManager =  this.resources.W.Preview.getPreviewManagers().Data;
            }

            if(dataManager){
                dataManager.fireEvent(Constants.UrmEvents.DATA_CHANGED_EVENT, [this._data, newValue, oldValue, this]);
            }
            this.resources.W.UndoRedoManager.endTransaction();
        },

        _isMainColor: function() {
            var parentComponent = this.getParentComponent();
            if (parentComponent._skinParts && (parentComponent._skinParts['mainColor'] === this)) {
                return true;
            }
            return false;
        }
    });

});
