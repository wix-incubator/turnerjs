define(["siteUtils", "wixappsCore"], function (siteUtils, /** wixappsCore */ wixApps) {
    'use strict';

    var typesConverter = wixApps.typesConverter;
    var baseProxy = wixApps.baseProxy;

    /**
     * @class proxies.NumericStepper
     * @extends proxies.mixins.baseProxy
     */
    return {
        mixins: [baseProxy],

        renderProxy: function () {
            var data = this.proxyData;
            var componentType = "wysiwyg.common.components.NumericStepper";
            var props = this.getChildCompProps(componentType);
            props.compData = typesConverter.numeric(data.value);

            props.compProp = {
                minValue: data.minValue,
                maxValue: data.maxValue
            };
            props.onInputChange = this.handleViewEvent;
            props.onInputChangedFailed = this.handleViewEvent;
            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
