define(['lodash', 'core', 'utils', 'tpa', 'color', 'experiment', 'coreUtils'], function (_, /** core */core, utils, tpa, color, experiment, coreUtils) {
    'use strict';

    var linkRenderer = utils.linkRenderer,
        mixins = core.compMixins,
        tpaMixins = tpa.tpaMixins,
        TPA_LINK_TYPES = {
            ExternalLink: 'WEBSITE',
            EmailLink: 'EMAIL',
            PageLink: 'PAGE',
            DocumentLink: 'DOCUMENT',
            AnchorLink: 'ANCHOR',
            DynamicPageLink:'DYNAMIC_PAGE_LINK'
        };

    function rgbToHex(rgbAsString) {
        var rgbAsArray = rgbAsString.split(',');

        return color({
            r: rgbAsArray[0],
            g: rgbAsArray[1],
            b: rgbAsArray[2]
        }).hexString();
    }

    function getStyles(siteData, styleProps, styleData) {
        var colorValue, alphaValue, map = {};

        _.forEach(styleProps, function (value, key) {
            colorValue = utils.colorParser.getColorValue(siteData.getGeneralTheme(), styleData[styleProps[key]]);
            map[key] = _.includes(colorValue, ',') ? rgbToHex(colorValue) : colorValue;
            alphaValue = styleData['alpha-' + styleProps[key]];
            if (!_.isUndefined(alphaValue)) {
                map['alpha' + utils.stringUtils.capitalize(key)] = alphaValue;
            }
        });

        return map;
    }

    function getImageData(imageData, siteData, rootNavigationInfo) {
        if (imageData.link) {
            return _.merge({}, imageData, linkRenderer.renderLink(imageData.link, siteData, rootNavigationInfo), {linkType: TPA_LINK_TYPES[imageData.link.type]});
        }

        return imageData;
    }

    function getImagesData(imagesData, siteData, rootNavigationInfo) {
        return _.map(imagesData, function(image) {
            return getImageData(image, siteData, rootNavigationInfo);
        });
    }

    function getGalleryIframeUrl(santaBase, galleryType, buildUrl, isDebug) {
        var gallerySource = coreUtils.urlUtils.joinURL(santaBase, '/galleries/' + (isDebug ? 'src/' : 'target/'));
        var baseUrl = gallerySource + galleryType + '/' + galleryType + '.html';

        return buildUrl(baseUrl, ['compId', 'deviceType', 'locale', 'viewMode']);
    }

    function getMessage(compProp, items, siteData, styleProps, styleData, rootNavigationInfo) {
        return {
            params: {
                props: _.merge({}, compProp, getStyles(siteData, styleProps, styleData)),
                quality: siteData.getGlobalImageQuality(),
                marketingLandingPage: experiment.isOpen('sv_marketingLandingPage'),
                items: getImagesData(items, siteData, rootNavigationInfo),
                mainPageId: siteData.getMainPageId()
            },
            eventType: 'SETTINGS_UPDATED',
            intent: 'addEventListener'
        };
    }

    function withoutQuality(items) {
        return _.map(items, function(item) {
            return _.omit(item, 'quality');
        });
    }

    /**
     * @class core.tpaGallery
     *
     * @extends {tpa.mixins.tpaUrlBuilder}
     * @extends {tpa.mixins.tpaCompApi}
     * @extends {core.skinBasedComp}
     */
    return {
        mixins: [mixins.skinBasedComp, tpaMixins.tpaUrlBuilder, tpaMixins.tpaCompApi, mixins.skinInfo],
        messageSent: false,
        isAlive: false,
        componentInIframeReady: false,
        processImageClick: function (data) {
            var itemIndex = data.args[0],
                itemAtIndex = this.props.compData.items[itemIndex],
                galleryId = this.props.compData.id,
                zoomLink = linkRenderer.renderImageZoomLink(this.props.siteData, this.props.rootNavigationInfo, itemAtIndex, galleryId);

            if (this.props.rootNavigationInfo.pageItemId === itemAtIndex.id) {
                return;
            }

            var linkUrl = linkRenderer.getLinkUrlFromLinkProps(zoomLink);
            var pageInfo = _.defaults({pageItemAdditionalData: zoomLink['data-page-item-context']},
                utils.wixUrlParser.parseUrl(this.props.siteData, linkUrl));
            this.props.siteAPI.navigateToPage(pageInfo);
        },
        getInitialState: function () {
            this.currStyle = this.props.siteData.getAllTheme()[this.props.structure.styleId];
            this.lastRenderedStyleData = {};
            return {
                height: this.props.style.height
            };
        },
        setAppIsAlive: function () {
            this.isAlive = true;

            this.askToSendIframeMessage(this.props.compProp, this.props.compData);
        },
        setComponentInIframeReady: function () {
            this.messageSent = false;
            this.componentInIframeReady = true;

            this.askToSendIframeMessage(this.props.compProp, this.props.compData);
        },
        askToSendIframeMessage: function (compProp, compData, styleId, props) {
            if (this.debounceIframe && this.shouldDebounceIframe && this.shouldDebounceIframe(compProp, compData, styleId)) {
                this.debounceIframe(compProp, compData, styleId, props);
            } else {
                this.sendIframeMessage(compProp, compData, styleId, props);
            }
        },
        sendIframeMessage: function (compProp, compData, styleId, props) {
            var message;

            if (this.isAlive && this.componentInIframeReady && !this.messageSent) {
                var compPropsForMessage = this.getOverrideParams ? this.getOverrideParams(compProp) : compProp;
                var styleData = this.getStyleData(styleId, props);
                message = getMessage(compPropsForMessage, compData.items, this.props.siteData, this.getStyleProps(), styleData, this.props.rootNavigationInfo);
                if (this.patchMessageProps) {
                    this.patchMessageProps(message.params.props, styleId);
                }
                this.props.siteAPI.getSiteAspect('tpaPostMessageAspect').sendPostMessage(this, message);
                this.lastRenderedStyleData = styleData;
                this.messageSent = true;
            }
        },
        shouldRenderIframe: function (nextProps) {
            var newItems = getImagesData(nextProps.compData.items, nextProps.siteData, nextProps.rootNavigationInfo);

            var newItemsWithoutQuality = withoutQuality(newItems);
            var oldItemsWithoutQuality = withoutQuality(this.props.compData.items);

            var globalQuality = this.props.siteData.getGlobalImageQuality();
            var globalQualityChanged = _.every(this.props.compData.items, function(item){
                return !_.isEqual(item.quality, globalQuality) && !(_.isEmpty(item.quality) && _.isEmpty(globalQuality));
            }, this);

            var shouldRenderIframe =
                !_.isEqual(nextProps.compProp, this.props.compProp) || !_.isEqual(oldItemsWithoutQuality, newItemsWithoutQuality) || globalQualityChanged || !_.isEqual(this.getStyleData(nextProps.structure.styleId), this.lastRenderedStyleData);

            return shouldRenderIframe;
        },
        componentWillReceiveProps: function (nextProps) {
            var nextStyle = nextProps.siteData.getAllTheme()[nextProps.structure.styleId];
            if (!_.isEqual(this.currStyle, nextStyle)) {
                this.currStyle = nextStyle;
                this.messageSent = false;
            }
            if (this.shouldRenderIframe(nextProps)) {
                this.messageSent = false;
            }
            if (!_.isEqual(nextProps.style.height, this.props.style.height)) {
                this.setState({height: nextProps.style.height});
            }

            this.askToSendIframeMessage(nextProps.compProp, nextProps.compData, nextProps.structure.styleId, nextProps);

            if (this.isPlayingAllowed !== this.props.siteData.renderFlags.isPlayingAllowed) {
                this.isPlayingAllowed = this.props.siteData.renderFlags.isPlayingAllowed;
                this.sendEditModeMessage(this.isPlayingAllowed ? 'site' : 'editor');
            }
        },
        sendEditModeMessage: function (editMode) {
            if (!this.isAlive || !this.componentInIframeReady) {
                return;
            }

            var message = {
                params: {
                    editMode: editMode
                },
                eventType: 'EDIT_MODE_CHANGE',
                intent: 'addEventListener'
            };

            this.props.siteAPI.getSiteAspect('tpaPostMessageAspect').sendPostMessage(this, message);
        },
        getSkinProperties: function () {
            return {
                "": {
                    style: {
                        height: this.state.height || 0,
                        minWidth: 10,
                        minHeight: 10
                    }
                },
                iframe: {
                    style: {
                        height: this.state.height,
                        width: this.props.style.width
                    },
                    className: 'tpa-gallery-' + this.getGalleryType(),
                    src: getGalleryIframeUrl(this.props.siteData.santaBase, this.getGalleryType(), this.buildUrl, this.props.siteData.isDebugMode())
                }
            };
        }
    };
});
