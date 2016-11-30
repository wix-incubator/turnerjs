define.Class('wysiwyg.editor.layoutalgorithms.subprocesses.VirtualGroupHandler', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.statics({
        VIRTUAL_GROUP: 'VIRTUAL_GROUP',
        BACKGROUND_VIRTUAL_GROUP: 'BACKGROUND_VIRTUAL_GROUP',
        MERGE_VIRTUAL_GROUP: 'MERGE_VIRTUAL_GROUP'
    });

    def.methods({

        initialize: function(modules) {
            this._utils = modules.$utils;
            this._config = modules.$config;
        },

        addVirtualGroupsToStructure: function(structure) {
            this._identifyBackgroundImagesForText(structure);
            this._replaceBackgroundGroupedComponentsToBackgroundVirtualGroups(structure);
            this._identifyOverlayingComponentsAsGroups(structure);
            this._replaceOverlayingGroupedComponentsToVirtualGroups(structure);
            this._cleanUpVirtualGroupsIndentifiers(structure);
        },

    //used once
        _identifyBackgroundImagesForText: function(component) {
            var children = component.components || component.children;
            if (!children) {
                return;
            }
            component.textBackgroundImageGroups = [];
            var i;
            for (i = 0; i < children.length; i++) {
                for (var j = i + 1; j < children.length; j++) {
                    if (this._areComponentsTextAndBackgroundImage(children[i], children[j])) {
                        component.textBackgroundImageGroups.push([children[i].id, children[j].id]);
                    }
                }
            }

            this._utils.unifyGroups(component.textBackgroundImageGroups, 50);

            for (i = 0; i < children.length; i++) {
                this._identifyBackgroundImagesForText(children[i]);
            }
        },

        _areComponentsTextAndBackgroundImage: function(comp1, comp2) {
            var isComp1Text = this._utils.isTextComponent(comp1);
            var isComp2Text = this._utils.isTextComponent(comp2);
            var isComp1Image = this._utils.isImageComponent(comp1);
            var isComp2Image = this._utils.isImageComponent(comp2);
            var isOneOfTheCompsTextAndTheOtherImage = (isComp1Text && isComp2Image) || (isComp2Text && isComp1Image);

            if (!isOneOfTheCompsTextAndTheOtherImage) {
                return false;
            }

            var textComp = isComp1Text? comp1 : comp2;
            var imageComp = isComp1Image? comp1 : comp2;

            if (this._isComponentSuitableForProportionGrouping(textComp)) {
                return false;
            }

            return this._isFirstComponentSurroundedBySecondComponentTightly(textComp, imageComp, 100);
        },

        _getOverlayingComponentsWithGivenComponent: function (specificComponent, components) {

            if (!this._isComponentSuitableForProportionGrouping(specificComponent)) {
                return [];
            }

            var overlayingComponents = [];

            for (var i=0; i<components.length; i++) {
                var currentComponent = components[i];
                if (!this._isComponentSuitableForProportionGrouping(currentComponent)) {
                    continue;
                }
                if (this._utils.areComponentsOverlay(specificComponent, currentComponent, 0.25)) {
                    overlayingComponents.push(currentComponent);
                }
            }
            return overlayingComponents;
        },

        _isComponentSuitableForProportionGrouping: function(component) {

            if (component.componentType == this.BACKGROUND_VIRTUAL_GROUP) {
                return false;
            }

            if (this._utils.isTextComponent(component) && this._utils.getTextLength(component)>this._config.TEXT_MAX_LENGTH_FOR_RESCALING) {
                return false;
            }

            if (!this._config.isSuitableForProportionGrouping(component)) {
                return false;
            }

            if (!component.components) {
                return true;
            }

            var ret = true;
            for (var i=0; i<component.components.length; i++) {
                ret = ret && this._isComponentSuitableForProportionGrouping(component.components[i]);
            }
            return ret;
        },

        //used once
        _isFirstComponentSurroundedBySecondComponentTightly: function(comp1, comp2, tightnessThreshold) {
            var comp1Bottom = comp1.layout.y + comp1.layout.height;
            var comp2Bottom = comp2.layout.y + comp2.layout.height;
            var comp1Right = comp1.layout.x + comp1.layout.width;
            var comp2Right = comp2.layout.x + comp2.layout.width;
            return (
                comp1.layout.x >= comp2.layout.x &&
                    comp1Right <= comp2Right &&
                    comp1.layout.y >= comp2.layout.y &&
                    comp1Bottom <= comp2Bottom &&
                    comp1.layout.x - tightnessThreshold <= comp2.layout.x &&
                    comp1Right + tightnessThreshold >= comp2Right
                );
        },

        //used once
        _replaceBackgroundGroupedComponentsToBackgroundVirtualGroups: function(component) {
            var children = component.components || component.children;
            if (!children) {
                return;
            }

            if (!component.textBackgroundImageGroups) {
                return;
            }

            for (var i=0; i<component.textBackgroundImageGroups.length; i++) {
                var curGroup = component.textBackgroundImageGroups[i];
                var groupComps = this._utils.getComponentsFromIds(component, curGroup);

                var groupLayout = this._getBackgroundGroupLayout(groupComps);
                var id = 'background_virtual_group_' + Math.random();


                var virtualGroup = {
                    componentType: this.BACKGROUND_VIRTUAL_GROUP,
                    components: groupComps,
                    id: id,
                    layout: groupLayout,
                    originalLayout: groupLayout,
                    skin: 'undefined',
                    styleId: 'undefined',
                    type: 'undefined'
                };

                this._setTextLayoutRelativeToImage(groupComps);
                this._utils.removeComponentsFromContainer(component, groupComps);
                this._utils.addComponentsToContainer(component, [virtualGroup]);
            }

            for (var i=0;i<children.length;i++) {
                this._replaceBackgroundGroupedComponentsToBackgroundVirtualGroups(children[i]);
            }
        },

        //used once
        _getBackgroundGroupLayout: function(groupComps) {
            for (var i=0;i<groupComps.length; i++) {
                if (groupComps[i].componentType == 'wysiwyg.viewer.components.WPhoto') {
                    return {
                        x: groupComps[i].layout.x,
                        y: groupComps[i].layout.y,
                        width: groupComps[i].layout.width,
                        height: groupComps[i].layout.height
                    };
                }
            }
        },

        //used once
        _setTextLayoutRelativeToImage: function (groupComps) {
            var originalImageX;
            var originalImageY;
            var i;
            for (i = 0; i < groupComps.length; i++) {
                if (groupComps[i].componentType == 'wysiwyg.viewer.components.WPhoto') {
                    originalImageX = groupComps[i].layout.x;
                    originalImageY = groupComps[i].layout.y;
                }
            }
            for (i = 0; i < groupComps.length; i++) {
                groupComps[i].layout.x = groupComps[i].layout.x - originalImageX;
                groupComps[i].layout.y = groupComps[i].layout.y - originalImageY;
            }
        },

        //used once
        _identifyOverlayingComponentsAsGroups: function(component) {

            if (component.components) {

                component.proportionGroups = component.proportionGroups || [];

                var groups = [];

                var componentClone = _.cloneDeep(component);
                var childrenClone = componentClone.components || componentClone.children;

                while(childrenClone.length>0) {

                    var overlayingComponents = this._getOverlayingComponentsWithGivenComponent(childrenClone[0], childrenClone);
                    if (overlayingComponents.length==0) {
                        this._utils.removeComponentsFromContainer(componentClone, [childrenClone[0]]);
                        continue;
                    }

                    this._utils.removeComponentsFromContainer(componentClone, overlayingComponents);

                    var j=0;
                    while(j<overlayingComponents.length) {
                        var moreOverlayingComponents = this._getOverlayingComponentsWithGivenComponent(overlayingComponents[j], childrenClone);
                        overlayingComponents = overlayingComponents.concat(moreOverlayingComponents);
                        this._utils.removeComponentsFromContainer(componentClone, moreOverlayingComponents);
                        j++;
                    }
                    if (overlayingComponents.length>1) {

                        var overlayingComponentIds = [];
                        for (var i=0;i<overlayingComponents.length; i++) {
                            overlayingComponentIds.push(overlayingComponents[i].id);
                        }

                        groups.push(overlayingComponentIds);

                    }
                }

                component.proportionGroups = component.proportionGroups.concat(groups);

            }

            var children = component.components || component.children;
            if (children) {
                for (var k=0;k<children.length;k++) {
                    this._identifyOverlayingComponentsAsGroups(children[k]);
                }
            }
        },

        //used once
        _replaceOverlayingGroupedComponentsToVirtualGroups: function(component) {
            if (component.proportionGroups) {
                for (var i=0; i<component.proportionGroups.length; i++) {
                    var groupCompIds = component.proportionGroups[i];
                    if (!this._utils.validateGroupCompIds(groupCompIds, component.components)) {
                        continue;
                    }
                    var groupComps = this._utils.getComponentsFromIds(component, groupCompIds);
                    var virtualGroup = this.createVirtualGroup(groupComps);
                    this._utils.removeComponentsFromContainer(component, groupComps);
                    this._utils.addComponentsToContainer(component, [virtualGroup]);
                }
            }

            var children = component.children || component.components;

            if (!children) {
                return;
            }
            for (var i=0; i<children.length; i++) {
                this._replaceOverlayingGroupedComponentsToVirtualGroups(children[i]);
            }
        },

        replaceBackGroupsToFlatComponents: function(container) {

            var components = container.components || container.children;

            if (!components) {
                return;
            }
            var virtualGroupsToRemove = [];
            var i=0;
            while (i<components.length) {
                var currentChild = components[i];
                if (currentChild.componentType == this.VIRTUAL_GROUP || currentChild.componentType == this.MERGE_VIRTUAL_GROUP) {
                    this._updateContainerComponentsLayoutToBeRelativeToContainerParent(currentChild);
                    this._utils.addComponentsToContainer(container, currentChild.components,i+1);
                    virtualGroupsToRemove.push(currentChild);
                }
                if (currentChild.componentType == this.BACKGROUND_VIRTUAL_GROUP) {
                    this._updateBackgroundImageTextComponentLayout(currentChild);
                    this._utils.addComponentsToContainer(container, currentChild.components,i+1);
                    virtualGroupsToRemove.push(currentChild);
                }
                i++;
            }
            this._utils.removeComponentsFromContainer(container, virtualGroupsToRemove);

            for (var i=0; i<components.length; i++) {
                this.replaceBackGroupsToFlatComponents(components[i]);
            }

        },

        //used once
        _updateBackgroundImageTextComponentLayout: function(virtualContainer) {
            for (var i=0;i<virtualContainer.components.length; i++) {
                var currentChild =  virtualContainer.components[i];
                currentChild.layout.x += virtualContainer.layout.x;
                currentChild.layout.y += virtualContainer.layout.y;
            }
        },

        _updateContainerComponentsLayoutToBeRelativeToContainerParent: function(container) {
            this._utils.shiftGroupComponents(container.components, (-1)*container.layout.x, (-1)*container.layout.y);
        },

        //used once
        flattenComponentsToInsertFromVirtualGroups: function(componentsToInsertMap, componentIdsAddedToWebStructure) {
            for (var i=0; i<componentsToInsertMap.length; i++) {
                var curComponentToAdd = componentsToInsertMap[i].componentToAdd[0];
                if (curComponentToAdd.componentType == this.VIRTUAL_GROUP || curComponentToAdd.componentType == this.BACKGROUND_VIRTUAL_GROUP) {
                    this._updateContainerComponentsLayoutToBeRelativeToContainerParent(curComponentToAdd);
                    var realComponents = curComponentToAdd.components;
                    componentsToInsertMap[i].componentToAdd = realComponents;
                }
                this.replaceBackGroupsToFlatComponents(curComponentToAdd);
            }

            //if virtual groups consisted present components -> remove them
            for (var i=0; i<componentsToInsertMap.length; i++) {
                for (var j=componentsToInsertMap[i].componentToAdd.length-1; j>=0; j--) {
                    if (!componentIdsAddedToWebStructure.contains(componentsToInsertMap[i].componentToAdd[j].id)) {
                        componentsToInsertMap[i].componentToAdd.splice(j,1);
                    }
                }
            }
        },

        _cleanUpVirtualGroupsIndentifiers: function(component) {
            delete component.proportionGroups;
            delete component.textBackgroundImageGroups;

            var children = component.components || component.children;
            if (children) {
                for (var i=0; i<children.length ;i++) {
                    this._cleanUpVirtualGroupsIndentifiers(children[i]);
                }
            }
        },

        createVirtualGroup: function (groupComps, isMergeVirtualGroup, realParent) {
            var groupLayout = this._utils.getGroupLayout(groupComps);
            var id = (isMergeVirtualGroup? 'merge_virtual_group_' :'virtual_group_') + Math.random();
            var groupData = {
                componentType: isMergeVirtualGroup? this.MERGE_VIRTUAL_GROUP : this.VIRTUAL_GROUP,
                components: groupComps,
                id: id,
                layout: groupLayout,
                originalLayout: groupLayout,
                skin: 'undefined',
                styleId: 'undefined',
                type: 'undefined'
            };

            if (isMergeVirtualGroup) {
                groupData['realParent'] = realParent;
            }

            this._utils.shiftGroupComponents(groupComps, groupLayout.x, groupLayout.y);
            return groupData;
        },

        isVirtualGroup: function(component, includeMergeVirtualGroup) {
            if (component.componentType == this.VIRTUAL_GROUP || component.componentType == this.BACKGROUND_VIRTUAL_GROUP) {
                return true;
            }
            if (includeMergeVirtualGroup && component.componentType == this.MERGE_VIRTUAL_GROUP) {
                return true;
            }
            return false;
        }

    });
});
