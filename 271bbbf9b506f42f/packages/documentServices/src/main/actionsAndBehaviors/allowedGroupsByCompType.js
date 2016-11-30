define([], function () {
    "use strict";

    var SIMPLE_ENTRANCE_ANIMATIONS = ['entrance', 'animation'];
    var SPECIAL_ENTRANCE_ANIMATIONS = ['mask', '3d'];
    var ALL_ENTRANCE_ANIMATIONS = SIMPLE_ENTRANCE_ANIMATIONS.concat(SPECIAL_ENTRANCE_ANIMATIONS);

    var TEXT_ANIMATIONS = ['text'];
    var EXIT_ANIMATIONS = ['exit'];
    var BACKGROUND_ANIMATIONS = ['animation', 'background'];
    var PAGE_TRANSITIONS = ['transition', 'pageTransition'];
    var NONE = [];

    var schema = {
        // Default
        'AllComponents': ALL_ENTRANCE_ANIMATIONS,
        // Special
        'PopupContainer': ALL_ENTRANCE_ANIMATIONS.concat(EXIT_ANIMATIONS),
        'WRichText': ALL_ENTRANCE_ANIMATIONS.concat(TEXT_ANIMATIONS),
        'WSiteStructure': PAGE_TRANSITIONS,
        'Page': PAGE_TRANSITIONS,
        'AppPage': PAGE_TRANSITIONS,
        'Anchor': NONE,
        'FlashComponent': NONE,
        'PagesContainer': NONE,
        'Header': NONE,
        'Footer': NONE,
        'DeadComponent': NONE,
        'TPAWidget': NONE,
        'TPASection': NONE,
        'TPAGluedWidget': NONE,
        'TPAMultiSection': NONE,
        'AppPart': NONE,
        'AppPart2': NONE,
        // TPA Galleries
        'Masonry': NONE,
        'Accordion': NONE,
        'Impress': NONE,
        'Freestyle': NONE,
        'Collage': NONE,
        'Honeycomb': NONE,
        'StripShowcase': NONE,
        'StripSlideshow': NONE,
        'Thumbnails': NONE,
        'TPA3DGallery': NONE,
        'TPA3DCarousel': NONE,
        // iFrame Components
        'FlickrBadgeWidget': NONE,
        'GoogleMap': NONE,
        'HtmlComponent': NONE,
        'PinItPinWidget': NONE,
        'PinterestPinIt': NONE,
        'FacebookLikeBox': NONE,
        'SkypeCallButton': NONE,
        'SoundCloudWidget': NONE,
        'SpotifyFollow': NONE,
        'SpotifyPlayer': NONE,
        'Video': NONE,
        'VKShareButton': NONE,
        'WTwitterTweet': NONE,
        'WTwitterFollow': NONE,
        'YouTubeSubscribeButton': NONE,
        'StripContainer': BACKGROUND_ANIMATIONS,
        'StripContainerSlideShowSlide': BACKGROUND_ANIMATIONS,
        'Column': BACKGROUND_ANIMATIONS,
        'StripColumnsContainer': BACKGROUND_ANIMATIONS
    };

    function getSchema() {
        schema.AllComponents = schema.AllComponents.concat(EXIT_ANIMATIONS);
        schema.WRichText = schema.WRichText.concat(EXIT_ANIMATIONS);
        //In the current implementation of bg animations, this does not work:
        //schema.HoverBox = ALL_ENTRANCE_ANIMATIONS.concat(EXIT_ANIMATIONS, BACKGROUND_ANIMATIONS);

        schema.BoxSlideShowSlide = BACKGROUND_ANIMATIONS;

        return schema;
    }

    return {getSchema: getSchema};

});
