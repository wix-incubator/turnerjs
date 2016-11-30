define([
    'lodash',
    'documentServices/platform/core/messageFormatter'
], function (
    _,
    messageFormatter
) {
    'use strict';

    // Registrations
    var registrationsPrivateScopes = {};

    function getRegistrations(ps) {
        return registrationsPrivateScopes[ps.siteAPI.getSiteId()] || [];
    }

    function addRegistration(ps, appId, callback) {
        var siteId = ps.siteAPI.getSiteId();
        var registration = {
            appId: appId,
            callback: callback
        };

        registrationsPrivateScopes[siteId] = _.compact([registration].concat(registrationsPrivateScopes[siteId]));
        return registration;
    }

    function register(ps, appId, callback) {
        var registration = addRegistration(ps, appId, callback);
        return function unregister() {
            _.pull(getRegistrations(ps), registration);
        };
    }

    function emit(ps, payload) {
        getRegistrations(ps).forEach(function (registration) {
            registration.callback(messageFormatter.viewerInfoChangedEvent(payload));
        });
    }


    return {
        /**
         * Register the given callback to viewerInfoChanged events
         * @param {object} ps - privateServices
         * @param {string} appId - id of the registering app
         * @param {function} callback - will be called with viewerInfoChanged event object
         * @returns {function} unregister -
         *      invoking will unregister the given callback from viewerinfoChanged events
         *      UNREGISTER TO AVOID MEMORY LEAKS!
         */
        register: register,
        /**
         * Emit viewerInfoChanged event to all registered callbacks with given payload
         * @param {object} ps - privateServices
         * @param {object} payload
         */
        emit: emit
    };
});
