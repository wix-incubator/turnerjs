define(['documentServices/component/component'], function (component) {
    'use strict';

    return function (ps, compPointer) {
        var compProps = component.properties.get(ps, compPointer) || {};
        compProps.metaData = compProps.metaData || {};
        compProps.metaData.schemaVersion = "2.0";
        component.properties.update(ps, compPointer, compProps);
    };
});
