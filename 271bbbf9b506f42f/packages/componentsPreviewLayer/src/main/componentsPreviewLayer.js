define(['previewExtensionsCore',
        'skins',
        'siteUtils',

    /** skin render plugins **/
        'componentsPreviewLayer/skinsRenderPlugins/showCompOnTopRenderPlugin',
        'componentsPreviewLayer/skinsRenderPlugins/hideTextComponentPlugin',
        'componentsPreviewLayer/skinsRenderPlugins/hideCompsRendererPlugin',
        'componentsPreviewLayer/skinsRenderPlugins/showCompWithOpacityRenderPlugin',

    /** visibility plugins **/
        'componentsPreviewLayer/visibilityPlugins/hiddenCompPlugin',
        'componentsPreviewLayer/visibilityPlugins/fixedPositionPlugin',
        'componentsPreviewLayer/visibilityPlugins/appControllerPlugin',

    /** mixin preview extension */
        'componentsPreviewLayer/previewExtensions/mixinExtensions/componentRenderPreviewExtension',
        'componentsPreviewLayer/previewExtensions/mixinExtensions/skinBasedCompPreviewExtension',

    /** components preview extensions */
        'componentsPreviewLayer/previewExtensions/datePickerPreviewExtension',
        'componentsPreviewLayer/previewExtensions/backToTopButtonPreviewExtension',
        'componentsPreviewLayer/previewExtensions/facebookLikePreviewExtension',
        'componentsPreviewLayer/previewExtensions/facebookSharePreviewExtension',
        'componentsPreviewLayer/previewExtensions/socialComponentsPreviewExtension',
        'componentsPreviewLayer/previewExtensions/slideShowGalleryPreviewExtension',
        'componentsPreviewLayer/previewExtensions/tpaUnavailableMessageOverlayPreviewExtension',
        'componentsPreviewLayer/previewExtensions/tpaPreloaderOverlayExtension',
        'componentsPreviewLayer/previewExtensions/tpaModalExtension',
        'componentsPreviewLayer/previewExtensions/tpaPopupExtension',
        'componentsPreviewLayer/previewExtensions/tpaCompsExtension',
        'componentsPreviewLayer/previewExtensions/fixedPositionContainerPreviewExtension',
        'componentsPreviewLayer/previewExtensions/mobileImageZoomDisplayerPreviewExtension',
        'componentsPreviewLayer/previewExtensions/mobileMediaZoomPreviewExtension',
        'componentsPreviewLayer/previewExtensions/blockSiteMembersPreviewExtension',
        'componentsPreviewLayer/previewExtensions/matrixGalleryPreviewExtension',
        'componentsPreviewLayer/previewExtensions/subscribeFormPreviewExtension',
        'componentsPreviewLayer/previewExtensions/formPreviewDataRequirementsChecker',
        'componentsPreviewLayer/previewExtensions/appPartPreviewExtension',
        'componentsPreviewLayer/previewExtensions/appPart2PreviewExtension',
        'componentsPreviewLayer/previewExtensions/wixAdsDesktopPreviewExtension',
        'componentsPreviewLayer/previewExtensions/wixAdsMobilePreviewExtension',
        'componentsPreviewLayer/previewExtensions/homePageLoginPreviewExtension',
        'componentsPreviewLayer/previewExtensions/formPreviewExtension',
        'componentsPreviewLayer/previewExtensions/comboBoxPreviewExtension',
        'componentsPreviewLayer/previewExtensions/controllerPreviewExtension',
        'componentsPreviewLayer/previewExtensions/disqusCommentsPreviewExtension',
        'componentsPreviewLayer/previewExtensions/gridPreviewExtension',
        'componentsPreviewLayer/previewExtensions/googleMapPreviewExtension',
        'componentsPreviewLayer/previewExtensions/subscribeFormRemoveMaxWidthForAddPanel',
        'componentsPreviewLayer/previewExtensions/tinyMenuAddPanelPreviewExtension',


    /** proxies preview extensions */
        'componentsPreviewLayer/previewExtensions/wixappsProxies/previewExtensions',

    /** logic preview extensions */
        'componentsPreviewLayer/previewExtensions/wixappsLogics/logicPreviewExtensions'
    ],
    function (
        previewExtensionsCore,
        skins,
        siteUtils,
        showCompOnTopRenderPlugin,
        hideTextComponentPlugin,
        hideCompsRendererPlugin,
        showCompWithOpacityRenderPlugin,
        hiddenCompPlugin,
        fixedPositionPlugin,
        appControllerPlugin,
        componentRenderPreviewExtension,
        skinBasedCompPreviewExtension
    ) {
        'use strict';

        skins.registerRenderPlugin(showCompOnTopRenderPlugin);
        skins.registerRenderPlugin(hideTextComponentPlugin);
        skins.registerRenderPlugin(hideCompsRendererPlugin);
        skins.registerRenderPlugin(showCompWithOpacityRenderPlugin);

        siteUtils.componentVisibility.registerPlugin(hiddenCompPlugin);
        siteUtils.componentVisibility.registerPlugin(fixedPositionPlugin);
        siteUtils.componentVisibility.registerPlugin(appControllerPlugin);


        previewExtensionsCore.registrar.registerMixinExtension(componentRenderPreviewExtension.mixin, componentRenderPreviewExtension.extension);
        previewExtensionsCore.registrar.registerMixinExtension(skinBasedCompPreviewExtension.mixin, skinBasedCompPreviewExtension.extension);

        previewExtensionsCore.registrar.extendCompMixinClasses();
        previewExtensionsCore.registrar.extendCompClasses();

        /** @exports componentsPreviewLayer */
        return {
            previewExtensionsHooks: previewExtensionsCore.hooks
        };
    });
