define(['lodash', "wixappsCore/core/wixappsConfiguration"], function (_, /** wixappsConfiguration */wixappsConfiguration) {
    "use strict";

    /**
     * @class wixappsCore.wixappsPlugins
     */
    return {
        getAdditionalDomAttributes: function (proxy) {
            var additionalDomProperties = {};
            if (wixappsConfiguration.shouldApplyAutomationAttributes()) {
                additionalDomProperties = _.merge(additionalDomProperties, {
                    "data-vcview": proxy.props.viewName,
                    "data-vcfield": proxy.getViewDefProp('id'),
                    "data-vctype": proxy.props.forType,
                    "data-proxy": proxy.constructor.displayName,
                    "data-field-name": proxy.getViewDefProp('data')
                });
            }
            return additionalDomProperties;
        }
    };
});
