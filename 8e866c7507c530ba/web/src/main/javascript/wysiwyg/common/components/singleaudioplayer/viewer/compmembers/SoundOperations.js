/**@class wysiwyg.common.components.newmusicplayer.viewer.compmembers.SoundOperations*/
define.Class('wysiwyg.common.components.singleaudioplayer.viewer.compmembers.SoundOperations', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.resources(['W.Config']);

    def.statics({
        RESET_TIME: '00:00'
    });

    /**@lends wysiwyg.common.components.newmusicplayer.viewer.compmembers.SoundOperations*/
    def.methods({
        initialize: function (miscFunctions) {
            this._audio = null;
            this._hasFile = false;
            this._skinParts = null;
            this._miscFunctions = miscFunctions;
        },

        setSkinParts: function (skinParts) {
            this._skinParts = skinParts;
        },

        setAudio: function (audio) {
            this._audio = audio;
        },

        setHasFile: function (hasFile) {
            this._hasFile = hasFile;
        },

        hasAudio: function () {
            return !!this._audio;
        },

        playSound: function (volume, fileUrl) {
            var player = this,
                playParameters;

            if (!this.hasAudio()) {
                return false;
            }

            playParameters = {
                volume: volume,
                url: fileUrl,
                whileplaying: function () {
                    player.setTrackDurationLabel();
                    player.setTrackPositionLabel();
                    player._setProgressPosition(player._calculateAudioPosition());
                    player._setHandlePosition(player._calculateAudioPosition());
                }.bind(player)
            };
            this._audio.play(playParameters);
            return true;
        },

        stopSound: function () {
            if (!this.hasAudio()) {
                return false;
            }

            this._audio.stop();
            this.resetAudioPosition();
            this.resetProgress();
            return true;
        },

        pauseSound: function () {
            if (!this.hasAudio()) {
                return false;
            }

            this._audio.pause();
            return true;
        },

        destroySound: function () {
            if (this.hasAudio()) {
                this._audio.destruct();
                this._audio = null;
            }
        },

        //**************** Audio Volume ****************/
        setPersistentVolume: function (volume) {
            var listItems = this._skinParts.volumeScale.getChildren(),
                condition,
                i;

            if (this._audio && this._hasFile) {
                this._audio.setVolume(volume);
            }

            for (i = 0; i < listItems.length; i++) {
                condition = i < this._volumeToScale(volume);
                this._miscFunctions.toggleSelectors(condition, listItems[i], 'on', 'off');
            }
        },

        getEventTargetIndex: function (ev) {
            var target = ev.event.target || ev.event.srcElement,
                liElement = target.getParent();

            return target.getParent('ul').getChildren().indexOf(liElement);
        },

        getVolumeChildNodes: function () {
            return this._skinParts.volumeScale.getChildren();
        },

        setNonPersistentVolume: function (ev) {
            var targetIndex,
                listItems,
                i,
                condition;

            if (!this._audio || !this._hasFile) {
                return;
            }

            targetIndex = this.getEventTargetIndex(ev);
            listItems = this.getVolumeChildNodes();

            for (i = 0; i < listItems.length; i++) {
                condition = i <= targetIndex;
                this._miscFunctions.toggleSelectors(condition, listItems[i], 'on', 'off');
            }
            this._audio.setVolume(this._scaleToVolume(targetIndex + 1));
        },

        switchMute: function () {
            var volumeBtn = this._skinParts.volumeBtn;

            if (!this.hasAudio()) {
                return;
            }

            if (volumeBtn.hasClass('muted')) {
                this.unmuteSound();
            } else {
                this._muteSound();
            }
        },

        unmuteSound: function () {
            var volumeBtn = this._skinParts.volumeBtn,
                volumeScale = this._skinParts.volumeScale;

            if (!this.hasAudio()) {
                return;
            }
            this._miscFunctions.switchSelectors(volumeBtn, 'unmuted', 'muted');
            this._miscFunctions.switchSelectors(volumeScale, 'unmuted', 'muted');
            this._audio.unmute();
        },

        _volumeToScale: function (volume) {
            return volume === 0 ? 0 : Math.ceil(volume / 20);
        },

        _scaleToVolume: function (targetIndex) {
            return targetIndex * 20;
        },

        _muteSound: function () {
            var volumeBtn = this._skinParts.volumeBtn,
                volumeScale = this._skinParts.volumeScale;

            if (!this.hasAudio()) {
                return;
            }
            this._miscFunctions.switchSelectors(volumeBtn, 'muted', 'unmuted');
            this._miscFunctions.switchSelectors(volumeScale, 'muted', 'unmuted');
            this._audio.mute();
        },

        //**************** Audio position ****************/
        // reset audio
        resetAudioPosition: function () {
            if (this.hasAudio()) {
                this._audio.setPosition(0);
            }
        },

        seekAudio: function (ev) {
            var offset = this._getClickOffset(ev),
                milliseconds = this._getMilliseconds(offset);

            this._seek(milliseconds);
        },

        _getClickOffset: function (ev) {
            return ev.event ? ev.event.layerX : ev.event.offsetX;
        },

        _getMilliseconds: function (offset) {
            var bar = this._skinParts.bar,
                width = bar.getWidth(),
                percents = offset / width,
                duration = this._hasFile ? this._audio.duration : 0,
                milliseconds = Math.ceil(percents * duration);

            return milliseconds;
        },

        setTrackPositionLabel: function () {
            this._skinParts.trackPosition.set('html', this._getAudioPosition());
        },

        _seek: function (trackPosition) {
            if (this.hasAudio()) {
                this._audio.setPosition(trackPosition);
            }
        },

        _getAudioPosition: function () {
            if (this.hasAudio()) {
                return this._calculateDisplayDuration(this._audio.position);
            }

            return this.RESET_TIME;
        },

        //**************** Progressbar ****************/
        resetProgress: function () {
            if (this._getAudioPosition() === this.RESET_TIME) {
                this._skinParts.slider.setStyle('width', '0');
                this._skinParts.handle.setStyle('left', '0px');
            }
        },

        startMovingProgressbarHandle: function (ev) {
            var target = ev.event.target || ev.event.srcElement,
                up = (this._isMobileDevice() && !this._isInPreview()) ? 'touchend' : 'mouseup',
                move = (this._isMobileDevice() && !this._isInPreview()) ? 'touchmove' : 'mousemove';

            if (!this.hasAudio()) {
                return;
            }
            if (target.getAttribute('skinPart') === 'handle') {
                document.on(up, this, this.stopMovingProgressbarHandle);
                document.on(move, this, this._movingProgressbarHandle);
            }
        },

        stopMovingProgressbarHandle: function (ev) {
            var up = (this._isMobileDevice() && !this._isInPreview()) ? 'touchend' : 'mouseup',
                move = (this._isMobileDevice() && !this._isInPreview()) ? 'touchmove' : 'mousemove';

            document.off(up, this, this.stopMovingProgressbarHandle);
            document.off(move, this, this._movingProgressbarHandle);
        },

        _calculateAudioPosition: function () {
            var duration = this._audio.duration,
                position = this._audio.position,
                percents = (position / duration) * 100;

            return percents;
        },

        _setProgressPosition: function (position) {
            this._skinParts.slider.setStyle('width', position + '%');
        },

        _setHandlePosition: function (position) {
            this._skinParts.handle.setStyle('left', position + '%');
        },

        _isMobileDevice: function () {
            return this.resources.W.Config.env.$viewingDevice === Constants.ViewerTypesParams.TYPES.MOBILE;
        },
        _isInPreview: function () {
            return this.resources.W.Config.env.$isEditorViewerFrame;
        },

        _movingProgressbarHandle: function (ev) {
            var progressbar = this._skinParts.progressbar,
                mouseOffset = (this._isMobileDevice() && !this._isInPreview()) ? ev.event.touches[0].pageX : ev.event.pageX,
                barOffset = this._skinParts.view.getLeft() + progressbar.offsetLeft,
                width = progressbar.getWidth(),
                percents = (mouseOffset - barOffset) / width,
                duration = this._audio.duration,
                outOfBounds = (mouseOffset < barOffset) || (mouseOffset > width + barOffset);

            if (outOfBounds) {
                return;
            }
            this._seek(Math.ceil(percents * duration));
        },

        //**************** Audio duration ****************/
        setTrackDurationLabel: function () {
            this._skinParts.trackDuration.set('html', this._getAudioDuration());
        },

        _getAudioDuration: function () {
            var duration;
            if (!this.hasAudio()) {
                return this.RESET_TIME;
            }

            duration = this._audio.duration;
            return this._calculateDisplayDuration(duration);
        },

        _calculateDisplayDuration: function (duration) {
            var time = duration / 1000,
                minute = Math.floor(time / 60),
                second = Math.floor(time % 60),
                minuteDisplay = (minute < 10) ? '0' + minute : minute,
                secondDisplay = (second < 10) ? '0' + second : second,
                durationDisplay = minuteDisplay + ':' + secondDisplay;

            return durationDisplay;
        }
    });
});