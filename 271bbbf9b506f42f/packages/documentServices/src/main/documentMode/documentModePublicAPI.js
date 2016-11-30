define(['documentServices/documentMode/documentMode',
        'documentServices/constants/constants',
        'documentServices/utils/utils'],
    function (documentMode, constants, dsUtils) {
    "use strict";
    return {
        methods: {
            documentMode: {
                runtime: {
                    reset: {dataManipulation: documentMode.runtime.reset}
                },
                enablePlaying: {dataManipulation: documentMode.enablePlaying},
                enablePageProtection: {dataManipulation: documentMode.enablePageProtection},
                enableZoom: {dataManipulation: documentMode.enableZoom},
                enableSocialInteraction: {dataManipulation: documentMode.enableSocialInteraction},
                enableExternalNavigation: {dataManipulation: documentMode.enableExternalNavigation},
                enableTinyMenuOpening: {dataManipulation: documentMode.enableTinyMenuOpening},
                enableBackToTopButton: {dataManipulation: documentMode.enableBackToTopButton},
                toggleWixAds: {dataManipulation: documentMode.enableWixAds},
                enableSlideShowGalleryClick: {dataManipulation: documentMode.enableSlideShowGalleryClick},
                enableAction: {dataManipulation: documentMode.enableAction},
                getSiteTransformScale: documentMode.getSiteTransformScale,
                enableTransFormScaleOnSite: {dataManipulation: documentMode.enableTransFormScaleOnSite},
                resetBehaviors: documentMode.resetBehaviorsRegistration,
                enablePageTransitions: documentMode.enablePageTransitions,
                enableBgVideoAutoplay: documentMode.enableBgVideoAutoplay,
                enableRenderFixedPositionContainers: {dataManipulation: documentMode.enableRenderFixedPositionContainers},
                enableRenderFixedPositionBackgrounds: {dataManipulation: documentMode.enableRenderFixedPositionBackgrounds},
                enableSiteMembersDialogsOpening: {dataManipulation: documentMode.allowSiteMembersDialogsOpening},
                enableResetGalleryToOriginalState: {dataManipulation: documentMode.enableResetGalleryToOriginalState},
                enableResetComponent: {dataManipulation: documentMode.enableResetComponent},
                setExtraSiteHeight: {dataManipulation: documentMode.setExtraSiteHeight},
                enableShouldUpdateJsonFromMeasureMap: {dataManipulation: documentMode.enableShouldUpdateJsonFromMeasureMap},
                allowSiteOverflow: {dataManipulation: documentMode.allowSiteOverflow},
                setComponentViewMode: {dataManipulation: documentMode.setComponentViewMode},
                allowShowingFixedComponents: {dataManipulation: documentMode.allowShowingFixedComponents},
                showHiddenComponents: {dataManipulation: documentMode.showHiddenComponents},
                isHiddenComponentsEnabled: documentMode.isHiddenComponentsEnabled,
                /** @deprecated */
                setForceDisplayAsActive: {dataManipulation: documentMode.setForceDisplayAsActive},
                setComponentPreviewState: {dataManipulation: documentMode.setComponentPreviewState},
                ignoreComponentsHiddenProperty: {dataManipulation: documentMode.ignoreComponentsHiddenProperty, shouldExecOp: documentMode.checkComponentsHiddenProperty},
                allowWixCodeInitialization: {dataManipulation: documentMode.allowWixCodeInitialization},
                showControllers: {dataManipulation: documentMode.showControllers},
                isControllersVisibilityEnabled: documentMode.isControllersVisibilityEnabled,
                onboardingViewportMode: {dataManipulation: documentMode.setOnboardingViewportMode}
            },
            /**
             * @class documentServices.viewMode
             */
            viewMode: {
                /**
                 * Sets the document's view mode (mobile or desktop)- sets the view that's rendered, regardless of the displaying device
                 *  @param {String} viewMode - MOBILE or DESKTOP
                 */
                set: {dataManipulation: documentMode.setViewMode, isUpdatingAnchors: dsUtils.NO, noBatching: true},
                /**
                 *  Returns document's view mode (mobile or desktop)- i.e the view that's rendered, regardless of the displaying device
                 *  @returns {string} specifying MOBILE or DESKTOP
                 */
                get: documentMode.getViewMode,
                VIEW_MODES: constants.VIEW_MODES
            }
        }
    };
});
