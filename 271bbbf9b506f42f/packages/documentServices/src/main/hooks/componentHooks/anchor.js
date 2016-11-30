define([], function () {
    'use strict';

    return function (ps, compToAddPointer, containerPointer, compDefinitionPrototype) {
        compDefinitionPrototype.data.compId = compToAddPointer.id;
    };
});