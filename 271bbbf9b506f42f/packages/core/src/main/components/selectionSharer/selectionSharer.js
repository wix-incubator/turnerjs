/**
 * Created by lirank on 03/04/16.
 */

define(['lodash', 'react', 'utils'],
    function (_, React, utils) {
    'use strict';
        
    var wixappsClassicsLogger = utils.wixappsClassicsLogger;
    var socialShareHandler = utils.socialShareHandler;
    var socialImagesFolder = '/static/images/selectionSharerSocialIcons/';
    var facebookSvgFile = 'facebook.svg';
    var twitterSvgFile = 'twitter.svg';
    var mailSvgFile = 'mail.svg';

    return React.createClass({

        displayName: 'selectionSharer',

        getInitialState: function () {
            return {
                visible: false,
                position: null,
                shareInfo: null
            };
        },

        sharePostWrapper: function (url) {
            var newShareInfo = this.state.shareInfo;
            newShareInfo.url = url;
            socialShareHandler.handleShareRequest({
                url: url,
                service: newShareInfo.service,
                title: newShareInfo.title,
                storeId: newShareInfo.storeId,
                postId: newShareInfo.postId,
                hashTags: newShareInfo.hashTags || '',
                imageUrl: newShareInfo.imgSrc,
                addDeepLinkParam: false,
                description: newShareInfo.description
            }, this.props.siteAPI);
        },

        show: function (position, shareInfo) {
            wixappsClassicsLogger.reportEvent(this.props.siteAPI.getSiteData(), wixappsClassicsLogger.events.SELECTION_SHARER_OPENED, {
                post_id: shareInfo.postId
            });
            this.setState({
                visible: true,
                position: position,
                shareInfo: shareInfo
            });
        },

        hide: function () {
            this.setState({
                visible: false,
                position: null,
                shareInfo: null
            });
        },

        isVisible: function () {
            return this.state.visible;
        },

        twitterClickHandler: function () {
            wixappsClassicsLogger.reportEvent(this.props.siteAPI.getSiteData(), wixappsClassicsLogger.events.SELECTION_SHARER_CLICKED, {
                type: 'twitter',
                post_id: this.state.shareInfo.postId
            });
            this.hide();
            var shareInfo = this.state.shareInfo;
            shareInfo.service = 'twitter';
            shareInfo.title = shareInfo.description;
            socialShareHandler.shortenURL(shareInfo.url, 2000, this.sharePostWrapper, this.sharePostWrapper.bind(null, shareInfo.url));
        },

        facebookClickHandler: function () {
            wixappsClassicsLogger.reportEvent(this.props.siteAPI.getSiteData(), wixappsClassicsLogger.events.SELECTION_SHARER_CLICKED, {
                type: 'facebook',
                post_id: this.state.shareInfo.postId
            });
            this.hide();
            var shareInfo = this.state.shareInfo;
            shareInfo.service = 'facebook';
            socialShareHandler.shortenURL(shareInfo.url, 2000, this.sharePostWrapper, this.sharePostWrapper.bind(null, shareInfo.url));
        },

        mailClickHandler: function () {
            wixappsClassicsLogger.reportEvent(this.props.siteAPI.getSiteData(), wixappsClassicsLogger.events.SELECTION_SHARER_CLICKED, {
                type: 'mail',
                post_id: this.state.shareInfo.postId
            });
            this.hide();
            var shareInfo = this.state.shareInfo;
            shareInfo.service = 'email';
            shareInfo.description = shareInfo.description + "\r\n" + "( " + shareInfo.url + " )";
            socialShareHandler.handleShareRequest(shareInfo, this.props.siteAPI);
        },

        render: function () {
            if (this.state.visible) {
                var containerStyle = {
                    position: 'absolute',
                    left: this.state.position.x + 'px',
                    top: this.state.position.y + 'px'
                };

                var imagesPath = this.props.siteBasePath + socialImagesFolder;
                return React.createElement('div', {className:"selectionSharerContainer", style: containerStyle},
                            [
                                React.createElement('img', {key: "selection-sharer-facebook-img", className: "selectionSharerOption", src: imagesPath + facebookSvgFile, onClick: this.facebookClickHandler}),
                                React.createElement('div', {key: "selection-sharer-first-separator", className: "selectionSharerVerticalSeparator"}),
                                React.createElement('img', {key: "selection-sharer-twitter-img", className: "selectionSharerOption", src: imagesPath + twitterSvgFile, onClick: this.twitterClickHandler}),
                                React.createElement('div', {key: "selection-sharer-second-separator", className: "selectionSharerVerticalSeparator"}),
                                React.createElement('img', {key: "selection-sharer-mail-img", className: "selectionSharerOption", src: imagesPath + mailSvgFile, onClick: this.mailClickHandler})
                            ]
                );
            }
            return null;
        }
    });
});

