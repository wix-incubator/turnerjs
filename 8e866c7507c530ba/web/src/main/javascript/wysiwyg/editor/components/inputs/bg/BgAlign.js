define.component('wysiwyg.editor.components.inputs.bg.BgAlign', function(componentDefinition) {
    /** @type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.utilize(['core.utils.css.Background']);

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.resources(['W.Config']);

    def.skinParts({
        alignMatrix: {type: 'wysiwyg.editor.components.inputs.RadioImages', argObject: {}, hookMethod:'_setRadioButtonsInit'}
    });

    def.states({'label': ['hasLabel', 'noLabel'] });

    def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._value = '';
            this._themeManager = this.injects().Preview.getPreviewManagers().Theme;

        },

        _setRadioButtonsInit: function(definition) {

            var size = {w: '22px', h: '22px'};
            definition.argObject.presetList = [
                {value: 'left top'      , image: 'icons/bg_align_top_left.png', dimensions: size},
                {value: 'center top'    , image: 'icons/bg_align_empty.png', dimensions: size},
                {value: 'right top'     , image: 'icons/bg_align_top_right.png', dimensions: size},
                Constants.AutoPanel.BREAK,
                {value: 'left center'   , image: 'icons/bg_align_empty.png', dimensions: size},
                {value: 'center center' , image: 'icons/bg_align_center.png', dimensions: size},
                {value: 'right center'  , image: 'icons/bg_align_empty.png', dimensions: size},
                Constants.AutoPanel.BREAK,
                {value: 'left bottom'   , image: 'icons/bg_align_bottom_left.png', dimensions: size},
                {value: 'center bottom' , image: 'icons/bg_align_empty.png', dimensions: size},
                {value: 'right bottom'  , image: 'icons/bg_align_bottom_right.png', dimensions: size}
            ];
            return definition;
        },

        /**
         * Render the component,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function() {
            //Set label if present
            this._skinParts.alignMatrix.removeEvent('inputChanged', this._onChange);
            this._skinParts.alignMatrix.setLabel(this._labelText);
            this._skinParts.alignMatrix.addEvent('inputChanged', this._onChange);
        },

        _onChange: function() {
            LOG.reportCustomEvent(wixEvents.BACKGROUND_CHANGED, this.resources.W.Utils.getBgData('bg_customize_position'));
        },

        _onAllSkinPartsReady : function() {
            this.parent();
            if (this.isEnabled()){
                this._skinParts.alignMatrix.enable();
            }else{
                this._skinParts.alignMatrix.disable();
            }
            //this._skinParts.alignMatrix.setRadioButtons(this._presetList);
        },
        /**
         * @param value should be a W.Background string or obj
         */

        setValue: function (value) {
            var bgInherited = false;
            if (value.indexOf('[') === 0) {
                bgInherited = true;
                var ref = value.substring(1, value.length - 1);
                value = this._themeManager.getRawProperty(ref);
            }
            var bg = new this.imports.Background(value, this._themeManager);
            this._value = value;
            var position = bg.getPosition();

            if (this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE && bgInherited) {
                position = 'center top';
            }
            this._skinParts.alignMatrix.setValue(position);
        },

        getValue: function () {
            if (!this._value) {
                return '';
            }
            var position = this._skinParts.alignMatrix.getValue();
            var bg = new this.imports.Background(this._value, this._themeManager);
            bg.setPosition(position);
            this._value = bg.getThemeString();

            return this._value;
        },
        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.alignMatrix.enable();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            if (this.isReady()){
                this._skinParts.alignMatrix.disable();
            }
        },
        /**
         * Assign change events.
         * Must be overridden by children components
         */
        _listenToInput: function() {
            this._skinParts.alignMatrix.addEvent('inputChanged', this._changeEventHandler);
        },
        /**
         * Remove change events.
         * Must be overridden by children components
         */
        _stopListeningToInput: function() {
            this._skinParts.alignMatrix.removeEvent('inputChanged', this._changeEventHandler);

        }

    });
});