define([], function () {
    'use strict';

    /**
     * TODO: This is a temporary solution till we work with compWrapper.
     * @param compRef
     * @param videoIdSuffix
     * @returns compId {string}
     */
    function getIdFromRefArray(compRef, videoIdSuffix){
        videoIdSuffix = videoIdSuffix ? 'balatamedia' + videoIdSuffix : '';
        return compRef[0].id + (videoIdSuffix || '');
    }

    function play(ps, compRef, videoIdSuffix) {
        var compId = getIdFromRefArray(compRef, videoIdSuffix);
        return ps.siteAPI.bgVideo.play(compId);
    }

    function stop(ps, compRef, videoIdSuffix) {
        var compId = getIdFromRefArray(compRef, videoIdSuffix);
        return ps.siteAPI.bgVideo.stop(compId);
    }

    function getReadyState(ps, compRef, videoIdSuffix) {
        var compId = getIdFromRefArray(compRef, videoIdSuffix);
        return ps.siteAPI.bgVideo.getReadyState(compId);
    }

    function isPlaying(ps, compRef, videoIdSuffix) {
        var compId = getIdFromRefArray(compRef, videoIdSuffix);
        return ps.siteAPI.bgVideo.isPlaying(compId);
    }

    function registerToPlayingChange(ps, compRef, videoIdSuffix, callback) {
        var compId = getIdFromRefArray(compRef, videoIdSuffix);
        return ps.siteAPI.bgVideo.registerToPlayingChange(compId, callback);
    }

    function unregisterToPlayingChange(ps, compRef, videoIdSuffix) {
        var compId = getIdFromRefArray(compRef, videoIdSuffix);
        return ps.siteAPI.bgVideo.unregisterToPlayingChange(compId);
    }

    return {
        play: play,
        stop: stop,
        isPlaying: isPlaying,
        getReadyState: getReadyState,
        registerToPlayingChange: registerToPlayingChange,
        unregisterToPlayingChange: unregisterToPlayingChange
    };

});
