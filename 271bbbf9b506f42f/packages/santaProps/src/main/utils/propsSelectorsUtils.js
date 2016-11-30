define(['lodash'], function (_) {
    'use strict';

    function idSelector(state, props) {
        return _.get(props, 'structure.id');
    }

    function applyFetch(propType, fetchFunc) {
        var newPropType = propType.bind(null);
        newPropType.isRequired = propType.isRequired.bind(null);
        newPropType.fetch = fetchFunc;
        newPropType.isRequired.fetch = fetchFunc;
        return newPropType;
    }

    return {
        idSelector: idSelector,
        applyFetch: applyFetch
    };
});
