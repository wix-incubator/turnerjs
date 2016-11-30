define.component('wysiwyg.viewer.components.AudioPlayer', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.utilize(['wysiwyg.viewer.components.classes.SoundUtils']);

    def.binds([
        '_play',
        '_pause',
        '_stop',
        '_onFinish',
        '_setVolume',
        '_createAudioPlayer',
        '_soundManagerReady',
        '_onViewerModeChange',
        '_mediaGalleryCallback',
        '_onPageTransitionStarted'
    ]);

    def.resources(['scriptLoader', 'W.Config', 'W.Utils', 'W.Commands', 'topology', 'W.Resources', 'W.Viewer']);

    def.skinParts({
        'playButton': { type: 'htmlElement' },
        'stopButton': { type: 'htmlElement' },
        'pauseButton': { type: 'htmlElement' }
    });

    def.statics({
        MEDIA_GALLERY: {
            DataTypes: {
                "music": "Audio"
            }
        },

        EDITOR_META_DATA: {
            general: {
                settings: true,
                design: true
            },
            custom: [
                {
                    label: 'AUDIO_REPLACE_AUDIO',
                    command: 'WEditorCommands.OpenMediaFrame',
                    commandParameter: {
                        commandSource: 'FPP',
                        galleryConfigID: 'audio',
                        i18nPrefix: 'music',
                        selectionType: 'single',
                        mediaType: 'music',
                        callback: '_mediaGalleryCallback'
                    },
                    commandParameterDataRef: 'SELF'
                }
            ],
            dblClick: {
                command: 'WEditorCommands.OpenMediaFrame',
                commandParameter: {
                    commandSource: 'dblClick',
                    galleryConfigID: 'audio',
                    i18nPrefix: 'music',
                    selectionType: 'single',
                    mediaType: 'music',
                    callback: '_mediaGalleryCallback'
                },
                commandParameterDataRef: 'SELF'
            },
            mobile: {
                allInputsHidden: true
            }
        }
    });

    def.states(['loading', 'stopped', 'playing']);

    def.dataTypes(['AudioPlayer']);

    def.methods({
        initialize: function (compId, viewNode, argsObject) {
            /**@type wysiwyg.viewer.components.classes.SoundUtils*/
            this._soundUtils = new this.imports.SoundUtils();
            this.parent(compId, viewNode, argsObject);
            this._soundUtils.loadApi();
            this.resources.W.Commands.registerCommandAndListener('WViewerCommands.StopAllOtherAudios', this, this._stopAllOtherAudios);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._onEditModeChange);
            this.resources.W.Viewer.addEvent('pageTransitionStarted', this._onPageTransitionStarted);
        },

        _onEditModeChange: function (mode, oldMode) {
            this._shouldPlayAudio();
        },

        _onPageTransitionStarted: function () {
            if (!this._shouldPlayAudio()) {
                this._stop();
            }
        },

        _shouldPlayAudio: function () {
            var env = this.resources.W.Config.env,
                isPlaying = this.getState() === 'playing',
                autoPlay = this._data.get('autoPlay');

            return env.isInInteractiveViewer() && env.isViewingDesktopDevice() && this.getIsDisplayed() && (autoPlay || isPlaying);
        },

        _stopAllOtherAudios: function (commandParams) {
            if (commandParams.compId !== this.getComponentUniqueId() && this.getIsDisplayed()) {
                this._pause();
            }
        },

        _isEditModeChangeToFromPreview: function (mode, oldMode) {
            return mode === 'PREVIEW' || (oldMode && oldMode.source === 'PREVIEW');
        },

        _onAllSkinPartsReady: function (skinParts) {
            if (this.$class._audioManagerWasLoaded) {
                this.setState('stopped');
            }

            if (this._fileWasSet()) {
                this._createAudioPlayer()
                    .done();
            }
        },

        _createAudioPlayer: function () {
            this._attachButtonEvents();
            this._registerButtonCommands();

            return this._createAudio()
                .then(function () {
                    if (this._shouldPlayAudio()) {
                        this._play();
                    }
                }.bind(this));
        },

        _onViewerModeChange: function (currentStates) {
            var viewerMode = currentStates.viewerMode;
            if (viewerMode === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this._stop();
            }
            if (this.resources.W.Config.env.isEditorInPreviewMode() && this.getIsDisplayed() && this._data.get('autoPlay') && this._fileWasSet()) {
                this._play();
            } else {
                this._stop();
            }
        },

        _onModeChange: function (mode) {
            if (this._isDisposed) {
                return;
            }
            if (this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE) {
                return;
            }
            if ((this._isInPreviewMode(mode) && this.getIsDisplayed() && this._data.get('autoPlay') && this._fileWasSet())) {
                this._play();
            } else {
                this._stop();
            }
        },

        _fileWasSet: function () {
            if (this._isDisposed) {
                return;
            }
            return this._data.get('uri').length > 0;
        },

        _isInPreviewMode: function (mode) {
            return mode.toLowerCase() === Constants.ViewManager.VIEW_MODE_PREVIEW.toLowerCase();
        },

        _play: function () {
            if (this._fileWasSet()) {
                this.setState('playing');
                var playParameters = { volume: this.getDataItem().get('volume') };
                playParameters.onfinish = this._onFinish;
                this.resources.W.Commands.executeCommand('WViewerCommands.StopAllOtherAudios', {compId: this.getComponentUniqueId()}, this);
                if (this._audio) {
                    this._audio.play(playParameters);
                }
            }
        },

        _onFinish: function () {
            if (this._data.get('loop')) {
                this._play();
            }
            this.fireEvent("trackFinished");
        },

        _pause: function () {
            if (this._fileWasSet()) {
                this.setState('stopped');
                this._audio.pause();
            }
        },

        _stop: function () {
            if (this._fileWasSet() && this._audio) {
                this.setState('stopped');
                this._audio.stop();
                this._audio.destruct();
                this._createAudio();
            }
        },

        _attachButtonEvents: function () {
            this._skinParts.playButton.addEvent('click', this._play);
            this._skinParts.stopButton.addEvent('click', this._stop);
            this._skinParts.pauseButton.addEvent('click', this._pause);
        },

        _registerButtonCommands: function () {
            this.resources.W.Commands.registerCommandListenerByName('WPreviewCommands.WEditModeChanged', this, this._onModeChange);
            this.resources.W.Commands.registerCommandListenerByName('WPreviewCommands.ViewerStateChanged', this, this._onViewerModeChange);
            this.resources.W.Commands.registerCommandAndListener('WViewerCommands.StopAllOtherAudios', this, this._stopAllOtherAudios);
        },

        _createAudioObject: function (soundManager) {
            return soundManager.createSound({
                id: this.getComponentUniqueId(),
                url: this._soundUtils.getAudioFullUrl(this._data.get('uri'))
            });
        },

        _createAudio: function () {
            return this._soundUtils.waitForApiReady()
                .then(function (soundManagerObj) {
                    this._audio = this._createAudioObject(soundManagerObj);
                    return Q(this._audio);
                }.bind(this));
        },

        _removeProtocol: function (url) {
            var newUrl = url;
            if (url === undefined) {
                return;
            }
            if (newUrl.indexOf('http://') === 0) {
                newUrl = newUrl.substr(5);
            }
            if (newUrl.indexOf('https://') === 0) {
                newUrl = newUrl.substr(6);
            }
            return newUrl;
        },

        _setVolume: function (e) {
            var newVolumeValue = e.value || 100;
            this._audio.volume = newVolumeValue / 100;
        },

        _onDataChange: function (dataItem) {
            this.parent(dataItem);
            this._stop();
        },

        _soundManagerReady: function () {
            this.$class._audioManagerWasLoaded = true;
            if (this.$class._soundManagerReadyCallbacks) {
                this.$class._soundManagerReadyCallbacks.forEach(function (cb) {
                    cb();
                });
            }
        },

        onPageVisibilityChange: function (isVisible) {
            //editor component or the editor is not in preview mode
            if (!W.Config.env.isInInteractiveViewer()) {
                return;
            }

            if (!W.Config.env.isViewingDesktopDevice()) {
                return;
            }

            if (!isVisible && ( this.getState() === 'playing')) {
                this._pause();
            } else if (isVisible && this._data.get('autoPlay') && ( this.getState() !== 'playing')) {
                this._play();
            }
        },

        isPartiallyFunctionalInStaticHtml: function () {
            return true;
        },

        dispose: function () {
            this.parent();
            this.resources.W.Commands.unregisterListener(this._onModeChange);
            this.resources.W.Commands.unregisterListener(this._onViewerModeChange);
            this.resources.W.Viewer.removeEvent('pageTransitionStarted', this._onPageTransitionStarted);
        },

        _mediaGalleryCallback: function (rawData) {
            this.getDataItem().setFields({
                uri: rawData.fileName
            });

            this._createAudioPlayer()
                .done();

            this._logChangeMediaSuccess();
        },
        _logChangeMediaSuccess: function () {
            LOG.reportEvent(wixEvents.CHANGE_IMAGE_CLICK_SUCCESS, {c1: this.className });
        }
    });
});

