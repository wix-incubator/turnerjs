define(['core', 'skins', 'lodash', 'reactDOM', 'galleriesCommon'], function(/** core */ core, skinsPackage, _, ReactDOM, galleriesCommon) {
    'use strict';
    var mixins = core.compMixins;
    var galleriesHelperFunctions = galleriesCommon.utils.galleriesHelperFunctions;
    var matrixScalingCalculations = galleriesCommon.utils.matrixScalingCalculations;

    function setCurrentIndex(itemIndex, event, domID) {
        var oldSelectedIndex = this.state.currentIndex;
        if (oldSelectedIndex !== itemIndex) {
            if (this.props.onImageSelected) {
                event.type = 'imageSelected';
                event.payload = {
                    itemIndex: itemIndex,
                    imageData: this.props.compData.items[itemIndex]
                };
                this.props.onImageSelected(event, domID);
            }
            this.setState({currentIndex: itemIndex});
        }
    }

    // This constant is used as a base line for the speed of the slide animation (sorry, we had to do it like the old wix)
    // the calculation is: (speed * constant) pixels per second
    var animationSpeedConstant = 60;

	function getPublicState(state, propsInfo) {
        var defaultIndex = propsInfo.props.selectedItemIndex || 0;
        var currentIndex = _.get(state, ['currentIndex'], defaultIndex);
		return {currentIndex: currentIndex};
	}

    /**
     * @class components.SliderGallery
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'SliderGallery',
        statics: {
            behaviors: {
                nextSlide: {methodName: 'next'},
                prevSlide: {methodName: 'prev'}
            }
        },
        mixins: [
            mixins.skinBasedComp,
            mixins.skinInfo,
            mixins.animationsMixin,
            mixins.timeoutsMixin,
            mixins.compStateMixin(getPublicState)
        ],

        _currentOffset: null,
        _motion: false,
        _firstChild: null,

        getInitialState: function () {
            var windowTouchEventsAspect = this.props.siteAPI.getSiteAspect('windowTouchEvents');

            windowTouchEventsAspect.registerToWindowTouchEvent('touchStart', this);

            return _.assign(getPublicState(null, {props: this.props.compProp}), {
                $mobile: (this.props.siteData.isMobileDevice() || this.props.siteData.isTabletDevice()) ? "mobile" : "notMobile",
                $displayDevice: this.props.siteData.isMobileView() ? "mobileView" : "desktopView"
            });
        },
        componentWillUnmount: function () {
            this.props.siteAPI.getSiteAspect('windowTouchEvents').unregisterFromWindowTouchEvent('touchStart', this);
        },
        getSkinProperties: function () {
            this.gap = _.isNumber(this.props.compProp.margin) ? this.props.compProp.margin : 20;
            this.contentOverflow = false;
            var skin = skinsPackage.skins[this.props.skin];
            var bottomGap = (skin.exports && skin.exports.bottomGap) || 0;
            var additionalHeight = Math.abs(this.getFromExports("itemContainerAdditionalHeight"));
            var imagesArr = this.populate(bottomGap, additionalHeight);
            var itemContainerTotalWidthOffset = Math.abs(this.getFromExports("itemContainerTotalOffset"));
            var itemContainerWidth = this.props.style.width - itemContainerTotalWidthOffset;
            if (this.itemsHolderWidth > itemContainerWidth) {
                this.contentOverflow = true;
                imagesArr = this.populate(bottomGap, additionalHeight);
            }

            return {
                imageItem: {},
                images: {
                    children: imagesArr,
                    'data-gallery-id': this.props.id
                },
                swipeLeftHitArea: {
                    onMouseEnter: this.prev,
                    onMouseLeave: this._stopMovement,
                    onTouchStart: this.prev,
                    'data-gallery-id': this.props.id
                },
                swipeRightHitArea: {
                    onMouseEnter: this.next,
                    onMouseLeave: this._stopMovement,
                    onTouchStart: this.next,
                    'data-gallery-id': this.props.id
                },
                "": {
                    onSwipeLeft: this.next,
                    onSwipeRight: this.prev,
                    'data-height-diff': galleriesHelperFunctions.getSkinHeightDiff(this.props.skin),
                    'data-width-diff': galleriesHelperFunctions.getSkinWidthDiff(this.props.skin),
                    'data-bottom-gap': bottomGap,
                    'data-additional-height': additionalHeight
                }
            };
        },
        getChildrenData: function () {
            var data = this.props.compData.items;
            return (this.props.compProp.loop && this.contentOverflow) ? data.concat(data) : data;
        },
        populate: function (bottomGap, additionalHeight) {
            var children;
            var props = this.props.compProp;
            var compData = this.props.compData;
            this.itemsHolderWidth = 0;
            var data = this.getChildrenData();
            children = data.map(function (childData, index) {
                var displayerData = childData;

                var displayerSkin = this.getSkinExports().imageItem.skin;
                var displayerSkinParams = this.getParams(['topPadding', 'imgHeightDiff'], displayerSkin);
                var heightDiff = galleriesHelperFunctions.getDisplayerHeightDiff(skinsPackage.skins[displayerSkin], displayerSkinParams, this.state.$displayDevice);
                var widthDiff = galleriesHelperFunctions.getDisplayerWidthDiff(skinsPackage.skins[displayerSkin], this.state.$displayDevice);
                var totalItemContainerHeight = Math.floor(this.props.style.height + additionalHeight);
                var numberOfUniqueImages = this.props.compData.items.length;
                var sizeAfterScaling = matrixScalingCalculations.getSizeAfterScaling({
                    itemHeight: totalItemContainerHeight,
                    itemWidth: Math.floor(totalItemContainerHeight * (this.props.compProp.aspectRatio || 1.0)),
                    displayerData: displayerData,
                    imageMode: this.props.compProp.imageMode,
                    heightDiff: heightDiff,
                    widthDiff: widthDiff,
                    bottomGap: bottomGap
                });

                this.itemsHolderWidth = this.itemsHolderWidth + sizeAfterScaling.imageWrapperSize.imageWrapperWidth + this.gap;
                return this.createChildComponent(
                    displayerData,
                    "wysiwyg.viewer.components.Displayer",
                    'imageItem',
                    {
                        rootId: this.props.rootId,
                        currentUrlPageId: this.props.currentUrlPageId,
                        rootNavigationInfo: this.props.rootNavigationInfo,
                        galleryDataId: compData.id,
                        imageWrapperSize: sizeAfterScaling.imageWrapperSize,
                        style: {
                            display: 'inline-block',
                            margin: '0 ' + (_.isNumber(props.margin) ? props.margin : 20) + 'px 0 0',
                            height: sizeAfterScaling.displayerSize.height,
                            width: sizeAfterScaling.displayerSize.width
                        },
                        isSelected: this.state.currentIndex === index,
                        onClick: setCurrentIndex.bind(this, index),
                        displayerDataQuery: childData,
                        galleryId: this.props.id,
                        heightDiff: heightDiff,
                        widthDiff: widthDiff,
                        bottomGap: bottomGap,
                        imageIndex: index % numberOfUniqueImages,
                        key: this.props.id + index,
                        ref: this.props.id + index,
                        id: this.props.id + index
                    }
                );

            }, this);

            return children;
        },

        prev: function () {
            this._move(true);
        },

        next: function () {
            this._move(false);
        },

        _move: function (isReverse) {
            var speed = (this.props.compProp.maxSpeed || 0.05);
            this.slide(isReverse, speed, this.props.compProp.loop);
        },

        _stopMovement: function () {
            if (this._sequenceId) {
                this.easeStopSequence(this._sequenceId, 1);
                this._sequenceId = null;
            }
        },
        slide: function (isReverse, speed, isLoop) {
            if (!this.contentOverflow) {
                return;
            }
            var measureMap = this.props.siteData.measureMap;
            var imagesWidth = measureMap.width[this.props.id + "images"] - (this.props.compProp.margin || 0); //width of all the images
            var containerWidth = measureMap.width[this.props.id + "itemsContainer"]; //container size of visible images
            var currentLeft = ReactDOM.findDOMNode(this.refs.images).offsetLeft;
            var maxLeft = isLoop ? -imagesWidth / 2 : containerWidth - imagesWidth;

            //Clear all existing animations and initiate a new timeline
            this._stopMovement();
            var sequence = this.sequence();
            var duration = Math.abs(maxLeft) / (speed * animationSpeedConstant);
            var relativeDuration = duration * (isReverse ? Math.abs(currentLeft / maxLeft) : (1 - Math.abs(currentLeft / maxLeft)));

            //Create first tween to bring us back to the starting point
            sequence.add('images', 'BasePosition', relativeDuration, 0, {from: {left: currentLeft}, to: {left: isReverse ? 0 : maxLeft}, ease: 'Linear.easeNone'});
            if (isLoop) {
                sequence.add('images', 'BasePosition', duration, 0, {from: {left: isReverse ? maxLeft : 0}, to: {left: isReverse ? 0 : maxLeft}, repeat: isLoop ? -1 : 0, immediateRender: false, ease: 'Linear.easeNone'});
            }

            sequence.onCompleteAll(function () {
                this.handleAction('imageChanged');
            }.bind(this));
            this._sequenceId = sequence.execute({paused: true});
            this.easeStartSequence(this._sequenceId, 1);

            //fix for slider stopping after a few frames - need to do it in order to support old viewer
            if (this.state.$mobile === "mobile") {
                this.clearTimeoutNamed(this.props.id);
                this._nextStopTimeout = this.setTimeoutNamed(this.props.id, function () {
                    this._stopMovement();
                }.bind(this), 2000);
            }

            //A cool trick to ease in an entire timeline
            //timeScaleTween = TweenMax.from(sequence, 0.5, {timeScale:0})
        },
        onWindowTouchStart: function (event) {
            var galleryId = event.target.getAttribute("data-gallery-id") || event.target.parentNode.getAttribute("data-gallery-id");
            if (galleryId !== this.props.id) {
                this._stopMovement();
            }
        }
    };
});
