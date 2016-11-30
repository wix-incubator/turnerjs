define([], function () {
    "use strict";

    function getYoutubeId(url) {
        var videoId = '';

        // Test for long youtube url: http://youtube.com/watch?[...&]v=[VIDEO_ID]
        var YTLongUrl = /(?:youtube\.com\/watch[^\s]*[\?&]v=)([\w-]+)/g;
        // Test for short youtube url: http://youtu.be/[VIDEO_ID]
        var YTShortUrl = /(?:youtu\.be\/)([\w-]+)/g;

        var match = YTLongUrl.exec(url) || YTShortUrl.exec(url);
        if (match && match.length && match[1]) {
            //if there is a match, the second group is the id we want
            videoId = match[1];
        }
        return videoId;
    }

    function getVimeoId(url) {
        var videoId = '';

        var VimeoUrl = /vimeo\.com\/(\d+)$/gi;

        var match = VimeoUrl.exec(url);
        if (match && match.length && match[1]) {
            //if there is a match, the second group is the id we want
            videoId = match[1];
        }
        return videoId;
    }

    function getVideoDataFromVideoUrl(url) {
        var videoType = null;
        var videoId = getYoutubeId(url);
        if (videoId) {
            videoType = "YOUTUBE";
        } else {
            videoId = getVimeoId(url);
            if (videoId) {
                videoType = "VIMEO";
            }
        }

        if (videoId && videoType) {
            return {
                videoId: videoId,
                videoType: videoType
            };
        }
        return {};
    }


    function convertVideoUrl(videoURL) {
        var videoData = getVideoDataFromVideoUrl(videoURL);
        if (videoData && videoData.videoId && videoData.videoType) {
            videoData._type = "wix:Video";
            return videoData;
        }
        return {'_type': 'MediaItem'};
    }


    return {
        convertVideoUrl: convertVideoUrl
    };

});

