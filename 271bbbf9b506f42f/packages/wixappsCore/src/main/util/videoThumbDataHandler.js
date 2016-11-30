define(['lodash'], function(_){
    'use strict';
    var videoServices = {
        "YOUTUBE": {
            prepareVideoThumbUrl: buildYoutubeVideoThumbUrl
        },
        "VIMEO":{
            prepareVideoThumbUrl: createVimeoVideoThumbRequest
        }
    };

    var VIDEO_NOT_FOUND = '';

    function getYouTubePreviewUrl(videoId) {
        return '//img.youtube.com/vi/' + videoId + '/0.jpg';
    }

    function getVimeoPreviewUrl(videoId) {
        return '//vimeo.com/api/v2/video/' + videoId + '.json';
    }

    function buildYoutubeVideoThumbUrl(videoItem) {
        videoItem.item.imageSrc = getYouTubePreviewUrl(videoItem.item.videoId);
        return null;
    }

    function createVimeoVideoThumbRequest(videoItem) {
        if (videoItem.item.imageSrc) {
            return null;
        }
        var url = getVimeoPreviewUrl(videoItem.item.videoId);
        return {
            force: true,
            destination: videoItem.path,
            url: url,
            dataType: 'jsonp',
            transformFunc: transformVideo,
            error: function() {
                videoError(videoItem);
            }
        };
    }

    function videoError(videoItem) {
        videoItem.item.imageSrc = VIDEO_NOT_FOUND;
    }

    function transformVideo(response, item) {
        var responseData = response[0];
        var transformedItem = _.isArray(item) ? findItemWithVideoId(item, responseData.id) : item;
        transformedItem.imageSrc = responseData.thumbnail_large;
        return item;
    }

    function findItemWithVideoId(itemArr, videoId) {
        return _.find(itemArr, {videoId: videoId + ''});
    }

    function prepareSingleVideoThumbUrl(singleVideoItem) {
        return singleVideoItem.item.videoType ? videoServices[singleVideoItem.item.videoType].prepareVideoThumbUrl(singleVideoItem) : videoError(singleVideoItem);
    }

    function handleVideoThumbUrls(videoDataItems, siteData) {
        if (!VIDEO_NOT_FOUND) {
            VIDEO_NOT_FOUND = siteData.santaBase + '/static/images/video/not-found.png';
        }
        return _.compact(_.map(videoDataItems, prepareSingleVideoThumbUrl));
    }

    return {
        handleVideoThumbUrls: handleVideoThumbUrls
    };
});
