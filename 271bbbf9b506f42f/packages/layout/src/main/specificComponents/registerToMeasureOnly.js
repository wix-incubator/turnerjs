define(['layout/util/layout'], function (/** layout.layout */layout) {
    'use strict';

    layout.registerRequestToMeasureDom('wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt');
    layout.registerRequestToMeasureDom("wysiwyg.common.components.spotifyfollow.viewer.SpotifyFollow");
    layout.registerRequestToMeasureDom("wysiwyg.common.components.spotifyplayer.viewer.SpotifyPlayer");
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.Video");
    layout.registerRequestToMeasureDom("wysiwyg.viewer.components.WTwitterTweet");
    layout.registerRequestToMeasureDom("wysiwyg.common.components.disquscomments.viewer.DisqusComments");
    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.PaginatedGridGallery", [['itemsContainer']]);

    return {};
});
