define(["lodash", "siteUtils", "wixappsCore/proxies/mixins/baseProxy", "wixappsCore/core/typesConverter", "wixappsCore/util/localizer"], function (_, siteUtils, baseProxy, /** wixappsCore.typesConverter */typesConverter, localizer) {
    'use strict';

    var componentType = "wysiwyg.viewer.components.SiteButton";

    return {
        mixins: [baseProxy],

        statics: {
            componentType: componentType
        },

        getCustomStyle: function () {
            var style = {position: 'relative'};
            if (this.getAdditionalButtonStyle) {
                style = _.merge(style, this.getAdditionalButtonStyle());
            }

            return style;
        },

        renderProxy: function () {
            var props = this.getChildCompProps(componentType, this.transformSkinProperties);

            var compData = typesConverter.linkableButton(this.proxyData, this.props.viewProps.siteData);
            var label = this.getCompProp("label");
            if (_.isUndefined(label)) {
                label = compData.label;
            }
            compData.label = label.toString() ? localizer.localize(label, this.props.viewProps.getLocalizationBundle()) : this.getDefaultLabel();
            props.compData = compData;

            var proxyData = this.proxyData;
            if (proxyData && proxyData.pageId) {
                var siteData = this.props.viewProps.siteData;
                props.getDataByQuery = function () {
                    return typesConverter.link(proxyData, siteData.getDataByQuery.bind(siteData));
                };
            }

            props.compProp = {
                align: this.getCompProp("align") || "center",
                margin: this.getCompProp("margin") || 0,
                padding: this.getCompProp("labelPadding") || ''
            };

            props.shouldUseFlex = false;
            props.noAutoLinkGeneration = true;

            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
