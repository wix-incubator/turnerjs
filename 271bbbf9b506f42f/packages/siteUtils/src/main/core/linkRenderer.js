define([
    'lodash',
    'wixUrlParser',
    'coreUtils'
], function (
    _,
    wixUrlParser,
    coreUtils) {
    "use strict";

    var SAME_TAB_TARGET = "_self",
        NEW_TAB_TARGET = "_blank",
        LOGIN_TO_WIX_URL = "https://users.wix.com/signin?",
        /*eslint no-script-url:0*/
        EMPTY_HREF = 'javascript:void()';

    var newOptionalParameters = {
        sendEmail: 'sendMail',
        welcomeEmailTemplate: 'mailTemplate',
        userColor: 'userColor',
        loginCompName: 'loginCompName',
        referralInfo: 'loginCompName'
    };

    function renderExternalLink(siteData, linkData) {

        if (!coreUtils.validationUtils.isValidUrl(linkData.url)) {
            return {};
        }

        return {
            href: linkData.url,
            target: linkData.target || NEW_TAB_TARGET,
            'data-content': linkData.url,
            'data-type': 'external'
        };
    }

    function renderCustomPageLink(siteData, linkData, customNavInfo) {
        var pageData = linkData.pageId;

        if (!pageData) {
            return {};
        }
        var navInfo = customNavInfo || {
            pageId: pageData.id,
            title: pageData.pageUriSEO
        };

        var href = wixUrlParser.getUrl(siteData, navInfo);
        var link = {
            href: href,
            target: SAME_TAB_TARGET
        };

        if (isPopupPage(siteData, pageData.id)) {
            _.assign(link, {
                href: EMPTY_HREF,
                'data-no-physical-url': href
            });
        }

        return link;
    }

    function renderDynamicPageLink (siteData, linkData){

        if (!linkData.routerId) {
            return {};
        }
        var navInfo = {
            routerId: linkData.routerId,
            innerRoute: linkData.innerRoute
        };

        var href = wixUrlParser.getUrl(siteData, navInfo);
        var link = {
            href: href,
            target: SAME_TAB_TARGET
        };
        if (linkData.anchorDataId) {
            link['data-anchor'] = linkData.anchorDataId;
        }
        return link;
    }

    function renderPageLink(siteData, linkData) {
        return renderCustomPageLink(siteData, linkData);
    }

    //for now, we have link anchors on primary pages only (not on popups)
    function renderAnchorLink(siteData, linkData, navInfo) {
	    var isMasterPage = linkData.pageId.id === 'masterPage';
        var clonedLinkData = _.clone(linkData),
            anchorId = _.has(linkData.anchorDataId, 'id') ? linkData.anchorDataId.id : linkData.anchorDataId,
            isPageScroll = _.includes(coreUtils.siteConstants.SAME_PAGE_SCROLL_ANCHORS, anchorId) || isMasterPage,
            isLinkOnZoom = navInfo.imageZoom,
            isLinkOnPopup = isPopupPage(siteData, navInfo.pageId),
            linkProperty;

        if (isPageScroll) {
            if (isLinkOnZoom || isLinkOnPopup) {
                //TODO: Alissa this should be silent - update not nvigate
                var pageData = siteData.pagesDataItemsMap[siteData.primaryPageId];
                linkProperty = renderCustomPageLink(siteData, {pageId: pageData});
            } else {
                linkProperty = renderCustomPageLink(siteData, clonedLinkData, navInfo);
            }
        } else {
            linkProperty = renderPageLink(siteData, clonedLinkData);
        }


        if (!isLinkOnPopup){
            linkProperty['data-keep-roots'] = true;
        }

        linkProperty['data-anchor'] = anchorId;

        return linkProperty;
    }

    function renderPhoneLink(linkData) {
       return {
            href: "tel:" + linkData.phoneNumber,
           'data-content': linkData.phoneNumber,
           'data-type': 'phone'
        };
    }

    function renderEmailLink(linkData) {
        var emailLink = "mailto:" + ((linkData.recipient && linkData.recipient.trim()) || ''),
            linkParamsArr = [];

        if (linkData.subject) {
            linkParamsArr.push('subject=' + linkData.subject);
        }

        if (linkData.body) {
            linkParamsArr.push('body=' + linkData.body);
        }

        if (linkParamsArr.length > 0) {
            emailLink += ("?" + linkParamsArr.join("&"));
        }

        return {
            href: emailLink,
            target: SAME_TAB_TARGET,
            'data-content': linkData.recipient,
            'data-type': 'mail'
        };
    }

    function renderDocumentLink(siteData, linkData) {
        var docId = linkData.docId;
        var isPDF = /\.pdf$/i.test(docId);
        var staticDocsUrl = siteData.serviceTopology.staticDocsUrl;
        var href;

        if (_.includes(docId, 'ugd/') && _.includes(staticDocsUrl, '/ugd')) {
            docId = docId.substr(docId.indexOf('ugd') + 4);
        }

        href = staticDocsUrl + "/" + docId;

        // ?dn=document+name.ext -- will cause link to download the file with the specified name
        // for pdf, we want it to open in browser and not download. The browser attaches a download button to it anyway.
        // for non pdf, we want the link to download the file for the user
        if (!isPDF) {
            href += ("?" + coreUtils.urlUtils.toQueryString({dn: linkData.name}));
        }

        return {
            href: href,
            target: NEW_TAB_TARGET,
            'data-type': 'document'
        };
    }

    function renderLoginToWixLink(siteData, linkData) {
        var postLoginUrl = linkData.postLoginUrl || '',
            postSignupUrl = linkData.postSignupUrl || '',
            view = linkData.dialog || 'showLogin',
            urlParams, href, paramObj, target = '';

        if (_.includes(postSignupUrl, 'ifcontext')) {
            paramObj = coreUtils.urlUtils.parseUrl(postSignupUrl).query;
            _.forOwn(paramObj, function (value, key) {
                if (key.toLowerCase() === 'ifcontext') {
                    target = value.replace('#', '');
                    if (/^[a-zA-Z0-9]+$/.test(target)) {
                        postSignupUrl = postSignupUrl.replace('{ifcontext}', target);
                    } else {
                        postSignupUrl = postSignupUrl.replace('{ifcontext}', 'illegalContextValue');
                    }
                }
            });
        }

        if (coreUtils.wixUserApi.isSessionValid(siteData.cookie)) {
            href = postLoginUrl;
        } else {
            if (view === 'createUser') {
                view = 'sign-up';
            }

            urlParams = {
                originUrl: siteData.currentUrl.full,
                postLogin: postLoginUrl,
                postSignUp: postSignupUrl,
                view: view
            };

            _.forEach(newOptionalParameters, function (value, key) {
                var linkDataItem = linkData[value];
                if (!_.isUndefined(linkDataItem) && linkDataItem !== '') {
                    urlParams[key] = linkDataItem;
                }
            });

            href = LOGIN_TO_WIX_URL + coreUtils.urlUtils.toQueryString(urlParams);
        }

        return {
            href: href,
            target: SAME_TAB_TARGET
        };
    }

    function renderSwitchMobileViewModeLink(siteData, linkData) {
        return {
            href: siteData.currentUrl.full,
            target: '_self',
            'data-mobile': linkData.dataMobile
        };
    }

    function isPopupPage(siteData, pageId) {
        var pageData = siteData.pagesDataItemsMap[pageId];
        return pageData && pageData.isPopup;
    }

    function isEmailLink(linkUrl) {
        return !!linkUrl && linkUrl.indexOf('mailto') === 0;
    }

    function isExternalLink(siteData, linkUrl) {
        if (!linkUrl) {
            return false;
        }

        var resolvedSiteData = wixUrlParser.utils.getResolvedSiteData(siteData);
        var isInSameSiteUrl = !!wixUrlParser.parseUrl(resolvedSiteData, linkUrl);
        var isMediaLink = linkUrl.indexOf(resolvedSiteData.serviceTopology.staticDocsUrl) === 0;
        var isEmptyLink = linkUrl === EMPTY_HREF;
        //image from Naama + validate server new schema + move to QA

        return !(isInSameSiteUrl || isEmailLink(linkUrl) || isMediaLink || isEmptyLink);
    }

    function isInvalidLink(linkData) {
        return (linkData.type === 'PageLink' && !linkData.pageId) ||
            (linkData.type === 'AnchorLink' && !linkData.pageId) ||
            (linkData.type === 'AnchorLink' && !linkData.anchorDataId) ||
            (linkData.type === 'DocumentLink' && !linkData.docId) ||
            (linkData.type === 'DynamicPageLink' && !linkData.routerId);
    }

    function isRelativeUrl(url){
        if (!url){
            return false;
        }
        return url.charAt(0) === "/";
    }

    function getContextString(galleryId, propertyQuery) {
        var contextArr = [];
        if (galleryId){
            contextArr.push('galleryId:' + galleryId);
        }
        if (propertyQuery){
            contextArr.push('propertyQuery:' + propertyQuery);
        }
        return contextArr.join(' ');
    }

    /**
     * @class utils.linkRenderer
     */
    return {
        renderLink: function (linkData, siteData, navInfo) {
            if (!linkData || isInvalidLink(linkData) || !navInfo) {
                return {};
            }

            var resolvedSiteData = wixUrlParser.utils.getResolvedSiteData(siteData);

            switch (linkData.type) {
                case 'PageLink':
                    return renderPageLink(resolvedSiteData, linkData);
                case 'ExternalLink':
                    return renderExternalLink(resolvedSiteData, linkData);
                case 'AnchorLink':
                    return renderAnchorLink(resolvedSiteData, linkData, navInfo);
                case 'LoginToWixLink':
                    return renderLoginToWixLink(resolvedSiteData, linkData);
                case 'EmailLink':
                    return renderEmailLink(linkData);
                case 'PhoneLink':
                    return renderPhoneLink(linkData);
                case 'DocumentLink':
                    return renderDocumentLink(resolvedSiteData, linkData);
                case 'SwitchMobileViewMode':
                    return renderSwitchMobileViewModeLink(resolvedSiteData, linkData);
                case 'DynamicPageLink':
                    return renderDynamicPageLink(resolvedSiteData, linkData);
                default:
                    return {};
            }
        },

        /**
         *
         * @param {core.SiteData} siteData
         * @param {site.rootNavigationInfo} parentNavInfo
         * @param {(string|data.compDataItem)} imageData
         * @param {(string)} [propertyQuery]
         * @returns {{href: string}}
         */
        renderImageZoomLink: function (siteData, parentNavInfo, imageData, galleryId, propertyQuery) {
            /** @type data.compDataItem*/
            var href;
            var linkProps;

            if (coreUtils.nonPageItemZoom.shouldImageBeZoomedAsNonPageItem(imageData)) {
                linkProps = {
                    onClick: function () {
                        coreUtils.nonPageItemZoom.zoom(imageData);
                    }
                };
            } else {
                var navInfoForLink = {
                    pageId: parentNavInfo.pageId,
                    pageItemId: imageData.id,
                    title: imageData.title,
                    imageZoom: true
                };
                var resolvedSiteDataForLink = wixUrlParser.utils.getResolvedSiteData(siteData);

                href = wixUrlParser.getUrl(resolvedSiteDataForLink, navInfoForLink);
                linkProps = {
                    href: href,
                    target: SAME_TAB_TARGET
                };
                if (isPopupPage(resolvedSiteDataForLink, navInfoForLink.pageId)) {
                    linkProps.href = EMPTY_HREF;
                    linkProps['data-no-physical-url'] = href;
                }

                var context = getContextString(galleryId, propertyQuery);

                if (context) {
                    linkProps['data-page-item-context'] = context;
                }
            }

            return linkProps;
        },

        /**
         *
         * @param pageId
         * @param siteData
         * @returns {*}
         */
        renderPageLink: function (pageId, siteData) {
            var resolvedSiteData = wixUrlParser.utils.getResolvedSiteData(siteData);

            return renderPageLink(resolvedSiteData, {pageId: pageId});
        },

        isExternalLink: isExternalLink,

        isRelativeUrl: isRelativeUrl,

        isEmailLink: isEmailLink,

        getLinkUrlFromLinkProps: function (linkProps) {
            return linkProps.href === EMPTY_HREF ? linkProps['data-no-physical-url'] : linkProps.href;
        },

        CONSTS: {
            LOGIN_TO_WIX_URL: LOGIN_TO_WIX_URL
        }
    };
});
