define(['lodash', 'experiment'], function(_, experiment){
    'use strict';
    function WixSiteHeadRenderer() {
        this.blankFavicons = null;
    }

    function isFaviconIncludedInPremium(siteData) {
        return _.includes(siteData.rendererModel.premiumFeatures, 'AdsFree');
    }

    WixSiteHeadRenderer.prototype = {

        /* Public Methods */

        getFavicons: function(siteData) {
            if (siteData.isPremiumUser && siteData.isPremiumUser() && isFaviconIncludedInPremium(siteData)) {
                return this._getPremiumUserFavicon(siteData);
            }
            return this._getDefaultWixFavicon();
        },

        createBlankFavicons: function() {
            if (this.blankFavicons === null) {
                this.blankFavicons = this._createEmptyFaviconElements();
            }
            return this.blankFavicons;
        },

        getPageMetaTags: function(siteData, pageId) {
            return this._getMetaTagsForPage(siteData, pageId);
        },

        getPageJsonldTag: function (siteData, pageId) {
            var jsonld = siteData.getPageJsonld(pageId);

            if (_.size(jsonld) === 0) {
                return '';
            }

            return [
                '<script type="application/ld+json">',
                JSON.stringify(jsonld),
                '</script>'
            ].join('');
        },

        /* Private Methods */

        _getPremiumUserFavicon: function (siteData) {
            var favicon = siteData.getFavicon();
            if (favicon) {
                var faviconMime = this._getFaviconMimeType(favicon);
                // TODO nirm 6/3/15 1:19 PM - We dont have the dimensions of the original favicon image so we cant keep the correct ratio when asking for a smaller version from the server :(
//                favicon = utils.imageUtils.getImageContained({width: 128, height: 128}, favicon, {width: 128, height: 128}, siteData, siteData.isMobileView());
                favicon = siteData.getMediaFullStaticUrl(favicon);
                return this._createFaviconLinkElements(favicon, faviconMime);
            }
            return this._createEmptyFaviconElements();
        },

        _getDefaultWixFavicon: function () {
            var favicon = "http://www.wix.com/favicon.ico";
            var faviconMime = this._getFaviconMimeType(favicon);
            return this._createFaviconLinkElements(favicon, faviconMime);
        },

        _createEmptyFaviconElements: function() {
            return this._createFaviconLinkElements(null, null);
        },

        _createFaviconLinkElements: function(href, mimeType) {
            var result = [];
            if (href && mimeType) {
                result.push({rel: 'shortcut icon', href: href, type: mimeType});
                result.push({rel: 'apple-touch-icon', href: href, type: mimeType});
            }

            return result;
        },

        _getStaticMediaUrl: function(siteData) {
            return siteData.serviceTopology.mediaRootUrl;
        },

        _getFaviconMimeType: function(favicon) {
            var mimeType = null;
            if (favicon) {
                if (this._isExtension(favicon, "png")) {
                    mimeType = 'image/png';
                } else if (this._isExtension(favicon, "gif")) {
                    mimeType = 'image/gif';
                } else if (this._isExtension(favicon, "ico") || this._isExtension(favicon, "icon")) {
                    mimeType = 'image/x-icon';
                } else if (this._isExtension(favicon, "jpg")) {
                    mimeType = 'image/jpg';
                }
            }
            return mimeType;
        },

        _isExtension: function(name, extension){
            return this._getExtension(name).toLowerCase() === extension;
        },

        _getExtension: function(name) {
            if (name) {
                var dotIndex = name.lastIndexOf(".");
                if (dotIndex >= 0) {
                    return name.substr(dotIndex + 1);
                }
            }
            return "";
        },

        _getMetaTagsForPage: function (siteData, pageId) {
            var metaTags = siteData.getPageSEOMetaData(pageId);
            var tagGetters = [this._getDescriptionSEOMetaTag, this._getKeywordsSEOMetaTag, this._getOgMetaTag];
            if (experiment.isOpen('sv_addRobotsIndexingMetaTag')) {
                if (siteData.publicModel.indexable) {
                    tagGetters.push(this._getRobotsIndexMetaTag);
                }

                return _(tagGetters)
                    .map(function (getterFn) {
                        return getterFn(metaTags);
                    })
                    .flatten()
                    .value();
            }

            return _.reduce(tagGetters, function (tags, getterFn) {
                return tags.concat(getterFn(metaTags));
            }, []);
        },

        _getRobotsIndexMetaTag: function (metaTags) {
            if (metaTags && metaTags.robotIndex) {
                return '<meta name="robots" content="' + metaTags.robotIndex + '">';
            }
        },

        _getDescriptionSEOMetaTag: function (metaTags) {
            if (metaTags && metaTags.description) {
                var description = metaTags.description;
                return [
                    '<meta name="description" content="' + description + '">',
                    '<meta property="og:description" content="' + description + '">'
                ];
            }
        },

        getGoogleTagManagerScript: function () {
            var gtmScript = "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='//www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-MDD5C4');";
            return '<script async>' + gtmScript + '</script>';
        },

        _getKeywordsSEOMetaTag: function (metaTags) {
            if (metaTags && metaTags.keywords) {
                var keywords = metaTags.keywords;
                return [
                    '<meta name="keywords" content="' + keywords + '">',
                    '<meta property="og:keywords" content="' + keywords + '">'
                ];
            }
        },

        _getOgMetaTag: function (metaTags) {
            if (metaTags && metaTags.ogTags) {
                var ogTags = metaTags.ogTags;
                return _.reduce(ogTags, function(tags, ogTag) {
                    return tags.concat('<meta property="' + ogTag.property + '" content="' + ogTag.content + '">');
                }, []);
            }
        }
    };

    return new WixSiteHeadRenderer();
});
