define(['documentServices/media/wixVideoAPI'], function (videoAPI) {
    'use strict';

    var BG_VIDEO_COMP_REF = [{id: 'currentVideo'}];


    function playCurrent(ps) {
        videoAPI.play(ps, BG_VIDEO_COMP_REF);
    }


    function pauseCurrent(ps) {
        videoAPI.stop(ps, BG_VIDEO_COMP_REF);
    }


    function getReadyState(ps) {
        return videoAPI.getReadyState(ps, BG_VIDEO_COMP_REF);
    }

    function isPlaying(ps) {
        return videoAPI.isPlaying(ps, BG_VIDEO_COMP_REF);
    }

    function registerToPlayingChange(ps, callback) {
        videoAPI.registerToPlayingChange(ps, BG_VIDEO_COMP_REF, '', callback);
    }

    function unregisterToPlayingChange(ps) {
        videoAPI.unregisterToPlayingChange(ps, BG_VIDEO_COMP_REF);

    }


    return {
        playCurrent: playCurrent,
        pauseCurrent: pauseCurrent,
        isPlaying: isPlaying,
        getReadyState: getReadyState,
        registerToPlayingChange: registerToPlayingChange,
        unregisterToPlayingChange: unregisterToPlayingChange
    };

});
