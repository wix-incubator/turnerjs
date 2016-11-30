/**
 * @Class wysiwyg.editor.components.inputs.font.FontStyle
 * @extends wysiwyg.editor.components.inputs.BaseInput
 */
define.component('wysiwyg.editor.components.inputs.font.FontStyle', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.utilize(['core.utils.css.Font']);

    def.skinParts({
        bold:   {type: 'wysiwyg.editor.components.inputs.CheckBoxImage', argObject:{}},
        italic: {type: 'wysiwyg.editor.components.inputs.CheckBoxImage', argObject:{}}
    });

    def.states({'label': ['hasLabel', 'noLabel'] });

    /**
     * @lends wysiwyg.editor.components.inputs.font.FontStyle
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
            args = args || {};
            this._value = args.value || '';
            this._themeManager = this.injects().Preview.getPreviewManagers().Theme;

        },

        /**
         * @override
         **/
        render: function(){},

        _onAllSkinPartsReady : function() {
            this.parent();
            if (this.isEnabled()){
                this._skinParts.bold.enable();
                this._skinParts.italic.enable();
            }else{
                this._skinParts.bold.disable();
                this._skinParts.italic.disable();
            }
            this._skinParts.bold.setBackground('icons/font/fonts_bold.png', null, {w:27, h:33});
            this._skinParts.italic.setBackground('icons/font/fonts_italic.png', null, {w:27, h:33});

        },
        /**
         * @param value should be a W.Background string or obj
         */

        setValue: function(value){
            this._value = value;
            var font = new this.imports.Font(this._value, this._themeManager);

            this._skinParts.bold.setValue(font.getWeight() == 'bold');
            this._skinParts.italic.setValue(font.getStyle() == 'italic');

        },
        getValue: function () {
            if (!this._value) {
                return '';
            }
            var bold = (this._skinParts.bold.getValue()) ? 'bold' : 'normal';
            var italic = (this._skinParts.italic.getValue()) ? 'italic' : 'normal';
            var font = new this.imports.Font(this._value, this._themeManager);
            font.setWeight(bold);
            font.setStyle(italic);
            this._value = font.getThemeString();

            return this._value;
        },
        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.bold.enable();
            this._skinParts.italic.enable();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            if (this.isReady()){
                this._skinParts.bold.disable();
                this._skinParts.italic.disable();
            }
        },
        /**
         * The change event handler of the input.
         * Must fire 'inputChanged' event to communicate
         * @param e
         */
        _changeEventHandler: function(e) {
            var value = this.getValue();
            var event = {value: value, origEvent: e, compLogic: this};
            this.fireEvent('inputChanged', event);
        },
        /**
         * Assign change events.
         * Must be overridden by children components
         */
        _listenToInput: function() {
            this._skinParts.bold.addEvent('inputChanged', this._changeEventHandler);
            this._skinParts.italic.addEvent('inputChanged', this._changeEventHandler);
        },
        /**
         * Remove change events.
         * Must be overridden by children components
         */
        _stopListeningToInput: function() {
            this._skinParts.bold.removeEvent('inputChanged', this._changeEventHandler);
            this._skinParts.italic.removeEvent('inputChanged', this._changeEventHandler);

        }
    });
});