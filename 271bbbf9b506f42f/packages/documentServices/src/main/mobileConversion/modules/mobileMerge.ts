/**
 * Created by noamr on 16/08/2016.
 */

import * as _ from 'lodash';
import * as conversionUtils from 'documentServices/mobileConversion/modules/conversionUtils';
import {conversionConfig} from 'documentServices/mobileConversion/data/conversionConfig';
import {virtualGroupHandler} from 'documentServices/mobileConversion/modules/virtualGroupHandler';
import * as mobileOnlyComponentsHandler from 'documentServices/mobileConversion/modules/mobileOnlyComponentsHandler';
import * as structurePreprocessor from 'documentServices/mobileConversion/modules/structurePreprocessor';
import * as structuresComparer from 'documentServices/mobileConversion/modules/structuresComparer';
import * as anchorsCalculator from 'documentServices/mobileConversion/modules/anchorsCalculator';
import * as structureAnalyzer from 'documentServices/mobileConversion/modules/structureAnalyzer';
import * as structureConverter from 'documentServices/mobileConversion/modules/structureConverter';
import {objectUtils, dataUtils} from 'coreUtils';
import * as experiment from 'experiment';
import * as boxSlideShowLayoutHandler from 'documentServices/mobileConversion/modules/boxSlideShowLayoutHandler';

function getCompsIds(comp: Component | MasterPageComponent, res: string[] = []): string[] {
    res.push(comp.id);
    _.forEach(conversionUtils.getChildren(comp), (child) => {
        res = res.concat(getCompsIds(child));
    });
    return res;
}

function areDirectParentAndChild(component: Component, container: Component | MasterPageComponent): boolean {
    return _.some(conversionUtils.getChildren(container), {id: component.id});
}

function insertAddedComponentBetweenBlocks(container: ComponentWithConversionData | MasterPageComponentWithConversionData, componentToAdd: Component, previousComponentId: string): void {
    _.defaults(container.conversionData, {blocks: [], blockLayout: []});
    const components = conversionUtils.getChildren(container);
    var blockNumberOfPreviousComponent = findBlockNumberOfComponent(previousComponentId, container);
    var componentToAddClone = _.cloneDeep(componentToAdd);

    componentToAddClone.layout.y = calculateYFromBlockLayout(blockNumberOfPreviousComponent, container);

    components.push(componentToAddClone);

    const nextBlockTopY = _.get(container, ['conversionData', 'blockLayout', blockNumberOfPreviousComponent + 1, 'y']);
    if (_.isNumber(nextBlockTopY)) {
        const shiftValue = componentToAddClone.layout.y + componentToAddClone.layout.height + conversionConfig.COMPONENT_MOBILE_MARGIN_Y - <number> nextBlockTopY;
        shiftComponentsLowerThanBlock(container, blockNumberOfPreviousComponent, shiftValue);
    }

    container.conversionData.blocks.splice(blockNumberOfPreviousComponent + 1, 0, [componentToAddClone.id]);
    container.conversionData.blockLayout.splice(blockNumberOfPreviousComponent + 1, 0, componentToAddClone.layout);
}

function findBlockNumberOfComponent(componentId: string, container: ComponentWithConversionData | MasterPageComponentWithConversionData): number {
    const blocks = _.get(container, ['conversionData', 'blocks'], []);
    return _.findIndex(blocks, block => _.includes(block, componentId));
}

function calculateYFromBlockLayout(blockNumberOfPreviousComponent: number, container: Component | MasterPageComponent): number {
    const blockLayout = _.get(container, ['conversionData', 'blockLayout']);
    return blockNumberOfPreviousComponent >= 0 ?
        (blockLayout[blockNumberOfPreviousComponent].y + blockLayout[blockNumberOfPreviousComponent].height + conversionConfig.COMPONENT_MOBILE_MARGIN_Y) :
        conversionConfig.COMPONENT_MOBILE_MARGIN_Y;
}

function ensureContainerWrapsChildren(container: ComponentWithConversionData | MasterPageComponent): void {
    var components = <ComponentWithConversionData[]> conversionUtils.getChildren(container);

    if (conversionUtils.isMasterPage(container) || _.isEmpty(components)) {
        return;
    }

    const lowestChildBottom = _.reduce(components, (bottom, comp) => Math.max(bottom, comp.layout.y + comp.layout.height), 0);

    const bottomMargin = !conversionUtils.isPageComponent(<Component> container) ? conversionConfig.COMPONENT_MOBILE_MARGIN_Y : 0;
    container.layout.height = Math.max(container.layout.height, lowestChildBottom + bottomMargin);
}

function shiftComponentsLowerThanBlock(container: ComponentWithConversionData | MasterPageComponentWithConversionData, blockNumber: number, shiftValue: number): void {
    var containerChildren = conversionUtils.getChildren(container);
    var j;
    var i;
    var curBlock;
    var curComponent;

    for (i = blockNumber + 1; i < _.get(container, ['conversionData', 'blocks', 'length'], 0); i++) {
        curBlock = container.conversionData.blocks[i];

        for (j = 0; j < curBlock.length; j++) {
            curComponent = _.find(containerChildren, {id: curBlock[j]});
            curComponent.layout.y += shiftValue;
            if (!experiment.isOpen('removeJsonAnchors')) {
                curComponent.layout.anchors = [];
            }
        }

        container.conversionData.blockLayout[i].y += shiftValue;
    }

    if (blockNumber > -1) {
        curBlock = _.get(container, ['conversionData', 'blocks', blockNumber]);

        for (j = 0; j < curBlock.length; j++) {
            curComponent = _.find(containerChildren, {id: curBlock[j]});
            if (!experiment.isOpen('removeJsonAnchors')) {
                curComponent.layout.anchors = [];
            }

        }
    }
}


function ensureDataQueriesAreEqualToDesktop(desktopComponent: Component | MasterPageComponent, mobileStructure: Component | MasterPageComponent): void {
    var mobileComponent = conversionUtils.getComponentByIdFromStructure(desktopComponent.id, mobileStructure);
    _.forEach(conversionUtils.getChildren(desktopComponent), desktopChild => ensureDataQueriesAreEqualToDesktop(desktopChild, mobileStructure));

    if (!mobileComponent) {
        return;
    }

    _.forEach(['dataQuery', 'nickname', 'behaviorQuery', 'connectionQuery'], fieldName => {
        if (!desktopComponent.hasOwnProperty(fieldName)) {
            delete mobileComponent[fieldName];
        } else {
            mobileComponent[fieldName] = desktopComponent[fieldName];
        }
    });
}

function mergeStructure(websiteStructure, mobileSiteStructure, pageId: string, componentIdsExplicitlyDeletedFromMobileSite?, settings?: StructurePreprocessorSettings) {
    var componentIdsDeletedFromWebStructure;
    var componentIdsAddedToWebStructure;
    var addedMobileOnlyComponents;
    var potentialModifiedComponents;

    const MOBILE = true;
    var webComponents = dataUtils.getAllCompsInStructure(websiteStructure, !MOBILE, _.negate(conversionUtils.isDesktopOnlyComponent));
    var mobileComponents = dataUtils.getAllCompsInStructure(mobileSiteStructure);

    boxSlideShowLayoutHandler.handleSlideShowComponentsBeforeAlgorithm(websiteStructure);

    markPresentComponentsBeforeMerge(mobileSiteStructure);
    updateComponentsStyles(websiteStructure, mobileSiteStructure);

    const implicitlyHiddenDescendants = getImplicitlyHiddenDescendants(webComponents, componentIdsExplicitlyDeletedFromMobileSite);
    componentIdsDeletedFromWebStructure = _.union(structuresComparer.getComponentIdsDeletedFromWebStructure(webComponents, mobileComponents), implicitlyHiddenDescendants);

    const hiddenComponents = _.union(implicitlyHiddenDescendants, componentIdsExplicitlyDeletedFromMobileSite);
    componentIdsAddedToWebStructure = structuresComparer.getComponentIdsAddedToWebStructure(webComponents, mobileComponents, hiddenComponents);

    const areComponentsAddedOrDeleted = (componentIdsDeletedFromWebStructure.length > 0 || componentIdsAddedToWebStructure.length > 0);

    ensureDataQueriesAreEqualToDesktop(websiteStructure, mobileSiteStructure);

    if (areComponentsAddedOrDeleted) {
        addAndDeleteComponentsFromMobileStructure(mobileSiteStructure, componentIdsDeletedFromWebStructure, settings, componentIdsAddedToWebStructure, websiteStructure);
    }

    addedMobileOnlyComponents = mobileOnlyComponentsHandler.addMobileOnlyComponentsOnMerge(hiddenComponents, mobileSiteStructure);

    if (areComponentsAddedOrDeleted || !_.isEmpty(addedMobileOnlyComponents)) {
        potentialModifiedComponents = componentIdsAddedToWebStructure.concat(addedMobileOnlyComponents);
        if (!experiment.isOpen('removeJsonAnchors')) {
            anchorsCalculator.updateAnchorsAfterMerge(mobileSiteStructure, componentIdsDeletedFromWebStructure, potentialModifiedComponents);
        }
    }

    boxSlideShowLayoutHandler.fixSlideShowComponentsFromMobilePage(pageId, mobileSiteStructure, websiteStructure, areComponentsAddedOrDeleted);

    unmarkPresentComponentsBeforeMerge(mobileSiteStructure);
}

function rejectFixedPositionCompsNonConvertibleToMobile(compIdList, websiteStructure) {
    return _.reject(compIdList, (id: string) => {
        const comp = conversionUtils.getComponentByIdFromStructure(id, websiteStructure);
        return _.get(comp, ['layout', 'fixedPosition']) && !_.get(comp, ['conversionData', 'convertFixedPositionToAbsolute']);
    });
}

function addAndDeleteComponentsFromMobileStructure(mobileSiteStructure, componentIdsDeletedFromWebStructure, settingsOverrides: StructurePreprocessorSettings, componentIdsAddedToWebStructure, websiteStructure) {
    const settings: StructurePreprocessorSettings = _.assign({
        keepOccludedAndEmptyBackgrounds: true,
        keepNotRecommendedMobileComponents: true,
        keepEmptyTextComponents: true,
        keepOutOfScreenComponents: true
    }, settingsOverrides);
    const addList = settings.keepNotRecommendedMobileComponents ? componentIdsAddedToWebStructure : rejectFixedPositionCompsNonConvertibleToMobile(componentIdsAddedToWebStructure, websiteStructure);

    structureAnalyzer.identifyBlocks(mobileSiteStructure);
    deleteComponentsFromMobileStructure(mobileSiteStructure, componentIdsDeletedFromWebStructure, addList);
    addComponentsToMobileStructure(mobileSiteStructure, websiteStructure, addList, settings);

    if (conversionUtils.isContainer(mobileSiteStructure) || conversionUtils.isPageComponent(mobileSiteStructure)) {
        conversionUtils.ensureContainerTightlyWrapsChildren(mobileSiteStructure, conversionUtils.getChildren(mobileSiteStructure), true);
    }
}

function markPresentComponentsBeforeMerge(component) {
    if (component.layout) {
        component.existsBeforeMerge = true;
    }

    _.forEach(conversionUtils.getChildren(component), markPresentComponentsBeforeMerge);
}

function unmarkPresentComponentsBeforeMerge(component) {
    delete component.existsBeforeMerge;
    _.forEach(conversionUtils.getChildren(component), unmarkPresentComponentsBeforeMerge);
}

function addComponentsToMobileStructure(mobileSiteStructure, websiteStructure, componentIdsAddedToWebStructure, settings: StructurePreprocessorSettings) {
    var websiteStructureClone = objectUtils.cloneDeep(websiteStructure);
    var componentForestToBeAdded;
    var componentsToInsertMap;
    var componentsToInsertClusteredMap;
    var comps = <ComponentWithConversionData[]> conversionUtils.getChildren(websiteStructureClone);

    structurePreprocessor.preProcessStructure(websiteStructureClone, comps, settings);

    var addedGroupIds = addGroupsOfPartlyExistingComponentsInMobile(componentIdsAddedToWebStructure, websiteStructureClone, mobileSiteStructure);
    if (!_.isEmpty(addedGroupIds)) {
        structureAnalyzer.identifyBlocks(mobileSiteStructure);
    }

    componentForestToBeAdded = convertAddedComponentIdsListToComponentForest(componentIdsAddedToWebStructure, websiteStructureClone);

    virtualGroupHandler.addVirtualGroupsToStructure(websiteStructureClone, comps);
    structureAnalyzer.analyzeStructure(websiteStructureClone, comps);

    if (!_.isEmpty(componentIdsAddedToWebStructure)) {
        componentsToInsertMap = mapComponentsToAddToTheirFutureContainerAndPreceder(websiteStructureClone, websiteStructureClone, mobileSiteStructure, componentForestToBeAdded);
        virtualGroupHandler.flattenComponentsToInsertFromVirtualGroups(componentsToInsertMap, componentIdsAddedToWebStructure);
        componentsToInsertClusteredMap = clusterComponentsToInsertMap(componentsToInsertMap);
        deleteExistingComponentsWhichWillBeAddedWithTheirNewContainer(mobileSiteStructure, componentsToInsertClusteredMap, componentIdsAddedToWebStructure);
        insertComponentsToMobileStructure(componentsToInsertClusteredMap, websiteStructure, settings);
    }
    [].splice.apply(componentIdsAddedToWebStructure, [componentIdsAddedToWebStructure.length, 0].concat(addedGroupIds));
}

function addGroupsOfPartlyExistingComponentsInMobile(componentIdsAddedToWebStructure, websiteStructureClone, mobileSiteStructure: PageComponent | MasterPageComponent) {
    var addedGroupIds = [];
    var i, j;
    for (i = componentIdsAddedToWebStructure.length - 1; i >= 0; i--) {
        var curCompIdToBeAdded = componentIdsAddedToWebStructure[i];
        var curCompToBeAdded = <Component> conversionUtils.getComponentByIdFromStructure(curCompIdToBeAdded, websiteStructureClone);
        if (conversionUtils.isGroupComponent(curCompToBeAdded)) {
            const allComps: Component[][] = _.partition(curCompToBeAdded.components, groupedComp => _.includes(componentIdsAddedToWebStructure, groupedComp.id));
            const componentIdsOfGroupThatWillBeAddedToMobile = _.map(allComps[0], 'id');
            const componentsOfGroupThatAlreadyExistInMobile = <Component[]> _(allComps[1])
                .map(groupedComp => conversionUtils.getComponentByIdFromStructure(groupedComp.id, mobileSiteStructure))
                .compact()
                .value();

            var allMobileCompsHaveSameParent = true;
            for (j = 1; j < componentsOfGroupThatAlreadyExistInMobile.length; j++) {
                var parent1 = conversionUtils.getParent(componentsOfGroupThatAlreadyExistInMobile[j - 1].id, mobileSiteStructure);
                var parent2 = conversionUtils.getParent(componentsOfGroupThatAlreadyExistInMobile[j].id, mobileSiteStructure);
                if (parent1.id !== parent2.id) {
                    allMobileCompsHaveSameParent = false;
                }
            }

            //caseA: some of grouped Components exist in mobile, but got different parents -> don't add group to mobile
            if (!allMobileCompsHaveSameParent) {
                componentIdsAddedToWebStructure.splice(i, 1);
                continue;
            }

            //caseB: mobile will have less of two components in the group -> don't add groups
            if (componentIdsOfGroupThatWillBeAddedToMobile.length + componentsOfGroupThatAlreadyExistInMobile.length < 2) {
                componentIdsAddedToWebStructure.splice(i, 1);
                continue;
            }

            //caseC: no grouped comp exists in mobile - add them all as a whole:
            if (componentsOfGroupThatAlreadyExistInMobile.length === 0) {
                continue;
            }

            //caseD: some of the grouped comps already in mobile, and at the end there will be more than 2 --> add the group now.
            var clonedGroupComp = <Component> _.clone(curCompToBeAdded);
            clonedGroupComp.components = [];
            clonedGroupComp.layout = conversionUtils.getSnugLayout(componentsOfGroupThatAlreadyExistInMobile);
            var groupMobileParent = conversionUtils.getParent(componentsOfGroupThatAlreadyExistInMobile[0].id, mobileSiteStructure);
            conversionUtils.addComponentsTo(groupMobileParent, [clonedGroupComp]);

            for (j = 0; j < componentsOfGroupThatAlreadyExistInMobile.length; j++) {
                var mobileComponent = componentsOfGroupThatAlreadyExistInMobile[j];
                conversionUtils.reparentComponent(clonedGroupComp, mobileComponent);
                _.remove(conversionUtils.getChildren(groupMobileParent), mobileComponent);
            }

            addedGroupIds.push(componentIdsAddedToWebStructure[i]);
            componentIdsAddedToWebStructure.splice(i, 1);
        }
    }

    return addedGroupIds;
}


function deleteExistingComponentsWhichWillBeAddedWithTheirNewContainer(mobileSiteStructure, componentsToInsertClusteredMap, componentIdsAddedToWebStructure) {
    var existingComponentIdsThatWereAttachedToNewContainer = getExistingComponentIdsThatWereAttachedToNewContainer(componentsToInsertClusteredMap, componentIdsAddedToWebStructure);

    deleteComponentsFromMobileStructure(mobileSiteStructure, existingComponentIdsThatWereAttachedToNewContainer);
}

function getExistingComponentIdsThatWereAttachedToNewContainer(componentsToInsertClusteredMap, componentIdsAddedToWebStructure) {
    var i;
    var j;
    var ret = [];
    var componentsToAdd;
    var curComponentToAdd;
    var curComponentSubComponentIds;
    var componentsToAddAlreadyExistInMobile;

    for (i = 0; i < componentsToInsertClusteredMap.length; i++) {
        componentsToAdd = componentsToInsertClusteredMap[i].componentToAdd;

        for (j = 0; j < componentsToAdd.length; j++) {
            curComponentToAdd = componentsToAdd[j];
            componentsToAddAlreadyExistInMobile = _.difference(getCompsIds(curComponentToAdd), componentIdsAddedToWebStructure);
            ret = ret.concat(componentsToAddAlreadyExistInMobile);
        }
    }

    return ret;
}

function getLowestChild(container: Component | MasterPageComponent): Component {
    var i;
    var children = conversionUtils.getChildren(container);
    var lowestChild;
    var lowestChildBottom;
    var curChild;

    if (children) {
        lowestChildBottom = -Number.MAX_VALUE;

        for (i = 0; i < children.length; i++) {
            curChild = children[i];

            if (curChild.layout.y + curChild.layout.height > lowestChildBottom) {
                lowestChild = curChild;
                lowestChildBottom = curChild.layout.y + curChild.layout.height;
            }
        }

        return lowestChild;
    }
}
function insertComponentsToMobileStructure(componentsToInsertClustered, websiteStructure, settings: StructurePreprocessorSettings) {
    var i;
    var componentsToAdd;
    var futureMobileContainerOfAddedComponent;
    var previousComponentIdThatAlsoExistInMobile;
    var virtualGroup;

    for (i = 0; i < componentsToInsertClustered.length; i++) {
        componentsToAdd = componentsToInsertClustered[i].componentToAdd;
        futureMobileContainerOfAddedComponent = componentsToInsertClustered[i].futureMobileContainerOfAddedComponent;
        previousComponentIdThatAlsoExistInMobile = componentsToInsertClustered[i].previousComponentIdThatAlsoExistInMobile;
        virtualGroup = virtualGroupHandler.createVirtualGroup(componentsToAdd, true);

        structurePreprocessor.preProcessStructure(virtualGroup, virtualGroup.components, settings);

        virtualGroupHandler.addVirtualGroupsToStructure(virtualGroup, virtualGroup.components);
        structureAnalyzer.analyzeStructure(virtualGroup, virtualGroup.components);
        virtualGroup.layout.x = 0;
        virtualGroup.layout.width = conversionUtils.isPageComponent(futureMobileContainerOfAddedComponent) || conversionUtils.isScreenWidthComponent(futureMobileContainerOfAddedComponent) || conversionUtils.isMasterPage(futureMobileContainerOfAddedComponent) ? conversionConfig.MOBILE_WIDTH : futureMobileContainerOfAddedComponent.layout.width;
        structureConverter.reorganizeChildren(virtualGroup, futureMobileContainerOfAddedComponent, virtualGroup.layout.width);
        structureConverter.rescaleComponentHeight(virtualGroup, {scaleFactor: 1});
        insertAddedComponentBetweenBlocks(futureMobileContainerOfAddedComponent, virtualGroup, previousComponentIdThatAlsoExistInMobile);
        ensureContainerWrapsChildren(futureMobileContainerOfAddedComponent);
        virtualGroupHandler.replaceBackGroupsToFlatComponents(futureMobileContainerOfAddedComponent, futureMobileContainerOfAddedComponent.components || futureMobileContainerOfAddedComponent.children);
        structureAnalyzer.identifyBlocks(futureMobileContainerOfAddedComponent);
    }
}

function addChildrenOfDeletedContainersToAddList(componentsToDeleteFromCurrentComponent, componentIdsAddedToWebStructure, componentIdsDeletedFromWebStructure) {
    var i;
    var j;
    var curComponentToDelete;
    var curChildIdOfComponentToDelete;

    for (i = 0; i < componentsToDeleteFromCurrentComponent.length; i++) {
        curComponentToDelete = componentsToDeleteFromCurrentComponent[i];

        if (conversionUtils.isContainer(curComponentToDelete)) {
            for (j = 0; j < curComponentToDelete.components.length; j++) {
                curChildIdOfComponentToDelete = curComponentToDelete.components[j].id;

                if (componentIdsDeletedFromWebStructure.indexOf(curChildIdOfComponentToDelete) === -1) { //eslint-disable-line lodash/prefer-includes
                    componentIdsAddedToWebStructure.push(curChildIdOfComponentToDelete);
                }
            }
        }
    }
}

function deleteComponentsFromMobileStructure(component, componentIdsDeletedFromWebStructure, componentIdsAddedToWebStructure?) {
    componentIdsAddedToWebStructure = componentIdsAddedToWebStructure || [];
    var children = component.components || component.children;
    var childrenIds;
    var componentIdsToDeleteFromCurrentComponent;
    var componentsToDeleteFromCurrentComponent;
    var willLowestChildBeDeleted;

    if (children) {
        removeGroupChildren(componentIdsDeletedFromWebStructure, component, children);

        childrenIds = _.pluck(children, 'id');
        componentIdsToDeleteFromCurrentComponent = _.intersection(componentIdsDeletedFromWebStructure, childrenIds);
        componentsToDeleteFromCurrentComponent = conversionUtils.getComponentsByIds(component, componentIdsToDeleteFromCurrentComponent);


        addChildrenOfDeletedContainersToAddList(componentsToDeleteFromCurrentComponent, componentIdsAddedToWebStructure, componentIdsDeletedFromWebStructure);

        if (componentsToDeleteFromCurrentComponent.length > 0) {
            willLowestChildBeDeleted = componentsToDeleteFromCurrentComponent.map(function (comp) { //eslint-disable-line lodash/prefer-includes
                    return comp.id;
                }).indexOf(getLowestChild(component).id) > -1;

            conversionUtils.removeChildrenFrom(component, componentsToDeleteFromCurrentComponent);
            updateBlocksAndModifyLayoutIfNeeded(component, componentIdsToDeleteFromCurrentComponent);

            if (willLowestChildBeDeleted) {
                conversionUtils.ensureContainerTightlyWrapsChildren(component, children, true, 50);
            }
        }

        _.forEach(children, function (child) {
            deleteComponentsFromMobileStructure(child, componentIdsDeletedFromWebStructure, componentIdsAddedToWebStructure);
        });
    }
}

function removeGroupChildren(componentIdsDeletedFromWebStructure: string[], parent: ComponentWithConversionData, children: Component[]) {
    var childrenIds = _.pluck(children, 'id');
    _.forEachRight(componentIdsDeletedFromWebStructure, (curCompIdToBeDeleted, i) => {
        if (_.includes(childrenIds, curCompIdToBeDeleted)) {
            return;
        }

        const curCompToBeDeleted = conversionUtils.getComponentsByIds(parent, [curCompIdToBeDeleted])[0];
        if (!conversionUtils.isGroupComponent(curCompToBeDeleted)) {
            return;
        }

        conversionUtils.removeGroup(curCompToBeDeleted, parent);
        structureAnalyzer.identifyBlocks(parent);
    });
}

/////////////////////////////////////////////////////////////
// calculating add list
/////////////////////////////////////////////////////////////

function clusterComponentsToInsertMap(componentsToInsert) {
    var j;
    var componentsToInsertClustered = [];
    var wasClustered;
    var isSimilarCluster;

    _.forEach(componentsToInsert, comp => {
        wasClustered = false;

        for (j = 0; j < componentsToInsertClustered.length; j++) {
            isSimilarCluster = (comp.futureMobileContainerOfAddedComponent ===
            componentsToInsertClustered[j].futureMobileContainerOfAddedComponent &&
            comp.previousComponentIdThatAlsoExistInMobile ===
            componentsToInsertClustered[j].previousComponentIdThatAlsoExistInMobile);

            if (!isSimilarCluster) {
                continue;
            }

            componentsToInsertClustered[j].componentToAdd = componentsToInsertClustered[j].componentToAdd.concat(comp.componentToAdd);
            wasClustered = true;
            break;
        }

        if (!wasClustered) {
            componentsToInsertClustered.push(comp);
        }
    });

    return componentsToInsertClustered;
}

function mapComponentsToAddToTheirFutureContainerAndPreceder(currentComponentRoot: ComponentWithConversionData | MasterPageComponentWithConversionData, websiteStructure: ComponentWithConversionData | MasterPageComponentWithConversionData, mobileSiteStructure: ComponentWithConversionData | MasterPageComponentWithConversionData, componentForestToBeAdded) {
    var i;
    var j;
    var k;
    var currentComponentRootChildren = conversionUtils.getChildren(currentComponentRoot);
    var componentsToInsert = [];
    var componentForestIds;
    var curChild;
    var curChildId;
    var isCurComponentInAddList;
    var idInForestToBeAdded;
    var componentToAdd;
    var previousComponentIdThatAlsoExistInMobile;
    var futureMobileContainerOfAddedComponent;

    if (currentComponentRootChildren) {
        componentForestIds = componentForestToBeAdded.map(function (comp) {
            return comp.id;
        });

        for (i = 0; i < currentComponentRootChildren.length; i++) {
            curChild = currentComponentRootChildren[i];
            curChildId = curChild.id;
            isCurComponentInAddList = false;

            if (componentForestIds.indexOf(curChildId) >= 0) { //eslint-disable-line lodash/prefer-includes
                isCurComponentInAddList = true;
                idInForestToBeAdded = -1;

                for (k = 0; k < componentForestToBeAdded.length; k++) {
                    if (componentForestToBeAdded[k].id === curChildId) {
                        idInForestToBeAdded = k;
                        break;
                    }
                }

                //componentForestToBeAdded.splice(i, 1); // TODO: talk with Roni about this
                componentForestToBeAdded.splice(idInForestToBeAdded, 1);
            }

            if (virtualGroupHandler.isVirtualGroup(curChild)) {
                for (j = 0; j < curChild.components.length; j++) {
                    if (componentForestIds.indexOf(curChild.components[j].id) > -1) { //eslint-disable-line lodash/prefer-includes
                        isCurComponentInAddList = true;
                        idInForestToBeAdded = -1;

                        for (k = 0; k < componentForestToBeAdded.length; k++) {
                            if (componentForestToBeAdded[k].id === curChild.components[j].id) {
                                idInForestToBeAdded = k;
                                break;
                            }
                        }

                        componentForestToBeAdded.splice(idInForestToBeAdded, 1);
                    }
                }
            }

            if (isCurComponentInAddList) {
                componentToAdd = curChild;
                previousComponentIdThatAlsoExistInMobile = structuresComparer.getPreviousComponentIdThatAlsoExistInMobile(currentComponentRoot, <Component>websiteStructure, curChildId, <Component>mobileSiteStructure);
                if (previousComponentIdThatAlsoExistInMobile) {
                    futureMobileContainerOfAddedComponent = conversionUtils.getParent(previousComponentIdThatAlsoExistInMobile, mobileSiteStructure);
                } else {
                    futureMobileContainerOfAddedComponent = structuresComparer.getAncestorContainerExistingInMobile(curChildId, websiteStructure, mobileSiteStructure);
                }

                componentsToInsert.push({
                    componentToAdd: [componentToAdd],
                    futureMobileContainerOfAddedComponent: futureMobileContainerOfAddedComponent,
                    previousComponentIdThatAlsoExistInMobile: previousComponentIdThatAlsoExistInMobile
                });

            }
        }

        for (i = 0; i < currentComponentRootChildren.length; i++) {
            componentsToInsert = componentsToInsert.concat(mapComponentsToAddToTheirFutureContainerAndPreceder(<ComponentWithConversionData>(currentComponentRootChildren[i]), websiteStructure, mobileSiteStructure, componentForestToBeAdded));
        }
    }

    return componentsToInsert;
}

//used once
function convertAddedComponentIdsListToComponentForest(componentIdsAddedToWebStructure: string[], websiteStructure: ComponentWithConversionData) {
    var j;
    var compClone;
    var clonedComponentsAddedToWebStructure = [];
    var componentForest = [];
    var potentialParent;
    var potentialParentWithChildrenInfo;

    var componentsAddedToWebStructure = componentIdsAddedToWebStructure.map(function (compId) {
        return conversionUtils.getComponentByIdFromStructure(compId, websiteStructure);
    });

    componentsAddedToWebStructure = _.without(componentsAddedToWebStructure, null);

    if (_.isEmpty(componentsAddedToWebStructure)) {
        return componentForest;
    }

    clonedComponentsAddedToWebStructure = componentsAddedToWebStructure.map(comp => {
        compClone = objectUtils.cloneDeep(comp);
        clearIdentificationsAndChildrenFromAddedComponent(compClone);
        return compClone;
    });

    _.forEachRight(clonedComponentsAddedToWebStructure, potentialChild => {
        var hasParent = false;
        for (j = clonedComponentsAddedToWebStructure.length - 1; j >= 0; j--) {
            potentialParent = clonedComponentsAddedToWebStructure[j];
            potentialParentWithChildrenInfo = componentsAddedToWebStructure[j];

            if (areDirectParentAndChild(potentialChild, potentialParentWithChildrenInfo)) {
                hasParent = true;
                conversionUtils.reparentComponent(potentialParent, potentialChild);
                break;
            }
        }
        if (!hasParent) { // This is a tree root
            componentForest.push(potentialChild);
        }
    });

    return componentForest;
}

function clearIdentificationsAndChildrenFromAddedComponent(component: ComponentWithConversionData) {
    if (!conversionUtils.getChildren(component)) {
        return;
    }
    component.components = [];
    _.assign(component.conversionData, {blocks: [], blockLayout: [], componentsOrder: []});
}

function updateBlocksAndModifyLayoutIfNeeded(component: ComponentWithConversionData, componentIdsToDeleteFromCurrentComponent: string[]) {
    const compBlocks =  _.get(component, ['conversionData', 'blocks'], []);

    const updatedBlocks = _.transform(compBlocks, (result, block, i) => {
        const blockSizeBeforeUpdate = block.length;
        component.conversionData.blocks[i] = _.difference(block, componentIdsToDeleteFromCurrentComponent);

        if (blockSizeBeforeUpdate !== component.conversionData.blocks[i].length) {
            result.push(i);
        }
    }, []);

    _.forEachRight(compBlocks, (block, i) => {
        if (_.includes(updatedBlocks, i)) {
            if (_.isEmpty(component.conversionData.blocks[i])) {
                shiftUpComponentsLowerThanDeletedBlock(component, i);
                component.conversionData.blocks.splice(i, 1);
                component.conversionData.blockLayout.splice(i, 1);
            }
            return;
        }

        const oldBlockLayout = component.conversionData.blockLayout[i];
        const blockComps = conversionUtils.getComponentsByIds(component, component.conversionData.blocks[i]);
        const newBlockLayout = conversionUtils.getSnugLayout(blockComps);
        component.conversionData.blockLayout[i] = newBlockLayout;
        const blockLayoutYDiff = newBlockLayout.y - oldBlockLayout.y;

        if (blockLayoutYDiff !== 0) {
            shiftComponentsLowerThanBlock(component, i - 1, -blockLayoutYDiff);
        }

        const blockLayoutHeightDiff = oldBlockLayout.height - component.conversionData.blockLayout[i].height;
        const shiftNeededAfterYChange = blockLayoutHeightDiff - blockLayoutYDiff;

        if (blockLayoutHeightDiff !== 0) {
            shiftComponentsLowerThanBlock(component, i, -shiftNeededAfterYChange);
        }
    });
}

function shiftUpComponentsLowerThanDeletedBlock(container: ComponentWithConversionData, deletedBlockNumber: number) {
    shiftComponentsLowerThanBlock(container, deletedBlockNumber, -(container.conversionData.blockLayout[deletedBlockNumber].height + conversionConfig.COMPONENT_MOBILE_MARGIN_Y));
}

function updateComponentsStyles(webStructure: Component, mobileComponentJson: Component) {
    var webComponent = <Component> conversionUtils.getComponentByIdFromStructure(mobileComponentJson.id, webStructure);

    const styleId = _.get(webComponent, 'styleId');
    if (styleId) {
        _.set(mobileComponentJson, 'styleId', styleId);
    }

    _.forEach(conversionUtils.getChildren(mobileComponentJson), updateComponentsStyles.bind(null, webStructure));
}

function getImplicitlyHiddenDescendants(allDesktopComponents: Map<Component | ComponentWithConversionData>, hiddenComponentIds?: string[]): string[] {
    if (_.isEmpty(hiddenComponentIds)) {
        return [];
    }

    const allHiddenComponents = <string[]> _(hiddenComponentIds)
        .map(compId => allDesktopComponents[compId])
        .compact()
        .filter('conversionData.filterChildrenWhenHidden', true)
        .map(comp => _.map(dataUtils.getAllCompsInStructure(comp, false) || [], 'id'))
        .flatten()
        .uniq()
        .value();

    return _.difference(allHiddenComponents, hiddenComponentIds);
}

export {
    mergeStructure
};