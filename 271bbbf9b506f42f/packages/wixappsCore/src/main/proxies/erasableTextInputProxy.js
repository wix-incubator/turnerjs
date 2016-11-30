define(["siteUtils", "wixappsCore/core/typesConverter", "wixappsCore/proxies/mixins/inputProxy"], function (siteUtils, /** wixappsCore.typesConverter */typesConverter, inputProxy) {
    'use strict';

    /**
     * @class proxies.ErasableTextInput
     * @extends proxies.mixins.inputProxy
     */
    return {
        mixins: [inputProxy],
        renderProxy: function () {
            var data = this.proxyData;
            var componentType = "wysiwyg.viewer.components.inputs.ErasableTextInput";
            var props = this.getChildCompProps(componentType);
            props.compData = typesConverter.text(data);
            props.compProp = {
                label: this.getCompProp('label'),
                placeholder: this.getCompProp('placeholder')
            };
            props.message = this.getCompProp('message');
            props.isValid = this.getCompProp('isValid');
            var self = this;
            props.onChange = function (e, domID) {
                self.setData(e.target.value);
                e.type = "inputChanged";
                self.handleViewEvent(e, domID);
            };
            props.onErase = function () {
                self.setData('');
            };

            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
