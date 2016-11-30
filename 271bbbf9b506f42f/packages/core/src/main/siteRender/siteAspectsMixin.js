define(['lodash', 'zepto', 'core/core/siteAspectsRegistry', 'core/siteRender/SiteAspectsSiteAPI', 'utils'],
    function (_, $, siteAspectsRegistry, SiteAspectsSiteAPI, utils) {
        'use strict';

        var EMPTY_ARRAY = [];

        function invokeIfDefined(objects, methodsName, args) {
            return _.map(objects, function (object) {
                var method = object[methodsName];
                if (!_.isFunction(method)) {
                    return EMPTY_ARRAY;
                }
                return method.apply(object, args) || EMPTY_ARRAY;
            });
        }

        var siteEvents = {
            'mount': 'mount',
            'unmount': 'unmount',
            'urlPageChange': 'urlPageChange',
            'renderedRootsChanged': 'renderedRootsChanged',
            'addedRenderedRootsDidLayout': 'addedRenderedRootsDidLayout',
            'modeChange': 'modeChange',
            'slideChange': 'slideChange',
            'didLayout': 'didLayout',
            'siteReady': 'siteReady',
            'willMount': 'willMount',
            'willUpdate': 'willUpdate',
            'svSessionChange': 'svSessionChange'
        };
        var windowEvents = {
            'scroll': 'scroll',
            'resize': 'resize',
            'focus': 'focus',
            'blur': 'blur',
            'message': 'message',
            'keydown': 'keydown',
            'touchstart': 'touchstart',
            'touchend': 'touchend',
            'touchmove': 'touchmove',
            'touchcancel': 'touchcancel',
            'orientationchange': 'orientationchange'
        };
        var documentEvents = {
            'visibilitychange': 'visibilitychange',
            'click': 'click'
        };

        var supportedEvents = _.assign(_.clone(siteEvents), windowEvents, documentEvents);

        function fireOrientationEvent() {
            this.notifyAspects('orientationchange');
            this.timeout = window.setTimeout(this.notifyAspects.bind(this, windowEvents.resize), 300);
        }

        function notifyRootsChangeIfNeeded() {
            var renderedRoots = this.siteAPI.getRootIdsWhichShouldBeRendered();
            if (!_.isEqual(renderedRoots, this._previoslyRenderedRoots)) {
                var removed = _.difference(this._previoslyRenderedRoots, renderedRoots);
                var added = _.difference(renderedRoots, this._previoslyRenderedRoots);
                this._rootsAddedAndNotYetLayouted = _(this._rootsAddedAndNotYetLayouted)
                    .concat(added)
                    .difference(removed)
                    .uniq()
                    .value();
                this._previoslyRenderedRoots = _.clone(renderedRoots);
                this.notifyAspects(siteEvents.renderedRootsChanged, added, removed);
            }
        }

        var PRE_EVENT_FUNCTIONS = {
            'didLayout': function () {
                if (!_.isEmpty(this._rootsAddedAndNotYetLayouted)) {
                    var rootsAddedAndNotYetLayouted = this._rootsAddedAndNotYetLayouted;
                    this._rootsAddedAndNotYetLayouted = [];
                    this.notifyAspects(siteEvents.addedRenderedRootsDidLayout, rootsAddedAndNotYetLayouted);
                }
            }
        };
        /**
         * @class core.siteAspectsMixin
         */
        return {

            /**
             *
             */
            supportedEvents: supportedEvents,

            /**
             *
             * @returns {*}
             */
            getAllSiteAspects: function () {
                this._addMissingAspects();
                return this.siteAspects;
            },

            getInitialState: function () {
                this._aspectsSiteAPI = new SiteAspectsSiteAPI(this);
                this.siteAspects = {};
                this._siteAspectsEventsRegistry = {};
                this._listenersOnWindow = [];
                this._listenersOnDocument = [];
                this._previoslyRenderedRoots = [];
                this._rootsAddedAndNotYetLayouted = [];
            },

            componentWillMount: function () {
                this._addMissingAspects();
                this.notifyAspects(this.supportedEvents.willMount);
            },

            componentWillUpdate: function () {
                this.notifyAspects(this.supportedEvents.willUpdate);
            },

            _addMissingAspects: function () {
                _.forEach(siteAspectsRegistry.getAllAspectConstructors(), function (AspectConstructor, aspectName) {
                    if (!this.siteAspects[aspectName]) {
                        //TODO: pass here only the API not the whole site
                        this.siteAspects[aspectName] = new AspectConstructor(this._aspectsSiteAPI);
                    }
                }, this);
            },

            getAspectsContainer: function () {
                return this.refs.siteAspectsContainer;
            },

            getAspectsReactComponents: function () {
                return _.flattenDeep(invokeIfDefined(this.siteAspects, 'getReactComponents', [this.loadedStyles]));
            },

            getAspectsComponentStructures: function () {
                return _.flattenDeep(invokeIfDefined(this.siteAspects, 'getComponentStructures'));
            },

            componentDidMount: function () {
                var $window = $(window);
                var $document = $(window.document);

                var eventListenerProxy;
                _.forEach(windowEvents, function (eventName) {
                    eventListenerProxy = {eventName: eventName, listener: this.notifyAspects.bind(this, eventName)};
                    this._listenersOnWindow.push(eventListenerProxy);
                    $window.on(eventName, eventListenerProxy.listener);
                }, this);

                _.forEach(documentEvents, function (eventName) {
                    eventListenerProxy = {eventName: eventName, listener: this.notifyAspects.bind(this, eventName)};
                    this._listenersOnDocument.push(eventListenerProxy);
                    $document.on(eventName, eventListenerProxy.listener);
                }, this);

                // Wire orientationchange event to simulate resize event
                eventListenerProxy = {
                    eventName: windowEvents.orientationchange,
                    listener: fireOrientationEvent.bind(this)
                };
                this._listenersOnWindow.push(eventListenerProxy);
                $window.on(eventListenerProxy.eventName, eventListenerProxy.listener);

                this.notifyAspects('mount');
                notifyRootsChangeIfNeeded.call(this);
            },

            componentDidUpdate: function () {
                if (this.isChangingUrlPage) {
                    this.notifyAspects('urlPageChange');
                }

                notifyRootsChangeIfNeeded.call(this);
            },

            componentWillUnmount: function () {
                var $window = $(window);
                var $document = $(window.document);

                _.forEach(this._listenersOnWindow, function (listenerObject) {
                    $window.off(listenerObject.eventName, listenerObject.listener);
                });

                _.forEach(this._listenersOnDocument, function (listenerObject) {
                    $document.off(listenerObject.eventName, listenerObject.listener);
                });
                window.clearTimeout(this.timeout);

                this._aspectsSiteAPI.onSiteUnmount();
                this.notifyAspects('unmount');

            },

            notifyAspects: function (eventName) {
                if (_.has(PRE_EVENT_FUNCTIONS, eventName)) {
                    PRE_EVENT_FUNCTIONS[eventName].apply(this, _.rest(arguments));
                }
                var registeredCallbacks = this._siteAspectsEventsRegistry[eventName];
                if (registeredCallbacks && registeredCallbacks.length) {
                    var callbacks = registeredCallbacks.slice();
                    _.invoke(callbacks, 'apply', undefined, _.rest(arguments));
                }
            },

            /**
             *
             * @param eventName
             * @param callback
             */
            registerAspectToEvent: function (eventName, callback) {
                if (eventName === siteEvents.siteReady && this.siteIsReady) {
                    callback();
                    return;
                }
                if (!supportedEvents[eventName]) {
                    utils.log.error("this event isn't supported by site " + eventName);
                    return;
                }
                this._siteAspectsEventsRegistry[eventName] = this._siteAspectsEventsRegistry[eventName] || [];
                this._siteAspectsEventsRegistry[eventName].push(callback);
            },

            unregisterAspectFromEvent: function (eventName, callback) {
                var callbacks = this._siteAspectsEventsRegistry[eventName];
                if (callbacks) {
                    var index = callbacks.indexOf(callback);
                    if (index !== -1) {
                        callbacks.splice(index, 1);
                    }
                }
            }
        };

    });
