define([], function () {
    'use strict';

    return {
        'core.components.Container': [
            'wysiwyg.viewer.skins.area.ForkedRightRibbon',
            'wysiwyg.viewer.skins.area.CustomRibbonArea',
            'wysiwyg.viewer.skins.area.LinesAreaSkin',
            'wysiwyg.viewer.skins.area.RoundArea',
            'wysiwyg.viewer.skins.area.RoundShadowArea',
            'wysiwyg.viewer.skins.area.BlankAreaSkin',
            'wysiwyg.viewer.skins.area.TransparentArea',
            'wysiwyg.viewer.skins.area.BubbleAreaLeft',
            'wysiwyg.viewer.skins.area.LeftTriangleArea',
            'wysiwyg.viewer.skins.area.RightTriangleArea',
            'wysiwyg.viewer.skins.area.BubbleAreaRight',
            'wysiwyg.viewer.skins.area.IronBox',
            'wysiwyg.viewer.skins.area.PhotoArea'
        ],

        'wysiwyg.viewer.components.WPhoto': [
            'wysiwyg.viewer.skins.photo.DoubleBorderCirclePhoto',
            'wysiwyg.viewer.skins.photo.VintagePhoto',
            'wysiwyg.viewer.skins.photo.DefaultPhoto',
            'wysiwyg.viewer.skins.photo.RoundShadowPhoto',
            'wysiwyg.viewer.skins.photo.ScotchTapePhoto',
            'wysiwyg.viewer.skins.photo.PaperclipPhoto',
            'wysiwyg.viewer.skins.photo.ScotchDoubleHorizontal',
            'wysiwyg.viewer.skins.photo.ScotchDoubleVertical',
            'wysiwyg.viewer.skins.photo.ScotchTopPhoto',
            'wysiwyg.viewer.skins.photo.IronPhoto',
            'wysiwyg.viewer.skins.photo.GlowLinePhoto',
            'wysiwyg.viewer.skins.photo.NewPolaroidPhoto'
        ],

        'wysiwyg.viewer.components.HorizontalMenu': [
            'wysiwyg.viewer.skins.menu.SeparateArrowDownMenuSkin',
            'wysiwyg.viewer.skins.menu.ArrowsMenuSkin',
            'wysiwyg.viewer.skins.menu.SeparatedArrowsMenuSkin',
            'wysiwyg.viewer.skins.menu.CirclesMenuSkin',
            'wysiwyg.viewer.skins.horizontalmenu.BevelMenu',
            'wysiwyg.viewer.skins.horizontalmenu.ArrowsMenu',
            'wysiwyg.viewer.skins.horizontalmenu.DefaultMenu',
            'wysiwyg.viewer.skins.horizontalmenu.AppleMenu',
            'wysiwyg.viewer.skins.horizontalmenu.RectangleMenu',
            'wysiwyg.viewer.skins.horizontalmenu.TabsMenu',
            'wysiwyg.viewer.skins.horizontalmenu.OverlinesMenu',
            'wysiwyg.viewer.skins.horizontalmenu.Overlines2Menu',
            'wysiwyg.viewer.skins.horizontalmenu.PillMenu',
            'wysiwyg.viewer.skins.horizontalmenu.BaseMenu',
            'wysiwyg.viewer.skins.horizontalmenu.BevelMenu',
            'wysiwyg.viewer.skins.horizontalmenu.CirclesMenu',
            'wysiwyg.viewer.skins.horizontalmenu.Lines2Menu',
            'wysiwyg.viewer.skins.horizontalmenu.LinesMenu',
            'wysiwyg.viewer.skins.horizontalmenu.PointerMenu',
            'wysiwyg.viewer.skins.horizontalmenu.RibbonsMenu',
            'wysiwyg.viewer.skins.horizontalmenu.Ribbons2Menu',
            'wysiwyg.viewer.skins.horizontalmenu.TextOnlyMenu'
        ],


        // START:  Screen Container
        'wysiwyg.viewer.components.ScreenWidthContainer': [
            'wysiwyg.viewer.skins.screenwidthcontainer.GridScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.TransparentHalfScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.TwoColorScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.LineBottomScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.ShadowScreen'
        ],
        'wysiwyg.viewer.components.HeaderContainer': [
            'wysiwyg.viewer.skins.screenwidthcontainer.IronScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.BoxScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.SolidScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.NoiseScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.LineBottomScreen'
        ],
        'wysiwyg.viewer.components.FooterContainer': [

            'wysiwyg.viewer.skins.screenwidthcontainer.IronScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.BoxScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.SolidScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.NoiseScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.LineTopScreen'
        ],
        'wysiwyg.viewer.components.PagesContainer': [
            'wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.BevelScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.BoxScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.LiftedShadowScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.AppleScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.GridScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.TransparentHalfScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.TwoColorScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.LineBottomScreen',
            'wysiwyg.viewer.skins.screenwidthcontainer.ShadowScreen'
        ],
        'wysiwyg.viewer.components.FiveGridLine': [
            'wysiwyg.viewer.skins.line.FadeLine',
            'wysiwyg.viewer.skins.line.DoubleLine2',
            'wysiwyg.viewer.skins.line.DoubleLine3'
        ],

        'wysiwyg.viewer.components.VerticalLine': [
            'wysiwyg.viewer.skins.VerticalLineSkin'
        ],

        // START:   Buttons
        'wysiwyg.viewer.components.SiteButton': [
            'wysiwyg.viewer.skins.button.ButtonDoubleArrowLeft',
            'wysiwyg.viewer.skins.button.ButtonDoubleArrowRight',
            'wysiwyg.viewer.skins.button.ButtonSandclock',
            'wysiwyg.viewer.skins.button.ButtonForkedRight',
            'wysiwyg.viewer.skins.button.ButtonForkedLeft',
            'wysiwyg.viewer.skins.button.IronButton',
            'wysiwyg.viewer.skins.button.ShineButton',
            'wysiwyg.viewer.skins.button.BorderButton',
            'wysiwyg.viewer.skins.button.PillButton',
            'wysiwyg.viewer.skins.button.ShinyPillButton',
            'wysiwyg.viewer.skins.button.ShinyGradientButton',
            'wysiwyg.viewer.skins.button.SiteButtonSkin',
            'wysiwyg.viewer.skins.button.PlasticButton'
        ],

        'wysiwyg.viewer.components.MatrixGallery': [
            'wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryTextBelowSkin',
            'wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryPolaroidSkin',
            'wysiwyg.viewer.skins.gallery.CircleMatrixGallery',
            'wysiwyg.viewer.skins.gallerymatrix.MatrixGalleryVintage'
        ],

        'wysiwyg.viewer.components.SlideShowGallery': [
            'wysiwyg.viewer.skins.gallery.SlideShowGallerySimple',
            'wysiwyg.viewer.skins.gallery.RibbonsSlideShow',
            'wysiwyg.viewer.skins.gallery.FrameShowGallery',
            'wysiwyg.viewer.skins.gallery.RoundSlideShowGallery'
        ],

        'wysiwyg.viewer.components.SliderGallery': [
            'wysiwyg.viewer.skins.gallery.SliderGalleryMinimal',
            'wysiwyg.viewer.skins.gallery.SliderGalleryBorder',
            'wysiwyg.viewer.skins.galleryslider.SliderGalleryVintageSkin'

        ],
        'wysiwyg.viewer.components.AudioPlayer': [
            'wysiwyg.viewer.skins.AudioPlayerMinimalSkin'
        ],
        'core.components.Page': [
            'wysiwyg.viewer.skins.area.RectangleArea',
            'skins.core.VerySimpleSkin'
        ]
    };
});
