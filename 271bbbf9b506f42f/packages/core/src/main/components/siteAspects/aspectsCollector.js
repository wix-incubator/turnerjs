define([
        'core/core/siteAspectsRegistry',
        'core/components/siteAspects/BehaviorsAspect',
        'core/components/siteAspects/animationsAspect',
        'core/components/siteAspects/DesignDataChangeAspect',

        'core/components/siteAspects/loginToWixAspect',
        'core/components/siteAspects/parentFrameAspect',
        'core/components/siteAspects/vkPostMessageAspect',
        'core/components/siteAspects/packagePickerAspect',
        'core/core/pageItemAspect',
        'core/core/nonPageItemZoomAspect',
        'core/components/siteAspects/externalScriptLoaderAspect',
        'core/siteRender/SiteMembersAspect',
        'core/components/siteAspects/windowFocusEventsAspect',
        'core/components/siteAspects/windowScrollEventAspect',
        'core/components/siteAspects/windowResizeEventAspect',
        'core/components/siteAspects/windowClickEventAspect',
        'core/components/siteAspects/windowKeyboardEventAspect',
        'core/components/siteAspects/MobileActionsMenuAspect',
        'core/components/siteAspects/addComponentAspect',
        'core/components/siteAspects/AudioAspect',
        'core/components/siteAspects/actionsAspect',
        'core/components/siteAspects/DynamicClientSpecMapAspect',
        'core/components/siteAspects/dynamicColorsAspect',
        'core/components/siteAspects/VideoBackgroundAspect',
        'core/components/siteAspects/touchEventsAspect',
        'core/components/siteAspects/anchorLinkChangeEventAspect',
        'core/components/siteAspects/siteScrollingBlockerAspect',
        'core/components/siteAspects/SlideShowComponentAspect',
        'core/components/siteAspects/FormManagerAspect',
        'core/components/siteAspects/RadioGroupsAspect',
        'core/components/siteAspects/mouseWheelOverrideAspect',
        'core/components/siteAspects/svSessionChangeEventAspect'
    ],
    function (siteAspectsRegistry, BehaviorsAspect, AnimationsAspect, DesignDataChangeAspect) {
        "use strict";

        siteAspectsRegistry.registerSiteAspect('behaviorsAspect', BehaviorsAspect);
        siteAspectsRegistry.registerSiteAspect('animationsAspect', AnimationsAspect);
        siteAspectsRegistry.registerSiteAspect('designDataChangeAspect', DesignDataChangeAspect);

    });
