/**
 * Created by talm on 18/08/15.
 */
define([], function () {
    'use strict';

    /**
     * @class core.mixins.boxSlideShowAutoPlay
     */
    return {
        canAutoPlay: function (autoPlayProp) {
            return this.getSlidesFromChildren(this.props.children).length > 1 && autoPlayProp && this.props.siteData.renderFlags.isPlayingAllowed && !this.props.siteAPI.isZoomOpened();
        },
        toggleAutoPlay: function () {
            this.setState({autoPlay: !this.state.autoPlay}, this.updateAutoPlayState);
        },
        updateAutoPlayState: function () {
            this.clearTimeoutNamed(this.props.id);
            if (this.state.autoPlay) {
                this.setTimeoutNamed(this.props.id, this.autoplayCallback, this.getAutoplayInterval());
            }
        },
        autoplayCallback: function () {
            if (this.props.siteAPI.isZoomOpened()) {
                return;
            }
            this.clickMoveToNextSlide();
            this.updateAutoPlayState();
        },
        getAutoplayInterval: function () {
            var interval = this.props.compProp.autoPlayInterval;
            return Math.floor(interval * 1000.0);
        },
        componentDidMount: function () {
            this.updateAutoPlayState();
        }
    };
});
