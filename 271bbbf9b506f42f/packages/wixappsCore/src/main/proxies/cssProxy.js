define(["lodash", "react", "wixappsCore/proxies/mixins/baseCompositeProxy"], function (_, React, baseCompositeProxy) {
    'use strict';

    /**
     * @class proxies.Css
     * @extends proxies.mixins.baseComposite
     */
    return {
        mixins: [baseCompositeProxy],

        renderProxy: function () {
            var childrenDefinitions = this.getCompProp("items");

            var children = _.map(childrenDefinitions, function (childDef, i) {
                return this.renderChildProxy(childDef, i);
            }, this);

            var props = this.getChildCompProps();

            return React.DOM.div(props, children);
        }
    };
});
