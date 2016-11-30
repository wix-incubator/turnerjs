define(["lodash", "siteUtils", "wixappsCore/proxies/mixins/baseProxy", "react"], function (_, siteUtils, baseProxy, React) {
    'use strict';

    var compDisplayModeMap = {
        'fitWidth': 'fitWidthStrict',
        'fitHeight': 'fitHeightStrict'
    };

    var componentType = "wysiwyg.viewer.components.WPhoto";


    function getPhotoWidthAndHeight(compDisplayMode, originalStyle, measureMap, photoId) {
        var originalSize = _.pick(originalStyle, ['width', 'height']);

        if (compDisplayMode === 'fitWidth' && _.isNumber(originalStyle.width)) {
            return originalSize;
        }
        if (compDisplayMode === 'fitHeight' && _.isNumber(originalStyle.height)) {
            return originalSize;
        }
        if (_.isNumber(originalStyle.height) && _.isNumber(originalStyle.width)) {
            return originalSize;
        }

        // https://jira.wixpress.com/browse/CLNT-7447
        return {
            width: measureMap ? measureMap.width[photoId] : 16,
            height: measureMap ? measureMap.height[photoId] : 16
        };
    }

    /**
     * @class proxies.mixins.baseImageProxy
     * @property {function(): object} getCompData
     * @extends proxies.mixins.baseProxy
     */

    return {
        mixins: [baseProxy],

        statics: {
            componentType: componentType
        },

        getCustomStyle: function () {
            return {
                position: 'relative'
            };
        },

        renderProxy: function () {
            var displayMode = this.getCompProp("imageMode") || "fill";
            var compData = this.getCompData();

            var photoProps = this.getChildCompProps(componentType);

            photoProps.compData = compData;

            var compDisplayMode = compDisplayModeMap[displayMode] || displayMode;
            photoProps.compProp = {
                displayMode: compDisplayMode
            };

            //if (this.getCompProp('showZoom')) {
            //    photoProps.compProp.onClickBehavior = 'zoomAndPanMode';
            //}

            var props = {
                'data-proxy-name': 'Image',
                'data-width': compData.width,
                'data-height': compData.height,
                'data-uri': compData.uri,
                'data-display-mode': compDisplayMode,
                id: photoProps.id + '_container',
                style: photoProps.style,
                ref: 'container'
            };

            photoProps.style = getPhotoWidthAndHeight(compDisplayMode, photoProps.style, this.props.viewProps.siteData.measureMap, photoProps.id);

            return React.DOM.div(props, siteUtils.compFactory.getCompClass(componentType)(photoProps));
        }
    };
});
