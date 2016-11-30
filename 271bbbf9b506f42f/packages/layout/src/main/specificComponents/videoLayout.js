define(['layout/util/layout'], function (layout) {
    'use strict';

    var DIMENSIONS = {
        VIMEO: {
            WIDTH: 100,
            HEIGHT: 100
        },
        YOUTUBE: {
            WIDTH: 200,
            HEIGHT: 200
        }
    };

    var FALLBACK = {
        WIDTH: 10,
        HEIGHT: 10
    };

    function measureVideo(id, measureMap, nodesMap, siteData, structureInfo) {
        var dimensions = DIMENSIONS[structureInfo.dataItem.videoType] || FALLBACK;
        measureMap.minWidth[id] = dimensions.WIDTH;
        measureMap.minHeight[id] = dimensions.HEIGHT;
        measureMap.width[id] = Math.max(measureMap.width[id], dimensions.WIDTH);
        measureMap.height[id] = Math.max(measureMap.height[id], dimensions.HEIGHT);
    }

    layout.registerCustomMeasure("wysiwyg.viewer.components.Video", measureVideo);
});