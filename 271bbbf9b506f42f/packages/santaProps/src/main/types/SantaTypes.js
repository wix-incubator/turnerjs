define([
    'lodash',
    'react',
    'santaProps/utils/propsSelectorsUtils',

    'santaProps/types/modules/BrowserSantaTypes',
    'santaProps/types/modules/ComponentSantaTypes',
    'santaProps/types/modules/DeviceSantaTypes',
    'santaProps/types/modules/LayoutSantaTypes',
    'santaProps/types/modules/LinkSantaTypes',
    'santaProps/types/modules/PinterestSantaTypes',
    'santaProps/types/modules/AppControllerSantaTypes',
    'santaProps/types/modules/SvgShapeSantaTypes',
    'santaProps/types/modules/RenderFlagsSantaTypes',
    'santaProps/types/modules/RequestModelTypes',
    'santaProps/types/modules/MobileTypes',
    'santaProps/types/modules/ServiceTopologySantaTypes',
    'santaProps/types/modules/SiteAspectsSantaTypes',
    'santaProps/types/modules/RequestModelSantaTypes',
    'santaProps/types/modules/PublicModelSantaTypes',
    'santaProps/types/modules/ActivitySantaTypes',
    'santaProps/types/modules/BrowserFlagsSantaTypes',
    'santaProps/types/modules/ThemeSantaTypes',
    'santaProps/types/modules/MenuSantaTypes'
], function (_,
             React,
             propsSelectorsUtils,

             BrowserSantaTypes,
             ComponentSantaTypes,
             DeviceSantaTypes,
             LayoutSantaTypes,
             LinkSantaTypes,
             PinterestSantaTypes,
             AppControllerSantaTypes,
             SvgShapeSantaTypes,
             RenderFlagsSantaTypes,
             RequestModelTypes,
             MobileTypes,
             ServiceTopologySantaTypes,
             SiteAspectsSantaTypes,
             RequestModelSantaTypes,
             PublicModelSantaTypes,
             ActivitySantaTypes,
             BrowserFlagsSantaTypes,
             ThemeSantaTypes,
             MenuSantaTypes) {
    'use strict';

    var applyFetch = propsSelectorsUtils.applyFetch;

    var handleAction = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.getSiteAspect('behaviorsAspect').handleAction;
    });

    var getRootIdsWhichShouldBeRendered = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.getRootIdsWhichShouldBeRendered;
    });

    var setCompState = applyFetch(React.PropTypes.func, function (state) {
        var runtimeDal = state.siteAPI.getRuntimeDal();
        return runtimeDal.setCompState;
    });

    var setCompData = applyFetch(React.PropTypes.func, function (state) {
        var runtimeDal = state.siteAPI.getRuntimeDal();
        return runtimeDal.setCompData;
    });

    var setCompProps = applyFetch(React.PropTypes.func, function (state) {
        var runtimeDal = state.siteAPI.getRuntimeDal();
        return runtimeDal.setCompProps;
    });

    var removeCompState = applyFetch(React.PropTypes.func, function (state) {
        var runtimeDal = state.siteAPI.getRuntimeDal();
        return runtimeDal.removeCompState;
    });

    var fontsMap = applyFetch(React.PropTypes.array, function (state) {
        return state.siteData.getFontsMap();
    });

    var isDebugMode = applyFetch(React.PropTypes.bool, function (state) {
        return state.siteData.isDebugMode();
    });

    var isMobileView = applyFetch(React.PropTypes.bool, function (state) {
        return state.siteData.isMobileView();
    });

    var santaBase = applyFetch(React.PropTypes.string, function (state) {
        return state.siteData.santaBase;
    });

    var onImageUnmount = applyFetch(React.PropTypes.func, function (state) {
        return state.siteData.onImageUnmount;  // already bound to siteData
    });

    var geo = applyFetch(React.PropTypes.string, function (state) {
        return _.get(state, 'siteData.rendererModel.geo');
    });

    var metaSiteId = applyFetch(React.PropTypes.string, function (state) {
        return state.siteData.rendererModel.metaSiteId;
    });

    var useSandboxInHTMLComp = applyFetch(React.PropTypes.string, function (state) {
        return state.siteData.rendererModel.useSandboxInHTMLComp;
    });

    var siteId = applyFetch(React.PropTypes.string, function (state) {
        return state.siteData.rendererModel.siteInfo.siteId;
    });

    var closePopupPage = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.closePopupPage;
    });

    var scrollToAnchor = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.scrollToAnchor;
    });

    var navigateToPage = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.navigateToPage;
    });

    var siteWidth = applyFetch(React.PropTypes.number, function (state) {
        return state.siteData.getSiteWidth();
    });

    var forceBackground = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.forceBackground;
    });

    var disableForcedBackground = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.disableForcedBackground;
    });

    var currentUrl = applyFetch(React.PropTypes.object, function (state) {
        return state.siteData.currentUrl;
    });

    var currentUrlPageId = applyFetch(React.PropTypes.object, function (state) {
        return state.siteData.getCurrentUrlPageId();
    });

    var renderFlags = applyFetch(React.PropTypes.object, function (state) {
        return state.siteData.renderFlags;
    });

    var renderRealtimeConfig = applyFetch(React.PropTypes.object, function (state) {
        return state.siteData.renderRealtimeConfig;
    });

    var reportBI = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.reportBI;
    });

    var isSiteBusy = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.isSiteBusy;
    });

    var isZoomOpened = applyFetch(React.PropTypes.bool, function (state) {
        return state.siteAPI.isZoomOpened();
    });

    var getActiveModes = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.getActiveModes;
    });

    var activateModeById = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.activateModeById;
    });

    var deactivateModeById = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.deactivateModeById;
    });

    var switchModesByIds = applyFetch(React.PropTypes.func, function (state) {
        return state.siteAPI.switchModesByIds;
    });

    var isPremiumUser = applyFetch(React.PropTypes.bool, function (state) {
        return state.siteData.isPremiumUser();
    });

    var isTemplate = applyFetch(React.PropTypes.bool, function (state) {
        return state.siteData.isTemplate();
    });

    var urlFormat = applyFetch(React.PropTypes.string, function (state) {
        return state.siteData.getUrlFormat();
    });

    var getMainPageUrl = applyFetch(React.PropTypes.func, function (state) {
        return state.siteData.getMainPageUrl.bind(state.siteData);
    });

    var getCurrentUrl = applyFetch(React.PropTypes.func, function (state) {
        return state.siteData.getCurrentUrl.bind(state.siteData);
    });

    var origin = applyFetch(React.PropTypes.string, function (state) {
        return state.siteData.getDocumentLocation().origin;
    });

    return {
        Component: ComponentSantaTypes,
        Browser: BrowserSantaTypes,
        Device: DeviceSantaTypes,
        Layout: LayoutSantaTypes,
        Link: LinkSantaTypes,
        Pinterest: PinterestSantaTypes,
        AppController: AppControllerSantaTypes,
        SvgShape: SvgShapeSantaTypes,
        RenderFlags: RenderFlagsSantaTypes,
        Activity: ActivitySantaTypes,
        BrowserFlags: BrowserFlagsSantaTypes,
        requestModel: RequestModelTypes,
        mobile: MobileTypes,

        ServiceTopology: ServiceTopologySantaTypes,
        Theme: ThemeSantaTypes,
        Menu: MenuSantaTypes,

        urlFormat: urlFormat,
        getMainPageUrl: getMainPageUrl,
        getCurrentUrl: getCurrentUrl,
        reportBI: reportBI,
        isMobileView: isMobileView,
        isDebugMode: isDebugMode,
        siteWidth: siteWidth,
        forceBackground: forceBackground,
        disableForcedBackground: disableForcedBackground,
        santaBase: santaBase,
        currentUrl: currentUrl,
        currentUrlPageId: currentUrlPageId,
        isTemplate: isTemplate,
        isPremiumUser: isPremiumUser,
        Behaviors: {
            handleAction: handleAction
        },
        DAL: {
            setCompState: setCompState,
            setCompData: setCompData,
            setCompProps: setCompProps,
            removeCompState: removeCompState
        },
        Fonts: {
            fontsMap: fontsMap
        },
        Images: {
            onImageUnmount: onImageUnmount
        },
        getRootIdsWhichShouldBeRendered: getRootIdsWhichShouldBeRendered,
        popup: {
            close: closePopupPage
        },
        scrollToAnchor: scrollToAnchor,
        navigateToPage: navigateToPage,
        isSiteBusy: isSiteBusy,
        renderFlags: renderFlags,
        renderRealtimeConfig: renderRealtimeConfig,
        RendererModel: {
            geo: geo,
            metaSiteId: metaSiteId,
            useSandboxInHTMLComp: useSandboxInHTMLComp,
            siteId: siteId
        },
        RequestModel: RequestModelSantaTypes,
        PublicModel: PublicModelSantaTypes,
        isZoomOpened: isZoomOpened,
        SiteAspects: SiteAspectsSantaTypes,
        Location: {
            origin: origin
        },
        Modes: {
            getActiveModes: getActiveModes,
            activateModeById: activateModeById,
            deactivateModeById: deactivateModeById,
            switchModesByIds: switchModesByIds
        }
    };
});
