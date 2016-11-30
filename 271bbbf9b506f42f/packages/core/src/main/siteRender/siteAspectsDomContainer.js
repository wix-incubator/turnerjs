define(['lodash', 'react'], function (_, React) {
    'use strict';

    return React.createClass({
        displayName: 'siteAspectsDomContainer',
        render: function () {

            var containerStyle = {};
            if (this.props.isMobileView) {
                _.assign(containerStyle, {width: this.props.siteWidth});
            }

            return React.DOM.div({
                className: 'siteAspectsContainer',
                style: containerStyle
            }, this.props.aspectsCompsFunc());
        }
    });
});
