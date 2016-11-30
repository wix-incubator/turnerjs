define(['lodash', 'core/core/siteAspectsRegistry'],
    function(_, siteAspectsRegistry) {
        'use strict';

        var translatedKeys = {
            39: 'ArrowRight',
            37: 'ArrowLeft',
            27: 'Escape'
        };

        /**
         *
         * @param {core.SiteAspectsSiteAPI} aspectSiteAPI
         * @implements {core.SiteAspectInterface}
         * @constructor
         */
        function WindowKeyboardEventAspect(aspectSiteAPI) {
            /** @type {core.SiteAspectsSiteAPI} */
            this._aspectSiteAPI = aspectSiteAPI;
            this._aspectSiteAPI.registerToKeyDown(this.propagateKeyboardEvent.bind(this));
            this._registeredCompIds = {
                Escape: [],
                ArrowRight: [],
                ArrowLeft: []
            };
        }

        WindowKeyboardEventAspect.prototype = {

            registerToEscapeKey: function(comp) {
                this._registeredCompIds.Escape.push(comp.props.id);
            },

            registerToArrowRightKey: function(comp) {
                this._registeredCompIds.ArrowRight.push(comp.props.id);
            },

            registerToArrowLeftKey: function(comp) {
                this._registeredCompIds.ArrowLeft.push(comp.props.id);
            },

            unRegisterKeys: function(comp) {
                _.forEach(this._registeredCompIds, function(value, key) {
                    this._registeredCompIds[key] = _.without(this._registeredCompIds[key], comp.props.id);
                }, this);
            },

            propagateKeyboardEvent: function (event) {
                var key = translatedKeys[event.keyCode || event.which];
                if (_.isEmpty(this._registeredCompIds[key])) {
                    return;
                }

                var compId = _.last(this._registeredCompIds[key]);
                var listener = this._aspectSiteAPI.getComponentById(compId);
                var listenerFn = 'on' + key + 'Key';
                if (!listener) {
                    this._registeredCompIds[key] = _.without(this._registeredCompIds[key], compId);
                } else if (listener[listenerFn]) {
                    event.preventDefault();
                    listener[listenerFn]();
                }
            }
        };

        siteAspectsRegistry.registerSiteAspect('windowKeyboardEvent', WindowKeyboardEventAspect);
    });
