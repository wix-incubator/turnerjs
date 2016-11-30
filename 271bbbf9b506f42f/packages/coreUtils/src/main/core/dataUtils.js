define(['lodash'], function (_) {
    'use strict';

    function getChildrenData(structure, isMobile) {
        var children = isMobile ? structure.mobileComponents : structure.children;
        return children || structure.components || [];
    }

    function getChildrenKey(data, isMobile) {
        if (isMobile && data.mobileComponents){
            return 'mobileComponents';
        }

        return data.children ? 'children' : 'components';
    }

    function isMobileStructureExist(masterPageData) {
        return masterPageData.structure.mobileComponents && !_.isEmpty(masterPageData.structure.mobileComponents);
    }

    function findHierarchyInStructure(id, isMobile, structure) {
        if (structure.id === id) {
            return [structure];
        }
        var structureChildren = getChildrenData(structure, isMobile);
        if (_.isEmpty(structureChildren)) {
            return [];
        }

        var ret = [];
        _.forEach(structureChildren, function (child) {
            var childHierarchy = findHierarchyInStructure(id, isMobile, child);
            if (!_.isEmpty(childHierarchy)) {
                ret = [structure].concat(childHierarchy);
                return false;
            }
        });

        return ret;
    }

    function getAllCompsInStructure(compStructure, isMobile, filterFunc, breakCondition) {
	    var queue = [[compStructure]];
        for (var index = 0; index < queue.length; index++) {
	        var innerQueue = queue[index];
	        for (var childIndex = 0; childIndex < innerQueue.length; childIndex++) {
		        if (breakCondition && filterFunc(innerQueue[childIndex])) {
                    return innerQueue[childIndex];
                }
                var childrenData = getChildrenData(innerQueue[childIndex], isMobile);
		        if (childrenData.length) {
			        queue.push(childrenData);
		        }
	        }
        }

	    return breakCondition ? null : _(queue)
		    .flatten()
		    .remove(filterFunc)
		    .indexBy('id')
		    .value();
    }

    function findCompInStructure(compStructure, isMobile, predicate) {
        return getAllCompsInStructure(compStructure, isMobile, predicate, true);
    }

    return {
        getChildrenData: getChildrenData,
        getChildrenKey: getChildrenKey,
        isMobileStructureExist: isMobileStructureExist,
        findHierarchyInStructure: findHierarchyInStructure,
        findCompInStructure: findCompInStructure,
        getAllCompsInStructure: getAllCompsInStructure
    };

});
