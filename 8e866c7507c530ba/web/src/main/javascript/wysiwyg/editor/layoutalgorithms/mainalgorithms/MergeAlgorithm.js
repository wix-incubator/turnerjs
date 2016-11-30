define.Class('wysiwyg.editor.layoutalgorithms.mainalgorithms.MergeAlgorithm', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        initialize: function(modules) {
            this._utils = modules.$utils;
            this._config = modules.$config;
            this._structurePreprocessor = modules.$structurePreprocessor;
            this._structureAnalyzer = modules.$structureAnalyzer;
            this._virtualGroupHandler = modules.$virtualGroupHandler;
            this._structureConverter = modules.$structureConverter;
            this._anchorsCalculator = modules.$anchorsCalculator;
            this._multiLayoutComponentPropertyHandler = modules.$multiLayoutComponentPropertyHandler;
            this._multiLayoutTextMigrationHandler = modules.$multiLayoutTextMigrationHandler;
            this._conversionAlgorithm = modules.$conversionAlgorithm;
            this._mobileOnlyComponentsHandler = modules.$mobileOnlyComponentsHandler;
            this._structuresComparer = modules.$structuresComparer;
        },

       /////////////////////////////////////////////////////////////
        // principal merge methods
        /////////////////////////////////////////////////////////////

        runMobileMergeAlgorithm: function(serializedWebsite, serializedMobileSite, mobileDeletedCompIdMap, ignoreNotRecommendedComponents) {
            var serializedWebsiteClone = serializedWebsite;
            var serializedMobileSiteClone = _.cloneDeep(serializedMobileSite);
            var componentIdsExplicitlyDeletedFromMobileSite = mobileDeletedCompIdMap ? this._convertCompIdMapToArray(mobileDeletedCompIdMap) : [];

            this._runMobileMergeAlgorithmOnMasterPage(serializedWebsiteClone, serializedMobileSiteClone, componentIdsExplicitlyDeletedFromMobileSite, ignoreNotRecommendedComponents);
            this._addAndDeletePagesInMobileAccoringToWebsite(serializedWebsiteClone.pages, serializedMobileSiteClone.pages);
            this._runMobileMergeAlgorithmOnPages(serializedMobileSiteClone, serializedWebsiteClone, componentIdsExplicitlyDeletedFromMobileSite, ignoreNotRecommendedComponents);
            return serializedMobileSiteClone;
        },

        _convertCompIdMapToArray: function(deletedCompMap) {
            return _.reduce(_.values(deletedCompMap), function(resultedArr, currentArr) {
                return resultedArr.concat(currentArr);
            });
        },

        _runMobileMergeAlgorithmOnMasterPage: function (serializedWebsiteClone, serializedMobileSiteClone, componentIdsExplicitlyDeletedFromMobileSite, ignoreNotRecommendedComponents) {
            var websiteStructure = serializedWebsiteClone.masterPage;
            var mobileSiteStructure = serializedMobileSiteClone.masterPage;

            this._structurePreprocessor._handleNonHeaderOrFooterMasterPageComponents(websiteStructure);

            this._applyWebStructureModificationsOnMobileStructure(websiteStructure, mobileSiteStructure, componentIdsExplicitlyDeletedFromMobileSite, ignoreNotRecommendedComponents);
        },

        _runMobileMergeAlgorithmOnPages: function (serializedMobileSiteClone, serializedWebsiteClone, componentIdsExplicitlyDeletedFromMobileSite, ignoreNotRecommendedComponents) {
            var mobilePages = _.values(serializedMobileSiteClone.pages);
            var websitePages = _.values(serializedWebsiteClone.pages);

            for (var i = 0; i < mobilePages.length; i++) {
                var mobilePage = mobilePages[i];
                for (var j = 0; j < websitePages.length; j++) {
                    var webPage = websitePages[j];
                    if (mobilePage.id == webPage.id) {
                        break;
                    }
                }
                this._applyWebStructureModificationsOnMobileStructure(webPage, mobilePage, componentIdsExplicitlyDeletedFromMobileSite, ignoreNotRecommendedComponents);
            }
        },

        _applyWebStructureModificationsOnMobileStructure: function(websiteStructure, mobileSiteStructure, componentIdsExplicitlyDeletedFromMobileSite, ignoreNotRecommendedComponents) {
            this._markPresentComponentsBeforeMerge(mobileSiteStructure);
            this._updateComponentsStyles(websiteStructure, mobileSiteStructure);

            var componentIdsDeletedFromWebStructure = this._structuresComparer._getComponentIdsDeletedFromWebStructure(websiteStructure, mobileSiteStructure);
            var componentIdsAddedToWebStructure = this._structuresComparer._getComponentIdsAddedToWebStructure(websiteStructure, mobileSiteStructure, componentIdsExplicitlyDeletedFromMobileSite);
            var areComponentsAddedOrDeleted = (componentIdsDeletedFromWebStructure.length > 0 || componentIdsAddedToWebStructure.length > 0);

            if (areComponentsAddedOrDeleted) {
                this._addAndDeleteComponentsFromMobileStructure(mobileSiteStructure, componentIdsDeletedFromWebStructure, ignoreNotRecommendedComponents, componentIdsAddedToWebStructure, websiteStructure);
            }

            this._multiLayoutComponentPropertyHandler.updateComponentProperties(websiteStructure, mobileSiteStructure);
            this._multiLayoutTextMigrationHandler.fixTextCompDataQueries(websiteStructure, mobileSiteStructure);

            var addedMobileOnlyComponents = this._mobileOnlyComponentsHandler.addMobileOnlyComponentsOnMerge(componentIdsExplicitlyDeletedFromMobileSite, mobileSiteStructure);

            if (areComponentsAddedOrDeleted || addedMobileOnlyComponents) {
                var potentialModifiedComponents = componentIdsAddedToWebStructure.concat(addedMobileOnlyComponents);
                this._config.activateExtraOperationsForComponentClassName(mobileSiteStructure, potentialModifiedComponents);
                this._anchorsCalculator.updateAnchorsAfterMerge(mobileSiteStructure, componentIdsDeletedFromWebStructure, potentialModifiedComponents);
                this._structureAnalyzer.cleanUpAlgorithmProperties(mobileSiteStructure);
            }
            this._unmarkPresentComponentsBeforeMerge(mobileSiteStructure);
        },

        _addAndDeleteComponentsFromMobileStructure: function (mobileSiteStructure, componentIdsDeletedFromWebStructure, ignoreNotRecommendedComponents, componentIdsAddedToWebStructure, websiteStructure) {
            this._structureAnalyzer.identifyBlocks(mobileSiteStructure);
            this._deleteComponentsFromMobileStructure(mobileSiteStructure, componentIdsDeletedFromWebStructure, componentIdsAddedToWebStructure);

            if (ignoreNotRecommendedComponents) {
                this._filterComponentIdListFromNotRecommendedComponentsForMobile(componentIdsAddedToWebStructure, websiteStructure);
            }

            this._addComponentsToMobileStructure(mobileSiteStructure, websiteStructure, componentIdsAddedToWebStructure, componentIdsDeletedFromWebStructure);
        },

        _filterComponentIdListFromNotRecommendedComponentsForMobile: function(componentIdList, websiteStructure) {
            this._utils.filterComponentIdList(componentIdList, websiteStructure, this._config.isNonMobileRecommendedComponent.bind(this._config));
            this._filterComponentIdListFromEmptyTextComponents(componentIdList, websiteStructure);
        },

        _filterComponentIdListFromEmptyTextComponents: function(componentIdList, websiteStructure){
            for (var i=componentIdList.length-1; i>=0; i--) {
                var curCompId = componentIdList[i];
                var curComp = this._utils.getComponentByIdFromStructure(curCompId, websiteStructure);
                if (this._utils.isTextComponent(curComp) && this._utils.getTextLength(curComp)===0) {
                    componentIdList.splice(componentIdList.indexOf(curCompId),1);
                }
            }
        },

        //used once
        _markPresentComponentsBeforeMerge: function(component) {
            if (component.layout) {
                component.existsBeforeMerge = true;
            }
            var children = component.components || component.children;
            if (children) {
                for (var i=0; i<children.length; i++) {
                    this._markPresentComponentsBeforeMerge(children[i]);
                }
            }
        },

        //used once
        _unmarkPresentComponentsBeforeMerge: function(component) {
            delete component.existsBeforeMerge;

            var children = component.components || component.children;
            if (children) {
                for (var i=0; i<children.length; i++) {
                    this._unmarkPresentComponentsBeforeMerge(children[i]);
                }
            }
        },

        _addComponentsToMobileStructure: function(mobileSiteStructure, websiteStructure, componentIdsAddedToWebStructure, componentIdsExplicitlyDeletedFromMobileSite) {

            var websiteStructureClone = _.cloneDeep(websiteStructure);

            this._structurePreprocessor.preProcessStructure(websiteStructureClone, componentIdsExplicitlyDeletedFromMobileSite, {keepNotRecommendedMobileComponents: true, keepEmptyTextComponents:true, keepOutOfScreenComponents:true});

            var componentForestToBeAdded = this._convertAddedComponentIdsListToComponentForest(componentIdsAddedToWebStructure, websiteStructureClone);

            this._virtualGroupHandler.addVirtualGroupsToStructure(websiteStructureClone);
            this._structureAnalyzer.analyzeStructure(websiteStructureClone);

            if (componentIdsAddedToWebStructure.length===0) {
                return;
            }

            var componentsToInsertMap = this._mapComponentsToAddToTheirFutureContainerAndPreceder(websiteStructureClone, websiteStructureClone, mobileSiteStructure, componentForestToBeAdded);
            this._virtualGroupHandler.flattenComponentsToInsertFromVirtualGroups(componentsToInsertMap, componentIdsAddedToWebStructure);
            var componentsToInsertClusteredMap = this._clusterComponentsToInsertMap(componentsToInsertMap);

            this._deleteExistingComponentsWhichWillBeAddedWithTheirNewContainer(mobileSiteStructure, componentsToInsertClusteredMap, componentIdsAddedToWebStructure);

            this._insertComponentsToMobileStructure(componentsToInsertClusteredMap);
        },

        //used once
        _deleteExistingComponentsWhichWillBeAddedWithTheirNewContainer: function(mobileSiteStructure, componentsToInsertClusteredMap, componentIdsAddedToWebStructure) {
            var existingComponentIdsThatWereAttachedToNewContainer = this._getExistingComponentIdsThatWereAttachedToNewContainer(componentsToInsertClusteredMap, componentIdsAddedToWebStructure);
            this._deleteComponentsFromMobileStructure(mobileSiteStructure, existingComponentIdsThatWereAttachedToNewContainer);

        },

        //used once
        _getExistingComponentIdsThatWereAttachedToNewContainer: function(componentsToInsertClusteredMap, componentIdsAddedToWebStructure) {
            var ret = [];
            for (var i = 0; i < componentsToInsertClusteredMap.length; i++) {
                var componentsToAdd = componentsToInsertClusteredMap[i].componentToAdd;
                for (var j=0; j<componentsToAdd.length; j++) {
                    var curComponentToAdd = componentsToAdd[j];
                    var curComponentSubComponentIds= this._utils.getStructureComponentIds(curComponentToAdd);
                    var componentsToAddAlreadyExistInMobile = _.difference(curComponentSubComponentIds, componentIdsAddedToWebStructure);
                    ret = ret.concat(componentsToAddAlreadyExistInMobile);
                }
            }
            return ret;
        },


        _insertComponentsToMobileStructure: function (componentsToInsertClustered) {

            for (var i = 0; i < componentsToInsertClustered.length; i++) {
                var componentsToAdd = componentsToInsertClustered[i].componentToAdd;

                var futureMobileContainerOfAddedComponent = componentsToInsertClustered[i].futureMobileContainerOfAddedComponent;
                var previousComponentIdThatAlsoExistInMobile = componentsToInsertClustered[i].previousComponentIdThatAlsoExistInMobile;

                var virtualGroup = this._virtualGroupHandler.createVirtualGroup(componentsToAdd, true, futureMobileContainerOfAddedComponent);

                this._structurePreprocessor.preProcessStructure(virtualGroup, [], {keepNotRecommendedMobileComponents: true, keepEmptyTextComponents:true, keepOutOfScreenComponents:true});
                this._virtualGroupHandler.addVirtualGroupsToStructure(virtualGroup);
                this._structureAnalyzer.analyzeStructure(virtualGroup);

                virtualGroup.layout.x = 0;
                virtualGroup.layout.width = this._utils.isPageComponent(futureMobileContainerOfAddedComponent) || this._utils.isMasterPage(futureMobileContainerOfAddedComponent) ? this._config.MOBILE_WIDTH : futureMobileContainerOfAddedComponent.layout.width;

                this._structureConverter.reorganizeChildren(virtualGroup, virtualGroup.layout.width);

                this.insertAddedComponentBetweenBlocks(futureMobileContainerOfAddedComponent, virtualGroup, previousComponentIdThatAlsoExistInMobile);

                this._structureConverter.ensureContainerWrapsChildren(futureMobileContainerOfAddedComponent);


                this._virtualGroupHandler.replaceBackGroupsToFlatComponents(futureMobileContainerOfAddedComponent);
                this._structureAnalyzer.identifyBlocks(futureMobileContainerOfAddedComponent);
            }
        },

        _addChildrenOfDeletedContainersToAddList: function (componentsToDeleteFromCurrentComponent, componentIdsAddedToWebStructure, componentIdsDeletedFromWebStructure) {
            for (var i = 0; i < componentsToDeleteFromCurrentComponent.length; i++) {
                var curComponentToDelete = componentsToDeleteFromCurrentComponent[i];
                if (this._utils.isContainer(curComponentToDelete)) {
                    for (var j = 0; j < curComponentToDelete.components.length; j++) {
                        var curChildIdOfComponentToDelete = curComponentToDelete.components[j].id;
                        if (!componentIdsDeletedFromWebStructure.contains(curChildIdOfComponentToDelete)) {
                            componentIdsAddedToWebStructure.push(curChildIdOfComponentToDelete);
                        }
                    }
                }
            }
        },

        _deleteComponentsFromMobileStructure: function(component, componentIdsDeletedFromWebStructure, componentIdsAddedToWebStructure) {
            componentIdsAddedToWebStructure = componentIdsAddedToWebStructure || [];
            var children = component.components || component.children;
            if (!children) {
                return;
            }
            var childrenIds = _(children).map(function(component){return component.id;}).value();
            var componentIdsToDeleteFromCurrentComponent = _.intersection(componentIdsDeletedFromWebStructure, childrenIds);
            var componentsToDeleteFromCurrentComponent = this._utils.getComponentsFromIds(component, componentIdsToDeleteFromCurrentComponent);

            this._addChildrenOfDeletedContainersToAddList(componentsToDeleteFromCurrentComponent, componentIdsAddedToWebStructure, componentIdsDeletedFromWebStructure);

            if (componentsToDeleteFromCurrentComponent.length>0) {
                var willLowestChildBeDeleted = componentsToDeleteFromCurrentComponent.map(function(comp){return comp.id;}).contains(this._utils.getLowestChild(component).id);
                this._utils.removeComponentsFromContainer(component, componentsToDeleteFromCurrentComponent);
                this._updateBlocksAndModifyLayoutIfNeeded(component, componentIdsToDeleteFromCurrentComponent);
                if (willLowestChildBeDeleted){
                    this._structureConverter.ensureContainerTightlyWrapsChildren(component, true);
                }
            }

            for (var i=0; i<children.length; i++) {
                this._deleteComponentsFromMobileStructure(children[i], componentIdsDeletedFromWebStructure, componentIdsAddedToWebStructure);
            }

        },

        /////////////////////////////////////////////////////////////
        // calculating add list
        /////////////////////////////////////////////////////////////

        _clusterComponentsToInsertMap: function (componentsToInsert) {
            var componentsToInsertClustered = [];
            for (var i = 0; i < componentsToInsert.length; i++) {
                var wasClustered = false;
                for (var j = 0; j < componentsToInsertClustered.length; j++) {
                    var isSimilarCluster = (componentsToInsert[i].futureMobileContainerOfAddedComponent ==
                        componentsToInsertClustered[j].futureMobileContainerOfAddedComponent &&
                        componentsToInsert[i].previousComponentIdThatAlsoExistInMobile ==
                            componentsToInsertClustered[j].previousComponentIdThatAlsoExistInMobile);
                    if (isSimilarCluster) {
                        componentsToInsertClustered[j].componentToAdd = componentsToInsertClustered[j].componentToAdd.concat(componentsToInsert[i].componentToAdd);
                        wasClustered = true;
                        break;
                    }
                }
                if (!wasClustered) {
                    componentsToInsertClustered.push(componentsToInsert[i]);
                }
            }
            return componentsToInsertClustered;
        },


        _mapComponentsToAddToTheirFutureContainerAndPreceder: function (currentComponentRoot, websiteStructure, mobileSiteStructure, componentForestToBeAdded) {

            var currentComponentRootChildren = currentComponentRoot.components || currentComponentRoot.children;
            if (!currentComponentRootChildren) {
                return [];
            }

            var componentsToInsert = [];
            var componentForestIds = componentForestToBeAdded.map(function(comp) {return comp.id;});

            for (var i = 0; i < currentComponentRootChildren.length; i++) {

                var curChild = currentComponentRootChildren[i];
                var curChildId = curChild.id;

                var isCurComponentInAddList = false;
                if (componentForestIds.contains(curChildId)) {
                    isCurComponentInAddList = true;
                    var idInForestToBeAdded = _.findIndex(componentForestToBeAdded, function(comp){return comp.id == curChildId;});
                    componentForestToBeAdded.splice(i,1);
                }

                if (this._virtualGroupHandler.isVirtualGroup(curChild)) {
                    for (var j=0; j<curChild.components.length; j++) {
                        if (componentForestIds.contains(curChild.components[j].id)) {
                            isCurComponentInAddList = true;
                            var idInForestToBeAdded = _.findIndex(componentForestToBeAdded, function(comp){return comp.id == curChild.components[j].id;});
                            componentForestToBeAdded.splice(idInForestToBeAdded,1);
                        }
                    }
                }


                if (isCurComponentInAddList) {
                    var componentToAdd = curChild;
                    var previousComponentIdThatAlsoExistInMobile = this._structuresComparer._getPreviousComponentIdThatAlsoExistInMobile(currentComponentRoot, websiteStructure, curChildId, mobileSiteStructure);
                    var futureMobileContainerOfAddedComponent;
                    if (previousComponentIdThatAlsoExistInMobile) {
                        futureMobileContainerOfAddedComponent = this._utils.getContainerOfComponent(previousComponentIdThatAlsoExistInMobile, mobileSiteStructure);
                    }
                    else {
                        futureMobileContainerOfAddedComponent = this._structuresComparer._getAncestorContainerExistingInMobile(curChildId, websiteStructure, mobileSiteStructure);
                    }

                    componentsToInsert.push({
                        componentToAdd: [componentToAdd],
                        futureMobileContainerOfAddedComponent: futureMobileContainerOfAddedComponent,
                        previousComponentIdThatAlsoExistInMobile: previousComponentIdThatAlsoExistInMobile
                    });

                }
            }

            for (var i=0; i<currentComponentRootChildren.length; i++) {
                componentsToInsert = componentsToInsert.concat(this._mapComponentsToAddToTheirFutureContainerAndPreceder(currentComponentRootChildren[i], websiteStructure, mobileSiteStructure, componentForestToBeAdded));
            }

            return componentsToInsert;
        },

        //used once
        _convertAddedComponentIdsListToComponentForest: function(componentIdsAddedToWebStructure, websiteStructure) {
            var componentsAddedToWebStructure = componentIdsAddedToWebStructure.map(function(compId){return this._utils.getComponentByIdFromStructure(compId , websiteStructure);}.bind(this));
            componentsAddedToWebStructure = _.without(componentsAddedToWebStructure, null);
            if (componentsAddedToWebStructure.length===0) {
                return [];
            }

            var clonedComponentsAddedToWebStructure = componentsAddedToWebStructure.map(function(comp){
                var compClone = Object.clone(comp);
                this._clearIdentificationsAndChildrenFromAddedComponent(compClone);
                return compClone;
            }.bind(this));

            for (var i=clonedComponentsAddedToWebStructure.length-1; i>=0; i--) {
                var potentialChild = clonedComponentsAddedToWebStructure[i];
                for (var j=clonedComponentsAddedToWebStructure.length-1; j>=0; j--) {
                    var potentialParent = clonedComponentsAddedToWebStructure[j];
                    var potentialParentWithChildrenInfo = componentsAddedToWebStructure[j];
                    if (this._utils.areDirectParentAndChild(potentialChild, potentialParentWithChildrenInfo)) {
                        this._utils.reparentComponent(potentialChild, potentialParent);
                        clonedComponentsAddedToWebStructure.splice(i,1);
                        componentsAddedToWebStructure.splice(i,1);
                        break;
                    }
                }
            }

            return clonedComponentsAddedToWebStructure;
        },

        //used once
        _clearIdentificationsAndChildrenFromAddedComponent: function(component) {
            if (component.components || component.children) {
                component.blocks = [];
                component.blockLayout = [];
                component.components = [];
                component.componentsOrder = [];
            }
        },

        /////////////////////////////////////////////////////////////
        // blocks
        /////////////////////////////////////////////////////////////

        //used once
        insertAddedComponentBetweenBlocks: function(container, componentToAdd, previousComponentId) {
            var blockNumberOfPreviousComponent = this._getBlockNumberOfPreviousComponent(previousComponentId, container);
            var componentToAddClone = Object.clone(componentToAdd);
            componentToAddClone.layout.y = this._calculateYFromBlockLayout(blockNumberOfPreviousComponent, container);

            var containerChildren = container.components || container.children;
            containerChildren.push(componentToAddClone);

            if (!this._utils.isSiteStructure(container) && !container.existsBeforeMerge) {
                this._structureConverter.ensureContainerTightlyWrapsChildren(container);
            }

            this.shiftComponentsLowerThanBlock(container, blockNumberOfPreviousComponent, componentToAddClone.layout.height + this._config.COMPONENT_MOBILE_MARGIN_Y);

            container.blocks.splice(blockNumberOfPreviousComponent+1, 0, [componentToAddClone.id]);
            container.blockLayout.splice(blockNumberOfPreviousComponent+1, 0, componentToAddClone.layout);
        },

        //used once
        _calculateYFromBlockLayout: function (blockNumberOfPreviousComponent, container) {
            if (blockNumberOfPreviousComponent >= 0) {
                return (container.blockLayout[blockNumberOfPreviousComponent].y + container.blockLayout[blockNumberOfPreviousComponent].height + this._config.COMPONENT_MOBILE_MARGIN_Y);
            }
            else {
                return this._config.COMPONENT_MOBILE_MARGIN_Y;
            }
        },

        //used once
        _getBlockNumberOfPreviousComponent: function (previousComponentId, container) {
            var blockNumberOfPreviousComponent;
            if (previousComponentId) {
                for (var i = 0; i < container.blocks.length; i++) {
                    if (container.blocks[i].contains(previousComponentId)) {
                        blockNumberOfPreviousComponent = i;
                        break;
                    }
                }
            }
            else {
                blockNumberOfPreviousComponent = -1;
            }
            return blockNumberOfPreviousComponent;
        },

        //used once
        _updateBlocksAndModifyLayoutIfNeeded: function(component, componentIdsToDeleteFromCurrentComponent) {

            //rmv deleted component ids from component.blocks
            var updatedBlocks = [];
            for (var i=0;i<component.blocks.length; i++) {
                var blockSizeBeforeUpdate = component.blocks[i].length;
                component.blocks[i] = _.difference(component.blocks[i], componentIdsToDeleteFromCurrentComponent);
                if (blockSizeBeforeUpdate !== component.blocks[i].length) {
                    updatedBlocks.push(i);
                }
            }

            for (i=component.blocks.length-1; i>=0; i--) {
                if (updatedBlocks.contains(i)) {
                    if (component.blocks[i].length===0) {
                        this._shiftUpComponentsLowerThanDeletedBlock(component, i);
                        component.blocks.splice(i,1);
                        component.blockLayout.splice(i,1);
                    }
                    else {
                        var oldBlockLayout = component.blockLayout[i];
                        var blockComps = this._utils.getComponentsFromIds(component, component.blocks[i]);
                        var newBlockLayout = this._utils.getGroupLayout(blockComps);
                        component.blockLayout[i] = newBlockLayout;

                        var blockLayoutYDiff = newBlockLayout.y - oldBlockLayout.y;
                        if (blockLayoutYDiff !== 0) {
                            this.shiftComponentsLowerThanBlock(component, i-1, -blockLayoutYDiff);
                        }

                        var blockLayoutHeightDiff = oldBlockLayout.height - component.blockLayout[i].height;
                        var shiftNeededAfterYChange = blockLayoutHeightDiff - blockLayoutYDiff;
                        if (blockLayoutHeightDiff !== 0) {
                            this.shiftComponentsLowerThanBlock(component, i, -shiftNeededAfterYChange);
                        }

                    }
                }
            }

        },

        //used once
        _shiftUpComponentsLowerThanDeletedBlock: function(container, deletedBlockNumber) {
            this.shiftComponentsLowerThanBlock(container, deletedBlockNumber, - (container.blockLayout[deletedBlockNumber].height + this._config.COMPONENT_MOBILE_MARGIN_Y));
        },

        shiftComponentsLowerThanBlock: function (container, blockNumber, shiftValue) {
            var containerChildren = container.components || container.children;
            var j;
            for (var i = blockNumber + 1; i < container.blocks.length; i++) {
                var curBlock = container.blocks[i];
                for (j = 0; j < curBlock.length; j++) {
                    var curComponent = this._utils.getComponentById(curBlock[j], containerChildren);
                    curComponent.layout.y += shiftValue;
                    curComponent.layout.anchors = [];
                }
                container.blockLayout[i].y += shiftValue;
            }

            if (blockNumber > -1) {
                var curBlock = container.blocks[blockNumber];
                for (j = 0; j < curBlock.length; j++) {
                    var curComponent = this._utils.getComponentById(curBlock[j], containerChildren);
                    curComponent.layout.anchors = [];
                }
            }
        },

        /////////////////////////////////////////////////////////////
        // add and delete pages
        /////////////////////////////////////////////////////////////

        //used once
        _addAndDeletePagesInMobileAccoringToWebsite: function(serializedWebsitePages, serializedMobileSitePages){
            this._addPagesToMobile(serializedWebsitePages, serializedMobileSitePages);
            this._deletePagesFromMobile(serializedWebsitePages, serializedMobileSitePages);
        },

        //used once
        _addPagesToMobile:function(serializedWebsitePages, serializedMobileSitePages){

            var websitePages = _.values(serializedWebsitePages);
            var mobilePages = _.values(serializedMobileSitePages);

            for (var i=0; i< websitePages.length; i++) {
                var webPageId = websitePages[i].id;
                if (!this._utils.isComponentIdExistInArrayOfComponents(webPageId, mobilePages)) {
                    serializedMobileSitePages[webPageId] = _.cloneDeep(serializedWebsitePages[webPageId]);
                    this._conversionAlgorithm.runMobileConversionAlgorithm(serializedMobileSitePages[webPageId], 'page', []);
                }
            }
        },

        //used once
        _deletePagesFromMobile:function(serializedWebsitePages, serializedMobileSitePages){
            var websitePages = _.values(serializedWebsitePages);
            var mobilePages = _.values(serializedMobileSitePages);

            for (var i=0; i< mobilePages.length; i++) {
                var mobilePageId = mobilePages[i].id;
                if (!this._utils.isComponentIdExistInArrayOfComponents(mobilePageId, websitePages)) {
                    delete serializedMobileSitePages[mobilePageId];
                }
            }
        },

        /////////////////////////////////////////////////////////////
        // Styles
        /////////////////////////////////////////////////////////////

        //used once
        _updateComponentsStyles: function(webStructure, mobileComponentJson){
            var mobChildren = mobileComponentJson.components || mobileComponentJson.children;

            var webComponent = this._utils.getComponentByIdFromStructure(mobileComponentJson.id, webStructure);
            if(webComponent){
                mobileComponentJson.styleId = webComponent.styleId;
            }

            if (mobChildren) {
                for(var i=0; i<mobChildren.length; i++){
                    var mobChild = mobChildren[i];
                    this._updateComponentsStyles(webStructure, mobChild);
                }
            }
        }

    });
});
