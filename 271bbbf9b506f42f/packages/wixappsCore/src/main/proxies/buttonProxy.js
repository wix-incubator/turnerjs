define(["wixappsCore/proxies/mixins/siteButtonProxy", "lodash"], function (siteButtonProxy, _) {
    'use strict';

    /**
     * @class proxies.Button
     * @extends proxies.mixins.siteButton
     */
    return {
        mixins: [siteButtonProxy],
        transformSkinProperties: function (refData) {
            var rootProps = {
                'data-proxy-name': 'Button',
                onClick: this.handleViewEvent
            };
            refData[''] = _.merge({}, refData[''], rootProps);

            return refData;
        },

        getAdditionalButtonStyle: function(){
            var additionalStyle = {};
            var label = this.getCompProp("label") || this.proxyData;
            if (label === '') {
                additionalStyle.display = 'none';
            }
            return additionalStyle;
        },

        getDefaultLabel: function(){
            return 'Submit';
        }
    };
});
