define(['layout/util/layout'], function (layout) {
    'use strict';

    function measureSoundCloud(id, measureMap) {
        var videoMinWidth = 250;
        var videoMinHeight = 50;
        measureMap.minWidth[id] = videoMinWidth;
        measureMap.minHeight[id] = videoMinHeight;
        measureMap.width[id] = Math.max(measureMap.width[id], videoMinWidth);
        measureMap.height[id] = Math.max(measureMap.height[id], videoMinHeight);


    }

    layout.registerCustomMeasure("wysiwyg.viewer.components.SoundCloudWidget", measureSoundCloud);
});