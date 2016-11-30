define(["react", "utils", "wixappsCore/core/typesConverter", "wixappsCore/proxies/mixins/boxProxy"], function (React, /** utils */utils, /** wixappsCore.typesConverter */typesConverter, boxProxy) {
    'use strict';

    /**
     * @class proxies.Link
     * @extends proxies.mixins.boxProxy
     */
    return {
        mixins: [boxProxy],

        getChildrenOrientation: function () {
            return this.getCompProp("orientation") || "vertical";
        },

        getReactClass: function () {
            return React.DOM.a;
        },

        getCustomProps: function () {
            var siteData = this.props.viewProps.siteData;
            var data = typesConverter.link(this.proxyData, siteData.getDataByQuery.bind(siteData));
            var props = utils.linkRenderer.renderLink(data, siteData, this.props.viewProps.rootNavigationInfo);
            props.className = 'wixAppsLink';

            return props;
        }
    };
});
