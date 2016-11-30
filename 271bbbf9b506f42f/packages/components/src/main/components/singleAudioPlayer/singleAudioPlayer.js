// wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer
define(['core', 'react', 'lodash', 'reactDOM'], function(/** core */ core, React, _, ReactDOM) {
    'use strict';

    var mixins = core.compMixins;

    var volumeToScale = function (volume) {
        return volume === 0 ? 0 : Math.ceil(volume / 20);
    };

    var scaleToVolume = function (volumeBars) {
        return volumeBars * 20;
    };

    var calculateDisplayDuration = function (duration) {
        var time = duration / 1000,
            minute = Math.floor(time / 60),
            second = Math.floor(time % 60),
            minuteDisplay = (minute < 10) ? '0' + minute : minute,
            secondDisplay = (second < 10) ? '0' + second : second,
            durationDisplay = minuteDisplay + ':' + secondDisplay;

        return durationDisplay;
    };

    var calculateSeekPosition = function (ev, width, duration) {
        var percents = (ev.nativeEvent.offsetX ? ev.nativeEvent.offsetX : ev.nativeEvent.layerX) / width,
            seekPosition = Math.ceil(percents * duration);

        return seekPosition;
    };

    var toggleMute = function (comp, compState) {
        if (compState === 'unmuted') {
            comp.muteAudio();
        } else {
            comp.unmuteAudio();
        }
    };

    /**
     * @class components.SingleAudioPlayer
     * @extends {core.skinBasedComp}
     * @extends {ReactCompositeComponent}
     * @extends {core.skinInfo}
     * @property {comp.properties} props
     * @extends {core.audioMixin}
     * @property {comp.properties} props
     */
    return {
        displayName: 'SingleAudioPlayer',
        mixins: [mixins.skinBasedComp, mixins.skinInfo, mixins.audioMixin],

        getInitialState: function () {
            // we need this as member values because of audioMixin,
            // (for example AudioPlayer has the "autoplay" value on compData object)
            this.audioVolume = this.props.compProp.volume;
            this.autoPlay = this.props.compProp.autoplay;

            return {
                $playerState: 'waiting',
                $device: this.getDeviceState(),
                $isduration: 'duration',
                $isMuted: 'unmuted',
                trackDuration: '00:00',
                trackPositionLabel: '00:00',
                progressPosition: 0,
                volumeBars: volumeToScale(this.props.compProp.volume),
                dragging: false,
                $heightChanged: false
            };
        },

        finishedPlayingAudio: function () {
            this.isAudioPlaying = false;
            if (this.props.compProp.loop) {
                this.initiatePlay();
            } else {
                this.setState({$playerState: 'repeat'});
            }
        },

        whileLoadingHandler: function (duration) {
            var displayPosition = calculateDisplayDuration(duration);

            this.setState({
                trackDuration: displayPosition
            });
        },

        whilePlayingHandler: function (position) {
            var displayPosition = calculateDisplayDuration(position),
                progressPosition = (position / this.getAudioDuration()) * 100;

            this.setState({
                trackPositionLabel: displayPosition,
                progressPosition: progressPosition
            });
        },

        getProgressBarWidth: function () {
            return ReactDOM.findDOMNode(this.refs.progressbar).offsetWidth;
        },

        resetTrackPosition: function () {
            this.setState({
                 trackPositionLabel: '00:00',
                  progressPosition: 0
            });
        },

        movingProgressbarHandle: function (ev) {
            var width = this.getProgressBarWidth(),
                barOffsetLeft = this.getSkinExports('barSpaceLeft').barSpaceLeft,
                barOffsetRight = this.getSkinExports('barSpaceRight').barSpaceRight,
            // compLeft = this.props.style.left,
                compWidth = this.props.style.width,
                mouseOffset = ev.pageX,
                duration = this.getAudioDuration(),
                outOfBounds = (mouseOffset < barOffsetLeft) || (mouseOffset > compWidth - barOffsetRight),
                seekPosition = calculateSeekPosition(ev, width, duration);

            if (outOfBounds) {
                return;
            }
            this.setState({
                trackPositionLabel: calculateDisplayDuration(seekPosition),
                progressPosition: (seekPosition / duration) * 100
            });
            this.seekAudio(seekPosition);

        },

        stoppedMovingProgressbarHandle: function (ev) {
            var width = this.getProgressBarWidth();
            var duration = this.getAudioDuration();
            var seekPosition = calculateSeekPosition(ev, width, duration);
            this.setState({
                trackPositionLabel: calculateDisplayDuration(seekPosition),
                progressPosition: (seekPosition / duration) * 100
            });
            this.seekAudio(seekPosition);
        },

        callSeek: function (ev) {
            var width = this.getProgressBarWidth();
            var duration = this.getAudioDuration();
            var seekPosition = calculateSeekPosition(ev, width, duration);

            this.seekAudio(seekPosition);
        },

        // **** Volume functions **** //
        buildVolumeScale: function () {
            var scaleLength = 5,
                styleId = this.props.styleId,
                turnOnBars = this.state.volumeBars;

            return _.times(scaleLength, function (index) {
                return React.DOM.li({
                        className: index < turnOnBars ? styleId + '_on' : styleId + '_off',
                        onClick: this.setNonPersistentVolume,
                        'data-index': index + 1
                    },
                    React.DOM.div({className: styleId + '_colorBlock'}),
                    React.DOM.div({className: styleId + '_colorBlank'})
                );
            }, this);
        },

        callToggleMute: function () {
            toggleMute(this, this.state.$isMuted);
            if (this.state.$isMuted === 'unmuted') {
                this.setState({$isMuted: 'muted'});
            } else {
                this.setState({$isMuted: 'unmuted'});
            }
        },

        getTargetIndex: function (target) {
            return target.getAttribute('data-index');
        },

        setNonPersistentVolume: function (ev) {
            var targetIndex = this.getTargetIndex(ev.currentTarget);

            this.setState({volumeBars: targetIndex});
            this.setVolume(scaleToVolume(targetIndex));
        },

        updateComponentHeight: function(device){
            return this.getSkinExports(device + 'Height')[device + 'Height'];
        },

        getSkinProperties: function () {
            this.autoPlay = this.props.compProp.autoplay;
            this.updateAudioObject();
            return {
                '': {
                    style: {height: this.updateComponentHeight(this.getDeviceState())}
                },
                'sep': {
                    children: ' - '
                },
                'sep2': {
                    children: ' / '
                },
                'artistLabel': {
                    children: this.props.compData.artist
                },
                'trackLabel': {
                    children: this.props.compData.track
                },
                'playBtn': {
                    onClick: this.initiatePlay
                },
                'pauseBtn': {
                    onClick: this.initiatePause
                },
                'repeatBtn': {
                    onClick: this.initiatePlay
                },
                'bar': {
                    onClick: this.callSeek
                },
                'slider': {
                    onClick: this.callSeek,
                    style: {'width': this.state.progressPosition + '%'}
                },
                'handle': {
                    onDrag: this.movingProgressbarHandle,
                    onDragEnd: this.stoppedMovingProgressbarHandle,
//                    onTouchMove: this.movingProgressbarHandle,
                    style: {cursor: 'pointer', 'left': this.state.progressPosition + '%'},
                    draggable: true
                },
                'volumeBtn': {
                    onClick: this.callToggleMute
                },
                'volumeScale': {
                    children: this.buildVolumeScale()
                },
                'trackDuration': {
                    children: this.state.trackDuration
                },
                'trackPosition': {
                    children: this.state.trackPositionLabel
                }
            };
        }
    };
});
