define(['lodash', 'core/core/siteAspectsRegistry'],
    function (_, siteAspectsRegistry) {
        "use strict";

        /**
         * @constructor
         * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
         */
        function SvSessionChangeEventAspec(aspectSiteAPI) {
            this._aspectSiteAPI = aspectSiteAPI;
            this._registeredComps = {};

            aspectSiteAPI.registerToSvSessionChange(this.notifySessionChanged.bind(this));
        }

        SvSessionChangeEventAspec.prototype = {
            registerToSessionChanged: function (comp) {
                this._registeredComps[comp.props.id] = comp;
            },

            unRegisterToSessionChanged: function (comp) {
                delete this._registeredComps[comp.props.id];
            },

            notifySessionChanged: function (svSession) {
                _.forEach(this._registeredComps, function (comp) {
                    comp.sendPostMessage({
                        intent: 'addEventListener',
                        eventType: 'SESSION_CHANGED',
                        params: {
                            userSession: svSession
                        }
                    });
                }, this);
            }
        };

        siteAspectsRegistry.registerSiteAspect('svSessionChangeEvent', SvSessionChangeEventAspec);
    });
