define(["lodash", "siteUtils", "wixappsCore/core/typesConverter", "wixappsCore/proxies/mixins/inputProxy", "wixappsCore/util/localizer"], function (_, siteUtils, /** wixappsCore.typesConverter */typesConverter, inputProxy, localizer) {
    'use strict';

    function getCompProp() {
		return {
			placeholder: {
				text: localizer.localize(this.getCompProp('promptText'), this.props.viewProps.getLocalizationBundle()),
				value: -1
			},
			size: null
		};
	}

	/**
	 * @class proxies.ComboBox
	 * @extends proxies.mixins.inputProxy
	 */
	return {
        mixins: [inputProxy],
        renderProxy: function () {
            var data = this.proxyData;
            var self = this;
            var componentType = "wysiwyg.viewer.components.inputs.ComboBoxInput";
            var childProps = this.getChildCompProps(componentType);
	        childProps.compProp = this.getCompProp('hasPrompt') && !_.some(data.items, {value: data.selectedValue}) ? getCompProp.call(this) : {};
	        childProps.compData = typesConverter.selectableList(data);
            _.forEach(childProps.compData.options, function (item) {
                item.text = localizer.localize(item.text, this.props.viewProps.getLocalizationBundle());
                item.description = localizer.localize(item.description, this.props.viewProps.getLocalizationBundle());
            }, this);
            childProps.onSelectionChange = function onSelectionChange(event, domID) {
                event.payload.listData = data;
                var selectedValue = event.payload.value || data.items[0].value;
                self.setData(selectedValue, 'selectedValue');
                self.handleViewEvent(event, domID);
            };
            childProps.errorMessage = !data.valid;

            return siteUtils.compFactory.getCompClass(componentType)(childProps);
        }
    };
});
