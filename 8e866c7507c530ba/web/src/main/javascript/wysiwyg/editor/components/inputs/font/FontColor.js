/**
 * @Class wysiwyg.editor.components.inputs.font.FontColor
 * @extends wysiwyg.editor.components.inputs.BaseInput
 */
define.component('wysiwyg.editor.components.inputs.font.FontColor', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.utilize(['core.utils.css.Font']);

    def.binds(['_onColorSelectorChange']);

    def.skinParts({
        colorSelector: {type: 'wysiwyg.editor.components.inputs.ColorSelectorField', argObject:{enableAlpha: false}}
    });

    def.states({'label': ['hasLabel', 'noLabel'] });

    /**
     * @lends wysiwyg.editor.components.inputs.font.FontColor
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
            this._skinParts.colorSelector.setLabel(this._labelText);
        },

        _onAllSkinPartsReady : function() {
            this.parent();
            if (this.isEnabled()){
                this._skinParts.colorSelector.enable();
            }else{
                this._skinParts.colorSelector.disable();
            }
            //this._skinParts.alignMatrix.setRadioButtons(this._presetList);
        },
        /**
         * @param value should be a W.Background string or obj
         */

        setValue: function(value){
            this._value = value;

            var font = new this.imports.Font(value, this._themeManager);
            var themeRef = font.getColorReference();
            if(themeRef !== '') {
                this._skinParts.colorSelector.setColor(themeRef, 'theme');
            } else {
                this._skinParts.colorSelector.setColor(font.getColor(), 'value');
            }
        },
        getValue: function(){
            if (!this._value) {
                return '';
            }
            return this._value;
        },
        _onColorSelectorChange: function(e){
            var font = new this.imports.Font(this._value, this._themeManager);
            if(e.source === 'theme') {
                font.setColorReference(e.color);
            } else {
                font.setColor(e.color);
            }
            this._value = font.getThemeString();
            this._changeEventHandler(e);
        },
        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.colorSelector.enable();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            if (this.isReady()){
                this._skinParts.colorSelector.disable();
            }
        },
        /**
         * Assign change events.
         * Must be overridden by children components
         */
        _listenToInput: function() {
            this._skinParts.colorSelector.addEvent('colorChanged', this._onColorSelectorChange);
        },
        /**
         * Remove change events.
         * Must be overridden by children components
         */
        _stopListeningToInput: function() {
            this._skinParts.colorSelector.removeEvent('colorChanged', this._onColorSelectorChange);

        }
    });
});