define(['lodash', 'utils', 'core/core/siteAspectsRegistry'],
    function(_, utils, siteAspectsRegistry) {
        "use strict";

        /**
         *
         * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
         * @implements {core.SiteAspectInterface}
         * @constructor
         */
        function AnchorLinkChangeEventAspect(aspectSiteAPI) {
            /** @type {core.SiteAspectsSiteAPI} */
            this._aspectSiteAPI = aspectSiteAPI;
            this._registeredCompCallbacks = {};
            this._activeAnchor = null;

            aspectSiteAPI.registerToScroll(this.onScroll.bind(this));
        }

        function getAnchorComp (siteData, anchorId, pageId) {
            pageId = pageId || siteData.getPrimaryPageId();
            var anchors = utils.scrollAnchors.getPageAnchors(siteData, pageId);
            var sortedAnchors = utils.scrollAnchors.getSortedAnchorsByY(siteData, anchors);
            return _.find(sortedAnchors, 'id', anchorId.replace('#', ''));
        }

        function setSelectedAnchor (siteData, anchorId, pageId) {
            if (anchorId) {
                var activeAnchor = getAnchorComp(siteData, anchorId, pageId);
                if (activeAnchor) {
                    this._activeAnchor = {
                        activeAnchorComp: activeAnchor
                    };
                    this.propagateAnchorChangeEvent();
                }
            }
        }

        AnchorLinkChangeEventAspect.prototype = {

            registerToAnchorChange: function (comp) {
                if (comp.onAnchorChange) {
                    this._registeredCompCallbacks[comp.props.id] = comp.onAnchorChange;
                }
            },

            unregisterToAnchorChange: function (comp) {
                delete this._registeredCompCallbacks[comp.props.id];
            },

            onScroll: function () {
                if (!_.isEmpty(this._registeredCompCallbacks)) {
                    var siteData = this._aspectSiteAPI.getSiteData();
                    var scrollPosition = window.pageYOffset || (siteData.isMobileView() ? window.document.scrollTop : window.document.body.scrollTop);
                    var currentActiveAnchor = utils.scrollAnchors.getActiveAnchor(siteData, scrollPosition);
                    if ((this._activeAnchor === null && !!currentActiveAnchor) || (this._activeAnchor && currentActiveAnchor && this._activeAnchor.activeAnchorComp.id !== currentActiveAnchor.activeAnchorComp.id)) {
                        this._activeAnchor = currentActiveAnchor;
                        this.propagateAnchorChangeEvent();
                    }
                }
            },

            setSelectedAnchorAsync: function (siteData, anchorId, pageId, timeout) {
                if (anchorId) {
                    anchorId = anchorId.replace('#', '');
                    setTimeout(setSelectedAnchor.bind(this, siteData, anchorId, pageId), timeout);
                }
            },


            getActiveAnchor: function () {
                return this._activeAnchor;
            },

            propagateAnchorChangeEvent: function () {
                _.forEach(this._registeredCompCallbacks, function (callback) {
                    callback(this._activeAnchor);
                }, this);
            }
        };

        siteAspectsRegistry.registerSiteAspect('anchorChangeEvent', AnchorLinkChangeEventAspect);
    });
