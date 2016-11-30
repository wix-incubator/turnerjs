// Register Data
define.dataSchema('SkinMap', {
   components: 'object'
});

define.Const('WSkinEditorData', {
    SKIN_ICONS: '/images/wysiwyg/skinIcons/'
//    SKIN_ICONS: Constants.WSkinEditorData.SKIN_ICONS + ''
//    SKIN_ICONS: W.Config.getServiceTopologyProperty('staticSkinUrl') + '/images/wysiwyg/skinIcons/'
});

define.dataSchema('list-skin', {
    items: 'array'
});

W.Data.addDataItems({
    SKINS: {
        type:'SkinMap',
        components: {
            // Area
            'core.components.Container':[
                'wysiwyg.viewer.skins.area.TransparentArea',
                'wysiwyg.viewer.skins.area.AppleArea',
                'wysiwyg.viewer.skins.area.BubbleArea',
                'wysiwyg.viewer.skins.area.CircleArea',
                'wysiwyg.viewer.skins.area.RoundArea',
                'wysiwyg.viewer.skins.area.RoundShadowArea',
                'wysiwyg.viewer.skins.area.LiftedShadowArea',
                'wysiwyg.viewer.skins.area.RectangleArea',
                'wysiwyg.viewer.skins.area.BubbleLeftArea'
            ],
            //Photo
            'wysiwyg.viewer.components.WPhoto':[
                'wysiwyg.viewer.skins.photo.DefaultPhoto',
                'wysiwyg.viewer.skins.photo.RoundPhoto',
                'wysiwyg.viewer.skins.photo.RoundShadowPhoto',
                'wysiwyg.viewer.skins.photo.LiftedShadowPhoto',
                'wysiwyg.viewer.skins.photo.PolaroidPhoto',
                'wysiwyg.viewer.skins.photo.CirclePhoto',
                'wysiwyg.viewer.skins.photo.SloppyPhoto'
            ],
            // Horizontal Menu
            'wysiwyg.viewer.components.HorizontalMenu':[
                'wysiwyg.viewer.skins.horizontalmenu.DefaultMenu',
                'wysiwyg.viewer.skins.horizontalmenu.AppleMenu',
                'wysiwyg.viewer.skins.horizontalmenu.BevelMenu',
                'wysiwyg.viewer.skins.horizontalmenu.RectangleMenu',
                'wysiwyg.viewer.skins.horizontalmenu.RibbonsMenu',
                'wysiwyg.viewer.skins.horizontalmenu.TabsMenu',
                'wysiwyg.viewer.skins.horizontalmenu.LinesMenu',
                'wysiwyg.viewer.skins.horizontalmenu.TextOnlyMenu' ,
                'wysiwyg.viewer.skins.horizontalmenu.ArrowRightMenuSkin' ,
                'wysiwyg.viewer.skins.horizontalmenu.CirclesMenu',
                'wysiwyg.viewer.skins.horizontalmenu.OverlinesMenu',
                'wysiwyg.viewer.skins.horizontalmenu.Lines2Menu',
                'wysiwyg.viewer.skins.horizontalmenu.PillMenu',
                'wysiwyg.viewer.skins.horizontalmenu.PointerMenu'
            ],
            // Screen Container
            'wysiwyg.viewer.components.ScreenWidthContainer':[
                'wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.BevelScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.GridScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.TransparentHalfScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.TwoColorScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.LineBottomScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.ShadowScreen'
            ],
            'wysiwyg.viewer.components.HeaderContainer':[
                'wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.BevelScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.SolidScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.TransparentScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.NoiseScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.LineBottomScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.ShadowBottomScreen'
            ],
            'wysiwyg.viewer.components.FooterContainer':[
                'wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.BevelScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.ShadowTopScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.SolidScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.TransparentScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.NoiseScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.LineTopScreen'
            ],
            'wysiwyg.viewer.components.PagesContainer':[
                'wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.BevelScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.GridScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.TransparentHalfScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.TwoColorScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.LineBottomScreen',
                'wysiwyg.viewer.skins.screenwidthcontainer.ShadowScreen'
            ],
            'wysiwyg.viewer.components.FiveGridLine':[
                'wysiwyg.viewer.skins.line.SolidLine',
                'wysiwyg.viewer.skins.line.DashedLine',
                'wysiwyg.viewer.skins.line.DottedLine',
                'wysiwyg.viewer.skins.line.DoubleLine',
                'wysiwyg.viewer.skins.line.FadeLine',
                'wysiwyg.viewer.skins.line.SloppyLine',
                'wysiwyg.viewer.skins.line.ArrowLine',
                'wysiwyg.viewer.skins.line.DoubleLine2',
                'wysiwyg.viewer.skins.line.DoubleLine3'
            ],
            // Line Vertical
            'wysiwyg.viewer.components.VerticalLine':[
                'wysiwyg.viewer.skins.VerticalLineSkin',
                'wysiwyg.viewer.skins.line.VerticalSolidLine',
                'wysiwyg.viewer.skins.line.VerticalDoubleLine',
                'wysiwyg.viewer.skins.line.VerticalDashedLine',
                'wysiwyg.viewer.skins.line.VerticalDottedLine',
                'wysiwyg.viewer.skins.line.VerticalArrowLine'
            ],

            'wysiwyg.viewer.components.AdminLoginButton':[

            ],
            // Buttons
            'wysiwyg.viewer.components.SiteButton':[
               // 'wysiwyg.viewer.skins.button.SiteButtonSkin',
                'wysiwyg.viewer.skins.button.ShineButton',
                'wysiwyg.viewer.skins.button.BorderButton',
                'wysiwyg.viewer.skins.button.PillButton',
                'wysiwyg.viewer.skins.button.BasicButton',
                'wysiwyg.viewer.skins.button.ShinyPillButton',
                'wysiwyg.viewer.skins.button.RibbonButton',
                'wysiwyg.viewer.skins.button.PlasticButton'
            ],
            // Contact Form
            'wysiwyg.viewer.components.ContactForm':[
                'wysiwyg.viewer.skins.contactform.DefaultContactForm',
                'wysiwyg.viewer.skins.contactform.BasicContactFormSkin'
            ],
            // Matrix Gallery
            'wysiwyg.viewer.components.MatrixGallery':[
                'wysiwyg.viewer.skins.gallery.MatrixGallerySkin',
                'wysiwyg.viewer.skins.gallery.CircleMatrixGallery',
                'wysiwyg.viewer.skins.gallery.PolaroidMatrixGallery',
                'wysiwyg.viewer.skins.gallery.TextOnRollMatrixGallerySkin',
                'wysiwyg.viewer.skins.gallery.LiftedShadowMatrixGallery',
                'wysiwyg.viewer.skins.gallery.MatrixGalleryMinimal'
            ],
            // SlideShow Gallery
            'wysiwyg.viewer.components.SlideShowGallery':[
                'wysiwyg.viewer.skins.gallery.SlideShowGallerySimple',
                'wysiwyg.viewer.skins.gallery.SlideShowTextOverlay',
                'wysiwyg.viewer.skins.gallery.FrameShowGallery',
                'wysiwyg.viewer.skins.gallery.RoundSlideShowGallery'
            ],
             // Slider Gallery
            'wysiwyg.viewer.components.SliderGallery':[
                'wysiwyg.viewer.skins.gallery.SliderGalleryMinimal',
                'wysiwyg.viewer.skins.gallery.SliderGalleryBorder'
            ],
            //
            'wysiwyg.viewer.components.ClipArt':[
                'wysiwyg.viewer.skins.ClipArtSkin'
            ],
            'wysiwyg.viewer.components.FlickrBadgeWidget':[
                'wysiwyg.viewer.skins.FlickrBadgeWidgetSkin'
            ],
            'wysiwyg.viewer.components.LinkBar':[
                'wysiwyg.viewer.skins.LinkBarNoBGSkin'
            ],
            'wysiwyg.viewer.components.TwitterFeed':[
                'wysiwyg.viewer.skins.TwitterFeedSkin'
            ],
            'wysiwyg.viewer.components.WTwitterTweet':[
                'mobile.core.skins.TwitterTweetSkin'
            ],
            'wysiwyg.viewer.components.WTwitterFollow':[
                'mobile.core.skins.TwitterFollowSkin'
            ],
            'wysiwyg.viewer.components.GoogleMap':[
                'wysiwyg.viewer.skins.GoogleMapSkin'
            ],
            'wysiwyg.viewer.components.WFacebookComment':[
                'mobile.core.skins.FacebookCommentSkin'
            ],
            'wysiwyg.viewer.components.WFacebookLike':[
                'skins.core.FacebookLikeSkin'
            ],
            'wysiwyg.viewer.components.Video':[
                'wysiwyg.viewer.skins.VideoSkin'
            ],
            'wysiwyg.viewer.components.FlashComponent':[
                'wysiwyg.viewer.skins.FlashComponentSkin'
            ],


            'wysiwyg.viewer.components.EbayItemsBySeller':[
                'wysiwyg.viewer.skins.EbayItemsBySellerSkin'
            ],
            'wysiwyg.viewer.components.HtmlComponent':[
                'wysiwyg.viewer.skins.HtmlComponentSkin'
            ],
            'wysiwyg.viewer.components.EbayItemBadge':[
                'wysiwyg.viewer.skins.EbayItemBadgeSkin'
            ]
        }
    },

    SKIN_DESCRIPTION: {
        type:'list-skin',
        skins: {
            // Area
            'wysiwyg.viewer.skins.area.AppleArea' : {
                'description': 'Apple Area skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'box/apple.png'
            },
            'wysiwyg.viewer.skins.area.BubbleArea' : {
                'description': 'Bubble Areaskin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'box/bubble1.png'
            },
            'wysiwyg.viewer.skins.area.CircleArea' : {
                'description': 'Circle Area skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'box/circle.png'
            },
            'wysiwyg.viewer.skins.area.RoundArea' : {
                'description': 'Round Area skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'box/rounded_corner.png'
            },
            'wysiwyg.viewer.skins.area.RoundShadowArea' : {
                'description': 'Round Shadow Area skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'box/rounded_corner_5px_with_shadow.png'
            },
            'wysiwyg.viewer.skins.area.LiftedShadowArea' : {
                'description': 'Lifted Shadow Area skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'box/rounded_lifted_shadow.png'
            },
            'wysiwyg.viewer.skins.area.TransparentArea' : {
                'description': 'Transparent Area skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'box/box_transparent.png'
            },
            'wysiwyg.viewer.skins.area.RectangleArea' : {
                'description': 'Rectangle Area skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'box/rectangle.png'
            },
            'wysiwyg.viewer.skins.area.BubbleLeftArea' : {
                'description': 'Bubble Left Area skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'box/bubble2.png'
            },
            // Photo
            'wysiwyg.viewer.skins.photo.DefaultPhoto': {
                'description': 'Default Photo skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'photoframe/default.png'
            },
            'wysiwyg.viewer.skins.photo.CirclePhoto': {
                'description': 'Circle Photo skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'photoframe/circle.png'
            },
            'wysiwyg.viewer.skins.photo.LiftedShadowPhoto': {
                'description': 'Lifted Shadow Photo skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'photoframe/lifted_shadow.png'
            },
            'wysiwyg.viewer.skins.photo.PolaroidPhoto': {
                'description': 'Polaroid Photo skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'photoframe/palaroid.png'
            },
            'wysiwyg.viewer.skins.photo.RoundPhoto': {
                'description': 'Round Photo skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'photoframe/rounded_corners.png'
            },
            'wysiwyg.viewer.skins.photo.RoundShadowPhoto': {
                'description': 'Round Shadow Photo skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'photoframe/small_shadow.png'
            },
            'wysiwyg.viewer.skins.photo.SloppyPhoto': {
                'description': 'Sloppy Photo skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'photoframe/sloppy.png'
            },
            // Horizontal Menu
            'wysiwyg.viewer.skins.horizontalmenu.AppleMenu': {
                'description': 'Apple Menu skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/apple.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.DefaultMenu': {
                'description': 'Simple rectangle', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/default.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.BevelMenu': {
                'description': 'Bevel Buttons Menu', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/indented.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.RectangleMenu': {
                'description': 'Rectangle Menu skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/rectangle.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.RibbonsMenu': {
                'description': 'Ribbons Menu skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/ribbon_1.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.TabsMenu': {
                'description': 'Tabs Menu skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/tab_rounded.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.LinesMenu': {
                'description': 'Lines Menu skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/lines.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.TextOnlyMenu': {
                'description': 'Text Only Menu skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/text_only.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.ArrowsMenu': {
                'description': 'Arrows Menu skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/arrows2.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.CirclesMenu': {
                'description': 'Circles Menu skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/circle.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.OverlinesMenu': {
                'description': 'Overlines Menu skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/over_line2.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.Lines2Menu': {
                'description': 'Lines Menu II skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/line2.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.PillMenu': {
                'description': 'Pills Menu skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/pill.png'
            },
            'wysiwyg.viewer.skins.horizontalmenu.PointerMenu': {
                'description': 'Pointer Menu skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'menu/arrows.png'
            },

            // Screen Container
            'wysiwyg.viewer.skins.screenwidthcontainer.BlankScreen': {
                'description': 'Blank Screen skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'strip/header_none.png'
            },
            'wysiwyg.viewer.skins.screenwidthcontainer.DefaultScreen': {
                'description': 'Default Screen', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'strip/rectangle.png'
            },
            'wysiwyg.viewer.skins.screenwidthcontainer.BevelScreen': {
                'description': 'Bevel Screen', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'strip/bevel.png'
            },

            'wysiwyg.viewer.skins.screenwidthcontainer.SolidScreen': {
                'description': 'Solid Screen skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'page/page_color.png'
            },
            'wysiwyg.viewer.skins.screenwidthcontainer.TransparentScreen': {
                'description': 'Transparent Screen skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'page/page_transparent.png'
            },
            'wysiwyg.viewer.skins.screenwidthcontainer.TransparentHalfScreen': {
                'description': 'Transparent Half Screen skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'page/page_transparent.png'
            },
            'wysiwyg.viewer.skins.screenwidthcontainer.TwoColorScreen': {
                'description': 'Two Color Screen skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'strip/header_just_color.png'
            },
            'wysiwyg.viewer.skins.screenwidthcontainer.NoiseScreen': {
                'description': 'Noise Screen skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'page/noise.png'
            },
            'wysiwyg.viewer.skins.screenwidthcontainer.LineTopScreen': {
                'description': 'Line Top Screen skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'strip/footer_top_line.png'
            },
            'wysiwyg.viewer.skins.screenwidthcontainer.LineBottomScreen': {
                'description': 'Line Bottom Screen skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'strip/header_bottom_line.png'
            },
            'wysiwyg.viewer.skins.screenwidthcontainer.ShadowScreen': {
                'description': 'Shadow Screen skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'page/page_shadow_square.png'
            },
            'wysiwyg.viewer.skins.screenwidthcontainer.ShadowBottomScreen': {
                'description': 'Shadow Bottom Screen skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'strip/header_bottom_shadow.png'
            },
            'wysiwyg.viewer.skins.screenwidthcontainer.ShadowTopScreen': {
                'description': 'Shadow Top Screen skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'strip/footer_top_shadow.png'
            },
            'wysiwyg.viewer.skins.screenwidthcontainer.GridScreen': {
                'description': 'Grid Screen skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'page/grid.png'
            },
            // Line
            'wysiwyg.viewer.skins.line.SolidLine': {
                'description': 'Solid Line skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_horizontal_basic.png'
            },
            'wysiwyg.viewer.skins.line.DashedLine': {
                'description': 'Dashed Line skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_horizontal_dash.png'
            },
            'wysiwyg.viewer.skins.line.DottedLine': {
                'description': 'Dotted Line skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_horizontal_round_dot.png'
            },
            'wysiwyg.viewer.skins.line.DoubleLine': {
                'description': 'Double Line skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_horizontal_double3.png'
            },
            'wysiwyg.viewer.skins.line.DoubleLine2': {
                'description': 'Double Line 2 skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_horizontal_double2.png'
            },
            'wysiwyg.viewer.skins.line.DoubleLine3': {
                'description': 'Double Line 3 skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_horizontal_double1.png'
            },
            'wysiwyg.viewer.skins.line.FadeLine': {
                'description': 'Fade Line skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_horizontal_shadow.png'
            },
            'wysiwyg.viewer.skins.line.SloppyLine': {
                'description': 'Sloppy Line skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_horizontal_sloppy.png'
            },
            'wysiwyg.viewer.skins.line.ArrowLine': {
                'description': 'Arrow Line skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_horizontal_arrow.png'
            },
            // Line  Vertical
            'wysiwyg.viewer.skins.VerticalLineSkin': {
                'description': 'Vertical Line Skin skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'defaultImage.png'
            },

            'wysiwyg.viewer.skins.line.VerticalDoubleLine': {
                'description': 'Vertical Double Line', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'defaultImage.png'
            },
            'wysiwyg.viewer.skins.line.VerticalSolidLine': {
                'description': 'Solid Line skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_vertical_basic.png'
            },
            'wysiwyg.viewer.skins.line.VerticalDashedLine': {
                'description': 'Dashed Line skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_vertical_dash.png'
            },
            'wysiwyg.viewer.skins.line.VerticalDottedLine': {
                'description': 'Dotted Line skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_vertical_round_dot.png'
            },
            'wysiwyg.viewer.skins.line.VerticalArrowLine': {
                'description': 'Arrow Line skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'lines/line_vertical_arrow.png'
            },
            // Buttons
//            'wysiwyg.viewer.skins.button.SiteButtonSkin': {
//                'description': 'Site Button skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'defaultImage.png'
//            },
            'wysiwyg.viewer.skins.button.ShineButton': {
                'description': 'Shine Button skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'buttons/squre_rounded_corners_with_gradient.png'
            },
            'wysiwyg.viewer.skins.button.BorderButton': {
                'description': 'Border Button skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'buttons/border_round.png'
            },
            'wysiwyg.viewer.skins.button.PillButton': {
                'description': 'Pill Button skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'buttons/pill_basic.png'
            },
            'wysiwyg.viewer.skins.button.BasicButton': {
                'description': 'Basic Button skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'buttons/squre.png'
            },
            'wysiwyg.viewer.skins.button.ShinyPillButton': {
                'description': 'Shiny Pill Button skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'buttons/pill_shiny.png'
            },
            'wysiwyg.viewer.skins.button.RibbonButton': {
                'description': 'Ribbon Button skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'buttons/ribbon.png'
            },
            'wysiwyg.viewer.skins.button.PlasticButton': {
                'description': 'Plastic Button skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'buttons/none.png'
            },
            // Contact Form
            'wysiwyg.viewer.skins.contactform.DefaultContactForm': {
                'description': 'Default Contact Form skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'form/vertical.png'
            },
            'wysiwyg.viewer.skins.contactform.BasicContactFormSkin': {
                'description': 'Basic Contact Form skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'form/horizontal1.png'
            },
            // MatrixGallery
            'wysiwyg.viewer.skins.gallery.MatrixGallerySkin': {
                'description': 'Matrix Gallery Skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'matrixgallery/left_text.png'
            },
            'wysiwyg.viewer.skins.gallery.CircleMatrixGallery': {
                'description': 'Circle Gallery Skin', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'matrixgallery/circle.png'
            },
            'wysiwyg.viewer.skins.gallery.TextOnRollMatrixGallerySkin': {
                'description': 'Text On-roll Gallery', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'matrixgallery/text.png'
            },
            'wysiwyg.viewer.skins.gallery.PolaroidMatrixGallery': {
                'description': 'Polaroid Gallery', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'matrixgallery/gallery_polaroid.png'
            },
            'wysiwyg.viewer.skins.gallery.MatrixGalleryMinimal': {
                'description': 'Minimal Gallery', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'matrixgallery/simple_border__squre.png'
            },
            'wysiwyg.viewer.skins.gallery.LiftedShadowMatrixGallery': {
                'description': 'LiftedShadowMatrixGallery', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'matrixgallery/gallery_polaroid_lifted_shadow.png'
            },

            // Slide Show Gallery
            'wysiwyg.viewer.skins.gallery.SlideShowGallerySimple': {
                'description': 'Slide Show Gallery Simple', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'slidshow/square_border___textbox_on_image.png'
            },
            'wysiwyg.viewer.skins.gallery.SlideShowTextOverlay': {
                'description': 'Text Overlay slide Show', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'slidshow/text_overlay.png'
            },
            'wysiwyg.viewer.skins.gallery.FrameShowGallery': {
                'description': 'Frame Gallery', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'slidshow/basic.png'
            },
            'wysiwyg.viewer.skins.gallery.RoundSlideShowGallery': {
                'description': 'Round Frame Gallery', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'slidshow/basic2.png'
            },
            'wysiwyg.viewer.skins.gallery.RibbonsSlideShow': {
                'description': 'Ribbons Gallery', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'slidshow/ribbons_text_overlay.png'
            },

            // Slider Gallery
            'wysiwyg.viewer.skins.gallery.SliderGalleryMinimal': {
                'description': 'Minimal Gallery', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'slider/minimal.png'
            },
            'wysiwyg.viewer.skins.gallery.SliderGalleryBorder': {
                'description': 'Border Gallery', 'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'slider/rounded_border.png'
            },

            // Media

            'wysiwyg.viewer.skins.ClipArtSkin': {
                'description': 'Clip Art Skin',
                'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'defaultImage.png'
            },

            'wysiwyg.viewer.skins.VideoSkin': {
                'description': 'Video Skin',
                'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'defaultImage.png'
            },

            // html component
            'wysiwyg.viewer.skins.HtmlComponentSkin': {
                'description': 'Html Component Skin',
                'iconUrl': '/src/main/images/wysiwyg/skinIcons/default.png'
            },

            // Forms


                'wysiwyg.viewer.skins.contactform.ContactFormSkin': {
                    'description': 'Contact Form',
                    'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'form/horizontal1.png'
                },

                //Social

               'wysiwyg.viewer.skins.EbayItemsBySellerSkin': {
                    'description': 'eBay',
                    'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'default.png'
                },
                'wysiwyg.viewer.skins.EbayItemBadgeSkin': {
                    'description': 'Ebay Item Badge Skin',
                    'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'default.png'
                },
                'wysiwyg.viewer.skins.GoogleMapSkin': {
                    'description': 'GoogleMapSkin',
                    'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'defaultImage.png'
                },
                'wysiwyg.viewer.skins.TwitterFeedSkin': {
                    'description': 'Twitter FeedSkin',
                    'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'defaultImage.png'
                },

                'wysiwyg.viewer.skins.LinkBarNoBGSkin': {
                    'description': 'Social Bar',
                    'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'defaultImage.png'
                },
                'wysiwyg.viewer.skins.FlickrBadgeWidgetSkin': {
                    'description': 'FlickrBadgeWidgetSkin',
                    'iconUrl': Constants.WSkinEditorData.SKIN_ICONS + 'defaultImage.png'
                }
        }
    }


});
