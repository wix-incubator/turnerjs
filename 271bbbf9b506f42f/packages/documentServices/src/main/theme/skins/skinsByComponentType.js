define(['experiment'], function (experiment) {
    'use strict';

    var brandButtonSkinExperiment = experiment.isOpen('brandButtonSkin');

    return {
        'wysiwyg.viewer.components.svgshape.SvgShape': [
            'skins.viewer.svgshape.SvgShapeDefaultSkin'
        ],

        'wysiwyg.viewer.components.PayPalButton': [
            'wysiwyg.viewer.skins.PayPalButtonSkin'
        ],
        // START:  Area
        'core.components.Container': [
            'wysiwyg.viewer.skins.area.DefaultAreaSkin',
            'wysiwyg.viewer.skins.area.RectangleArea',
            'wysiwyg.viewer.skins.area.AppleArea',
            'wysiwyg.viewer.skins.area.CircleArea',
            'wysiwyg.viewer.skins.area.BubbleArea',
            'wysiwyg.viewer.skins.area.BubbleLeftArea',
            'wysiwyg.viewer.skins.area.RibbonAreaSkin',
            'wysiwyg.viewer.skins.area.ThreeDeeAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedShadowArea',
            'wysiwyg.viewer.skins.area.LiftedTopAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedBottomAreaSkin',
            'wysiwyg.viewer.skins.area.InnerShadowAreaSkin',
            'wysiwyg.viewer.skins.area.SloopyArea',
            'wysiwyg.viewer.skins.area.BorderDashDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.ForkedRibbonArea',
            'wysiwyg.viewer.skins.area.VerticalRibbonArea',
            'wysiwyg.viewer.skins.area.CenterRibbon',
            'wysiwyg.viewer.skins.area.ArrowRightRibbon',
            'wysiwyg.viewer.skins.area.VerticalArrowArea',
            'wysiwyg.viewer.skins.area.SandClockArea',
            'wysiwyg.viewer.skins.area.DBDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.BubbleAreaLeft',
            'wysiwyg.viewer.skins.area.LeftTriangleArea',
            'wysiwyg.viewer.skins.area.RightTriangleArea',
            'wysiwyg.viewer.skins.area.BubbleAreaRight',
            'wysiwyg.viewer.skins.area.IronBox',
            'wysiwyg.viewer.skins.area.PhotoArea',
            'wysiwyg.viewer.components.Group',
            'skins.viewer.area.ScotchTopArea',
            'skins.viewer.area.ScotchDoubleHorizontalArea',
            'skins.viewer.area.ScotchDoubleVerticalArea'
        ],
        'wysiwyg.viewer.components.HoverBox': [
            'wysiwyg.viewer.skins.mediaContainer.DefaultMediaContainer'
        ],
        'wysiwyg.viewer.components.HoverBox_old': [
            'wysiwyg.viewer.skins.area.DefaultAreaSkin',
            'wysiwyg.viewer.skins.area.RectangleArea',
            'wysiwyg.viewer.skins.area.AppleArea',
            'wysiwyg.viewer.skins.area.CircleArea',
            'wysiwyg.viewer.skins.area.BubbleArea',
            'wysiwyg.viewer.skins.area.BubbleLeftArea',
            'wysiwyg.viewer.skins.area.RibbonAreaSkin',
            'wysiwyg.viewer.skins.area.ThreeDeeAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedShadowArea',
            'wysiwyg.viewer.skins.area.LiftedTopAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedBottomAreaSkin',
            'wysiwyg.viewer.skins.area.InnerShadowAreaSkin',
            'wysiwyg.viewer.skins.area.SloopyArea',
            'wysiwyg.viewer.skins.area.BorderDashDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.ForkedRibbonArea',
            'wysiwyg.viewer.skins.area.VerticalRibbonArea',
            'wysiwyg.viewer.skins.area.CenterRibbon',
            'wysiwyg.viewer.skins.area.ArrowRightRibbon',
            'wysiwyg.viewer.skins.area.VerticalArrowArea',
            'wysiwyg.viewer.skins.area.SandClockArea',
            'wysiwyg.viewer.skins.area.DBDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.BubbleAreaLeft',
            'wysiwyg.viewer.skins.area.LeftTriangleArea',
            'wysiwyg.viewer.skins.area.RightTriangleArea',
            'wysiwyg.viewer.skins.area.BubbleAreaRight',
            'wysiwyg.viewer.skins.area.IronBox',
            'wysiwyg.viewer.skins.area.PhotoArea',
            'wysiwyg.viewer.components.Group',
            'skins.viewer.area.ScotchTopArea',
            'skins.viewer.area.ScotchDoubleHorizontalArea',
            'skins.viewer.area.ScotchDoubleVerticalArea'
        ],
        'core.components.ContainerOBC': [
            'wysiwyg.viewer.skins.area.DefaultAreaSkin',
            'wysiwyg.viewer.skins.area.RectangleArea',
            'wysiwyg.viewer.skins.area.AppleArea',
            'wysiwyg.viewer.skins.area.CircleArea',
            'wysiwyg.viewer.skins.area.BubbleArea',
            'wysiwyg.viewer.skins.area.BubbleLeftArea',
            'wysiwyg.viewer.skins.area.RibbonAreaSkin',
            'wysiwyg.viewer.skins.area.ThreeDeeAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedShadowArea',
            'wysiwyg.viewer.skins.area.LiftedTopAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedBottomAreaSkin',
            'wysiwyg.viewer.skins.area.InnerShadowAreaSkin',
            'wysiwyg.viewer.skins.area.SloopyArea',
            'wysiwyg.viewer.skins.area.BorderDashDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.ForkedRibbonArea',
            'wysiwyg.viewer.skins.area.VerticalRibbonArea',
            'wysiwyg.viewer.skins.area.CenterRibbon',
            'wysiwyg.viewer.skins.area.ArrowRightRibbon',
            'wysiwyg.viewer.skins.area.VerticalArrowArea',
            'wysiwyg.viewer.skins.area.SandClockArea',
            'wysiwyg.viewer.skins.area.DBDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.BubbleAreaLeft',
            'wysiwyg.viewer.skins.area.LeftTriangleArea',
            'wysiwyg.viewer.skins.area.RightTriangleArea',
            'wysiwyg.viewer.skins.area.BubbleAreaRight',
            'wysiwyg.viewer.skins.area.IronBox',
            'wysiwyg.viewer.skins.area.PhotoArea',
            'skins.viewer.area.ScotchTopArea',
            'skins.viewer.area.ScotchDoubleHorizontalArea',
            'skins.viewer.area.ScotchDoubleVerticalArea'
        ],
        'wysiwyg.viewer.components.PopupContainer': [
            'wysiwyg.viewer.skins.stripContainer.DefaultStripContainer'
        ],
        'wysiwyg.viewer.components.WPhoto': [
            'wysiwyg.viewer.skins.photo.NoSkinPhoto',
            'wysiwyg.viewer.skins.photo.MouseOverPhoto',
            'wysiwyg.viewer.skins.photo.RoundPhoto',
            'wysiwyg.viewer.skins.photo.LiftedShadowPhoto',
            'wysiwyg.viewer.skins.photo.LiftedTopPhoto',
            'wysiwyg.viewer.skins.photo.PolaroidPhoto',
            'wysiwyg.viewer.skins.photo.CirclePhoto',
            'wysiwyg.viewer.skins.photo.SloppyPhoto',
            'wysiwyg.viewer.skins.photo.DoubleBorderPhoto',
            'wysiwyg.viewer.skins.photo.ScotchDoubleHorizontal',
            'wysiwyg.viewer.skins.photo.ScotchDoubleVertical',
            'wysiwyg.viewer.skins.photo.ScotchTopPhoto',
            'wysiwyg.viewer.skins.photo.IronPhoto',
            'wysiwyg.viewer.skins.photo.GlowLinePhoto',
            'wysiwyg.viewer.skins.photo.NewPolaroidPhoto'
        ],

        'wixapps.integration.components.AppPart': [
            'wysiwyg.viewer.skins.AppPartSkin'
        ],
        'wixapps.integration.components.AppPage': [
            'wysiwyg.viewer.skins.page.TransparentPageSkin',
            'wysiwyg.viewer.skins.page.SloopyPageSkin',
            'wysiwyg.viewer.skins.page.BasicPageSkin',
            'wysiwyg.viewer.skins.page.ThreeDeePageSkin',
            'wysiwyg.viewer.skins.page.InnerShadowPageSkin',
            'wysiwyg.viewer.skins.page.LiftedBottomPageSkin',
            'wysiwyg.viewer.skins.page.LiftedTopPageSkin',
            'wysiwyg.viewer.skins.page.BorderPageSkin',
            'wysiwyg.viewer.skins.page.LiftedShadowPageSkin',
            'wysiwyg.viewer.skins.page.ShinyIPageSkin'
        ],

        'wysiwyg.viewer.components.FlashComponent': [
            'wysiwyg.viewer.skins.FlashComponentSkin'
        ],


        'wysiwyg.viewer.components.tpapps.TPAWidget': [
            'wysiwyg.viewer.skins.TPAWidgetSkin'
        ],

        'wysiwyg.viewer.components.tpapps.TPASection': [
            'wysiwyg.viewer.skins.TPASectionSkin'
        ],

        'wysiwyg.viewer.components.tpapps.TPAGluedWidget': [
            'wysiwyg.viewer.skins.TPAWidgetSkin'
        ],

        'wysiwyg.viewer.components.tpapps.TPAMultiSection': [
            'wysiwyg.viewer.skins.TPASectionSkin'
        ],

        'wysiwyg.viewer.components.tpapps.TPA3DGallery': [
            'wysiwyg.viewer.skins.TPA3DGallerySkin'
        ],

        'wysiwyg.viewer.components.tpapps.TPA3DCarousel': [
            'wysiwyg.viewer.skins.TPA3DCarouselSkin'
        ],

        'tpa.viewer.components.Masonry': [
            'wysiwyg.viewer.skins.TPAMasonrySkin'
        ],
        'tpa.viewer.components.Accordion': [
            'wysiwyg.viewer.skins.TPAAccordionSkin'
        ],
        'tpa.viewer.components.Impress': [
            'wysiwyg.viewer.skins.TPAImpressSkin'
        ],
        'tpa.viewer.components.Freestyle': [
            'wysiwyg.viewer.skins.TPAFreestyleSkin'
        ],
        'wysiwyg.viewer.components.TouchMediaZoomSlideshow': [
            'wysiwyg.viewer.skins.TouchMediaZoomSlideshow'
        ],
        'wysiwyg.viewer.components.TouchMediaZoomItem': [
            'wysiwyg.viewer.skins.TouchMediaZoomItem'
        ],
        'tpa.viewer.components.Collage': [
            'wysiwyg.viewer.skins.TPACollageSkin'
        ],
        'tpa.viewer.components.Honeycomb': [
            'wysiwyg.viewer.skins.TPAHoneycombSkin'
        ],
        'tpa.viewer.components.StripShowcase': [
            'wysiwyg.viewer.skins.TPAStripShowcaseSkin'
        ],
        'tpa.viewer.components.StripSlideshow': [
            'wysiwyg.viewer.skins.TPAStripSlideshowSkin'
        ],
        'tpa.viewer.components.Thumbnails': [
            'wysiwyg.viewer.skins.TPAThumbnailsSkin'
        ],

        'wysiwyg.viewer.components.menus.DropDownMenu': [
            'wysiwyg.common.components.dropdownmenu.viewer.skins.TextOnlyMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.TextOnlyMenuButtonBgFixSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.TextSeparatorsMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.SolidColorMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.ShinyMenuIButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.ShinyMenuIIButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.OverlineMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateBasicMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateShinyIMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateShinyIIMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.LinesMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateLinesMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.PointerMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.RibbonsMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.VerticalRibbonsMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.IndentedMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.SeparateIndentedMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.SloppyBorderMenuButtonSkin',
            'wysiwyg.common.components.dropdownmenu.viewer.skins.OverlineMenuButtonHorizontalMenuAdaptationSkin'
        ],

        // START:  Horizontal Menu
        'wysiwyg.viewer.components.HorizontalMenu': [
            'wysiwyg.viewer.skins.menu.TextOnlyMenuSkin',
            'wysiwyg.viewer.skins.menu.TextSeparatorsMenuSkin',
            'wysiwyg.viewer.skins.menu.SolidColorMenuSkin',
            'wysiwyg.viewer.skins.menu.ShinyMenuISkin',
            'wysiwyg.viewer.skins.menu.ShinyMenuIISkin',
            'wysiwyg.viewer.skins.menu.OverlineMenuSkin',
            'wysiwyg.viewer.skins.menu.SeparateBasicMenuSkin',
            'wysiwyg.viewer.skins.menu.SeparateShinyIMenuSkin',
            'wysiwyg.viewer.skins.menu.SeparateShinyIIMenuSkin',
            'wysiwyg.viewer.skins.menu.LinesMenuSkin',
            'wysiwyg.viewer.skins.menu.SeparateLinesMenuSkin',
            'wysiwyg.viewer.skins.menu.PointerMenuSkin',
            'wysiwyg.viewer.skins.menu.RibbonsMenuSkin',
            'wysiwyg.viewer.skins.menu.IndentedMenuSkin',
            'wysiwyg.viewer.skins.menu.SeparateIndentedMenuSkin',
            'wysiwyg.viewer.skins.menu.ArrowRightMenuSkin',
            'wysiwyg.viewer.skins.menu.SloppyBorderMenuSkin'
        ],

        'wysiwyg.viewer.components.StripContainer': [
            'wysiwyg.viewer.skins.stripContainer.DefaultStripContainer'
        ],

        'wysiwyg.viewer.components.ScreenWidthContainer': [
            'wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.BevelScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.IronScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.DoubleBorderScreen'
        ],
        'wysiwyg.viewer.components.HeaderContainer': [
            'wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.BevelScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.InnerShadowScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.ThreeDeeScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.TransparentScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.LiftedTopScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.LiftedBottomScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.ShadowBottomScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.IronScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.DoubleBorderScreen'
        ],
        'wysiwyg.viewer.components.FooterContainer': [
            'wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.BevelScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.InnerShadowScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.ThreeDeeScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.TransparentScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.LiftedTopScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.LiftedBottomScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.ShadowTopScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.IronScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.DoubleBorderScreen'
        ],
        'wysiwyg.viewer.components.PageGroup': [
            'wysiwyg.viewer.skins.PageGroupSkin'
        ],
        'wixapps.integration.components.AppPart2': [
            'wysiwyg.viewer.skins.AppPartSkin'
        ],
        'wysiwyg.viewer.components.PagesContainer': [
            'wysiwyg.viewer.skins.screenwidthcontainer.TransparentScreen'
        ],
        'core.components.Page': [
            'wysiwyg.viewer.skins.page.TransparentPageSkin',
            'wysiwyg.viewer.skins.page.SloopyPageSkin',
            'wysiwyg.viewer.skins.page.BasicPageSkin',
            'wysiwyg.viewer.skins.page.ThreeDeePageSkin',
            'wysiwyg.viewer.skins.page.InnerShadowPageSkin',
            'wysiwyg.viewer.skins.page.LiftedBottomPageSkin',
            'wysiwyg.viewer.skins.page.LiftedTopPageSkin',
            'wysiwyg.viewer.skins.page.BorderPageSkin',
            'wysiwyg.viewer.skins.page.LiftedShadowPageSkin',
            'wysiwyg.viewer.skins.page.ShinyIPageSkin'
        ],
        'wysiwyg.viewer.components.FiveGridLine': [
            'wysiwyg.viewer.skins.line.SolidLine',
            'wysiwyg.viewer.skins.line.FadeLine',

            'wysiwyg.viewer.skins.line.FadeNotchTopLine',
            'wysiwyg.viewer.skins.line.FadeNotchBottomLine',
            'wysiwyg.viewer.skins.line.NotchDashedLine',

            'wysiwyg.viewer.skins.line.DashedLine',
            'wysiwyg.viewer.skins.line.DottedLine',
            'wysiwyg.viewer.skins.line.DoubleLine',
            'wysiwyg.viewer.skins.line.NotchLine',
            'wysiwyg.viewer.skins.line.ShadowTopLine',
            'wysiwyg.viewer.skins.line.ShadowBottomLine',

            'wysiwyg.viewer.skins.line.ArrowRightLine',
            'wysiwyg.viewer.skins.line.ArrowLine',
            'wysiwyg.viewer.skins.line.SloppyLine',
            'wysiwyg.viewer.skins.line.IronLine',
            'wysiwyg.viewer.skins.line.ZigzagLineSkin',
            'wysiwyg.viewer.skins.line.ZigzagLineFlipSkin'
        ],

        'wysiwyg.viewer.components.VerticalLine': [
            //'wysiwyg.viewer.skins.VerticalLineSkin',
            'wysiwyg.viewer.skins.line.VerticalSolidLine',

            'wysiwyg.viewer.skins.line.VerticalFadeNotchLeftLine',
            'wysiwyg.viewer.skins.line.VerticalFadeNotchRightLine',
            'wysiwyg.viewer.skins.line.VerticalNotchDashedLine',

            'wysiwyg.viewer.skins.line.VerticalShadowLeftLine',
            'wysiwyg.viewer.skins.line.VerticalShadowRightLine',
            'wysiwyg.viewer.skins.line.VerticalDoubleLine',
            'wysiwyg.viewer.skins.line.VerticalDashedLine',
            'wysiwyg.viewer.skins.line.VerticalDottedLine',
            'wysiwyg.viewer.skins.line.VerticalNotchLine',
            'wysiwyg.viewer.skins.line.VerticalSloopyLine',
            'wysiwyg.viewer.skins.line.VerticalArrowLineTop',
            'wysiwyg.viewer.skins.line.VerticalArrowLine',
            'wysiwyg.viewer.skins.line.VerticalIronLine'
        ],

        'wysiwyg.viewer.components.SiteButton': (function () {
            var buttonSkins = [
                'wysiwyg.viewer.skins.button.BasicButton',
                'wysiwyg.viewer.skins.button.ButtonThreeD',
                'wysiwyg.viewer.skins.button.ButtonLiftedShadow',
                'wysiwyg.viewer.skins.button.ShinyButtonInverted',
                'wysiwyg.viewer.skins.button.ButtonArrow',
                'wysiwyg.viewer.skins.button.ButtonArrowLeft',

                'wysiwyg.viewer.skins.button.ButtonInnerShadow',
                'wysiwyg.viewer.skins.button.ButtonShadowRight',
                'wysiwyg.viewer.skins.button.ButtonShadowLeft',

                'wysiwyg.viewer.skins.button.TextOnlyButtonSkin',
                'wysiwyg.viewer.skins.button.ShinyButtonISkin',
                'wysiwyg.viewer.skins.button.ShinyButtonIISkin',
                'wysiwyg.viewer.skins.button.RibbonButton',

                'wysiwyg.viewer.skins.button.CircleButton',
                'wysiwyg.viewer.skins.button.SloopyButton',
                'wysiwyg.viewer.skins.button.IronButton',
                'wysiwyg.viewer.skins.button.GamingButton',
                'wysiwyg.viewer.skins.button.ScotchTapeButton'
            ];
            if (brandButtonSkinExperiment) {
                buttonSkins.push('wysiwyg.viewer.skins.button.BrandButton');
            }

            return buttonSkins;
        }()),

        'wysiwyg.viewer.components.AdminLogin': [
            'wysiwyg.viewer.skins.button.AdminLoginSkin'
        ],

        'wysiwyg.viewer.components.AdminLoginButton': [
            'wysiwyg.viewer.skins.button.AdminLoginButtonSkin'
        ],

        'wysiwyg.viewer.components.ContactForm': [
            'wysiwyg.viewer.skins.contactform.DefaultContactForm',
            'wysiwyg.viewer.skins.contactform.BasicContactFormSkin',
            'wysiwyg.viewer.skins.contactform.VerticalFormLabelsLeft',
            'wysiwyg.viewer.skins.contactform.VerticalForm',
            'contactform.OverlappingButtonSkin',
            'contactform.FullWidthButtonSkin',
            'contactform.LineOnlySkin',
            'contactform.FieldAnimationSkin'
        ],

        'wysiwyg.viewer.components.MatrixGallery': [
            'wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryDefaultSkin',
            'wysiwyg.viewer.skins.gallerymatrix.TextBottomCustomHeightSkin',
            'wysiwyg.viewer.skins.gallerymatrix.PolaroidCustomHeightSkin',
            'wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryLiftedShadow',
            'wysiwyg.viewer.skins.gallerymatrix.MatrixGallerySloopy',
            'wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryCircleSkin',
            'wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryTextSlideUpSkin',
            'skins.viewer.gallerymatrix.MatrixGalleryIronSkin',
            'skins.viewer.gallerymatrix.MatrixGalleryScotchTapeSkin',
            'wysiwyg.common.components.matrixgallery.viewer.skins.MatrixGalleryTextOnCenterSkin',
            'wysiwyg.common.components.matrixgallery.viewer.skins.MatrixGallerySeparateTextBoxSkin',
            'wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryTransparentSkin'
        ],

        'wysiwyg.viewer.components.SlideShowGallery': [
            'wysiwyg.viewer.skins.gallery.SlideShowTextOverlay',
            'wysiwyg.viewer.skins.gallery.SlideShowTextFloating',
            'wysiwyg.viewer.skins.gallery.SlideShowTextRight',
            'wysiwyg.viewer.skins.gallery.SlideShowPolaroid',
            'wysiwyg.viewer.skins.gallery.SlideShowTextBottom',
            'wysiwyg.viewer.skins.gallery.SlideShowGallerySloopy',
            'wysiwyg.viewer.skins.gallery.SlideShowGalleryLiftedShadowSkin',
            'skins.viewer.gallery.SlideShowIron',
            'skins.viewer.gallery.SlideShowCleanAndSimple2',
            'skins.viewer.gallery.SlideShowScotchTape',
            'skins.viewer.gallery.SlideShowCleanAndSimple'
        ],

        'wysiwyg.viewer.components.SliderGallery': [
            'wysiwyg.viewer.skins.galleryslider.SliderGalleryDefaultSkin',
            'wysiwyg.viewer.skins.galleryslider.SliderGalleryCircleSkin',
            'wysiwyg.viewer.skins.galleryslider.SliderGalleryNoArrow',
            'wysiwyg.viewer.skins.galleryslider.SliderGalleryIronSkin',
            'wysiwyg.viewer.skins.galleryslider.SliderGalleryScotchTapeSkin'
        ],

        'wixapps.integration.components.SelectableSliderGallery': [
            'wysiwyg.viewer.skins.galleryslider.SliderGalleryDefaultSkin',
            'wysiwyg.viewer.skins.galleryslider.SliderGalleryCircleSkin',
            'wysiwyg.viewer.skins.galleryslider.SliderGalleryNoArrow',
            'wysiwyg.viewer.skins.galleryslider.SliderGalleryIronSkin',
            'wysiwyg.viewer.skins.galleryslider.SliderGalleryScotchTapeSkin'
        ],

        'wixapps.integration.components.PaginatedGridGallery': [
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridDefaultSkin',
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridArrowsOutside',
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridOverlay',
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridRibbonArrows',
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridTextBottom'
        ],

        'wysiwyg.viewer.components.PaginatedGridGallery': [
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridDefaultSkin',
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridArrowsOutside',
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridOverlay',
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridRibbonArrows',
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridTextBottom'
        ],
        //
        'wysiwyg.viewer.components.ClipArt': [
            'wysiwyg.viewer.skins.photo.NoSkinPhoto'
        ],

        'wysiwyg.viewer.components.WRichText': [
            'wysiwyg.viewer.skins.WRichTextSkin',
            'wysiwyg.viewer.skins.WRichTextNewSkin'
        ],

        'wysiwyg.viewer.components.FlickrBadgeWidget': [
            'wysiwyg.viewer.skins.FlickrBadgeWidgetSkin'
        ],
        'wysiwyg.viewer.components.LinkBar': [
            'wysiwyg.viewer.skins.LinkBarNoBGSkin'
        ],
        'wysiwyg.viewer.components.TwitterFeed': [
            'wysiwyg.viewer.skins.TwitterFeedSkin'
        ],
        'wysiwyg.viewer.components.WTwitterTweet': [
            'mobile.core.skins.TwitterTweetSkin',
            'skins.core.TwitterTweetSkin'
        ],
        'wysiwyg.viewer.components.WTwitterFollow': [
            'mobile.core.skins.TwitterFollowSkin',
            'skins.core.TwitterFollowSkin'
        ],
        'wysiwyg.viewer.components.WGooglePlusOne': [
            'mobile.core.skins.GooglePlusOneSkin',
            'skins.core.GooglePlusOneSkin'
        ],
        'wysiwyg.viewer.components.GoogleMap': [
            'wysiwyg.viewer.skins.GoogleMapSkin',
            'wysiwyg.viewer.skins.map.GoogleMapDefault',
            'wysiwyg.viewer.skins.map.GoogleMapSloppy',
            'wysiwyg.viewer.skins.map.GoogleMapLiftedShadow'
        ],
        'wysiwyg.viewer.components.WFacebookComment': [
            'mobile.core.skins.FacebookCommentSkin',
            'skins.core.FacebookCommentSkin'
        ],
        "wysiwyg.common.components.disquscomments.viewer.DisqusComments": [
            'wysiwyg.common.components.disquscomments.viewer.skins.DisqusCommentsSkin'
        ],
        'wysiwyg.viewer.components.WFacebookLike': [
            'skins.core.FacebookLikeSkin'
        ],
        'wysiwyg.viewer.components.PinterestFollow': [
            'skins.viewer.pinterestfollow.PinterestFollowSkin'
        ],
        'wysiwyg.viewer.components.Video': [
            'wysiwyg.viewer.skins.VideoSkin',
            'wysiwyg.viewer.skins.video.VideoDefault',
            'wysiwyg.viewer.skins.video.VideoSloppy',
            'wysiwyg.viewer.skins.video.VideoLiftedShadow'
        ],
        'wixapps.integration.components.Video': [
            'wysiwyg.viewer.skins.VideoSkin',
            'wysiwyg.viewer.skins.video.VideoDefault',
            'wysiwyg.viewer.skins.video.VideoSloppy',
            'wysiwyg.viewer.skins.video.VideoLiftedShadow'
        ],
        'wysiwyg.viewer.components.LoginButton': [
            'wysiwyg.viewer.skins.button.LoginButtonSkin'
        ],
        'wysiwyg.viewer.components.EbayItemsBySeller': [
            'wysiwyg.viewer.skins.EbayItemsBySellerSkin'
        ],
        'wysiwyg.viewer.components.HtmlComponent': [
            'wysiwyg.viewer.skins.HtmlComponentSkin'
        ],
        'wysiwyg.viewer.components.SoundCloudWidget': [
            'wysiwyg.viewer.skins.SoundCloudWidgetSkin'
        ],
        'wysiwyg.viewer.components.EbayItemBadge': [
            'wysiwyg.viewer.skins.EbayItemBadgeSkin'
        ],

        'wysiwyg.viewer.components.wixhomepage.WixOfTheDay': [
            'wysiwyg.viewer.skins.wixhomepage.WixOfTheDaySkin'],

        'wysiwyg.viewer.components.wixhomepage.LanguagesDropDown': [
            'wysiwyg.viewer.skins.wixhomepage.LanguagesDropDownSkin'],

        'wysiwyg.viewer.components.wixhomepage.WixHomepageMenu': [
            'wysiwyg.viewer.skins.wixhomepage.WixHomepageMenuSkin',
            'wysiwyg.viewer.skins.wixhomepage.WixHomepageMenuSkin2'],

        'wysiwyg.viewer.components.wixhomepage.HomePageLogin': [
            'wysiwyg.viewer.skins.wixhomepage.HomePageLoginSkin'],
        'minipostGallery': [
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridNoDetail'
        ],
        'contentGallery': [
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridNoDetail'
        ],
        'productGallery': [
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridSimple'
        ],
        'hoverGallery': [
            'wysiwyg.viewer.skins.paginatedgrid.PaginatedGridNoBG'
        ],
        'wysiwyg.viewer.components.TableComponent': [
            'wysiwyg.viewer.skins.table.TableComponentDefaultSkin'
        ],
        'wysiwyg.viewer.components.inputs.NumberInput': [
            'wysiwyg.viewer.skins.input.NumberInputSkin'
        ],

        'ecomAddProduct': [
            'wysiwyg.viewer.skins.button.AddProductButton',
            'wysiwyg.viewer.skins.button.BasicButton',
            'wysiwyg.viewer.skins.button.ButtonThreeD',
            'wysiwyg.viewer.skins.button.ButtonLiftedShadow',
            'wysiwyg.viewer.skins.button.ShinyButtonInverted',
            'wysiwyg.viewer.skins.button.ButtonArrow',
            'wysiwyg.viewer.skins.button.ButtonInnerShadow',
            'wysiwyg.viewer.skins.button.ButtonShadowRight',
            'wysiwyg.viewer.skins.button.ButtonShadowLeft',
            'wysiwyg.viewer.skins.button.TextOnlyButtonSkin',
            'wysiwyg.viewer.skins.button.ShinyButtonISkin',
            'wysiwyg.viewer.skins.button.ShinyButtonIISkin',
            'wysiwyg.viewer.skins.button.RibbonButton',
            'wysiwyg.viewer.skins.button.CircleButton',
            'wysiwyg.viewer.skins.button.SloopyButton',
            'wysiwyg.viewer.skins.button.IronButton',
            'wysiwyg.viewer.skins.button.GamingButton',
            'wysiwyg.viewer.skins.button.ScotchTapeButton'
        ],
        'ecomApplyCoupon': [
            'wysiwyg.viewer.skins.button.ApplyButtonEcom',
            'wysiwyg.viewer.skins.button.BasicButton',
            'wysiwyg.viewer.skins.button.ButtonThreeD',
            'wysiwyg.viewer.skins.button.ButtonLiftedShadow',
            'wysiwyg.viewer.skins.button.ShinyButtonInverted',
            'wysiwyg.viewer.skins.button.ButtonArrow',
            'wysiwyg.viewer.skins.button.ButtonInnerShadow',
            'wysiwyg.viewer.skins.button.ButtonShadowRight',
            'wysiwyg.viewer.skins.button.ButtonShadowLeft',
            'wysiwyg.viewer.skins.button.TextOnlyButtonSkin',
            'wysiwyg.viewer.skins.button.ShinyButtonISkin',
            'wysiwyg.viewer.skins.button.ShinyButtonIISkin',
            'wysiwyg.viewer.skins.button.RibbonButton',
            'wysiwyg.viewer.skins.button.CircleButton',
            'wysiwyg.viewer.skins.button.SloopyButton',
            'wysiwyg.viewer.skins.button.IronButton',
            'wysiwyg.viewer.skins.button.GamingButton',
            'wysiwyg.viewer.skins.button.ScotchTapeButton'
        ],
        'ecomRemoveFromCart': [
            'wysiwyg.viewer.skins.button.FixedFontButton'
        ],

        'ecomViewCart': [
            'wysiwyg.viewer.skins.button.BasicButton',
            'wysiwyg.viewer.skins.button.ButtonThreeD',
            'wysiwyg.viewer.skins.button.ButtonLiftedShadow',
            'wysiwyg.viewer.skins.button.ShinyButtonInverted',
            'wysiwyg.viewer.skins.button.ButtonArrow',
            'wysiwyg.viewer.skins.button.ButtonInnerShadow',
            'wysiwyg.viewer.skins.button.ButtonShadowRight',
            'wysiwyg.viewer.skins.button.ButtonShadowLeft',
            'wysiwyg.viewer.skins.button.TextOnlyButtonSkin',
            'wysiwyg.viewer.skins.button.ShinyButtonISkin',
            'wysiwyg.viewer.skins.button.ShinyButtonIISkin',
            'wysiwyg.viewer.skins.button.RibbonButton',
            'wysiwyg.viewer.skins.button.CircleButton',
            'wysiwyg.viewer.skins.button.SloopyButton',
            'wysiwyg.viewer.skins.button.IronButton',
            'wysiwyg.viewer.skins.button.GamingButton',
            'wysiwyg.viewer.skins.button.ScotchTapeButton'
        ],
        'ecomCheckout': [
            'wysiwyg.viewer.skins.button.BasicButton',
            'wysiwyg.viewer.skins.button.ButtonThreeD',
            'wysiwyg.viewer.skins.button.ButtonLiftedShadow',
            'wysiwyg.viewer.skins.button.ShinyButtonInverted',
            'wysiwyg.viewer.skins.button.ButtonArrow',
            'wysiwyg.viewer.skins.button.ButtonInnerShadow',
            'wysiwyg.viewer.skins.button.ButtonShadowRight',
            'wysiwyg.viewer.skins.button.ButtonShadowLeft',
            'wysiwyg.viewer.skins.button.TextOnlyButtonSkin',
            'wysiwyg.viewer.skins.button.ShinyButtonISkin',
            'wysiwyg.viewer.skins.button.ShinyButtonIISkin',
            'wysiwyg.viewer.skins.button.RibbonButton',
            'wysiwyg.viewer.skins.button.CircleButton',
            'wysiwyg.viewer.skins.button.SloopyButton',
            'wysiwyg.viewer.skins.button.DisabledLayerButton',
            'wysiwyg.viewer.skins.button.IronButton',
            'wysiwyg.viewer.skins.button.GamingButton',
            'wysiwyg.viewer.skins.button.ScotchTapeButton'
        ],
        'ecomAddToCart': [
            'wysiwyg.viewer.skins.button.BasicButton',
            'wysiwyg.viewer.skins.button.ButtonThreeD',
            'wysiwyg.viewer.skins.button.ButtonLiftedShadow',
            'wysiwyg.viewer.skins.button.ShinyButtonInverted',
            'wysiwyg.viewer.skins.button.ButtonArrow',
            'wysiwyg.viewer.skins.button.ButtonInnerShadow',
            'wysiwyg.viewer.skins.button.ButtonShadowRight',
            'wysiwyg.viewer.skins.button.ButtonShadowLeft',
            'wysiwyg.viewer.skins.button.TextOnlyButtonSkin',
            'wysiwyg.viewer.skins.button.ShinyButtonISkin',
            'wysiwyg.viewer.skins.button.ShinyButtonIISkin',
            'wysiwyg.viewer.skins.button.RibbonButton',
            'wysiwyg.viewer.skins.button.CircleButton',
            'wysiwyg.viewer.skins.button.SloopyButton',
            'wysiwyg.viewer.skins.button.IronButton',
            'wysiwyg.viewer.skins.button.GamingButton',
            'wysiwyg.viewer.skins.button.ScotchTapeButton'
        ],
        'ecomCouponBox': [
            'wysiwyg.viewer.skins.apps.DefaultBoxSkin',
            'wysiwyg.viewer.skins.area.RectangleArea',
            'wysiwyg.viewer.skins.area.AppleArea',
            'wysiwyg.viewer.skins.area.CircleArea',
            'wysiwyg.viewer.skins.area.ThreeDeeAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedShadowArea',
            'wysiwyg.viewer.skins.area.LiftedTopAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedBottomAreaSkin',
            'wysiwyg.viewer.skins.area.InnerShadowAreaSkin',
            'wysiwyg.viewer.skins.area.SloopyArea',
            'wysiwyg.viewer.skins.area.BorderDashDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.DBDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.IronBox',
            'wysiwyg.viewer.skins.area.PhotoArea',
            'skins.viewer.area.ScotchTopArea',
            'skins.viewer.area.ScotchDoubleHorizontalArea',
            'skins.viewer.area.ScotchDoubleVerticalArea'
        ],
        'ecomCartHeader': [
            'wysiwyg.viewer.skins.apps.DefaultBoxSkin',
            'wysiwyg.viewer.skins.area.RectangleArea',
            'wysiwyg.viewer.skins.area.AppleArea',
            'wysiwyg.viewer.skins.area.CircleArea',
            'wysiwyg.viewer.skins.area.ThreeDeeAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedShadowArea',
            'wysiwyg.viewer.skins.area.LiftedTopAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedBottomAreaSkin',
            'wysiwyg.viewer.skins.area.InnerShadowAreaSkin',
            'wysiwyg.viewer.skins.area.SloopyArea',
            'wysiwyg.viewer.skins.area.BorderDashDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.DBDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.IronBox',
            'wysiwyg.viewer.skins.area.PhotoArea',
            'skins.viewer.area.ScotchTopArea',
            'skins.viewer.area.ScotchDoubleHorizontalArea',
            'skins.viewer.area.ScotchDoubleVerticalArea'
        ],
        'ecomEmptyCartBG': [
            'wysiwyg.viewer.skins.apps.DefaultBoxSkin',
            'wysiwyg.viewer.skins.area.RectangleArea',
            'wysiwyg.viewer.skins.area.AppleArea',
            'wysiwyg.viewer.skins.area.CircleArea',
            'wysiwyg.viewer.skins.area.ThreeDeeAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedShadowArea',
            'wysiwyg.viewer.skins.area.LiftedTopAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedBottomAreaSkin',
            'wysiwyg.viewer.skins.area.InnerShadowAreaSkin',
            'wysiwyg.viewer.skins.area.SloopyArea',
            'wysiwyg.viewer.skins.area.BorderDashDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.DBDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.IronBox',
            'wysiwyg.viewer.skins.area.PhotoArea',
            'skins.viewer.area.ScotchTopArea',
            'skins.viewer.area.ScotchDoubleHorizontalArea',
            'skins.viewer.area.ScotchDoubleVerticalArea'
        ],
        'ecomTextInput': [
            'wysiwyg.viewer.skins.appinputs.EcomTextInputSkin'
        ],

        'wysiwyg.viewer.components.inputs.ErasableTextInput': [
            'wysiwyg.viewer.skins.appinputs.EcomErasableTextInputSkin'
        ],

        'ecomShippingComboBox': [
            'wysiwyg.viewer.skins.appinputs.EcomComboBoxInputSkin'
        ],

        'ecomFeedbackCheckout': [
            'wysiwyg.viewer.skins.button.AddProductButton',
            'wysiwyg.viewer.skins.button.BasicButton',

            'wysiwyg.viewer.skins.button.ButtonThreeD',
            'wysiwyg.viewer.skins.button.ButtonLiftedShadow',
            'wysiwyg.viewer.skins.button.ShinyButtonInverted',
            'wysiwyg.viewer.skins.button.ButtonArrow',
            'wysiwyg.viewer.skins.button.ButtonInnerShadow',
            'wysiwyg.viewer.skins.button.ButtonShadowRight',
            'wysiwyg.viewer.skins.button.ButtonShadowLeft',

            'wysiwyg.viewer.skins.button.TextOnlyButtonSkin',
            'wysiwyg.viewer.skins.button.ShinyButtonISkin',
            'wysiwyg.viewer.skins.button.ShinyButtonIISkin',
            'wysiwyg.viewer.skins.button.RibbonButton',
            'wysiwyg.viewer.skins.button.CircleButton',
            'wysiwyg.viewer.skins.button.SloopyButton',
            'wysiwyg.viewer.skins.button.IronButton'
        ],
        'ecomFeedbackContinueShopping': [
            'wysiwyg.viewer.skins.button.AddProductButton',
            'wysiwyg.viewer.skins.button.BasicButton',

            'wysiwyg.viewer.skins.button.ButtonThreeD',
            'wysiwyg.viewer.skins.button.ButtonLiftedShadow',
            'wysiwyg.viewer.skins.button.ShinyButtonInverted',
            'wysiwyg.viewer.skins.button.ButtonArrow',
            'wysiwyg.viewer.skins.button.ButtonInnerShadow',
            'wysiwyg.viewer.skins.button.ButtonShadowRight',
            'wysiwyg.viewer.skins.button.ButtonShadowLeft',

            'wysiwyg.viewer.skins.button.TextOnlyButtonSkin',
            'wysiwyg.viewer.skins.button.ShinyButtonISkin',
            'wysiwyg.viewer.skins.button.ShinyButtonIISkin',
            'wysiwyg.viewer.skins.button.RibbonButton',
            'wysiwyg.viewer.skins.button.CircleButton',
            'wysiwyg.viewer.skins.button.SloopyButton',
            'wysiwyg.viewer.skins.button.IronButton'
        ],
        'ecomFeedbackContinueShopping2': [
            'wysiwyg.viewer.skins.button.AddProductButton',
            'wysiwyg.viewer.skins.button.BasicButton',

            'wysiwyg.viewer.skins.button.ButtonThreeD',
            'wysiwyg.viewer.skins.button.ButtonLiftedShadow',
            'wysiwyg.viewer.skins.button.ShinyButtonInverted',
            'wysiwyg.viewer.skins.button.ButtonArrow',
            'wysiwyg.viewer.skins.button.ButtonInnerShadow',
            'wysiwyg.viewer.skins.button.ButtonShadowRight',
            'wysiwyg.viewer.skins.button.ButtonShadowLeft',

            'wysiwyg.viewer.skins.button.TextOnlyButtonSkin',
            'wysiwyg.viewer.skins.button.ShinyButtonISkin',
            'wysiwyg.viewer.skins.button.ShinyButtonIISkin',
            'wysiwyg.viewer.skins.button.RibbonButton',
            'wysiwyg.viewer.skins.button.CircleButton',
            'wysiwyg.viewer.skins.button.SloopyButton',
            'wysiwyg.viewer.skins.button.IronButton'
        ],

        'wysiwyg.viewer.components.VerticalRepeater': [
            'wysiwyg.viewer.skins.VerticalRepeaterEmptySkin',
            'wysiwyg.viewer.skins.VerticalRepeaterSkin'
        ],
        'wixapps.integration.components.HorizontalRepeater': [
            'wysiwyg.viewer.skins.VerticalRepeaterEmptySkin',
            'wysiwyg.viewer.skins.VerticalRepeaterSkin'
        ],
        'wysiwyg.viewer.components.inputs.TextInput': [
            'wysiwyg.viewer.skins.appinputs.AppsTextInputSkin'
        ],
        'wysiwyg.viewer.components.inputs.TextAreaInput': [
            'TextAreaDefaultSkin',
            'wysiwyg.viewer.skins.input.TextAreaInputSkin',
            'wysiwyg.viewer.skins.appinputs.AppsTextAreaInputSkin',
            'wysiwyg.viewer.skins.appinputs.AppsTextAreaInputSkinNoValidation'
        ],
        'wysiwyg.viewer.components.inputs.RadioGroupInput': [
            'wysiwyg.viewer.skins.input.RadioGroupInputSkin'
        ],
        'wixapps.integration.components.inputs.CheckBoxGroupInput': [
            'wysiwyg.viewer.skins.input.CheckBoxGroupInputSkin'
        ],
        'wysiwyg.viewer.components.inputs.ComboBoxInput': [
            'ComboBoxInputSkin',
            'wysiwyg.viewer.skins.input.ComboBoxInputSkin',
            'wysiwyg.viewer.skins.input.ComboBoxInputSkinNoValidation',
            'wysiwyg.viewer.skins.appinputs.AppsComboBoxInputSkin',
            'wysiwyg.viewer.skins.appinputs.AppsComboBoxInputSkinNoValidation'
        ],
        'wysiwyg.viewer.components.inputs.Checkbox': [
            'wysiwyg.viewer.skins.input.CheckboxBasicSkin'
        ],
        'wysiwyg.viewer.components.AudioPlayer': [
            'wysiwyg.viewer.skins.audioplayer.Audio3DPlayer',
            'wysiwyg.viewer.skins.audioplayer.ShinyPlayer',
            'wysiwyg.viewer.skins.audioplayer.SimplePlayer',
            'wysiwyg.viewer.skins.audioplayer.BoldPlayer'
            //'wysiwyg.viewer.skins.AudioPlayerMinimalSkin'
        ],

        'tpa.viewer.components.TPAComponent': [
            'tpa.viewer.skins.TPAWidgetSkin'
        ],



        'wysiwyg.viewer.components.mobile.TinyMenu': [
            'wysiwyg.viewer.skins.mobile.TinyMenuSkin',
            'wysiwyg.viewer.skins.mobile.TinyMenuFullScreenSkin',
            'wysiwyg.viewer.skins.mobile.TinyMenuPullFromLeftSkin',
            'wysiwyg.viewer.skins.mobile.TinyMenuPullFromTopSkin',
            'wysiwyg.viewer.skins.mobile.TinyMenuPullFromRightSkin'
        ],

        'wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton': [
            'wysiwyg.common.components.backtotopbutton.viewer.skins.BackToTopButtonSkin'
        ],

        'wysiwyg.viewer.components.ItunesButton': [
            'skins.viewer.itunesbutton.ItunesButtonSkin'
        ],
        'wysiwyg.viewer.components.documentmedia.DocumentMedia': [
            'skins.viewer.documentmedia.DocumentMediaSkin'
        ],
        'wysiwyg.viewer.components.FacebookShare': [
            'skins.viewer.facebookshare.FacebookShareSkin'
        ],
        'wysiwyg.viewer.components.BgImageStrip': [
            'skins.viewer.bgimagestrip.BgImageStripSkin',
            'skins.viewer.bgimagestrip.BevelScreenSkin',
            'skins.viewer.bgimagestrip.IronScreenSkin',
            'skins.viewer.bgimagestrip.DoubleBorderScreenSkin'
        ],
        'blogPostListBoxStyle': [
            'wysiwyg.viewer.skins.area.DefaultAreaSkin',
            'wysiwyg.viewer.skins.area.RectangleArea',
            'wysiwyg.viewer.skins.area.AppleArea',
            'wysiwyg.viewer.skins.area.CircleArea',
            'wysiwyg.viewer.skins.area.BubbleArea',
            'wysiwyg.viewer.skins.area.BubbleLeftArea',
            'wysiwyg.viewer.skins.area.RibbonAreaSkin',
            'wysiwyg.viewer.skins.area.ThreeDeeAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedShadowArea',
            'wysiwyg.viewer.skins.area.LiftedTopAreaSkin',
            'wysiwyg.viewer.skins.area.LiftedBottomAreaSkin',
            'wysiwyg.viewer.skins.area.InnerShadowAreaSkin',
            'wysiwyg.viewer.skins.area.SloopyArea',
            'wysiwyg.viewer.skins.area.BorderDashDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.VerticalRibbonArea',
            'wysiwyg.viewer.skins.area.ArrowRightRibbon',
            'wysiwyg.viewer.skins.area.VerticalArrowArea',
            'wysiwyg.viewer.skins.area.SandClockArea',
            'wysiwyg.viewer.skins.area.DBDefaultAreaSkin',
            'wysiwyg.viewer.skins.area.BubbleAreaLeft',
            'wysiwyg.viewer.skins.area.LeftTriangleArea',
            'wysiwyg.viewer.skins.area.RightTriangleArea',
            'wysiwyg.viewer.skins.area.BubbleAreaRight',
            'wysiwyg.viewer.skins.area.IronBox',
            'wysiwyg.viewer.skins.area.PhotoArea',
            'skins.viewer.area.ScotchTopArea',
            'skins.viewer.area.ScotchDoubleHorizontalArea',
            'skins.viewer.area.ScotchDoubleVerticalArea'
        ],
        'wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode': [
            'wysiwyg.common.components.exitmobilemode.viewer.skins.ExitMobileModeSkin'
        ],

        'wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer': [
            'wysiwyg.common.components.singleaudioplayer.viewer.skins.SingleAudioPlayerSkin',
            'wysiwyg.common.components.singleaudioplayer.viewer.skins.EPlayerRoundPlay',
            'wysiwyg.common.components.singleaudioplayer.viewer.skins.EPlayerFramedPlay',
            'wysiwyg.common.components.singleaudioplayer.viewer.skins.EPlayerLargePlay'
        ],

        'wysiwyg.common.components.verticalmenu.viewer.VerticalMenu': [
            'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSolidColorSkin',
            'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonFixedWidthSkin',
            'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuTextSkin',
            'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuSeparatedButtonSkin',
            'wysiwyg.common.components.verticalmenu.viewer.skins.VerticalMenuTextWithSeparatorsSkin'
        ],

        'wysiwyg.common.components.subscribeform.viewer.SubscribeForm': [
            'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormPlaceholderSkin',
            'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormBoxLayoutEnvelope',
            'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormBoxLayoutFlat',
            'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormLineLayoutFlat',
            'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormLineLayoutTransparentWithIcon',
            'wysiwyg.common.components.subscribeform.viewer.skins.SubscribeFormBoxLayoutShiny'
        ],

        'wysiwyg.common.components.skypecallbutton.viewer.SkypeCallButton': [
            'wysiwyg.common.components.skypecallbutton.viewer.skins.SkypeCallButtonSkin'
        ],

        'wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton': [
            'wysiwyg.common.components.youtubesubscribebutton.viewer.skins.YouTubeSubscribeButtonSkin'
        ],

        'wysiwyg.common.components.facebooklikebox.viewer.FacebookLikeBox': [
            'wysiwyg.common.components.facebooklikebox.viewer.skins.FacebookLikeBoxSkin'
        ],

        'wysiwyg.common.components.spotifyplayer.viewer.SpotifyPlayer': [
            'wysiwyg.common.components.spotifyplayer.viewer.skins.SpotifyPlayerSkin'
        ],

        'wysiwyg.common.components.spotifyfollow.viewer.SpotifyFollow': [
            'wysiwyg.common.components.spotifyfollow.viewer.skins.SpotifyFollowSkin'
        ],

        'wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt': [
            'wysiwyg.common.components.pinterestpinit.viewer.skins.PinterestPinItSkin'
        ],

        'wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget': [
            'wysiwyg.common.components.pinitpinwidget.viewer.skins.PinItPinWidgetSkin'
        ],

        'wysiwyg.common.components.anchor.viewer.Anchor': [
            'wysiwyg.common.components.anchor.viewer.skins.AnchorSkin'
        ],

        'wysiwyg.common.components.verticalanchorsmenu.viewer.VerticalAnchorsMenu': [
            'wysiwyg.common.components.verticalanchorsmenu.viewer.skins.VerticalAnchorsMenuSymbolSkin',
            'wysiwyg.common.components.verticalanchorsmenu.viewer.skins.VerticalAnchorsMenuTextSkin',
            'wysiwyg.common.components.verticalanchorsmenu.viewer.skins.VerticalAnchorsMenuSymbolWithTextSkin',
            'wysiwyg.common.components.verticalanchorsmenu.viewer.skins.VerticalAnchorsMenuSymbolWithHiddenTextSkin',
            'wysiwyg.common.components.verticalanchorsmenu.viewer.skins.VerticalAnchorsMenuLinkedNoTextSkin'
        ],
        'wysiwyg.viewer.components.BoxSlideShow': [
            'wysiwyg.common.components.boxSlideShow.viewer.skins.thinArrowsLargeSelectedCircleSkin',
            'wysiwyg.common.components.boxSlideShow.viewer.skins.thinArrowsSkin',
            'wysiwyg.common.components.boxSlideShow.viewer.skins.squareButtonsSkin',
            'wysiwyg.common.components.boxSlideShow.viewer.skins.longArrowsLargeSelectedCircleSkin'
        ],
        'wysiwyg.viewer.components.StripContainerSlideShow': [
            'wysiwyg.common.components.stripSlideShow.viewer.skins.thinArrowsLargeSelectedCircleSkin',
            'wysiwyg.common.components.stripSlideShow.viewer.skins.thinArrowsSkin',
            'wysiwyg.common.components.stripSlideShow.viewer.skins.squareButtonsSkin',
            'wysiwyg.common.components.stripSlideShow.viewer.skins.longArrowsLargeSelectedCircleSkin'
        ],
        'wysiwyg.viewer.components.StripColumnsContainer': [
            'wysiwyg.viewer.skins.stripContainer.DefaultStripContainer'
        ],
        'wysiwyg.viewer.components.Column': [
            'wysiwyg.viewer.skins.mediaContainer.DefaultMediaContainer'
        ],
        'wysiwyg.common.components.imagebutton.viewer.ImageButton': [
            'wysiwyg.common.components.imagebutton.viewer.skins.ImageButtonSkin'
        ],
        'wysiwyg.viewer.components.VKShareButton': [
            'skins.viewer.vkshare.VKShareSkin'
        ],
        'wysiwyg.viewer.components.ImageButtonWithText': [
            'wysiwyg.viewer.skins.IconLeftImageButtonWithText'
        ],
        'wysiwyg.viewer.components.inputs.RadioButton': [
            'wysiwyg.common.components.radio.viewer.skins.RadioButtonDefaultSkin'
        ],
        'wysiwyg.viewer.components.inputs.FileUploader': [
            'wysiwyg.viewer.skins.FileUploaderDefaultSkin'
        ],
        'wysiwyg.viewer.components.inputs.DatePicker': [
            'wysiwyg.viewer.skins.input.DatePickerDefaultSkin',
            'wysiwyg.viewer.skins.input.DatePickerTextBetweenNavSkin',
            'wysiwyg.viewer.skins.input.DatePickerTextYearNavSkin'
        ],
        'wysiwyg.viewer.components.Calendar': [
            'wysiwyg.viewer.skins.CalendarDefaultSkin',
            'wysiwyg.viewer.skins.CalendarTextBetweenNavSkin',
            'wysiwyg.viewer.skins.CalendarTextYearNavSkin'
        ],
        'wysiwyg.viewer.components.Month': [
            'wysiwyg.viewer.skins.MonthDefaultSkin'
        ],
        'wysiwyg.viewer.components.Day': [
            'wysiwyg.viewer.skins.DayDefaultSkin'
        ],
        'wysiwyg.viewer.components.inputs.RadioGroup': [
            'skins.input.RadioGroupDefaultSkin'
        ]
    };
});
