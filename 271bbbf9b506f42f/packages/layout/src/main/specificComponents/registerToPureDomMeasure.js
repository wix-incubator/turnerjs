define(['layout/util/layout'], function (/** layout.layout */layout) {
    'use strict';

    /** Override measure map with DOM dimensions, without being restricted to the component's structure dimensions **/

    function registerToPureDomMeasure(className) {
        layout.registerCustomMeasure(className, function(id, measureMap, nodesMap){
            var node = nodesMap[id];
            measureMap.height[id] = node.offsetHeight;
            measureMap.width[id] = node.offsetWidth;
        });
    }

    registerToPureDomMeasure('wysiwyg.viewer.components.FlashComponent');
    registerToPureDomMeasure('wysiwyg.common.components.pinterestpinit.viewer.PinterestPinIt');
    registerToPureDomMeasure('wysiwyg.viewer.components.WGooglePlusOne');
    registerToPureDomMeasure('wysiwyg.viewer.components.LinkBar');
    registerToPureDomMeasure('wysiwyg.common.components.singleaudioplayer.viewer.SingleAudioPlayer');
    registerToPureDomMeasure('wysiwyg.common.components.facebooklikebox.viewer.FacebookLikeBox');
    registerToPureDomMeasure('wysiwyg.viewer.components.PayPalButton');
    registerToPureDomMeasure('wysiwyg.common.components.spotifyfollow.viewer.SpotifyFollow');
    registerToPureDomMeasure('wysiwyg.viewer.components.FlickrBadgeWidget');
    registerToPureDomMeasure('wysiwyg.viewer.components.WTwitterFollow');
    registerToPureDomMeasure('wysiwyg.viewer.components.WTwitterTweet');
    registerToPureDomMeasure('wysiwyg.common.components.skypecallbutton.viewer.SkypeCallButton');

    return {};
});