define([
    'utils',
    'core/core/site',
    'core/siteRender/compRegistrar',
    'core/siteRender/styleCollector',
    'core/core/dataRequirementsChecker',
    'core/core/siteAspectsRegistry',
    'core/components/animationsMixin',
    'core/components/baseCompMixin',
    'core/components/skinBasedComp',
    'core/components/runTimeCompData',
    'core/components/blockOuterScrollMixin',
    'core/components/optionInput',
    'core/components/skinInfo',
    'core/core/SiteDataAPI',
    'core/siteRender/SiteAPI',
    'core/core/data/RuntimeDal',
    'core/components/audioMixin',
    'core/components/util/galleryPagingCalculations',
    'core/components/util/boxSlideShowCommon',
    'core/components/mediaZoomWrapperMixin',
    'core/components/galleryImageExpandedActionMixin',
    'core/components/util/matrixAnimationManipulation',
    'core/components/uniquePageIdMixin',
    'core/siteRender/WixSiteHeadRenderer',
    'core/activities/activityTypes',
    'core/activities/activityService',
    'core/siteRender/SiteAspectsSiteAPI',
    'core/bi/events',
    'core/components/renderDoneMixin',
    'core/components/wixTransitionGroup',
    'core/components/wixTransitionItem',
    'core/components/behaviorHandlers/behaviorHandlersFactory',
    'core/components/siteAspects/behaviorsService',
    'core/core/data/pointers/pointers',
    'core/siteRender/WixSiteReact',
    'core/components/fullScreenOverlay/fullScreenOverlay',
    'core/bi/errors',
    'core/components/compStateMixin',
    'core/components/siteAspects/animationsService',

    'core/components/siteAspects/aspectsCollector',
    'core/components/siteAspects/AudioAspect',
    'core/siteRender/siteBehaviorsRegistrar',
    'core/core/siteHooks/pageLoadHooks'
], function (utils, site, compRegistrar, styleCollector, dataRequirementsChecker,
             siteAspectsRegistry, animationsMixin,
             baseCompMixin, skinBasedComp, runTimeCompData, blockOuterScrollMixin, optionInput, skinInfo,
             SiteDataAPI, SiteAPI, RuntimeDal, audioMixin,
             galleryPagingCalculations, boxSlideShowCommon,
             mediaZoomWrapperMixin, galleryImageExpandedActionMixin, matrixAnimationManipulation, uniquePageIdMixin,
             WixSiteHeadRenderer, activityTypes, activityService, SiteAspectsSiteAPI, events, renderDoneMixin, wixTransitionGroup,
             wixTransitionItem, behaviorHandlersFactory, behaviorsService, pointers, WixSiteReact, fullScreenOverlay, errors, compStateMixin, animationsService) {
    'use strict';
    //externalScriptLoader & AudioAspect - are here because someone requires it!!, if you see that there are more than 2 creatures like this here
    //please extract to another file
    /**
     * @class core
     */
    return {
        /** @type core.SiteData */
        SiteData: utils.SiteData,
        SiteDataAPI: SiteDataAPI,
        /** @type core.SiteAPI */
        SiteAPI: SiteAPI,
        RuntimeDal: RuntimeDal,
        MobileDeviceAnalyzer: utils.MobileDeviceAnalyzer,
        renderer: site,
        WixSiteHeadRenderer: WixSiteHeadRenderer,
        compRegistrar: compRegistrar,
        /** @type core.styleCollector */
        styleCollector: styleCollector,
        dataRequirementsChecker: dataRequirementsChecker,
        siteAspectsRegistry: siteAspectsRegistry,
        compMixins: {
            intervalsMixin: utils.timerMixins.intervalsMixin,
            timeoutsMixin: utils.timerMixins.timeoutsMixin,
            skinBasedComp: skinBasedComp,
            runTimeCompData: runTimeCompData,
            animationsMixin: animationsMixin,
            optionInput: optionInput,
            skinInfo: skinInfo,
            audioMixin: audioMixin,
            mediaZoomWrapperMixin: mediaZoomWrapperMixin,
            galleryImageExpandedActionMixin: galleryImageExpandedActionMixin,
            baseCompMixin: baseCompMixin.baseComp,
            postMessageCompMixin: utils.postMessageCompMixin,
            uniquePageIdMixin: uniquePageIdMixin,
            renderDoneMixin: renderDoneMixin,
            blockOuterScrollMixin: blockOuterScrollMixin,
            compStateMixin: compStateMixin
        },
        componentUtils: {
            fullScreenOverlay: fullScreenOverlay,
            galleryPagingCalculations: galleryPagingCalculations,
            matrixAnimationManipulation: matrixAnimationManipulation,
            boxSlideShowCommon: boxSlideShowCommon
        },
        activityTypes: activityTypes,
        activityService: activityService,
        SiteAspectsSiteAPI: SiteAspectsSiteAPI,
        behaviorHandlersFactory: behaviorHandlersFactory,
        behaviorsService: behaviorsService,
        wixTransitionGroup: wixTransitionGroup,
        wixTransitionItem: wixTransitionItem,
        biEvents: events,
        DataAccessPointers: pointers.DataAccessPointers,
        PointersCache: pointers.PointersCache,
        pointerGeneratorsRegistry: pointers.pointerGeneratorsRegistry,
        forTests: {
            WixSiteReact: WixSiteReact
        },
        errors: errors,
        animationsService: animationsService
    };
});
