define(['lodash', 'core', 'react', 'santaProps'], function (_, /** core */ core, React, santaProps) {
    'use strict';

    var mixins = core.compMixins;

    function getInitialState(isMobile) {
        var state = {};
        if (isMobile) {
            state.$mobile = 'mobileView';
        }
        return state;
    }

    /**
     * @class components.WixContainer
     * @extends {core.skinBasedComp}
     */
    return {
        mixins: [mixins.skinBasedComp],

        propTypes: {
            windowScrollEventAspect: santaProps.Types.SiteAspects.windowScrollEvent.isRequired,
            compActions: santaProps.Types.Component.compActions.isRequired,
            isMobileView: santaProps.Types.isMobileView,
            pageStub: React.PropTypes.bool
        },

        getInitialState: function () {
            if (this.props.compActions.scroll) {
                this.props.windowScrollEventAspect.registerToScroll(this);
            }

            return getInitialState(this.props.isMobileView);
        },

        componentWillReceiveProps: function (nextProps) {
            if (this.props.compActions.scroll && _.isUndefined(nextProps.compActions.scroll)) {
                this.props.windowScrollEventAspect.unregisterToScroll(this);
            }
            if (nextProps.compActions.scroll && _.isUndefined(this.props.compActions.scroll)) {
                nextProps.windowScrollEventAspect.registerToScroll(this);
            }
        },

        onScroll: function (position, direction) {
            var evtData = {
                left: position.x,
                top: position.y,
                direction: direction
            };
            this.handleAction('scroll', evtData);
        },

        shouldComponentUpdatePage: function (nextProps) {
            //TODO: refactor this so that the stub will render only once
            return this.isComponentActive(nextProps) || nextProps.pageStub;
        }
    };
});
