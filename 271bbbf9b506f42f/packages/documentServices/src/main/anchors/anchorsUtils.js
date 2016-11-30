define(['lodash', 'documentServices/structure/structureUtils', 'documentServices/componentsMetaData/componentsMetaData'], function (_, structureUtils, componentsMetaData) {
    'use strict';

    function isLowerCompBottomBelowUpperComp(upperCompLayout, lowerCompLayout) {
        var lowerCompY = structureUtils.getBoundingY(lowerCompLayout);
        var lowerCompBottom = lowerCompY + structureUtils.getBoundingHeight(lowerCompLayout);

        var upperCompY = structureUtils.getBoundingY(upperCompLayout);
        var upperCompHeight = structureUtils.getBoundingHeight(upperCompLayout);
        var upperCompBottom = upperCompY + upperCompHeight;

        var upperCompCenter = upperCompY + upperCompHeight / 2;

        return (lowerCompBottom > upperCompBottom) && (lowerCompY > upperCompCenter);
    }

    function isComponentBelow(topCompLayout, bottomCompLayout) {
        return structureUtils.getBoundingY(topCompLayout) <= structureUtils.getBoundingY(bottomCompLayout);
    }

    function hasXOverlap(comp1Layout, comp2Layout) {
        var x1 = structureUtils.getBoundingX(comp1Layout);
        var w1 = structureUtils.getBoundingWidth(comp1Layout);
        var x2 = structureUtils.getBoundingX(comp2Layout);
        var w2 = structureUtils.getBoundingWidth(comp2Layout);
        return (x1 >= x2 && x1 <= x2 + w2) || (x2 >= x1 && x2 <= x1 + w1);
    }

    function hasAnchorOfType(componentLayout, type) {
        return _.some(componentLayout.anchors, {type: type});
    }

    function isSiteStructure(component) {
        return !!component.children;
    }

    function getComponentById(id, componentPointersArr) {
        return _.find(componentPointersArr, {id: id});
    }

    function getLowestComp(compsLayout) {
        var lowestLayout;

        return _.reduce(compsLayout, function (lowestCompIndex, compLayout, compIndex) {
            if (lowestCompIndex < 0 || structureUtils.getBoundingY(compLayout) > structureUtils.getBoundingY(lowestLayout)) {
                lowestLayout = compLayout;
                return compIndex;
            }
            return lowestCompIndex;
        }, -1);
    }

    function isDirectlyBelow(topCompLayout, bottomCompLayout, siblingsLayout) {
        var upperEdge = structureUtils.getBoundingY(topCompLayout) + structureUtils.getBoundingHeight(topCompLayout);
        var lowerEdge = structureUtils.getBoundingY(bottomCompLayout);
        var i, sib;

        for (i = 0; i < siblingsLayout.length; i++) {
            sib = siblingsLayout[i];
            if (!hasXOverlap(bottomCompLayout, sib)) {
                continue;
            }

            if (structureUtils.getBoundingY(sib) > upperEdge && structureUtils.getBoundingY(sib) + structureUtils.getBoundingHeight(sib) < lowerEdge) {
                return false;
            }
        }

        return true;
    }

    function isCompBUnderCompAWithNothingBetween(compALayout, compBLayout, allSiblingsLayout) {
        return compALayout !== compBLayout &&
            isComponentBelow(compALayout, compBLayout) &&
            hasXOverlap(compALayout, compBLayout) &&
            isDirectlyBelow(compALayout, compBLayout, allSiblingsLayout);
    }

    function mergeSets(indirectlyAnchored, allSiblingsLayout, topCompIndex, bottomCompIndex) {
        var target = indirectlyAnchored[topCompIndex];
        var setToAdd = indirectlyAnchored[bottomCompIndex];
        var y = allSiblingsLayout[bottomCompIndex].y;
        _.forEach(setToAdd, function (val, key) {
            target[key] = allSiblingsLayout[key].y !== y;
        });
    }

    function assignedChangedComps(original, newChanged) {
        _.assign(original, newChanged, function (originalVal, newVal) {
            return newVal || originalVal;
        });
        return original;
    }

    function breakNegativeCircleIfThereIsOne(anchor, closeCircleCompId, closeCircleCompLayout, pointersMap, layoutMap) {
        //circles might be created by negative bottom_top anchors
        var changedComps = {};
        if (anchor.type !== "BOTTOM_TOP" || anchor.distance >= 0) {
            return changedComps;
        }
        //the bottom of the target comp should be outside of the from comp so not interesting
        var targetCompIndex = _.findIndex(pointersMap, {id: anchor.targetComponent});
        var topTopAnchors = _.filter(layoutMap[targetCompIndex].anchors, {type: 'TOP_TOP'});
        var closeCircleCompBottom = structureUtils.getBoundingY(closeCircleCompLayout) + structureUtils.getBoundingHeight(closeCircleCompLayout);
        _.forEach(topTopAnchors, function (anch) {
            var anchorTargetCompIndex = _.findIndex(pointersMap, {id: anch.targetComponent});
            checkAndRemoveAnchorCausingCircle(anchorTargetCompIndex, closeCircleCompId, closeCircleCompBottom, pointersMap, layoutMap, {}, changedComps);
        });
        return changedComps;
    }

    //we are looking for a bottom bottom anchor to closeCircleComp
    function checkAndRemoveAnchorCausingCircle(compIndex, closeCircleCompId, closeCircleCompBottom, siblingsPointersMap, siblingsLayoutMap, visitedComps, changedComps) {
        var compLayout = siblingsLayoutMap[compIndex];
        if (visitedComps[compIndex] ||
            (structureUtils.getBoundingY(compLayout) + structureUtils.getBoundingHeight(compLayout)) > closeCircleCompBottom) {
            return;
        }
        visitedComps[compIndex] = true;
        var anchors = compLayout.anchors;
        var removed = _.remove(anchors, function (anchor) {
            if (anchor.targetComponent === closeCircleCompId) {
                return true;
            }
            if (anchor.type !== "BOTTOM_PARENT") {
                var targetComponentIndex = _.findIndex(siblingsPointersMap, {id: anchor.targetComponent});
                checkAndRemoveAnchorCausingCircle(targetComponentIndex, closeCircleCompId, closeCircleCompBottom, siblingsPointersMap, siblingsLayoutMap, visitedComps);
            }
            return false;
        });
        if (!_.isEmpty(removed)) {
            changedComps[compIndex] = true;
        }
    }

    function shouldClearAnchorsOfParentOnChildUpdate(ps, parentPointer) {
        return !componentsMetaData.public.isContainer(ps, parentPointer) || !componentsMetaData.public.isResizable(ps, parentPointer);
    }


    function getCompsToClearOnUpdate(ps, componentPointer) {
        var componentPointers = ps.pointers.components;

        var compsToClear = componentPointers.getChildren(componentPointer);

        var parentPointer = componentPointers.getParent(componentPointer);
        if (parentPointer) {
            compsToClear = compsToClear.concat(componentPointers.getChildren(parentPointer));
            if (shouldClearAnchorsOfParentOnChildUpdate(ps, parentPointer)) {
                compsToClear.push(parentPointer);
            }
        } else {
            compsToClear.push(componentPointer);
        }

        return compsToClear;
    }


    function getCompsToRecalculateOnUpdate(ps, componentPointer) {
        var compsToRecalculate = getCompsToClearOnUpdate(ps, componentPointer);
        var parentsOfClearedComps = _.compact(_.map(compsToRecalculate, ps.pointers.components.getParent));
        compsToRecalculate = compsToRecalculate.concat(parentsOfClearedComps);
        return _.uniq(compsToRecalculate, 'id');
    }

    return {
        isSiteStructure: isSiteStructure,
        getComponentById: getComponentById,
        getLowestComp: getLowestComp,

        hasAnchorOfType: hasAnchorOfType,

        isLowerCompBottomBelowUpperComp: isLowerCompBottomBelowUpperComp,
        isCompBUnderCompAWithNothingBetween: isCompBUnderCompAWithNothingBetween,

        mergeSets: mergeSets,

        breakNegativeCircleIfThereIsOne: breakNegativeCircleIfThereIsOne,
        getCompsToClearOnUpdate: getCompsToClearOnUpdate,
        getCompsToRecalculateOnUpdate: getCompsToRecalculateOnUpdate,
        assignedChangedComps: assignedChangedComps
    };
});
