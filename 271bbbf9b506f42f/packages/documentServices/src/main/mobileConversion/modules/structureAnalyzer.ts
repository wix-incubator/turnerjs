'use strict';

import * as _ from 'lodash';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import {conversionConfig} from 'documentServices/mobileConversion/data/conversionConfig';
import {virtualGroupHandler} from 'documentServices/mobileConversion/modules/virtualGroupHandler';

var NEIGHBORS = [
    'leftNeighbor',
    'rightNeighbor',
    'topNeighbor',
    'bottomNeighbor'
];

function haveSufficientXOverlap(comp1, comp2, overlapToMinWidthRatioThreshold: number = 0.25) {
    return conversionUtils.getXOverlap(comp1, comp2) / Math.min(comp1.layout.width, comp2.layout.width) > overlapToMinWidthRatioThreshold;
}

function haveSufficientYOverlap(comp1, comp2, overlapToMinHeightRatioThreshold: number = 0.25) {
    return conversionUtils.getYOverlap(comp1, comp2) / Math.min(comp1.layout.height, comp2.layout.height) > overlapToMinHeightRatioThreshold;
}

function compareByRows(comp1: ComponentWithConversionData, comp2: ComponentWithConversionData): number {
    if (!haveSufficientYOverlap(comp1, comp2)) {
        if (comp1.layout.y < comp2.layout.y) {
            return -1;
        }

        if (comp1.layout.y > comp2.layout.y) {
            return 1;
        }
    }

    var isComp1ScreenWidth = conversionUtils.isScreenWidthComponent(comp1);
    var isComp2ScreenWidth = conversionUtils.isScreenWidthComponent(comp2);

    if (isComp1ScreenWidth) {
        if (isComp2ScreenWidth) {
            return 0;
        }

        return -1;
    } else if (isComp2ScreenWidth) {
        return 1;
    }

    if (comp1.layout.x < comp2.layout.x) {
        return -1;
    }

    if (comp1.layout.x > comp2.layout.x) {
        return 1;
    }

    return 0;
}

function identifyComponentClusters(parent, comps) {
    var componentNeighborsArray;
    var i;
    var j;
    var currentComponentNeighbors;
    var averageDistance;
    var groups;
    var curGroup;
    var groupingThreshold;
    var currentNeighbor;
    var comp;

    _.set(parent, ['conversionData', 'clusterGroups'], []);

    if (comps) {
        componentNeighborsArray = [];

        for (i = 0; i < comps.length; i++) {
            currentComponentNeighbors = getComponentNeighbors(comps[i], comps);
            componentNeighborsArray.push(currentComponentNeighbors);
        }

        averageDistance = getAverageDistanceBetweenNeighbors(componentNeighborsArray);
        averageDistance = removeOutliersAndRecalculateDistanceAverage(componentNeighborsArray, averageDistance);
        groups = [];

        for (i = 0; i < comps.length; i++) {
            curGroup = [comps[i].id];
            currentComponentNeighbors = componentNeighborsArray[i];
            groupingThreshold = 0.08;

            for (j = 0; j < NEIGHBORS.length; j++) {
                currentNeighbor = currentComponentNeighbors[NEIGHBORS[j]];

                if (currentNeighbor.comp && currentNeighbor.distance / averageDistance < groupingThreshold) {
                    curGroup.push(currentNeighbor.comp.id);
                }
            }

            if (curGroup.length > 1) {
                groups.push(curGroup);
            }
        }

        parent.conversionData.clusterGroups = parent.conversionData.clusterGroups.concat(groups);
        conversionUtils.unifyGroups(parent.conversionData.clusterGroups, 50);

        for (i = 0; i < comps.length; i++) {
            comp = comps[i];

            identifyComponentClusters(comp, comp.components);
        }
    }
}

function removeOutliersAndRecalculateDistanceAverage(componentNeighborsArray, averageDistance) {
    var outlierMultiplicationThreshold = 2;
    var i;
    var j;
    var currentComponentNeighbors;
    var currentNeighbor;

    for (i = 0; i < componentNeighborsArray.length; i++) {
        currentComponentNeighbors = componentNeighborsArray[i];

        for (j = 0; j < NEIGHBORS.length; j++) {
            currentNeighbor = currentComponentNeighbors[NEIGHBORS[j]];

            if (currentNeighbor.comp && currentNeighbor.distance > averageDistance * outlierMultiplicationThreshold) {
                currentNeighbor.distance = Number.MAX_VALUE;
                currentNeighbor.comp = null;
            }
        }
    }
    averageDistance = getAverageDistanceBetweenNeighbors(componentNeighborsArray);

    return averageDistance;
}

function getAverageDistanceBetweenNeighbors(componentNeighborsArray) {
    var distancesSum = 0;
    var numDistances = 0;
    var i;
    var j;
    var currentComponentNeighbors;
    var currentNeighbor;

    for (i = 0; i < componentNeighborsArray.length; i++) {
        currentComponentNeighbors = componentNeighborsArray[i];

        for (j = 0; j < NEIGHBORS.length; j++) {
            currentNeighbor = currentComponentNeighbors[NEIGHBORS[j]];

            if (currentNeighbor.comp) {
                distancesSum += currentNeighbor.distance;
                numDistances++;
            }
        }
    }

    return numDistances > 0 ? (distancesSum / numDistances) : -1;
}

function getComponentBorders(component) {
    return {
        left: component.layout.x,
        right: component.layout.x + component.layout.width,
        top: component.layout.y,
        bottom: component.layout.y + component.layout.height
    };
}

function identifyTextAndItsCorrelatingVisual(parent, comps) {
    var i;
    var curChild;
    var componentNeighbors;
    var visualComponentNeighbors;
    var closestTextToClosestVisual;
    var textVisualGroup;
    var comp;


    if (comps) {
        _.set(parent, ['conversionData', 'textVisualGroups'], []);

        for (i = 0; i < comps.length; i++) {
            curChild = comps[i];

            if (!conversionUtils.isTextComponent(curChild)) {
                continue;
            }

            componentNeighbors = getComponentNeighbors(curChild, comps);
            const closestVisualGroupComponent = findClosestTypeToComponent(componentNeighbors, 'visual') ||
                                                findClosestTypeToComponent(componentNeighbors, 'photo');

            if (closestVisualGroupComponent) {
                visualComponentNeighbors = getComponentNeighbors(closestVisualGroupComponent, comps);
                closestTextToClosestVisual = findClosestTypeToComponent(visualComponentNeighbors, 'text');

                if (closestTextToClosestVisual && closestTextToClosestVisual.id === curChild.id) {
                    textVisualGroup = [curChild.id, closestVisualGroupComponent.id];
                    parent.conversionData.textVisualGroups.push(textVisualGroup);
                }
            }
        }

        conversionUtils.unifyGroups(parent.conversionData.textVisualGroups, 50);

        for (i = 0; i < comps.length; i++) {
            comp = comps[i];
            identifyTextAndItsCorrelatingVisual(comp, comp.components);
        }
    }
}

function findClosestTypeToComponent(componentNeighbors, type) {
    var closestTypeComponent = null;
    var closestTypeComponentDistance = Number.MAX_VALUE;
    var currentNeighbor;
    var i;

    for (i = 0; i < NEIGHBORS.length; i++) {
        currentNeighbor = componentNeighbors[NEIGHBORS[i]];

        if (conversionUtils.getComponentCategory(currentNeighbor.comp) === type && currentNeighbor.distance < closestTypeComponentDistance) {
            closestTypeComponent = currentNeighbor.comp;
            closestTypeComponentDistance = currentNeighbor.distance;
        }
    }

    return closestTypeComponent;
}



function identifyTightSiblingStrips(parent, comps:any[], order) {
    order = order || _.map(comps, 'id');
    if (!comps) {
        return;
    }

    _.forEach(order, (id, i:number) => {
        var comp = _.find(comps, {id});
        identifyTightSiblingStrips(comp, comp.components, _.get(comp, ['conversionData', 'componentsOrder']));
        if (comp.conversionData.isTransparentContainer) {
            comp = _.first(comp.components) || comp;
        }
        if (conversionUtils.shouldStretchToScreenWidth(comp) && comp.layout.y + comp.layout.height >= parent.layout.height) {
            _.set(parent, ['conversionData', 'tightBottomMargin'], true);
        }

        if (!i) {
            return;
        }

        var previousId = order[i - 1];
        var previousComponent = _.find(comps, {id: previousId});

        if (previousComponent.layout.y + previousComponent.layout.height === comp.layout.y &&
            previousComponent.layout.x === comp.layout.x) {
            _.set(comp, ['conversionData', 'tightWithPreviousSibling'], true);
        }
    });
}


function identifyPatterns(parent, comps) {
    var allNeighborsArray;
    var patterns;
    var i;
    var comp;

    if (comps) {
        allNeighborsArray = getAllNeighborsArray(comps);
        parent.conversionData.patternGroups = [];
        patterns = getPatternsFromNeighbors(allNeighborsArray);

        for (i = 0; i < patterns.length; i++) {
            parent.conversionData.patternGroups.push([patterns[i][0].comp.id, patterns[i][0].neighbor.id]);
            parent.conversionData.patternGroups.push([patterns[i][1].comp.id, patterns[i][1].neighbor.id]);
        }

        conversionUtils.unifyGroups(parent.conversionData.patternGroups, 50);

        for (i = 0; i < comps.length; i++) {
            comp = comps[i];
            identifyPatterns(comp, comp.components);
        }
    }
}

function getAllNeighborsArray(children) {
    var allNeighborsArray = [];
    var currentComponentNeighborRelations;
    var currentNeighborRelation;
    var i;

    for (i = 0; i < children.length; i++) {
        currentComponentNeighborRelations = getComponentNeighbors(children[i], children, 5);

        for (var j = 0; j < NEIGHBORS.length; j++) {
            currentNeighborRelation = currentComponentNeighborRelations[NEIGHBORS[j]];

            if (currentNeighborRelation.comp) {
                allNeighborsArray.push({
                    comp: children[i],
                    neighbor: currentNeighborRelation.comp,
                    distance: currentNeighborRelation.distance,
                    direction: NEIGHBORS[j]
                });
            }
        }
    }

    return allNeighborsArray;
}

function joinOrderingRelatedGroups(parent, comps) {
    var i;
    var comp;

    if (comps) {
        _.set(parent, ['conversionData', 'semanticGroups'], []);
        parent.conversionData.semanticGroups = parent.conversionData.semanticGroups.concat(_.cloneDeep(parent.conversionData.clusterGroups));
        parent.conversionData.semanticGroups = parent.conversionData.semanticGroups.concat(_.cloneDeep(parent.conversionData.textVisualGroups));
        parent.conversionData.semanticGroups = parent.conversionData.semanticGroups.concat(_.cloneDeep(parent.conversionData.patternGroups));
        parent.conversionData.semanticGroups = _.compact(parent.conversionData.semanticGroups);
        conversionUtils.unifyGroups(parent.conversionData.semanticGroups);

        for (i = 0; i < comps.length; i++) {
            comp = comps[i];
            joinOrderingRelatedGroups(comp, comp.components);
        }
    }

}

function getPatternsFromNeighbors(neighborRelations) {
    var patterns = [];
    var firstNeighborRelation;
    var secondNeighborRelation;
    var i;
    var j;

    for (i = 0; i < neighborRelations.length; i++) {
        firstNeighborRelation = neighborRelations[i];
        for (j = i + 1; j < neighborRelations.length; j++) {
            secondNeighborRelation = neighborRelations[j];

            if (areNeighborRelationsSimilar(firstNeighborRelation, secondNeighborRelation)) {
                patterns.push([firstNeighborRelation, secondNeighborRelation]);
            }
        }
    }

    return patterns;
}

function hasGroupInAnyNeighborRelation(relations:any[]) {
    return _.some(relations, function (relation) {
        return conversionUtils.isGroupComponent(relation.comp) || conversionUtils.isGroupComponent(relation.neighbor);
    });
}

function areNeighborRelationsSimilar(firstNeighborRelation, secondNeighborRelation) {
    var maximalDifferanceBetweenDistancesToClaimTheyAreSimilar = 10;

    if (hasGroupInAnyNeighborRelation([firstNeighborRelation, secondNeighborRelation])) {
        return false;
    }

    if (firstNeighborRelation.comp.componentType === firstNeighborRelation.neighbor.componentType ||
        secondNeighborRelation.comp.componentType === secondNeighborRelation.neighbor.componentType) {
        return false;
    }

    if (virtualGroupHandler.isVirtualGroup(firstNeighborRelation.comp) ||
        virtualGroupHandler.isVirtualGroup(firstNeighborRelation.neighbor) ||
        virtualGroupHandler.isVirtualGroup(secondNeighborRelation.comp) ||
        virtualGroupHandler.isVirtualGroup(secondNeighborRelation.neighbor)) {
        return false;
    }

    return firstNeighborRelation.comp.componentType === secondNeighborRelation.comp.componentType &&
        firstNeighborRelation.comp.componentType === secondNeighborRelation.comp.componentType &&
        firstNeighborRelation.comp.id !== secondNeighborRelation.comp.id &&
        firstNeighborRelation.neighbor.id !== secondNeighborRelation.neighbor.id &&
        firstNeighborRelation.neighbor.componentType === secondNeighborRelation.neighbor.componentType &&
        firstNeighborRelation.direction === secondNeighborRelation.direction &&
        Math.abs(firstNeighborRelation.distance - secondNeighborRelation.distance) < maximalDifferanceBetweenDistancesToClaimTheyAreSimilar;
}

function addComponentOrder(parent, comps) {
    if (!comps) {
        return;
    }

    var compsClone = _.cloneDeep(comps).sort(compareByRows);
    _.set(parent, ['conversionData', 'componentsOrder'], _.map(compsClone, 'id'));
    _.forEach(comps, function (comp) {
        addComponentOrder(comp, comp.components);
    });
}

function getTextAlignment(comp) {
    if (!comp || !conversionUtils.isTextComponent(comp)) {
        return null;
    }

    var alignments = _.get(comp, ['conversionData', 'textAlignments'], []);
    return _(alignments).uniq().size() > 1 ? 'mixed' : _.first(alignments);
}

function analyzeSiblingCount(parent, comps) {
    var count = _.size(comps) - 1;
    _.forEach(comps, function (comp) {
        comp.conversionData.siblingCount = count;
        analyzeSiblingCount(comp, comp.components);
    });
}

function analyzeSiblingBasedNaturalAlignment(parent, comps) {
    var textAlignments = _(comps).map(function (comp) {
        return getTextAlignment(comp);
    }).compact().uniq().value();

    if (_.size(textAlignments) === 1) {
        _.set(parent, ['conversionData', 'naturalAlignment'], _.first(textAlignments));
    }

    _.forEach(comps, function (comp) {
        analyzeSiblingBasedNaturalAlignment(comp, comp.components);
    });
}

function updateComponentOrderWithNeighborsInfo(parent, comps) {
    var i;
    var j;
    var k;
    var searchDone;
    var currentSemanticGroup;
    var remainingSemanticGroupToCheck;
    var indexInGroup;
    var componentIdNextInOrder;
    var comp;

    const semanticGroups = _.get(parent, ['conversionData', 'semanticGroups'], []);
    if (semanticGroups.length > 0) {
        orderSemanticGroupsAccordingToComponentOrder(parent);

        for (i = 0; i < _.get(parent, ['conversionData', 'componentsOrder', 'length'], 0); i++) {
            searchDone = false;

            for (j = 0; j < semanticGroups.length; j++) {
                if (searchDone) {
                    break;
                }

                currentSemanticGroup = semanticGroups[j];

                for (k = 0; k < currentSemanticGroup.length; k++) {
                    if (parent.conversionData.componentsOrder[i] === currentSemanticGroup[k]) {
                        searchDone = true;
                        remainingSemanticGroupToCheck = currentSemanticGroup.slice(0);
                        remainingSemanticGroupToCheck.splice(k, 1);

                        while (remainingSemanticGroupToCheck.length > 0 && i < parent.conversionData.componentsOrder.length - 1) {
                            i++;
                            indexInGroup = remainingSemanticGroupToCheck.indexOf(parent.conversionData.componentsOrder[i]);

                            if (indexInGroup === -1) {
                                componentIdNextInOrder = remainingSemanticGroupToCheck[0];
                                parent.conversionData.componentsOrder.splice(parent.conversionData.componentsOrder.indexOf(componentIdNextInOrder), 1);
                                parent.conversionData.componentsOrder.splice(i, 0, componentIdNextInOrder);
                            }

                            remainingSemanticGroupToCheck.splice(0, 1);
                        }

                        break;
                    }
                }
            }
        }
    }

    if (comps) {
        for (i = 0; i < comps.length; i++) {
            comp = comps[i];
            updateComponentOrderWithNeighborsInfo(comp, comp.components);
        }
    }
}

function orderSemanticGroupsAccordingToComponentOrder(component) {
    const semanticGroups = _.get(component, ['conversionData', 'semanticGroups']);
    const compsOrder = _.get(component, ['conversionData', 'componentsOrder']);
    _.forEach(semanticGroups, currentSemanticGroup => currentSemanticGroup.sort(compareByAnotherArrayOrder(compsOrder)));
}

function compareByAnotherArrayOrder(arrayOfOrder) {
    return function (element1, element2) {
        if (arrayOfOrder.indexOf(element1) < arrayOfOrder.indexOf(element2)) {
            return -1;
        }

        if (arrayOfOrder.indexOf(element1) > arrayOfOrder.indexOf(element2)) {
            return 1;
        }

        return 0;
    };
}

function addCurrentBlockData(component, currentBlockIds) {
    var blockComps = conversionUtils.getComponentsByIds(component, currentBlockIds);
    var blockLayout = conversionUtils.getSnugLayout(blockComps);

    component.conversionData.blockLayout.push(blockLayout);
    component.conversionData.blocks.push(currentBlockIds);
}

function getComponentNeighbors(component, siblings, allowedOverlayBetweenNeighbors?) {
    allowedOverlayBetweenNeighbors = allowedOverlayBetweenNeighbors || 0;
    var componentBorders = getComponentBorders(component);
    var leftNeighbor = null;
    var leftNeighborDistance = Number.MAX_VALUE;
    var rightNeighbor = null;
    var rightNeighborDistance = Number.MAX_VALUE;
    var topNeighbor = null;
    var topNeighborDistance = Number.MAX_VALUE;
    var bottomNeighbor = null;
    var bottomNeighborDistance = Number.MAX_VALUE;
    var i;
    var currentSibling;
    var currentSiblingBorders;
    var componentDistance;


    if (siblings) {
        for (i = 0; i < siblings.length; i++) {
            currentSibling = siblings[i];

            if (component.id === currentSibling.id) {
                continue;
            }

            if (conversionUtils.haveSufficientOverlap(component, currentSibling, 0.25)) {
                continue;
            }

            currentSiblingBorders = getComponentBorders(currentSibling);

            if (haveSufficientYOverlap(component, currentSibling)) {
                if (componentBorders.left + allowedOverlayBetweenNeighbors > currentSiblingBorders.right) {
                    componentDistance = componentBorders.left - currentSiblingBorders.right;

                    if (componentDistance < leftNeighborDistance) {
                        leftNeighbor = currentSibling;
                        leftNeighborDistance = componentDistance;
                    }
                }

                if (componentBorders.right - allowedOverlayBetweenNeighbors < currentSiblingBorders.left) {
                    componentDistance = currentSiblingBorders.left - componentBorders.right;

                    if (componentDistance < rightNeighborDistance) {
                        rightNeighbor = currentSibling;
                        rightNeighborDistance = componentDistance;
                    }
                }
            }

            if (haveSufficientXOverlap(component, currentSibling)) {
                if (componentBorders.top + allowedOverlayBetweenNeighbors > currentSiblingBorders.bottom) {
                    componentDistance = componentBorders.top - currentSiblingBorders.bottom;

                    if (componentDistance < topNeighborDistance) {
                        topNeighbor = currentSibling;
                        topNeighborDistance = componentDistance;
                    }
                }

                if (componentBorders.bottom - allowedOverlayBetweenNeighbors < currentSiblingBorders.top) {
                    componentDistance = currentSiblingBorders.top - componentBorders.bottom;

                    if (componentDistance < bottomNeighborDistance) {
                        bottomNeighbor = currentSibling;
                        bottomNeighborDistance = componentDistance;
                    }
                }
            }

        }
    }

    return {
        leftNeighbor: {comp: leftNeighbor, distance: leftNeighborDistance},
        rightNeighbor: {comp: rightNeighbor, distance: rightNeighborDistance},
        topNeighbor: {comp: topNeighbor, distance: topNeighborDistance},
        bottomNeighbor: {comp: bottomNeighbor, distance: bottomNeighborDistance}
    };
}

function analyzeStructure(parent: Component | MasterPageComponent, comps: ComponentWithConversionData[], opt = {semanticOrdering: true}): void {
    if (!_.has(parent, 'conversionData')) {
        _.set(parent, ['conversionData'], {});
    }
    identifyComponentClusters(parent, comps);

    if (opt.semanticOrdering) {
        identifyTextAndItsCorrelatingVisual(parent, comps);
    }

    identifyPatterns(parent, comps);
    joinOrderingRelatedGroups(parent, comps);
    addComponentOrder(parent, comps);
    updateComponentOrderWithNeighborsInfo(parent, comps);
    identifyTightSiblingStrips(parent, comps, _.get(parent, ['conversionData', 'componentsOrder']));
    analyzeSiblingBasedNaturalAlignment(parent, comps);
    analyzeSiblingCount(parent, comps);
}

function identifyBlocks(component: ComponentWithConversionData | MasterPageComponentWithConversionData): void {
    if (!_.has(component, 'conversionData')) {
        _.set(component, ['conversionData'], {});
    }
    var children = conversionUtils.getChildren(component);
    var componentClone;
    var childrenClone;
    var currentBlockIds;
    var firstIndexInCurrentBlock;
    var i;
    var j;
    var haveSufficientYOverlapWithOneOfTheBlockMembers;

    if (children) {
        _.set(component, ['conversionData', 'blocks'], []);
        _.set(component, ['conversionData', 'blockLayout'], []);
        componentClone = _.cloneDeep(component);
        childrenClone = conversionUtils.getChildren(componentClone);
        childrenClone.sort(compareByRows);
        currentBlockIds = [];
        firstIndexInCurrentBlock = 0;

        for (i = 0; i < childrenClone.length; i++) {
            currentBlockIds.push(childrenClone[i].id);

            if (i === childrenClone.length - 1) {
                addCurrentBlockData(component, currentBlockIds);
            } else {
                haveSufficientYOverlapWithOneOfTheBlockMembers = false;

                for (j = firstIndexInCurrentBlock; j <= i; j++) {
                    if (haveSufficientYOverlap(childrenClone[j], childrenClone[i + 1])) {
                        haveSufficientYOverlapWithOneOfTheBlockMembers = true;
                        break;
                    }
                }

                if (!haveSufficientYOverlapWithOneOfTheBlockMembers) {
                    addCurrentBlockData(component, currentBlockIds);
                    currentBlockIds = [];
                    firstIndexInCurrentBlock = i + 1;
                }
            }
        }

        _.forEach(children, (child: ComponentWithConversionData) => identifyBlocks(child));
    }
}

export {
    analyzeStructure,
    identifyBlocks
}
