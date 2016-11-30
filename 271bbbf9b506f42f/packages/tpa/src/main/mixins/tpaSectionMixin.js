define(['lodash', 'tpa/utils/tpaUtils', 'experiment'], function(_, tpaUtils, experiment){
    'use strict';

    return {
        isTPASection: true,

        getSiteAdditionalDataFromProps: function(props) {
            var info = props.siteData.getExistingRootNavigationInfo(props.rootId);
            return info && info.pageAdditionalData || '';
        },

        mutateSkinProperties: function (skinProps) {
            if (typeof skinProps.iframe === 'object') {
                skinProps.iframe.src = this.buildUrl(this.getBaseUrl());
            }

            return skinProps;
        },

        mutateInitialState: function (initialState) {
            initialState.sectionUrlState = this.getSiteAdditionalDataFromProps(this.props);
            initialState.sectionUrl = this.fixSectionUrl();

            return initialState;
        },

        fixSectionUrl: function () {
            var sectionUrl = this.props.siteAPI.getPageUrl(true);
            return this.endsWith(sectionUrl, '/') ? sectionUrl : sectionUrl + "/";
        },

        endsWith: function (str, suffix) {
            return _.endsWith(str, suffix);
        },

        isViewerMode: function () {
            return this.getViewMode() === 'site';
        },

        componentWillReceiveProps: function (nextProps) {
            if (experiment.isOpen('deepLinking')){
                var nextUrlState = this.getSiteAdditionalDataFromProps(nextProps);

                if (!_.isUndefined(this.state.pushState)) {
                    this.urlState = this.state.pushState;
                    this.setState({
                        pushState: undefined
                    });
                } else if (nextProps.currentUrlPageId === this.props.pageId && this.isViewerMode()) {
                    if (this.urlState !== nextUrlState) {
                        this.urlState = nextUrlState;
                        this.setState({
                            sectionUrlState: nextUrlState
                        });
                    }
                }
                this.reportStateChanged(nextUrlState);
            } else {
                var previousSectionState = this.state.sectionUrlState;
                var nextSectionState = this.getSiteAdditionalDataFromProps(nextProps);

                if ((previousSectionState !== nextSectionState) ||
                    (_.isEmpty(nextSectionState) && !_.isEmpty(this.state.pushState))) {
                    if (this.isCompListensTo(this.SUPPORTED_SITE_EVENTS.STATE_CHANGED)) {
                        this.sendPostMessage({
                            intent: 'addEventListener',
                            eventType: 'STATE_CHANGED',
                            params: {
                                newState: nextSectionState
                            }
                        });
                    }
                }

                if (nextProps.currentUrlPageId === this.props.rootId) {
                    var siteData = this.props.siteData;
                    var currentRootInfo = siteData.getExistingRootNavigationInfo(this.props.rootId);
                    var currentRootState = currentRootInfo.pageAdditionalData;

                    if (this.state.pushState) {
                        if ((currentRootState !== previousSectionState && currentRootState !== this.state.pushState) || this.props.currentUrlPageId !== nextProps.currentUrlPageId) {
                            this.setState({
                                sectionUrlState: nextSectionState,
                                sectionUrl: this.fixSectionUrl(),
                                pushState: undefined
                            });
                        }
                    } else if (currentRootState !== previousSectionState) {
                        this.setState({
                            sectionUrlState: nextSectionState,
                            sectionUrl: this.fixSectionUrl()
                        });
                    }
                }
            }
        },

        reportStateChanged: function(nextUrlState){
            if (this.isCompListensTo(this.SUPPORTED_SITE_EVENTS.STATE_CHANGED)) {
                this.sendPostMessage({
                    intent: 'addEventListener',
                    eventType: 'STATE_CHANGED',
                    params: {
                        newState: nextUrlState
                    }
                });
            }
        },

        isMobileReady: function() {
            var appData = this.getAppData();
            var isInDevMode = this.isInMobileDevMode && this.isInMobileDevMode();
            var compData = this.props.compData;
            var widgets = _.get(appData, 'widgets');
            if (widgets && compData.widgetId) {
                var widgetData = widgets[compData.widgetId];
                return widgetData.mobileUrl && (isInDevMode || widgetData.mobilePublished);
            }

            return appData.sectionMobileUrl && (isInDevMode || appData.sectionMobilePublished);
        },

        mutateIframeUrlQueryParam: function(queryParamsObj) {
            if (this.props.siteData.isViewerMode()) {
                if (experiment.isOpen('deepLinking')){
                    queryParamsObj['section-url'] = this.fixSectionUrl();
                } else {
                    queryParamsObj['section-url'] = this.state.sectionUrl;
                }
                queryParamsObj.target = '_top';
            } else {
                queryParamsObj['section-url'] = this.getBaseUrl();
                queryParamsObj.target = '_self';
            }

            queryParamsObj.width = this.state.initialWidth;

            return queryParamsObj;
        },

        mutateIframeSrc: function (urlObj) {
            urlObj = this.addStateToUrlObj(urlObj, this.state.sectionUrlState);

            return urlObj;
        },

        addStateToUrlObj: function (urlObj, state) {
            if (state) {
                var hashState = state.charAt(0) === '#';

                if (hashState) {
                    urlObj.hash = state;
                } else {
                    if (urlObj.path && urlObj.path.slice(-1) !== '/') {
                        urlObj.path += '/';
                    }

                    urlObj.path += state;
                }
            }

            return urlObj;
        }
    };
});
