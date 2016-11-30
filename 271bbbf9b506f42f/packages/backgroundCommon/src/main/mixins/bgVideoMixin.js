define(['lodash', 'react', 'reactDOM', 'santaProps'], function(_, React, ReactDOM, santaProps) {
    'use strict';

    return {
        propTypes: {
            compData: React.PropTypes.object.isRequired,
            refInParent: React.PropTypes.string.isRequired,
            structureComponentId: React.PropTypes.string.isRequired,
            videoBackgroundAspect: santaProps.Types.SiteAspects.videoBackgroundAspect.isRequired
        },

        getInitialState: function () {
            this.videoBackgroundAspect = this.props.videoBackgroundAspect;
            this.showOnNextTick = false;
            this.errorMode = false;
            this.registerToVideoAspect(this.getVideoData());
            return this.resetVideoStates(this.getVideoData());
        },

        registerToVideoAspect: function(videoData){
            this.videoBackgroundAspect.registerVideo(
                this.props.refInParent,
                this.getStructureComponentId(),
                videoData,
                this.qualityReady,
                this,
                videoData.autoplay
            );
        },

        getStructureComponentId: function () {
            return this.props.structureComponentId;// || this.props.siteAPI.getCurrentPageId();
        },

        resetVideoStates: function (videoData) {
            return {
                stopped: true,
                paused: false,
                ready: false,
                active: true,
                loaded: false,
                playEnded: false,
                autoPlay: videoData.autoplay,
                videoQuality: this.videoBackgroundAspect.getQuality(this.props.refInParent)
            };
        },

        componentDidMount: function () {
            var currentVideoData = this.getVideoData();
            this.registerToVideoAspect(currentVideoData);
            this.setPlaybackSpeed(currentVideoData.playbackSpeed || 1);
            this.registerEvents();
        },

        componentWillUnmount: function () {
            var video = this.getInstance();
            video.removeEventListener('timeupdate', this.onTimeUpdate);
            video.removeEventListener('ended', this.onPlayEnded);
            video.removeEventListener('error', this.onError);
            video.removeEventListener('stalled', this.onStalled);
            this.videoBackgroundAspect.unregisterVideo(this.props.refInParent);
            this.removeVideoSecurely();
        },

        componentWillReceiveProps: function (nextProps) {
            var nextVideoData = nextProps.compData;
            var currentVideoData = this.getVideoData();
            //set playback speed , todo:// value should be moved to comp state
            this.setPlaybackSpeed(nextVideoData.playbackSpeed || 1);

            //todo: consider renew key on parent comp.
            var hasSourceChanged = this.resetOnSourceChanged(nextVideoData, currentVideoData);
            if (hasSourceChanged) {
                return;
            }
            this.resetPlayEnded(nextVideoData, currentVideoData);
            this.resetInitialPlay(nextVideoData);
        },

        /**
         *  check if new props initial playing state has changed
          * @param nextVideoData
         * @param currentVideoData
         */
        resetInitialPlay: function (nextVideoData){
            if (nextVideoData.autoplay !== this.state.autoPlay) {
                this.registerToVideoAspect(nextVideoData);
                this.setState({autoPlay: nextVideoData.autoplay});
            }
        },

        /**
         * reset playEnded state id loop property has changed
         * @param nextVideoData
         * @param currentVideoData
         */
        resetPlayEnded: function (nextVideoData, currentVideoData){
            if (nextVideoData.loop && !currentVideoData.loop) {
                this.setState({playEnded: false});
            }
        },

        /**
         * checks if video source has changed , if so reset state values and register the new video item
         * @param nextVideoData
         * @param currentVideoData
         * @returns {boolean} changed
         */
        resetOnSourceChanged: function(nextVideoData, currentVideoData) {
            if (nextVideoData.videoId !== currentVideoData.videoId) {
                this.stop();
                this.registerToVideoAspect(nextVideoData);
                //video pause and load is necessary when updating src
                this.setState(this.resetVideoStates(nextVideoData));
                return true;
            }
            return false;
        },

        registerEvents: function () {
            this.getInstance().addEventListener('timeupdate', this.onTimeUpdate, true);
            this.getInstance().addEventListener('ended', this.onPlayEnded, true);
            this.getInstance().addEventListener('error', this.onError, true);
            this.getInstance().addEventListener('stalled', this.onStalled, true);
        },

        /**
         * checks if on current state we should force the player to re-load
         * @param prevProps
         * @param prevState
         * @returns {boolean}
         */
        isLoadNeeded: function (prevProps, prevState) {

            var prevVideoData = prevProps.compData;
            var currentVideoData = this.getVideoData();
            return this.errorMode || prevVideoData.videoId !== currentVideoData.videoId || !prevState.videoQuality ||
                this.state.videoQuality.quality !== prevState.videoQuality.quality ||
                !this.state.active && prevState.active;
        },

        componentDidUpdate: function (prevProps, prevState) {
            var currentVideoData = this.getVideoData();
            if (this.isLoadNeeded(prevProps, prevState)) {
                //load
                this.errorMode = false;
                this.load();
            }

            // play head actions
            if (this.getInstance().paused && (!prevState.active && this.state.active ) || (!this.state.stopped && !this.state.paused)) {
                //play
                this.getInstance().play();
                //IE must set playbackspeed after play
                this.setPlaybackSpeed(currentVideoData.playbackSpeed || 1);
                this.videoBackgroundAspect.notifyPlayingChanged(this.props.refInParent);
            } else if (!prevState.stopped && this.state.stopped) {
                //pause
                this.getInstance().pause();
                this.videoBackgroundAspect.notifyPlayingChanged(this.props.refInParent);
                //FF and IE throw error when trying to set current time while video still in loading state.
                if (this.state.active && this.state.loaded && this.getInstance().currentTime > 0) {
                    this.getInstance().currentTime = 0;
                }
            } else if (!prevState.paused && this.state.paused) {
                //pause
                this.getInstance().pause();
                this.videoBackgroundAspect.notifyPlayingChanged(this.props.refInParent);
            }
            // should we display the video or the poster
            if (!prevState.ready && this.state.ready) {
                this.showOnNextTick = true;

            } else if (prevState.ready && !this.state.ready) {
                this.getInstance().style.visibility = 'hidden';
                this.showOnNextTick = false;
            }

        },

        notifyPlayingChange: function () {
            this.videoBackgroundAspect.notifyPlayingChanged(this.props.refInParent);
        },

        getInstance: function () {
            return ReactDOM.findDOMNode(this.refs.video);
        },

        setPlaybackSpeed: function (speed) {
            this.getInstance().playbackRate = speed;
        },

        load: function () {
            var videoEl = this.getInstance();
            videoEl.load();

        },

        removeVideoSecurely: function () {
            var video = this.getInstance();
            video.pause();
            _.forEach(video.children, function (child) {
                if (child.nodeName.toLowerCase() === 'source') {
                    child.setAttribute('src', '');
                }
            });
            video.load();
        },

        kill: function () {
            //force render to clear video src, next render siteBackground render should not create this component
            if (this.state.active) {
                this.removeVideoSecurely();
                this.setState({active: false, ready: false, stopped: true, loaded: false});
            }
        },

        play: function (selectedQuality) {

            var newState = {};
            if (!this.state.active) {
                newState = {active: true, ready: false, stopped: false, pause: false};
            } else if (this.state.stopped) {
                newState = {stopped: false, ready: false};
            } else if (this.state.paused) {
                newState = {paused: false};
            }

            if (!this.state.videoQuality || (selectedQuality && selectedQuality.quality !== this.state.videoQuality.quality)) {
                newState.videoQuality = selectedQuality;
            }
            if (!_.isEmpty(newState)) {
                this.setState(newState);
            }

        },

        /**
         * set relevant states in order to stop the video
         * @param playEnded {boolean} indicate if stop origin is 'playback ended' (end of video)
         */
        stop: function (playEnded) {
            if (!this.state.stopped) {
                this.setState(_.assign({
                    ready: false,
                    stopped: true,
                    paused: false
                }, playEnded ? {playEnded: playEnded} : {}));
            }
        },

        pause: function (playEnded) {
            if (!this.state.stopped && !this.state.paused) {
                this.setState(_.assign({paused: true}, playEnded ? {playEnded: playEnded} : {}));
            }
        },

        onPlayEnded: function () {
            this.pause(true);
        },

        onError: function (evt) {
            if (evt.currentTarget.networkState === evt.currentTarget.NETWORK_NO_SOURCE) {
                this.errorMode = true;
            }
        },

        /**
         *stalled video event
         * Safari throw stalled event on 404 http error and not the regular video error event
         * @param evt
         */
        onStalled: function (evt) {
            if (evt.currentTarget.readyState === evt.currentTarget.HAVE_NOTHING) {
                this.errorMode = true;
            }
        },

        onTimeUpdate: function () {
            if (!this.state.ready && this.state.active && !this.state.stopped) {
                this.setState({ready: true, loaded: true});
                this.getInstance().currentTime = 0;
            }
            if (this.showOnNextTick && this.getInstance().currentTime) {
                this.showOnNextTick = false;
                if (this.getInstance().currentTime > 0) {
                    this.getInstance().style.visibility = 'visible';
                }

            }
        },

        isPlaying: function () {
            return this.state.active && !this.state.stopped && !this.state.paused;
        },

        getVideoData: function () {
            return this.props.compData;
        },

        qualityReady: function (readyQuality, videoId) {
            if (videoId === this.getVideoData().videoId && (this.errorMode || !this.isPlaying())) {
                this.registerReLayout();
                this.setState({videoQuality: readyQuality, ready: false, loaded: false});
            }

        }

    };
});
