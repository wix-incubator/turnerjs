/**
 * @Class wysiwyg.editor.components.inputs.font.FontSize
 * @extends wysiwyg.editor.components.inputs.BaseInput
 */
define.component('wysiwyg.editor.components.inputs.font.FontSize', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.utilize(['core.utils.css.Font']);

    def.binds(['_onMouseUp', '_onMouseDown', '_onMouseOut']);

    def.skinParts({
        input: {type: 'wysiwyg.editor.components.inputs.TickerInput'},
        upArrow: {type: 'htmlElement'},
        downArrow: {type: 'htmlElement'}
    });

    def.states({'label': ['hasLabel', 'noLabel'] });

    /**
     * @lends wysiwyg.editor.components.inputs.font.FontSize
     */
    def.methods({
        /**
         * Initialize Input
         * Each input should get it's parameters through 'args'
         * 'labelText' is the only mandatory parameter
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * labelText: the value of the label to show above/next to the field
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._value = '';
            this._themeManager = this.injects().Preview.getPreviewManagers().Theme;

        },

        /**
         * Render the component,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function() {
            //Set label if present
            this._skinParts.input.setLabel(this._labelText);
        },

        _onAllSkinPartsReady : function() {
            this.parent();
            if (this.isEnabled()){
                this._skinParts.input.enable();
            }else{
                this._skinParts.input.disable();
            }
        },
        /**
         * @param value should be a W.Background string or obj
         */

        setValue: function(value){
            var font = new this.imports.Font(value, this._themeManager);
            this._value = value;
            this._skinParts.input.setValue(parseFloat(font.getSize()));
        },
        getValue: function(){
            if (!this._value) {
                return '0';
            }
            var size = this._skinParts.input.getValue();
            var font = new this.imports.Font(this._value, this._themeManager);
            font.setSize(size);
            this._value = font.getThemeString();

            return this._value;
        },
        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.input.enable();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            if (this.isReady()){
                this._skinParts.input.disable();
            }
        },

        _onMouseDown: function(e){
            if (e && e.target){
                var input = this._skinParts.input;
                if (e.target.getProperty('skinpart') == 'upArrow'){
                    input.setValue(Number(input.getValue()) + Number(input.step));
                }
                else
                if (e.target.getProperty('skinpart') == 'downArrow'){
                    input.setValue(Number(input.getValue()) - Number(input.step));
                }
                if (input.getValue() > input.min && input.getValue() < input.max){
                    this._mouseDownTimer = this.callLater(this._onMouseDown, [e], 150);
                }
            }
            this._skinParts.upArrow.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);
            this._skinParts.downArrow.addEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);
        },


        _onMouseUp: function(e){
            clearTimeout(this._mouseDownTimer);
            this._skinParts.input.fireChangeEvent(e);
            this._skinParts.upArrow.removeEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);
            this._skinParts.downArrow.removeEvent(Constants.CoreEvents.MOUSE_OUT, this._onMouseOut);
        },

        _onMouseOut: function(e){
            this._onMouseUp(e);
        },
        /**
         * Assign change events.
         * Must be overridden by children components
         */
        _listenToInput: function() {
            this._skinParts.input.addEvent('inputChanged', this._changeEventHandler);
            this._skinParts.upArrow.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.downArrow.addEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.upArrow.addEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
            this._skinParts.downArrow.addEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);

        },
        /**
         * Remove change events.
         * Must be overridden by children components
         */
        _stopListeningToInput: function() {
            this._skinParts.input.removeEvent('inputChanged', this._changeEventHandler);
            this._skinParts.upArrow.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.downArrow.removeEvent(Constants.CoreEvents.MOUSE_DOWN, this._onMouseDown);
            this._skinParts.upArrow.removeEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
            this._skinParts.downArrow.removeEvent(Constants.CoreEvents.MOUSE_UP, this._onMouseUp);
        }
    });
});