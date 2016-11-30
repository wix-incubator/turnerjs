define(['lodash', 'core/core/siteAspectsRegistry'],
    function(_, siteAspectsRegistry) {
        "use strict";

        /**
         *
         * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
         * @implements {core.SiteAspectInterface}
         * @constructor
         */
        function WindowResizeEventAspect(aspectSiteAPI) {
            /** @type {core.SiteAspectsSiteAPI} */
            this._aspectSiteAPI = aspectSiteAPI;
            this._registeredCompIds = {};
            this._registeredCompIdsOrientation = {};
            this._aspectSiteAPI.registerToResize(this.propagateResizeEvent.bind(this));
            this._aspectSiteAPI.registerToOrientationChange(this.propagateOrientationEvent.bind(this));
        }

        WindowResizeEventAspect.prototype = {
            registerToResize: function(comp){
                this._registeredCompIds[comp.props.id] = comp.props.id;
            },

            unregisterToResize: function(comp){
                delete this._registeredCompIds[comp.props.id];
            },
            registerToOrientationChange: function(comp){
                this._registeredCompIdsOrientation[comp.props.id] = comp.props.id;
            },

            unregisterToOrientationChange: function(comp){
                delete this._registeredCompIdsOrientation[comp.props.id];
            },

            propagateResizeEvent: function () {
                _.forEach(this._registeredCompIds, function(compId){
                     var listener = this._aspectSiteAPI.getComponentById(compId);
                    if (!listener){
                        delete this._registeredCompIds[compId];
                    } else if (listener.onResize) {
                        listener.onResize();
                    }
                }, this);
            },

            propagateOrientationEvent: function () {
                _.forEach(this._registeredCompIdsOrientation, function(compId){
                     var listener = this._aspectSiteAPI.getComponentById(compId);
                    if (!listener){
                        delete this._registeredCompIdsOrientation[compId];
                    } else if (listener.onOrientationChange) {
                        listener.onOrientationChange();
                    }
                }, this);
            }
        };

        siteAspectsRegistry.registerSiteAspect('windowResizeEvent', WindowResizeEventAspect);
    });
