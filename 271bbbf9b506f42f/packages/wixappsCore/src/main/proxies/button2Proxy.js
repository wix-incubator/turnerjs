define(["wixappsCore/proxies/mixins/siteButtonProxy", "lodash"], function (siteButtonProxy, _) {
    'use strict';

    /**
     * @class proxies.Button2
     * @extends proxies.mixins.siteButton
     */
    return {
        mixins: [siteButtonProxy],

        transformSkinProperties: function (refData) {
            var proxyStyle = this.getProxyStyle();
            var height = proxyStyle.height || this.getCompProp("height") || 30;
            var rootProps = {
                onClick: this.handleViewEvent,
                'data-proxy-name': 'Button2',
                style: {height: height, "maxWidth": proxyStyle.width}
            };

            if (this.getCompProp('shouldNotExceedParentWidth')) {
                // A cross-browser CSS-trick to make the actual width be the minimum of `max-width` and `width`.
                rootProps.style.width = '100%';

                // Tell the button's layout to not measure and overwrite the inline width from above, but use the actual
                // width as is.
                rootProps['data-should-prevent-width-measurement'] = true;
            }

            refData[''] = _.merge({}, refData[''], rootProps);

            var style = {overflow: "hidden"};
            refData.link.style = _.merge({}, refData.link.style, style);

            return refData;
        },

        getDefaultLabel: function () {
            return '';
        }
    };
});
