define(['lodash', 'react', 'santaProps', 'core', 'utils', 'siteUtils', 'imageClientApi', 'galleriesCommon', 'image'],
    function (_, React, santaProps, core, utils, siteUtils, imageClientApi, galleriesCommon, image) {
        'use strict';

        var defaultCompPropValues = {
            numCols: 3,
            maxRows: 3,
            margin: 0,
            transition: "seq_crossFade_All",
            transDuration: 1.0,
            autoplayInterval: 3.0,
            autoplay: false,
            showAutoplay: true,
            showNavigation: true,
            showCounter: true
        };

        var mixins = core.compMixins;
        var componentUtils = core.componentUtils;
        var linkRenderer = utils.linkRenderer;
        var matrixCalculations = galleriesCommon.utils.matrixCalculations;
        var galleriesHelperFunctions = galleriesCommon.utils.galleriesHelperFunctions;
        var galleryPagingCalculations = componentUtils.galleryPagingCalculations;
        var matrixAnimationManipulation = componentUtils.matrixAnimationManipulation;


        function getAnimationProperties(compProp, compWidth, compHeight, rowNum, skinName, selectedAnimation) {
            var itemWidth = matrixCalculations.getItemWidth(compProp.margin, compProp.numCols, compWidth, galleriesHelperFunctions.getSkinWidthDiff(skinName)),
                itemHeight = matrixCalculations.getItemHeight(compProp.margin, compHeight, rowNum, galleriesHelperFunctions.getSkinHeightDiff(skinName)),
                containerWidth = compWidth - galleriesHelperFunctions.getSkinWidthDiff(skinName) + compProp.margin,
                containerHeight = compHeight - galleriesHelperFunctions.getSkinHeightDiff(skinName) + compProp.margin;
            return {
                width: selectedAnimation === "Shrink" ? itemWidth : containerWidth,
                height: selectedAnimation === "Shrink" ? itemHeight : containerHeight
            };

        }

        function getRollOverStyle(hoveredImage, skinName) {
            return {
                visibility: "visible",
                position: "absolute",
                cursor: "pointer",
                padding: 0,
                left: parseInt(hoveredImage.props.style.left, 10) + galleriesHelperFunctions.getSkinWidthDiff(skinName) / 2,
                top: parseInt(hoveredImage.props.style.top, 10),
                width: parseInt(hoveredImage.props.containerWidth, 10),
                height: parseInt(hoveredImage.props.containerHeight, 10)
            };
        }

        function addStubReferenceToEmptyArrayLocations(sourceArr, destArr) {
            var maxArrLen = Math.max(sourceArr.length, destArr.length);
            var emptyRefName = "emptyDivToFillMatrix";
            _.times(maxArrLen, function (index) {
                if (!sourceArr[index]) {
                    sourceArr[index] = emptyRefName;
                }
                if (!destArr[index]) {
                    destArr[index] = emptyRefName;
                }
            });
        }

        function getImageClickAction(expandEnabled, galleryImageOnClickAction) {
            var imageClickAction = galleryImageOnClickAction;
            if (!imageClickAction) {
                imageClickAction = (expandEnabled === true) ? "zoomMode" : "disabled";
            }
            return imageClickAction;
        }

        function generateZoomNode(imageData, link) {
            var params = _.defaults(
                {
                    href: link.href || "#",
                    style: _.assign({
                        height: '100%',
                        display: 'block',
                        width: '100%',
                        position: 'absolute',
                        top: '0px',
                        left: '0px',
                        backgroundColor: "#ffffff",
                        filter: "alpha(opacity=0)",
                        opacity: "0",
                        cursor: link.cursor
                    }, utils.style.prefix({
                        userSelect: 'none',
                        userDrag: 'none',
                        userModify: 'read-only'
                    }))
                }, link);

            if (!link.href) {
                params.onClick = function (e) {
                    function createEvent(expandedImageId) {
                        return {
                            id: expandedImageId,
                            name: siteUtils.constants.ACTION_TYPES.ITEM_CLICKED,
                            timeStamp: window.performance ? window.performance.now() : window.Date.now()
                        };
                    }
                    this.props.handleAction({
                        "type": "comp",
                        "name": siteUtils.constants.ACTION_TYPES.ITEM_CLICKED,
                        "sourceId": this.props.id,
                        "pageId": this.props.rootId
                    }, createEvent(imageData.id));
                    e.preventDefault();
                    e.stopPropagation();
                }.bind(this);
            }
            return React.DOM.a(params);
        }

        function getLink(imgData, compProps, navInfo, renderLink, renderImageZoomLink, link, galleryId, linkRenderInfo) {
            var zoomLink = {},
                goToLinkText = 'Go to link',
                cursor = 'pointer',
                clickAction = getImageClickAction(compProps.expandEnabled, compProps.galleryImageOnClickAction),
                linkData;

            if (imgData.link) {
                linkData = renderLink(link, linkRenderInfo, navInfo);
            }

            if (compProps.goToLinkText) {
                goToLinkText = compProps.goToLinkText;
            }

            if (clickAction === 'zoomMode') {
                zoomLink = renderImageZoomLink(linkRenderInfo, navInfo, imgData, galleryId);
            } else if (linkData && clickAction === 'goToLink') {
                zoomLink = linkData;
            } else {
                cursor = 'default';
            }

            _.assign(zoomLink, {
                linkData: linkData,
                goToLinkText: goToLinkText,
                cursor: cursor,
                clickAction: clickAction
            });

            return zoomLink;
        }

        function getTitle(imgData) {
            return (imgData ? imgData.title : "");
        }

        function getDescription(imgData) {
            return (imgData ? imgData.description : "");
        }

        function getPublicState(state) {
            return state ? _.pick(state, ['currentIndex']) : {currentIndex: 0};
        }

        /**
         * @class components.PaginatedGridGallery
         * @extends {core.skinBasedComp}
         * @extends {core.animationsMixin}
         * @extends {core.timeoutsMixin}
         */
        return {
            displayName: "PaginatedGridGallery",

            mixins: [mixins.skinBasedComp, galleriesCommon.mixins.galleryAutoPlayMixin, mixins.animationsMixin, mixins.timeoutsMixin, mixins.compStateMixin(getPublicState)],

            propTypes: _.assign({
                compProp: santaProps.Types.Component.compProp.isRequired,
                compData: santaProps.Types.Component.compData.isRequired,
                id: santaProps.Types.Component.id.isRequired,
                skin: santaProps.Types.Component.skin.isRequired,
                style: santaProps.Types.Component.style.isRequired,
                linkRenderInfo: santaProps.Types.Link.linkRenderInfo.isRequired,
                rootNavigationInfo: santaProps.Types.Component.rootNavigationInfo.isRequired,

                isZoomOpened: santaProps.Types.isZoomOpened.isRequired,
                windowTouchEventsAspect: santaProps.Types.SiteAspects.windowTouchEvents.isRequired,
                isMobileView: santaProps.Types.isMobileView,
                isMobileDevice: santaProps.Types.Device.isMobileDevice,
                isTabletDevice: santaProps.Types.Device.isTabletDevice,
                isPlayingAllowed: santaProps.Types.RenderFlags.isPlayingAllowed,

                onAnimationCompleteCallback: React.PropTypes.func,
                createGalleryItem: React.PropTypes.func,
                getItemRef: React.PropTypes.func,
                compActions: santaProps.Types.Component.compActions.isRequired
            }, santaProps.santaTypesUtils.getSantaTypesByDefinition(image)),

            statics: {
                useSantaTypes: true,
                behaviors: {
                    nextSlide: {methodName: 'next'},
                    prevSlide: {methodName: 'prev'}
                }
            },

            getInitialState: function () {
                this.props.windowTouchEventsAspect.registerToWindowTouchEvent('touchStart', this);
                this.isAnimating = false;

                return _.assign(getPublicState(), {
                    hoveredImage: null,
                    $itemSelection: "idle",
                    $mobile: (this.props.isMobileDevice || this.props.isTabletDevice) ? "mobile" : "notMobile",
                    $displayDevice: this.props.isMobileView ? "mobileView" : "desktopView",
                    $animationInProcess: null, //for automation,
                    $touchRollOverSupport: "touchRollOut"
                });
            },
            componentWillReceiveProps: function (nextProps) {
                var autoPlayPropChanged = false;
                var newState = {
                    $mobile: (nextProps.isMobileDevice || nextProps.isTabletDevice) ? "mobile" : "notMobile",
                    $displayDevice: nextProps.isMobileView ? "mobileView" : "desktopView"
                };
                if (this.props.compProp.autoplay !== nextProps.compProp.autoplay) {
                    var shouldAutoPlay = (nextProps.compProp.autoplay && !this.props.isZoomOpened && this.props.isPlayingAllowed) ? 'autoplayOn' : 'autoplayOff';
                    autoPlayPropChanged = true;
                    newState.shouldAutoPlay = nextProps.compProp.autoplay;
                    newState.$slideshow = shouldAutoPlay;
                }
                this.setState(newState, function () {
                    if (autoPlayPropChanged) {
                        this.updateAutoplayState();
                        this.handleAction(newState.$slideshow);
                    }
                }.bind(this));
            },
            componentDidMount: function () {
                this.updateAutoplayState();

            },
            componentWillUnmount: function () {
                this.props.windowTouchEventsAspect.unregisterFromWindowTouchEvent('touchStart', this);
            },
            getButtonVisibility: function (nextPageItemIndex, prevPageItemIndex) {
                if (this.props.compProp.showNavigation === false ||
                    (this.state.currentIndex === nextPageItemIndex && this.state.currentIndex === prevPageItemIndex || this.props.compProp.isHidden)) {
                    return "hidden";
                } //showNavigation is undefined or true
                return "visible";
            },
            getSkinProperties: function () {
                var compProp = _.defaults(this.props.compProp, defaultCompPropValues);
                var compData = this.props.compData;
                var displayedItemRefs = galleryPagingCalculations.getPageItems(compData.items, this.state.currentIndex, compProp.numCols, compProp.maxRows);
                var imageData = this.state.hoveredImage ? this.state.hoveredImage.props.compData : null;
                var link = this.state.hoveredImage ? getLink(imageData, compProp, this.props.rootNavigationInfo, linkRenderer.renderLink, linkRenderer.renderImageZoomLink, imageData.link, compData.id, this.props.linkRenderInfo) : {};
                var nextPageItemIndex = galleryPagingCalculations.getNextPageItemIndex(this.state.currentIndex, compProp.numCols, compProp.maxRows, compData.items.length);
                var prevPageItemIndex = galleryPagingCalculations.getPrevPageItemIndex(this.state.currentIndex, compProp.numCols, compProp.maxRows, compData.items.length);
                var nextPageItems = galleryPagingCalculations.getPageItems(compData.items, nextPageItemIndex, compProp.numCols, compProp.maxRows);
                var prevPageItems = galleryPagingCalculations.getPageItems(compData.items, prevPageItemIndex, compProp.numCols, compProp.maxRows);
                var btnVisibility = this.getButtonVisibility(nextPageItemIndex, prevPageItemIndex);
                var counterVisibility = (!this.props.compProp.isHidden && this.props.compProp.showCounter && displayedItemRefs.length > 0) ? "visible" : "hidden";
                var itemsContainerClass = this.classSet({'show-counter': btnVisibility !== 'hidden' || counterVisibility !== 'hidden'});
                return {
                    "": {
                        'data-height-diff': galleriesHelperFunctions.getSkinHeightDiff(this.props.skin),
                        'data-width-diff': galleriesHelperFunctions.getSkinWidthDiff(this.props.skin),
                        onMouseLeave: function (event, reactNode) {
                            this.onRollOut(event, reactNode, true);
                        }.bind(this),
                        style: {
                            overflow: 'hidden'
                        }
                    },
                    'itemsContainer': {
                        children: this.createDisplayedItems(displayedItemRefs, nextPageItems, prevPageItems, nextPageItemIndex, prevPageItemIndex),
                        'data-gallery-id': this.props.id,
                        className: itemsContainerClass,
                        style: {
                            position: "relative",
                            overflow: "hidden",
                            width: this.props.style.width - galleriesHelperFunctions.getSkinWidthDiff(this.props.skin),
                            height: this.props.style.height - galleriesHelperFunctions.getSkinHeightDiff(this.props.skin)
                        }
                    },
                    'buttonPrev': {
                        onClick: function (event) {
                            if (event) {
                                event.stopPropagation();
                            }
                            this.prev();
                        }.bind(this),
                        'data-gallery-id': this.props.id,
                        style: {visibility: btnVisibility}
                    },
                    'buttonNext': {
                        onClick: function (event) {
                            if (event) {
                                event.stopPropagation();
                            }
                            this.next();
                        }.bind(this),
                        'data-gallery-id': this.props.id,
                        style: {visibility: btnVisibility}
                    },
                    'counter': {
                        "children": galleryPagingCalculations.getCounterText(this.state.currentIndex, compProp.numCols, compProp.maxRows, compData.items.length),
                        style: {visibility: counterVisibility},
                        'data-gallery-id': this.props.id
                    },
                    'autoplay': {
                        onClick: this.toggleAutoPlay,
                        'data-gallery-id': this.props.id,
                        style: {cursor: "pointer", visibility: this.shouldShowAutoPlay() ? "visible" : "hidden"}
                    },
                    'rolloverHolder': {
                        style: this.state.hoveredImage ? getRollOverStyle(this.state.hoveredImage, this.props.skin) : {
                            visibility: "hidden",
                            cursor: "pointer"
                        },
                        'data-gallery-id': this.props.id,
                        addChildBefore: [
                            generateZoomNode.call(this, imageData, link), "link"
                        ]
                    },
                    'title': {
                        children: this.state.hoveredImage ? getTitle(imageData) : "",
                        'data-gallery-id': this.props.id
                    },
                    'description': {
                        children: this.state.hoveredImage ? getDescription(imageData) : "",
                        'data-gallery-id': this.props.id
                    },
                    "link": _.merge(link.linkData, {
                        children: link.goToLinkText,
                        'data-gallery-id': this.props.id,
                        refInParent: 'link',
                        style: {
                            display: (link.clickAction === "goToLink" || !link.linkData) ? 'none' : "block"
                        }
                    }),
                    'textWrapper': {
                        'data-gallery-id': this.props.id
                    }
                };
            },

            /**
             * @private
             * @param imageRef the image component which is currently hovered
             * @param event the hover event
             * @returns {*}
             */
            onMouseEnter: function (imageRef) {
                var hoveredImage = this.refs[imageRef];
                if (this.state.hoveredImage !== hoveredImage) {
                    this.setState({
                        hoveredImage: hoveredImage,
                        $itemSelection: "rollover"
                    });
                }
            },
            onRollOut: function (event, reactNode, forceRollOut) {
                if (event.target.tagName !== "IMG" || forceRollOut) {
                    this.setState({
                        hoveredImage: null,
                        $itemSelection: "idle"
                    });
                }
            },

            onComponentTouchStart: function (imageRef) {
                this.onMouseEnter(imageRef);
                if (this.state.$touchRollOverSupport === "touchRollOut") {
                    this.setState({
                        $touchRollOverSupport: "touchRollOver"
                    });
                }
            },
            onWindowTouchStart: function (event) {
                // Check that the click hasn't been done anywhere on the component
                var galleryId = event.target.getAttribute("data-gallery-id") || event.target.parentNode.getAttribute("data-gallery-id");

                if (this.state.$touchRollOverSupport === "touchRollOver" && galleryId !== this.props.id) {
                    this.onRollOut({target: ""}, null, true);
                    this.setState({
                        $touchRollOverSupport: "touchRollOut"
                    });
                }
            },
            next: function (callback) {
                this.movePage(false, callback);
            },

            prev: function (callback) {
                this.movePage(true, callback);
            },
            movePage: function (isPrev, callback) {
                var compProp = this.props.compProp;
                var compData = this.props.compData;
                var nextPageIndex = isPrev ? galleryPagingCalculations.getPrevPageItemIndex(this.state.currentIndex, compProp.numCols, compProp.maxRows, compData.items.length) : galleryPagingCalculations.getNextPageItemIndex(this.state.currentIndex, compProp.numCols, compProp.maxRows, compData.items.length);
                if (this.isAnimating || nextPageIndex === this.state.currentIndex) {
                    if (!this._movePageQueue) {
                        this._movePageQueue = [];
                    }
                    this._movePageQueue.push(isPrev);
                    return;
                }
                var nextPageItems = galleryPagingCalculations.getPageItems(compData.items, nextPageIndex, compProp.numCols, compProp.maxRows);
                var displayedItemsData = galleryPagingCalculations.getPageItems(compData.items, this.state.currentIndex, compProp.numCols, compProp.maxRows);
                var currentImagesRefs = this.convertDataItemsToRefs(displayedItemsData, this.state.currentIndex);
                var nextPageImagesRefs = this.convertDataItemsToRefs(nextPageItems, nextPageIndex);
                if (nextPageItems) {

                    this.setState({
                        $animationInProcess: "animationInProcess",
                        $itemSelection: "idle"
                    });

                    this.performAnimation(currentImagesRefs, nextPageImagesRefs, isPrev, nextPageIndex, callback);
                }
            },

            performAnimation: function (currentImagesRefs, nextOrPrevPageImagesRefs, isPrev, newItemIndex, callback) {
                var compProp = this.props.compProp;
                var rowNum = matrixCalculations.getAvailableRowsNumber(compProp.maxRows, compProp.numCols, this.props.compData.items.length);
                var animationProps = matrixAnimationManipulation.getSortedArrayAndStagger(compProp.transition, currentImagesRefs, nextOrPrevPageImagesRefs, rowNum, compProp.numCols, this.timingFunctionIndex || 0);
                var selectedAnimation = animationProps.transName;
                var usedHeight = this.props.style.height;
                var animationSizeProps = getAnimationProperties(compProp, this.props.style.width, usedHeight, rowNum, this.props.skin, selectedAnimation);
                this.timingFunctionIndex = animationProps.timingFunctionIndex + 1;

                var transDuration = compProp.transition === "none" ? 0 : compProp.transDuration;
                var stagger = animationProps.stagger;

                var sequence = this.sequence();

                var shouldBeRandomDirection = (animationProps.sporadicallyRandom && animationProps.sourceNodesArrSorted.length > 1);

                if (animationProps.sourceNodesArrSorted.length !== animationProps.destNodesArrSorted.length) {
                    addStubReferenceToEmptyArrayLocations(animationProps.sourceNodesArrSorted, animationProps.destNodesArrSorted);
                }

                _.forEach(animationProps.sourceNodesArrSorted, function (sourceNodesArrSorted, index) {
                    var destNodesArrSorted = animationProps.destNodesArrSorted[index];

                    var currAnimationTransParams = {
                        width: animationSizeProps.width,
                        height: animationSizeProps.height,
                        reverse: (shouldBeRandomDirection) ? (Math.random() > 0.5) : !!isPrev
                    };

                    var sequenceStagger = stagger;
                    if (selectedAnimation === "Shrink" || selectedAnimation === "CrossFade") {
                        currAnimationTransParams.stagger = stagger;
                        sequenceStagger = 0;
                    }
                    sequence.add({
                        sourceRefs: sourceNodesArrSorted,
                        destRefs: destNodesArrSorted
                    }, selectedAnimation, transDuration, 0, currAnimationTransParams, index * sequenceStagger);
                });
                sequence
                    .onStartAll(function () {
                        this.isAnimating = true;
                    }.bind(this))
                    .onCompleteAll(function () {
                        this.animationCompleteCallback(newItemIndex, callback);
                    }.bind(this))
                    .execute();

            },

            animationCompleteCallback: function (newItemIndex, callback) {
                this.isAnimating = false;
                if (this.props.onAnimationCompleteCallback) {
                    this.props.onAnimationCompleteCallback();
                }
                this.setState({
                    currentIndex: newItemIndex,
                    $animationInProcess: null
                }, function () {
                    this.updateAutoplayState();
                    if (_.isFunction(callback)) {
                        callback();
                    }
                }.bind(this));

                if (this._movePageQueue && this._movePageQueue.length > 0) {
                    setTimeout(function () {
                        this.movePage(this._movePageQueue.shift());
                    }.bind(this), 100);
                }
            },

            createDisplayedItems: function (displayedItems, nextPageItems, prevPageItems, nextPageItemIndex, prevPageItemIndex) {
                var compProp = this.props.compProp;
                var compData = this.props.compData;
                var itemWidth = matrixCalculations.getItemWidth(compProp.margin, compProp.numCols, this.props.style.width, galleriesHelperFunctions.getSkinWidthDiff(this.props.skin));
                var rowNum = matrixCalculations.getAvailableRowsNumber(compProp.maxRows, compProp.numCols, compData.items.length);
                var itemHeight = matrixCalculations.getItemHeight(compProp.margin, this.props.style.height, rowNum, galleriesHelperFunctions.getSkinHeightDiff(this.props.skin));
                var nextItemsConstructorArray = [];
                var prevItemsConstructorArray = [];
                var currItemsConstructorArray = _.map(displayedItems, function (item, index) {
                    return this.createGalleryItem(item, index, itemWidth, itemHeight, this.state.currentIndex, displayedItems.length, 'curr');
                }, this);

                if (nextPageItemIndex !== this.state.currentIndex) {
                    nextItemsConstructorArray = _.map(nextPageItems, function (item, index) {
                        return this.createGalleryItem(item, index, itemWidth, itemHeight, nextPageItemIndex, nextPageItems.length, 'next', {visibility: "hidden"});
                    }, this);
                }
                if (prevPageItemIndex !== nextPageItemIndex && prevPageItemIndex !== this.state.currentIndex) {
                    prevItemsConstructorArray = _.map(prevPageItems, function (item, index) {
                        return this.createGalleryItem(item, index, itemWidth, itemHeight, prevPageItemIndex, prevPageItems.length, 'prev', {visibility: "hidden"});
                    }, this);
                }


                return nextItemsConstructorArray.concat(prevItemsConstructorArray).concat(currItemsConstructorArray);
            },

            createGalleryItem: function (itemData, index, width, height, pageIndex, itemsPerPage, pageDesc, additionalStyle) {
                if (this.props.createGalleryItem) {
                    return this.props.createGalleryItem(this.props.id, itemData, index, pageIndex, itemsPerPage, additionalStyle, this.classSet);
                }
                return this.createImageItem(itemData, index, width, height, pageIndex, pageDesc, additionalStyle);
            },

            convertDataItemsToRefs: function (itemsData, pageIndex) {
                var result = [];
                for (var i = 0; i < itemsData.length; i++) {
                    var ref = this.props.getItemRef ? this.props.getItemRef(this.props.id, pageIndex, i) : this.getImageItemRef(pageIndex, i);
                    result.push(ref);
                }
                return result;
            },

            getImageItemRef: function (pageIndex, itemIndex) {
                return this.props.id + pageIndex + itemIndex;
            },

            getImageItemKey: function (pageIndex, itemIndex) {
                return this.state.currentIndex + this.props.id + pageIndex + "#" + itemIndex;
            },

            createImageItem: function (imgData, index, width, height, pageIndex, pageDesc, additionalStyle) {
                var wrapperPosition = matrixCalculations.getItemPosition(index, width, height, this.props.compProp.margin, this.props.compProp.numCols);
                var imgStyle = matrixCalculations.getImageStyle(height, width, imgData.height, imgData.width);
                return this.createChildComponent(
                    imgData,
                    'core.components.Image',
                    'img',
                    {
                        id: this.getImageItemRef(pageIndex, index),
                        ref: this.getImageItemRef(pageIndex, index),
                        key: this.getImageItemKey(pageIndex, index),
                        imageData: imgData,
                        containerWidth: Math.round(width),
                        containerHeight: Math.round(height),
                        displayMode: imageClientApi.fittingTypes.SCALE_TO_FILL,
                        usePreloader: true,
                        imgStyle: imgStyle,
                        'data-gallery-id': this.props.id,
                        'data-page-desc': pageDesc,
                        'data-query': imgData.id,
                        'data-image-index': pageIndex + index,
                        onMouseEnter: this.onMouseEnter,
                        onTouchStart: this.onComponentTouchStart,
                        style: _.merge({
                            left: wrapperPosition.left,
                            top: wrapperPosition.top,
                            position: "absolute",
                            overflow: "hidden",
                            transform: "none",
                            clip: "auto"

                        }, additionalStyle)
                    }
                );
            }
        };

    });
