define(["wixappsCore/proxies/listProxy"], function (listProxy) {
    'use strict';

    /**
     * @class proxies.FlowList
     * @extends proxies.list
     */
    return {
        mixins: [listProxy],

        getDefaultProps: function () {
            return {
                additionalStyle: {
                    'display': 'block',
                    'whiteSpace': 'normal'
                },
                childAdditionalStyle: {
                    'display': 'inline-block',
                    'width': 'auto'
                }
            };
        }
    };
});
