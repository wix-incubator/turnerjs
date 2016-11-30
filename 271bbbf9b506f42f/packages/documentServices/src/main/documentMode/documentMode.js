define([
    'lodash',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/constants/constants',
    'documentServices/hooks/hooks',
    'utils'
], function (_, documentModeInfo, constants, hooks, utils) {
    'use strict';

    /**
     * Sets the document's view mode (mobile or desktop)- sets the view that's rendered, regardless of the displaying device
     *  @param {String} viewMode - MOBILE or DESKTOP
     */
    function setViewMode(privateServices, viewMode) {
        var possibleViewModesValues = _.values(constants.VIEW_MODES);
        var isValidViewMode = _.includes(possibleViewModesValues, viewMode);
        if (!isValidViewMode) {
            throw new Error('view mode not valid. valid viewModes are: ' + possibleViewModesValues);
        }
        if (documentModeInfo.getViewMode(privateServices) !== viewMode) {
            var isMobile = viewMode === constants.VIEW_MODES.MOBILE;
            if (isMobile) {
                hooks.executeHook(hooks.HOOKS.SWITCH_VIEW_MODE.MOBILE);
            }
            resetRuntimeStore(privateServices);
            privateServices.siteAPI.setMobileView(isMobile);
        }
    }

    function setRenderFlag(ps, flagName, value) {
        var renderFlagPointer = ps.pointers.general.getRenderFlag(flagName);
        ps.dal.set(renderFlagPointer, value);
    }

    function getRenderFlag(ps, flagName, value) {
        var renderFlagPointer = ps.pointers.general.getRenderFlag(flagName);
        return ps.dal.get(renderFlagPointer, value);
    }

    function enablePageProtection(ps, allowed) {
        setRenderFlag(ps, 'isPageProtectionEnabled', allowed);
    }

    function allowPlaying(ps, allowed) {
        setRenderFlag(ps, 'isPlayingAllowed', allowed);
    }

    function allowZoom(ps, allowed) {
        setRenderFlag(ps, 'isZoomAllowed', allowed);
    }

    function enableTransFormScaleOnSite(ps, transformScale) {
        setRenderFlag(ps, 'siteTransformScale', transformScale);
    }

    function allowSocialInteraction(ps, allowed) {
        setRenderFlag(ps, 'isSocialInteractionAllowed', allowed);
    }

    function allowExternalNavigation(ps, allowed) {
        setRenderFlag(ps, 'isExternalNavigationAllowed', allowed);
    }

    function allowRenderFixedPositionContainer(ps, allowed) {
        setRenderFlag(ps, 'renderFixedPositionContainers', allowed);
    }
    function allowRenderFixedPositionBackgrounds(ps, allowed) {
        setRenderFlag(ps, 'renderFixedPositionBackgrounds', allowed);
    }

    /**
     * Set whether back to top button is visible in the viewer
     * @param {boolean} allowed
     */
    function allowBackToTopButton(ps, allowed) {
        setRenderFlag(ps, 'isBackToTopButtonAllowed', allowed);
    }

    function allowSlideShowGalleryClick(ps, allowed) {
        setRenderFlag(ps, 'isSlideShowGalleryClickAllowed', allowed);
    }

    function allowShouldUpdateJsonFromMeasureMap(ps, allowed) {
        setRenderFlag(ps, 'shouldUpdateJsonFromMeasureMap', allowed);
    }

    function allowTinyMenuOpening(ps, allowed) {
        setRenderFlag(ps, 'isTinyMenuOpenAllowed', allowed);
    }

    function enableResetGalleryToOriginalState(ps, allowed) {
        setRenderFlag(ps, 'shouldResetGalleryToOriginalState', allowed);
    }

    function enableResetComponent(ps, allowed) {
        setRenderFlag(ps, 'shouldResetComponent', allowed);
    }

    function allowSiteMembersDialogsOpening(ps, allowed) {
        setRenderFlag(ps, 'isSiteMembersDialogsOpenAllowed', allowed);
    }

    function allowShowingFixedComponents(ps, allowed) {
        setRenderFlag(ps, 'allowShowingFixedComponents', allowed);
    }

    function allowShowingHiddenComponents(ps, allowed) {
        setRenderFlag(ps, 'showHiddenComponents', allowed);
    }

    function isHiddenComponentsEnabled(ps) {
        return getRenderFlag(ps, 'showHiddenComponents');
    }

    function isControllersVisibilityEnabled(ps) {
        return getRenderFlag(ps, 'showControllers');
    }

    function setComponentViewMode(ps, viewMode) {
        setRenderFlag(ps, 'componentViewMode', viewMode);
    }

    function showControllers(ps, allowed) {
        setRenderFlag(ps, 'showControllers', allowed);
    }

    /**
     * Set whether wix ads are visible in the viewer
     * @param {boolean} allowed
     */

    function allowWixAds(ps, allowed) {
        setRenderFlag(ps, 'isWixAdsAllowed', allowed);
    }

    function resetBehaviorsRegistration(privateServices, reset) {
        if (reset) {
            privateServices.siteAPI.resetBehaviorsRegistration();
        }
    }

    /**
     *
     */
    function allowActionByName(privateServices, actionName, isAllowed) {
        validateBooleanParam(isAllowed);

        if (isAllowed) {
            privateServices.siteAPI.enableAction(actionName);
        } else {
            privateServices.siteAPI.disableAction(actionName);
        }
    }

    function allowPageTransitions(privateServices, isAllowed) {
        allowActionByName(privateServices, 'pageTransition', isAllowed);
    }

    function validateBooleanParam(param) {
        if (typeof param !== 'boolean') {
            throw new Error('param ' + param + ' is not valid. Should be boolean');
        }
    }

    function enableBgVideoAutoplay(ps, autoplay, silent) {
        if (autoplay) {
            ps.siteAPI.bgVideo.enableVideoPlayback(silent);
        } else {
            ps.siteAPI.bgVideo.disableVideoPlayback(silent);
        }
    }

    function setExtraSiteHeight(ps, extraSiteHeight) {
        setRenderFlag(ps, 'extraSiteHeight', extraSiteHeight);
    }

    function allowSiteOverflow(ps, shouldAllowSiteOverflow) {
        setRenderFlag(ps, 'allowSiteOverflow', shouldAllowSiteOverflow);
    }

    function resetRuntimeStore(ps) {
        var runtimePointer = ps.pointers.general.getRuntimePointer();
        ps.dal.set(runtimePointer, {components: {}});
    }

    function ignoreComponentsHiddenProperty(ps, compIds) {
        setRenderFlag(ps, 'ignoreComponentsHiddenProperty', compIds);
    }

    function checkComponentsHiddenProperty(ps, compIds) {
        var currentCompIds = getRenderFlag(ps, 'ignoreComponentsHiddenProperty') || [];
        return utils.objectUtils.isDifferent(compIds, currentCompIds);
    }

    function allowWixCodeInitialization(ps, allowed) {
        setRenderFlag(ps, 'initWixCode', allowed);
    }

    function setComponentPreviewState(ps, compId, state) {
        var previewStateMap = getRenderFlag(ps, 'componentPreviewStates') || {};
        previewStateMap[compId] = state;
        setRenderFlag(ps, 'componentPreviewStates', previewStateMap);
    }

    function setOnboardingViewportMode(ps, mode) {
        setRenderFlag(ps, 'onboardingViewportMode', mode);
    }

    /**
     * @class documentServices.documentMode
     */

    return {
        isMobileView: documentModeInfo.isMobileView,
        getViewMode: documentModeInfo.getViewMode,
        setViewMode: setViewMode,
        runtime: {
            /**
             * Resets all dynamic data
             */
            reset: resetRuntimeStore
        },
        /**
         * Set whether component view mode
         * @param {string} view mode
         */
        setComponentViewMode: setComponentViewMode,
        /**
         * Set whether playing of galleries, audio players and videos is allowed in the viewer
         * @param {boolean} allowed
         */
        enablePlaying: allowPlaying,
        /**
         * Set whether page protection / site members pop ups are allowed in the viewer
         * @param {boolean} allowed
         */
        enablePageProtection: enablePageProtection,
        /**
         * Set whether media zoom is opened in the viewer
         * @param {boolean} allowed
         */
        enableZoom: allowZoom,
        /**
         * Set whether media zoom is opened in the viewer
         * @param {boolean} allowed
         */
        enableTransFormScaleOnSite: enableTransFormScaleOnSite,

        getSiteTransformScale: function (ps) {
            var renderFlagPointer = ps.pointers.general.getRenderFlag('siteTransformScale');
            return ps.dal.get(renderFlagPointer);
        },
        /**
         * Set whether social components interact with 3rd party api's in the viewer
         * @param {boolean} allowed
         */
        enableSocialInteraction: allowSocialInteraction,
        /**
         * Set whether navigation to external urls is allowed in the viewer
         * @param {boolean} allowed
         */
        enableExternalNavigation: allowExternalNavigation,
        enableBackToTopButton: allowBackToTopButton,
        /**
         * Set whether wix ads are visible
         * @param {boolean} allowed
         */
        enableWixAds: allowWixAds,
        /**
         * Set whether clicking on slide show gallery works in the viewer
         * @param {boolean} allowed
         */
        enableSlideShowGalleryClick: allowSlideShowGalleryClick,

        enableShouldUpdateJsonFromMeasureMap: allowShouldUpdateJsonFromMeasureMap,
        /**
         * Set whether tiny menu can be opened
         * @param {boolean} allowed
         */
        enableTinyMenuOpening: allowTinyMenuOpening,
        enableResetGalleryToOriginalState: enableResetGalleryToOriginalState,
        enableResetComponent: enableResetComponent,
        /**
         * Set whether site members dialogs can be opened
         * @param {boolean} allowed
         */
        allowSiteMembersDialogsOpening: allowSiteMembersDialogsOpening,
        /**
         * Reset all registered behaviors
         * @param {boolean} reset if not 'true' do nothing
         */
        resetBehaviorsRegistration: resetBehaviorsRegistration,
        /**
         * Disable or Enable triggers of an action
         * @param {String} actionName
         */
        enableAction: allowActionByName,
        /**
         * Set whether page transitions are working when navigating between pages in the viewer
         * @param {boolean} isAllowed
         */
        enablePageTransitions: allowPageTransitions,
        /**
         * Set whether video background should autoplay on page change
         * @param {boolean} autoplay true to enable video autoplay on page change, false to disable
         * @param {boolena} [silent=false] if false will start playing or stop the current video (depends on the value of "autoplay"),
         * if true will just enable or disable autoplay for the next time a page will change
         */
        enableBgVideoAutoplay: enableBgVideoAutoplay,

        /**
         * Disable or enable fixed position on containers
         * @param {boolean} isAllowed
         */
        enableRenderFixedPositionContainers: allowRenderFixedPositionContainer,
        /**
         * set the viewport mode for onboarding workaround,
         * the mode value will indicate from where to return the viewport height.
         * onboarding editor implementation bug .... should be fixed by onboarding
         */
        setOnboardingViewportMode: setOnboardingViewportMode,
        enableRenderFixedPositionBackgrounds: allowRenderFixedPositionBackgrounds,
        setExtraSiteHeight: setExtraSiteHeight,
        allowSiteOverflow: allowSiteOverflow,
        allowShowingFixedComponents: allowShowingFixedComponents,
        showHiddenComponents: allowShowingHiddenComponents,
        isHiddenComponentsEnabled: isHiddenComponentsEnabled,
        ignoreComponentsHiddenProperty: ignoreComponentsHiddenProperty,
        setComponentPreviewState: setComponentPreviewState,
        checkComponentsHiddenProperty: checkComponentsHiddenProperty,
        showControllers: showControllers,
        isControllersVisibilityEnabled: isControllersVisibilityEnabled,
        allowWixCodeInitialization: allowWixCodeInitialization
    };
});
