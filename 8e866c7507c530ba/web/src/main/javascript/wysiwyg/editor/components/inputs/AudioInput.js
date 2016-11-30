define.component('wysiwyg.editor.components.inputs.AudioInput', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.inputs.BaseInput');

    def.binds(['_mediaGalleryCallback', '_openAudioDialog']);

    def.skinParts({
        noItemLabel: {type: 'htmlElement'},
        label: {type: 'htmlElement'},
        changeButton: {type: 'wysiwyg.editor.components.WButton'}
    });

    def.states({'gotAudio': ['gotAudio'], 'label': ['hasLabel', 'noLabel'] });

    def.fields({
        HeightWidth: {height: null, width: null}
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
         */
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._buttonText = args.buttonText || '';
            this._buttonTextWhenNoSelectedItem = args.buttonTextWhenNoSelectedItem || this._buttonText;
            this._defaultEmptyItemText = args.defaultEmptyItemText || '';

            this._audioGalleryCallback = args.commandParameter.callback;
            this._commandSource = args.commandParameter.commandSource;
            this.galleryTypeID = args.galleryConfigID || 'audio';
            this.i18nPrefix = args.i18nPrefix || 'music';
            this.selectionType = 'single';
            this.mediaType = args.mediaType || 'music';
            this.setCommand('WEditorCommands.OpenMediaFrame');
        },

        /**
         * Render the COMPONENT,
         * at the end of each render, before the fireComponentReady command
         * _stopListeningToInput() and _listenToInput() should be called
         */
        render: function () {
            this.parent();
            this._setAudioFileSelectedState();
            var buttonText = this._isGotAudioFile() ? this._buttonText : this._buttonTextWhenNoSelectedItem;
            this._skinParts.changeButton.setLabel(buttonText);
            this._skinParts.noItemLabel.set('html', this._defaultEmptyItemText);
        },

        /**
         * Set the audio from an AudioPlayerDataType object
         * @param {Object} rawData The audio data object to set
         */
        setValue: function (rawData) {
            this._audioRawData = rawData;
            this._setAudioFileSelectedState();
            var originalFileName = rawData.originalFileName || '';
            this.setLabel(decodeURI(originalFileName.replace(/[+]/g, ' ')));

        },

        _setAudioFileSelectedState: function () {
            if (this._isGotAudioFile()) {
                this.setState('gotAudio');
            } else {
                this.removeState('gotAudio');
            }
        },

        _isGotAudioFile: function () {
            return !!this._audioRawData && !!this._audioRawData.uri;
        },

        /**
         * Returns the details of the audio as an AudioPlayerDataType object
         */
        getValue: function () {
            return this._audioRawData;
        },

        /**
         * Open dialog
         */
        _openAudioDialog: function () {
            this.executeCommand({
                commandSource: this._commandSource,
                callback: this._mediaGalleryCallback,
                galleryConfigID: this.galleryTypeID,
                i18nPrefix: this.i18nPrefix,
                selectionType: this.selectionType,
                mediaType: this.mediaType
            });
        },

        _onAudioSelect: function (rawData) {
            var audioData = this.injects().Data.createDataItem(rawData);
            this.setValue(audioData.getData());
            this._changeEventHandler({});
        },

        _changeEventHandler: function (e) {
            this.parent(e);
        },

        /**
         * Assign change events
         */
        _listenToInput: function () {
            this._skinParts.changeButton.addEvent(Constants.CoreEvents.CLICK, this._openAudioDialog);
        },

        /**
         * Remove change events
         */
        _stopListeningToInput: function () {
            this._skinParts.changeButton.removeEvent(Constants.CoreEvents.CLICK, this._openAudioDialog);
        },

        _mediaGalleryCallback: function (rawData) {
            if (typeof this._audioGalleryCallback === 'function') {
                this._audioGalleryCallback(rawData);
                this._skinParts.noItemLabel.innerHTML = rawData.title;

            }
        }
    });

});
