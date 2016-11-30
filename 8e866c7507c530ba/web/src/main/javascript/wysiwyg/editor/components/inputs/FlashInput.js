define.component('wysiwyg.editor.components.inputs.FlashInput', function(componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.binds({
        'label': ['hasLabel', 'noLabel'],
        'delete': ['hasDelete']
    });

    def.binds(['_openFlashDialog', '_onFlashSelect']);

    def.statics({
        HeightWidth: {
            height:null,
            width:null
        }
    });

    def.skinParts({
        label: {type: 'htmlElement'},
        imageContainer: {type: 'htmlElement'},
        image: {
            type:'core.components.Image', argObject: {cropMode: 'fill', scaleMode: 'width_height'}
        },
        changeButton: {type: 'wysiwyg.editor.components.WButton'}
    });

    def.methods({
        /**
         * @override
         * Initialize Input
         * @param compId
         * @param viewNode
         * @param args
         * Optional args:
         * buttonText: {String} The text of the image replacement button
         * data: {Object} The Image data object
         * mediaTabs: {Array} For the Media Dialog - Define the list of tabs to show
         * mediaFilterWixImages: {String} For the Media Dialog - The filter for images to show in the dialog
         */
        initialize: function(compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._buttonText = args.buttonText || '';
            this._flashRawData = null;
            this._hasDeleteButton = false;
            this.HeightWidth.height = args.height;
            this.HeightWidth.width = args.width;
            this.setCommand('WEditorCommands.OpenFlashDialog');

        },

        /**
         * Render the COMPONENT,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function() {
            this.parent();
            this.setButton(this._buttonText);
            /* for favi icons mostly */
            if(this.HeightWidth.height && this.HeightWidth.height < 64){
                var margin = (64 - this.HeightWidth.height)/2;
                this._skinParts.imageContainer.setStyles({'height':this.HeightWidth.height,'width':this.HeightWidth.width, 'margin':margin});
            }

            var dataItemForImage = W.Data.createDataItem({
                type: "Image",
                uri: W.Theme.getProperty('THEME_DIRECTORY') + "flash_swf_icon.png"
            });
            this._skinParts.image._useWebUrl = true; // Hack
            this._skinParts.image.setDataItem( dataItemForImage );
        },

        /**
         * Set the image from an imageDataType object
         * @param {Object} rawData The image data object to set
         */
        setValue: function(rawData){
            if (!rawData || !rawData.uri || rawData == this._flashRawData){
                return;
            }
            this._flashRawData = rawData;
            var currData = this._data.getData();
            var fieldName;
            for (fieldName in rawData) {
                var newValue = rawData[fieldName];
                var oldValue = currData[fieldName];
                if (newValue != oldValue) {
                    this._data.set(fieldName, newValue, true);
                }
            }

            this._data.fireDataChangeEvent("uri", this._data.get("uri"));
        },

        /**
         * Returns the details of the image as an imageDataType object
         */
        getValue: function(){
            return this._flashRawData || null;
        },

        /**
         * Set the text on the "change image" button
         * @param text If text value is falsie - hide the button
         */
        setButton: function(text){
            if (text){
                this._skinParts.changeButton.uncollapse();
                this._skinParts.changeButton.setLabel(text);
            }else{
                this._skinParts.changeButton.collapse();
                this._skinParts.changeButton.setLabel('');
            }
        },

        /**
         * Open dialog
         */
        _openFlashDialog: function(){
            var calback = this._onFlashSelect.bind(this);
            W.Commands.executeCommand('WEditorCommands.OpenMediaFrame',{
                galleryConfigID: 'flash',
                i18nPrefix: 'flash',
                selectionType: 'single',
                mediaType: 'swf',
                callback: calback
            });
        },
        _onFlashSelect:function(rawData){
            this.getDataItem().setFields({
                height: rawData.height,
                width: rawData.width,
                uri: rawData.fileName
            });
            this._changeEventHandler({});
        },

        _changeEventHandler: function(e) {
            this.parent(e);
        },

        /**
         * Assign change events
         */
        _listenToInput: function() {
            this._skinParts.imageContainer.addEvent(Constants.CoreEvents.CLICK, this._openFlashDialog);
            this._skinParts.changeButton.addEvent(Constants.CoreEvents.CLICK, this._openFlashDialog);
        },

        /**
         * Remove change events
         */
        _stopListeningToInput: function() {
            this._skinParts.imageContainer.removeEvent(Constants.CoreEvents.CLICK, this._openFlashDialog);
            this._skinParts.changeButton.removeEvent(Constants.CoreEvents.CLICK, this._openFlashDialog);
        }
    });
});