define.Class('wysiwyg.editor.layoutalgorithms.LayoutAlgoUtils', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({

        initialize: function(modules) {
            this._config = modules.$config;
        },

        isMasterPage: function(structure) {
            var ret = (structure.id == undefined);
            return ret;
        },

        /**
         * the order is made by:
         * if the components overlap in the y axis, the preceding is the more leftish.
         * if not, the preceding is the more top one
         */
        compareByRows: function(comp1,comp2) {

            if (!this.hasSufficientYOverLap(comp1, comp2)) {

                if (comp1.layout.y < comp2.layout.y) {
                    return -1;
                }
                if (comp1.layout.y > comp2.layout.y) {
                    return 1;
                }
            }

            if (comp1.layout.x < comp2.layout.x) {
                return -1;
            }
            if (comp1.layout.x > comp2.layout.x) {
                return 1;
            }

            return 0;
        },

        getComponentById: function (id, components) {
            for (var i = 0; i < components.length; i++) {
                var currentComponent = components[i];
                if (currentComponent.id == id) {
                    return currentComponent;
                }
            }
        },

        getComponentByIdFromStructure: function (componentId, component) {
            if (component.id == componentId) {
                return component;
            }

            var children = component.components || component.children;
            if (!children) {
                return null;
            }
            var resultOfSearchingInDirectChildren = this.getComponentById(componentId, children);
            if (resultOfSearchingInDirectChildren) {
                return resultOfSearchingInDirectChildren;
            }

            for (var i = 0; i < children.length; i++) {
                var resultOfSearchInChild = this.getComponentByIdFromStructure(componentId, children[i]);
                if (resultOfSearchInChild) {
                    return resultOfSearchInChild;
                }
            }

            return null;
        },

        getLowestChild: function(container) {
            var children = container.components || container.children;
            if (!children) {
                return;
            }
            var lowestChild;
            var lowestChildBottom = -Number.MAX_VALUE;
            for (var i=0; i<children.length; i++) {
                var curChild = children[i];
                if (curChild.layout.y + curChild.layout.height > lowestChildBottom) {
                    lowestChild = curChild;
                    lowestChildBottom = curChild.layout.y + curChild.layout.height;
                }
            }
            return lowestChild;
        },

        isComponentExistInStructure: function(componentId, structure) {
            return (this.getComponentByIdFromStructure(componentId, structure) != undefined);
        },

        getStructureComponents: function(component) {
            var ret = [];
            if (component.id) {
                ret.push(component);
            }
            var children = component.components || component.children;
            if (children) {
                for (var i=0; i<children.length; i++) {
                    ret = ret.concat(this.getStructureComponents(children[i]));
                }
            }
            return ret;
        },

        getStructureComponentIds: function(component, filterFunction) {
            var structureComponents = this.getStructureComponents(component);
            if (filterFunction) {
                structureComponents = structureComponents.filter(filterFunction);
            }
            return structureComponents.map(function(comp) {return comp.id;});
        },

        getHeaderComponent: function(structure) {
            for (var i=0; i<structure.children.length; i++) {
                if (structure.children[i].id == "SITE_HEADER") {
                    return structure.children[i];
                }
            }
        },

        isSiteStructure: function(component) {
            return (component.children);
        },

        //used once
        areDirectParentAndChild: function(component, container) {
            var containerChildren = container.components || container.children;
            if (containerChildren) {
                for (var i=0; i<containerChildren.length; i++) {
                    if (containerChildren[i].id == component.id) {
                        return true;
                    }
                }
            }
            return false;
        },

        getContainerOfComponent: function(componentId, component) {
            var children = component.components || component.children;
            if (!children) {
                return null;
            }

            for (var i=0;i<children.length; i++) {
                if (children[i].id == componentId) {
                    return component;
                }
            }

            for (var i=0; i<children.length; i++) {
                var resultOfSearchInCurChild = this.getContainerOfComponent(componentId, children[i]);
                if (resultOfSearchInCurChild) {
                    return resultOfSearchInCurChild;
                }
            }

            return null;
        },

        addComponentsToContainer: function(container, components, index) {
            var containerComponents = container.components || container.children;
            if (!containerComponents) {
                containerComponents = [];
            }
            if (index) {
                for (var i=components.length-1; i>=0; i--) {
                    containerComponents.splice(index, 0, components[i]);
                }
            }
            else {
                for (var i=0; i<components.length; i++) {
                    containerComponents.push(components[i]);
                }
            }
        },

        isVerticalLine: function(component) {
            if (!component) {
                return false;
            }
            return (component.componentType == 'wysiwyg.viewer.components.VerticalLine');
        },

        getTextLength: function(component) {
            if (!this.isTextComponent(component)) {
                return null;
            }
            var htmlTagsRegex = /(<([^>]+)>)/ig;
            var text = W.Preview.getPreviewManagers().Data.getDataByQuery(component.dataQuery).get('text');
            text = text.replace(htmlTagsRegex,"");
            return text.length;
        },

        isTextComponent: function(component) {
            if (!component) {
                return false;
            }
            return (component.componentType == "wysiwyg.viewer.components.WRichText");
        },

        isVisualComponent: function(component) {
            if (!component) {
                return false;
            }
            return (this._config.VISUAL_COMPONENTS.contains(component.componentType));
        },

        shiftGroupComponents: function(components, xShift, yShift) {
            for (var i=0; i<components.length; i++) {
                components[i].layout.x -= xShift;
                components[i].layout.y -= yShift;
            }
        },

        getMarginX: function(container) {
            if (container.componentType == "MERGE_VIRTUAL_GROUP") {
                return this.getMarginX(container.realParent);
            }
            var ret = this.isSiteSegmentOrPage(container) ? this._config.SITE_SEGMENT_PADDING_X : this._config.COMPONENT_MOBILE_MARGIN_X;
            return ret;
        },

        isSiteSegmentOrPage: function (component) {
            return this.isPageComponent(component) || this.isSiteSegment(component);
        },

        isSiteSegment: function (component) {
            var siteSegments = ['wysiwyg.viewer.components.HeaderContainer', 'wysiwyg.viewer.components.PagesContainer', 'wysiwyg.viewer.components.FooterContainer'];
            return (siteSegments.contains(component.componentType));
        },

        isComponentIdExistInArrayOfComponents: function (componentId, components) {
            for (var i = 0; i < components.length; i++) {
                var curComponentId = components[i].id;
                if (componentId == curComponentId) {
                    return true;
                }
            }
            return false;
        },

        areComponentsOverlay: function(comp1, comp2, minOverlayRatioThreshold, maxOverlayRatioThreshold) {
            var areComponentsOverlay =  (this.hasYOverlap(comp1, comp2) && this.hasXOverlap(comp1, comp2));
            if (!areComponentsOverlay || !minOverlayRatioThreshold) {
                return areComponentsOverlay;
            }

            var overlayingSurface = this.getXOverlap(comp1, comp2) * this.getYOverlap(comp1, comp2);
            var smallerComponentSurface = Math.min((comp1.layout.width * comp1.layout.height),(comp2.layout.width * comp2.layout.height));

            return (overlayingSurface/smallerComponentSurface > minOverlayRatioThreshold);
        },

        reparentComponent: function(component, newParent, oldParent) {
            this.addComponentsToContainer(newParent, [component]);
            if (oldParent) {
                this.removeComponentFromContainer(oldParent, component);
            }
            component.layout.y = component.layout.y - newParent.layout.y;
            component.layout.x = component.layout.x - newParent.layout.x;
        },

        removeComponentsFromContainer: function(container, components) {
            for (var i=0;i<components.length;i++) {
                this.removeComponentFromContainer(container, components[i]);
            }
        },

        isImageComponent: function(component) {
            return component.componentType == 'wysiwyg.viewer.components.WPhoto';
        },

        removeComponentFromContainer: function(container, component) {
            var currentComponentId = component.id;
            var containerComponents = container.components || container.children;
            for (var i=0; i<containerComponents.length; i++) {
                if (containerComponents[i].id == currentComponentId) {
                    containerComponents.splice(i,1);
                    return;
                }
            }
        },

        haveCommonElements: function(arr1, arr2) {
            for (var i=0;i<arr1.length; i++) {
                for (var j=0;j<arr2.length; j++) {
                    if (arr1[i]==arr2[j]) {
                        return true;
                    }
                }
            }
            return false;
        },

        getParent: function(component, root) {
            var children = root.component || root.children;
            if (children) {
                for (var i=0; i<children.length; i++) {
                    if (children[i].id == component.id) {
                        return root;
                    }
                    var curChildResult = this.getParent(component, children[i]);
                    if (curChildResult) {
                        return curChildResult;
                    }
                }
            }
            return null;
        },

        validateGroupCompIds: function(groupCompIds, components){
            if (!components) {
                return false;
            }
            for (var i=0;i<groupCompIds.length;i++) {
                var foundCurrentIdInComponents = false;
                for (var j=0; j<components.length;j++) {
                    if (components[j].id == groupCompIds[i]) {
                        foundCurrentIdInComponents = true;
                    }
                }
                if (!foundCurrentIdInComponents) {
                    return false;
                }
            }
            return true;
        },

        getComponentsFromIds: function(container, compIds){
            var ret = [];
            for (var i=0;i<compIds.length; i++) {
                ret.push(this.getComponentFromId(container, compIds[i]));
            }

            return ret;
        },

        getComponentFromId: function(container, compId) {
            var children = container.components || container.children;
            for (var i=0; i<children.length; i++) {
                if (children[i].id == compId) {
                    return children[i];
                }
            }
            return null;
        },


        isContainer: function(component) {
            var containers = ['Container', 'Page'];
            return (containers.contains(component.type));
        },

        hasYOverlap: function(comp1, comp2) {
            if (comp1.layout.y == comp2.layout.y) {
                return true;
            }

            return (this.getYOverlap(comp1,comp2)>0);
        },

        getYOverlap: function(comp1, comp2) {

            var topComponent = comp1.layout.y < comp2.layout.y ? comp1 : comp2;
            var bottomComponent = topComponent == comp2 ? comp1 : comp2;
            var topComponentBottomY = topComponent.layout.y + topComponent.layout.height;
            var bottomComponentBottomY = bottomComponent.layout.y + bottomComponent.layout.height;
            if (bottomComponentBottomY > topComponentBottomY) {
                return (topComponentBottomY - bottomComponent.layout.y);
            }
            else {
                return bottomComponent.layout.height;
            }
        },

        hasXOverlap: function(comp1, comp2) {
            if (comp1.layout.x == comp2.layout.x) {
                return true;
            }

            return (this.getXOverlap(comp1,comp2)>0);
        },

        getXOverlap: function(comp1, comp2) {

            var leftComponent = comp1.layout.x < comp2.layout.x ? comp1 : comp2;
            var rightComponent = leftComponent == comp2 ? comp1 : comp2;

            var leftComponentRightX = leftComponent.layout.x + leftComponent.layout.width;
            var rightComponentRightX = rightComponent.layout.x + rightComponent.layout.width;
            if (rightComponentRightX > leftComponentRightX) {
                return (leftComponentRightX - rightComponent.layout.x);
            }
            else {
                return rightComponent.layout.width;
            }
        },

        hasSufficientXOverLap: function(comp1, comp2) {
            if(!this.hasXOverlap(comp1, comp2)) {
                return false;
            }

            var xOverlap = this.getXOverlap(comp1, comp2);
            var thinerComponentWidth = Math.min(comp1.layout.width, comp2.layout.width);
            return (xOverlap/thinerComponentWidth>0.25);
        },

        hasSufficientYOverLap: function(comp1, comp2) {
            if(!this.hasYOverlap(comp1, comp2)) {
                return false;
            }

            var yOverlap = this.getYOverlap(comp1, comp2);
            var shorterComponentHeight = Math.min(comp1.layout.height, comp2.layout.height);
            return (yOverlap/shorterComponentHeight>0.25);
        },

        isComponentBetweenOtherTwoComponents: function(curComponent, topComponent, bottomComponent) {
            if (curComponent.id == topComponent.id || curComponent.id == bottomComponent.id || topComponent.id == bottomComponent.id) {
                return false;
            }

            var xOverlapLeftBorder = Math.max(topComponent.layout.x, bottomComponent.layout.x);
            var xOverlapRightBorder = Math.min(topComponent.layout.x + topComponent.layout.width, bottomComponent.layout.x + bottomComponent.layout.width);
            var topComponentBottom = topComponent.layout.y + topComponent.layout.height;
            var bottomComponentTop = bottomComponent.layout.y;
            var curComponentLeft = curComponent.layout.x;
            var curComponentRight = curComponent.layout.x + curComponent.layout.width;
            var curComponentTop = curComponent.layout.y;
            var curComponentBottom = curComponent.layout.y + curComponent.layout.height;

            if (curComponentLeft > xOverlapRightBorder) {
                return false;
            }
            if (curComponentRight < xOverlapLeftBorder) {
                return false;
            }
            if (curComponentBottom < topComponentBottom) {
                return false;
            }
            if (curComponentTop > bottomComponentTop) {
                return false;
            }
            return true;
        },

        isPageComponent: function(component) {
            return this._config.PAGE_COMPONENTS.contains(component.componentType);
        },

        isScreenWidthComponent: function(component) {
            return this._config.SCREEN_WIDTH_COMPONENTS.contains(component.componentType);
        },

        isComponentDirectChildOfSiteSegment: function(parent) {
            if (parent.componentType == "MERGE_VIRTUAL_GROUP") {
                return this.isComponentDirectChildOfSiteSegment(parent.realParent);
            }

            return (this.isSiteSegment(parent) || this.isPageComponent(parent));
        },

        getSurface: function(component) {
            return component.layout.width * component.layout.height;
        },

        unifyGroups: function(groups, groupOverflowThreshold) {

            if (groups.length > groupOverflowThreshold) {
                groups.length = 0;
                return;
            }

            var arraySize = -1;
            while (arraySize !== groups.length) {
                arraySize = groups.length;
                for (var i=groups.length-1; i>=0; i--) {
                    for (var j=i-1; j>=0; j--) {
                        if (this.haveCommonElements(groups[i], groups[j])) {
                            this.mergeSecondArrayToFirstOne(groups[j], groups[i]);
                            groups.splice(i,1);
                            break;
                        }
                    }
                }
            }
        },

        mergeSecondArrayToFirstOne: function(arr1, arr2) {
            for (var i=0;i<arr2.length;i++) {
                if (!arr1.contains(arr2[i])) {
                    arr1.push(arr2[i]);
                }
            }
        },

        getComponentFromArray: function(id, componentArray) {
            for (var i=0;i<componentArray.length; i++) {
                if (componentArray[i].id == id) {
                    return componentArray[i];
                }
            }
        },

        filterComponentIdList: function(componentIdList, websiteStructure, filteringFunc) {
            var i=0;
            while (i<componentIdList.length) {
                var curComponent = this.getComponentByIdFromStructure(componentIdList[i], websiteStructure);
                if (curComponent && filteringFunc(curComponent)) {
                    componentIdList.splice(i,1);
                }
                else {
                    i++;
                }
            }
        },

        getComponentIdToItsContainerIdMap: function(component) {
            var ret = {};
            var children = component.components || component.children;
            if (children) {
                for (var i=0; i<children.length; i++) {
                    var curChild = children[i];
                    ret[curChild.id] = component.id;
                    ret = _.merge(ret, this.getComponentIdToItsContainerIdMap(curChild));
                }
            }
            return ret;
        },

        getGroupLayout: function(componentGroup) {
            var leftMostXOfGroup = Number.MAX_VALUE;
            var rightMostXOfGroup = Number.MIN_VALUE;
            var topMostYOfGroup = Number.MAX_VALUE;
            var bottomMostYOfGroup = Number.MIN_VALUE;

            for (var i=0; i<componentGroup.length; i++) {
                var currentComponentLayout = componentGroup[i].layout;
                leftMostXOfGroup = Math.min(leftMostXOfGroup, currentComponentLayout.x);
                rightMostXOfGroup = Math.max(rightMostXOfGroup, currentComponentLayout.x + currentComponentLayout.width);
                topMostYOfGroup = Math.min(topMostYOfGroup, currentComponentLayout.y);
                bottomMostYOfGroup = Math.max(bottomMostYOfGroup, currentComponentLayout.y + currentComponentLayout.height);
            }

            return {
                x: leftMostXOfGroup,
                y: topMostYOfGroup,
                width: rightMostXOfGroup - leftMostXOfGroup,
                height: bottomMostYOfGroup - topMostYOfGroup
            };
        }

    });
});
////