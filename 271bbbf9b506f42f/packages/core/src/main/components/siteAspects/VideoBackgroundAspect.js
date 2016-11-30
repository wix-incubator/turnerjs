define([
        'lodash',
        'utils',
        'core/core/siteAspectsRegistry',
        'animations'
    ],
    function (_,
              utils,
              siteAspectsRegistry,
              animations) {
        'use strict';

        var MAX_QUALITY = '1080p';
        var VIDEO_QUALITY_CHECK_INTERVAL = 5000;

        var READY_STATES = {
            IN_PROCESS: 'in_process',
            PLAYING_PREVIEW: 'playing_preview',
            IDLE: 'idle',
            NO_VIDEO: 'no_video'
        };

        /**
         * gets the preferred video quality from video data taking into account MAX_QUALITY value
         * @param qualities
         * @returns {object}
         */
        function getPreferredVideoQuality(qualities) {
            var targetQuality = _.find(qualities, {quality: MAX_QUALITY});
            if (!targetQuality) {
                var lastQuality = _.last(qualities);
                if (parseInt(lastQuality.quality, 10) < parseInt(MAX_QUALITY, 10)) {
                    targetQuality = lastQuality;
                }
            }
            return targetQuality || {};
        }

        /**
         * Get the video url
         * @param {WixVideo} videoData
         * @param {object} quality
         * @param {SiteAPI} siteAPI
         * @returns {string}
         */
        function getUrl(videoId, quality, siteAPI) {
            var format = quality.formats[0];
            return utils.urlUtils.joinURL(siteAPI.getSiteData().getStaticVideoHeadRequestUrl(), videoId, quality.quality, format, 'file.' + format);
        }


        /**
         * start quality test again in VIDEO_QUALITY_CHECK_INTERVAL milliseconds
         * @param {object} qualityItem
         * @param {VideoInfo} videoInfo
         */
        function resetQualityTest(qualityItem, videoId) {
            qualityItem.testingQuality = getPreferredVideoQuality(qualityItem.qualities);
            if (qualityItem) {
                var nextInterval = getQualityTestNextInterval(qualityItem);
                if (typeof window !== 'undefined' && nextInterval > 0) {
                    clearTimeout(qualityItem.timerInterval);
                    var loadDummyFunc = this.loadDummyVideo.bind(this, videoId, qualityItem.testingQuality);
                    qualityItem.timerInterval = setTimeout(loadDummyFunc, nextInterval);
                } else {

                    qualityItem.qualities = _.filter(qualityItem.qualities, {quality: qualityItem.readyQuality.quality});
                }
            }

        }

        /**
         * gets the next timeout interval , trying to optimize by video duration
         * @param qualityItem
         * @returns {number}
         */
        function getQualityTestNextInterval(qualityItem) {
            var elapsed = _.now() - qualityItem.timeStamp;
            if (elapsed > (qualityItem.duration * 4)) {
                return 0;
            }
            var divider = elapsed > qualityItem.duration && elapsed <= qualityItem.duration * 2 ? 4 : 8;
            return Math.max(VIDEO_QUALITY_CHECK_INTERVAL, (qualityItem.duration / divider));
        }

        /**
         * @constructor
         * @param {core.SiteAspectsSiteAPI} aspectsSiteAPI
         *
         */
        function VideoBackgroundAspect(aspectsSiteAPI) {
            this.siteAPI = aspectsSiteAPI;
            this.isEnabled = true;
            this.playingChangeList = [];
            this.notifyQualityReadyList = [];
            this.shouldPlayOnNextTick = false;
            this.currentScroll = {x: 0, y: 0};
            this.currentPopupScroll = {x: 0, y: 0};
            /**
             * @type {Array<VideoRawInfo>}
             */
            this.registerdVideoComponents = [];
            /**
             * @type {[{videoId:string, testedQuality: object, readyQuality: object, qualities: array}]}
             */
            this.videoAvailabilityCollection = [];
            aspectsSiteAPI.registerToDidLayout(this.playOnDidLayout.bind(this));
            aspectsSiteAPI.registerToScroll(this.playOnNextTick.bind(this));
            aspectsSiteAPI.registerToVisibilityChange(this.togglePlayStateByVisibility.bind(this));

            if (typeof window !== 'undefined') {
                this._tickerCallback = this.playOnTick.bind(this);
                animations.addTickerEvent(this._tickerCallback);
            }
        }

        VideoBackgroundAspect.prototype = _.create(Object.prototype, {
            constructor: VideoBackgroundAspect,

            playOnNextTick: function () {
                this.shouldPlayOnNextTick = this.isEnabled;
                this.currentScroll = this.siteAPI.getSiteScroll();
                this.currentPopupScroll = this.siteAPI.getCurrentPopupScroll();
            },


            playOnDidLayout: function () {
                if (!this.isEnabled) {
                    return;
                }
                var siteData = this.siteAPI.getSiteData();
                var focusedPageId = siteData.getFocusedRootId();
                var primaryPageInfo = siteData.getExistingRootNavigationInfo(siteData.getPrimaryPageId());
                var isPageAllowed = _.isEmpty(primaryPageInfo) ? false : this.siteAPI.getSiteAspect('siteMembers').isPageAllowed(primaryPageInfo);
                if (isPageAllowed && focusedPageId) {
                    this.togglePlayStateByVisibility();
                }
            },

            /**
             * Play the page videos on page change
             */
            playOnTick: function () {
                if (!this.shouldPlayOnNextTick) {
                    return;
                }
                this.shouldPlayOnNextTick = false;
                this.playAll();

            },

            togglePlayStateByVisibility: function () {
                var visibilityState = this.siteAPI.getVisibilityState();
                if (visibilityState.hidden) {
                    this.shouldPlayOnNextTick = false;
                    this.pauseAll();
                } else {
                    this.playOnNextTick();
                }
            },

            /**
             * Play the videos of current  page
             * @param {boolean} [documentModeChanged] indicate if the play all is from editor to preview mode.
             */
            playAll: function (documentModeChanged) {
                    /**
                     * @type {Array<VideoInfo>}
                     */
                    var videoInfos = this.getCurrentPageVideos();
                    _.forEach(videoInfos, function (videoInfo) {
                        if (this.shouldPlay(documentModeChanged, videoInfo)) {
                            this.play(videoInfo.compId, !documentModeChanged);
                        } else {
                            this.pause(videoInfo.compId);
                        }
                    }, this);
            },

            shouldPlay: function (documentModeChanged, videoInfo) {
                //do not play on layout event when the video has ended and loop is false
                //do not play on layout event when the video initiated with falsy auto play
                return videoInfo.registerToPlay && !videoInfo.compInstance.state.playEnded;
            },

            /**
             * Play a video
             * @param {VideoInfo} videoInfo
             */
            play: function (compId, playOnLayout) {
                var videoInfo = _.find(this.registerdVideoComponents, {compId: compId});
                if (_.isEmpty(videoInfo)) {
                    return;
                }

                var quality = this.getQuality(compId);
                if (this.isComponentInViewport(videoInfo.structureComponentId)) {
                    videoInfo.compInstance.play(quality, playOnLayout);
                } else {
                    videoInfo.compInstance.pause();
                }
            },

            /**
             * stop the videos of current page
             */
            stopAll: function () {
                /**
                 * @type {Array<VideoInfo>}
                 */
                var videoInfos = this.getCurrentPageVideos();
                _.forEach(videoInfos, function (videoInfo) {
                    this.stop(videoInfo.compId);
                }, this);
            },
            /**
             * stop a video
             * @param {VideoInfo} videoInfo
             */
            stop: function (compId) {
                var videoInfo = _.find(this.registerdVideoComponents, {compId: compId});
                if (videoInfo) {
                    videoInfo.compInstance.stop();
                }
            },

            /**
             * pause the videos of current page
             */
            pauseAll: function () {
                /**
                 * @type {Array<VideoInfo>}
                 */
                var videoInfos = this.getCurrentPageVideos();
                _.forEach(videoInfos, function (videoInfo) {
                    this.pause(videoInfo.compId);
                }, this);
            },
            /**
             * pause a video
             * @param {VideoInfo} videoInfo
             */
            pause: function (compId) {
                var videoInfo = _.find(this.registerdVideoComponents, {compId: compId});
                if (videoInfo) {
                    videoInfo.compInstance.pause();
                }
            },

            /**
             * Enable automatic background video playback
             * @param {boolean} [silent]
             */
            enableVideoPlayback: function (silent) {
                this.isEnabled = true;
                if (!silent) {
                    this.playAll(true);
                }
            },

            /**
             * Disable automatic background video playback
             * @param {boolean} [silent]
             */
            disableVideoPlayback: function (silent) {
                this.isEnabled = false;
                this.shouldPlayOnNextTick = false;
                if (!silent) {
                    this.stopAll();
                }
            },

            /**
             * Get a video quality to play
             * @param {VideoInfo} videoInfo
             * @returns {object}
             */
            getQuality: function (compId) {

                var videoInfo = _.find(this.registerdVideoComponents, {compId: compId});
                var qualityItem = _.find(this.videoAvailabilityCollection, {videoId: videoInfo.videoId});
                return qualityItem.readyQuality || qualityItem.testingQuality;
            },

            loadDummyVideo: function (videoId, quality) {
                utils.ajaxLibrary.ajax({
                    url: getUrl(videoId, quality, this.siteAPI),
                    type: 'HEAD',
                    success: this._canPlay.bind(this, videoId),
                    error: this._onError.bind(this, videoId)
                });
            },

            /**
             * Get component video ready state, will return NO_VIDEO if the component currently has no video
             * @param {string} compId
             * @returns {string}
             */
            getReadyState: function (compId) {
                var videoInfo = _.find(this.registerdVideoComponents, {compId: compId});

                if (_.isEmpty(videoInfo)) {
                    return READY_STATES.NO_VIDEO;
                }
                return this.getVideoReadyState(videoInfo.videoId);
            },
            /**
             * Get video ready by video id, assuming there is a video
             * @param {string} videoId
             * @returns {string}
             */
            getVideoReadyState: function (videoId) {
                var qualityItem = _.find(this.videoAvailabilityCollection, {videoId: videoId});
                if (!qualityItem || !qualityItem.readyQuality) {
                    return READY_STATES.IN_PROCESS;
                } else if (getPreferredVideoQuality(qualityItem.qualities).quality === qualityItem.readyQuality.quality) {
                    return READY_STATES.IDLE;
                }
                return READY_STATES.PLAYING_PREVIEW;
            },

            /**
             * Get a collection of the videos of the current page, masterpage and background
             * @returns {Array<VideoInfo>}
             */
            getCurrentPageVideos: function () {
                return this.registerdVideoComponents;

            },

            /**
             * Ask a video if it is now playing
             * @param {string} compId
             * @returns {boolean}
             */
            isPlaying: function (compId) {
                var videoInfo = _.find(this.registerdVideoComponents, {compId: compId});
                return videoInfo && videoInfo.compInstance && videoInfo.compInstance.isPlaying();
            },

            /**
             *Tests if a component is in viewport
             * @param {string} compId
             * @param {string} structureComponentId
             * @returns {boolean}
             */
            isComponentInViewport: function (structureComponentId) {
                var currScroll = this.currentScroll;

                var popupId = this.siteAPI.getCurrentPopupId();
                if (popupId && popupId === this.siteAPI.getRootOfComponentId(structureComponentId)) {
                    currScroll = this.currentPopupScroll;
                }

                return utils.viewportUtils.isAlwaysInViewport(this.siteAPI, structureComponentId) ||
                    utils.viewportUtils.isInViewport(this.siteAPI, currScroll, structureComponentId);
            },

            /**
             * handles 404 video failure,
             * @param {Event} evt
             */
            _onError: function (videoId) {

                var qualityItem = _.find(this.videoAvailabilityCollection, {videoId: videoId});
                if (qualityItem) {
                    var currentQualityValue = qualityItem.testingQuality.quality;
                    var qualityIndex = _.findIndex(qualityItem.qualities, {quality: currentQualityValue});
                    var nextIndex = qualityIndex - 1;
                    if (nextIndex >= 0 && !this._isNextQualityReady(nextIndex, qualityItem)) {
                        //step down quality
                        qualityItem.testingQuality = qualityItem.qualities[nextIndex];
                        this.loadDummyVideo(videoId, qualityItem.testingQuality);
                    } else {

                        resetQualityTest.call(this, qualityItem, videoId);
                    }
                }
            },

            _isNextQualityReady: function (nextIndex, qualityItem) {
                return qualityItem.readyQuality && qualityItem.readyQuality.quality === qualityItem.qualities[nextIndex].quality;
            },

            /**
             * handles video metadata loaded event.
             * updates the videoAvailabilityCollection with current success
             * and retry to load better quality if available
             * @param {Event} evt
             */
            _canPlay: function (videoId) {

                var qualityItem = _.find(this.videoAvailabilityCollection, {videoId: videoId});
                if (qualityItem) {
                    //mark as ready
                    qualityItem.readyQuality = qualityItem.testingQuality;
                    var videoInfos = _.filter(this.registerdVideoComponents, {videoId: videoId});
                    //setTimeout(this._preventVideoBuffer, 100, evt.currentTarget);
                    //check if IDLE
                    if (this.getVideoReadyState(videoId) !== READY_STATES.IDLE) {
                        //set to optimal quality and retry
                        resetQualityTest.call(this, qualityItem, videoId);
                    }
                    this.notifyQualityReady(qualityItem.readyQuality, videoId);
                    _.forEach(videoInfos, function (videoInfo) {
                        this.notifyPlayingChanged(videoInfo.compId);
                    }, this);
                }
            },

            unregisterToQualityAvailability: function (compId) {
                var videoInfo = _.find(this.registerdVideoComponents, {compId: compId});
                if (videoInfo) {
                    var qualityItem = _.find(this.videoAvailabilityCollection, {videoId: videoInfo.videoId});
                    if (typeof window !== 'undefined' && !_.isEmpty(qualityItem)) {
                        //remove from collection when there is no component that use it currently
                        // and when quality video check isnt done.
                        if (qualityItem.compCount === 1 && this.getVideoReadyState(qualityItem.videoId) !== READY_STATES.IDLE) {
                            clearInterval(qualityItem.timerInterval);
                            this.videoAvailabilityCollection = _.reject(this.videoAvailabilityCollection, 'videoId', videoInfo.videoId);
                        } else {
                            qualityItem.compCount--;
                        }
                    }
                }
            },

            registerToQualityAvailability: function (videoInfo) {
                var videoData = videoInfo.videoData;
                var qualityItem = _.find(this.videoAvailabilityCollection, {videoId: videoInfo.videoId});
                if (_.isEmpty(qualityItem)) {
                    //initiate item
                    qualityItem = {
                        videoId: videoInfo.videoId,
                        readyQuality: null,
                        testingQuality: getPreferredVideoQuality(videoData.qualities),
                        qualities: videoData.qualities,
                        timeStamp: new Date().getTime(),
                        duration: (videoData.duration * 1000),
                        compCount: 1,
                        timerInterval: 0
                    };
                    this.videoAvailabilityCollection.push(qualityItem);
                    this.loadDummyVideo(videoInfo.videoId, qualityItem.testingQuality);
                } else {
                    qualityItem.compCount++;
                }
            },

            /**
             * Register a video to the aspect
             * Automatically registers it to quality ready notification
             * Will remove previous registrations of same compId
             * @param {string} compId of bgVideo
             * @param {string} structureComponentId root comp
             * @param {object} videoData
             * @param {function} qualityReadyCallback
             * @param {*} compInstance bgVideo instance todo:should be rem0ved and accessed by refs
             * @param {boolean} registerToPlay should component start play
             */
            registerVideo: function (compId, structureComponentId, videoData, qualityReadyCallback, compInstance, registerToPlay) {
                var videoInfo = {
                    compId: compId,
                    structureComponentId: structureComponentId,
                    videoId: videoData.videoId,
                    videoData: videoData,
                    compInstance: compInstance,
                    registerToPlay: registerToPlay
                };

                if (_.find(this.registerdVideoComponents, {compId: compId})) {
                    this.unregisterVideo(compId);
                }
                this.registerdVideoComponents.push(videoInfo);
                this.registerToQualityAvailability(videoInfo);
                this.registerToQualityReady(compId, videoInfo.videoId, qualityReadyCallback);
            },

            /**
             * Un register a video from the aspect
             * Automatically unregisters it to quality ready notification
             * @param {string} compId
             */
            unregisterVideo: function (compId) {
                this.unregisterToQualityAvailability(compId);
                this.registerdVideoComponents = _.reject(this.registerdVideoComponents, 'compId', compId);
                this.unregisterToQualityReady(compId);

            },
            

            /**
             * Register to quality ready event
             * @param {string} id
             * @param {function} callback
             */
            registerToQualityReady: function (id, videoId, callback) {
                this.notifyQualityReadyList.push({id: id, videoId: videoId, callback: callback});
            },

            /**
             * Register to play change event
             * @param {string} id
             * @param {function} callback
             */
            registerToPlayingChange: function (id, callback) {
                this.playingChangeList.push({id: id, callback: callback});
            },

            /**
             * Un register from quality ready
             * @param {string} id
             */
            unregisterToQualityReady: function (id) {
                this.notifyQualityReadyList = _.reject(this.notifyQualityReadyList, 'id', id);
            },

            /**
             * Un register from play change
             * @param {string} id
             */
            unregisterToPlayingChange: function (id) {
                this.playingChangeList = _.reject(this.playingChangeList, 'id', id);
            },

            /**
             * Notify registered component about play change
             * @param {string} compId
             */
            notifyPlayingChanged: function (compId) {
                var item = _.find(this.playingChangeList, {id: compId});
                if (item && item.callback) {
                    item.callback(this.isPlaying(compId));
                }
            },

            /**
             * Notify registered component about quality ready
             * @param {object} quality
             * @param {string} videoId
             */
            notifyQualityReady: function (quality, videoId) {
                var items = _.filter(this.notifyQualityReadyList, {videoId: videoId});
                _.forEach(items, function (item) {
                    if (item.callback) {
                        item.callback(quality, item.videoId);
                    }
                });
            },

            willUnmount: function () {
                animations.removeTickerEvent(this._tickerCallback);
                if (typeof window !== 'undefined') {
                    _.forEach(this.videoAvailabilityCollection, function (qualityItem) {
                        clearTimeout(qualityItem.timerInterval);
                    });
                }
            }

        });

        siteAspectsRegistry.registerSiteAspect('VideoBackgroundAspect', VideoBackgroundAspect);

        return VideoBackgroundAspect;

        /** @typedef {object} VideoInfo
         * @property {string} compId
         * @property {string} [pageId]
         * @property {object} videoData
         */
    });
