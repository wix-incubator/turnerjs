define([], function () {
    'use strict';

    return function setZeroLeft(ps, compToAddPointer, containerPointer, compDefinitionPrototype) {
        compDefinitionPrototype.layout.x = 0;
    };
});
