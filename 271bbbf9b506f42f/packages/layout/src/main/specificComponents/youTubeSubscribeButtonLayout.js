/**
 * Created by eitanr on 6/24/14.
 */
define(["layout/util/layout"], function (layout) {
    "use strict";

    var SIZES = {
        'default': {width: 145, height: 33},
        'defaultIE': {width: 145, height: 33},
        'full': {width: 212, height: 55},
        'fullIE': {width: 212, height: 67}
    };

    function measure(id, measureMap, nodesMap, siteData, structureInfo) {
        var layoutMode = structureInfo.propertiesItem.layout,
            size = SIZES[layoutMode + (siteData.browser.ie ? 'IE' : '')];

        measureMap.width[id] = size.width;
        measureMap.height[id] = size.height;
    }

    layout.registerRequestToMeasureDom('wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton');
    layout.registerCustomMeasure('wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton', measure);

    return {};
});
