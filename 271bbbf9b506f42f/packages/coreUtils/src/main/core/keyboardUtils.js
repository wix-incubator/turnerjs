define(function () {
    'use strict';

    var translatedKeys = {
        ALT: 18,
        ARROWDOWN: 40,
        ARROWLEFT: 37,
        ARROWRIGHT: 39,
        ARROWUP: 38,
        BACKSPACE: 8,
        CAPSLOCK: 20,
        CLEAR: 12,
        CONTROL: 17,
        DELETE: 46,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        F1: 112,
        F2: 113,
        F3: 114,
        F4: 115,
        F5: 116,
        F6: 117,
        F7: 118,
        F8: 119,
        F9: 120,
        F10: 121,
        F11: 122,
        F12: 123,
        HOME: 36,
        INSERT: 45,
        META: 224,
        NUMLOCK: 144,
        PAGEDOWN: 34,
        PAGEUP: 33,
        PAUSE: 19,
        SCROLLLOCK: 145,
        SHIFT: 16,
        SPACEBAR: 32,
        TAB: 9
    };

    /**
     * @param keyEvent native browser event
     * @return Normalized key code
     */
    function getKey(keyEvent) {
        return keyEvent.which || keyEvent.keyCode;
    }

    /**
     * @class utils.keyboardUtils
     */
    return {
        keys: translatedKeys,
        getKey: getKey
    };
});