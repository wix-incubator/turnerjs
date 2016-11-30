define(['utils'], function(utils){
    "use strict";

    function getChildrenPropertyName(comp, viewMode){
        if (viewMode === utils.constants.VIEW_MODES.MOBILE){
            return comp.mobileComponents ? 'mobileComponents' : 'components';
        }
        return comp.children ? 'children' : 'components';
    }

    function isComponentWithId(id, json){
        return json.id === id || (id === 'masterPage' && json.children);
    }

    function getCompPath(json, compId, viewMode, path){
        if (isComponentWithId(compId, json)){
            return path;
        }
        var childrenPropName = getChildrenPropertyName(json, viewMode);

        var children = json[childrenPropName];
        if (!children){
            return null;
        }

        var foundPath = null;

        for (var i = 0; i < children.length && !foundPath; i++){
            var child = children[i];
            foundPath = getCompPath(child, compId, viewMode, path.concat([childrenPropName, i]));
        }
        return foundPath;
    }

    return {
        getChildrenPropertyName: getChildrenPropertyName,

        getComponentPath: function(json, compId, viewMode){
            return getCompPath(json, compId, viewMode, []);
        },

        getDataPath: function(/*json*/){

        },

        isComponentWithId: isComponentWithId
    };
});