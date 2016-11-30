define(['lodash', 'core', 'utils', 'backgroundCommon'], function (
    _, /** core */ core, utils, backgroundCommon) {
    'use strict';

    var DEFAULT_BG_WIDTH = '100%';
    var DEFAULT_BG_HEIGHT = '100%';
    var DEFAULT_BG_TOP = 0;
    var PARALLAX_BG_HEIGHT = '120%';
    var PARALLAX_BG_TOP = 0;//'-25%';

    var balataConsts = utils.balataConsts;

    function getAllowedScrollType(bgData, siteData) {
        var scrollType = bgData.scrollType;
        var mediaType = _.get(bgData, ['mediaRef', 'type']);
        var hasMedia = (mediaType === 'Image' || mediaType === 'WixVideo');
        if (!siteData.browserFlags().fixedSiteBackground || siteData.isMobileView() || !hasMedia) {
            scrollType = 'scroll';
        }
        return scrollType;
    }

    /**
     * Set background attachment by device support
     * @param {SiteData} siteData
     * @param {string} scrollType
     * @returns {string}
     */
    function resolveAttachment(siteData, scrollType) {
        var attachment = scrollType;
        if (siteData.isMobileView() || siteData.mobile.isAndroidOldBrowser()) {
            attachment = 'scroll';
        } else if (!siteData.browserFlags().fixedSiteBackground) {
            attachment = '';
        }

        return attachment;
    }

    function resolvePosition(siteData, scrollType) {
        var position = 'absolute';
        if (!siteData.isMobileDevice() && scrollType === 'fixed' || scrollType === 'parallax') {
            position = 'fixed';
        }
        return position;
    }

    /**
     * Get standard css style object from background data item
     * @param {SiteData} siteData
     * @param {object} data
     * @param {boolean} hide
     * @returns {{backgroundImage: string?, backgroundAttachment: string?, backgroundSize: string?, backgroundPosition: string?, backgroundRepeat: string?, backgroundColor: string, top: number, height: string, width: string, position: string?, display: string}}
     */
    function getRootStyle(siteData, data, hide) {
        var resolvedAttachment = resolveAttachment(siteData, getAllowedScrollType(data, siteData));
        var resolvedPosition = resolvePosition(siteData, resolvedAttachment);
        var bgStyle = {
            top: 0,
            height: DEFAULT_BG_HEIGHT,
            width: DEFAULT_BG_WIDTH,
            backgroundColor: utils.colorParser.getColor(siteData.getColorsMap(), data.color),
            display: hide ? 'none' : '',
            position: resolvedPosition
        };

        return bgStyle;
    }

    //function getImageBgAttachment(resetAttachment, resolvedAttachment) {
    //    var attachment = resolvedAttachment;
    //
    //    if (resetAttachment) {
    //        attachment = '';
    //    } else if (resolvedAttachment === 'parallax') {
    //        attachment = 'scroll';
    //    }
    //    return attachment;
    //
    //}

    function getBgHeightByScrollType(scrollType) {
        var height = DEFAULT_BG_HEIGHT;

        if (scrollType === 'parallax') {
            height = PARALLAX_BG_HEIGHT;
        }

        return height;
    }

    function getBgTopByScrollType(scrollType) {
        var top = DEFAULT_BG_TOP;

        if (scrollType === 'parallax') {
            top = PARALLAX_BG_TOP;
        }

        return top;
    }

    /**
     * Get standard css style object from background data item
     * @param {SiteData} siteData
     * @param {object} data
     * @param {boolean} resetAttachment
     * @param {string} pageId
     * @returns {{position: string, top: number, height: number|string, width: number|string, backgroundAttachment: string, opacity: number|string}}
     */
    function getImageStyle(siteData, data, resetAttachment, pageId) {
        //var resolvedAttachment = resolveAttachment(siteData, data.scrollType);
        //var backgroundAttachment = getImageBgAttachment(resetAttachment, resolvedAttachment);
        var imageData = (_.isPlainObject(data.mediaRef)) ? data.mediaRef : siteData.getDataByQuery(data.mediaRef, pageId);
        var bgStyle = {
            position: 'absolute',
            top: getBgTopByScrollType(getAllowedScrollType(data, siteData)),
            height: getBgHeightByScrollType(getAllowedScrollType(data, siteData)),
            width: DEFAULT_BG_WIDTH,
            //backgroundAttachment: backgroundAttachment,
            opacity: imageData && imageData.opacity
        };

        return bgStyle;
    }

    function getParallaxBehavior() {
        return [
            {
                action: 'bgScrub',
                name: 'SiteBackgroundParallax',
                duration: 1,
                delay: 0
            }
        ];
    }

    /**
     * Deep compare two background data items
     * @param {SiteData} siteData
     * @param {object} sourceData
     * @param {object} targetData
     * @returns {boolean}
     */
    function isEqualBackgrounds(siteData, sourceData, sourcePageId, targetData, targetPageId) {
        // Get Media Data
        var sourceMediaData = sourceData.mediaRef || {};
        var targetMediaData = targetData.mediaRef || {};
        // Check if only color
        var isOnlyColor = !sourceData.mediaRef && !targetData.mediaRef;
        // Check if media type is equal
        var isMediaTypeEqual = isOnlyColor || (sourceMediaData.type === targetMediaData.type);
        // Ignore color if media type is video and media types are equal
        var isIgnoreColor = (sourceMediaData.type === 'WixVideo' && isMediaTypeEqual);

        var refKeys = ['mediaRef', 'imageOverlay'];
        var includes = ['type', 'alignType', 'fittingType', 'scrollType', 'colorOverlay', 'colorOverlayOpacity', 'color', 'videoId', 'uri', 'opacity'];
        if (isIgnoreColor) {
            includes = _.without(includes, 'color');
        } else if (isOnlyColor) {
            includes = ['color'];
        }

        return isMediaTypeEqual && compareDataDeep(siteData, sourceData, sourcePageId, targetData, targetPageId, refKeys, includes);
    }

    /**
     * Deep Compare 2 Data objects by refs and include list
     * @param {SiteData} siteData
     * @param {object} sourceData
     * @param {object} targetData
     * @param {Array} refKeys
     * @param {Array} includes
     * @returns {boolean}
     */
    function compareDataDeep(siteData, sourceData, sourcePageId, targetData, targetPageId, refKeys, includes) {

        var equal = _.every(includes, function (key) {
            return (sourceData && sourceData[key]) === (targetData && targetData[key]);
        });

        equal = equal && _.every(refKeys, function (ref) {
                return sourceData ? compareDataDeep(siteData, sourceData[ref], sourcePageId, targetData[ref], targetPageId, refKeys, includes) : true;
            });

        return equal;
    }

    /**
     * gets background data and invoke create component callback if data is of type WixVideo
     * @param {string} pageId
     * @param {string} skinPart
     * @param {function} createComponentCallback
     * @returns {ReactCompositeComponent|null}
     */
    function createVideoComponent(pageId, skinPart, createComponentCallback) {
        var bgData = this.getBgData(pageId);
        var mediaData = bgData.mediaRef;
        if (mediaData && mediaData.type === 'WixVideo') {
            var videoData = _.cloneDeep(bgData);
            videoData.id = skinPart;
            return createComponentCallback(
                videoData,
                'wysiwyg.viewer.components.videoBackground',
                skinPart,
                {
                    compData: mediaData,
                    structureComponentId: 'siteBackground'
                }
            );
        }
        return null;
    }
    /**
     * gets background data and return overlay style
     * @param {SiteData} siteData
     * @param {object} bgData
     * @returns {{position: string, top: number, width: string, height: string, backgroundImage: url string, backgroundColor: rgb/rgba string}}
     */
    function getOverlayStyle(siteData, bgData, resetAttachment) {
        var color = (bgData.colorOverlay) ? utils.colorParser.getColor(siteData.getColorsMap(), bgData.colorOverlay, bgData.colorOverlayOpacity) : null;
        var imageUrl = getImageOverlayUrl(siteData, bgData.imageOverlay);
        var resolvedAttachment = resolveAttachment(siteData, getAllowedScrollType(bgData, siteData));
        return {
            position: 'absolute',
            top: 0,
            width: DEFAULT_BG_WIDTH,
            height: DEFAULT_BG_HEIGHT,
            backgroundImage: imageUrl,
            backgroundColor: color,
            backgroundAttachment: (resetAttachment) ? '' : resolvedAttachment

        };
    }

    /**
     * Get the full url path of the image overlay and return a css background-image string
     * @param {SiteData} siteData
     * @param imageOverlayData
     * @returns {string} 'url(...)'
     */
    function getImageOverlayUrl(siteData, imageOverlayData) {
        if (!imageOverlayData) {
            return null;
        }
        return 'url(' + utils.urlUtils.joinURL(siteData.getStaticMediaUrl(), imageOverlayData.uri) + ')';
    }

    /**
     * @class components.siteBackground
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: "SiteBackground",
        mixins: [core.compMixins.skinBasedComp, core.compMixins.animationsMixin, backgroundCommon.mixins.backgroundDetectionMixin],
        isCurrentBgVideo: false,
        currentId: null,
        previousScroll: null,
        getInitialState: function () {
            this.actionsAspect = this.props.siteAPI.getSiteAspect('actionsAspect');
            this.currentId = this.props.currentUrlPageId;
            this.size = {};
            return {
                visibleBgPageId: this.props.currentUrlPageId,
                previousVisibleBgPageId: "",
                resetAttachment: false,
                hidePrevious: false
            };
        },
        /**
         * Get BackgroundMedia data item.
         * this will happen also in siteBackgroundLayout
         * Get bg data from page, migrate to new structure if needed.
         * @param {SiteData} siteData
         * @param {string} pageId
         * @returns {object}
         */
        getBgData: function(pageId) {
            pageId = pageId || this.state.visibleBgPageId;
            var pageData = this.props.siteData.getDataByQuery(pageId, pageId);
            if (_.isEmpty(pageData)) {
                return {};
            }
            var device = this.props.siteData.isMobileView() ? 'mobile' : 'desktop';
            return pageData.pageBackgrounds[device].ref || {};
        },

        callforBackgroundChange: function (previousId) {

            var callbacks = {
                onComplete: function () {
                    if (previousId !== this.state.visibleBgPageId) {
                        //Set bg attachment back to original and hide previous bg
                        if (this.refs.previousVideo && this.refs.previousVideo.kill) {
                            this.refs.previousVideo.kill();
                        }
                        this.setState({
                            hidePrevious: true,
                            previousVisibleBgPageId: '',
                            resetAttachment: false
                        });
                    }
                }.bind(this)
            };
            this.actionsAspect.registerNextBGPageTransition(this, "previous", "current", callbacks);

            this.setState({
                visibleBgPageId: this.currentId,
                previousVisibleBgPageId: previousId,
                resetAttachment: true,
                hidePrevious: false
            });
        },

        componentWillReceiveProps: function (nextProps) {
            var previousId = this.state.visibleBgPageId;
            this.currentId = nextProps.currentUrlPageId;

            // If changing page
            if (this.currentId !== previousId) {
                // if bg data is different between pages set current id as visual id, render both and do page transition
                var previousPageBgStyle = this.getBgData(previousId);
                var nextPageBgStyle = this.getBgData(this.currentId);

                if (!isEqualBackgrounds(this.props.siteData, nextPageBgStyle, this.currentId, previousPageBgStyle, previousId)) {
                    this.callforBackgroundChange(previousId);
                } else {
                    if (this.refs.previousVideo && this.refs.previousVideo.kill) {
                        this.refs.previousVideo.kill();
                    }
                    this.setState({
                        previousVisibleBgPageId: ''
                    });
                }
            }
        },

        isVideo: function () {
            return this.isCurrentBgVideo;
        },

        handleParallaxBehavior: function (currentPageBgStyle) {
            var currentScroll = getAllowedScrollType(currentPageBgStyle, this.props.siteData);
            var isScrollTypeParallaxChanged = (this.previousScroll === 'parallax' || currentScroll === 'parallax');

            if (isScrollTypeParallaxChanged) {
                this.previousScroll = currentScroll;

                if (currentScroll === 'parallax') {
                    this.actionsAspect.registerBehaviors('currentImage', 'siteBackground', getParallaxBehavior());
                } else {
                    this.actionsAspect.unRegisterBehaviors('currentImage', getParallaxBehavior());
                }
            }
        },

        getClasses: function() {
            var classes = '';

            return classes;
        },

        getSkinProperties: function () {
            var visibleBgPageId = this.state.visibleBgPageId;
            var previousVisibleBgPageId = this.state.previousVisibleBgPageId;
            var resetAttachment = this.state.resetAttachment;
            var previousPageBgStyle = null;
            var shouldPlayVideo = !this.props.siteData.isTouchDevice();
            var previousVideo, currentVideo;

            if (previousVisibleBgPageId) {
                previousPageBgStyle = this.getBgData(previousVisibleBgPageId);
                if (shouldPlayVideo) {
                    previousVideo = createVideoComponent.call(this, previousVisibleBgPageId, 'previousVideo', this.createChildComponent);
                }
            }
            var currentPageBgStyle = this.getBgData(visibleBgPageId);

            if (shouldPlayVideo) {
                currentVideo = createVideoComponent.call(this, this.currentId, 'currentVideo', this.createChildComponent);
            }
            this.isCurrentBgVideo = !!currentVideo;

            this.handleParallaxBehavior(currentPageBgStyle);

            var baseId = this.props.id;

            var skinProps = {
                "": {
                    id: baseId,
                    className: this.getClasses()
                },
                "current": {
                    key: visibleBgPageId,
                    id: baseId + '_current_' + visibleBgPageId,
                    style: getRootStyle(this.props.siteData, currentPageBgStyle, false)
                },
                "currentImage": {
                    key: 'background_currentImage_' + getAllowedScrollType(currentPageBgStyle, this.props.siteData),
                    id: baseId + '_currentImage_' + visibleBgPageId,
                    style: getImageStyle(this.props.siteData, currentPageBgStyle, resetAttachment, visibleBgPageId),
                    'data-type': balataConsts.BG_IMAGE
                },
                "currentVideo": currentVideo,
                "currentOverlay": {
                    id: baseId + '_currentOverlay_' + visibleBgPageId,
                    style: getOverlayStyle(this.props.siteData, currentPageBgStyle, resetAttachment, visibleBgPageId)
                },

                "previous": {
                    key: (previousVisibleBgPageId) || 'noPrev',
                    id: baseId + '_previous_' + previousVisibleBgPageId,
                    style: previousPageBgStyle ? getRootStyle(this.props.siteData, previousPageBgStyle, this.state.hidePrevious) : {}
                },
                "previousImage": {
                    id: baseId + '_previousImage_' + previousVisibleBgPageId,
                    style: previousPageBgStyle ? getImageStyle(this.props.siteData, previousPageBgStyle, resetAttachment, previousVisibleBgPageId) : {}
                },
                "previousVideo": previousVideo,
                "previousOverlay": {
                    id: baseId + '_previousOverlay_' + previousVisibleBgPageId,
                    style: previousPageBgStyle ? getOverlayStyle(this.props.siteData, previousPageBgStyle, resetAttachment, previousVisibleBgPageId) : {}
                }
            };

            return skinProps;
        }
    };
});
