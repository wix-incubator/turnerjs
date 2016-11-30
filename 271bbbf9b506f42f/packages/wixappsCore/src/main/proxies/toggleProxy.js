define(["siteUtils", "wixappsCore/proxies/mixins/baseCompositeProxy"], function (siteUtils, baseCompositeProxy) {
    'use strict';
    function createInnerProxies() {
        var templateDef = this.getCompProp('templates');
        var onProxyInstance = this.renderChildProxy(templateDef.on, 'on');
        var offProxyInstance = this.renderChildProxy(templateDef.off, 'off');

        return [onProxyInstance, offProxyInstance];
    }

    /**
     * @class proxies.Toggle
     * @extends proxies.mixins.baseComposite
     */
    return {
        mixins: [baseCompositeProxy],

        renderProxy: function () {
            var children = createInnerProxies.call(this);
            var componentType = "wixapps.integration.components.Toggle";
            var props = this.getChildCompProps(componentType);
            props.initialState = this.getCompProp('initialState') || 'off';

            return siteUtils.compFactory.getCompClass(componentType)(props, children);
        }
    };
});
