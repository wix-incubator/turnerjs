define(['documentServices/component/componentStructureInfo'], function(componentStructureInfo){
    'use strict';

    var GROUP_COMPONENT_TYPE = "wysiwyg.viewer.components.Group";

    function getGroupComponentType() {
        return GROUP_COMPONENT_TYPE;
    }

    function isGroup(ps, compPointer) {
        return componentStructureInfo.getType(ps, compPointer) === GROUP_COMPONENT_TYPE;
    }

    function isGroupedComponent(ps, compPointer) {
        var parentPointer = componentStructureInfo.getContainer(ps, compPointer);
        return isGroup(ps, parentPointer);
    }

    return {
        isGroup: isGroup,
        isGroupedComponent: isGroupedComponent,
        getGroupComponentType: getGroupComponentType
    };
});