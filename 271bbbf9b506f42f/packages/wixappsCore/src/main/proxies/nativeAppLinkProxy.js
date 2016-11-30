define([
    'react',
    'wixappsCore/proxies/appLinkProxy'
], function (   
    React,
    appLinkProxy
) {
    'use strict';

    var reactClass = React.createFactory(
        React.createClass({
            displayName: 'FlexboxContainerAnchor',
            render: function () {
                return React.DOM.div(
                    this.props,
                    React.DOM.a({
                        'data-page-item-context': this.props.pathToItems,
                        href: this.props.href,
                        ref: 'a',
                        style: { // The style is required to avoid issues with flex-box children.
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            width: '100%'
                        },
                        target: this.props.target
                    }, this.props.children));
            }
        }));

    return {
        mixins: [appLinkProxy],
        getCustomZoomReactClass: function () {
            return reactClass;
        }
    };
});
