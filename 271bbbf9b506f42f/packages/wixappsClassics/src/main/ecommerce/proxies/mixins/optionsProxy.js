define(["lodash", "wixappsCore", "siteUtils"], function (_, /**wixappsCore */wixapps, siteUtils) {
    'use strict';

    var inputProxy = wixapps.inputProxy;
    var listTypes = {
        'text': {'compType': 'wysiwyg.viewer.components.inputs.TextOption', 'compSkin': 'wixapps.integration.skins.ecommerce.options.TextOptionSkin'},
        'color': {'compType': 'wysiwyg.viewer.components.inputs.ColorOption', 'compSkin': 'wixapps.integration.skins.ecommerce.options.ColorOptionSkin'}
    };

    /**
     * @class proxies.mixins.optionProxy
     * @extends proxies.mixins.inputProxy
     * @property {function(): string} getSkinName
     * @property {function(): string} getComponentName
     */
    return {
        mixins: [inputProxy],

        renderProxy: function () {
            var data = this.proxyData;
            var listType = data.optionType || 'text';
            var self = this;

	        var compData = wixapps.typesConverter.selectableList(data);
            var selectedItem = _.find(compData.options, {value: compData.value});

            var skinName = this.props.skin || this.getSkinName();
	        var props = _.merge(this.getChildCompProps(this.getComponentName()),
                {
                    itemClassName: this.getCompProp('optionComp') || listTypes[listType].compType,
                    itemSkin: this.getCompProp('optionSkin') || listTypes[listType].compSkin,
                    skin: skinName,
                    styleId: this.props.viewProps.loadedStyles[skinName],
                    compData: compData,
                    selectedItem: selectedItem,
                    onSelectionChange: function onSelectionChange(event, domID) {
                        event.payload.listData = data;
                        self.setData(event.payload.value, 'selectedValue');
                        self.handleViewEvent(event, domID);
                    },
                    valid: data.valid
                });

            return siteUtils.compFactory.getCompClass(this.getComponentName())(props);
        }
    };
});
