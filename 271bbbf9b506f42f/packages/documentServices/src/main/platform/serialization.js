define(['lodash'], function(_){
    'use strict';

    function omitEmptyCustomData(clonedSerializedComp) {
        var customWithoutConnections = _.omit(_.get(clonedSerializedComp, 'custom'), 'relatedConnections');
        if (_.isEmpty(customWithoutConnections)) {
            return _.omit(clonedSerializedComp, 'custom');
        }
        return _.assign({}, clonedSerializedComp, {custom: customWithoutConnections});
    }
    function setConnectedComponents(ps, serializedComponent, connectedComponents) {
        var clonedSerializedComp = _.cloneDeep(serializedComponent);
        if (_.isEmpty(connectedComponents)) {
            return omitEmptyCustomData(clonedSerializedComp);
        }
        _.set(clonedSerializedComp, 'custom.relatedConnections', connectedComponents);
        return clonedSerializedComp;
    }

    function getConnectedComponent(ps, serializedComponent) {
        return _.get(serializedComponent, 'custom.relatedConnections');
    }

    return {
        setConnectedComponents: setConnectedComponents,
        getConnectedComponents: getConnectedComponent
    };
});
