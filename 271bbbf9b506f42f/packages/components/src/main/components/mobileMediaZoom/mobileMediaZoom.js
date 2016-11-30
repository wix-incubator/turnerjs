define(['lodash', 'core'], function (_, core) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.MobileMediaZoom
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'MobileMediaZoom',
        mixins: [
            mixins.skinBasedComp
        ],

        getInitialState: function() {
            var state = this.props.getPrevAndNextStateFunc();

            _.assign(state, {
                $viewerType: this.props.siteData.isMobileDevice() ? 'mobile' : 'tablet', // 'desktop' only relevant in editor
                $buttonState: ''
            });

            if (this.props.enableInnerScrolling) {
                state.$scrollState = 'scrollEnabled';
            }
            return state;
        },

        componentWillReceiveProps: function (nextProps) {
            if (!this.props.siteData.renderFlags.isZoomAllowed) {
                setTimeout(this.closeMediaZoom, 0);
                return;
            }
            if (this.props.isDataChangedFunc(this.props, nextProps)){
                this.setState(this.props.getPrevAndNextStateFunc());
            }
        },
        createOverlay: function (refs) {
            return core.componentUtils.fullScreenOverlay.createOverlay(refs, {
                siteWidth: this.props.siteData.getSiteWidth(),
                isMobileDevice: this.props.siteData.isMobileDevice(),
                siteScrollingBlocker: this.props.siteAPI.getSiteAspect('siteScrollingBlocker'),
                forceBackground: this.props.siteAPI.forceBackground,
                disableForcedBackground: this.props.siteAPI.disableForcedBackground
            });
        },
        getSkinProperties: function(){

            //TODO: the swipes shouldn't be on the image..
            var childComp = this.props.getChildCompFunc({
                key: this.props.compData.id,
                hideMediaZoomButtons: this.hideButtons,
                showMediaZoomButtons: this.showButtons
            }, {width: 0, height: 0});

            var isWithSingleItem = !this.state.next;

            var refs = {
                "": {
                    onSwipeLeft: this.clickOnNextButton,
                    onSwipeRight: this.clickOnPreviousButton
                },
                itemsContainer: {
                    children: childComp
                },
                xButton: {
                    onClick: this.closeMediaZoom,
                    style: {}
                },
                buttonPrev: {
                    onClick: this.clickOnPreviousButton,
                    style: {}
                },
                buttonNext: {
                    onClick: this.clickOnNextButton,
                    style: {}
                }
            };

            refs = this.props.enableInnerScrolling ? refs : this.createOverlay(refs);

            // hide arrows if we got no gallery items
            if (isWithSingleItem || this.props.enableInnerScrolling) {
                refs.buttonNext.style.display = 'none';
                refs.buttonPrev.style.display = 'none';
            }

            return refs;
        },

        clickOnNextButton: function (event) {
            this.showButtons();
            this.props.actualNavigateToItemFunc(this.state.next);
            if (event) {

                // Swipe is recognized by Touchy.js which clones the initial touch event and pass it in the onSwipe callback
                // In the process we lose functions from the event prototype like 'preventDefault' and 'stopPropagation'
                if (event.preventDefault) { event.preventDefault(); }
                if (event.stopPropagation) { event.stopPropagation(); }
            }
        },

        closeMediaZoom: function () {
            if (this.props.closeFunction) {
                this.props.closeFunction();
            } else {
                this.props.siteAPI.navigateToPage({pageId: this.props.rootNavigationInfo.pageId});
            }
        },

        /**
         * Handle left arrow click
         */
        clickOnPreviousButton: function (event) {
            this.showButtons();
            this.props.actualNavigateToItemFunc(this.state.prev);
            if (event) {

                // Swipe is recognized by Touchy.js which clones the initial touch event and pass it in the onSwipe callback
                // In the process we lose functions from the event prototype like 'preventDefault' and 'stopPropagation'
                if (event.preventDefault) { event.preventDefault(); }
                if (event.stopPropagation) { event.stopPropagation(); }
            }
        },

        /**
         * Hide buttons ( arrows / close button )
         */
        hideButtons: function() {
            this.setState({$buttonState: 'hideButtons'});
        },

        /**
         * Show buttons ( arrows / close button )
         */
        showButtons: function() {
            this.setState({$buttonState: ''});
        },

        componentDidMount: function() {
            // block site scrolling
            this.props.siteAPI.enterFullScreenMode({scrollable: this.props.enableInnerScrolling});//eslint-disable-line react/no-did-mount-callbacks-from-props
        },

        componentWillUnmount: function () {
            // enable site scrolling
            this.props.siteAPI.exitFullScreenMode();
        }
    };
});
