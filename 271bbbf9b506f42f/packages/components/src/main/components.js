define([
    /* Add new entries here: */
    'fileUploader',
    'wixSkinOnly',
    'pinItPinWidget',
    'siteButton',
    'popupCloseTextButton',
    'image',
    'zoomedImage',
    'wPhoto',
    'clipArt',
    'displayer',
    'matrixGallery',
    'wRichText',
    'paginatedGridGallery',
    'container',
    'radioButton',
    'radioGroup',
    'headerContainer',
    'footerContainer',
    'screenWidthContainer',
    'documentMedia',
    'adminLoginButton',
    'backgroundCommon',
    'balataCommon',
    'datePicker',
    'contactForm',
    'subscribeForm',
    'textArea',
    'video',
    'loginButton',
    'googleMap',
    'mediaContainer',
    'soundCloudWidget',
    'paypalButton',
    'imageButton',
    'linkBar',
    'comboBoxInput',
    'spotifyPlayer',
    'spotifyFollow',
    'twitterFeed',
    'backToTopButton',
    'svgShape',
    'facebookLike',
    'facebookComments',
    'facebookLikeBox',
    'rssButton',
    'textInput',
    'tinyMenu',
    'groupContainer',
    'pinterestPinIt',
    'pinterestFollow',
    'wTwitterFollow',
    'audioPlayer',
    'column',
    'htmlComponent',

    'components/components/imageButtonWithText/imageButtonWithText',
    'components/components/verticalAnchorsMenu/verticalAnchorsMenu',
    'components/components/verticalAnchorsMenu/verticalAnchorsMenuItem',
    'components/components/imageZoom/imageZoom',
    'components/components/mobileMediaZoom/mobileMediaZoom',
    'components/components/mobileImageZoomDisplayer/mobileImageZoomDisplayer',
    'components/components/pageGroup/pageGroup',
    'components/components/deadComponent/deadComponent',
    'components/components/erasableTextInput/erasableTextInput',
    'components/components/galleries/masonry',
    'components/components/galleries/accordion',
    'components/components/galleries/impress',
    'components/components/galleries/freestyle',
    'components/components/touchMediaZoom/touchMediaZoomSlideshow',
    'components/components/touchMediaZoom/touchMediaZoomItem',
    'components/components/galleries/collage',
    'components/components/galleries/honeycomb',
    'components/components/galleries/stripShowcase',
    'components/components/galleries/stripSlideshow',
    'components/components/galleries/thumbnails',
    'components/components/galleries/tpa3DGallery',
    'components/components/galleries/tpa3DCarousel',
    'components/components/infoTip/infoTip',
    'components/components/singleAudioPlayer/singleAudioPlayer',
    'components/components/siteBackground/siteBackground',
    'components/components/videoBackground/videoBackground',
    'components/components/inputWithValidation/inputWithValidation',
    'components/components/flashComponent/flashComponent',
    'components/components/wixAppsImageButton/wixAppsImageButton',
    'components/components/messageView/messageView',
    'components/components/verticalMenu/verticalMenu',
    'components/components/bgImageStrip/bgImageStrip',
    'components/components/container/page',
    'components/components/container/popupContainer',
    'components/components/container/stripContainer',
    'components/components/container/stripColumnsContainer',
    'components/components/colorOption/colorOption',
    'components/components/mobileColorOption/mobileColorOption',
    'components/components/dropDownMenu/dropDownMenu',
    'components/components/facebookShare/facebookShare',
    'components/components/ebayItemsBySeller/ebayItemsBySeller',
    'components/components/icon/icon',
    'components/components/flickrBadgeWidget/flickrBadgeWidget',
    'components/components/mediaZoom/mediaZoom',
    'components/components/imageZoomDisplayer/imageZoomDisplayer',
    'components/components/menuButton/menuButton',
    'components/components/numericStepper/numericStepper',
    'components/components/optionsListInput/optionsListInput',
    'components/components/selectOptionsList/selectOptionsList',
    'components/components/dialogs/notificationDialog/notificationDialog',
    'components/components/dialogs/creditsDialog/creditsDialog',
    'components/components/dialogs/enterPasswordDialog/enterPasswordDialog',
    'components/components/dialogs/siteMemberDialogs/signUpDialog/signUpDialog',
    'components/components/dialogs/siteMemberDialogs/memberLoginDialog/memberLoginDialog',
    'components/components/dialogs/siteMemberDialogs/requestPasswordResetDialog/requestPasswordResetDialog',
    'components/components/dialogs/siteMemberDialogs/resetPasswordDialog/resetPasswordDialog',
    'components/components/itunesButton/itunesButton',
    'components/components/toggle/toggle',
    'components/components/skypeCallButton/skypeCallButton',
    'components/components/sliderGallery/sliderGallery',
    'components/components/slideShowGallery/slideShowGallery',
    'components/components/textOption/textOption',
    'components/components/mobileTextOption/mobileTextOption',
    'components/components/vKShareButton/vKShareButton',
    'components/components/wGooglePlusOne/wGooglePlusOne',
    'components/components/mediaRichText/mediaRichText',
    'components/components/youTubeSubscribeButton/youTubeSubscribeButton',
    'components/components/wixads/wixAdsDesktop',
    'components/components/wixads/wixAdsMobile',
    'components/components/mobileActionsMenu/mobileActionsMenu',
    'components/components/wTwitterTweet/wTwitterTweet',
    'components/components/exitMobileModeButton/exitMobileModeButton',
    'components/components/table/table',
    'components/components/disqusComments/disqusComments',
    'components/components/boxSlideShow/boxSlideShow/boxSlideShow',
    'components/components/boxSlideShowSlide/boxSlideShowSlide',
    'components/components/boxSlideShow/stripSlideShow/stripSlideShow',
    'components/components/boxSlideShowSlide/stripSlideShowSlide',
    'components/components/mobileAppBanner/mobileAppBanner',
    'components/components/checkbox/checkbox',
    'components/components/controller/controller',
	'components/components/grid/gridComponent',
    'core',
    'experiment',
    'components/core/svgShapeStylesCollector',
    'components/core/mediaRichTextStylesCollector',
    'components/core/dialogsStylesCollector',
    'components/behaviors/compBehaviorsRegistrar',
    'components/behaviors/animationBehaviorsRegistrar'
], function (fileUploader,
             wixSkinOnly,
             pinItPinWidget,
             siteButton,
             popupCloseTextButton,
             image,
             zoomedImage,
             wPhoto,
             clipArt,
             displayer,
             matrixGallery,
             wRichText,
             paginatedGridGallery,
             container,
             radioButton,
             radioGroup,
             headerContainer,
             footerContainer,
             screenWidthContainer,
             documentMedia,
             adminLoginButton,
             backgroundCommon,
             balataCommon,
             datePicker,
             contactForm,
             subscribeForm,
             textArea,
             video,
             loginButton,
             googleMap,
             mediaContainer,
             soundCloudWidget,
             paypalButton,
             imageButton,
             linkBar,
             comboBoxInput,
             spotifyPlayer,
             spotifyFollow,
             twitterFeed,
             backToTopButton,
             svgShape,
             facebookLike,
             facebookComments,
             facebookLikeBox,
             rssButton,
             textInput,
             tinyMenu,
             groupContainer,
             pinterestPinIt,
             pinterestFollow,
             wTwitterFollow,
             audioPlayer,
             column,
             htmlComponent,

             imageButtonWithText,
             verticalAnchorsMenu,
             verticalAnchorsMenuItem,
             imageZoom,
             mobileMediaZoom,
             mobileImageZoomDisplayer,
             pageGroup,
             deadComponent,
             erasableTextInput,
             masonry,
             accordion,
             impress,
             freestyle,
             touchMediaZoomSlideshow,
             touchMediaZoomItem,
             collage,
             honeycomb,
             stripShowcase,
             stripSlideshow,
             thumbnails,
             tpa3DGallery,
             tpa3DCarousel,
             infoTip,
             singleAudioPlayer,
             siteBackground,
             videoBackground,
             inputWithValidation,
             flashComponent,
             wixAppsImageButton,
             messageView,
             verticalMenu,
             bgImageStrip,
             page,
             popupContainer,
             stripContainer,
             stripColumnsContainer,
             colorOption,
             mobileColorOption,
             dropDownMenu,
             facebookShare,
             ebayItemsBySeller,
             icon,
             flickrBadgeWidget,
             mediaZoom,
             imageZoomDisplayer,
             menuButton,
             numericStepper,
             optionsListInput,
             selectOptionsList,
             notificationDialog,
             creditsDialog,
             enterPasswordDialog,
             signUpDialog,
             memberLoginDialog,
             requestPasswordResetDialog,
             resetPasswordDialog,
             itunesButton,
             toggle,
             skypeCallButton,
             sliderGallery,
             slideShowGallery,
             textOption,
             mobileTextOption,
             vKShareButton,
             wGooglePlusOne,
             mediaRichText,
             youTubeSubscribeButton,
             wixAdsDesktop,
             wixAdsMobile,
             mobileActionsMenu,
             wTwitterTweet,
             exitMobileModeButton,
             table,
             disqusComments,
             boxSlideShow,
             boxSlideShowSlide,
             stripSlideShow,
             stripSlideShowSlide,
             mobileAppBanner,
             checkbox,
             controller,
			 grid,
             core,
             experiment) {
    "use strict";

    var registrar = core.compRegistrar
        .register('wysiwyg.common.components.verticalanchorsmenu.viewer.VerticalAnchorsMenu', verticalAnchorsMenu)
        .register('wysiwyg.common.components.verticalanchorsmenu.viewer.VerticalAnchorsMenuItem', verticalAnchorsMenuItem)
        .register('wysiwyg.components.imageZoom', imageZoom)
        .register('wysiwyg.common.components.backtotopbutton.viewer.BackToTopButton', backToTopButton)
        .register('wysiwyg.common.components.subscribeform.viewer.SubscribeForm', subscribeForm)
        .register('wysiwyg.viewer.components.FiveGridLine', wixSkinOnly)
        .register('wysiwyg.viewer.components.MobileMediaZoom', mobileMediaZoom)
        .register('wysiwyg.components.MobileImageZoomDisplayer', mobileImageZoomDisplayer)
        .register('wysiwyg.viewer.components.VerticalLine', wixSkinOnly)
        .register('wysiwyg.common.components.anchor.viewer.Anchor', wixSkinOnly)
        .register("wysiwyg.viewer.components.PageGroup", pageGroup)
        .register('wysiwyg.viewer.components.DeadComponent', deadComponent)
        .register('wysiwyg.viewer.components.WFacebookLike', facebookLike)
        .register('wysiwyg.viewer.components.WFacebookComment', facebookComments)
        .register('wysiwyg.viewer.components.inputs.ErasableTextInput', erasableTextInput)
        .register('tpa.viewer.components.Masonry', masonry)
        .register('tpa.viewer.components.Accordion', accordion)
        .register('tpa.viewer.components.Impress', impress)
        .register('tpa.viewer.components.Freestyle', freestyle)
        .register('wysiwyg.viewer.components.TouchMediaZoomSlideshow', touchMediaZoomSlideshow)
        .register('wysiwyg.viewer.components.TouchMediaZoomItem', touchMediaZoomItem)
        .register('tpa.viewer.components.Collage', collage)
        .register('tpa.viewer.components.Honeycomb', honeycomb)
        .register('tpa.viewer.components.StripShowcase', stripShowcase)
        .register('tpa.viewer.components.StripSlideshow', stripSlideshow)
        .register('tpa.viewer.components.Thumbnails', thumbnails)
        .register('wysiwyg.viewer.components.tpapps.TPA3DGallery', tpa3DGallery)
        .register('wysiwyg.viewer.components.tpapps.TPA3DCarousel', tpa3DCarousel)
        .register('wysiwyg.viewer.components.TwitterFeed', twitterFeed)
        .register('wysiwyg.common.components.InfoTip', infoTip)
        .register('core.components.Image', image)
        .register('core.components.ZoomedImage', zoomedImage)
        .register('wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer', singleAudioPlayer)
        .register('wysiwyg.viewer.components.AudioPlayer', audioPlayer)
        .register('wysiwyg.viewer.components.SiteBackground', siteBackground)
        .register('wysiwyg.viewer.components.videoBackground', videoBackground)
        .register('wysiwyg.components.viewer.inputs.InputWithValidation', inputWithValidation)
        .register('wysiwyg.viewer.components.FlashComponent', flashComponent)
        .register('wixapps.integration.components.ImageButton', wixAppsImageButton)
        .register('wysiwyg.viewer.components.AdminLoginButton', adminLoginButton)
        .register('wysiwyg.viewer.components.MessageView', messageView)
        .register('wysiwyg.common.components.verticalmenu.viewer.VerticalMenu', verticalMenu)
        .register("wysiwyg.common.components.imagebutton.viewer.ImageButton", imageButton)
        .register("wysiwyg.common.components.rssbutton.viewer.RSSButton", rssButton)
        .register('wysiwyg.viewer.components.BgImageStrip', bgImageStrip)
        .register('wysiwyg.viewer.components.ContactForm', contactForm)
        .register('wixapps.integration.components.Area', container)
        .register('wysiwyg.viewer.components.VerticalRepeater', container)
        .register('wysiwyg.viewer.components.WSiteStructure', container)
        .register('mobile.core.components.Container', container)
        .register('wysiwyg.viewer.components.Group', groupContainer)
        .register('wixapps.integration.components.AppPage', container)
        .register('wysiwyg.viewer.components.HeaderContainer', headerContainer)
        .register('wysiwyg.viewer.components.FooterContainer', footerContainer)
        .register('wysiwyg.viewer.components.PagesContainer', screenWidthContainer)
        .register('wysiwyg.viewer.components.ScreenWidthContainer', screenWidthContainer)
        .register('wysiwyg.viewer.components.StripContainer', stripContainer)
        .register('wysiwyg.viewer.components.StripColumnsContainer', stripColumnsContainer)
        .register('wysiwyg.viewer.components.Column', column)
        .register('wysiwyg.viewer.components.inputs.ColorOption', colorOption)
        .register('ecommerce.integration.components.MobileColorOption', mobileColorOption)
        .register('wysiwyg.viewer.components.ClipArt', clipArt)
        .register('wysiwyg.viewer.components.Displayer', displayer)
        .register('wysiwyg.viewer.components.menus.DropDownMenu', dropDownMenu)
        .register('wysiwyg.common.components.facebooklikebox.viewer.FacebookLikeBox', facebookLikeBox)
        .register('wysiwyg.viewer.components.FacebookShare', facebookShare)
        .register('wysiwyg.viewer.components.GoogleMap', googleMap)
        .register('wysiwyg.viewer.components.EbayItemsBySeller', ebayItemsBySeller)
        .register('wysiwyg.viewer.components.HtmlComponent', htmlComponent)
        .register('wixapps.integration.components.Icon', icon)
        .register('wysiwyg.viewer.components.LinkBar', linkBar.linkBar)
        .register('wysiwyg.viewer.components.LinkBarItem', linkBar.linkBarItem)
        .register('wysiwyg.viewer.components.MatrixGallery', matrixGallery)
        .register('wysiwyg.viewer.components.FlickrBadgeWidget', flickrBadgeWidget)
        .register('wysiwyg.viewer.components.PaginatedGridGallery', paginatedGridGallery)
        .register('wysiwyg.viewer.components.MediaZoom', mediaZoom)
        .register('wysiwyg.components.ImageZoomDisplayer', imageZoomDisplayer)
        .register('core.components.MenuButton', menuButton)
        .register('wysiwyg.common.components.NumericStepper', numericStepper)
        .register('wysiwyg.common.components.inputs.OptionsListInput', optionsListInput)
        .register('wysiwyg.common.components.inputs.SelectOptionsList', selectOptionsList)
        .register('wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget', pinItPinWidget)
        .register('wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt', pinterestPinIt)
        .register('wysiwyg.viewer.components.PayPalButton', paypalButton)
        .register('wysiwyg.viewer.components.SiteButton', siteButton)
        .register('wysiwyg.viewer.components.LoginButton', loginButton)
        .register('wysiwyg.viewer.components.dialogs.NotificationDialog', notificationDialog)
        .register('wysiwyg.viewer.components.dialogs.CreditsDialog', creditsDialog)
        .register('wysiwyg.viewer.components.dialogs.EnterPasswordDialog', enterPasswordDialog)
        .register('wysiwyg.viewer.components.dialogs.siteMemberDialogs.SignUpDialog', signUpDialog)
        .register('wysiwyg.viewer.components.dialogs.siteMemberDialogs.MemberLoginDialog', memberLoginDialog)
        .register('wysiwyg.viewer.components.dialogs.siteMemberDialogs.RequestPasswordResetDialog', requestPasswordResetDialog)
        .register('wysiwyg.viewer.components.dialogs.siteMemberDialogs.ResetPasswordDialog', resetPasswordDialog)
        .register('wysiwyg.viewer.components.ItunesButton', itunesButton)
        .register('wixapps.integration.components.Toggle', toggle)
        .register('wysiwyg.common.components.skypecallbutton.viewer.SkypeCallButton', skypeCallButton)
        .register('wysiwyg.viewer.components.SliderGallery', sliderGallery)
        .register('wysiwyg.viewer.components.SlideShowGallery', slideShowGallery)
        .register('wysiwyg.viewer.components.svgshape.SvgShape', svgShape.svgShape)
        .register('wysiwyg.viewer.components.inputs.TextInput', textInput)
        .register('wixapps.integration.components.inputs.TextArea', textArea)
        .register('wysiwyg.viewer.components.inputs.TextAreaInput', textArea)
        .register('wysiwyg.viewer.components.mobile.TinyMenu', tinyMenu)
        .register('wysiwyg.viewer.components.inputs.TextOption', textOption)
        .register('ecommerce.integration.components.MobileTextOption', mobileTextOption)
        .register('wysiwyg.viewer.components.Video', video)
        .register('wysiwyg.viewer.components.VKShareButton', vKShareButton)
        .register('wysiwyg.viewer.components.WGooglePlusOne', wGooglePlusOne)
        .register('wysiwyg.viewer.components.WPhoto', wPhoto)
        .register('wysiwyg.viewer.components.documentmedia.DocumentMedia', documentMedia)
        .register('wysiwyg.viewer.components.WRichText', wRichText)
        .register('wysiwyg.viewer.components.MediaRichText', mediaRichText)
        .register('wysiwyg.viewer.components.WTwitterFollow', wTwitterFollow)
        .register('wysiwyg.common.components.youtubesubscribebutton.viewer.YouTubeSubscribeButton', youTubeSubscribeButton)
        .register('wysiwyg.viewer.components.WixAdsDesktop', wixAdsDesktop)
        .register('wysiwyg.viewer.components.WixAdsMobile', wixAdsMobile)
        .register('wysiwyg.viewer.components.MobileActionsMenu', mobileActionsMenu)
        .register('wysiwyg.common.components.spotifyfollow.viewer.SpotifyFollow', spotifyFollow)
        .register('wysiwyg.common.components.spotifyplayer.viewer.SpotifyPlayer', spotifyPlayer)
        .register('wysiwyg.viewer.components.PinterestFollow', pinterestFollow)
        .register('wysiwyg.viewer.components.SoundCloudWidget', soundCloudWidget)
        .register('wysiwyg.viewer.components.WTwitterTweet', wTwitterTweet)
        .register('wysiwyg.viewer.components.inputs.ComboBoxInput', comboBoxInput)
        .register('wysiwyg.common.components.exitmobilemode.viewer.ExitMobileMode', exitMobileModeButton)
        .register('wysiwyg.viewer.components.Table', table)
        .register('wysiwyg.common.components.disquscomments.viewer.DisqusComments', disqusComments)
        .register('wysiwyg.viewer.components.background.bgMedia', backgroundCommon.components.bgMedia)
        .register('wysiwyg.viewer.components.background.bgImage', backgroundCommon.components.bgImage)
        .register('wysiwyg.viewer.components.background.bgVideo', backgroundCommon.components.bgVideo)
        .register('wysiwyg.viewer.components.background.bgOverlay', backgroundCommon.components.bgOverlay)
        .register('wysiwyg.viewer.components.BoxSlideShow', boxSlideShow)
        .register('wysiwyg.viewer.components.BoxSlideShowSlide', boxSlideShowSlide)
        .register('wysiwyg.viewer.components.StripContainerSlideShow', stripSlideShow)
        .register('wysiwyg.viewer.components.StripContainerSlideShowSlide', stripSlideShowSlide)
        .register('wysiwyg.viewer.components.MobileAppBanner', mobileAppBanner)
        .register('wysiwyg.viewer.components.HoverBox', mediaContainer)
        .register('wysiwyg.viewer.components.HoverBox_old', container)
        .register('wysiwyg.viewer.components.inputs.Checkbox', checkbox)
        .register('wysiwyg.viewer.components.inputs.RadioButton', radioButton)
        .register('wysiwyg.viewer.components.inputs.DatePicker', datePicker.datePicker)
        .register('wysiwyg.viewer.components.Calendar', datePicker.calendar)
        .register('wysiwyg.viewer.components.Month', datePicker.month)
        .register('wysiwyg.viewer.components.Day', datePicker.day)
        .register('wysiwyg.viewer.components.inputs.RadioGroup', radioGroup)
        .register('platform.components.AppController', controller)
        .register('wysiwyg.viewer.components.ImageButtonWithText', imageButtonWithText)
        .register('wysiwyg.viewer.components.background.Balata', balataCommon.balata)
        .register('wysiwyg.viewer.components.PopupCloseTextButton', popupCloseTextButton)
        .register('wysiwyg.viewer.components.PopupCloseIconButton', svgShape.popupCloseIconButton)
        .register('mobile.core.components.Page', page)
        .register('wysiwyg.viewer.components.PopupContainer', popupContainer);


    if (experiment.isOpen('sv_grid')) {
        registrar.register('wysiwyg.viewer.components.Grid', grid);
    }

    if (experiment.isOpen('sv_fileUploader')) {
        registrar.register('wysiwyg.viewer.components.inputs.FileUploader', fileUploader);
    }
});
