'use strict';

import * as _ from 'lodash';
import * as utils from 'utils';
import {boundingLayout} from 'coreUtils';
import {conversionConfig} from 'documentServices/mobileConversion/data/conversionConfig';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import * as constants from 'documentServices/constants/constants';

const boundingRectY = (comp: Component) => boundingLayout.getBoundingY(comp.layout);
const boundingRectHeight = (comp: Component) => boundingLayout.getBoundingHeight(comp.layout);
const boundingRectBottom = (comp: Component) => boundingRectY(comp) + boundingRectHeight(comp);
const boundingRect = (comp) => {
    if (!comp.layout.rotationInDegrees) {
        return comp;
    }
    const resLayout = _.defaults({rotationInDegrees: 0}, boundingLayout.getBoundingLayout(comp.layout), comp.layout);
    return _.defaults({layout: resLayout}, comp);
};

function clearComponentAnchors(parent, comps) {
    var comp;

    if (parent.layout) {
        parent.layout.anchors = [];
    }

    if (comps) {
        for (var i = 0; i < comps.length; i++) {
            comp = comps[i];
            clearComponentAnchors(comp, comp.components);
        }
    }
}

function recalculateComponentAnchors(parent, comps) {
    var comp;
    var i;

    if (comps) {
        recalculateAnchorsOfContainerAndDirectChildren(parent, comps);

        for (i = 0; i < comps.length; i++) {
            comp = comps[i];
            recalculateComponentAnchors(comp, comp.components);
        }
    }

}

function recalculateAnchorsOfContainerAndDirectChildren(parent, comps) {
    if (conversionUtils.isMasterPage(parent)) {
        setSiteSegmentAnchors(parent, comps);
    } else if (comps) {
        recalculateComponentAnchorsOfSameLevel(comps);
        addBottomParentAnchorsToContainer(parent, comps);
    }
}

function setSiteSegmentAnchors(masterPageStructure, comps) {
    var headerComponent = _.find(masterPageStructure.children, {id: constants.COMP_IDS.HEADER});
    var footerComponent = <Component> _.find(comps, {id: constants.COMP_IDS.FOOTER});
    var pagesContainerComponent = _.find(comps, {id: constants.COMP_IDS.PAGES_CONTAINER});

    addToTopAnchor(headerComponent, pagesContainerComponent, {
        distance: 0,
        locked: true,
        type: 'BOTTOM_TOP'
    });
    addToTopAnchor(pagesContainerComponent, footerComponent, {
        distance: 0,
        locked: true,
        type: 'BOTTOM_TOP'
    });

    footerComponent.layout.anchors = footerComponent.layout.anchors || [];
    footerComponent.layout.anchors.push({
        distance: 0,
        locked: true,
        originalValue: 500,
        targetComponent: 'masterPage',
        topToTop: 500,
        type: 'BOTTOM_PARENT'
    });

}

function addToTopAnchor(fromComp, toComp, overrideParams?) {
    const toCompY = boundingRectY(toComp);
    const fromCompY = boundingRectY(fromComp);
    const isBottomTop = isAppropriateForBottomTopAnchor(fromComp, toComp);
    const distance = isBottomTop ? toCompY - boundingRectBottom(fromComp) : toCompY - fromCompY;
    const topToTop = toCompY - fromCompY;
    const locked = distance <= constants.ANCHORS.LOCK_THRESHOLD;
    const originalValue = toComp.layout.y;
    const type = isBottomTop ? 'BOTTOM_TOP' : 'TOP_TOP';

    const toTopAnchor = {
        distance: distance,
        locked: locked,
        originalValue: originalValue,
        targetComponent: toComp.id,
        topToTop: topToTop,
        type: type
    };

    if (overrideParams) {
        _.assign(toTopAnchor, overrideParams);
    }

    fromComp.layout.anchors.push(toTopAnchor);
}

function isAppropriateForBottomTopAnchor(fromComp, toComp) {
    const toCompBottom = boundingRectBottom(toComp);
    const fromCompBottom = boundingRectBottom(fromComp);
    return toCompBottom > fromCompBottom && boundingRectY(toComp) > (boundingRectY(fromComp) + (boundingRectHeight(fromComp) / 2));
}

function addBottomParentAnchor(fromComp, toComp, overrideParams?) {
    const distance = Math.max(boundingRectHeight(toComp) - boundingRectBottom(fromComp), 0);
    const topToTop = boundingRectY(fromComp);
    const locked = distance <= constants.ANCHORS.LOCK_THRESHOLD;
    const originalValue = toComp.layout.height;

    const bottomParentAnchor = {
        distance: distance,
        locked: locked,
        originalValue: originalValue,
        targetComponent: toComp.id,
        topToTop: topToTop,
        type: 'BOTTOM_PARENT'
    };

    if (overrideParams) {
        _.assign(bottomParentAnchor, overrideParams);
    }

    fromComp.layout.anchors.push(bottomParentAnchor);
}

function addBottomParentAnchorsToContainer(parent, comps) {
    var i;
    var currentChild;

    for (i = 0; i < comps.length; i++) {
        currentChild = comps[i];

        if (!hasBottomTopAnchor(currentChild)) {
            addBottomParentAnchor(currentChild, parent);
        }
    }
}

function hasBottomTopAnchor(component) {
    var componentAnchors = component.layout.anchors;
    var i;

    if (componentAnchors) {
        for (i = 0; i < componentAnchors.length; i++) {
            if (componentAnchors[i].type === 'BOTTOM_TOP') {
                return true;
            }
        }
    }

    return false;
}

function isComponentBetweenOtherTwoComponents(component: Component, sib1: Component, sib2: Component): boolean {
    if (_.uniq(component.id, sib1.id, sib2.id).length < 3) {
        return false;
    }
    const getRight = (comp) => comp.layout.x + comp.layout.width;
    const getBottom = (comp) => comp.layout.y + comp.layout.height;

    var xOverlapLeftBorder = Math.max(sib1.layout.x, sib2.layout.x);
    var xOverlapRightBorder = Math.min(getRight(sib1), getRight(sib2));

    return (component.layout.x <= xOverlapRightBorder && getRight(component) >= xOverlapLeftBorder &&
    getBottom(component) >= getBottom(sib1) && component.layout.y <= sib2.layout.y);
}

function recalculateComponentAnchorsOfSameLevel(components) {
    _.forEach(components, (curComp) => {
        const curCompBoundingRect = boundingRect(curComp);
        const compsBelowCur = _.map(getComponentsBelowComponent(curComp, components), boundingRect);
        _.forEach(compsBelowCur, compBelow => {
            const shouldAddToTopAnchor = _.every(compsBelowCur, c => !isAppropriateForBottomTopAnchor(curCompBoundingRect, c) || !isComponentBetweenOtherTwoComponents(c, curCompBoundingRect, compBelow));
            if (shouldAddToTopAnchor) {
                addToTopAnchor(curComp, compBelow);
            }
        });
    });
}

function getComponentsBelowComponent(component, siblings) {
    const compBoundingRect = boundingRect(component);
    return _.filter(siblings, function (sibling: Component) {
        const siblingBoundingRect = boundingRect(sibling);
        return component.id !== sibling.id && compBoundingRect.layout.y <= siblingBoundingRect.layout.y && conversionUtils.getXOverlap(compBoundingRect, siblingBoundingRect) > 0;
    });
}

function updateAnchorsRelatedToAddedOrDeletedComponents(component, componentWithUpdatedAnchors, addedDeletedOrRelatedCompIds) {
    var anchors;
    var updatedAnchors;
    var children;
    var childrenClone;
    var i;

    if (component.layout) {
        component.layout.anchors = component.layout.anchors || [];
        anchors = component.layout.anchors;
        updatedAnchors = componentWithUpdatedAnchors.layout.anchors;

        if (_.includes(addedDeletedOrRelatedCompIds, component.id) || !component.layout.anchors || component.layout.anchors.length === 0) {
            component.layout.anchors = updatedAnchors;
        } else if (areAnchorsRelatedToAddedOrDeletedComponents(component.id, anchors, updatedAnchors, addedDeletedOrRelatedCompIds)) {
            sortAnchorsByTargetComponent(anchors);
            sortAnchorsByTargetComponent(updatedAnchors);
            component.layout.anchors = copyAnchorsSignificantlyModified(anchors, updatedAnchors);
        }
    }

    children = component.components || component.children;
    childrenClone = componentWithUpdatedAnchors.components || componentWithUpdatedAnchors.children;

    if (children) {
        for (i = 0; i < children.length; i++) {
            updateAnchorsRelatedToAddedOrDeletedComponents(children[i], childrenClone[i], addedDeletedOrRelatedCompIds);
        }
    }
}

function areAnchorsRelatedToAddedOrDeletedComponents(componentId, anchors, updatedAnchors, addedDeletedOrRelatedCompIds) {
    var i;

    for (i = 0; i < anchors.length; i++) {
        if (_.includes(addedDeletedOrRelatedCompIds, anchors[i].targetComponent)) {
            return true;
        }
    }

    for (i = 0; i < updatedAnchors.length; i++) {
        if (_.includes(addedDeletedOrRelatedCompIds, updatedAnchors[i].targetComponent)) {
            return true;
        }
    }

    return false;
}

function sortAnchorsByTargetComponent(anchors) {
    if (anchors) {
        anchors.sort(function (anchor1, anchor2) {
            return anchor1.targetComponent > anchor2.targetComponent;
        });
    }
}

function copyAnchorsSignificantlyModified(anchors, updatedAnchors) {
    var i;
    var curUpdatedAnchor;

    if (!anchors) {
        anchors = _.clone(updatedAnchors);
        return anchors;
    }

    for (i = 0; i < anchors.length; i++) {
        curUpdatedAnchor = updatedAnchors[i];

        if (!curUpdatedAnchor) {
            anchors = anchors.slice(0, i);
            break;
        }
        if (areAnchorsSiginificantlyDifferent(anchors[i], curUpdatedAnchor)) {
            anchors[i] = _.clone(curUpdatedAnchor);
        } else {
            anchors[i].originalValue = curUpdatedAnchor.originalValue;
        }
    }

    for (i = anchors.length; i < updatedAnchors.length; i++) {
        anchors[i] = _.clone(updatedAnchors[i]);
    }

    return anchors;
}

function areAnchorsSiginificantlyDifferent(anchor1, anchor2) {
    if (anchor1.targetComponent !== anchor2.targetComponent) {
        return true;
    }

    if (anchor1.type !== anchor2.type) {
        if (!(anchor1.type === 'TOP_TOP' && anchor2.type === 'TOP_BOTTOM' || anchor1.type === 'TOP_BOTTOM' && anchor2.type === 'TOP_TOP')) {
            return true;
        }
    }

    return false;
}

function getAddedDeletedOrRelatedCompIds(structure, deletedComponentIds, addedComponentIds) {
    var addedComponents = _(addedComponentIds).map(function (addedCompId) {
        return conversionUtils.getComponentByIdFromStructure(addedCompId, structure);
    }).compact().value();

    var childrenIdsOfAddedComponents = [];
    _.forEach(addedComponents, function (addedComp: Component) {
        childrenIdsOfAddedComponents = childrenIdsOfAddedComponents.concat(_.map(addedComp.components, 'id'));
    });

    var ret = addedComponentIds.concat(deletedComponentIds).concat(childrenIdsOfAddedComponents);
    return _.uniq(ret);
}

function updateAnchors(page: Component | MasterPageComponent, comps: Component[]): void {
    clearComponentAnchors(page, comps);
    recalculateComponentAnchors(page, comps);
}

function updateAnchorsAfterMerge(mobileSiteStructure: Component | MasterPageComponent, deletedComponentIds: string[], addedComponentIds: string[]): void {
    var mobileSiteStructureClone = _.cloneDeep(mobileSiteStructure);
    const comps = conversionUtils.getChildren(mobileSiteStructureClone);

    this.updateAnchors(mobileSiteStructureClone, comps);

    var addedDeletedOrRelatedCompIds = getAddedDeletedOrRelatedCompIds(mobileSiteStructureClone, deletedComponentIds, addedComponentIds);
    updateAnchorsRelatedToAddedOrDeletedComponents(mobileSiteStructure, mobileSiteStructureClone, addedDeletedOrRelatedCompIds);

    // for some reason, anchor cycles are sometimes created after merging the updated anchors
    utils.anchorCyclesHelper.fixBottomTopBottomBottomCycles(conversionUtils.getChildren(mobileSiteStructure));
}

export {
    updateAnchors,
    updateAnchorsAfterMerge
}