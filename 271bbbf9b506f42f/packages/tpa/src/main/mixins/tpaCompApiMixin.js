define(['lodash', 'reactDOM'], function(_, ReactDOM) {
    'use strict';

    /**
     * @class tpa.mixins.tpaCompAPI
     */
    return {
        SUPPORTED_SITE_EVENTS: {
            'SCROLL': 'SCROLL',
            'PAGE_NAVIGATION':'PAGE_NAVIGATION',
            'PAGE_NAVIGATION_IN':'PAGE_NAVIGATION_IN',
            'PAGE_NAVIGATION_OUT':'PAGE_NAVIGATION_OUT',
            'PAGE_NAVIGATION_CHANGE': 'PAGE_NAVIGATION_CHANGE',
            'STATE_CHANGED': 'STATE_CHANGED',
            'SESSION_CHANGED': 'SESSION_CHANGED'
        },

        isEventSupported: function (event) {
            return !!this.SUPPORTED_SITE_EVENTS[event];
        },

        isCompListensTo: function (event) {
            return _.includes(this.state.registeredEvents, event);
        },

        getAppData: function () {
            return this.props.siteData.rendererModel.clientSpecMap[this.props.compData.applicationId] || {};
        },

        getDeviceType: function () {
            return this.props.siteData.isMobileView() ? 'mobile' : 'desktop';
        },

        sendPostMessage: function (data) {
            this.props.siteAPI.getSiteAspect('tpaPostMessageAspect').sendPostMessage(this, data);
        },

        getIframe: function () {
            return this.refs.iframe && ReactDOM.findDOMNode(this.refs.iframe);
        },

        startListen: function(event) {
            if (this.isEventSupported(event)) {
                this.setState({registeredEvents: this.state.registeredEvents.concat(event)});

                if (this.props && event === this.SUPPORTED_SITE_EVENTS.SCROLL) {
                    this.props.siteAPI.getSiteAspect('windowScrollEvent').registerToScroll(this);
                }

                if (this.props && _.includes(event, this.SUPPORTED_SITE_EVENTS.PAGE_NAVIGATION) || this.props && _.includes(event, this.SUPPORTED_SITE_EVENTS.PAGE_NAVIGATION_CHANGE)) {
                    this.props.siteAPI.getSiteAspect('tpaPageNavigationAspect').registerToPageChanged(this, event);
                }

                if (this.props && event === this.SUPPORTED_SITE_EVENTS.SESSION_CHANGED) {
                    this.props.siteAPI.getSiteAspect('svSessionChangeEvent').registerToSessionChanged(this);
                }
            }
        },

        stopListen: function(event) {
            this.setState({registeredEvents: _.without(this.state.registeredEvents, event)});

            if (this.props && event === this.SUPPORTED_SITE_EVENTS.SCROLL) {
                this.props.siteAPI.getSiteAspect('windowScrollEvent').unregisterToScroll(this, event);
            }

            if (this.props && _.includes(event, this.SUPPORTED_SITE_EVENTS.PAGE_NAVIGATION)) {
                this.props.siteAPI.getSiteAspect('tpaPageNavigationAspect').unregisterToPageChanged(this);
            }

            if (this.props && event === this.SUPPORTED_SITE_EVENTS.SESSION_CHANGED) {
                this.props.siteAPI.getSiteAspect('svSessionChangeEvent').unRegisterToSessionChanged(this);
            }
        },

        setSiteMemberDataState: function (params) {
            this.setState({
                shouldGetSiteMemberDetails: params
            });
        },

        hasOrigComponent: function () {
            return !_.isUndefined(this.props.compData.origCompId);
        },

        setQueryParams: function (queryParams) {
            if (_.isObject(queryParams)) {
                this.setState({
                    queryParams: queryParams
                });
            }
        },

        componentWillUnmount: function() {
            var compId = this.props.id;
            var appDefId = this.getAppData().appDefinitionId;
            this.props.siteAPI.getSiteAspect('tpaPubSubAspect').deleteCompListeners(appDefId, compId);
        }
    };
});
