define(
    [
        'lodash',
        'utils',
        'core',
        'components/components/touchMediaZoom/touchMediaZoomUtils',
        'imageClientApi'
    ],
    function (_, utils, core, touchMediaZoomUtils, imageClientApi) {
    'use strict';

    var mixins = core.compMixins,
        linkRenderer = utils.linkRenderer,
        nonPageItemZoom = utils.nonPageItemZoom,
        ITEM_OVERLAP = 0.2,
        MOBILE_SAFARI_LEFT_SWIPE_MARGIN_IN_PIXELS = 29,
        LOW_RES_IMAGE_SCALE = 0.25;

    /**
     * @class components.touchMediaZoomSlideshow
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'TouchMediaZoomSlideshow',
        mixins: [mixins.skinBasedComp],
        nonReactState: {
            currentSlideIndex: 0,
            swipeOffset: 0,
            isZoomed: false
        },

        getSwipeOffset: function () {
            return this.nonReactState.swipeOffset;
        },

        setSwipeOffset: function (value) {
            this.nonReactState.swipeOffset = value;
            var transformString = this.generateTransformString(value);
            this.refs.swipeStage.style.transform = transformString;
            this.refs.swipeStage.style.webkitTransform = transformString;
        },

        generateTransformString: function (value) {
            return "translate3d(" + (-1 * value * this.stagePercentFactor) + "%, 0, 0)";
        },

        getCurrentSlideIndex: function () {
            return this.nonReactState.currentSlideIndex;
        },

        setCurrentSlideIndex: function (value) {
            this.nonReactState.currentSlideIndex = value;
        },

        getIsZoomed: function () {
            return this.nonReactState.isZoomed;
        },

        setIsZoomed: function (value) {
            this.nonReactState.isZoomed = value;
        },

        getStagePercentFactor: function () {
            return 100 / this.stageData.fullWidth;
        },

        getItems: function () {
            return _.get(this.props, 'pageItemAdditionalData.items', [this.props.compData]);
        },

        enterZoomMode: function() {
            this.isZoomed = true;
            this.refs.xButton.classList.add(this.classSet({'force-hide': true}));
        },

        exitZoomMode: function() {
            this.isZoomed = false;
            this.refs.xButton.classList.remove(this.classSet({'force-hide': true}));
        },

        onTouchMove: function(event){
            if (event.touches.length === 1 && !this.isZoomed){
                event.preventDefault();
                return;
            }

            if (event.touches.length === 1 || this.isZoomed){
                return;
            }

            this.enterZoomMode();
        },

        onTouchEnd: function() {
            if (!this.isZoomed) {
                return;
            }

            this._touchEndTimeoutHandle = window.setTimeout(function (){
                if (!this.props.siteData.mobile.isZoomedIn()) {
                    this.exitZoomMode();
                }
            }.bind(this), 300);
        },

        componentWillMount: function () {
            this.props.siteAPI.getSiteAspect('siteScrollingBlocker').enterMediaZoomMode(this);
            var windowKeyboardEvent = this.props.siteAPI.getSiteAspect('windowKeyboardEvent');
            windowKeyboardEvent.registerToArrowLeftKey(this);
            windowKeyboardEvent.registerToArrowRightKey(this);
            Object.defineProperty(this, 'swipeOffset', {get: this.getSwipeOffset, set: this.setSwipeOffset});
            Object.defineProperty(this, 'currentSlideIndex', {get: this.getCurrentSlideIndex, set: this.setCurrentSlideIndex});
            Object.defineProperty(this, 'isZoomed', {get: this.getIsZoomed, set: this.setIsZoomed});
            Object.defineProperty(this, 'stagePercentFactor', {get: this.getStagePercentFactor});
            this.stageData = touchMediaZoomUtils.createStageData(ITEM_OVERLAP);
            this.resetNonReactState();
            this.preloadImages(this.currentSlideIndex);
            this.setState({
                showInfo: true,
                isZoomed: false
            });
        },

        componentDidMount: function () {
            this.setSwipeOffset(this.swipeOffset);

            this.refs.swipeStage.addEventListener('transitionend', this.onSwipeEnd);
            if (!this.props.siteData.isMobileDevice()){
                return;
            }

            var self = this;
            require(['hammer'], function (Hammer) {
                self.setupTouchHandlers(Hammer);
            });

            this.refs[""].addEventListener('touchend', this.onTouchEnd);
            this.refs[""].addEventListener('touchcancel', this.onTouchEnd);
            this.refs[""].addEventListener('touchmove', this.onTouchMove);
        },

        componentWillUnmount: function () {
            this.props.siteAPI.getSiteAspect('siteScrollingBlocker').exitMediaZoomMode(this);
            window.clearTimeout(this._touchEndTimeoutHandle);
        },

        setupTouchHandlers: function(Hammer) {
            this.hammertime = new Hammer.Manager(this.refs[""], {
                cssProps:{
                    touchCallout: 'default'
                },
                touchAction: 'auto'
            });

            this.hammertime.add(new Hammer.Pan({event: 'pan', direction: Hammer.DIRECTION_HORIZONTAL}));
            this.hammertime.add(new Hammer.Pan({event: 'panstart', direction: Hammer.DIRECTION_HORIZONTAL}));
            this.hammertime.add(new Hammer.Pan({event: 'panend', direction: Hammer.DIRECTION_HORIZONTAL}));
            this.hammertime.on('panstart pan panend', this.onSwipe);
        },

        componentWillUpdate: function () {
            if (this.props.siteData.isMobileDevice()){
                this.setSwipeOffset(this.stageData.centerPart_begin);
            }
        },

        componentWillReceiveProps: function () {
            if (!this.props.siteData.renderFlags.isZoomAllowed) {
                setTimeout(this.closeMediaZoom, 0);
                return;
            }
        },

        resetNonReactState: function (compDataOverride) {
            var compData = compDataOverride || this.props.compData;
            var itemIndex = _.findIndex(this.getItems(), {id: compData.id});
            var zoomMode = this.props.siteData.mobile.isZoomed();
            this.nonReactState = {
                currentSlideIndex: itemIndex,
                swipeOffset: this.stageData.centerPart_begin,
                isZoomed: zoomMode
            };
        },

        onSwipe: function onSwipe(ev) {
            if (this.isZoomed){
                return;
            }

            if (ev.center.x - ev.deltaX < MOBILE_SAFARI_LEFT_SWIPE_MARGIN_IN_PIXELS) {
                return;
            }

            switch (ev.type){
                case 'panstart':
                    break;

                case 'pan':
                    this.swipeOffset = touchMediaZoomUtils.clamp(
                        this.stageData.centerPart_begin - ev.deltaX / window.innerWidth,
                        (this.currentSlideIndex > 0) ? this.stageData.leftPart_leftMargin : this.stageData.centerPart_leftMargin,
                        (this.currentSlideIndex < this.getItems().length - 1) ? this.stageData.rightPart_rightMargin : this.stageData.centerPart_rightMargin);
                    break;

                case 'panend':
                    this.startTransition();
                    break;

                default:
                    throw "unsupported event type: " + ev.type;
            }
        },

        calcTransitionTarget: function (){
            if (this.swipeOffset < this.stageData.centerPart_leftMargin) {
                return {
                    offset: this.stageData.leftPart_begin,
                    index: this.currentSlideIndex - 1
                };
            }
            if (this.swipeOffset > this.stageData.centerPart_rightMargin) {
                return {
                    offset: this.stageData.rightPart_begin,
                    index: this.currentSlideIndex + 1
                };
            }
            return {
                offset: this.stageData.centerPart_begin,
                index: this.currentSlideIndex
            };
        },

        startTransition: function(transitionTarget) {
            var target = transitionTarget || this.calcTransitionTarget();
            this.refs.swipeStage.classList.add(this.props.styleId + "_animate");
            this.swipeOffset = target.offset;
            this.currentSlideIndex = target.index;
            this.preloadImages(this.currentSlideIndex);
        },

        onSwipeEnd: function onSwipeEnd() {
            this.refs.swipeStage.classList.remove(this.props.styleId + "_animate");
            this.swipeOffset = this.stageData.centerPart_begin;
            this.navigateToSlide(this.currentSlideIndex);
            this.setState({});
        },

        navigateToSlide: function (index) {
            var itemId = this.getItems()[index].id;
            var navigationInfo = _.clone(this.props.rootNavigationInfo);
            navigationInfo.pageItemId = itemId;
            this.props.siteAPI.updateUrlIfNeeded(navigationInfo);
        },

        closeMediaZoom: function () {
            if (nonPageItemZoom.getZoomedImageData()) {
                nonPageItemZoom.unzoom();

            } else {
                this.props.siteAPI.navigateToPage({pageId: this.props.rootNavigationInfo.pageId});
            }
        },

        onXButton: function (event) {
            this.closeMediaZoom();
            event.preventDefault();
            event.stopPropagation();
        },

        onArrowLeftKey: function () {
            if (this.currentSlideIndex > 0) {
                this.startTransition({
                    offset: this.stageData.leftPart_begin,
                    index: this.currentSlideIndex - 1
                });
            }
        },

        onArrowRightKey: function () {
            if (this.currentSlideIndex < this.getItems().length - 1) {
                this.startTransition({
                    offset: this.stageData.rightPart_begin,
                    index: this.currentSlideIndex + 1
                });
            }
        },

        toggleInfoPanel: function () {
            this.setState({showInfo: !this.isManipulated() && !this.state.showInfo});
        },

        getGotoLink: function (imageData) {
            var linkData = imageData.link;
            if (!linkData) {
                return;
            }

            var link = linkRenderer.renderLink(linkData, this.props.siteData, this.props.rootNavigationInfo);
            link.children = _.get(this.props, 'compProps.goToLinkText', 'Go to link');
            return link;
        },

        preloadImages: function(index){
            for (var i = index - 10; i < index + 10; i++){
                this.preloadImage(i, LOW_RES_IMAGE_SCALE);
            }
            for (var j = index - 3; j < index + 3; j++){
                this.preloadImage(j);
            }
        },

        preloadImage: function(index, scale){
            if (index < 0 || index >= this.getItems().length) {
                return;
            }

            var imageData = this.getItems()[index];
            var imageApiData = this.getImageData(imageData, scale);
            (new window.Image()).src = imageApiData.uri;
        },

        getStageParts: function (){
            return _.filter([
                {id: 'LEFT', imageIndex: this.currentSlideIndex - 1, offset: this.stageData.leftPart_leftMargin},
                {id: 'CENTER', imageIndex: this.currentSlideIndex, offset: this.stageData.centerPart_leftMargin},
                {id: 'RIGHT', imageIndex: this.currentSlideIndex + 1, offset: this.stageData.rightPart_leftMargin}
            ], function (obj) {
                return obj.imageIndex >= 0 && obj.imageIndex < this.getItems().length;
            }, this);
        },

        isManipulated: function() {
            var isLandscape = this.props.siteData.isMobileDevice() && this.props.siteData.mobile.isLandscape();
            return isLandscape || this.state.isZoomed;
        },

        getImageData: function (imageData, scale) {
            var fittingType = imageClientApi.fittingTypes.SCALE_TO_FIT;
            var src = {id: imageData.uri, width: imageData.width, height: imageData.height};
            var pixelAspectRatio = this.props.siteData.mobile.getDevicePixelRatio();
            var screenSize = this.props.siteData.screenSize;
            var imageSize = touchMediaZoomUtils.calcImageSize({
                imageDimensions: _.pick(imageData, ['width', 'height']),
                viewport: {width: screenSize.width, height: screenSize.height}
            });
            var scaledDimensions = {
                width: Math.round(imageSize.width * (scale || 1)),
                height: Math.round(imageSize.height * (scale || 1))
            };
            var target = {
                width: scaledDimensions.width,
                height: scaledDimensions.height,
                alignment: imageClientApi.alignTypes.CENTER,
                htmlTag: 'img',
                pixelAspectRatio: pixelAspectRatio
            };
            var imageQualityFilters = _.defaults({quality: 85}, imageData.quality || {});
            var browser = this.props.siteData.browser;
            var returnedImageData = imageClientApi.getData(fittingType, src, target, imageQualityFilters, browser);
            _.assign(returnedImageData.css.img, imageSize, {objectFix: 'internal'});
            _.assign(returnedImageData, {uri: utils.urlUtils.joinURL(this.props.siteData.getStaticMediaUrl(), returnedImageData.uri)});
            return returnedImageData;
        },

        buildStageChildren: function () {
            var stageChildren = [];

            _.forEach(this.getStageParts(), function (part) {
                var itemLeft = (part.offset * this.stagePercentFactor);
                var partId = 'stage_' + part.id;
                var imageData = this.getItems()[part.imageIndex];
                var imageApiFastData = this.getImageData(imageData, LOW_RES_IMAGE_SCALE);
                var imageApiData = this.getImageData(imageData);
                var parallaxGroup = this.createChildComponent(imageData, 'wysiwyg.viewer.components.TouchMediaZoomItem', 'image', {
                    key: this.props.id + '_item' + part.imageIndex,
                    id: partId,
                    ref: partId,
                    imageData: imageApiData,
                    imageFastData: imageApiFastData,
                    title: imageData.title,
                    description: imageData.description,
                    link: this.getGotoLink(imageData),
                    screenWidth: this.props.siteData.screenSize.width,
                    itemWidth: this.props.siteData.screenSize.width * (1 + 2 * ITEM_OVERLAP),
                    showInfo: this.state.showInfo && !this.isManipulated(),
                    itemLeft: itemLeft
                });

                stageChildren.push(parallaxGroup);
            }, this);

            return stageChildren;
        },

        getSkinProperties: function () {
            return {
                "": {
                    onClick: this.toggleInfoPanel
                },
                swipeStage: {
                    style: {
                        width: (100 * this.stageData.fullWidth) + "%"
                    },
                    children: this.buildStageChildren()
                },
                xButton: {
                    onClick: this.onXButton,
                    className: this.classSet({hidden: this.isManipulated()})
                }
            };
        }
    };
});
