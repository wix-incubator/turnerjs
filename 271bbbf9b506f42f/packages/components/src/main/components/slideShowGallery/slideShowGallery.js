define(['core', 'skins', 'lodash', 'utils', 'galleriesCommon'], function (/** core */core, skinsPackage, _, utils, galleriesCommon) {
    'use strict';

    var mixins = core.compMixins;
    var matrixScalingCalculations = galleriesCommon.utils.matrixScalingCalculations;
    var galleriesHelperFunctions = galleriesCommon.utils.galleriesHelperFunctions;
    var galleriesCommonLayout = utils.galleriesCommonLayout;


    function getNextItemIndex(currentItemIndex, numItems) {
        return normalizeIndex(currentItemIndex + 1, numItems);
    }

    function getPrevItemIndex(currentItemIndex, numItems) {
        return normalizeIndex(currentItemIndex - 1, numItems);
    }

    function normalizeIndex(index, numItems) {
        return ((index % numItems) + numItems) % numItems;
    }

    function setCounterText(currentIndex, totalItems) {
        return (String(currentIndex + 1) + "/" + String(totalItems));
    }

    function adjustFlexibleHeight(sizeAfterScaling, imageMode, propsHeight) {
        if (imageMode === "flexibleHeight") {
            return sizeAfterScaling.displayerSize.height;
        }
        return propsHeight;
    }

    function getPublicState(state) {
        return {currentIndex: _.get(state, 'currentIndex', 0)};
    }

    /**
     * @class components.SlideShowGallery
     * @extends {core.intervalsMixin}
     * @extends {core.animationsMixin}
     * @extends {ReactCompositeComponent}
     * @property {comp.properties} props
     */
    return {
        displayName: "SlideShowGallery",
        mixins: [mixins.skinBasedComp, galleriesCommon.mixins.galleryAutoPlayMixin, mixins.animationsMixin, mixins.timeoutsMixin, mixins.skinInfo, mixins.compStateMixin(getPublicState)],
        statics: {
            behaviors: {
                nextSlide: {methodName: 'next'},
                prevSlide: {methodName: 'prev'}
            }
        },
        getInitialState: function () {
            this.shouldResetGalleryToOriginalState = this.props.siteData.renderFlags.shouldResetGalleryToOriginalState;
            var windowTouchEventsAspect = this.props.siteAPI.getSiteAspect('windowTouchEvents');
            windowTouchEventsAspect.registerToWindowTouchEvent('touchStart', this);
            this.isAnimating = false;

            this.getButtonsState = this.getButtonsState || _.noop;

            return _.assign(getPublicState(), {
                $mobile: (this.props.siteData.isMobileDevice() || this.props.siteData.isTabletDevice()) ? "mobile" : "notMobile",
                $displayDevice: this.props.siteData.isMobileView() ? "mobileView" : "desktopView",
                displayerPanelState: "notShowPanel",
                $touchRollOverSupport: "touchRollOut",
                $animationInProcess: null //for automation
            }, this.getButtonsState());
        },
        componentDidMount: function () {
            this.updateAutoplayState();
        },
        componentWillReceiveProps: function (nextProps) {
            var autoPlayPropChanged = false;
            var newState = {
                $mobile: (nextProps.siteData.isMobileDevice() || nextProps.siteData.isTabletDevice()) ? "mobile" : "notMobile",
                $displayDevice: nextProps.siteData.isMobileView() ? "mobileView" : "desktopView"
            };
            if (this.props.compProp.autoplay !== nextProps.compProp.autoplay) {
                var shouldAutoPlay = (nextProps.compProp.autoplay && !this.props.siteAPI.isZoomOpened() && this.props.siteData.renderFlags.isPlayingAllowed) ? 'autoplayOn' : 'autoplayOff';
                autoPlayPropChanged = true;
                newState.shouldAutoPlay = nextProps.compProp.autoplay;
                newState.$slideshow = shouldAutoPlay;
            }
            _.assign(newState, this.getButtonsState());

            this.setState(newState, function () {
                if (autoPlayPropChanged) {
                    this.updateAutoplayState();
                    this.handleAction(newState.$slideshow);
                }
            }.bind(this));

            if (this.shouldResetGalleryToOriginalState !== nextProps.siteData.renderFlags.shouldResetGalleryToOriginalState) {
                if (this.shouldResetGalleryToOriginalState && this.props.compProp.imageMode === 'flexibleHeight' && this.resetGalleryState) {
                    this.resetGalleryState();
                }
                this.shouldResetGalleryToOriginalState = nextProps.siteData.renderFlags.shouldResetGalleryToOriginalState;
            }
        },
        componentWillUnmount: function () {
            this.props.siteAPI.getSiteAspect('windowTouchEvents').unregisterFromWindowTouchEvent('touchStart', this);
        },
        getSkinProperties: function () {
            var compData = this.props.compData;
            var imageData, sizeAfterScaling, heightToSet;
            var hasItems = compData.items && compData.items.length > 0;
            if (hasItems) {
                imageData = compData.items[this.state.currentIndex];
                sizeAfterScaling = this.getDisplayerSizeAfterScaling(imageData);
                heightToSet = adjustFlexibleHeight(sizeAfterScaling, this.props.compProp.imageMode, this.props.style.height);
            }

            var mouseHandler = hasItems ? this.hideShowPanel : _.noop;
            var refData = {
                "itemsContainer": {
                    children: hasItems ? this.generateNextPagesIfNeeded().concat([this.createDisplayer(imageData, this.state.currentIndex)]) : [],
                    style: {height: "100%"},
                    'data-gallery-id': this.props.id
                },
                "buttonPrev": {
                    onClick: this.prev,
                    style: {visibility: !this.props.compProp.isHidden && hasItems && this.props.compProp.showNavigation ? "visible" : "hidden"},
                    'data-gallery-id': this.props.id
                },
                "buttonNext": {
                    onClick: this.next,
                    style: {visibility: !this.props.compProp.isHidden && hasItems && this.props.compProp.showNavigation ? "visible" : "hidden"},
                    'data-gallery-id': this.props.id
                },
                "counter": {
                    children: setCounterText(this.state.currentIndex, this.props.compData.items.length),
                    style: {visibility: !this.props.compProp.isHidden && this.props.compProp.showCounter ? "visible" : "hidden"},
                    'data-gallery-id': this.props.id
                },
                "border": {
                    style: {height: heightToSet},
                    'data-gallery-id': this.props.id
                },
                "autoplay": {
                    onClick: this.toggleAutoPlay,
                    style: {cursor: "pointer", visibility: this.shouldShowAutoPlay() ? "visible" : "hidden"},
                    'data-gallery-id': this.props.id
                },
                "": {
                    style: {height: heightToSet, "overflow": "hidden"},
                    onMouseEnter: mouseHandler,
                    onMouseLeave: mouseHandler,
                    onMouseMove: mouseHandler,
                    onTouchStart: this.onComponentTouchStart,
                    'data-gallery-id': this.props.id,
                    'data-height-diff': galleriesHelperFunctions.getSkinHeightDiff(this.props.skin),
                    'data-width-diff': galleriesHelperFunctions.getSkinWidthDiff(this.props.skin),
                    'data-text-alignment': this.props.compProp.alignText
                }
            };

            if (this.props.compProp.imageMode === "flexibleHeight") {
                galleriesCommonLayout.updateSkinPropsForFlexibleHeightGallery(refData, heightToSet);
            }

            return refData;
        },
        onComponentTouchStart: function (event) {
            this.hideShowPanel(event);
            if (this.state.$touchRollOverSupport === "touchRollOut") {
                this.setState({
                    $touchRollOverSupport: "touchRollOver"
                });
            }
        },
        onWindowTouchStart: function (event) {
            // Check that the click hasn't been done anywhere on the component
            if (this.state.$touchRollOverSupport === "touchRollOver" && event.target.getAttribute("data-gallery-id") !== this.props.id) {
                this.hideShowPanel({type: "mouseleave", target: event.target});
                this.setState({
                    $touchRollOverSupport: "touchRollOut"
                });
            }

        },
        hideShowPanel: function (event, reactObj, changeOnlyChildState) {
            var newState = (event.type === "mouseleave") ? "notShowPanel" : "showPanel";
//            if (event.target.id.indexOf("buttonNext") !== -1 || event.target.id.indexOf("buttonPrev") !== -1) {
//                return;
//            }
            var currImageData = this.props.compData.items[this.state.currentIndex];
            var currentImageRef = this.props.id + currImageData.id + this.state.currentIndex;
            if (this.refs[currentImageRef].getPanelState() !== newState) {
                this.refs[currentImageRef].setPanelState(newState);
            }
            if (!changeOnlyChildState && newState !== this.state.displayerPanelState) {
                this.setState({
                    displayerPanelState: newState
                });
            }
        },
        prev: function (callback) {
            var isReverse = this.props.compProp.reverse;
            this.moveSlide(!isReverse, callback);
        },
        next: function (callback) {
            var isReverse = this.props.compProp.reverse;
            this.moveSlide(isReverse, callback);
        },
        moveSlide: function (isPrev, callback) {
            if (this.isAnimating) {
                return false;
            }
            var nextOrPrevIndex = isPrev ? getPrevItemIndex(this.state.currentIndex, this.props.compData.items.length) : getNextItemIndex(this.state.currentIndex, this.props.compData.items.length);
            if (this.state.currentIndex === nextOrPrevIndex) {
                return false;
            }

            this.hideShowPanel({type: "mouseleave", target: {id: ""}}, {}, true);
            var nextOrPrevIndexDataId = this.props.compData.items[nextOrPrevIndex].id;
            var currImageDataId = this.props.compData.items[this.state.currentIndex].id;
            var nextOrPrevImageRef = this.props.id + nextOrPrevIndexDataId + nextOrPrevIndex;
            var currentImageRef = this.props.id + currImageDataId + this.state.currentIndex;
            this.refs[nextOrPrevImageRef].setTransitionPhase("transIn");
            this.refs[currentImageRef].setTransitionPhase("transOut");

            var transitionMap = {
                "swipeVertical": "SlideVertical",
                "swipeHorizontal": "SlideHorizontal",
                "crossfade": "CrossFade",
                "outIn": "OutIn",
                "none": "NoTransition"
            };
            var transDuration = (this.props.compProp.transition === "none") ? 0 : this.props.compProp.transDuration;
            this.setState({$animationInProcess: "animationInProcess"});

            var sequence = this.sequence();

            if (this.props.compProp.imageMode === "flexibleHeight") {
                var sizeAfterScaling = this.getDisplayerSizeAfterScaling(nextOrPrevIndexDataId);
                sequence.add('', 'BaseDimensions', this.props.compProp.transDuration, 0, {to: {height: sizeAfterScaling.displayerSize.height}});
            }

            sequence
                .add('itemsContainer', 'BaseDimensions', 0, 0, {to: {zIndex: 0}}, 0)
                .add({
                    sourceRefs: currentImageRef,
                    destRefs: nextOrPrevImageRef
                }, transitionMap[this.props.compProp.transition], transDuration, 0, {reverse: isPrev}, 0)
                .add('itemsContainer', 'BaseDimensions', 0, 0, {to: {clearProps: 'zIndex', immediateRender: false}})
                .onStartAll(function () {
                    this.isAnimating = true;
                }.bind(this))
                .onCompleteAll(function () {
                    this.animationCompleteCallback(nextOrPrevIndex, callback);
                }.bind(this))
                .execute();

        },
        animationCompleteCallback: function (nextOrPrevIndex, callback) {
            this.isAnimating = false;
            //if (this.props.compProp.imageMode === "flexibleHeight") {
            this.registerReLayout();
            // }
            this.setState({
                currentIndex: nextOrPrevIndex,
                $animationInProcess: null
            }, function () {
                this.updateAutoplayState();
                this.handleAction('imageChanged');
                if (_.isFunction(callback)) {
                    callback();
                }
            }.bind(this));

        },
        getDisplayerSizeAfterScaling: function (displayerData) {

            return matrixScalingCalculations.getSizeAfterScaling({
                itemHeight: this.props.style.height - galleriesHelperFunctions.getSkinHeightDiff(this.props.skin),
                itemWidth: this.props.style.width - galleriesHelperFunctions.getSkinWidthDiff(this.props.skin),
                displayerData: displayerData,
                imageMode: this.props.compProp.imageMode,
                heightDiff: this.getDisplayerHeightDiff(),
                widthDiff: this.getDisplayerWidthDiff(),
                bottomGap: this.getBottomGap()
            });
        },
        generateNextPagesIfNeeded: function () {
            var nextImageData;
            var prevImageData;
            var diplayersArr = [];
            var nextIndex = getNextItemIndex(this.state.currentIndex, this.props.compData.items.length);
            if (nextIndex !== this.state.currentIndex) {
                nextImageData = this.props.compData.items[nextIndex];
            }
            var prevIndex = getPrevItemIndex(this.state.currentIndex, this.props.compData.items.length);
            if (prevIndex !== this.state.currentIndex && prevIndex !== nextIndex) {
                prevImageData = this.props.compData.items[prevIndex];
            }
            var style = {visibility: "hidden", opacity: 0};
            if (nextImageData) {
                diplayersArr.push(this.createDisplayer(nextImageData, nextIndex, style));
            }
            if (prevImageData) {
                diplayersArr.push(this.createDisplayer(prevImageData, prevIndex, style));
            }
            return diplayersArr;
        },
        createDisplayer: function (displayerData, index, additionalstyle) {
            var sizeAfterScaling = this.getDisplayerSizeAfterScaling(displayerData);
            return this.createChildComponent(displayerData,
                "wysiwyg.viewer.components.Displayer",
                'imageItem',
                {
                    key: this.state.currentIndex + displayerData.id,
                    ref: this.props.id + displayerData.id + index,
                    id: this.props.id + displayerData.id + index,
                    currentUrlPageId: this.props.currentUrlPageId,
                    galleryDataId: this.props.compData.id,
                    galleryId: this.props.id,
                    imageWrapperSize: sizeAfterScaling.imageWrapperSize,
                    showPanelState: additionalstyle ? "notShowPanel" : this.state.displayerPanelState,
                    heightDiff: this.getDisplayerHeightDiff(),
                    widthDiff: this.getDisplayerWidthDiff(),
                    bottomGap: this.getBottomGap(),
                    imageIndex: index,
                    style: _.merge({
                        width: sizeAfterScaling.displayerSize.width,
                        height: sizeAfterScaling.displayerSize.height,
                        position: "absolute",
                        left: 0,
                        top: 0
                    }, additionalstyle)
                }
            );
        },
        getDisplayerHeightDiff: function () {
            var displayerSkin = this.getSkinExports().imageItem.skin;
            var displayerSkinParams = this.getParams(['topPadding', 'imgHeightDiff'], displayerSkin);
            return galleriesHelperFunctions.getDisplayerHeightDiff(skinsPackage.skins[displayerSkin], displayerSkinParams, this.state.$displayDevice);
        },

        getDisplayerWidthDiff: function () {
            var displayerSkin = this.getSkinExports().imageItem.skin;
            return galleriesHelperFunctions.getDisplayerWidthDiff(skinsPackage.skins[displayerSkin], this.state.$displayDevice);
        },
        getBottomGap: function () {
            var skin = skinsPackage.skins[this.props.skin];
            return (skin.exports && skin.exports.bottomGap) || 0;
        }
    };
});
