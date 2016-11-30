define(['lodash', 'core/core/siteAspectsRegistry'], function (_, siteAspectsRegistry) {
    "use strict";

    /**
     * @constructor
     * @implements {core.SiteAspectInterface}
     * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
     */
    var windowClickEventAspect = function (aspectSiteAPI) {
        /** @type {core.SiteAspectsSiteAPI} */
        this._aspectSiteAPI = aspectSiteAPI;
        this._aspectSiteAPI.registerToDocumentClick(this.propagateDocumentClickEvent.bind(this));
        this._registeredCompIds = [];
    };

    windowClickEventAspect.prototype = {

        /**
         * registers to the document click event
         * @param {ReactComponent} compId - component to bind to the event
         */
        registerToDocumentClickEvent: function (compId) {
            this._registeredCompIds = _.union(this._registeredCompIds, [compId]);
        },

        /**
         * unregisters from the document click event
         *
         * @param {ReactComponent} compId - component to unbind from the event
         */
        unRegisterToDocumentClickEvent: function (compId) {
            _.pull(this._registeredCompIds, compId);
        },

        /**
         * propogate the event if click outside the component occured
         *
         * @param {object} event - event type to propagate
         */
        propagateDocumentClickEvent: function (event) {
            var methodNameOnComp = 'onDocumentClick';

            _.forEach(this._registeredCompIds, function (compId) {
                var component = this._aspectSiteAPI.getComponentById(compId);
                if (component && component[methodNameOnComp]) {
                    component[methodNameOnComp](event);
                }
            }, this);
        }
    };

    siteAspectsRegistry.registerSiteAspect('windowClickEventAspect', windowClickEventAspect);
});
