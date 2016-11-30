define(["react", "wixappsCore/proxies/mixins/boxProxy"], function (React, boxProxy) {
    'use strict';

    /**
     * @class proxies.VBox
     * @extends proxies.mixins.boxProxy
     */
    return {
        mixins: [boxProxy],
        getChildrenOrientation: function () {
            return "vertical";
        },

        getReactClass: function () {
            return React.DOM.div;
        }
    };
});
