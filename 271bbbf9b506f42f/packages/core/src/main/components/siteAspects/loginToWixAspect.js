/*eslint no-unused-vars:0*/
define(['react', 'lodash', 'utils', 'core/core/siteAspectsRegistry', 'core/bi/events'], function
    (React, _, /** utils */ utils, /** core.siteAspectsRegistry */ siteAspectsRegistry, events) {
    "use strict";

    var DEFAULT_REDIRECT_URLS = {
        "postLogin": "http://www.wix.com/my-account",
        "postSignUp": "http://www.wix.com/new/account"
    };

    var userApi = utils.wixUserApi;

    var anchorsUtils = utils.scrollAnchors;

    /**
     * @param siteData
     * @returns {string} url
     */
    function getIframeUrl(siteData, queryParams) {
        queryParams = _.assign(queryParams || {}, {
            renderMode: 'iframe'
        });
        var queryString = utils.urlUtils.toQueryString(queryParams);
        return '//' + siteData.currentUrl.host + '/signin?' + queryString;
    }

    function getAnchorParams(srcElem, siteData) {
        if (!srcElem) {
            return null;
        }
        var scrollPosition = window.pageYOffset + srcElem.getBoundingClientRect().top;
        var activeAnchor = anchorsUtils.getActiveAnchor(siteData, scrollPosition);

        var elem = srcElem;
        while (elem && !elem.id) {
            elem = elem.parentNode;
        }

        return {
            activeFold: activeAnchor.index,
            totalFolds: activeAnchor.total,
            text: srcElem.textContent || elem.alt || '',
            componentId: elem ? elem.id : undefined
        };
    }

    /**
     * @returns {ReactClass}
     */
    function getIframeFactory() {
        if (!this.iframeFactory) {
            var queryParams = this.queryParams;
            var iframeClass = React.createClass({
                displayName: 'LoginToWixIframe',
                render: function () {
                    return React.DOM.iframe({
                        src: getIframeUrl(this.props.siteData, queryParams),
                        ref: 'iframe',
                        style: {
                            position: 'fixed',
                            top: '0px',
                            left: '0px',
                            width: '100%',
                            height: '100%',
                            display: 'block',
                            zIndex: 10000
                        }
                    });
                }
            });

            this.iframeFactory = React.createFactory(iframeClass);
        }

        return this.iframeFactory;
    }

    /**
     * @returns {ReactComponent}
     */
    function getIframeComp() {
        var siteData = this.aspectSiteApi.getSiteAPI().getSiteData();

        var iframeFactory = getIframeFactory.call(this);
        return iframeFactory({
            siteData: siteData,
            displayForm: this.isLoginToWixShown
        });
    }

    /**
     * Determine if running in a wix site (e.g. landing pages)
     * @returns {boolean}
     */
    function isWixSite() {
        if (_.isUndefined(this.isWixSite)) {
            this.isWixSite = this.aspectSiteApi.getSiteAPI().getSiteData().isWixSite();
        }
        return this.isWixSite;
    }

    /**
     *
     * @param {core.SiteAspectsSiteAPI} aspectSiteApi
     * @implements {core.SiteAspectInterface}
     * @constructor
     */
    function LoginToWixAspect(aspectSiteApi) {
        /** @type core.SiteAspectsSiteAPI */
        this.aspectSiteApi = aspectSiteApi;
        this.isLoginToWixShown = false;
        this.registeredToMessage = false;
        this.iframeFactory = null;
    }

    LoginToWixAspect.prototype = {
        /**
         *
         * @returns {ReactComponent[]}
         */
        getReactComponents: function () {
            if (this.isLoginToWixShown && isWixSite.call(this)) {
                return [getIframeComp.call(this)];
            }

            return null;
        },

        isLoggedInToWix: function () {
            var siteData = this.aspectSiteApi.getSiteAPI().getSiteData();
            return userApi.isSessionValid(siteData.requestModel.cookie);
        },

        logout: function () {
            var siteData = this.aspectSiteApi.getSiteAPI().getSiteData();
            userApi.logout(siteData);
            this.aspectSiteApi.forceUpdate();
        },

        openLoginToWixForm: function (url, passQueryParams, srcElem) {
            if (this.isLoginToWixShown) {
                return;
            }

            this.isWixSite = true; // if someone asked to open the form, mark as wix site in any case

            if (!this.registeredToMessage) {
                this.aspectSiteApi.registerToMessage(this.handlePostMessage.bind(this));
                this.registeredToMessage = true;
            }

            var queryParams = utils.urlUtils.parseUrl(url).query;
            this.queryParams = passQueryParams ? queryParams : null;

            this.postLoginUrl = queryParams.postLogin || DEFAULT_REDIRECT_URLS.postLogin;
            this.postSignupUrl = queryParams.postSignUp || DEFAULT_REDIRECT_URLS.postSignUp;

            var siteData = this.aspectSiteApi.getSiteAPI().getSiteData();
            var anchorParams = getAnchorParams(srcElem, siteData);
            if (anchorParams) {
                var separator = url.indexOf('?');
                var params = {
                    targetUrl: separator !== -1 ? url.substring(0, separator) : url
                };
                _.assign(params, _.pick(queryParams, ['postLogin', 'postSignUp', 'loginCompName']), anchorParams);
                this.aspectSiteApi.reportBI(events.LP_BUTTON_CLICK, params);
            }

            this.isLoginToWixShown = true;
            this.aspectSiteApi.scrollSiteTo(0, 0);
            this.aspectSiteApi.forceUpdate();
        },

        handlePostMessage: function (event) {
            event = (event.data) ? event : event.originalEvent; // race condition with jQuery event wrapper
            var aspectSiteApi = this.aspectSiteApi;
            switch (event.data) {
                case 'onLoad':
                    break;
                case 'onPostLogin':
                    window.location.href = this.postLoginUrl;
                    break;
                case 'onPostSignUp':
                    window.location.href = this.postSignupUrl;
                    break;
                case 'onClose':
                    this.isLoginToWixShown = false;

                    setTimeout(function () { // we need to enable the iframe to pass a postMessage before removing it.
                        aspectSiteApi.forceUpdate();
                    }, 1000);

                    break;
                default:
                    break;
            }
        }
    };

    siteAspectsRegistry.registerSiteAspect('LoginToWix', LoginToWixAspect);
    return LoginToWixAspect;
});
