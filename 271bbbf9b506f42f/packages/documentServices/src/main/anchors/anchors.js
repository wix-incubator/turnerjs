define(['lodash',
    'documentServices/anchors/anchorsGenerator',
    'documentServices/anchors/anchorsUtils',
    'documentServices/documentMode/documentModeInfo',
    'documentServices/constants/constants',
    'documentServices/structure/structureUtils',
    'documentServices/structure/utils/componentLayout',
    'layout',
    'experiment'], function
    (_,
     anchorsGenerator,
     anchorsUtils,
     documentModeInfo,
     consts,
     structureUtils,
     componentLayout,
     layout,
     experiment) {
    'use strict';

    var anchorsConsts = consts.ANCHORS;

    var STRUCTURAL_COMP_IDS = ['SITE_HEADER', 'SITE_FOOTER', 'PAGES_CONTAINER'];
    var COMPS_WITH_NO_ANCHORS = ['BACK_TO_TOP_BUTTON'];

    function updateAnchors(ps, componentPointer, oldParentPointer) {
        if (componentPointer) {
            registerCompToRecalculateAnchorsLater(ps, componentPointer);
        }
        if (oldParentPointer) {
            registerCompToRecalculateAnchorsLater(ps, oldParentPointer);
        }
    }

    function activateViewerAnchorsGenerator(ps, pagePointer) {
        ps.siteAPI.createPageAnchors(pagePointer.id);
    }

    function updateAnchorsForCompChildren(ps, componentPointer) {
        if (experiment.isOpen('removeJsonAnchors')) {
            var pagePointer = ps.pointers.components.getPageOfComponent(componentPointer);
            var pageId = ps.dal.get(pagePointer).id;
            var compStructure = ps.dal.get(componentPointer);
            ps.siteAPI.createChildrenAnchors(compStructure, pageId, ps.siteAPI);
            return;
        }
        updateAnchorsFromChildren(ps, componentPointer);
        removeBottomBottomAnchorsToComp(ps, componentPointer);
    }

    function updateAnchorsFromChildren(ps, componentPointer) {
        if (componentPointer && ps.dal.get(componentPointer)) {
            var childrenPointers = ps.pointers.components.getChildren(componentPointer);
            if (childrenPointers.length) {
                var childrenAndLayout = getSortedCompPointersAndLayout(ps, childrenPointers);
                var changedComps = recalculateAnchorsForParentComponent(ps, componentPointer, childrenAndLayout);
                setAnchorsToDal(ps, changedComps, childrenAndLayout);
            }
        }
    }

    function removeBottomBottomAnchorsToComp(ps, componentPointer) {
        var compSiblingsPointer = ps.pointers.components.getSiblings(componentPointer);

        _.forEach(compSiblingsPointer, function (compSiblingPointer) {
            var anchorsPointer = ps.pointers.getInnerPointer(compSiblingPointer, 'layout.anchors');
            var anchors = ps.dal.get(anchorsPointer);
            var validAnchors = _.reject(anchors, {type: 'BOTTOM_BOTTOM', targetComponent: componentPointer.id});

            if (anchors && anchors.length !== validAnchors.length) {
                ps.dal.set(anchorsPointer, validAnchors);
            }
        });
    }

    function registerCompToRecalculateAnchorsLater(ps, componentPointer) {
        var compsToUpdateAnchorsPointer = ps.pointers.general.getCompsToUpdateAnchors();
        if (!ps.dal.isExist(compsToUpdateAnchorsPointer)) {
            ps.dal.set(compsToUpdateAnchorsPointer, [componentPointer]);
        } else {
            ps.dal.push(compsToUpdateAnchorsPointer, componentPointer);
        }
    }

    function updateAnchorsForMultipleComps(ps) {
        var compsToUpdateAnchorsPointer = ps.pointers.general.getCompsToUpdateAnchors();
        var componentPointersToClear = [];
        var componentPointersToRecalculate = [];
        var compsToUpdate = ps.dal.get(compsToUpdateAnchorsPointer) || [];

        if (experiment.isOpen('removeJsonAnchors')) {
            var viewerAnchorsUpdateFunc = activateViewerAnchorsGenerator.bind(null, ps);
            _(compsToUpdate)
                .map(ps.pointers.full.components.getPageOfComponent)
                .uniq('id')
                .compact()
                .forEach(viewerAnchorsUpdateFunc)
                .value();
            ps.dal.set(compsToUpdateAnchorsPointer, []);
            return;
        }

        compsToUpdate = _(compsToUpdate).uniq('id').filter(function (compPointer) {
            return ps.dal.isExist(compPointer);
        }).value();

        _.forEach(compsToUpdate, function (compPointer) {
            componentPointersToClear.push.apply(componentPointersToClear, anchorsUtils.getCompsToClearOnUpdate(ps, compPointer));
            componentPointersToRecalculate.push.apply(componentPointersToRecalculate, anchorsUtils.getCompsToRecalculateOnUpdate(ps, compPointer));
        });

        componentPointersToClear = _.uniq(componentPointersToClear, 'id');
        componentPointersToRecalculate = _.uniq(componentPointersToRecalculate, 'id');

        _.forEach(componentPointersToClear, clearExistingAnchors.bind(null, ps));
        _.forEach(componentPointersToRecalculate, calculateAnchors.bind(null, ps));

        ps.dal.set(compsToUpdateAnchorsPointer, []);
    }

    function clearExistingAnchors(ps, componentPointer) {
        var anchorsPointer = ps.pointers.getInnerPointer(componentPointer, 'layout.anchors');
        if (ps.dal.isExist(anchorsPointer)) {
            ps.dal.set(anchorsPointer, []);
        }
    }

    function filterFixedComponents(componentsPointerAndLayout) {
        return _.omit(componentsPointerAndLayout, function (componentData) { //using omit so that we get an object with the original indexes as keys :/
            return !_.includes(STRUCTURAL_COMP_IDS, componentData.pointer.id) && componentData.layout.fixedPosition;
        });
    }

    function calculateAnchors(ps, componentPointer) {
        var componentPointers = ps.pointers.components;
        var children = componentPointers.getChildren(componentPointer);

        //we don't add horizontal group anchors any more

        if (!children || _.isEmpty(children)) {
            return;
        }

        var childrenAndTheirLayout = getSortedCompPointersAndLayout(ps, children);
        childrenAndTheirLayout = filterFixedComponents(childrenAndTheirLayout);
        var changedCompIndexes = {};

        if (componentPointers.isMasterPage(componentPointer)) {
            changedCompIndexes = recalculateAnchorsForMasterPageSiblings(ps, childrenAndTheirLayout);
            anchorsUtils.assignedChangedComps(changedCompIndexes, recalculateSiteStructureAnchor(ps, componentPointer, childrenAndTheirLayout));
        } else {
            changedCompIndexes = recalculateAnchorsForSiblings(ps, childrenAndTheirLayout);
            anchorsUtils.assignedChangedComps(changedCompIndexes, recalculateAnchorsForParentComponent(ps, componentPointer, childrenAndTheirLayout));
        }

        anchorsUtils.assignedChangedComps(changedCompIndexes, checkForCirclesStartWithNegativeAnchorAndBreakThem(childrenAndTheirLayout));

        setAnchorsToDal(ps, changedCompIndexes, childrenAndTheirLayout);
    }

    function setAnchorsToDal(ps, changedComps, compsAndTheirLayout) {
        _.forOwn(changedComps, function (val, compIndex) {
            if (!val) {
                return;
            }
            var anchorsPointer = ps.pointers.getInnerPointer(compsAndTheirLayout[compIndex].pointer, 'layout.anchors');
            ps.dal.set(anchorsPointer, compsAndTheirLayout[compIndex].layout.anchors);
        });
    }

    function getComponentLayoutFromJson(privateServices, compPointer) {
        return privateServices.dal.get(privateServices.pointers.getInnerPointer(compPointer, 'layout'));
    }

    /**
     *
     * @param ps
     * @param compPointers
     * @returns {Array.<T>} sorted by y, from bottom to top
     */
    function getSortedCompPointersAndLayout(ps, compPointers) {
        var legalComps = _.reject(compPointers, function (compPointer) {
            return _.includes(COMPS_WITH_NO_ANCHORS, compPointer.id);
        });
        var childrenAndTheirLayout = _.map(legalComps, function (childPointer) {
            var compLayout = getComponentLayoutFromJson(ps, childPointer);
            return {
                pointer: childPointer,
                layout: compLayout
            };
        });

        return _.sortBy(childrenAndTheirLayout, function (childObj) {
            return structureUtils.getBoundingY(childObj.layout);
        }).reverse();
    }

    function checkForCirclesStartWithNegativeAnchorAndBreakThem(childrenPointersAndLayout) {
        var pointersMap = _.pluck(childrenPointersAndLayout, 'pointer');
        var layoutMap = _.pluck(childrenPointersAndLayout, 'layout');
        var changedComps = {};

        _.forEach(pointersMap, function (compPointer, compIndex) {
            var compAnchors = layoutMap[compIndex].anchors;
            _.forEach(compAnchors, function (anchor) {
                var changed = anchorsUtils.breakNegativeCircleIfThereIsOne(anchor, compPointer.id, layoutMap[compIndex], pointersMap, layoutMap);
                anchorsUtils.assignedChangedComps(changedComps, changed);
            });
        });
        return changedComps;
    }

    function createBottomParentAnchorToSitStructure(ps, compPointerAndLayout, masterPagePointer) {
        var originalValue = structureUtils.getBoundingY(compPointerAndLayout.layout) +
            structureUtils.getBoundingHeight(compPointerAndLayout.layout);

        return anchorsGenerator.createAnchor(ps, compPointerAndLayout.layout, 'BOTTOM_PARENT', compPointerAndLayout.pointer, masterPagePointer, 0, originalValue, true);
    }

    function recalculateSiteStructureAnchor(ps, masterPagePointer, masterPageChildrenPointersAndLayout) {
        var changedComps = {};
        var footerIndex = _.findKey(masterPageChildrenPointersAndLayout, {pointer: {id: 'SITE_FOOTER'}});
        var footer = masterPageChildrenPointersAndLayout[footerIndex];

        var isFooterChanged = createBottomParentAnchorToSitStructure(ps, footer, masterPagePointer);

        if (isFooterChanged) {
            changedComps[footerIndex] = true;
        }

        var masterPageChildrenWithoutStructuralComp = _.omit(masterPageChildrenPointersAndLayout, function (value) { //using omit so that we get an object with the original indexes as keys :/
            return _.includes(STRUCTURAL_COMP_IDS, value.pointer.id);
        });
        var lowestCompIndex = anchorsUtils.getLowestComp(_.mapValues(masterPageChildrenWithoutStructuralComp, 'layout'));

        if (lowestCompIndex < 0) {
            return changedComps;
        }

        var isLowestCompChanged = createBottomParentAnchorToSitStructure(ps, masterPageChildrenWithoutStructuralComp[lowestCompIndex], masterPagePointer);

        if (isLowestCompChanged) {
            changedComps[lowestCompIndex] = true;
        }
        return changedComps;
    }

    function recalculateAnchorsForParentComponent(ps, containerCompPointer, childrenPointersAndLayout) {
        var containerLayout = structureUtils.getComponentLayout(ps, containerCompPointer);
        return _(childrenPointersAndLayout)
            .map(function (child, index) {
                child.index = index;
                return child;
            })
            .filter(function (child) {
                return !structureUtils.isVerticallyDocked(child.layout) && !anchorsUtils.hasAnchorOfType(child.layout, 'BOTTOM_TOP');
            })
            .reduce(function (changedComps, child) {
                var anchor = anchorsGenerator.createBottomParentAnchor(ps, child.pointer, containerCompPointer, child.layout, containerLayout);
                if (anchor) {
                    changedComps[child.index] = anchor;
                }
                return changedComps;
            }, {});
    }


    function setAnchorsForStructuralMasterPageSiblings(ps, siblingsAndLayout) {
        var headerKey = _.findKey(siblingsAndLayout, {pointer: {id: 'SITE_HEADER'}});
        var pagesContainerKey = _.findKey(siblingsAndLayout, {pointer: {id: 'PAGES_CONTAINER'}});
        var footerIndex = _.findKey(siblingsAndLayout, {pointer: {id: 'SITE_FOOTER'}});

        var changedIndexes = {};

        if (headerKey && pagesContainerKey) {
            changedIndexes[headerKey] = anchorsGenerator.createBottomTopAnchor(ps,
                siblingsAndLayout[headerKey].pointer, siblingsAndLayout[pagesContainerKey].pointer,
                siblingsAndLayout[headerKey].layout, siblingsAndLayout[pagesContainerKey].layout,
                0);
        }

        if (pagesContainerKey && footerIndex) {
            changedIndexes[pagesContainerKey] = anchorsGenerator.createBottomTopAnchor(ps,
                siblingsAndLayout[pagesContainerKey].pointer, siblingsAndLayout[footerIndex].pointer,
                siblingsAndLayout[pagesContainerKey].layout, siblingsAndLayout[footerIndex].layout,
                0);
        }

        return changedIndexes;
    }

    function setAnchorsBetweenMasterPageStructureAndComps(ps, structuralSibling, regularSiblings) {
        var changedIndexes = {};

        var headerKey = _.findKey(structuralSibling, {pointer: {id: 'SITE_HEADER'}});

        if (headerKey) {
            var headerData = structuralSibling[headerKey];
            var bottomOfHeader = headerData.layout.y + headerData.layout.height;
            var highestCompBelowHeader = _.findLast(regularSiblings, function (compWithLayout) {
                return compWithLayout.layout.y > bottomOfHeader;
            });

            if (highestCompBelowHeader) {
                anchorsGenerator.createBottomTopAnchor(ps,
                    headerData.pointer, highestCompBelowHeader.pointer,
                    headerData.layout, highestCompBelowHeader.layout);

                changedIndexes[headerKey] = true;
            }
        }

        return changedIndexes;
    }


    function recalculateAnchorsForMasterPageSiblings(ps, siblingsAndLayout) {
        var structuralSiblings = {};
        var regularSiblings = {};

        _.forEach(siblingsAndLayout, function (pointerAndLayout, index) {
            if (_.includes(STRUCTURAL_COMP_IDS, pointerAndLayout.pointer.id)) {
                structuralSiblings[index] = pointerAndLayout;
            } else {
                regularSiblings[index] = pointerAndLayout;
            }
        });

        var indexesOfChangedSiblings = recalculateAnchorsForSiblings(ps, regularSiblings);
        anchorsUtils.assignedChangedComps(indexesOfChangedSiblings, setAnchorsForStructuralMasterPageSiblings(ps, structuralSiblings));
        anchorsUtils.assignedChangedComps(indexesOfChangedSiblings, setAnchorsBetweenMasterPageStructureAndComps(ps, structuralSiblings, regularSiblings));

        return indexesOfChangedSiblings;
    }


    function recalculateAnchorsForSiblings(ps, allSiblingsPointersAndLayout) {
        var changedLayout = {};
        _.forEach(allSiblingsPointersAndLayout, function (ptrAndLayout) {
            ptrAndLayout.layout.anchors = _.filter(ptrAndLayout.layout.anchors, {type: "BOTTOM_PARENT"}); //keep only bottom parent
            ps.dal.set(ps.pointers.getInnerPointer(ptrAndLayout.pointer, 'layout.anchors'), ptrAndLayout.layout.anchors); //set to dal
        });
        var indirectlyAnchored = _.mapValues(allSiblingsPointersAndLayout, function () {
            return {};
        });

        var allSiblingsLayout = _.mapValues(allSiblingsPointersAndLayout, 'layout');
        var allSiblingsPointers = _.mapValues(allSiblingsPointersAndLayout, 'pointer');

        _.forEach(allSiblingsPointers, function (topCompPointer, topCompIndex) {
            var topCompLayout = allSiblingsLayout[topCompIndex];

            var belowCompsIndexes = _.reduce(allSiblingsLayout, function (res, bottomCompLayout, bottomCompIndex) {
                if (anchorsUtils.isCompBUnderCompAWithNothingBetween(topCompLayout, bottomCompLayout, allSiblingsLayout)) {
                    res.push(bottomCompIndex);
                }
                return res;
            }, []);

            var changed = false;
            // because we want to calculate from top to bottom and allSiblingsLayout is ordered from bottom to top.
            //top bottom so that we won't create anchor from A->C if there are anchors A->B and B->C
            //B->C will already be there because this method is called bottom top, so we passed B.
            _.forEachRight(belowCompsIndexes, function (bottomCompIndex) {
                var bottomCompPointer = allSiblingsPointers[bottomCompIndex];
                var bottomCompLayout = allSiblingsLayout[bottomCompIndex];

                if (!indirectlyAnchored[topCompIndex][bottomCompIndex]) {
                    indirectlyAnchored[topCompIndex][bottomCompIndex] = true;

                    if (anchorsUtils.isLowerCompBottomBelowUpperComp(topCompLayout, bottomCompLayout)) {
                        changed = anchorsGenerator.createBottomTopAnchor(ps, topCompPointer, bottomCompPointer, topCompLayout, bottomCompLayout) || changed;
                        anchorsUtils.mergeSets(indirectlyAnchored, allSiblingsLayout, topCompIndex, bottomCompIndex);
                    } else {
                        changed = anchorsGenerator.createTopTopAnchor(ps, topCompPointer, bottomCompPointer, topCompLayout, bottomCompLayout) || changed;
                    }
                }
            });
            changedLayout[topCompIndex] = changed;
        });
        return changedLayout;
    }

    function getMinDragHandleY(ps, componentPointer, componentsToIgnore) {
        var siblingPointers = ps.pointers.components.getSiblings(componentPointer);
        var componentId = componentPointer.id;
        var bottomTopAnchor, topTopAnchor;

        componentsToIgnore = componentsToIgnore || [];
        return _.reduce(siblingPointers, function (res, siblingPointer) {
            if (_.includes(componentsToIgnore, siblingPointer.id)) {
                return res;
            }

            var siblingLayout = structureUtils.getComponentLayout(ps, siblingPointer);
            bottomTopAnchor = _.find(siblingLayout.anchors, {targetComponent: componentId, type: 'BOTTOM_TOP'});
            if (bottomTopAnchor) {
                return Math.max(res, structureUtils.getBoundingY(siblingLayout) + structureUtils.getBoundingHeight(siblingLayout));
            }

            topTopAnchor = _.find(siblingLayout.anchors, {targetComponent: componentId, type: 'TOP_TOP'});
            if (topTopAnchor) {
                return Math.max(res, structureUtils.getBoundingY(siblingLayout));
            }

            return res;
        }, 0);
    }

    function getMinAnchorLockDistance() {
        return anchorsConsts.LOCK_THRESHOLD;
    }

    return {
        updateAnchors: updateAnchors,
        updateAnchorsForCompChildren: updateAnchorsForCompChildren,
        getMinDragHandleY: getMinDragHandleY,
        getMinAnchorLockDistance: getMinAnchorLockDistance,
        updateAnchorsForMultipleComps: updateAnchorsForMultipleComps
    };
});
