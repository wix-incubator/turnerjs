define.Class('wysiwyg.editor.layoutalgorithms.subprocesses.StructureAnalyzer', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.binds(['_compareByAnotherArrayOrder']);

    def.statics({
        NEIGHBORS: ['leftNeighbor', 'rightNeighbor', 'topNeighbor', 'bottomNeighbor']
    });

    def.methods({

        initialize: function(modules) {
            this._utils = modules.$utils;
            this._config = modules.$config;
            this._virtualGroupHandler = modules.$virtualGroupHandler;
        },

        analyzeStructure: function(structure) {
            this._identifyComponentClusters(structure);
            this._identifyTextAndItsCorrelatingVisual(structure);
            this._identifyPatterns(structure);
            this._identifyTextGroups(structure);
            this._joinOrderingRelatedGroups(structure);

            this._addComponentOrder(structure);

            this._updateComponentOrderWithNeighborsInfo(structure);

        },

        _identifyComponentClusters: function (component) {
            component.clusterGroups = [];

            var components = component.components || component.children;
            if (!components) {
                return;
            }

            var componentNeighborsArray = [];
            var i;
            for (i = 0; i < components.length; i++) {
                var currentComponentNeighbors = this.getComponentNeighbors(components[i], components);
                componentNeighborsArray.push(currentComponentNeighbors);
            }
            var averageDistance = this._getAverageDistanceBetweenNeighbors(componentNeighborsArray);
            averageDistance = this._removeOutliersAndRecalculateDistanceAverage(componentNeighborsArray, averageDistance);

            var groups = [];
            for (i = 0; i < components.length; i++) {
                var curGroup = [components[i].id];
                currentComponentNeighbors = componentNeighborsArray[i];
                var groupingThreshold = 0.08;

                for (var j = 0; j < this.NEIGHBORS.length; j++) {
                    var currentNeighbor = currentComponentNeighbors[this.NEIGHBORS[j]];
                    if (currentNeighbor.comp && currentNeighbor.distance / averageDistance < groupingThreshold) {
                        curGroup.push(currentNeighbor.comp.id);
                    }
                }

                if (curGroup.length > 1) {
                    groups.push(curGroup);
                }
            }

            component.clusterGroups = component.clusterGroups.concat(groups);
            this._utils.unifyGroups(component.clusterGroups, 50);

            for (i = 0; i < components.length; i++) {
                this._identifyComponentClusters(components[i]);
            }
        },

        //used once
        _removeOutliersAndRecalculateDistanceAverage: function(componentNeighborsArray, averageDistance) {
            var outlierMultiplicationThreshold = 2;
            for (var i=0;i<componentNeighborsArray.length; i++) {
                var currentComponentNeighbors = componentNeighborsArray[i];

                for (var j=0; j<this.NEIGHBORS.length; j++) {
                    var currentNeighbor = currentComponentNeighbors[this.NEIGHBORS[j]];
                    if (currentNeighbor.comp && currentNeighbor.distance > averageDistance * outlierMultiplicationThreshold) {
                        currentNeighbor.distance = Number.MAX_VALUE;
                        currentNeighbor.comp = null;
                    }
                }
            }
            averageDistance = this._getAverageDistanceBetweenNeighbors(componentNeighborsArray);
            return averageDistance;
        },

        _getAverageDistanceBetweenNeighbors: function(componentNeighborsArray) {
            var distancesSum = 0;
            var numDistances = 0;

            for (var i=0; i<componentNeighborsArray.length; i++) {
                var currentComponentNeighbors = componentNeighborsArray[i];
                for (var j=0; j<this.NEIGHBORS.length; j++) {
                    var currentNeighbor = currentComponentNeighbors[this.NEIGHBORS[j]];
                    if (currentNeighbor.comp) {
                        distancesSum += currentNeighbor.distance;
                        numDistances++;
                    }
                }
            }
            return numDistances>0 ? (distancesSum/numDistances) : -1;
        },

        getComponentNeighbors: function(component, siblings, allowedOverlayBetweenNeighbors) {
            var componentBorders = this._getComponentBorders(component);
            var allowedOverlayBetweenNeighbors = allowedOverlayBetweenNeighbors || 0;

            var leftNeighbor = null;
            var leftNeighborDistance = Number.MAX_VALUE;
            var rightNeighbor = null;
            var rightNeighborDistance = Number.MAX_VALUE;
            var topNeighbor = null;
            var topNeighborDistance = Number.MAX_VALUE;
            var bottomNeighbor = null;
            var bottomNeighborDistance = Number.MAX_VALUE;

            if (siblings) {
                for (var i=0; i<siblings.length; i++) {
                    var currentSibling = siblings[i];
                    if (component.id == currentSibling.id) {
                        continue;
                    }
                    if (this._utils.areComponentsOverlay(component, currentSibling, 0.25)) {
                        continue;
                    }

                    var currentSiblingBorders = this._getComponentBorders(currentSibling);
                    var componentDistance;
                    if (this._utils.hasSufficientYOverLap(component, currentSibling)) {
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

                    if (this._utils.hasSufficientXOverLap(component, currentSibling)) {
                        if (componentBorders.top + allowedOverlayBetweenNeighbors > currentSiblingBorders.bottom) {
                            componentDistance = componentBorders.top - currentSiblingBorders.bottom;
                            if (componentDistance < topNeighborDistance) {
                                topNeighbor = currentSibling;
                                topNeighborDistance = componentDistance;
                            }
                        }
                        if (componentBorders.bottom  - allowedOverlayBetweenNeighbors< currentSiblingBorders.top) {
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
                leftNeighbor: {comp: leftNeighbor,distance: leftNeighborDistance},
                rightNeighbor: {comp: rightNeighbor, distance: rightNeighborDistance},
                topNeighbor: {comp: topNeighbor, distance: topNeighborDistance},
                bottomNeighbor: {comp: bottomNeighbor, distance: bottomNeighborDistance}
            };
        },

        _getComponentBorders: function(component) {
            var borders = {
                left: component.layout.x,
                right: component.layout.x + component.layout.width,
                top: component.layout.y,
                bottom: component.layout.y + component.layout.height
            };
            return borders;
        },

        _identifyTextAndItsCorrelatingVisual: function(component) {
            var children = component.components || component.children;
            if (!children) {
                return;
            }

            component.textVisualGroups = [];
            var i;

            for (i = 0; i < children.length; i++) {
                var curChild = children[i];
                if (!this._utils.isTextComponent(curChild)) {
                    continue;
                }
                var componentNeighbors = this.getComponentNeighbors(curChild, children);
                var closestVisualComponent = this._findClosestVisualToComponent(componentNeighbors);
                if (closestVisualComponent) {

                    var visualComponentNeighbors = this.getComponentNeighbors(closestVisualComponent, children);
                    var closestTextToClosestVisual = this._findClosestTextToComponent(visualComponentNeighbors);

                    if (closestTextToClosestVisual && closestTextToClosestVisual.id == curChild.id) {
                        var textVisualGroup = [curChild.id, closestVisualComponent.id];
                        component.textVisualGroups.push(textVisualGroup);
                    }
                }
            }

            this._utils.unifyGroups(component.textVisualGroups, 50);

            for (i = 0; i < children.length; i++) {
                this._identifyTextAndItsCorrelatingVisual(children[i]);
            }
        },

        _findClosestVisualToComponent: function(componentNeighbors){
            return this._findClosestTypeToComponent(componentNeighbors, 'visual');
        },

        _findClosestTextToComponent: function(componentNeighbors){
            return this._findClosestTypeToComponent(componentNeighbors, 'text');
        },

        _findClosestTypeToComponent: function(componentNeighbors, type){
            var closestTypeComponent = null;
            var closestTypeComponentDistance = Number.MAX_VALUE;

            var isComponentOfDesiredType;
            switch (type) {
                case 'visual':
                isComponentOfDesiredType = this._utils.isVisualComponent.bind(this);
                break;
                case 'text':
                isComponentOfDesiredType = this._utils.isTextComponent.bind(this);
                    break;
                default:
                    isComponentOfDesiredType = function() {return false;};
            }

            for (var j=0; j<this.NEIGHBORS.length; j++) {
                var currentNeighbor = componentNeighbors[this.NEIGHBORS[j]];
                if (isComponentOfDesiredType(currentNeighbor.comp) && currentNeighbor.distance<closestTypeComponentDistance) {
                    closestTypeComponent = currentNeighbor.comp;
                    closestTypeComponentDistance = currentNeighbor.distance;
                }
            }

            return closestTypeComponent;
        },

        _identifyTextGroups: function (component) {
            var children = component.components || component.children;
            if (!children) {
                return;
            }

            var allNeighborsArray = this._getAllNeighborsArray(children);
            var bottomNeighbor = this.NEIGHBORS[3];
            component.textGroups = [];

            for (var i = 0; i < allNeighborsArray.length; i++) {
                var curNeighborRelation = allNeighborsArray[i];
                if (curNeighborRelation.neighbor &&
                    curNeighborRelation.direction == bottomNeighbor &&
                    curNeighborRelation.distance < 50 &&
                    this._utils.isTextComponent(curNeighborRelation.comp) &&
                    this._utils.isTextComponent(curNeighborRelation.neighbor)) {

                    component.textGroups.push([curNeighborRelation.comp.id, curNeighborRelation.neighbor.id]);
                }
            }

            this._utils.unifyGroups(component.textGroups, 50);

            for (i = 0; i < children.length; i++) {
                this._identifyTextGroups(children[i]);
            }
        },


        _identifyPatterns: function(component) {
            var children = component.components || component.children;
            if (!children) {
                return;
            }

            var allNeighborsArray = this._getAllNeighborsArray(children);

            component.patternGroups = [];
            var patterns = this._getPatternsFromNeighbors(allNeighborsArray);
            for (var i=0; i<patterns.length; i++) {
                component.patternGroups.push([patterns[i][0].comp.id, patterns[i][0].neighbor.id]);
                component.patternGroups.push([patterns[i][1].comp.id, patterns[i][1].neighbor.id]);
            }
            this._utils.unifyGroups(component.patternGroups, 50);

            for (i=0; i<children.length; i++) {
                this._identifyPatterns(children[i]);
            }
        },

        _getAllNeighborsArray: function (children) {
            var allNeighborsArray = [];
            for (var i = 0; i < children.length; i++) {
                var currentComponentNeighborRelations = this.getComponentNeighbors(children[i], children, 5);
                for (var j = 0; j < this.NEIGHBORS.length; j++) {
                    var currentNeighborRelation = currentComponentNeighborRelations[this.NEIGHBORS[j]];
                    if (currentNeighborRelation.comp) {
                        allNeighborsArray.push({
                            comp: children[i],
                            neighbor: currentNeighborRelation.comp,
                            distance: currentNeighborRelation.distance,
                            direction: this.NEIGHBORS[j]
                        });
                    }
                }
            }
            return allNeighborsArray;
        },

        _joinOrderingRelatedGroups: function(component) {
            var children = component.components || component.children;
            if (!children) {
                return;
            }
            component.semanticGroups = [];
            component.semanticGroups = component.semanticGroups.concat(_.cloneDeep(component.clusterGroups));
            component.semanticGroups = component.semanticGroups.concat(_.cloneDeep(component.textVisualGroups));
            component.semanticGroups = component.semanticGroups.concat(_.cloneDeep(component.patternGroups));
            this._utils.unifyGroups(component.semanticGroups);

            for (var i=0; i<children.length; i++) {
                this._joinOrderingRelatedGroups(children[i]);
            }
        },

        _getPatternsFromNeighbors: function(neighborRelations) {
            var patterns = [];

            for (var i=0; i<neighborRelations.length; i++) {
                var firstNeighborRelation = neighborRelations[i];
                for (var j=i+1; j<neighborRelations.length; j++) {
                    var secondNeighborRelation = neighborRelations[j];
                    if (this._areNeighborRelationsSimilar(firstNeighborRelation, secondNeighborRelation)) {
                        patterns.push([firstNeighborRelation, secondNeighborRelation]);
                    }
                }
            }
            return patterns;
        },

        _areNeighborRelationsSimilar: function(firstNeighborRelation, secondNeighborRelation) {
            if (firstNeighborRelation.comp.componentType == firstNeighborRelation.neighbor.componentType ||
                secondNeighborRelation.comp.componentType == secondNeighborRelation.neighbor.componentType) {
                return false;
            }

            if (this._virtualGroupHandler.isVirtualGroup(firstNeighborRelation.comp) ||
                this._virtualGroupHandler.isVirtualGroup(firstNeighborRelation.neighbor) ||
                this._virtualGroupHandler.isVirtualGroup(secondNeighborRelation.comp) ||
                this._virtualGroupHandler.isVirtualGroup(secondNeighborRelation.neighbor)) {
                return false;
            }

            var maximalDifferanceBetweenDistancesToClaimTheyAreSimilar = 10;

            var ret =
                firstNeighborRelation.comp.componentType == secondNeighborRelation.comp.componentType &&
                    firstNeighborRelation.comp.componentType == secondNeighborRelation.comp.componentType &&
                    firstNeighborRelation.comp.id != secondNeighborRelation.comp.id &&
                    firstNeighborRelation.neighbor.id != secondNeighborRelation.neighbor.id &&
                    firstNeighborRelation.neighbor.componentType == secondNeighborRelation.neighbor.componentType &&
                    firstNeighborRelation.direction == secondNeighborRelation.direction &&
                    Math.abs(firstNeighborRelation.distance - secondNeighborRelation.distance) < maximalDifferanceBetweenDistancesToClaimTheyAreSimilar;
            return ret;
        },

        _addComponentOrder: function(component) {
            var components = component.components || component.children;
            if (!components) {
                return;
            }

            var componentClone = _.cloneDeep(component);
            var childrenClone = componentClone.components || componentClone.children;
            childrenClone.sort(this._utils.compareByRows.bind(this._utils));
            var componentsOrder = [];
            for (var i=0;i<childrenClone.length; i++) {
                componentsOrder.push(childrenClone[i].id);
            }
            component.componentsOrder = componentsOrder;

            for (i=0; i<components.length; i++) {
                this._addComponentOrder(components[i]);
            }
        },

        _updateComponentOrderWithNeighborsInfo: function(component) {
            var i;
            if (component.semanticGroups && component.semanticGroups.length > 0) {
                this._orderSemanticGroupsAccordingToComponentOrder(component);
                for (i=0;i<component.componentsOrder.length;i++) {
                    var searchDone = false;
                    for (var j=0; j<component.semanticGroups.length; j++) {
                        if (searchDone) {
                            break;
                        }
                        var currentSemanticGroup = component.semanticGroups[j];
                        for (var k=0; k<currentSemanticGroup.length; k++) {
                            if (component.componentsOrder[i] == currentSemanticGroup[k] ) {
                                searchDone = true;
                                var remainingSemanticGroupToCheck =  currentSemanticGroup.slice(0);
                                remainingSemanticGroupToCheck.splice(k,1);
                                while (remainingSemanticGroupToCheck.length>0 && i< component.componentsOrder.length-1) {
                                    i++;
                                    var indexInGroup = remainingSemanticGroupToCheck.indexOf(component.componentsOrder[i]);
                                    if (indexInGroup==-1) {
                                        var componentIdNextInOrder = remainingSemanticGroupToCheck[0];
                                        component.componentsOrder.splice(component.componentsOrder.indexOf(componentIdNextInOrder),1);
                                        component.componentsOrder.splice(i, 0, componentIdNextInOrder);
                                    }
                                    remainingSemanticGroupToCheck.splice(0,1);
                                }
                                break;
                            }
                        }
                    }
                }
            }

            var components = component.components || component.children;
            if (components) {
                for (i=0;i<components.length; i++) {
                    this._updateComponentOrderWithNeighborsInfo(components[i]);
                }
            }
        },

        //used once
        _orderSemanticGroupsAccordingToComponentOrder: function(component) {
            for (var i=0;i<component.semanticGroups.length; i++) {
                var currentSemanticGroup = component.semanticGroups[i];
                currentSemanticGroup.sort(this._compareByAnotherArrayOrder(component.componentsOrder));
            }
        },

        //used once
        _compareByAnotherArrayOrder: function(arrayOfOrder) {
            return function(element1, element2) {
                if (arrayOfOrder.indexOf(element1)<arrayOfOrder.indexOf(element2)) {
                    return -1;
                }
                if (arrayOfOrder.indexOf(element1)>arrayOfOrder.indexOf(element2)) {
                    return 1;
                }
                return 0;
            };
        },

        //used once
        identifyBlocks: function(component) {
            var children = component.components || component.children;
            if (!children) {
                return;
            }

            component.blocks = [];
            component.blockLayout = [];

            var componentClone = _.cloneDeep(component);
            var childrenClone = componentClone.components || componentClone.children;
            childrenClone.sort(this._utils.compareByRows.bind(this._utils));

            var currentBlockIds = [];
            var firstIndexInCurrentBlock = 0;
            for (var i=0; i<childrenClone.length; i++) {
                currentBlockIds.push(childrenClone[i].id);
                if (i==childrenClone.length-1) {
                    this._addCurrentBlockData(component, currentBlockIds);
                }
                else {
                    var hasSufficientYOverLapWithOneOfTheBlockMembers = false;
                    for (var j=firstIndexInCurrentBlock;j<=i;j++) {
                        if (this._utils.hasSufficientYOverLap(childrenClone[j], childrenClone[i+1])) {
                            hasSufficientYOverLapWithOneOfTheBlockMembers = true;
                            break;
                        }
                    }
                    if (!hasSufficientYOverLapWithOneOfTheBlockMembers) {
                        this._addCurrentBlockData(component, currentBlockIds);
                        currentBlockIds = [];
                        firstIndexInCurrentBlock = i+1;
                    }
                }
            }

            for (i=0;i<children.length; i++) {
                this.identifyBlocks(children[i]);
            }
        },

        _addCurrentBlockData: function(component, currentBlockIds) {
            var blockComps = this._utils.getComponentsFromIds(component, currentBlockIds);
            var blockLayout = this._utils.getGroupLayout(blockComps);
            component.blockLayout.push(blockLayout);
            component.blocks.push(currentBlockIds);
        },

        cleanUpAlgorithmProperties: function(component) {
            delete component.componentsOrder;
            delete component.semanticGroups;

            delete component.clusterGroups;
            delete component.textVisualGroups;
            delete component.patternGroups;
            delete component.textGroups;

            delete component.blocks;
            delete component.blockLayout;

            var children = component.components || component.children;
            if (children) {
                for (var i=0; i<children.length ;i++) {
                    this.cleanUpAlgorithmProperties(children[i]);
                }
            }
        }

    });
});
