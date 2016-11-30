define(['lodash', 'react'], function (_, React) {
    'use strict';

    var zIndex = Math.pow(2, 31) - 2; //NOTE: z-index.scss
    return React.createClass({
        displayName: 'blockingLayer',
        getStyle: function () {
            return _.merge({
                display: 'inline-block',
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: zIndex
            }, this.props.siteData.renderFlags.blockingLayer || this.props.siteData.renderFlags.blockingPopupLayer);
        },
        render: function () {
            return React.DOM.div({
                style: this.getStyle()
            });
        }
    });
});
