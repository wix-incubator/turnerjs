define(['lodash', 'core/core/siteAspectsRegistry', 'utils'], function(_, siteAspectsRegistry, utils) {
    "use strict";

    /* @type {utils.stringUtils} */
    var stringUtils = utils.stringUtils;

    /**
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent|MDN}
     *
     * @type {Array} - supported focus events
     */
    var focusEvents = [
        'focus',
        'blur'
    ];

    /**
     * @constructor
     * @implements {core.SiteAspectInterface}
     * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
     */
    var WindowFocusEventsAspect = function(aspectSiteAPI) {
        /** @type {core.SiteAspectsSiteAPI} */
        this._aspectSiteAPI = aspectSiteAPI;
        this._registerToFocusEvents();
    };

    WindowFocusEventsAspect.prototype = {
        /**
         * creates components registry and registers to all supported focus events
         *
         * @private
         */
        _registerToFocusEvents: function(){
            this._compsRegistry = {};

            _.forEach(focusEvents, function(type){
                this._compsRegistry[type] = {};
                this._aspectSiteAPI.registerToFocusEvents(type, this.propagateFocusEvent.bind(this, type));
            }, this);
        },

        /**
         * registers to the focus event
         *
         * @param {string} type - event type
         * @param {ReactComponent} comp - component to bind to the event
         */
        registerToFocusEvent: function(type, comp){
            this._compsRegistry[type][comp.props.id] = comp.props.id;
        },


        /**
         * unregisters from the focus event
         *
         * @param {string} type - event type
         * @param {ReactComponent} comp - component to unbind from the event
         */
        unregisterFromFocusEvent: function(type, comp){
            delete this._compsRegistry[type][comp.props.id];
        },

        /**
         * calls appropriate method in a listener
         *
         * @param {string} eventType - event type to propagate
         */
        propagateFocusEvent: function(eventType){
            var compsRegistry = this._compsRegistry[eventType],
                methodName = 'on' + stringUtils.capitalize(eventType),
                listener;

            _.forEach(compsRegistry, function(compId){
                listener = this._aspectSiteAPI.getComponentById(compId);

                if (!listener){
                    delete this._compsRegistry[eventType][compId];
                } else if (listener[methodName]){
                    listener[methodName]();
                }
            }, this);
        }
    };

    siteAspectsRegistry.registerSiteAspect('windowFocusEvents', WindowFocusEventsAspect);
});
