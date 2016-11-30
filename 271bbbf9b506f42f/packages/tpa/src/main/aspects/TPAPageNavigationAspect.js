define(['lodash'], function(_) {
    'use strict';

    var shouldNotifyComp = function (listener, newPageId, oldPageId, compPageId) {
        return listener.type === 'PAGE_NAVIGATION' ||
            (listener.type === 'PAGE_NAVIGATION_IN' && compPageId === newPageId) ||
            (listener.type === 'PAGE_NAVIGATION_OUT' && compPageId === oldPageId);
    };

    /**
     *
     * @constructor
     * @param {core.SiteAspectsSiteAPI} siteAPI
     */
    var TPAPageNavigationAspect = function (siteAPI, pageId) {
        this._listeners = {};
        this._siteAPI = siteAPI;
        this._currentPageId = pageId || this._siteAPI.getSiteData().getCurrentUrlPageId();

        this._siteAPI.registerToUrlPageChange(this.notifyPageChanged.bind(this));
    };

    TPAPageNavigationAspect.prototype = {
        notifyPageChanged: function () {
            var newPageId = this._siteAPI.getSiteData().getCurrentUrlPageId(),
                oldPageId = this._currentPageId;

            _.forEach(this._listeners, function (listenersArray) {
                _.forEach(listenersArray, function (listener) {
                    var compPageId = listener.comp.props.rootId;
                    var isCompMounted = listener.comp.isMounted();

                    if (isCompMounted && shouldNotifyComp(listener, newPageId, oldPageId, compPageId)) {
                        listener.comp.sendPostMessage({
                            intent: 'addEventListener',
                            eventType: listener.type,
                            params: {
                                toPage: newPageId,
                                fromPage: oldPageId,
                                isAppOnPage: compPageId === newPageId,
                                wasAppOnPage: compPageId === oldPageId
                            }
                        });
                    }
                });
            });

            this._currentPageId = newPageId;
        },

        registerToPageChanged: function (comp, type) {
            var listeners = this._listeners[comp.props.id];
            if (!listeners) {
                listeners = this._listeners[comp.props.id] = [];
            }

            listeners.push({
                comp: comp,
                type: type
            });
        },

        unregisterToPageChanged: function (comp) {
            delete this._listeners[comp.props.id];
        }
    };

    return TPAPageNavigationAspect;
});
