define(["siteUtils", "wixappsCore/proxies/mixins/baseProxy", 'lodash'], function (siteUtils, baseProxy, _) {
    'use strict';

    var componentType = "wysiwyg.viewer.components.FiveGridLine";

    function transformSkinProperties(refData) {
        refData[''] = _.merge({}, refData[''], {style: {position: 'relative'}});

        return refData;
    }

    /**
     * @class proxies.HorizontalLine
     * @extends proxies.mixins.baseProxy
     */
    return {
        mixins: [baseProxy],
        statics: {
            componentType: componentType
        },
        renderProxy: function () {
            var props = this.getChildCompProps(componentType, transformSkinProperties);
            return siteUtils.compFactory.getCompClass(componentType)(props);
        }
    };
});
