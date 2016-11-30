define(['lodash', 'experiment'], function(_, experiment) {
    'use strict';

    var replacementMap = {
        'mobile.core.skins.InlineSkin': 'skins.core.VerySimpleSkin',
        'mobile.core.skins.TwitterTweetSkin': 'skins.core.TwitterTweetSkin',
        'mobile.core.skins.ButtonSkin': 'skins.core.ButtonSkin',
        'mobile.core.skins.ContactItemSkin': 'skins.core.ContactItemSkin',
        'mobile.core.skins.ContactListSkin': 'skins.core.ContactListSkin',
        'mobile.core.skins.FacebookCommentSkin': 'skins.core.FacebookCommentSkin',
        'mobile.core.skins.GlobalMenuSkin': 'skins.core.GlobalMenuSkin',
        'mobile.core.skins.GooglePlusOneSkin': 'skins.core.GooglePlusOneSkin',
        'mobile.core.skins.HeaderSkin': 'skins.core.HeaderSkin',
        'mobile.core.skins.HomeButtonSkin': 'skins.core.HomeButtonSkin',
        'mobile.core.skins.ImageNewSkin': 'skins.core.ImageNewSkin',
        'mobile.core.skins.ImageSkin': 'skins.core.ImageSkin',
        'mobile.core.skins.MenuButtonSkin': 'skins.core.MenuButtonSkin',
        'mobile.core.skins.NetworkItemSkin': 'skins.core.NetworkItemSkin',
        'mobile.core.skins.NetworkListSkin': 'skins.core.NetworkListSkin',
        'mobile.core.skins.PageTitleSkin': 'skins.core.PageTitleSkin',
        'mobile.core.skins.PhotoFullScreenSkin': 'skins.core.PhotoFullScreenSkin',
        'mobile.core.skins.PhotoGalleryFullScreenDefaultSkin': 'skins.core.PhotoGalleryFullScreenDefaultSkin',
        'mobile.core.skins.PhotoGalleryGridDefaultSkin': 'skins.core.PhotoGalleryGridDefaultSkin',
        'mobile.core.skins.PhotoSkin': 'skins.core.PhotoSkin',
        'mobile.core.skins.RichTextImageSkin': 'skins.core.RichTextImageSkin',
        'mobile.core.skins.RichTextSkin': 'skins.core.RichTextSkin',
        'mobile.core.skins.ServiceItemSkin': 'skins.core.ServiceItemSkin',
        'mobile.core.skins.ServiceListSkin': 'skins.core.ServiceListSkin',
        'mobile.core.skins.SimpleButtonSkin': 'skins.core.SimpleButtonSkin',
        'mobile.core.skins.SiteNavigationMenuSkin': 'skins.core.SiteNavigationMenuSkin',
        'mobile.core.skins.TwitterFollowSkin': 'skins.core.TwitterFollowSkin',
        'mobile.core.skins.FacebookLikeSkin': 'skins.core.FacebookLikeSkin',

        'skins.viewer.gallerymatrix.PolaroidCustomHeightSkin': 'wysiwyg.viewer.skins.gallerymatrix.PolaroidCustomHeightSkin',
        'skins.viewer.gallerymatrix.PolaroidDisplayerCustomHeightSkin': 'wysiwyg.viewer.skins.gallerymatrix.PolaroidDisplayerCustomHeightSkin',
        'skins.viewer.gallerymatrix.TextBottomCustomHeightSkin': 'wysiwyg.viewer.skins.gallerymatrix.TextBottomCustomHeightSkin',
        'skins.viewer.gallerymatrix.TextBottomDisplayerCustomHeightSkin': 'wysiwyg.viewer.skins.gallerymatrix.TextBottomDisplayerCustomHeightSkin',

        'skins.viewer.galleryslider.SliderGalleryScotchTapeSkin': 'wysiwyg.viewer.skins.galleryslider.SliderGalleryScotchTapeSkin',
        'skins.viewer.galleryslider.SliderGalleryIronSkin': 'wysiwyg.viewer.skins.galleryslider.SliderGalleryIronSkin',
        'skins.viewer.galleryslider.SliderDisplayerIronSkin': 'wysiwyg.viewer.skins.galleryslider.SliderDisplayerIronSkin',
        'skins.viewer.galleryslider.SliderDisplayerScotchTapeSkin': 'wysiwyg.viewer.skins.galleryslider.SliderDisplayerScotchTapeSkin',
        'wysiwyg.viewer.skins.gallerymatrix.MatrixGallerySeparateTextBoxSkin': 'wysiwyg.common.components.matrixgallery.viewer.skins.MatrixGallerySeparateTextBoxSkin',
        'wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryTextOnCenterSkin': 'wysiwyg.common.components.matrixgallery.viewer.skins.MatrixGalleryTextOnCenterSkin',


        'wysiwyg.viewer.skins.dropmenu.TextOnlyMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.TextOnlyMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.TextSeparatorsMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.TextSeparatorsMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.SolidColorMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SolidColorMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.ShinyMenuINSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.ShinyMenuIButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.ShinyMenuIINSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.ShinyMenuIIButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.OverlineMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.OverlineMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.SeparateBasicMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateBasicMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.SeparateShinyIMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateShinyIMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.SeparateShinyIIMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateShinyIIMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.LinesMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.LinesMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.SeparateLinesMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateLinesMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.PointerMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.PointerMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.RibbonsMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.RibbonsMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.VerticalRibbonsMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.VerticalRibbonsMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.IndentedMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.IndentedMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.SeparateIndentedMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateIndentedMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.ArrowRightMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.ArrowRightMenuButtonSkin',
        'wysiwyg.viewer.skins.dropmenu.SloppyBorderMenuNSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SloppyBorderMenuButtonSkin',

        /*Deprecated HorizontalMenu skins*/
        'wysiwyg.viewer.skins.menu.ShinyMenuISkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.ShinyMenuIIButtonSkin',
        'wysiwyg.viewer.skins.menu.ShinyMenuIISkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.ShinyMenuIIButtonSkin',
        'wysiwyg.viewer.skins.menu.TextOnlyMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.TextOnlyMenuButtonBgFixSkin',
        'wysiwyg.viewer.skins.menu.TextSeparatorsMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.TextSeparatorsMenuButtonSkin',
        'wysiwyg.viewer.skins.menu.SolidColorMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SolidColorMenuButtonSkin',
        'wysiwyg.viewer.skins.menu.OverlineMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.OverlineMenuButtonHorizontalMenuAdaptationSkin',
        'wysiwyg.viewer.skins.menu.SeparateBasicMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateBasicMenuButtonSkin',
        'wysiwyg.viewer.skins.menu.SeparateShinyIMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateShinyIMenuButtonSkin',
        'wysiwyg.viewer.skins.menu.SeparateShinyIIMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateShinyIIMenuButtonBorderRadiusFixSkin',
        'wysiwyg.viewer.skins.menu.LinesMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.LinesMenuButtonBorderRadiusFixSkin',
        'wysiwyg.viewer.skins.menu.SeparateLinesMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateLinesMenuButtonHorizontalMenuAdaptationSkin',
        'wysiwyg.viewer.skins.menu.PointerMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.PointerMenuButtonHorizontalMenuAdaptationSkin',
        'wysiwyg.viewer.skins.menu.RibbonsMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.RibbonsMenuButtonSkin',
        'wysiwyg.viewer.skins.menu.IndentedMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.IndentedMenuButtonSkin',
        'wysiwyg.viewer.skins.menu.SeparateIndentedMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateIndentedMenuButtonSkin',
        'wysiwyg.viewer.skins.menu.ArrowRightMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.ArrowRightMenuButtonSkin',
        'wysiwyg.viewer.skins.menu.SloppyBorderMenuSkin': 'wysiwyg.common.components.dropdownmenu.viewer.skins.SloppyBorderMenuButtonSkin',

        'tpa.viewer.skins.TPAMasonrySkin': 'wysiwyg.viewer.skins.TPAMasonrySkin',
        'tpa.viewer.skins.TPA3DCarouselSkin': 'wysiwyg.viewer.skins.TPA3DCarouselSkin',
        'tpa.viewer.skins.TPA3DGallerySkin': 'wysiwyg.viewer.skins.TPA3DGallerySkin',
        'tpa.viewer.skins.TPAAccordionSkin': 'wysiwyg.viewer.skins.TPAAccordionSkin',
        'tpa.viewer.skins.TPACollageSkin': 'wysiwyg.viewer.skins.TPACollageSkin',
        'tpa.viewer.skins.TPAEcomGallerySkin': 'wysiwyg.viewer.skins.TPAEcomGallerySkin',
        'tpa.viewer.skins.TPAFreestyleSkin': 'wysiwyg.viewer.skins.TPAFreestyleSkin',
        'tpa.viewer.skins.TPAHoneycombSkin': 'wysiwyg.viewer.skins.TPAHoneycombSkin',
        'tpa.viewer.skins.TPAImpressSkin': 'wysiwyg.viewer.skins.TPAImpressSkin',
        'tpa.viewer.skins.TPAStripShowcaseSkin': 'wysiwyg.viewer.skins.TPAStripShowcaseSkin',
        'tpa.viewer.skins.TPAStripSlideshowSkin': 'wysiwyg.viewer.skins.TPAStripSlideshowSkin',
        'tpa.viewer.skins.TPAThumbnailsSkin': 'wysiwyg.viewer.skins.TPAThumbnailsSkin',

        'tpa.common.skins.TPAPreloaderSkin': 'wysiwyg.viewer.skins.TPAPreloaderSkin',
        'tpa.common.skins.TPAUnavailableMessageOverlaySkin': 'wysiwyg.viewer.skins.TPAUnavailableMessageOverlaySkin'
    };

    if (experiment.isOpen('migrateTextStyle')) {
        replacementMap['wysiwyg.viewer.skins.WRichTextSkin'] = 'wysiwyg.viewer.skins.WRichTextNewSkin';
    }

    function replaceNameIfNeeded(component) {
        if (component.skin && replacementMap[component.skin]) {
            component.skin = replacementMap[component.skin];
        }
    }

    function fixSkinName(component, componentsName) {
        var i, children = component[componentsName] || component.components, curChild;
        if (!children) {
            return;
        }

        for (i = 0; i < children.length; i++) {
            curChild = children[i];
            replaceNameIfNeeded(curChild);
            fixSkinName(curChild, componentsName);
        }
    }

    /**
     * @exports utils/dataFixer/plugins/skinFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function(pageJson) {
            var structureData = pageJson.structure, themeData;
            if (structureData) {
                fixSkinName(structureData, "children");
                fixSkinName(structureData, "mobileComponents");
                replaceNameIfNeeded(structureData);
            }

            themeData = pageJson.data && pageJson.data.theme_data;
            if (themeData) {
                _.forEach(themeData, function (data) {
                    replaceNameIfNeeded(data);
                });
            }
        }
    };

    return exports;
});
