define(["react", "wixappsCore/proxies/mixins/boxProxy"], function (React, boxProxy) {
    'use strict';

    /**
     * @class proxies.HBox
     * @extends proxies.mixins.boxProxy
     */
    return {
        mixins: [boxProxy],
        getChildrenOrientation: function () {
            return "horizontal";
        },

        getReactClass: function () {
            return React.DOM.div;
        }
    };
});
