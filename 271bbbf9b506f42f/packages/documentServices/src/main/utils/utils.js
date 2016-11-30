define([], function () {
    'use strict';

    var masterPage = 'wysiwyg.viewer.components.WSiteStructure';

    var SPECIAL_COMP_TYPES = {
        'masterPage': masterPage
    };

    function pointerToString(componentPointer) {
        if (!componentPointer) {
            return '(null)';
        }
        var s = 'type: ' + componentPointer.type + ' id: ' + componentPointer.id;
        if ('innerPath' in componentPointer) {
            s += ' inner: ' + componentPointer.innerPath;
        }
        return s;
    }

    var prevPointer;
    var prevType;
    function getComponentType(ps, componentPointer){
        if (componentPointer) {
            var specialCompType = SPECIAL_COMP_TYPES[componentPointer.id];
            if (specialCompType) {
                return specialCompType;
            }

            if (componentPointer === prevPointer) {
                return prevType;
            }

            var typePointer = ps.pointers.getInnerPointer(componentPointer, 'componentType');
            var result = ps.dal.get(typePointer);
            if (result || ps.dal.isExist(componentPointer)) {
                prevPointer = componentPointer;
                prevType = result;
                return result;
            }
        }
        throw new Error('non existing component pointer: ' + pointerToString(componentPointer));
    }

    return {
        YES: 'yes',
        NO: 'no',
        DONT_CARE: "don't care",

        getComponentType: getComponentType
    };
});
