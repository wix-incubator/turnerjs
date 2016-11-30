define(['lodash', 'utils'], function (_, utils) {
    "use strict";

    var logicMap = {};

    /**
     * registers a logic constructor to the logic factory under the given partId.
     * @param {string} partId
     * @param {object} logic
     */
    function register(partId, logic) {
        logicMap[partId] = logic;
    }

    /**
     * retrieves the logic constructor registered with the given partId.
     * @param {string} partId
     * @returns {Function} The logic constructor or null if there is no logic for the partId
     */
    function logicClass(partId) {
        return logicMap[partId];
    }

    function extend(partId, logicExtension) {
        if (!logicMap.hasOwnProperty(partId)) {
            utils.log.error("Trying to extend logic for partId: [" + partId + "] but the partId is not defined");
            return;
        }

        _.assign(logicMap[partId].prototype, logicExtension);
    }

    return {
        register: register,
        getLogicClass: logicClass,
        extend: extend
    };
});
