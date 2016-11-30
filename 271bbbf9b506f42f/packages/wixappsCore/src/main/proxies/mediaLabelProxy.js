define(["lodash", "siteUtils", "wixappsCore/proxies/mixins/textProxy", "wixappsCore/core/typesConverter"], function (_, siteUtils, textProxy, /** wixappsCore.typesConverter */typesConverter) {
    'use strict';

    function transformSkinProperties(refData) {
        refData[""] = _.merge({}, refData[""], {
            "data-proxy-name": "MediaLabel"
        });
        return refData;
    }

    function getFullDataPath(props) {
        var viewData = props.viewDef.data || "this";
        return this.props.viewProps.getNormalizedDataPath(this.contextPath, viewData);
    }

    function getMediaDataByQuery(data) {
        if (data) {
            if (data._type === "wix:Image") {
                var imageQuality = this.props.viewProps.siteData.getGlobalImageQuality();
                return typesConverter.image(data, this.props.viewProps.resolveImageData, this.props.viewProps.siteData.serviceTopology, this.props.viewProps.packageName, imageQuality);
            }
            if (data._type === "wix:Video") {
                return typesConverter.video(data);
            }
        }

        return null;
    }

    /**
     * @class proxies.MediaLabel
     * @extends proxies.mixins.textProxy
     */
    return {
        mixins: [textProxy],

        /**
         * This method will return false only when the data was really changed otherwise the content will refresh every time.
         * The MediaRichText component uses dangerously insert inner html so it replaces the dom every render and refreshes videos that render iframes.
         * @param newProps
         * @returns {boolean}
         */
        shouldComponentUpdate: function (newProps) {
            var reRenderRequested = _.includes(this.props.viewProps.siteData.componentsToRender, this.props.viewProps.compId);
            var newDataPath = getFullDataPath.call(this, newProps);
            var pathChanged = newDataPath && !_.isEqual(this.fullDataPath, newDataPath);
            return reRenderRequested || pathChanged ||
                !!(this.isViewDefCompChangedInNextProps && this.isViewDefCompChangedInNextProps(newProps));
        },

        renderProxy: function () {
            var data = this.proxyData;

            this.fullDataPath = getFullDataPath.call(this, this.props);

            var formattedText = this.createFormattedText(data);

            var componentType = "wysiwyg.viewer.components.MediaRichText";

            var props = this.getRichTextChildCompProps(componentType, transformSkinProperties);

            var refDataMap = _.mapValues(data.refMap, getMediaDataByQuery, this);
            props.compData = typesConverter.richText(formattedText, data.links, this.props.viewProps.siteData, refDataMap);

            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
