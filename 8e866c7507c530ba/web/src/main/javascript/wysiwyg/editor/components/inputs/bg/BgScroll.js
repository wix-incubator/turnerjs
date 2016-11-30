/**
 * @Class wysiwyg.editor.components.inputs.bg.BgScroll
 * @extends wysiwyg.editor.components.inputs.BaseInput
 */
define.component('wysiwyg.editor.components.inputs.bg.BgScroll', function(componentDefinition){
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits("wysiwyg.editor.components.inputs.BaseInput");

    def.utilize(['core.utils.css.Background']);

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.skinParts({
        scrollTypes: {type: 'wysiwyg.editor.components.inputs.CheckBox'}
    });

    def.states({'label': ['hasLabel', 'noLabel'] });

    /**
     * @lends wysiwyg.editor.components.inputs.bg.BgScroll
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
//        _setRadioButtonsInit: function(definition) {
//            definition.argObject.presetList = [
//                {value: 'scroll', label: this.injects().Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_SCROLL')},
//                {value: 'fixed',  label: this.injects().Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_FIXED')}
//            ];
//            return definition;
//        },
        /**
         * Render the component,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function() {
            //Set label if present
            this._skinParts.scrollTypes.setLabel(this._labelText);
        },

        _onAllSkinPartsReady : function() {
            this.parent();
            if (this.isEnabled()){
                this._skinParts.scrollTypes.enable();
            }else{
                this._skinParts.scrollTypes.disable();
            }
            this._skinParts.scrollTypes.addEvent('inputChanged', this._onChange);
            //this._skinParts.scrollTypes.setRadioButtons(this._presetList);
        },

        _onChange: function() {
            LOG.reportCustomEvent(wixEvents.BACKGROUND_CHANGED, this.resources.W.Utils.getBgData('bg_customize_scroll'));
        },

        /**
         * @param value should be a W.Background string or obj
         */

        setValue: function(value){
            var bg = new this.imports.Background(value, this._themeManager);
            this._value = value;
            this._skinParts.scrollTypes.setValue(bg.getAttachment() == 'scroll');
        },
        getValue: function () {
            if (!this._value) {
                return '';
            }
            var scroll = (this._skinParts.scrollTypes.getValue()) ? 'scroll' : 'fixed';
            var bg = new this.imports.Background(this._value, this._themeManager);
            bg.setAttachment(scroll);
            this._value = bg.getThemeString();

            return this._value;
        },
        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.scrollTypes.enable();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            if (this.isReady()){
                this._skinParts.scrollTypes.disable();
            }
        },
        /**
         * Assign change events.
         * Must be overridden by children components
         */
        _listenToInput: function() {
            this._skinParts.scrollTypes.addEvent('inputChanged', this._changeEventHandler);
        },
        /**
         * Remove change events.
         * Must be overridden by children components
         */
        _stopListeningToInput: function() {
            this._skinParts.scrollTypes.removeEvent('inputChanged', this._changeEventHandler);

        }
    });
});