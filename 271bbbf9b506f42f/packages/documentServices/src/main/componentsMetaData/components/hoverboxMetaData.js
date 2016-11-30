define(['lodash', 'utils', 'documentServices/constants/constants', 'documentServices/componentsMetaData/metaDataUtils'], function (_, utils, constants, metaDataUtils) {
    'use strict';


    function isCompTypeAllowedInHoverbox(compType) {
        return compType !== 'mobile.core.components.Container' && metaDataUtils.isComponentSuitableForNonRenderingState(compType);
    }

    /**
     *
     * @param {ps} ps
     * @param {Pointer} potentialChild
     */
    function allChildrenAllowedInHoverbox(ps, potentialChild) {
        var recusiveChildrenPointers = ps.pointers.components.getChildrenRecursively(potentialChild);
        return _.every(recusiveChildrenPointers.concat(potentialChild), function (componentPointer) {
            var compType = metaDataUtils.getComponentType(ps, componentPointer);
            return isCompTypeAllowedInHoverbox(compType);
        });
    }

    function getChildrenTypesDeep(descendants) {
        var descendant, childrenTypes = [];
        while (descendants.length) {
            descendant = descendants.shift();
            childrenTypes.push(descendant.componentType);
            descendants = descendant.components ? descendants.concat(descendant.components) : descendants;
        }
        return childrenTypes;
    }

    /**
     *
     * @param {ps} ps
     * @param potentialChildStructure
     */
    function allChildrenStructureAllowedInHoverbox(potentialChildStructure) {
        var descendants = utils.objectUtils.cloneDeep(potentialChildStructure.components);
        var childCompType = potentialChildStructure.componentType;
        if (!descendants) {
            return isCompTypeAllowedInHoverbox(childCompType);
        }

        var childrenTypes = [childCompType].concat(getChildrenTypesDeep(descendants));
        return _.every(childrenTypes, isCompTypeAllowedInHoverbox);
    }

    return {
        /**
         * @param isByStructure
         * @param {ps} ps
         * @param {Pointer} compPointer
         * @param potentialChildStructure
         * @returns {*}
         */
        canContainByStructure: function (ps, compPointer, potentialChildStructure) {
            return allChildrenStructureAllowedInHoverbox(potentialChildStructure);
        },

        canContain: function (ps, componentPointer, potentialChild) {
            return allChildrenAllowedInHoverbox(ps, potentialChild);
        },

        mobileConversionConfig: {
            filterChildrenWhenHidden: true
        }
    };
});
