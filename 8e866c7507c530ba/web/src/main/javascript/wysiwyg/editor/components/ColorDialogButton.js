define.component('wysiwyg.editor.components.ColorDialogButton', function(componentDefinition){
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;
    
    def.inherits('wysiwyg.editor.components.WButton');
    
    def.utilize(['core.utils.css.Color']);

    def.binds(['_onColorChange', '_closeColorDialog', '_onClick']);

    def.skinParts({
        label: { type: 'htmlElement' },
        bg   : { type: 'htmlElement' },
        icon : { type: 'htmlElement' }
    });
    
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            args = args || {};
            this._isAlphaEnabled = args.enableAlpha !== false;
            this._defaultColor = args.color || '#000000';
            this._handleOwnClick = args.handleClickEvent !== false;
        },

        _onAllSkinPartsReady: function(){
            this.setColor(this._defaultColor);
        },

        setColor: function(newColor){
            this._color = new this.imports.Color(newColor);
            var bgColor;
            var hasRgba = Modernizr && Modernizr.rgba;
            var hasOpacity = Modernizr && Modernizr.opacity;

            if (hasRgba){
                bgColor = 'rgba(' + this._color.getRgba() + ')';
            } else {
                bgColor = this._color.getHex();
            }
            this._skinParts.bg.setStyle('background-color', bgColor);

            if (hasOpacity && !hasRgba){
                this._skinParts.bg.setStyle('opacity', this._color.getAlpha());
            } else {
                this._skinParts.bg.setStyle('filter', 'alpha(opacity=' + this._color.getAlpha() * 100 + ')');
            }
        },

        enableAlpha     : function(isAlphaEnabled){
            this._isAlphaEnabled = isAlphaEnabled;
            if (!isAlphaEnabled && this._color){
                this._color.setAlpha(1);
                this.setColor(this._color);
            }
        },

        handleClickEvent: function(isHandled){
            this._handleOwnClick = isHandled;
        },

        setSize         : function(width, height){
            if (width){
                this._view.setStyle('width', width);
            }
            if (height){
                this._view.setStyle('height', height);
            }
        },

        getColor        : function(){
            return this._color;
        },

        openColorDialog: function(){
            var pos = this.injects().Utils.getPositionRelativeToWindow(this._skinParts.view);
            var dim = this._skinParts.view.getSize();
            var params = {
                color      : this.getColor(),
                onChange   : this._onColorChange,
                callback   : this._closeColorDialog,
                top        : pos.y + dim.y * 0.66,
                left       : pos.x + dim.x * 0.66,
                enableAlpha: this._isAlphaEnabled
            };
            this.injects().Commands.executeCommand('WEditorCommands.ShowColorPickerDialog', params);
        },

        _onColorChange: function(event){
            if (!event){
                return;
            }

            this.setColor(event.color);
            var evData = {'color': event.color, 'cause': event.cause};
            if (event.colorDetails) {
                evData.colorDetails = event.colorDetails;
            }
            this.fireEvent(Constants.CoreEvents.CHANGE, evData);
        },

        _closeColorDialog: function(){
            //TODO: Needed?
        },

        _onClick: function(event){
            if (this._handleOwnClick){
                this.parent(event);
                this.openColorDialog();
            }
        }

    });

});