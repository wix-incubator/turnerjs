define(['react', 'santaProps/utils/propsSelectorsUtils'], function (React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var windowTouchEvents = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('windowTouchEvents');
    });

    var windowScrollEvent = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('windowScrollEvent');
    });

    var windowClickEventAspect = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('windowClickEventAspect');
    });

    var siteScrollingBlocker = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('siteScrollingBlocker');
    });

    var siteMembers = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('siteMembers');
    });

    var windowFocusEvents = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('windowFocusEvents');
    });

    var windowResizeEvent = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('windowResizeEvent');
    });

    var anchorChangeEvent = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('anchorChangeEvent');
    });

    var externalScriptLoader = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('externalScriptLoader');
    });

    var audioAspect = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('AudioAspect');
    });

    var dynamicColorElements = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('dynamicColorElements');
    });

    var videoBackgroundAspect = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('VideoBackgroundAspect');
    });

    var designDataChangeAspect = applyFetch(React.PropTypes.object, function (state) {
        return state.siteAPI.getSiteAspect('designDataChangeAspect');
    });

    return {
        siteMembers: siteMembers,
        siteScrollingBlocker: siteScrollingBlocker,
        windowClickEventAspect: windowClickEventAspect,
        windowFocusEvents: windowFocusEvents,
        windowScrollEvent: windowScrollEvent,
        windowTouchEvents: windowTouchEvents,
        windowResizeEvent: windowResizeEvent,
        anchorChangeEvent: anchorChangeEvent,
        externalScriptLoader: externalScriptLoader,
        audioAspect: audioAspect,
        dynamicColorElements: dynamicColorElements,
        videoBackgroundAspect: videoBackgroundAspect,
        designDataChangeAspect: designDataChangeAspect
    };
});
