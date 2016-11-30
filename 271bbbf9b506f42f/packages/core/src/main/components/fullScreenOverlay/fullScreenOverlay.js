define(['lodash', 'react'], function (_, React) {
    'use strict';

    return React.createClass({
        displayName: 'fullScreenOverlay',
        propTypes: {
            siteWidth: React.PropTypes.number.isRequired,
            siteScrollingBlocker: React.PropTypes.object.isRequired,
            forceBackground: React.PropTypes.func.isRequired,
            disableForcedBackground: React.PropTypes.func.isRequired,
            isMobileDevice: React.PropTypes.bool.isRequired,
            overlayBackgroundOpacity: React.PropTypes.string
        },
        statics: {
            createOverlay: function (skinProperties, overlayProps) {
                var wrapperFactory = React.createFactory(this);
                skinProperties[""] = _.assign({}, skinProperties[""], {wrap: [wrapperFactory, overlayProps]});
                return skinProperties;
            }
        },
        getOverlayBackground: function () {
            var opacity = this.props.overlayBackgroundOpacity || 1;
            return 'rgba(0, 0, 0, ' + opacity + ')';
        },

        componentDidMount: function () {
            this.props.siteScrollingBlocker.setSiteScrollingBlocked(this, true);
            if (this.props.isMobileDevice) {
                this.props.forceBackground(this.getOverlayBackground());
            }
        },

        componentWillUnmount: function () {
            this.props.siteScrollingBlocker.setSiteScrollingBlocked(this, false);
            if (this.props.isMobileDevice) {
                this.props.disableForcedBackground();
            }
        },

        render: function () {
            return React.createElement('div', null,
                React.createElement('div',
                    {
                        className:"fullScreenOverlay",
                        key: "fullScreenOverlay"
                    },
                    React.createElement('div',
                        {
                            className: "fullScreenOverlayContent",
                            style: {
                                width: this.props.siteWidth,
                                background: this.getOverlayBackground()
                            },
                            key: "fullScreenOverlayContent"
                        },
                        this.props.children
                    )));
        }
    });
});
