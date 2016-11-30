define([], function () {
    'use strict';

    var _state = null;

    function getState() {
        return _state;
    }

    function setState(state) {
        _state = state;
    }

    return {
        getState: getState,
        setState: setState
    };
});
