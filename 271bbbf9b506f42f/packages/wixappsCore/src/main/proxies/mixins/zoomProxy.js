define(["lodash", "react", "wixappsCore/proxies/mixins/boxProxy"], function (_, React, boxProxy) {
    'use strict';

    var anchorInPositionAbsoluteWithSiblingsClass = React.createClass({
        displayName: 'AnchorInPositionAbsoluteWithSiblings',

        onClick: function (event) {
            event.target = this.refs.a;
        },

        render: function () {
            var props = _.omit(this.props, 'style', 'href');
            // anchor doesn't get the click so the div catches it and change the target
            // special thanks to Avi Marcus
            props.onClick = this.onClick;
            // set the cursor on the div to pointer because the anchor doesn't get it. stupid anchor.
            props.style = _.merge({}, this.props.style, {cursor: 'pointer'});

            return React.DOM.div(props,
                React.DOM.a({
                    ref: "a",
                    href: this.props.href,
                    'data-page-item-context': props.pathToItems,
                    target: props.target,
                    style: {
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        left: 0,
                        bottom: 0
                    }}),
                props.children);
        }
    });
    var anchorInPositionAbsoluteWithSiblings = React.createFactory(anchorInPositionAbsoluteWithSiblingsClass);

    /**
     * @class proxies.mixins.zoomProxy
     * @extends proxies.mixins.boxProxy
     * @property {proxy.properties} props
     */
    return {
        mixins: [boxProxy],
        getChildrenOrientation: function () {
            return this.getCompProp('orientation') || 'vertical';
        },

        getReactClass: function () {
            return this.getCustomZoomReactClass ? this.getCustomZoomReactClass() : anchorInPositionAbsoluteWithSiblings;
        }
    };
});
