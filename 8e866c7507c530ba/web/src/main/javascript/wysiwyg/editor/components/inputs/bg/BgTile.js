define.component('wysiwyg.editor.components.inputs.bg.BgTile', function (compDefinition) {
    /**@type core.managers.component.ComponentDefinition*/
    var def = compDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');
    def.utilize(['core.utils.css.Background']);
    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);
    def.resources(['W.Preview']);

    def.skinParts({
        tileTypes: {type: 'wysiwyg.editor.components.inputs.RadioButtons', argObject: {display: 'block'}, hookMethod: '_setRadioButtonsInit'}
    });
    def.states({
        'label': ['hasLabel', 'noLabel']
    });
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
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this.bgSizes = ['cover', 'contain'];
            this._value = '';
            this._themeManager = this.injects().Preview.getPreviewManagers().Theme;


        },
        _setRadioButtonsInit: function (definition) {
            var presetList = [
                {value: 'cover', label: this.injects().Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_COVER')},
                {value: 'contain', label: this.injects().Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_CONTAIN')},
                {value: 'repeat repeat', label: this.injects().Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_REPEAT')},
                {value: 'no-repeat repeat', label: this.injects().Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_REPEAT_Y')},
                {value: 'repeat no-repeat', label: this.injects().Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_REPEAT_X')},
                {value: 'no-repeat no-repeat', label: this.injects().Resources.get('EDITOR_LANGUAGE', 'BACKGROUND_REPEAT_NONE')}
            ];
            definition.argObject.presetList = presetList;
            return definition;
        },
        /**
         * Render the component,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function () {
            //Set label if present
            this._skinParts.tileTypes.removeEvent('inputChanged', this._onChange);
            this._skinParts.tileTypes.setLabel(this._labelText);
            this._skinParts.tileTypes.addEvent('inputChanged', this._onChange);
        },

        _onAllSkinPartsReady: function () {
            this.parent();
            if (this.isEnabled()) {
                this._skinParts.tileTypes.enable();
            } else {
                this._skinParts.tileTypes.disable();
            }
            this._skinParts.tileTypes.setRadioButtons(this._presetList);
        },
        /**
         * @param value should be a W.Background string or obj
         */

        setValue: function (value) {
            if (value.indexOf('[') === 0) {
                var ref = value.substring(1, value.length - 1);
                value = this._themeManager.getRawProperty(ref);
            }
            var bg = new this.imports.Background(value, this._themeManager);
            this._value = value;
            if (this.bgSizes.contains(bg.getWidth())) {
                this._skinParts.tileTypes.setValue(bg.getWidth());
            } else {
                this._skinParts.tileTypes.setValue(bg.getRepeat());
            }
        },

        getValue: function () {
            if (!this._value) {
                return '';
            }
            var tile = this._skinParts.tileTypes.getValue();
            var bg = new this.imports.Background(this._value, this._themeManager);
            if (this.bgSizes.contains(tile)) {
                bg.setWidth(tile);
                bg.setRepeat('no-repeat no-repeat');
            } else {
                bg.setWidth('auto');
                bg.setRepeat(tile);
            }
            this._value = bg.getThemeString();

            return this._value;
        },
        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function () {
            this.parent();
            this._skinParts.tileTypes.enable();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function () {
            this.parent();
            if (this.isReady()) {
                this._skinParts.tileTypes.disable();
            }
        },
        /**
         * Assign change events.
         * Must be overridden by children components
         */
        _listenToInput: function () {
            this._skinParts.tileTypes.addEvent('inputChanged', this._changeEventHandler);
        },
        /**
         * Remove change events.
         * Must be overridden by children components
         */
        _stopListeningToInput: function () {
            this._skinParts.tileTypes.removeEvent('inputChanged', this._changeEventHandler);

        },

        _onChange: function() {
            // yes this is an ugly hack to prevent _onChange from running twice, while the panel re-re-renders
            if (this._reported) {
                this._reported = false;
                return;
            }
            this._reported = true;
            // the actual report
            LOG.reportCustomEvent(wixEvents.BACKGROUND_CHANGED, this.resources.W.Utils.getBgData('bg_customize_image_scale'));
        }

    });
});
