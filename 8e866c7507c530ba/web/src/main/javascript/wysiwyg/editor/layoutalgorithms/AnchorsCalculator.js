define.Class('wysiwyg.editor.layoutalgorithms.AnchorsCalculator', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        initialize: function(modules) {
            this._utils = modules.$utils;
            this._config = modules.$config;
        },

        updateAnchors: function (structure) {
            this._clearComponentAnchors(structure);
            this._recalculateComponentAnchors(structure);
        },

        _clearComponentAnchors: function(component) {
            if (component.layout) {
                component.layout.anchors = [];
            }
            var components = component.components || component.children;
            if (components) {
                for (var i=0; i<components.length; i++) {
                    this._clearComponentAnchors(components[i]);
                }
            }
        },

        _recalculateComponentAnchors: function(component) {
            var components = component.components || component.children;
            if (components) {
                this._recalculateAnchorsOfContainerAndDirectChildren(component);
                for (var i=0; i<components.length; i++) {
                    this._recalculateComponentAnchors(components[i]);
                }
            }

        },

        _recalculateAnchorsOfContainerAndDirectChildren: function(component) {
            if (this._utils.isSiteStructure(component)) {
                this._setSiteSegmentAnchors(component);
            }
            else if (component.components) {
                this._recalculateComponentAnchorsOfSameLevel(component.components);
                this._addBottomParentAnchorsToContainer(component);
            }
        },

        _setSiteSegmentAnchors: function(masterPageStructure) {
            var headerComponent = this._utils.getHeaderComponent(masterPageStructure);
            var footerComponent = this._utils.getComponentById('SITE_FOOTER', masterPageStructure.children);
            var pagesContainerComponent = this._utils.getComponentById('PAGES_CONTAINER', masterPageStructure.children);

            var distanceBetweenHeaderAndPagesContainer = pagesContainerComponent.layout.y - (headerComponent.layout.y + headerComponent.layout.height);
            var distanceBetweenPagesContainerAndFooter = footerComponent.layout.y - (pagesContainerComponent.layout.y + pagesContainerComponent.layout.height);

            this._addToTopAnchor(headerComponent, pagesContainerComponent, {distance: distanceBetweenHeaderAndPagesContainer, locked: true, type: "BOTTOM_TOP"});
            this._addToTopAnchor(pagesContainerComponent, footerComponent, {distance: distanceBetweenPagesContainerAndFooter, locked: true, type: "BOTTOM_TOP"});

            footerComponent.layout.anchors = footerComponent.layout.anchors || [];
            footerComponent.layout.anchors.push({
                distance: this._config.COMPONENT_MOBILE_MARGIN_Y,
                locked: true,
                originalValue: 500,
                targetComponent: "SITE_STRUCTURE",
                topToTop: 500,
                type: "BOTTOM_PARENT"
            });

        },

        _addToTopAnchor: function(fromComp, toComp, overrideParams) {
            var isBottomTop = this._isAppropriateForBottomTopAnchor(fromComp, toComp);
            var fromCompBottom = fromComp.layout.y + fromComp.layout.height;
            var distance = isBottomTop? toComp.layout.y - fromCompBottom : toComp.layout.y - fromComp.layout.y;
            var topToTop = toComp.layout.y - fromComp.layout.y;
            var locked = distance <= W.Preview.getPreviewManagers().Layout.LOCK_THRESHOLD;

            var originalValue = toComp.layout.y;

            var type = isBottomTop? 'BOTTOM_TOP': 'TOP_TOP';

            var toTopAnchor = {
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

            if (!isBottomTop) { //"TOP_TOP"
                this._addBottomBottomAnchorIfNeeded(fromComp, toComp);
            }
        },

        _addBottomBottomAnchorIfNeeded: function (upperComp, lowerComp) {
            var upperCompTop = upperComp.layout.y;
            var lowerCompTop = lowerComp.layout.y;
            var upperCompHeight = upperComp.layout.height;
            var lowerCompHeight = lowerComp.layout.height;
            var upperCompBottom = upperCompTop + upperCompHeight;
            var lowerCompBottom = lowerCompTop + lowerCompHeight;

            //if the low-element is fully contained in the upper, we create a bottom bottom anchor
            if (lowerCompBottom < upperCompBottom) {
                var bottomBottomAnchor = {};
                bottomBottomAnchor.type = "BOTTOM_BOTTOM";
                bottomBottomAnchor.fromComp = lowerComp.id;
                bottomBottomAnchor.toComp = upperComp.id;
                bottomBottomAnchor.distance = upperCompBottom - lowerCompBottom;
                bottomBottomAnchor.locked = bottomBottomAnchor.distance <= this._config.ANCHOR_LOCK_THRESHOLD;
                bottomBottomAnchor.topToTop = lowerCompTop - upperCompTop;
                bottomBottomAnchor.originalValue = upperCompHeight;
                bottomBottomAnchor.targetComponent = upperComp.id;

                lowerComp.layout.anchors.push(bottomBottomAnchor);
            }
        },

        _isAppropriateForBottomTopAnchor: function(fromComp, toComp) {
            var toCompBottom = toComp.layout.y + toComp.layout.height;
            var fromCompBottom = fromComp.layout.y + fromComp.layout.height;
            return (toCompBottom > fromCompBottom && toComp.layout.y > fromComp.layout.y + (fromComp.layout.height / 2));
        },

        _addBottomParentAnchor: function(fromComp, toComp, overrideParams) {
            var distance = Math.max(toComp.layout.height - (fromComp.layout.y + fromComp.layout.height), 0);
            var topToTop = fromComp.layout.y;
            var locked = distance <= W.Preview.getPreviewManagers().Layout.LOCK_THRESHOLD;

            var originalValue = toComp.layout.height;

            var bottomParentAnchor = {
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
        },

        _hasAnchor: function (fromComp, toComp, anchorType) {
            for (var i=0; i<fromComp.layout.anchors.length; i++) {
                var curAnchor = fromComp.layout.anchors[i];
                if (curAnchor.targetComponent == toComp.id && curAnchor.type == anchorType) {
                    return true;
                }
            }
            return false;
        },

        _removeAnchor: function (fromComp, toComp, anchorType) {
            var indexToRemove = null;
            for (var i=0; i<fromComp.layout.anchors.length; i++) {
                var curAnchor = fromComp.layout.anchors[i];
                if (curAnchor.targetComponent == toComp.id && curAnchor.type == anchorType) {
                    indexToRemove = i;
                }
            }
            if (indexToRemove!==null) {
                fromComp.layout.anchors.splice(indexToRemove,1);
            }
        },

        _addBottomParentAnchorsToContainer: function(container) {
            for (var i=0; i<container.components.length; i++) {
                var currentChild = container.components[i];
                if (!this._hasBottomTopAnchor(currentChild)) {
                    this._addBottomParentAnchor(currentChild, container);
                }
            }
        },

        _hasBottomTopAnchor: function(component) {
            var componentAnchors = component.layout.anchors;
            if (!componentAnchors) {
                return false;
            }
            for (var i=0; i<componentAnchors.length; i++) {
                if (componentAnchors[i].type == "BOTTOM_TOP") {
                    return true;
                }
            }

            return false;
        },

        _recalculateComponentAnchorsOfSameLevel: function(components) {
            for (var i=0; i<components.length; i++) {
                var currentComponent = components[i];
                var componentsBelowCurrentComponent = this._getComponentsBelowComponent(currentComponent, components);
                for (var j=0; j<componentsBelowCurrentComponent.length; j++) {
                    var curBelowComponent = componentsBelowCurrentComponent[j];

                    var omitToTopAnchor = false;
                    for (var k=0; k<componentsBelowCurrentComponent.length; k++) {
                        if (this._isAppropriateForBottomTopAnchor(currentComponent, componentsBelowCurrentComponent[k]) && this._utils.isComponentBetweenOtherTwoComponents(componentsBelowCurrentComponent[k], currentComponent, curBelowComponent)) {
                            omitToTopAnchor = true;
                            break;
                        }
                    }
                    if (!omitToTopAnchor) {
                        this._addToTopAnchor(currentComponent, curBelowComponent);
                    }
                }
            }
        },

        _getComponentsBelowComponent: function(component, siblingComponents) {
            var ret = [];
            for (var i=0; i<siblingComponents.length; i++) {
                var currentSiblingComponent = siblingComponents[i];
                if (component.id == currentSiblingComponent.id) {
                    continue;
                }
                if (this._utils.hasXOverlap(component, currentSiblingComponent) && component.layout.y <= currentSiblingComponent.layout.y) {
                    ret.push(currentSiblingComponent);
                }
            }
            return ret;
        },

        updateAnchorsAfterMerge: function(mobileSiteStructure, deletedComponents, addedComponents){

            var mobileSiteStructureClone = _.cloneDeep(mobileSiteStructure);
            this.updateAnchors(mobileSiteStructureClone);
            this._updateAnchorsRelatedToAddedOrDeletedComponents(mobileSiteStructure, mobileSiteStructureClone, deletedComponents, addedComponents);
        },

        _updateAnchorsRelatedToAddedOrDeletedComponents: function(component, componentWithUpdatedAnchors, deletedComponents, addedComponents) {
            if (component.layout) {
                component.layout.anchors = component.layout.anchors || [];
                var anchors = component.layout.anchors;
                var updatedAnchors = componentWithUpdatedAnchors.layout.anchors;

                if (addedComponents.contains(component.id) || !component.layout.anchors || component.layout.anchors.length==0) {
                    component.layout.anchors = updatedAnchors;
                }

                else if (this._areAnchorsRelatedToAddedOrDeletedComponents(component.id, anchors, updatedAnchors, deletedComponents, addedComponents)) {
                    this._sortAnchorsByTargetComponent(anchors);
                    this._sortAnchorsByTargetComponent(updatedAnchors);
                    component.layout.anchors = this._copyAnchorsSignificantlyModified(anchors, updatedAnchors);
                }
            }
            var children = component.components || component.children;
            var childrenClone = componentWithUpdatedAnchors.components || componentWithUpdatedAnchors.children;

            if (children) {
                for (var i=0; i<children.length; i++) {
                    this._updateAnchorsRelatedToAddedOrDeletedComponents(children[i], childrenClone[i], deletedComponents, addedComponents);
                }
            }
        },

        _areAnchorsRelatedToAddedOrDeletedComponents: function(componentId, anchors, updatedAnchors, deletedComponents, addedComponents) {
            if (this._isComponentDeletedOrAdded(componentId, deletedComponents, addedComponents)) {
                return true;
            }

            for (var i=0; i<anchors.length; i++) {
                if (this._isComponentDeletedOrAdded(anchors[i].targetComponent, deletedComponents, addedComponents)) {
                    return true;
                }
            }

            for (i=0; i<updatedAnchors.length; i++) {
                if (this._isComponentDeletedOrAdded(updatedAnchors[i].targetComponent, deletedComponents, addedComponents)) {
                    return true;
                }
            }

            return false;
        },

        _isComponentDeletedOrAdded: function(componentId, deletedComponents, addedComponents) {
            return (deletedComponents.contains(componentId) || addedComponents.contains(componentId));
        },



        _sortAnchorsByTargetComponent: function(anchors) {
            if (!anchors) {
                return;
            }
            anchors.sort(function(anchor1, anchor2) {
                return anchor1.targetComponent > anchor2.targetComponent;
            });
        },

        _copyAnchorsSignificantlyModified: function(anchors, updatedAnchors) {
            if (!anchors) {
                anchors = _.clone(updatedAnchors);
                return anchors;
            }

            for (var i=0; i<anchors.length; i++) {
                var curUpdatedAnchor = updatedAnchors[i];
                if (!curUpdatedAnchor) {
                    anchors = anchors.slice(0,i);
                    break;
                }
//                if (anchors[i].targetComponent !== curUpdatedAnchor.targetComponent || anchors[i].type !== curUpdatedAnchor.type) {
                if (this._areAnchorsSiginificantlyDifferent(anchors[i], curUpdatedAnchor)) {
                    anchors[i] = _.clone(curUpdatedAnchor);
                }
                else {
                    anchors[i].originalValue = curUpdatedAnchor.originalValue;
                }
            }

            for (var i=anchors.length; i<updatedAnchors.length; i++) {
                anchors[i] = _.clone(updatedAnchors[i]);
            }
            return anchors;
        },

        _areAnchorsSiginificantlyDifferent: function(anchor1, anchor2) {
            if (anchor1.targetComponent !== anchor2.targetComponent) {
                return true;
            }
            if (anchor1.type !== anchor2.type) {
                if (!(anchor1.type == 'TOP_TOP' && anchor2.type == 'TOP_BOTTOM' || anchor1.type == 'TOP_BOTTOM' && anchor2.type == 'TOP_TOP')) {
                    return true;
                }
            }
            return false;
        }


    });
});
