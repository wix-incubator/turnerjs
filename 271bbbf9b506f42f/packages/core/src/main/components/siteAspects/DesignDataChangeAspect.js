define([
    'lodash',
    'core/components/designDataChangeHandlers/designDataChangeBgBehaviorsHandler'
],
    function(_, designDataChangeBgBehaviorsHandler) {
        "use strict";

        /**
         *
         * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
         * @implements {core.SiteAspectInterface}
         * @constructor
         */
        function DesignDataChangeAspect(aspectSiteAPI) {
            /** @type {core.SiteAspectsSiteAPI} */
            this._aspectSiteAPI = aspectSiteAPI;
            this._registeredHandlers = {};

            //todo: where do we put this?
            this.registerHandler('designDataChangeBgBehaviorsHandler', designDataChangeBgBehaviorsHandler.handle);
        }

        DesignDataChangeAspect.prototype = {
            registerHandler: function (name, callback) {
                this._registeredHandlers[name] = callback;
            },

            unregisterHandler: function (name) {
               this._registeredHandlers = _.omit(this._registeredHandlers, name);
            },

            notify: function (compId, previousData, currentData){
                this.propagate(compId, previousData, currentData);
            },

            propagate: function (compId, previousData, currentData) {
                _.forEach(this._registeredHandlers, function (callback) {
                    callback(this._aspectSiteAPI.getSiteAPI(), compId, previousData, currentData);
                }, this);
            }
        };

        return DesignDataChangeAspect;
    });
