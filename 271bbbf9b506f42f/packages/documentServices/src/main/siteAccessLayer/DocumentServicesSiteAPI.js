define(['lodash', 'core', 'utils', 'documentServices/siteAccessLayer/DSSiteAPIBase'], function (_, core, utils, DSSiteAPIBase) {
    'use strict';

    var sites = {};

    function getSiteProp(dsSiteAPI, path, def) {
        var site = sites[dsSiteAPI._siteId];
        return _.get(site, path, def);
    }

    function getSiteData(dsSiteAPI) {
        return getSiteProp(dsSiteAPI, 'props.siteData', dsSiteAPI._siteData);
    }

    function getSiteDataAPI(dsSiteAPI) {
        return dsSiteAPI._siteDataAPI || getSiteProp(dsSiteAPI, 'props.viewerPrivateServices.siteDataAPI');
    }

    function getSiteAspect(dsSiteAPI, siteAspectName) {
        return getSiteProp(dsSiteAPI, 'siteAspects', {})[siteAspectName];
    }

    function getViewerCompsSiteAPI(dsSiteAPI){
        return getSiteProp(dsSiteAPI, 'siteAPI', {});
    }

    /**
     * @ignore
     * @typedef {DocumentServicesSiteAPI} ds.DocumentServicesSiteAPI
     */


    /**
     * @ignore
     * @constructor
     * @extends {core.SiteAPI}
     * @param site
     */
    function DocumentServicesSiteAPI(site) {
        if (!site || !site.props) {
            if (window.wixBiSession) {
                window.wixBiSession.sendError(core.errors.NULL_SITE_ERROR, 'Document Services');
            }
            return;
        }

        var siteData = site.props.siteData;
        this._siteId = siteData.siteId;
        sites[this._siteId] = site;


        DSSiteAPIBase.call(this, siteData, getSiteDataAPI(this));

        this._didLayoutCallbacks = [];
        this._registeredToDidLayout = false;
        this._lastForceUpdate = null;

        _.forEach(this.bgVideo, function(val, key) {
            this.bgVideo[key] = val.bind(this);
        }, this);
    }

    DocumentServicesSiteAPI.prototype = _.create(DSSiteAPIBase.prototype, {
        'constructor': DocumentServicesSiteAPI,


        /**
         *
         * @param {function()} callback
         */
        registerToDidLayout: function (callback) {
            var site = sites[this._siteId];
            if (!this._registeredToDidLayout) {
                site.registerAspectToEvent(site.supportedEvents.didLayout, this.didLayoutCallback.bind(this));
                this._registeredToDidLayout = true;
            }
            this._didLayoutCallbacks.push(callback);
        },

        didLayoutCallback: function () {
            var site = sites[this._siteId];
            if (!this._lastForceUpdate || this._lastForceUpdate === site.state.forceUpdateIndex) {
                _.forEach(this._didLayoutCallbacks, function (callback) {
                    callback();
                });
            }
        },

        unRegisterFromDidLayout: function (callback) {
            var site = sites[this._siteId];
            site.unregisterAspectFromEvent(site.supportedEvents.didLayout, callback);
        },

        forceUpdate: function (noEnforceAnchors, affectedComps, methodNames, refreshRootsData) {
            // This var is to track cases where refreshRenderedRootsData runs the updateSite callback synchronously
            // For example, when a blog component is added to a page, the data requirements checker loads blog data
            // from the server. If the viewer is updated only after data requirements fulfillment, the user will see
            // the blog component with a delay. Normally, the user should see empty component with loading animation
            // immediately. To cover the case, the viewer should be updated immediately.
            //
            // This is a rare case. Usually, there's a delay only when the viewer is loaded for the first time, and
            // when a component such as blog or shape is added in the editor.
            //
            // Covering the use case also fixes some weird issues like SE-5460, SE-6102, SE-6108.
            var didUpdate = false;

            var siteDataAPI = getSiteDataAPI(this);
            if (refreshRootsData) {
                siteDataAPI.refreshRenderedRootsData(updateSite.bind(this));
            }
            if (!didUpdate) {
                updateSite.call(this);
            }

            function updateSite() {
                var site = sites[this._siteId];

                if (_.isArray(affectedComps) && !_.isEmpty(affectedComps)) {
                    var visibleComps = _.filter(affectedComps, this.isComponentRenderedOnSite, this);
                    if (visibleComps.length !== affectedComps.length && noEnforceAnchors) {
                        utils.log.error('can not update anchors for comps that are not currently rendered');
                    }

                    if (visibleComps.length === 0) {
                        this.didLayoutCallback();
                    } else if (_.every(visibleComps, site.isDomOnlyByMethodNamesAndCompId.bind(site, methodNames))) {
                        site.updateMultipleComps(affectedComps, !!noEnforceAnchors);
                    } else if (visibleComps.length === 1) {
                        site.updateSingleComp(_.first(affectedComps), !!noEnforceAnchors, methodNames);
                    } else {
                        updateEntireSite.call(this);
                    }
                } else {
                    updateEntireSite.call(this);
                }

                didUpdate = true;
            }

            function updateEntireSite() {
                var site = sites[this._siteId];

                this._lastForceUpdate = _.uniqueId('upd');
                site.markInvokedMethodNames(methodNames);

                site.setState({
                    noEnforceAnchors: noEnforceAnchors ? _.uniqueId('enforce') : false,
                    forceUpdateIndex: this._lastForceUpdate
                });

            }
        },

        getSiteAspect: function (siteAspectName) {
            return getSiteAspect(this, siteAspectName);
        },
        registerNavigationComplete: function(callback){
            getSiteAspect(this, 'actionsAspect').registerNavigationComplete(callback);
        },

        resetBehaviorsRegistration: function () {
            var actionsAspect = getSiteAspect(this, 'actionsAspect');
            actionsAspect.resetBehaviorsRegistration();
            var behaviorsAspect = getSiteAspect(this, 'behaviorsAspect');
            behaviorsAspect.resetBehaviorsRegistration();
        },

        enableAction: function (actionName) {
            var actionsAspect = getSiteAspect(this, 'actionsAspect');
            actionsAspect.enableAction(actionName);
        },

        disableAction: function (actionName) {
            var actionsAspect = getSiteAspect(this, 'actionsAspect');
            actionsAspect.disableAction(actionName);
        },

        createDisplayedPage: function (pageId) {
            var siteDataAPI = getSiteDataAPI(this);
            siteDataAPI.createDisplayedPage(pageId);
        },

        createDisplayedNode: function(pointer) {
            var siteDataAPI = getSiteDataAPI(this);
            siteDataAPI.createDisplayedNode(pointer);
        },

        getComponentsByPageId: function (rootId) {
            var site = sites[this._siteId];
            return site.getComponentsByPageId(rootId);
        },

        getAllRenderedRootIds: function () {
            var site = sites[this._siteId];
            return site.getAllRenderedRootIds();
        },

        getRootIdsWhichShouldBeRendered: function () {
            var site = sites[this._siteId];
            return site.getRootIdsWhichShouldBeRendered();
        },

        isComponentRenderedOnSite: function (compId) {
            return _.some(this.getAllRenderedRootIds(), function (rootId) {
                var comps = this.getComponentsByPageId(rootId);
                return Boolean(comps && comps[compId]);
            }, this);
        },

        navigateToPage: function (navigationInfo, skipHistory) {
            var site = sites[this._siteId];
            site.tryToNavigate(navigationInfo, skipHistory);
        },

        scrollToAnchor: function (anchorData, progressCallback) {
            var site = sites[this._siteId];
            var scroll = utils.scrollAnchors.calcAnchorScrollToPosition(anchorData, getViewerCompsSiteAPI(this));
            return site.scrollToAnchor(scroll, progressCallback);
        },

        setMobileView: function (mobileView) {
            var siteAPI = getViewerCompsSiteAPI(this);
            siteAPI.setMobileView(mobileView);
        },

        openPopupPage: function (popupId) {
            this.navigateToPage({pageId: popupId}, true);
        },

        closePopupPage: function () {
            var siteData = getSiteData(this);

            var pageId = siteData.getPrimaryPageId();
            var rootNavigationInfo = siteData.getExistingRootNavigationInfo(pageId);
            this.navigateToPage(rootNavigationInfo, true);
        },

        hasPendingFonts: function () {
            var site = sites[this._siteId];
            return site.refs.theme.refs.fontsLoader.hasPendingFonts();
        },

        isSiteBusy: function(){
            return getSiteProp(this, 'isBusy');
        },

        isSiteBusyIncludingTransition: function(){
            var site = sites[this._siteId];
            return site.siteAPI.isSiteBusyIncludingTransition();
        },

        bgVideo: {
            play: function(compId) {
                var aspect = getSiteAspect(this, 'VideoBackgroundAspect');

                aspect.play(compId);
            },
            stop: function(compId) {
                var aspect = getSiteAspect(this, 'VideoBackgroundAspect');

                aspect.stop(compId);
            },
            isPlaying: function(compId) {
                var aspect = getSiteAspect(this, 'VideoBackgroundAspect');

                return aspect.isPlaying(compId);
            },
            getReadyState: function(compId) {
                var aspect = getSiteAspect(this, 'VideoBackgroundAspect');

                return aspect.getReadyState(compId);
            },
            registerToPlayingChange: function(compId, callback) {
                var aspect = getSiteAspect(this, 'VideoBackgroundAspect');

                return aspect.registerToPlayingChange(compId, callback);
            },
            unregisterToPlayingChange: function(compId) {
                var aspect = getSiteAspect(this, 'VideoBackgroundAspect');

                return aspect.unregisterToPlayingChange(compId);
            },
            enableVideoPlayback: function (silent) {
                var aspect = getSiteAspect(this, 'VideoBackgroundAspect');

                aspect.enableVideoPlayback(silent);
            },
            disableVideoPlayback: function (silent) {
                var aspect = getSiteAspect(this, 'VideoBackgroundAspect');

                aspect.disableVideoPlayback(silent);
            }
        }
    });


    return DocumentServicesSiteAPI;
});
