define(['lodash'], function (_) {
    'use strict';
    var GUID_FORMAT = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    var _state = {lastGeneratedId: undefined, counter: 0};

    function randomizeChar(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }

    function getRandomLowercaseLetter() {
        return String.fromCharCode(97 + Math.floor(Math.random() * 26));
    }

    function _getUniqueId(state, prefix, prefixDelimiter, dateNow) {
        prefix = prefix || "";
        prefixDelimiter = prefixDelimiter || "";
        var value = dateNow;
        if (value === state.lastGeneratedId) {
            state.counter++;
        } else {
            state.lastGeneratedId = value;
            state.counter = 0;
        }
        return prefix + prefixDelimiter + Number(state.lastGeneratedId).toString(36) + (state.counter || "");
    }

    function getUniqueId(prefix, prefixDelimiter) {
        return _getUniqueId(_state, prefix, prefixDelimiter, Date.now());
    }

    /**
     * This is the same getGUID algorithm as in old client - we need this for BI, to keep a GUID in the normal GUID format
     * originally from http://stackoverflow.com/a/2117523
     */
    function getGUID() {
        return GUID_FORMAT.replace(/[xy]/g, randomizeChar);
    }

    /**
     * Generate a page id
     *
     * @param {Array.string} existingPageIds array of existing page ids
     * @returns {*}
     */
    function generateNewPageId(existingPageIds) {
        var generatedId = getRandomLowercaseLetter() + (new Array(4).join().replace(/(.|$)/g, function () {
                return ((Math.random() * 36) | 0).toString(36);
            }));
        if (_.includes(existingPageIds, generatedId)) {
            return this.generateNewPageId(existingPageIds);
        }
        return generatedId;
    }


    /**
     * Generate a popup id
     *
     * @param {Array.string} existingPageIds array of existing page ids
     * @param {Array.string} popupIds array of existing popup ids
     * @returns {*}
     */
    function generateNewPopupId(existingPageIds, popupIds) {
        var lastId = _(popupIds).sortBy().last(),
            newPopupId;

        if (lastId) {
            newPopupId = lastId;
            do {
                newPopupId = increaseId(newPopupId);
            } while (_.includes(existingPageIds, newPopupId));
            return newPopupId;
        }
        return this.generateNewPageId(existingPageIds);

        function increaseId(id, charPos) {
            charPos = _.isUndefined(charPos) ? id.length - 1 : charPos;
            var charCode = id.charCodeAt(charPos);

            if (charCode > 121) {
                id = increaseId(id, charPos - 1);
                charCode = 47;
            } else if (charCode > 56 && charCode < 96) {
                charCode = 96;
            }

            return id.substr(0, charPos) + String.fromCharCode(charCode + 1) + id.substr(charPos + 1);
        }
    }

    return {
        getUniqueId: getUniqueId,
        _getUniqueId: _getUniqueId,
        getGUID: getGUID,
        generateNewPageId: generateNewPageId,
        generateNewPopupId: generateNewPopupId
    };
});
