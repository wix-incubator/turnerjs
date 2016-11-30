define.component('wysiwyg.editor.components.inputs.bg.BgImage', function(classDefinition, inheritStrategy){

    /** @type core.managers.component.ComponentDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.traits(['wysiwyg.editor.components.traits.BindValueToData']);

    def.utilize(['core.utils.css.Background']);

    def.skinParts({
        imageSelector: {
            type: 'wysiwyg.editor.components.inputs.ImageInput',
            argObject: {
                galleryConfigID: 'backgrounds',
                publicMediaFile: 'backgrounds',
                i18nPrefix: 'background',
                selectionType: 'single',
                mediaType: 'picture',
                callback: this._onImgSelect
            }
        }
    });

    def.states({'label': ['hasLabel', 'noLabel'] });

    def.resources(['W.Resources','W.Preview']);

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
            this._themeManager = this.resources.W.Preview.getPreviewManagers().Theme;
            this._imageData = {
                type: 'Image',
                uri:'',
                width: 0,
                height:  0,
                title: '',
                borderSize: '',
                description: ''
            };

        },

        /**
         * Render the component,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function() {
            //Set label if present
            this._skinParts.imageSelector.setLabel(this._labelText);
            this._skinParts.imageSelector.setValue(this._imageData);
            var buttonLabel = (this._imageData && this._imageData.uri && this._imageData.uri != 'none')? 'IMAGE_REPLACE' : 'IMAGE_ADD';
            this._skinParts.imageSelector.setButton(this.resources.W.Resources.get('EDITOR_LANGUAGE', buttonLabel));
            this._skinParts.imageSelector.setDelete(this.resources.W.Resources.get('EDITOR_LANGUAGE', 'IMAGE_REMOVE'));
        },

        _onAllSkinPartsReady : function() {
            this.parent();
            if (this.isEnabled()){
                this._skinParts.imageSelector.enable();
            }else{
                this._skinParts.imageSelector.disable();
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
            var bg = new this.imports.Background(value, this._themeManager);
            this._value = value;
            this._imageData.uri = bg.getImageId();
            this._imageData.width = parseInt(bg.getImageSize()[0]);
            this._imageData.height = parseInt(bg.getImageSize()[1]);
            this._renderIfReady();
        },

         getValue: function () {
             if (!this._value) {
                 return '';
             }
             this._imageData = this._skinParts.imageSelector.getValue() || {};
             var bg = new this.imports.Background(this._value, this._themeManager);
             bg.setImage(this._imageData.uri, this._imageData.width, this._imageData.height);
             this._value = bg.getThemeString();

             return this._value;
         },
        /**
         * Extend BaseComponent _onEnable
         */
        _onEnabled: function(){
            this.parent();
            this._skinParts.imageSelector.enable();
        },

        /**
         * Extend BaseComponent _onDisable
         */
        _onDisabled: function(){
            this.parent();
            if (this.isReady()){
                this._skinParts.imageSelector.disable();
            }
        },
        /**
         * Assign change events.
         * Must be overridden by children components
         */
        _listenToInput: function() {
            this._skinParts.imageSelector.addEvent('inputChanged', this._changeEventHandler);
        },
        /**
         * Remove change events.
         * Must be overridden by children components
         */
        _stopListeningToInput: function() {
            this._skinParts.imageSelector.removeEvent('inputChanged', this._changeEventHandler);
        },

         _changeEventHandler: function(event) {
             this.parent();
             LOG.reportCustomEvent(wixEvents.BACKGROUND_CHANGED, this.resources.W.Utils.getBgData('bg_customize_image_change_remove'));
         }

     });

});


