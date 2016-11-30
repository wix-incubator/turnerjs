define(['react', 'santaProps/utils/propsSelectorsUtils'], function (React, propsSelectorsUtils) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var componentViewMode = applyFetch(React.PropTypes.string, function (state) {
        return state.siteData.renderFlags.componentViewMode;
    });

    var componentPreviewState = applyFetch(React.PropTypes.string, function (state, props) {
        return state.siteData.renderFlags.componentPreviewStates[props.structure.id];
    });

    var getRenderFlag = function(renderFlag) {
        return applyFetch(React.PropTypes.bool, function (state) {
            return state.siteData.renderFlags[renderFlag];
        });
    };

    return {
        componentViewMode: componentViewMode,
        componentPreviewState: componentPreviewState,
        isPlayingAllowed: getRenderFlag('isPlayingAllowed'),
        isExternalNavigationAllowed: getRenderFlag('isExternalNavigationAllowed'),
        shouldResetComponent: getRenderFlag('shouldResetComponent'),
        renderFixedPositionContainers: getRenderFlag('renderFixedPositionContainers'),
        renderFixedPositionBackgrounds: getRenderFlag('renderFixedPositionBackgrounds'),
        isTinyMenuOpenAllowed: getRenderFlag('isTinyMenuOpenAllowed'),
        isSocialInteractionAllowed: getRenderFlag('isSocialInteractionAllowed'),
        shouldBlockGoogleMapInteraction: getRenderFlag('shouldBlockGoogleMapInteraction'),
        shouldResetTinyMenuZIndex: getRenderFlag('shouldResetTinyMenuZIndex'),
        shouldResetSlideShowNextPrevButtonsPosition: getRenderFlag('shouldResetSlideShowNextPrevButtonsPosition'),
        shouldResetSubscribeFormMinMaxWidth: getRenderFlag('shouldResetSubscribeFormMinMaxWidth'),
        isBackToTopButtonAllowed: getRenderFlag('isBackToTopButtonAllowed'),
        shouldResetGalleryToOriginalState: getRenderFlag('shouldResetGalleryToOriginalState'),

        showControllers: getRenderFlag('showControllers')
    };

});
