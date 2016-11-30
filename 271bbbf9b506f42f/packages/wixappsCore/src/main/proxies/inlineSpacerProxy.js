define(["react", "wixappsCore/proxies/mixins/baseProxy"], function (React, baseProxy) {
    'use strict';

    /**
     * @class proxies.spacers.inlineSpacer
     * @extends proxies.mixins.baseProxy
     * @property {proxy.properties} props
     */
    return {
        mixins: [baseProxy],
        getCustomStyle: function () {
            var size = this.getCompProp("size");
            return {
                "wordSpacing": size,
                display: "inline"
            };
        },
        renderProxy: function () {
            var childCompProps = this.getChildCompProps();

            return React.DOM.div(childCompProps, ' ');
        }
    };
});

