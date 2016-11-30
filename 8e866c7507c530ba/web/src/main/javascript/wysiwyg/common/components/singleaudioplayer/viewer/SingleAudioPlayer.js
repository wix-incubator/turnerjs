/**
 * @class wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer
 * @extends core.components.base.BaseComp
 */
define.component('wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('core.components.base.BaseComp');

    def.resources(['W.Config', 'W.Utils', 'W.Commands', 'W.Resources']);

    def.utilize([
        'wysiwyg.viewer.components.classes.SoundUtils',
        'wysiwyg.common.components.singleaudioplayer.viewer.compmembers.SoundOperations',
        'wysiwyg.common.components.singleaudioplayer.viewer.compmembers.MiscFunctions'
    ]);

    def.propertiesSchemaType('SingleAudioPlayerProperties');

    def.dataTypes(['SingleAudioPlayer']);

    def.binds([
        '_setAudioInfo',
        '_createAudioObject',
        '_createSoundCallback',
        '_onPageTransitionStarted',
        '_onPageTransitionEnded'
    ]);

    def.states({
        'playerState': ['waiting', 'loading', 'stopped', 'repeat', 'playing', 'pausing'],
        'device': ['desktop', 'mobile'],
        'isduration': ['duration', 'noduration']
    });

    def.skinParts({
        'player': {type: 'htmlElement'},
        'artistLabel': {type: 'htmlElement'},
        'trackLabel': {type: 'htmlElement'},
        'info': {type: 'htmlElement'},
        'sep': {type: 'htmlElement'},
        'playBtn': {type: 'htmlElement'},
        'pauseBtn': {type: 'htmlElement'},
        'repeatBtn': {type: 'htmlElement'},
        'progressbar': {type: 'htmlElement'},
        'bar': {type: 'htmlElement'},
        'slider': {type: 'htmlElement'},
        'handle': {type: 'htmlElement'},
        'volumeBtn': {type: 'htmlElement'},
        'volumeScale': {type: 'htmlElement'},
        'durationOfTrack': {type: 'htmlElement'},
        'trackDuration': {type: 'htmlElement'},
        'trackPosition': {type: 'htmlElement'}
    });

    /** @lends wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer */
    def.methods({
        initialize: function (compId, viewNode, args) {
            /**@type wysiwyg.viewer.components.classes.SoundUtils*/
            this._soundUtils = new this.imports.SoundUtils();

            /**@type wysiwyg.common.components.singleaudioplayer.viewer.compmembers.MiscFunctions*/
            this._miscFunctions = new this.imports.MiscFunctions();

            /**@type wysiwyg.common.components.singleaudioplayer.viewer.compmembers.SoundOperations*/
            this._soundOperations = new this.imports.SoundOperations(this._miscFunctions);

            this.parent(compId, viewNode, args);
            this._soundUtils.loadApi();

            this.resources.W.Commands.registerCommandAndListener('WViewerCommands.StopAllOtherAudios', this, this._stopAllOtherAudios);
            this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._onEditModeChange);

            if (!this.resources.W.Config.env.$isEditorFrame) {
                this.resource.getResourceValue('W.Viewer', function (viewManager) {
                    this._viewMgr = viewManager;
                    this._viewMgr.addEvent('pageTransitionStarted', this._onPageTransitionStarted);
                    this._viewMgr.addEvent('pageTransitionEnded', this._onPageTransitionEnded);
                }.bind(this));
            }

            this.skinGroup = (args && args.skinGroup) ? args.skinGroup : 'single';
        },

        _onPageTransitionStarted: function () {
            if (!this._isAutoplayNeeded()) {
                this._stopAudio();
            }
        },

        _onPageTransitionEnded: function (activePageId) {
            this.activePageId = activePageId;

            if (this.$view.$pageId !== 'master') {
                if (this.$view.$pageId !== this.activePageId && ((this.getParentSiteSegmentContainer()._compId) || this.getParentSiteSegmentContainer()._compId === 'PAGES_CONTAINER')) {
                    this._stopAudio();
                }
            }
        },

        isRenderNeeded: function (invalidations) {
            var renderTriggers = [
                this.INVALIDATIONS.SKIN_CHANGE,
                this.INVALIDATIONS.DATA_CHANGE,
                this.INVALIDATIONS.WIDTH_REQUEST,
                this.INVALIDATIONS.HEIGHT_REQUEST,
                this.INVALIDATIONS.DISPLAY,
                this.INVALIDATIONS.FIRST_RENDER
            ];
            return invalidations.isInvalidated(renderTriggers);
        },

        _onEditModeChange: function (mode, oldMode) {
            var modeChanged = this._isEditModeChangeToFromPreview(mode, oldMode);
            this._handleSoundOnModeChange(modeChanged);
        },

//        _onViewerDeviceChange: function (mode, oldMode) {
//            var modeChanged = this._isViewerDeviceChanged(mode, oldMode);
//        },

        exterminate: function () {
            var env = this.resources.W.Config.env;
            if (env.$isPublicViewerFrame || env.isViewingDesktopDevice()) {
                this._soundOperations.destroySound();
                this.trigger('soundObjectDestroyed');
            }
            this._viewMgr.removeEvent('pageTransitionStarted', this._onPageTransitionStarted);
            this._viewMgr.removeEvent('pageTransitionEnded', this._onPageTransitionEnded);
            this.resources.W.Commands.unregisterListener(this);
            this.parent();
        },

        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations;

            // TODO - using Q here might cause some bugs because it forces all the renderin
            this._soundUtils.waitForApiReady()
                .then(function () {
                    if (invalidations.isInvalidated([this.INVALIDATIONS.DISPLAY])) {
                        if (this._soundOperations.hasAudio() && this.getState('device') === 'desktop') {
                            this._stopAudio();
                            this._soundOperations.setTrackPositionLabel();
                            this._soundOperations.resetProgress();
                            if (!this.resources.W.Config.env.isInInteractiveViewer()) {
                                this.setState('stopped', 'playerState');
                            }
                        }
                        if (this._soundOperations.hasAudio()) {
                            this._handleSoundOnModeChange();
                        }
                    }
                    if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                        this._setDeviceState();
                        this.resources.W.Commands.registerCommandAndListener('WViewerCommands.StopAllOtherAudios', this, this._stopAllOtherAudios);
                        this.resources.W.Commands.registerCommandAndListener('WPreviewCommands.WEditModeChanged', this, this._onEditModeChange);
                    }
                    if (invalidations.isInvalidated([this.INVALIDATIONS.SKIN_CHANGE])) {
                        this._connectSkinWithLogic();
                    }
                    if (invalidations.isInvalidated([this.INVALIDATIONS.DATA_CHANGE])) {
                        this._handleDataChange(invalidations.getInvalidationByType(this.INVALIDATIONS.DATA_CHANGE)[0]);
                    }
                    if (invalidations.isInvalidated([this.INVALIDATIONS.DATA_CHANGE, this.INVALIDATIONS.SKIN_CHANGE])) {
                        this._setDataToSkinParts();
                    }
                }.bind(this))
                .done();
        },

        _handleDataChange: function (dataChangeInvalidation) {
            var field = dataChangeInvalidation.field,
                uri = dataChangeInvalidation.dataItem.get('uri');

            if ((field && field.uri) || (!field && uri)) {
                this._changeAudio();
            }
        },

        //**************** Render handlers ****************/
        _handleSoundOnModeChange: function (modeChanged) {
            this._soundOperations.unmuteSound();

            if (this._isAutoplayNeeded()) {
                this._playAudio();
            } else if (!this.resources.W.Config.env.isInInteractiveViewer() || this._stopAutoplay(modeChanged)) {
                this._stopAudio();
            }
        },

        _stopAutoplay: function (modeChanged) {
            var currentPageId = this._viewMgr.getCurrentPageId();
            return this.getState('playerState') === 'playing' && (currentPageId !== this.activePageId || (this.getState('device') === 'mobile' && this._soundOperations._isMobileDevice() === false) || (modeChanged !== 'undefined'));
        },

        _setDeviceState: function () {
            if (this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE) {
                this.setState('mobile', 'device');
            }
        },

        _connectSkinWithLogic: function () {
            this._soundOperations.setSkinParts(this._skinParts);
            this._setPlayerMinimumSize();
            this._attachPlayerEvents();
        },

        _changeAudio: function () {
            this._soundOperations.setHasFile(true);
            this._soundOperations.destroySound();

            this._getSoundManagerResource()
                .then(this._createAudioObject.bind(this))
                .then(this._createSoundCallback.bind(this))
                .done();
        },

        _setDataToSkinParts: function () {
            this._soundOperations.setTrackPositionLabel();
            this._setAudioInfo();
            this._soundOperations.resetProgress();
            this._soundOperations.setTrackDurationLabel();
            this._soundOperations.setPersistentVolume(this.getComponentProperty('volume'));
        },

        _setAudioInfo: function () {
            this._setAudioName();
            this._setArtistName();
            this._audioInfoDisplayNeeded();
        },

        _getSoundManagerResource: function () {
            return Q(window.soundManager);
        },

        //**************** Audio operations ****************/

        _createSoundCallback: function (sound) {
            var audioTags = ['track', 'artist'];

            if (this._hasAnyDefaultData(audioTags) && _.isEmpty(sound.id3)) {
                this._setUnknownSoundTags();
            } else {
                this._setAudioInfo();
            }
            if (this.getState('playerState') === 'waiting') {
                this.setState('stopped', 'playerState');
            }

            this._soundOperations.setTrackDurationLabel();
            this._soundOperations.setTrackPositionLabel();
        },

        _createAudioObject: function (soundMangerObj) {
            var player = this,
                dfd = Q.defer(),
                audio = soundMangerObj.createSound({
                    id: player.getComponentUniqueId(),
                    url: player._soundUtils.getAudioFullUrl(player.getDataItem().get('uri')),
                    autoPlay: false,
                    stream: true,
                    multiShot: true,
                    multiShotEvents: true,
                    autoLoad: player.getState('device') === 'desktop',
                    usePolicyFile: false,
                    whileloading: function () {
                        if (player.getState('device') === 'desktop') {
                            player._soundOperations.setTrackDurationLabel();
                            player._soundOperations.setTrackPositionLabel();
                        }
                        if (player._soundOperations.hasAudio() && _.isEmpty(this.id3)) {
                            player._loadingAudioInfo();
                        }
                        if (player._isAutoplayNeeded() && player.getState('playerState') !== 'playing') {
                            player._playAudio();
                        }
                    },
                    onload: function () {
                        dfd.resolve(player); //audio object
                    },
                    onid3: function () {
                        var artistName = this.id3.TPE1,
                            trackName = this.id3.TIT2;

                        player._updateInfoWithTags(artistName, trackName);
                    },
                    onfailure: function () {
                        player._failedToLoadFile();
                    },
                    onfinish: function () {
                        player._finishedPlayingAudio();
                    },
                    onsuspend: function () {
                        player._createSoundCallback(this);
                    }
                });

            player._soundOperations.setAudio(audio);
            return dfd.promise;
        },

        _updateInfoWithTags: function (artistName, trackName) {
            var data = this.getDataItem(),
                artist = data.get('artist'),
                track = data.get('track');

            if (artist !== artistName && artist === data._schema.artist['default']) {
                data.set('artist', artistName);
            }
            if (track !== trackName && track === data._schema.track['default']) {
                data.set('track', trackName);
            }
        },

        _hasDefaultData: function (fieldName) {
            var data = this.getDataItem();
            return data.get(fieldName) === data._schema[fieldName]['default'];
        },

        _hasAnyDefaultData: function (dataFields) {
            var i;
            for (i = 0; i < dataFields.length; i++) {
                if (this._hasDefaultData(dataFields[i])) {
                    return true;
                }
            }
            return false;
        },

        _failedToLoadFile: function () {
            LOG.reportError('Failed to load audio file');
        },

        _playAudio: function () {
            var volume = this.getComponentProperty('volume'),
                fileUrl = this._soundUtils.getAudioFullUrl(this.getDataItem().get('uri'));

            this.resources.W.Commands.executeCommand('WViewerCommands.StopAllOtherAudios', {compId: this.getComponentUniqueId()}, this);
            if (this._soundOperations.playSound(volume, fileUrl)) {
                this.setState('playing', 'playerState');
            }

        },

        _stopAudio: function () {
            if (this._soundOperations.stopSound()) {
                this.setState('stopped', 'playerState');
                this._soundOperations.resetProgress();
            }
        },

        _pauseAudio: function () {
            if (this._soundOperations.pauseSound()) {
                this.setState('pausing', 'playerState');
            }
        },

        _stopAllOtherAudios: function (commandParams) {
            if (commandParams.compId !== this.getComponentUniqueId() && this.getIsDisplayed()) {
                this._stopAudio();
            }
        },

        _finishedPlayingAudio: function () {
            if (this.getComponentProperty('loop')) {
                this._playAudio();
            } else {
                this.setState('repeat', 'playerState');


            }
        },

        _isAutoplayNeeded: function () {
            var env = this.resources.W.Config.env,
                state = this.getState('playerState'),
                isPlaying = state === 'playing' || state === 'repeat',
                isPaused = state === 'pausing',
                autoPlay = this.getComponentProperty('autoplay');

            return env.isInInteractiveViewer() && env.isViewingDesktopDevice() && this.getIsDisplayed() &&
                this._soundOperations.hasAudio() && (autoPlay || (isPlaying && this.$view.$pageId === 'master')) && !isPaused;
        },


        //**************** Skin handlers ****************/
        _loadingAudioInfo: function () {
            if (this.getState('device') === 'desktop') {
                this._miscFunctions.switchSelectors(this._skinParts.sep, 'hidden', 'visible');
                this._skinParts.trackLabel.set('html', 'Loading...');
                this._skinParts.artistLabel.set('html', '');
            }
        },

        _audioInfoDisplayNeeded: function () {
            var artist = this.getDataItem().get('artist'),
                track = this.getDataItem().get('track'),
                separator = this._skinParts.sep;

            this._miscFunctions.toggleSelectors(track === '' || artist === '', separator, 'hidden', 'visible');
        },

        _setPlayerMinimumSize: function () {
            var player = this._skinParts.player;
            this.setMinW(parseInt(player.getStyle('min-width'), 10));
            this.setMinH(parseInt(player.getStyle('min-height'), 10));
            this.setHeight(parseInt(player.getStyle('min-height'), 10));
        },

        _setUnknownSoundTags: function () {
            var data = this.getDataItem();
            data.set('track', 'Unknown Track');
            data.set('artist', 'Unknown Artist');
        },

        _setArtistName: function () {
            var artist = this.getDataItem().get('artist');
            this._skinParts.artistLabel.set('html', artist);
        },

        _setAudioName: function () {
            var track = this.getDataItem().get('track');
            this._skinParts.trackLabel.set('html', track);
        },

        //**************** Mouse events ****************/
        _attachPlayerEvents: function () {
            if (this.getState('device') === 'mobile') {
                this._attachMobileEvents();
            } else {
                this._attachDesktopEvents();
            }
        },

        _attachMobileEvents: function () {
            var down = (this._soundOperations._isMobileDevice() && !this._soundOperations._isInPreview()) ? 'touchstart' : 'mousedown';

            this._skinParts.playBtn.on('click', this, this._playAudio);
            this._skinParts.repeatBtn.on('click', this, this._playAudio);
            this._skinParts.pauseBtn.on('click', this, this._pauseAudio);
            this._skinParts.bar.on('click', this._soundOperations, this._soundOperations.seekAudio);
            this._skinParts.slider.on('click', this._soundOperations, this._soundOperations.seekAudio);
            this._skinParts.handle.on(down, this._soundOperations, this._soundOperations.startMovingProgressbarHandle);
        },

        _attachDesktopEvents: function () {
            this._skinParts.playBtn.on('click', this, this._playAudio);
            this._skinParts.repeatBtn.on('click', this, this._playAudio);
            this._skinParts.pauseBtn.on('click', this, this._pauseAudio);
            this._skinParts.volumeBtn.on('click', this._soundOperations, this._soundOperations.switchMute);
            this._skinParts.volumeScale.on('click', this._soundOperations, this._soundOperations.setNonPersistentVolume);
            this._skinParts.bar.on('click', this._soundOperations, this._soundOperations.seekAudio);
            this._skinParts.slider.on('click', this._soundOperations, this._soundOperations.seekAudio);
            this._skinParts.handle.on('mousedown', this._soundOperations, this._soundOperations.startMovingProgressbarHandle);
        }
    });
});