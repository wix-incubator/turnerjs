define(['react'], function (React) {
    'use strict';

    return React.createClass({
        displayName: 'extraSiteHeight',
        render: function () {
            return React.DOM.div({
                style: {
                    height: this.props.siteData.renderFlags.extraSiteHeight,
                    position: 'relative'
                }
            });
        }
    });
});
