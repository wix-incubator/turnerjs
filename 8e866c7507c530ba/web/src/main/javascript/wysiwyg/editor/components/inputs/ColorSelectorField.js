/** @type wysiwyg.editor.components.inputs.ColorSelectorField */
define.component('wysiwyg.editor.components.inputs.ColorSelectorField', function(componentDefinition){

    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.skinParts({
        label: {type: 'htmlElement'},
        adjustButton: {type:'htmlElement'},
        selectorDropdown: {type:'htmlElement'},
        colorSelectorButton: {type: 'wysiwyg.editor.components.ColorSelectorButton', hookMethod : 'getAlpha'}
    });

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.utilize(['core.utils.css.Color']);

    def.resources([ 'W.Utils', 'W.Commands', 'W.Preview']);

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.states({
        'label'     : ['hasLabel', 'noLabel'],
        'adjustment': ['hasAdjustment', 'noAdjustment'],
        'mouse'     : ['pressedColor', 'overColor', 'pressedAdjust', 'overAdjust']
    });

    def.binds(['_openColorAdjusterDialog', '_onColorAdjusterClose', '_onAdjustChange', '_onMouseDown', '_onMouseUp', '_onMouseOver', '_onMouseOut', '_notifyColorChanged']);

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._colorValue = args.colorValue;
            this._colorSource = args.colorSource;
            this.setAlpha(args.alpha);
        },

        _onAllSkinPartsReady: function() {
            this._skinParts.colorSelectorButton.setColor(this._colorValue, this._colorSource);
            this._skinParts.colorSelectorButton.updateAlphaValue(this._alpha);
        },

        setAlpha: function(alpha) {
            if(!isNaN(alpha) && alpha !== -1) {
                this._alpha = alpha;
                this.setState('hasAdjustment', 'adjustment');
            } else {
                this._alpha = 1;
                this.setState('noAdjustment', 'adjustment');
            }
            if (this._skinParts) {
                this._skinParts.colorSelectorButton.updateAlphaValue(this._alpha);
            }
        },

        getAlpha: function(definition) {
            definition.argObject['alpha'] = this._alpha;
            return definition;
        },

        render: function() {
            this.parent();
            this.refresh();
        },

        refresh: function() {
            var color = new this.imports.Color(this._skinParts.colorSelectorButton._color);
            color.setAlpha(this._alpha);
            if(this._skinParts) {
                if(this._skinParts.colorSelectorButton) {
                    this._skinParts.colorSelectorButton.refresh(color);
                }
            }
        },

        setValue: function(colorName){
        },

        _openColorSelectorDialog: function(){
            var pos = this.resources.W.Utils.getPositionRelativeToWindow(this._skinParts.colorSelector);
            var params = {
                color      : this._colorValue,
                colorSource: this._colorSource,
                onChange   : this._onColorChange,
                top        : pos.y,
                left       : pos.x
            };
            this.resources.W.Commands.executeCommand('WEditorCommands.OpenColorSelectorDialogCommand', params);
        },

        _onColorChange: function(color, source){
            this.fireEvent('colorChanged', {'color': color, 'source': source, 'cause': 'temp'});
            this.setColor(color, source);
            this._alpha = 1;
        },

        _openColorAdjusterDialog:function(e){
            var colorSelector = this._skinParts.colorSelectorButton && this._skinParts.colorSelectorButton._skinParts.colorSelector;
            var pos = this.injects().Utils.getPositionRelativeToWindow(colorSelector);
            var params = {
                color       : this._skinParts.colorSelectorButton._color,
                alpha       : this._alpha,
                closeCallback:this._onColorAdjusterClose,
                onChange    : this._onAdjustChange,
                top         : pos.y,
                left        : pos.x
            };
            this.injects().Commands.executeCommand('WEditorCommands.OpenColorAdjusterDialogCommand', params);
        },

        _onAdjustChange:function(e){
            this._onColorAdjusterClose(e);
        },

        _onColorAdjusterClose:function(params){
            this._alpha = params.alpha;
            this.refresh();
            this.fireEvent('adjustmentChanges', params);
        },

        _notifyColorChanged: function(event) {
            this.fireEvent('colorChanged', event);
        },

        setColor:function(color, source) {
//            this._colorValue = color || '#000000';
            this._colorValue = color || 'color_0';
            this._colorSource = source || 'value';
            this._updateColorValue();
            this._skinParts.colorSelectorButton.setColor(this._colorValue, this._colorSource);
            this._skinParts.colorSelectorButton.updateAlphaValue(this._alpha);
            this.refresh();
        },

        _updateColorValue: function(){
            if (this._colorSource === 'theme'){
                this._color = this.resources.W.Preview.getPreviewManagers().Theme.getProperty(this._colorValue);
            } else {
                this._color = new this.imports.Color(this._colorValue);
            }
        },

        _onMouseDown: function(e){
            if (e.target && e.target.getAttribute('skinPart') == 'adjustButton'){
                this.setState('pressedAdjust', 'mouse');
            } else {
                this.setState('pressedColor', 'mouse');
            }
        },

        _onMouseUp: function(e){
            this.removeState('pressedAdjust', 'mouse');
            this.removeState('pressedColor', 'mouse');

        },

        _onMouseOver: function(e){
            if (e.target && e.target.getAttribute('skinPart') == 'adjustButton'){
                this.setState('overAdjust', 'mouse');
            } else {
                this.setState('overColor', 'mouse');
            }
        },

        _onMouseOut: function(e){
            this.removeState('pressedAdjust', 'mouse');
            this.removeState('pressedColor', 'mouse');
            this.removeState('overAdjust', 'mouse');
            this.removeState('overColor', 'mouse');

        },

        isEnabled: function(){
            return true;
        },

        _listenToInput: function() {
            this._skinParts.colorSelectorButton.startListeningToButtonParts();
            this._skinParts.colorSelectorButton.addEvent('colorChanged', this._notifyColorChanged);
            this._skinParts.adjustButton.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.adjustButton.addEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
            this._skinParts.adjustButton.addEvent(Constants.CoreEvents.MOUSE_OVER, this._onMouseOver);
            this._skinParts.adjustButton.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);

            if(this.getState('adjustment') == 'hasAdjustment'){
                this._skinParts.adjustButton.addEvent(Constants.CoreEvents.CLICK, this._openColorAdjusterDialog);
            }
        },

        _stopListeningToInput: function(){
            this._skinParts.colorSelectorButton.stopListeningToButtonParts();
            this._skinParts.colorSelectorButton.removeEvent('colorChanged', this._notifyColorChanged);
            this._skinParts.adjustButton.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.adjustButton.removeEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
            this._skinParts.adjustButton.removeEvent(Constants.CoreEvents.MOUSE_OVER, this._onMouseOver);
            this._skinParts.adjustButton.removeEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);

            this._skinParts.adjustButton.removeEvent(Constants.CoreEvents.CLICK, this._openColorAdjusterDialog);
        }
    });
});