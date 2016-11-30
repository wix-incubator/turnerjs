define(['lodash', 'utils', 'santaProps'], function (_, utils, santaProps) {
    'use strict';

    var santaTypes = santaProps.Types;

    /**
     * @class core.audioMixin
     */
    return {
        propTypes: {
            audioAspect: santaTypes.SiteAspects.audioAspect.isRequired,
            isPlayingAllowed: santaTypes.RenderFlags.isPlayingAllowed,
            compData: santaTypes.Component.compData.isRequired,
            id: santaTypes.Component.id.isRequired,
            serviceTopology: santaTypes.ServiceTopology.serviceTopology,
            isMobileView: santaTypes.isMobileView
        },

        getInitialState: function () {
            this.audioObj = null;
            this.isAudioPlaying = false;
            this.trackPosition = 0;
            this.isPlayingAllowed = this.props.isPlayingAllowed;
            return null;
        },

        componentWillReceiveProps: function (nextProps) {
            if (this.props.compData.uri !== nextProps.compData.uri) { // audio file changed
                this.clearAudioObject();
            }

            var shouldPlay = this.props.audioAspect.isCompPlaying(this);

            if (shouldPlay) {
                this.setState({$playerState: 'playing'});
            } else if (this.isAudioPlaying) {
                this.setState({$playerState: 'pausing'});
            }
        },

        componentDidUpdate: function () {
            var isPlaying = this.props.audioAspect.isCompPlaying(this);

            if (this.getDeviceState() !== 'mobile' && this.props.isPlayingAllowed) {
                if (this.props.isPlayingAllowed !== this.isPlayingAllowed) {
                    this.isPlayingAllowed = this.props.isPlayingAllowed;
                    if (this.autoPlay) {
                        this.initiatePlay();
                    }
                }
            } else {
                this.isPlayingAllowed = this.props.isPlayingAllowed;
                if (!this.isPlayingAllowed && isPlaying) {
                    this.initiatePause();
                }
            }
        },

        componentDidMount: function () {
            if (this.getDeviceState() !== 'mobile' && this.autoPlay && this.isPlayingAllowed) {
                this.initiatePlay();
            }
        },

        componentWillUnmount: function () {
            this.clearAudioObject();
        },

        getOrCreateAudioObject: function () {
            return this.audioObj || this.createAudioObject();
        },

        createAudioObject: function () {
            var self = this;
            if (!self.props.compData.uri) {
                return false;
            }
            var audioConfig = {
                id: self.props.id, // + '_' + (idSuffix++),
                url: self.props.serviceTopology.staticAudioUrl + '/' + self.props.compData.uri,
                autoPlay: false,
                stream: true,
                multiShot: true,
                multiShotEvents: true,
                autoLoad: !self.props.isMobileView || !self.props.isPlayingAllowed,
                usePolicyFile: false,
                whileloading: function () {
                    if (typeof self.whileLoadingHandler === 'function') {
                        self.whileLoadingHandler(this.duration);
                    }
                },
                onfailure: function () {
                    self.failedToLoadAudioFile();
                },
                onfinish: function () {
                    self.finishedPlayingAudio(this.id);
                },
                onsuspend: function () {
                    self.audioLoadingSuspended(this.id);
                },
                onload: function (status) {
                    if (!status) {
                        self.props.audioAspect.onHTML5ErrorTryToReloadWithFlash();
                    }
                }
            };
            return self.props.audioAspect.createAudioObj(audioConfig);
        },

        clearAudioObject: function () {
            if (this.audioObj) {
                this.audioObj.pause();
                this.audioObj = null;
                this.trackPosition = 0;
                if (this.resetTrackPosition) {
                    this.resetTrackPosition();
                }

            }
        },

        failedToLoadAudioFile: function (id) {
            var message = 'Failed to load audio file ' + id,
                style = 'color: #ff9494; font-size: 24px;';

            utils.log.verbose('%c' + message, style);
            utils.log.error(message);
        },

        audioLoadingSuspended: function (id) {
            var message = 'Browser has chosen to stop downloading audio file ' + id,
                style = 'color: #ff9494; font-size: 24px;';

            utils.log.verbose('%c' + message, style);
        },

        playAudio: function () {
            var self = this,
                playParameters = {
                    volume: self.audioVolume,
                    position: self.trackPosition,
                    whileplaying: function () {
                        self.trackPosition = this.position;
                        if (typeof self.whilePlayingHandler === 'function') {
                            self.whilePlayingHandler(this.position);
                        }
                    }
                };
            this.setVolume(this.audioVolume);
            this.audioObj.play(playParameters);
        },

        updateAudioObject: function () {
            this.audioObj = this.getOrCreateAudioObject();
            if (this.props.audioAspect.isSoundManagerOnResetup()) {
                this.audioObj = null;
            }
            if (!this.audioObj) {
                return;
            }
            if (!this.isAudioPlaying && this.state.$playerState === 'playing') {
                this.isAudioPlaying = true;
                this.playAudio();
            } else if (this.isAudioPlaying && this.state.$playerState === 'pausing') {
                this.isAudioPlaying = false;
                this.audioObj.pause();
            } else if (this.state.$playerState === 'repeat') {
                this.isAudioPlaying = false;
            }
        },

        getDeviceState: function () {
            return this.props.isMobileView ? 'mobile' : 'desktop';
        },

        initiatePlay: function () {
            if (!_.isEmpty(this.props.compData.uri) && this.props.compData.uri !== '') {
                this.props.audioAspect.updatePlayingComp(this);
            }
        },

        initiatePause: function () {
            this.props.audioAspect.updatePausingComp();
            this.setState({$playerState: 'pausing'});
        },

        getAudioDuration: function () {
            return this.audioObj.duration;
        },

        seekAudio: function (seekPosition) {
            this.trackPosition = seekPosition;
            if (this.isAudioPlaying) {
                this.audioObj.setPosition(seekPosition);
            } else {
                this.initiatePlay();
            }
        },

        setVolume: function (volume) {
            this.audioVolume = volume;
            if (this.isAudioPlaying) {
                this.audioObj.setVolume(volume);
            }
        },

        muteAudio: function () {
            this.audioObj.mute();
        },

        unmuteAudio: function () {
            this.audioObj.unmute();
        }
    };
});
