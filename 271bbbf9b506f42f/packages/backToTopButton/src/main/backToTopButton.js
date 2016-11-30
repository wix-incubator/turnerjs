define(['lodash', 'core', 'santaProps'], function (_, core, santaProps) {
    'use strict';
    var mixins = core.compMixins;
    var BACK_TO_TOP_DISTANCE = 1136;
    var BACK_TO_TOP_HIDE_DELAY = 2500;

    return {
        displayName: 'BackToTopButton',
        mixins: [mixins.skinBasedComp],

        propTypes:{
            windowScrollEventAspect: santaProps.Types.SiteAspects.windowScrollEvent.isRequired,
            isZoomed: santaProps.Types.mobile.isZoomed,
            isMobileDevice: santaProps.Types.Device.isMobileDevice
        },

        statics: {
            useSantaTypes: true
        },

        getInitialState: function () {
            return {visible: false};
        },

        componentWillMount: function () {
            var scrollAspect = this.props.windowScrollEventAspect;
            scrollAspect.registerToScroll(this);
        },

        componentDidMount: function() {
            this.hideButton = _.debounce(
                _.partial(this.setState, {visible: false}),
                BACK_TO_TOP_HIDE_DELAY,
                {'leading': false, 'trailing': true});
        },

        onScroll: function (position, direction) {
            var isMobileDeviceAndZoomed = this.props.isZoomed && this.props.isMobileDevice;
            if (direction === 'UP' && position.y > BACK_TO_TOP_DISTANCE && !isMobileDeviceAndZoomed) {
                this.hideButton();
                if (!this.state.visible){
                    this.setState({visible: true});
                }
            }
        },

        getSkinProperties: function () {
            return {
                bg: {
                    className: this.classSet({visible: this.state.visible})
                }
            };
        }
    };
});
