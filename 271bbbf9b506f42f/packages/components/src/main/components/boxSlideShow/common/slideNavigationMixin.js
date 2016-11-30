define(['react', 'lodash', 'core', 'components/components/boxSlideShow/common/boxSlideShowAutoPlay'],
    function (React, _, core, boxSlideShowAutoPlay) {
        'use strict';

        var mixins = core.compMixins;
        var NAVIGATION_DOTS_FLEX_ALIGNMENT = {
            center: 'center',
            left: 'flex-start',
            right: 'flex-end'
        };
        var boxSlideShowCommon = core.componentUtils.boxSlideShowCommon;

        function getNavigationDotsMaxSize(skinExports, navigationDotsSize) {
            var selectedButtonSizeRatio = skinExports.selectedButtonSizeRatio || 1;
            return Math.floor(navigationDotsSize * selectedButtonSizeRatio);
        }

        function getPublicState(state, propsInfo) {
            if (!state) {
                return {
                    currentIndex: 0,
                    autoPlay: propsInfo.props.autoPlay || false
                };
            }

            return _.pick(state, ['currentIndex', 'autoPlay']);
        }

        /**
         * @class core.mixins.slideNavigationMixin
         */
        return {
            mixins: [mixins.skinBasedComp, mixins.timeoutsMixin, boxSlideShowAutoPlay, mixins.animationsMixin, mixins.compStateMixin(getPublicState)],
            getInitialState: function () {
                this.reverse = false;
                this.isDirectionLeftToRight = this.props.compProp.direction === "LTR";
                return _.assign(getPublicState(null, {props: this.props.compProp}), {
                    isInTransition: false,
                    autoPlay: this.canAutoPlay(this.props.compProp.autoPlay)
                });
            },
            setCurrentSlideAndRegisterRelayout: function(newSlideIndex, shouldForceSetState, shouldTransitionOccur){
                if (this.state.isInTransition && !shouldForceSetState){
                    return;
                }

                this.registerReLayout();
                this.setState({currentIndex: newSlideIndex, isInTransition: shouldTransitionOccur});
                this.handleAction("change");
            },
            componentWillReceiveProps: function (nextProps) {
                if (this.props.compProp.direction !== nextProps.compProp.direction) {
                    this.isDirectionLeftToRight = nextProps.compProp.direction === "LTR";
                }
                if (!nextProps.children) {
                    return;
                }

                var currChildrenAmount = this.getSlidesFromChildren(this.props.children).length;
                var newChildrenAmount = this.getSlidesFromChildren(nextProps.children).length;

                if (newChildrenAmount < currChildrenAmount) { //slide removed
                    var nextChildrenOrder = _.pluck(nextProps.children, 'ref');
                    var currChildrenOrder = _.pluck(this.props.children, 'ref');
                    var currSelected = currChildrenOrder[this.state.currentIndex];
                    var diffBetweenChildren = _.difference(currChildrenOrder, nextChildrenOrder);
                    var indexOfSlideThatWasRemoved = _.indexOf(currChildrenOrder, diffBetweenChildren[0]);

                        var newIndex = this.state.currentIndex > 0 ? this.state.currentIndex - 1 : 0;
                        if (_.includes(nextChildrenOrder, currSelected)) {
                            newIndex = nextChildrenOrder.indexOf(currSelected);
                        } else if (newIndex >= newChildrenAmount) {
                            newIndex = newChildrenAmount - 1;
                        }
                        var isCurrentStateOutOfBounds = this.state.currentIndex >= newChildrenAmount;
                        if (this.state.currentIndex !== newIndex) {
                            var isSelectedSlideRemoved = this.state.currentIndex === indexOfSlideThatWasRemoved;
                            this.setCurrentSlideAndRegisterRelayout(newIndex, isCurrentStateOutOfBounds, isSelectedSlideRemoved);
                        }
                }

                var canAutoPlay = this.canAutoPlay(nextProps.compProp.autoPlay);
                if (canAutoPlay !== this.state.autoPlay) {
                    this.setState({autoPlay: canAutoPlay}, this.updateAutoPlayState);
                    this.handleAction(canAutoPlay ? "autoplayOn" : "autoplayOff");
                }
            },
            createDotsNavigationButtons: function () {
                var slides = this.getSlidesFromChildren(this.props.children);
                var skinExports = this.getSkinExports();

                var navigationDots = [];
                _.forEach(slides, function (slide, index) {
                    var isSelected = this.state.currentIndex === index;
                    var navigationDotsSize = isSelected ? getNavigationDotsMaxSize(skinExports, this.props.compProp.navigationDotsSize) :
                        this.props.compProp.navigationDotsSize;

                    var params = {
                        className: this.classSet({
                            'navigation-dot': true,
                            'selected': isSelected
                        }),
                        style: {
                            width: navigationDotsSize,
                            height: navigationDotsSize,
                            marginRight: this.props.compProp.navigationDotsGap / 2,
                            marginLeft: this.props.compProp.navigationDotsGap / 2
                        }
                    };
                    navigationDots.push(React.DOM.div({
                        className: this.classSet({
                            'navigation-dot-wrapper': true
                        }),
                        onClick: this.moveToSlide.bind(this, index),
                        children: React.DOM.ul(params)
                    }));
                }, this);

                return navigationDots;
            },
            getDotsNavigationWrapperStyle: function(){
                var skinExports = this.getSkinExports();
                var navigationDotsMaxSize = getNavigationDotsMaxSize(skinExports, this.props.compProp.navigationDotsSize);

                return {
                    bottom: this.props.compProp.navigationDotsMargin - 0.5 * navigationDotsMaxSize,
                    justifyContent: this.getDotsAlignment(),
                    WebkitJustifyContent: this.getDotsAlignment()
                };
            },
            moveNextSlide: function (callback) {
                if (this.state.isInTransition){
                    return;
                }
                if (callback) {
                    var slideShowComponentAspect = this.props.siteAPI.getSiteAspect('SlideShowComponentAspect');
                    slideShowComponentAspect.registerOnSlideChangeComplete(callback);
                }

                this.reverse = false;
                var nextIndex = boxSlideShowCommon.getNextSlideIndex(this.getSlidesFromChildren(this.props.children), this.state.currentIndex);
                this.setCurrentSlideAndRegisterRelayout(nextIndex, false, true);
            },
            movePreviousSlide: function (callback) {
                if (this.state.isInTransition){
                    return;
                }

                if (callback) {
                    var slideShowComponentAspect = this.props.siteAPI.getSiteAspect('SlideShowComponentAspect');
                    slideShowComponentAspect.registerOnSlideChangeComplete(callback);
                }

                this.reverse = true;
                var prevIndex = boxSlideShowCommon.getPrevSlideIndex(this.getSlidesFromChildren(this.props.children), this.state.currentIndex);
                this.setCurrentSlideAndRegisterRelayout(prevIndex, false, true);
            },
            isSlideDirectionReversed: function (newIndex) {
                var currIndex = this.state.currentIndex;
                if (newIndex > currIndex) {
                    return currIndex === 0 && newIndex === this.getSlidesFromChildren(this.props.children).length - 1;
                }
                return !(newIndex === 0 && currIndex === this.getSlidesFromChildren(this.props.children).length - 1);
            },

            moveToSlide: function (index, callback) {
                if (index === this.state.currentIndex || this.state.isInTransition) {
                    return;
                }
                if (callback && _.isFunction(callback)) {
                    var slideShowComponentAspect = this.props.siteAPI.getSiteAspect('SlideShowComponentAspect');
                    slideShowComponentAspect.registerOnSlideChangeComplete(callback);
                }

                var slides = this.getSlidesFromChildren(this.props.children);
                if (_.isNumber(index) && index >= 0 && index < slides.length) {
                    this.reverse = this.isSlideDirectionReversed(index);
                    this.setCurrentSlideAndRegisterRelayout(index, false, true);

                }
            },
            getSlidesFromChildren: function (children) {
                return boxSlideShowCommon.getSlidesFromChildrenByProps(children);
            },

            getShownOnAllSlidesFromChildren: function (children) {
                return boxSlideShowCommon.getShownOnAllSlidesFromChildrenByProps(children);
            },

            onMouseEnter: function () {
                if (this.state.autoPlay && this.props.compProp.pauseAutoPlayOnMouseOver) {
                    this.setState({autoPlay: false}, this.updateAutoPlayState);
                }
            },
            onMouseLeave: function () {
                if (this.props.compProp.pauseAutoPlayOnMouseOver) {
                    this.setState({autoPlay: this.canAutoPlay(this.props.compProp.autoPlay)}, this.updateAutoPlayState);
                }
            },
            getTransitionDuration: function () {
                return this.props.compProp.transition === 'NoTransition' ? 0 : this.props.compProp.transDuration;
            },
            transitionCallback: function(){
                this.setState({isInTransition: false});
                var slideShowComponentAspect = this.props.siteAPI.getSiteAspect('SlideShowComponentAspect');
                slideShowComponentAspect.reportSlideChange(this.props.id);
            },
            getArrowButtonStyle: function(isPrev){
                var compProp = this.props.compProp;
                var skinExports = this.getSkinExports();
                var arrowWidthToHeightRatio = skinExports.arrowWidthToHeightRatio || 1;
                var arrowWidth = compProp.navigationButtonSize / arrowWidthToHeightRatio;

                var offset = compProp.navigationButtonMargin - 0.5 * arrowWidth;
                var position = isPrev ? {left: offset} : {right: offset};

                return _.assign(position, {
                    width: arrowWidth
                });
            },
            getNavigationArrowsStyle: function(){
                var skinExports = this.getSkinExports();
                var arrowWidthToSizeRatio = skinExports.arrowWidthToSizeRatio || 1;
                return {
                    top: 'calc(50% - ' + (this.props.compProp.navigationButtonSize * arrowWidthToSizeRatio) + 'px)'
                };
            },
            getDotsAlignment: function(){
                return NAVIGATION_DOTS_FLEX_ALIGNMENT[this.props.compProp.navigationDotsAlignment];
            },

            clickMoveToNextSlide: function () {
               this.moveNextSlide();
            },

            clickMoveToPreviousSlide: function () {
                this.movePreviousSlide();
            }
            //setSlide: function (slide, callback) {
            //    this.moveToSlide(slide, callback);
            //}
        };
    });
