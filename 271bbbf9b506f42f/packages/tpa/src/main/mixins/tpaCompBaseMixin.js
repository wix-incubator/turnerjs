define(['zepto', 'lodash', 'reactDOM', 'tpa/bi/errors', 'tpa/services/clientSpecMapService', 'tpa/utils/tpaUtils'], function ($, _, ReactDOM, tpaErrors, clientSpecMapService, tpaUtils) {
    'use strict';
    var DENY_IFRAME_RENDERING_STATES = {
        mobile: 'unavailableInMobile',
        https: 'unavailableInHttps'
    };
    var getMeasurements = function (comp, siteScale) {
        var compNode = ReactDOM.findDOMNode(comp),
            offset = $(compNode).offset();

        return _.assign({
            scrollTop: window.document.body.scrollTop || window.document.documentElement.scrollTop,
            scrollLeft: window.document.body.scrollLeft || window.document.documentElement.scrollLeft,
            documentHeight: $(window.document.body).height(),
            documentWidth: $(window.document.body).width(),
            x: offset.left,
            y: offset.top,
            scale: siteScale
        }, compNode.getBoundingClientRect());
    };

     /**
     * @class tpa.mixins.tpaCompBase
     */
    return {
        ALIVE_TIMEOUT: 20000,
        OVERLAY_GRACE: 5000,
        scrollDataQueue: [],

        onScroll: function () {
            var siteScale = _.get(this, 'props.siteData.renderFlags.siteScale', 1);
            var scrollData = getMeasurements(this, siteScale);
            var self = this;
            self.scrollDataQueue.push(scrollData);

            _.delay(function() {
                if (!_.isEmpty(self.scrollDataQueue)) {
                    var latestScrollData = self.scrollDataQueue.pop();
                    self.scrollDataQueue = [];
                    self.sendPostMessage({
                        intent: 'addEventListener',
                        eventType: 'SCROLL',
                        params: latestScrollData
                    });
                }
            }, 250);

        },

        isUnderMobileView: function() {
            return this.props.siteData.isMobileView();
        },

        getEcomParams: function () {
            var appData = this.getAppData();
            return appData.appDefinitionId === '1380b703-ce81-ff05-f115-39571d94dfcd' &&
                this.props.siteData.currentUrl.query['ecom-tpa-params'];
        },

        _createOverlayChildComponent: function(type, overlay, skinExport, props) {
            props = props || {};
            return this.createChildComponent(
                _.merge(props, {id: skinExport, style: this.props.style, overlay: overlay, applicationId: this.props.compData.applicationId, hideOverlayFunc: this._hideOverlay}),
                type,
                skinExport
            );
        },

        _hideOverlay: function() {
            this.setState({showOverlay: false});
        },

        _createOverlay: function(overlayState) {
            if (!overlayState) {
                return null;
            }

            switch (overlayState) {
                case 'preloader':
                    return this._createOverlayChildComponent(
                        'wysiwyg.viewer.components.tpapps.TPAPreloaderOverlay',
                        overlayState,
                        'preloaderOverlay'
                    );
                case 'unresponsive':
                    return this._createOverlayChildComponent(
                        'wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay',
                        overlayState,
                        'unavailableMessageOverlay',
                        {text: 'We\'re sorry, this content cannot be displayed. Please try again later.'}
                    );
                case DENY_IFRAME_RENDERING_STATES.https:
                    return this._createOverlayChildComponent(
                        'wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay',
                        overlayState,
                        'unavailableMessageOverlay',
                        {text: 'We\'re sorry, this content cannot be displayed.'}
                    );
                case DENY_IFRAME_RENDERING_STATES.mobile:
                    return this._createOverlayChildComponent(
                        'wysiwyg.viewer.components.tpapps.TPAUnavailableMessageOverlay',
                        overlayState,
                        'unavailableMessageOverlay',
                        {text: 'We\'re sorry, this content is currently not optimized for mobile view.'}
                    );
                default:
                    return null;
            }
        },

        getRootStyle: function (style) {
            return _.assign({
                minHeight: style.height,
                minWidth: style.width,
                visibility: this.state.visibility
            }, style);
        },

        getCompRootStyle: function (style) {
            if (this.state && !_.isUndefined(this.state.height)) {
                style.height = this.state.height;
            }

            if (this.state && !_.isUndefined(this.state.width)) {
                style.width = this.state.width;
            }

            if (this.state && (this.state.isAlive ||
                this.state.overlay === 'preloader' ||
                this.state.overlay === 'unresponsive' ||
                this.state.overlay === DENY_IFRAME_RENDERING_STATES.mobile)) {
                this.state.visibility = 'visible';
            }

            if (this.state.ignoreAnchors) {
                style.zIndex = 1001;
            } else {
                style.zIndex = '';
            }

            style = this.getRootStyle(style);

            //  Z-Index was added to support 2G (new) eCom cart widget on sticky headers, but we don't want to set z-index on components.( https://jira.wixpress.com/browse/TPA-2123 )
            //  SINCE MANY SITES WERE SAVED WITH THE WIDGET *ON TOP* OF THE HEADER (NOT INSIDE)
            //  IT MAY DISAPPEAR UNDER IT IF IT'S FIXED POSITIONED AND  WE MIGHT NEED TO BRING IT BACK AND FIND A BETTER SOLUTION
            //
            //if (this.props.rootId === 'masterPage' && !this.isUnderMobileView()) {
            //    style.zIndex = '100';
            //}

            return style;
        },

        shouldRenderIframe: function() {
            var overlay = this.state.overlay;
            var overlayDoesNotContaineDenyState = !_.includes(DENY_IFRAME_RENDERING_STATES, overlay);
            var appIsNotResponsive = this.state.overlay === 'unresponsive';
            var shouldRenderIframe = overlayDoesNotContaineDenyState && !appIsNotResponsive;

            return shouldRenderIframe;
        },

        _getIframeProperties: function() {
            if (!this.shouldRenderIframe()) {
                return null;
            }

            var shouldShowIframe = this._shouldShowIframe(this.state);
            var iframeSrc = this.buildUrl(this.getBaseUrl());

            return {
                src: iframeSrc,
                key: iframeSrc,
                scrolling: "no",
                frameBorder: "0",
                allowTransparency: true,
                allowFullScreen: true,
                name: this.props.id,
                style: {
                    display: shouldShowIframe ? 'block' : 'none',
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    position: "absolute"
                }
            };
        },

        getSkinProperties: function () {
            var overlay = this._createOverlay(this.state.overlay);

            var iframeProperties = this._getIframeProperties();

            var skinProps = {
                '': {
                    style: this.getCompRootStyle(this.props.style),
                    'data-ignore-anchors': this.state.ignoreAnchors
                },
                overlay: this.state.showOverlay && this.isNotWorker() ? overlay : null,
                iframe: iframeProperties ? iframeProperties : 'remove'
            };

            this.checkIfNeedToSendMemberData();

            if (this.mutateSkinProperties) {
                skinProps = this.mutateSkinProperties(skinProps);
            }

            return skinProps;
        },

        checkIfNeedToSendMemberData: function () {
            var siteMemberDetailsState = this.state.shouldGetSiteMemberDetails;
            if (siteMemberDetailsState) {
                var siteMembersAspect = this.props.siteAPI.getSiteAspect('siteMembers');
                var memberData = siteMembersAspect.getMemberDetails();

                if (memberData) {
                    siteMemberDetailsState.callback({
                        authResponse: true,
                        data: memberData
                    });
                }
            }
        },

        getInitialState: function() {
            this.urlState = '';

            var underMobileAndNotSupported = this.isUnderMobileView() && this.isMobileReady && !this.isMobileReady();
            var overlay = underMobileAndNotSupported ? DENY_IFRAME_RENDERING_STATES.mobile : null;

            var initialState = {
                visibility: 'hidden',
                overlay: overlay,
                isAlive: false,
                registeredEvents: [],
                showOverlay: true,
                initialWidth: this.props.style.width
            };

            if (this.mutateInitialState) {
                initialState = this.mutateInitialState(initialState);
            }
            return initialState;
        },

        _showOverlayIfNeeded: function () {
            if (this.state && this.state.isAlive === false && !this.state.overlay) {
                this.setState({
                    overlay: this._getInitialOverlay(),
                    visibility: 'visible'
                });
            }
        },

        _shouldShowIframe: function(state) {
            return !state.overlay || state.overlay === 'preloader';
        },

        _getInitialOverlay: function() {
            if (this.isMobileReady && this.isUnderMobileView() && !this.isMobileReady()) {
                return DENY_IFRAME_RENDERING_STATES.mobile;
            }

            /*  //server has regax to switch iframe to the site protocol so this use-case is not valid
            var isIframeUrlSecure = this._isUrlSecure(iframeUrl);
            var isSiteUrlSecure = this._isUrlSecure(siteUrl);
            var isUnmatchingSecureness = isSiteUrlSecure && !isIframeUrlSecure;
            return isUnmatchingSecureness ? DENY_IFRAME_RENDERING_STATES.https : 'preloader';
            */

            return 'preloader';
        },

        componentWillReceiveProps: function (nextProps) {
            if (this.resize) {
                this.resize(nextProps);
            }
        },

        componentDidMount: function() {
            var overlay = this.state.overlay;
            if (this.isNotWorker()) {
                setTimeout(this._showOverlayIfNeeded, this.OVERLAY_GRACE);
                if (!this.props.siteData.isViewerMode()) {//eslint-disable-line react/no-did-mount-callbacks-from-props
                    if (this.setOverlayState) {
                        this.setOverlayState();
                    }
                }
            }
            if (!(this.state.isAlive ||
                _.includes(DENY_IFRAME_RENDERING_STATES, overlay )) && this.isNotWorker()
            ) {
                this._appAliveTimeout = setTimeout(this._onAppAliveTimeoutExpires, this.ALIVE_TIMEOUT);
                tpaUtils.incAppCounter();
            }

        },

        isNotWorker: function () {
            if (this.isTPAWorker) {
                return !this.isTPAWorker();
            }
            return true;
        },

        _onAppAliveTimeoutExpires: function() {
            this.showUnresponsiveOverlay();
        },

        showUnresponsiveOverlay: function () {
            if (!this.state.isAlive) {
                this.setState({
                    overlay: 'unresponsive',
                    visibility: 'visible'
                }, function () {
                    this.reportBIAppNotResponsive();
                }.bind(this));
            }
        },

        reportBIAppNotResponsive: function () {
            var widgetId = this.props.compData.widgetId;
            var appData = this.getAppData();
            var widgetData = widgetId ? _.get(appData.widgets, widgetId) : clientSpecMapService.getMainSectionWidgetData(appData);
            var reportParams = {
                "endpoint": _.get(widgetData, 'widgetUrl'),
                "app_id": _.get(appData, 'appDefinitionId')
            };
            this.props.siteAPI.reportBI(tpaErrors.APP_IS_NOT_RESPONSIVE, reportParams);
        },

        componentWillUnmount: function() {
            this._clearAliveTimeout();
        },

        _clearAliveTimeout: function() {
            if (this._appAliveTimeout) {
                clearTimeout(this._appAliveTimeout);
                this._appAliveTimeout = 0;

                if (this.props) {
                    tpaUtils.decAppCounter(this.props.siteAPI);
                }
            }
        },

        setAppIsAlive: function(callback) {
            this._clearAliveTimeout();

            this.setState({
                isAlive: true,
                overlay: this.state.overlay === 'preloader' ? null : this.state.overlay
            }, callback);
        },

        _isUrlSecure: function(url) {
            return /^https/.test(url);
        }
    };
});
