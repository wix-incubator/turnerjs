define(['lodash', 'core', 'documentServices/component/component', 'documentServices/componentsMetaData/componentsMetaData',
    'documentServices/structure/structure'], function (_, core, component, componentsMetaData, structure) {
    'use strict';

    var boxSlideShowCommon = core.componentUtils.boxSlideShowCommon;

    function isBoxSlideShowSlide(ps, parentType, child){
        return componentsMetaData.getComponentType(ps, child) === boxSlideShowCommon.getMatchingChildSlideType(parentType);
    }

    function getMasterChildren(ps, componentPointer, type) {
        return _.reject(component.getChildren(ps, componentPointer), isBoxSlideShowSlide.bind(this, ps, type));
    }

    function getNonMasterChildren(ps, componentPointer, type) {
        return _.filter(component.getChildren(ps, componentPointer), isBoxSlideShowSlide.bind(this, ps, type));
    }

    function getCurrentRenderedChildren(ps, componentPointer){
        var parentType = componentsMetaData.getComponentType(ps, componentPointer);
        var currentSlide = _.find(getNonMasterChildren(ps, componentPointer, parentType), function(child){
            return component.isRenderedOnSite(ps, child);
        });
        var shownOnAllSlidesChildren = getMasterChildren(ps, componentPointer, parentType);
        return currentSlide ? [currentSlide].concat(shownOnAllSlidesChildren) : shownOnAllSlidesChildren;
    }

    function findParentWithType(ps, componentPointer, type){
        if (ps.pointers.components.isPage(componentPointer)){
            return null;
        }
        var currParent = component.getContainer(ps, componentPointer);

        while (currParent && !ps.pointers.components.isPage(currParent)){
            if (componentsMetaData.getComponentType(ps, currParent) === type){
                return currParent;
            }
            currParent = component.getContainer(ps, currParent);
        }
        return null;
    }

    function isMasterChild(ps, componentPointer, parentType){
        var childType = boxSlideShowCommon.getMatchingChildSlideType(parentType);
        return canBeMasterChild(ps, componentPointer, parentType) && !findParentWithType(ps, componentPointer, childType);
    }


    function canBeMasterChild(ps, componentPointer, parentType){
        var compType = componentsMetaData.getComponentType(ps, componentPointer);
        var childType = boxSlideShowCommon.getMatchingChildSlideType(parentType);
        return componentPointer.type !== 'MOBILE' && compType !== childType && !!findParentWithType(ps, componentPointer, parentType);
    }


    function toggleMasterChild(ps, componentPointer, parentType){
        var boxSlideShowParent = findParentWithType(ps, componentPointer, parentType);
        var childType = boxSlideShowCommon.getMatchingChildSlideType(parentType);

        if (!!boxSlideShowParent && componentsMetaData.getComponentType(ps, componentPointer) !== childType){
            var boxSlideShowSlideParent = findParentWithType(ps, componentPointer, childType);
            var newParent;

            if (boxSlideShowSlideParent){
                newParent = boxSlideShowParent;
            } else {
                newParent = _.find(getCurrentRenderedChildren(ps, boxSlideShowParent), function(child){
                    return componentsMetaData.getComponentType(ps, child) === childType;
                });
            }

            structure.setContainer(ps, undefined, componentPointer, newParent);
        }
    }

    function getParentCompWithOverflowHidden(ps, componentPointer, parentType){
        var boxSlideShowParent = findParentWithType(ps, componentPointer, parentType);
        var slideshowProps = component.properties.get(ps, boxSlideShowParent);
        return slideshowProps.shouldHideOverflowContent ? boxSlideShowParent : null;
    }

    return {
        getMasterChildren: getMasterChildren,
        getNonMasterChildren: getNonMasterChildren,
        getCurrentRenderedChildren: getCurrentRenderedChildren,
        isMasterChild: isMasterChild,
        canBeMasterChild: canBeMasterChild,
        toggleMasterChild: toggleMasterChild,
        getParentCompWithOverflowHidden: getParentCompWithOverflowHidden
    };
});
