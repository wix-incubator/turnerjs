define(["lodash", "react", "wixappsCore/proxies/mixins/baseCompositeProxy"], function (_, React, baseCompositeProxy) {
    'use strict';

    /**
     * @class proxies.Stack
     * @extends proxies.mixins.baseCompositeProxy
     */
    return {
        mixins: [baseCompositeProxy],

        getCustomStyle: function () {
            return {
                position: "relative"
            };
        },

        renderProxy: function () {

            var childrenDefinitions = this.getCompProp("items");

            var children = _.map(childrenDefinitions, function (childDef, i) {
                var childLayoutDef = this.getCompProp('layout', childDef);
                var positionProp = (i === 0 && this.getCompProp('stackType') !== 'layout') ? 'static' : 'absolute';
                var childLayout = {
                    position: positionProp,
                    top: childLayoutDef.top || '0px',
                    left: childLayoutDef.left || '0px'
                };

                return this.renderChildProxy(childDef, i, childLayout);
            }, this);

            var props = this.getChildCompProps();
            props['data-proxy-name'] = 'Stack';

            return React.DOM.div(props, children);
        }
    };
});
