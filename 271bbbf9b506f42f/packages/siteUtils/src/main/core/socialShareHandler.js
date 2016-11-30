define(['lodash', 'coreUtils', 'siteUtils/core/socialCounterDatabaseAPI'],
    function (_, coreUtils, socialCounterDatabaseAPI) {
    "use strict";

    var GOOGLE_SHARE_URL = 'https://plus.google.com/share?url=';
    var FANCY_SHARE_URL = 'http://www.fancy.com/fancyit/fancy?ItemURL=';
    var PINTEREST_SHARE_URL = 'http://pinterest.com/pin/create/button/?url=';
    var TWITTER_SHARE_URL = 'https://twitter.com/intent/tweet?url=';
    var FACEBOOK_SHARE_URL = 'http://www.facebook.com/sharer.php?u=';
    var WHATSAPP_SHARE_URL = 'whatsapp://send?text=';
    var GOOGLE_URL_SHORTENER = 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyDjvIfgLnQJsOxcV01kJae48WSynmXmZ2I';
    var LINKEDIN_SHARE_URL = 'https://www.linkedin.com/shareArticle?mini=true&url=';

    function addQueryParamToUrl(url, param) {
        var urlParts = url.split('#');
        var delimiter = _.includes(url, '?') ? '&' : '?';
        urlParts[0] += delimiter + param;
        return urlParts.join('#');
    }

    function getSharePageURL(url, hashToSlash) {
        var shareUrl = url;

        var urlParts = shareUrl.split('#!');
        if (urlParts.length > 1){
            urlParts[1] = decodeURIComponent(urlParts[1]); //prevent double encoding of product title in hash
            shareUrl = urlParts.join('#!');
        }
        if (hashToSlash) {
            shareUrl = shareUrl.replace('#!', '\/#!'); // facebook sharer requires escape url
        }
        return encodeURIComponent(shareUrl);
    }

    function getShareTitle(title) {
        if (title){
            return encodeURIComponent(_.unescape(title));
        }
        return "";
    }

    function getShareDescription(description) {
        if (description){
            return encodeURIComponent(_.unescape(description));
        }
        return "";
    }

    function getShareHashTags(tags) {
        if (tags){
            tags = tags.replace(/#/g, encodeURIComponent('#'));
            return " " + tags;
        }
        return "";
    }

    function getImageUrl (imageUrl, siteData) {
        var url = imageUrl || '';
        if (imageUrl && !coreUtils.urlUtils.isExternalUrl(imageUrl)) {
            url = siteData.getMediaFullStaticUrl(imageUrl);
        }
        url = encodeURIComponent(url);
        return url;
    }

    /*
     * requires:
     *  url = encoded share page url
     * */
    function getGoogleShareUrl(shareInfo) {
        var shareUrl = GOOGLE_SHARE_URL;
        shareUrl += getSharePageURL(shareInfo.url);
        return shareUrl;
    }

    /**
     *
     * requires:
     *  ItemURL = encoded share page url
     *  Title = share title
     *  ImageURL = share image url
     * @param {wixapps.shareInfo} shareInfo
     * @param siteData
     * @returns {string}
     */
    function getFancyShareUrl(shareInfo, siteData) {
        var shareUrl = FANCY_SHARE_URL;
        shareUrl += getSharePageURL(shareInfo.url);
        shareUrl += "&Title=" + getShareTitle(shareInfo.title);
        shareUrl += "&ImageURL=" + getImageUrl(shareInfo.imageUrl, siteData);
        return shareUrl;
    }

    /**
     * requires:
     *  url = encoded share page url
     *  media = encoded share image url
     *  description = share title
     *
     * @param {wixapps.shareInfo} shareInfo
     * @param siteData
     * @returns {string}
     */
    function getPinterestShareUrl(shareInfo, siteData) {
        var shareUrl = PINTEREST_SHARE_URL;
        shareUrl += getSharePageURL(shareInfo.url);
        shareUrl += "&media=" + getImageUrl(shareInfo.imageUrl, siteData);
        shareUrl += "&description=" + getShareTitle(shareInfo.title);
        return shareUrl;
    }

    /**
     * requires:
     *  url = encoded share page url
     *  text = share title
     *
     *  @param {wixapps.shareInfo} shareInfo
     */
    function getTwitterShareUrl(shareInfo) {
        var shareUrl = TWITTER_SHARE_URL;
        shareUrl += getSharePageURL(shareInfo.url);
        shareUrl += "&text=" + getShareTitle(shareInfo.title) + getShareHashTags(shareInfo.hashTags) + encodeURIComponent('\n');// prettify line wrap
        return shareUrl;
    }

    /**
     * requires:
     *  u = encoded share page url
     *  t = share title
     *
     *  @param {wixapps.shareInfo} shareInfo
     */
    function getFacebookShareUrl(shareInfo) {
        var shareUrl = FACEBOOK_SHARE_URL;
        shareUrl += getSharePageURL(shareInfo.url);  //add slash before hash
        shareUrl += "&title=" + getShareTitle(shareInfo.title);
        shareUrl += '&description=' + getShareDescription(shareInfo.description);
        return shareUrl;
    }

    /**
     * requires:
     *  u = encoded share page url
     *  t = share title
     *
     *  @param {wixapps.shareInfo} shareInfo
     */
    function getWhatsAppShareUrl(shareInfo) {
        var shareUrl = WHATSAPP_SHARE_URL;
        shareUrl += getShareTitle(shareInfo.title);
        shareUrl += " - " + getSharePageURL(shareInfo.url);  //add slash before hash
        return shareUrl;
    }

    /**
     * requires:
     *  url = encoded share page url
     *  title = share title
     *
     *  @param {wixapps.shareInfo} shareInfo
     */
    function getLinkedInShareUrl(shareInfo) {
        var shareUrl = LINKEDIN_SHARE_URL;
        shareUrl += getSharePageURL(shareInfo.url);  //add slash before hash
        shareUrl += '&title=' + getShareTitle(shareInfo.title);
        return shareUrl;
    }

    function getEmailShareUrl(shareInfo) {
        var url = 'mailto:?';
        url += '&subject=' + getShareTitle(shareInfo.title);
        url += '&body=' + getShareDescription(shareInfo.description);
        return url;
    }
    /**
     *
     * @param {wixapps.shareInfo} shareInfo
     * @param siteData
     */
    function getServiceShareUrl(shareInfo, siteData){
        var serviceFunctions = {
            google: getGoogleShareUrl,
            fancy: getFancyShareUrl,
            pinterest: getPinterestShareUrl,
            twitter: getTwitterShareUrl,
            facebook: getFacebookShareUrl,
            whatsapp: getWhatsAppShareUrl,
            email: getEmailShareUrl,
            linkedin: getLinkedInShareUrl
        };

        return serviceFunctions[shareInfo.service](shareInfo, siteData) || '';
    }

    /**
     *
     * @param {wixapps.shareInfo} shareInfo
     * @param siteAPI
     */
    function handleShareRequest(shareInfo, siteAPI, disableCounters){
        var shareUrl = getServiceShareUrl(shareInfo, siteAPI.getSiteData());
        if (shareInfo.addDeepLinkParam){
            shareUrl = addQueryParamToUrl(shareUrl, 'deeplink_referrer=socialB_' + shareInfo.service);
        }
        if (shareInfo.service === 'email') {
            window.location.href = shareUrl;
            return;
        }
        if (!disableCounters) {
            socialCounterDatabaseAPI.updateCounter('shares', shareInfo.service, 1, shareInfo.storeId, shareInfo.postId);
        }
        siteAPI.openPopup(shareUrl, 'wixapps_share', 'width=635,height=346,scrollbars=no,status=no,toolbar=no,menubar=no,location=no');
    }

    function shortenURL(url, timeout, onSuccess, onError) {
        coreUtils.ajaxLibrary.ajax({
            url: GOOGLE_URL_SHORTENER,
            type: 'POST',
            contentType: 'application/json',
            data: '{"longUrl": "' + url + '"}',
            timeout: timeout || 0,
            async: false, // it must be sync in safari, or otherwise onSuccess won't work (because sharePost does window.open)
            success: function (res) {
                onSuccess(res.id);
            },
            error: onError
        });
    }

    /**
     * @class wixapps.socialShareHandler
     */
    return {
        handleShareRequest: handleShareRequest,
        shortenURL: shortenURL
    };
});

/**
 * @typedef {{
     *  service: string,
     *  url: string,
     *  title: string,
     *  imageUrl: string,
     *  addDeepLinkParam: boolean
     * }} wixapps.shareInfo
 */
