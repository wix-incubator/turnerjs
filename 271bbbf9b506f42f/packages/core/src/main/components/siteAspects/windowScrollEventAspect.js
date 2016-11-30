define(['lodash', 'core/core/siteAspectsRegistry'],
    function (_, siteAspectsRegistry) {
        "use strict";

        /**
         *
         * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
         * @implements {core.SiteAspectInterface}
         * @constructor
         */
        function WindowScrollEventAspect(aspectSiteAPI) {
            /** @type {core.SiteAspectsSiteAPI} */
            this._aspectSiteAPI = aspectSiteAPI;
            this._registeredCompIds = {};
            this._prevScrollPosition = {x: 0, y: 0};
            this._aspectSiteAPI.registerToSiteReady(function () {
                this._aspectSiteAPI.registerToScroll(this.propagateScrollEvent.bind(this));
            }.bind(this));
        }

        WindowScrollEventAspect.prototype = {
            registerToScroll: function (comp) {
                this._registeredCompIds[comp.props.id] = comp.props.id;
            },

            unregisterToScroll: function (comp) {
                delete this._registeredCompIds[comp.props.id];
            },
            propagateScrollEvent: function () {
                var position = {
                    x: window.pageXOffset || window.document.body.scrollLeft,
                    y: window.pageYOffset || window.document.body.scrollTop
                };
                var direction = this.getScrollDirection(position);
                this._prevScrollPosition = position;
                _.forEach(this._registeredCompIds, function (compId) {
                    var listener = this._aspectSiteAPI.getComponentById(compId);
                    if (!listener) {
                        delete this._registeredCompIds[compId];
                    } else if (listener.onScroll) {
                        listener.onScroll(position, direction);
                    }
                }, this);
            },
            getScrollDirection: function (position){
                if (position.y !== this._prevScrollPosition.y){
                    if (position.y > this._prevScrollPosition.y){
                        return 'DOWN';
                    }
                    return 'UP';
                }
                if (position.x !== this._prevScrollPosition.x){
                    if (position.x > this._prevScrollPosition.x){
                        return 'RIGHT';
                    }
                    return 'LEFT';
                }
            },
            getScrollPosition: function () {
                return {
                    x: window.pageXOffset || window.document.body.scrollLeft,
                    y: window.pageYOffset || window.document.body.scrollTop
                };
            }
        };

        siteAspectsRegistry.registerSiteAspect('windowScrollEvent', WindowScrollEventAspect);
    });
