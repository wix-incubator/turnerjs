define([], function () {
    'use strict';

    function getDefaultPlacement(compData) {
        return compData.gluedOptions.placement;
    }

    return {
        getDefaultPlacement: getDefaultPlacement
    };
});
