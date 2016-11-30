/**
 * @class wysiwyg.editor.components.ColorSelectorButton
 */
define.component('wysiwyg.editor.components.ColorSelectorButton', function(ComponentDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = ComponentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.skinParts({
        colorSelector: {type:'htmlElement'},
        color: {type:'htmlElement'}
    });

    def.utilize(['core.utils.css.Color']);

    def.resources(['W.Preview', 'W.Utils', 'W.Commands']);

    def.binds(['_openColorSelectorDialog', '_onMouseDown', '_onMouseUp', '_onMouseOver', '_onMouseOut', '_onColorChange']);

    def.states({  'label'     : ['hasLabel', 'noLabel'],
        'adjustment': ['hasAdjustment', 'noAdjustment'],
        'mouse'    : ['pressedColor', 'overColor', 'pressedAdjust', 'overAdjust']
    });

    def.methods({

        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._alpha = args.alpha;
            this.setColor(args.colorValue, args.colorSource);
        },

        render: function() {
            this.parent();
            this.refresh();
        },

        refresh: function(color) {
            color = color || new this.imports.Color(this._color);
            if(this._skinParts && this._skinParts.color) {
                this.setColorSkinPartStyle(color);
            }
        },

        setColorSkinPartStyle: function(color) {
            if (typeOf(color) === 'string') {
                color = new this.imports.Color(color);
            }
            this._skinParts.color.setStyles({'background-color':color.getHex()});
            if(!window.Browser.ie || window.Browser.ie9) {
                this._skinParts.color.setStyle('opacity', color.getAlpha());
            } else {
                this._skinParts.color.setStyle('filter', 'alpha(opacity=' + color.getAlpha() * 100 + ')');
            }
        },

        _openColorSelectorDialog:function(){
            var pos = this.resources.W.Utils.getPositionRelativeToWindow(this._skinParts.colorSelector);
            var params = {
                color: this._colorValue,
                colorSource: this._colorSource,
                onChange:this._onColorChange,
                top: pos.y,
                left: pos.x
            };
            this.resources.W.Commands.executeCommand('WEditorCommands.OpenColorSelectorDialogCommand', params);
        },

        _onColorChange:function(color, source){
            this.fireEvent('colorChanged', {'color':color, 'source':source, 'cause':'temp'});
            this.setColor(color, source);
            this._alpha = 1;
        },

        setColor:function(color, source) {
            this._colorValue = color || '#000000';
            this._colorSource = source || 'value';
            this._updateColorValue();
            this.refresh();
        },

        updateAlphaValue: function(alpha) {
            this._alpha = alpha;
        },

        _updateColorValue: function() {
            if(this._colorSource === 'theme') {
                this._color = this.resources.W.Preview.getPreviewManagers().Theme.getProperty(this._colorValue);
            } else {
                this._color = new this.imports.Color(this._colorValue);
            }
        },

        _onMouseDown: function(e){
            if (e.target && e.target.getAttribute('skinPart') == 'adjustButton'){
                this.setState('pressedAdjust', 'mouse');
            }else{
                this.setState('pressedColor', 'mouse');
            }
        },

        _onMouseUp: function(e){
            this.removeState('pressedAdjust', 'mouse');
            this.removeState('pressedColor', 'mouse');

        },
        _onMouseOver: function(e){
            if (e.target &&  e.target.getAttribute('skinPart') == 'adjustButton'){
                this.setState('overAdjust', 'mouse');
            }else{
                this.setState('overColor', 'mouse');
            }
        },

        _onMouseOut: function(e){
            this.removeState('pressedAdjust', 'mouse');
            this.removeState('pressedColor', 'mouse');
            this.removeState('overAdjust', 'mouse');
            this.removeState('overColor', 'mouse');

        },


        startListeningToButtonParts: function() {
            this._skinParts.colorSelector.addEvent(Constants.CoreEvents.CLICK, this._openColorSelectorDialog);
            this._skinParts.color.addEvent(Constants.CoreEvents.CLICK, this._openColorSelectorDialog);

            this._skinParts.colorSelector.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.colorSelector.addEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
            this._skinParts.colorSelector.addEvent(Constants.CoreEvents.MOUSE_OVER, this._onMouseOver);
            this._skinParts.colorSelector.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);

        },

        stopListeningToButtonParts: function() {
            this._skinParts.colorSelector.removeEvent(Constants.CoreEvents.CLICK, this._openColorSelectorDialog);
            this._skinParts.color.removeEvent(Constants.CoreEvents.CLICK, this._openColorSelectorDialog);

            this._skinParts.colorSelector.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.colorSelector.removeEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
            this._skinParts.colorSelector.removeEvent(Constants.CoreEvents.MOUSE_OVER, this._onMouseOver);
            this._skinParts.colorSelector.removeEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);
        }

    });

});