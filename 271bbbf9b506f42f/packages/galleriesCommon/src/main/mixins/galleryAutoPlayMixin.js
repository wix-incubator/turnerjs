define(['santaProps'], function (santaProps) {
    'use strict';

    function hasItems(compData) {
        return compData.items.length > 0;
    }

    function canAutoPlay(compData, compProp) {
        return hasItems(compData) && compProp.autoplay;
    }

    /**
     * @class core.mixins.galleryAutoPlayMixin
     */
    return {
        propTypes: {
            compProp: santaProps.Types.Component.compProp.isRequired,
            compData: santaProps.Types.Component.compData.isRequired,
            isZoomOpened: santaProps.Types.isZoomOpened.isRequired,
            id: santaProps.Types.Component.id.isRequired,
            isPlayingAllowed: santaProps.Types.RenderFlags.isPlayingAllowed
        },

        getInitialState: function () {
            var galleryCanAutoPlay = canAutoPlay(this.props.compData, this.props.compProp);
            return {
                $showAutoPlayButton: this.shouldShowAutoPlay() ? "showPlayButton" : "hidePlayButton",
                shouldAutoPlay: galleryCanAutoPlay,
                $slideshow: (galleryCanAutoPlay && !this.props.isZoomOpened && this.props.isPlayingAllowed) ? "autoplayOn" : "autoplayOff"
            };
        },

        shouldShowAutoPlay: function () {
            if (this.props.compProp.isHidden) {
                return false;
            }
            return hasItems(this.props.compData) && this.props.compProp.showAutoplay;
        },

        toggleAutoPlay: function () {
            if (!hasItems(this.props.compData)) {
                return;
            }
            var newState = "autoplayOff";
            if (this.state.$slideshow === "autoplayOff") {
                if (!this.props.isPlayingAllowed) {
                    return;
                }

                newState = "autoplayOn";
            }
            this.setState({
                shouldAutoPlay: !this.state.shouldAutoPlay,
                $slideshow: newState
            }, this.updateAutoplayState);

        },
        componentWillReceiveProps: function (nextProps) {
            var shouldAutoPlay = (this.state.shouldAutoPlay && !nextProps.isZoomOpened && nextProps.isPlayingAllowed) ? 'autoplayOn' : 'autoplayOff';
            if (shouldAutoPlay !== this.state.$slideshow) {
                this.setState({
                    '$slideshow': shouldAutoPlay
                }, this.updateAutoplayState);
            }
        },
        updateAutoplayState: function () {
            this.clearTimeoutNamed(this.props.id);
            if (this.state.$slideshow === "autoplayOn") {
                this.setTimeoutNamed(this.props.id, this.autoplayCallback, this.getAutoplayInterval());
            }
        },
        autoplayCallback: function () {
            if (this.props.isZoomOpened) {
                return;
            }
            if (this.props.compProp.autoPlayDirection === "LTR") {
                this.prev();
            } else {
                this.next();
            }
        },
        getAutoplayInterval: function () {
            var interval = this.props.compProp.autoplayInterval;
            return Math.floor(interval * 1000.0);
        }
    };
});
