define([
    'zepto',
    'react',
    'lodash',
    'core',
    'components/components/mediaZoom/svgShapesData',
    'reactDOM'
], function($, React, _, /** core */ core, svgShapesData, ReactDOM) {

    'use strict';

    var mixins = core.compMixins;

    /**
     * The widthSpacer and heightSpacer are passed to the mediaZoomCalculations.getDesktopViewDimensions or
     * mediaZoomCalculations.getNonOptimizedViewDimensions function to calculate the max width/height we have
     * for our image
     * widthSpacer is basically the width of the navigation arrows
     * heightSpacer is used to add some padding to the top/bottom
     */

    var desktopSpacers = {
        width: 240,
        height: 60
    };

    var nonDesktopSpacers = {
        width: 0,
        height: 0
    };

    function isClickedNotLink(event) {
        return event && !event.target.href;
    }

    /**
     * @class components.MediaZoom
     * @extends {core.skinBasedComp}
     * @extends {core.animationsMixin}
     * @extends {components.mediaZoomMixin}
     */
    return {
        displayName: 'MediaZoom',
        mixins: [
            mixins.skinBasedComp,
            mixins.animationsMixin,
            mixins.skinInfo,
            core.compMixins.galleryImageExpandedActionMixin
        ],

        getSvg: function (svgShapeName) {
            var svgShape = svgShapesData[svgShapeName];
            var svgProps = _.clone(svgShape.svg);
            var classNamePrefix = this.props.styleId + '_';
            _.assign(svgProps, {
                    className: classNamePrefix + svgShape.svg.className,
                    dangerouslySetInnerHTML: {__html: svgShape.content}
                }
            );

            return React.DOM.svg(svgProps);
        },

        getInitialState: function () {
            this.isAnimating = false;
            this.shouldUpdateSizeOnLayout = true;
            // identifying device for appPart zoom on non-optimised sites
            var deviceType = 'desktop';
            if (this.props.siteData.isMobileDevice()) {
                deviceType = 'mobile';
            } else if (this.props.siteData.isTabletDevice()) {
                deviceType = 'tablet';
            }

            return _.assign({
                $buttonsState: 'showButtons',
                $device: deviceType
            }, this.props.getPrevAndNextStateFunc());
        },

        componentWillReceiveProps: function (nextProps) {
            if (!this.props.siteData.renderFlags.isZoomAllowed) {
                setTimeout(this.closeMediaZoom, 0);
                return;
            }

            var isDataChanged = this.props.isDataChangedFunc(this.props, nextProps);
            this.shouldUpdateSizeOnLayout = isDataChanged;
            if (isDataChanged){
                this.setState(this.props.getPrevAndNextStateFunc());
            }
        },

        getSkinProperties: function () {
            var isWithMultipleItems = !!this.state.next;
            var buttonsStyle = isWithMultipleItems ? {} : {display: 'none'};
            var spacersToUse = this.props.siteData.isMobileDevice() || this.props.siteData.isTabletDevice() ? nonDesktopSpacers : desktopSpacers;

            var childComp = this.props.getChildCompFunc({
                toggleButtons: this.toggleButtons,
                goToNextItem: this.clickOnNextButton,
                goToPrevItem: this.clickOnPreviousButton
            }, spacersToUse);

            var refs = {
                '': {
                    'data-width-spacer': spacersToUse.width,
                    'data-height-spacer': spacersToUse.height
                },
                blockingLayer: {
                    onClick: this.onBlockingLayerClick
                },
                xButton: {
                    onClick: this.closeMediaZoom,
                    children: [this.getSvg('buttonClose')]
                },
                dialogBox: {
                    onClick: this.handleDialogBoxClick
                },
                itemsContainer: {
                    children: childComp
                },
                buttonPrev: {
                    onClick: this.clickOnPreviousButton,
                    style: buttonsStyle,
                    children: [this.getSvg('buttonPrevious')]
                },
                buttonNext: {
                    onClick: this.clickOnNextButton,
                    style: buttonsStyle,
                    children: [this.getSvg('buttonNext')]
                }
            };

            if (this.props.siteData.isMobileDevice() || this.props.siteData.isTabletDevice()) {
                refs.blockingLayer.onSwipeLeft = this.clickOnNextButton;
                refs.blockingLayer.onSwipeRight = this.clickOnPreviousButton;
            }
            return refs;
        },

        onBlockingLayerClick: function (event) {
            if (isClickedNotLink(event)) {
                this.closeMediaZoom();
                event.preventDefault();
                event.stopPropagation();
            }
        },

        componentDidLayout: function () {
            var dialogBoxSize = this.props.getBoxDimensionsFunc();
            var cssForZepto = {
                width: dialogBoxSize.dialogBoxWidth,
                height: dialogBoxSize.dialogBoxHeight,
                'margin-top': dialogBoxSize.marginTop,
                'margin-left': dialogBoxSize.marginLeft,
                padding: dialogBoxSize.padding
            };
            var cssForReact = {
                width: dialogBoxSize.dialogBoxWidth,
                height: dialogBoxSize.dialogBoxHeight,
                marginTop: dialogBoxSize.marginTop,
                marginLeft: dialogBoxSize.marginLeft,
                padding: dialogBoxSize.padding
            };

            if (!this.shouldUpdateSizeOnLayout) {
                $(ReactDOM.findDOMNode(this.refs.dialogBox)).css(cssForZepto);
                return;
            }
            this.shouldUpdateSizeOnLayout = false;

            var self = this;
            var sequence = this.sequence();
            sequence
                .add('dialogBox', 'BaseDimensions', 0.5, 0, {to: cssForReact})
                .add('itemsContainer', 'FadeIn', 0.5, 0)
                .onCompleteAll(function () {
                    self.unBlockNavigation();
                    self.handleImageExpandedAction();
                })
                .execute();
        },

        clickOnNextButton: function (event) {
            this.navigateToOtherPageWithAnimations(this.state.next);
            if (event){
                event.preventDefault();
                event.stopPropagation();
            }
        },

        /**
         * Handle left arrow click
         */
        clickOnPreviousButton: function (event) {
            this.navigateToOtherPageWithAnimations(this.state.prev);
            if (event){
                event.preventDefault();
                event.stopPropagation();
            }
        },

        /**
         * Handles navigation click ( should not navigate if navigation is blocked )
         */
        navigateToOtherPageWithAnimations: function (itemId) {
            if (this.isNavigationBlocked()) {
                return;
            }
            var self = this;
            this.blockNavigation();
            this.animate('itemsContainer', 'FadeOut', 0.5, 0, null, {
                onComplete: function () {
                    self.props.actualNavigateToItemFunc(itemId);
                }
            });
        },

        closeMediaZoom: function () {
            if (this.props.closeFunction){
                this.props.closeFunction();
            } else {
                this.props.siteAPI.navigateToPage({pageId: this.props.rootNavigationInfo.pageId});
            }
        },

        /**
         * Handles dialog box clicks
         * @returns {boolean}
         * @param event
         */
        handleDialogBoxClick: function(event) {
            // allow links to passthrough ( some media items come with links )
            if (isClickedNotLink(event)) {
                event.preventDefault();
                event.stopPropagation();
                this.props.siteAPI.passClickEvent(event);
            }
        },

        /**
         * Unblocks navigations ( when finished animating )
         */
        unBlockNavigation: function () {
            this.isAnimating = false;
        },

        /**
         * Blocks navigation arrows when animating
         */
        blockNavigation: function () {
            this.isAnimating = true;
        },

        /**
         * Checks if navigation is blocked
         */
        isNavigationBlocked: function () {
            return this.isAnimating;
        },

        componentDidMount: function () {
            // Disable site scrolling
            this.props.siteAPI.enterFullScreenMode();//eslint-disable-line react/no-did-mount-callbacks-from-props
        },

        componentWillUnmount: function () {
            // Enable site scrolling
            this.props.siteAPI.exitFullScreenMode();
        },

        toggleButtons: function(event) {
            var buttonsNewState = this.state.$buttonsState === 'showButtons' ? 'hideButtons' : 'showButtons';
            this.setState({$buttonsState: buttonsNewState});
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    };
});
