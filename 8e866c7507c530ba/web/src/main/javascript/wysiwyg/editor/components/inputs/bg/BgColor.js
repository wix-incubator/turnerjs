define.component('wysiwyg.editor.components.inputs.bg.BgColor', function(classDefinition, inheritStrategy){

    /** @type core.managers.component.ComponentDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.utilize(['core.utils.css.Background']);

     def.skinParts({
        colorInput: {type: 'wysiwyg.editor.components.inputs.ColorSelectorField', argObject:{enableAlpha: false}}
    });

    def.binds(['_onColorChange']);

    def.states({'label': ['hasLabel', 'noLabel'] });

    def.resources(['W.Preview', 'W.UndoRedoManager']);

     def.methods({
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._value = '';
            this._themeManager = this.resources.W.Preview.getPreviewManagers().Theme;
        },

        /**
         * @override
         */
        render: function() {
            //Set label if present
            this._skinParts.colorInput.setLabel(this._labelText);
        },

         _onAllSkinPartsReady: function () {
             this.parent();
             if (this.isEnabled()) {
                 this._skinParts.colorInput.enable();
             } else {
                 this._skinParts.colorInput.disable();
             }
         },
        /**
         * @param value should be a W.Background string or obj
         */
        setValue: function (value) {
            if (value.indexOf('[') === 0) {
                var ref = value.substring(1, value.length - 1);
                value = this._themeManager.getRawProperty(ref);
            }
            this._value = value;

            var bg = new this.imports.Background(value, this._themeManager);
            var themeRef = bg.getColorReference();
            if (themeRef !== '') {
                this._skinParts.colorInput.setColor(themeRef, 'theme');
            } else {
                this._skinParts.colorInput.setColor(bg.getColor(), 'value');
            }
        },

         getValue: function () {
             if (!this._value) {
                 return '';
             }
//            var bg = new W.Background(this._value, this._themeManager);
//            this._value = bg.getThemeString();

             return this._value;
         },
        _onColorChange: function(e){
            this.resources.W.UndoRedoManager.startTransaction();
            var bg = new this.imports.Background(this._value, this._themeManager);
            if(e.source === 'theme') {
                bg.setColorReference(e.color);
            } else {
                bg.setColor(e.color);
            }
            this._value = bg.getThemeString();
            this._changeEventHandler(e);
            LOG.reportCustomEvent(wixEvents.BACKGROUND_CHANGED, this.resources.W.Utils.getBgData('bg_customize_color_picker'));
        },
        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.colorInput.enable();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            if (this.isReady()){
                this._skinParts.colorInput.disable();
            }
        },

        _listenToInput: function() {
            this._skinParts.colorInput.addEvent('colorChanged', this._onColorChange);
        },

        _stopListeningToInput: function() {
            this._skinParts.colorInput.removeEvent('colorChanged', this._onColorChange);

        }
     });





});


