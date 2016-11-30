define.Class('wysiwyg.editor.layoutalgorithms.subprocesses.StructureConverter', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.statics({
        CHILDREN_TREATMENT_METHOD: {
            RESCALE_CHILDREN: "rescaleChildren",
            REORGANIZE_CHILDREN: "reorganizeChildren",
            BACKGROUND_AND_TEXT_CHILDREN: "backgroundAndTextChildren"
        }
    });

    def.methods({

        initialize: function(modules) {
            this._utils = modules.$utils;
            this._config = modules.$config;
            this._textLayoutCalculator = modules.$textLayoutCalculator;
            this._mobileOnlyComponentsHandler = modules.$mobileOnlyComponentsHandler;
            this._virtualGroupHandler = modules.$virtualGroupHandler;
        },

        /////////////////////////////////////////////////////////////////////////////////////
        // updateStructureLayout
        /////////////////////////////////////////////////////////////////////////////////////

        convertStructure: function(structure) {
            if(this._utils.isMasterPage(structure)) {
                this._updateHeaderAndFooterForMobileLayout(structure);
            }
            else { //page
                this.reorganizeChildren(structure, this._config.MOBILE_WIDTH);
            }
        },

        _updateHeaderAndFooterForMobileLayout: function(masterPageStructure) {
            var distancesBetweenSiteSegments = this._getDistancesBetweenSiteSegments(masterPageStructure);

            for (var i=0; i<masterPageStructure.children.length; i++) {
                var child = masterPageStructure.children[i];
                if (child.id == "SITE_FOOTER" || child.id == "SITE_HEADER") {
                    this._rescaleComponentToFitWidth(child, masterPageStructure, this.CHILDREN_TREATMENT_METHOD.REORGANIZE_CHILDREN, this._config.MOBILE_WIDTH, this._config.SITE_SEGMENT_PADDING_X);
                }
            }

            this._updateSiteSegmentLayout(masterPageStructure, distancesBetweenSiteSegments);
        },

        _rescaleComponentToFitWidth: function (currentComponent, container, childrenTreatmentMethod, allowedWidth, marginX) {
            var overrideMargin = this._config.getOverrideMarginFromContainer(currentComponent);
            var newComponentWidth = overrideMargin!== undefined ? allowedWidth - 2 * overrideMargin : allowedWidth - 2 * marginX;
            var rescalingProportion = currentComponent.layout.width / newComponentWidth;

            this._rescaleComponentHeightIfNeeded(currentComponent, rescalingProportion);
            currentComponent.layout.width = newComponentWidth;

            if (currentComponent.components) {
                this._applyContainerRescaleOnChildren(currentComponent, childrenTreatmentMethod, rescalingProportion, newComponentWidth);
            }
        },

        //used once
        _applyContainerRescaleOnChildren: function(currentComponent, childrenTreatmentMethod, rescalingProportion, allowedWidth) {

            if (childrenTreatmentMethod ==  this.CHILDREN_TREATMENT_METHOD.RESCALE_CHILDREN) {
                this._rescaleChildren(currentComponent, rescalingProportion);
            }
            if (childrenTreatmentMethod ==  this.CHILDREN_TREATMENT_METHOD.REORGANIZE_CHILDREN) {
                this._reorganizeChildren(currentComponent, allowedWidth);
            }
            if (childrenTreatmentMethod ==  this.CHILDREN_TREATMENT_METHOD.BACKGROUND_AND_TEXT_CHILDREN) {
                this._setTextAndBackgroundChildren(currentComponent, rescalingProportion);
            }
        },

        //used once
        _setTextAndBackgroundChildren: function(container, rescalingProportion) {
            for (var i=0; i<container.components.length; i++) {
                var curChild = container.components[i];
                curChild.layout.width = Math.round(curChild.layout.width / rescalingProportion);
                curChild.layout.height = Math.round(curChild.layout.height / rescalingProportion);
                curChild.layout.x = Math.round(curChild.layout.x / rescalingProportion);
                curChild.layout.y = Math.round(curChild.layout.y / rescalingProportion);
            }
        },

        //used once
        _rescaleChildren: function(currentComponent, rescalingProportion) {

            for (var i=0; i<currentComponent.components.length; i++) {
                var currentChild = currentComponent.components[i];
                var currentChildLayout = currentChild.layout;

                this._rescaleComponentHeightIfNeeded(currentChild, rescalingProportion, true);
                currentChildLayout.width = Math.round(currentChildLayout.width / rescalingProportion);
                currentChildLayout.x = Math.round(currentChildLayout.x / rescalingProportion);
                currentChildLayout.y = Math.round(currentChildLayout.y / rescalingProportion);

                if (this._utils.isTextComponent(currentChild)) {
                    var compNode = W.Preview.getCompByID(currentChild.id, Constants.ViewerTypesParams.TYPES.DESKTOP);
                    var avgCharactersFontSize = this._textLayoutCalculator.calcAverageCharactersFontSize(compNode);

                    var desiredFontSize = Math.max(avgCharactersFontSize / rescalingProportion, W.Utils.mobile.getMobileDefaultMinFontSize());
                    var defaultTextResizing = W.Utils.mobile.convertFontSizeToMobile(avgCharactersFontSize, 1);
                    currentChild.layout.scale = desiredFontSize / defaultTextResizing;
                }

                if (currentChild.components) {
                    this._rescaleChildren(currentChild, rescalingProportion);
                }
            }
        },

        _rescaleComponentHeightIfNeeded: function(component, rescalingProportion, isPartOfProportionGroup) {

            //if not part of proportion group, then the next component will be after it. that's why
            //we can set text components to minimum - that how it will be bullet proof to enlargment
            //rescaling (and it will enlarge the height as well), and the height will be set afterward
            //automatically
            if (this._utils.isTextComponent(component) && !isPartOfProportionGroup) {
                component.layout.height = 5;
            }
            if (this._doesComponentNeedToRescaleItsHeight(component)) {
                if (this._doesComponentNeedToRescaleToSpecificHeight(component)) {
                    component.layout.height = this._getComponentSpecificHeightToRescale(component);
                }
                else {
                    component.layout.height = Math.round(component.layout.height / rescalingProportion);
                }
            }
        },

        //used once
        _doesComponentNeedToRescaleItsHeight: function(component) {
            if (this._config.COMPONENTS_NOT_NEED_TO_RESCALE_HEIGHT.contains(component.componentType)) {
                return false;
            }
            return true;

        },

        //used once
        _getComponentSpecificHeightToRescale: function(component) {

            var overrideDimensionCalculation = this._config.getOverrideDimension(component);
            if (overrideDimensionCalculation) {
                return overrideDimensionCalculation.height;
            }

            return this._config.COMPONENTS_NEED_RESCALING_TO_SPECIFIC_HEIGHT[component.componentType];
        },

        //used once
        _doesComponentNeedToRescaleToSpecificHeight: function(component) {
            if (this._config.COMPONENTS_NEED_RESCALING_TO_SPECIFIC_HEIGHT[component.componentType]) {
                return true;
            }

            var overrideDimensionCalculation = this._config.getOverrideDimension(component);
            if (overrideDimensionCalculation && overrideDimensionCalculation.height) {
                return true;
            }

            return false;
        },

        //used once
        _updateSiteSegmentLayout: function(masterPageStructure, distances) {
            var headerComponent = this._utils.getHeaderComponent(masterPageStructure);
            var footerComponent = this._utils.getComponentById('SITE_FOOTER', masterPageStructure.children);
            var pagesContainerComponent = this._utils.getComponentById('PAGES_CONTAINER', masterPageStructure.children);

            headerComponent.layout.x = 0;
            headerComponent.layout.y = distances.distanceBetweenHeaderAndTop;

            pagesContainerComponent.layout.x = 0;
            pagesContainerComponent.layout.y = headerComponent.layout.y + headerComponent.layout.height + distances.distanceBetweenPagesContainerAndHeader;

            footerComponent.layout.x = 0;
            footerComponent.layout.y = pagesContainerComponent.layout.y + pagesContainerComponent.layout.height + distances.distanceBetweenFooterAndPagesContainer;
        },

        //used once
        _getDistancesBetweenSiteSegments: function(masterPageStructure) {
            var headerComponent = this._utils.getHeaderComponent(masterPageStructure);
            var footerComponent = this._utils.getComponentById('SITE_FOOTER', masterPageStructure.children);
            var pagesContainerComponent = this._utils.getComponentById('PAGES_CONTAINER', masterPageStructure.children);

            var originalDistanceBetweenHeaderAndTop = headerComponent.layout.y;
            var newDistanceBetweenHeaderAndTop = Math.min(originalDistanceBetweenHeaderAndTop, 10);

            var originalDistanceBetweenPagesContainerAndHeader = pagesContainerComponent.layout.y - (headerComponent.layout.y + headerComponent.layout.height);
            var newDistanceBetweenPagesContainerAndHeader = Math.min(originalDistanceBetweenPagesContainerAndHeader, 10);

            var originalDistanceBetweenFooterAndPagesContainer = footerComponent.layout.y - (pagesContainerComponent.layout.y + pagesContainerComponent.layout.height);
            var newDistanceBetweenFooterAndPagesContainer = Math.min(originalDistanceBetweenFooterAndPagesContainer, 10);

            return {
                distanceBetweenHeaderAndTop: newDistanceBetweenHeaderAndTop,
                distanceBetweenPagesContainerAndHeader: newDistanceBetweenPagesContainerAndHeader,
                distanceBetweenFooterAndPagesContainer: newDistanceBetweenFooterAndPagesContainer
            };
        },

        reorganizeChildren: function(structure, allowedWidth){
            this._addExtraWidthToTextComponents(structure);
            this._reorganizeChildren(structure, allowedWidth);
        },

        _reorganizeChildren: function(component, allowedWidth){

            this.orderComponentsAccordingToGivenOrder(component);

            var componentsInCurrentRow = [];
            var marginX = this._utils.getMarginX(component);
            var topMargin = component.componentType != this._virtualGroupHandler.MERGE_VIRTUAL_GROUP ? this._config.COMPONENT_MOBILE_MARGIN_Y: 0;

            var currentX = marginX;
            var currentY = topMargin;
            var highestComponentOnRow = 0;

            var children = component.components || component.children;

            for (var i=0; i<children.length; i++) {
                var currentComponent = children[i];

                if (this._breakLineNeeded(currentComponent, component, currentX, currentY, allowedWidth)) {
                    this._centerComponentsOfLastRow(component, componentsInCurrentRow, allowedWidth - 2*marginX, currentY);
                    componentsInCurrentRow = [];

                    if (!this._isRescaleComponentToFitReservedSpace(currentComponent) && this._isRowConflictingWithReservedSpace(component, currentY)) {
                        highestComponentOnRow = Math.max(highestComponentOnRow , this._getReservedSpaceConflictingWithRow(component, currentY).height);
                    }

                    if (highestComponentOnRow != 0) {
                        currentY = currentY + highestComponentOnRow + this._config.COMPONENT_MOBILE_MARGIN_Y;
                    }
                    currentX = marginX;
                    highestComponentOnRow = 0;
                }

                this._rescaleComponentIfNeeded(currentComponent, component, allowedWidth, currentX, currentY);

                currentComponent.layout.x = currentX;
                currentComponent.layout.y = currentY;
                currentX = currentX + currentComponent.layout.width + this._config.COMPONENT_MOBILE_MARGIN_X;
                highestComponentOnRow = Math.max(highestComponentOnRow, currentComponent.layout.height);
                componentsInCurrentRow.push(currentComponent);
            }

            //last time...
            this._centerComponentsOfLastRow(component, componentsInCurrentRow, allowedWidth - 2*marginX, currentY);

            this.ensureContainerTightlyWrapsChildren(component);
        },

        orderComponentsAccordingToGivenOrder: function(component) {
            if (!component.components) {
                return;
            }
            component.components.sort(this._sortByComponentsOrder(component.componentsOrder));
        },

        //used once
        _sortByComponentsOrder: function (componentIdsOrder) {
            return function (comp1, comp2) {
                var comp1Index = componentIdsOrder.indexOf(comp1.id);
                var comp2Index = componentIdsOrder.indexOf(comp2.id);
                return comp1Index - comp2Index;
            };
        },
        _centerComponentsOfLastRow: function(container, components, allowedWidth, currentY) {

            if (this._isRowConflictingWithReservedSpace(container, currentY)) {
                return;
            }

            if (components.length==0) {
                return;
            }

            var offsetX = this._utils.getMarginX(container);

            var totalWidth = 0;
            for (var i=0;i<components.length; i++) {
                totalWidth += components[i].layout.width;
            }

            var marginWidth = Math.round((allowedWidth - totalWidth) / (components.length+1));

            var currentXtoPlaceNextComponent = marginWidth;
            for (var i=0; i<components.length; i++) {
                components[i].layout.x = currentXtoPlaceNextComponent + offsetX;
                currentXtoPlaceNextComponent = currentXtoPlaceNextComponent + components[i].layout.width + marginWidth;
            }
        },

        /*
        effective text provide the exact width of a text component, what might lead to letters a bit bigger to
        the line. therefore, we add 5% more to the component width (moved here from StructurePreprocessor)
         */
        _addExtraWidthToTextComponents: function(component) {
            if (this._utils.isTextComponent(component)) {
                component.layout.width *= 1.05;
            }
            var children = component.children || component.components;
            if (children) {
                for (var i=0; i<children.length; i++) {
                    this._addExtraWidthToTextComponents(children[i]);
                }
            }
        },

    //used once
        _rescaleComponentIfNeeded: function (component, container, allowedWidth, currentX, currentY) {
            var marginX = this._utils.getMarginX(container);
            var rescaleComponentToFitWidth = !this._doesComponentWidthFitInRow(component.layout.width, currentX, allowedWidth-marginX) ||
                this._isEnlargeComponentToFitPageWidth(component, container, currentX);

            if (this._isRescaleComponentToFitReservedSpace(component) && this._isRowConflictingWithReservedSpace(container, currentY)) {
                rescaleComponentToFitWidth = true;

                var conflictingReservedSpace = this._getReservedSpaceConflictingWithRow(container, currentY);
                allowedWidth = this._getNonConflictingSpaceInRow(conflictingReservedSpace);
            }

            if (rescaleComponentToFitWidth) {
                var childrenTreatmentMethod;
                if (component.componentType == this._virtualGroupHandler.VIRTUAL_GROUP) {
                    childrenTreatmentMethod = this.CHILDREN_TREATMENT_METHOD.RESCALE_CHILDREN;
                } else if (component.componentType == this._virtualGroupHandler.BACKGROUND_VIRTUAL_GROUP) {
                    childrenTreatmentMethod = this.CHILDREN_TREATMENT_METHOD.BACKGROUND_AND_TEXT_CHILDREN;
                } else {
                    childrenTreatmentMethod = this.CHILDREN_TREATMENT_METHOD.REORGANIZE_CHILDREN;
                }

                this._rescaleComponentToFitWidth(component, container, childrenTreatmentMethod, allowedWidth, marginX);
            }
        },

        //used once
        _isEnlargeComponentToFitPageWidth: function(component, parent, currentX) {
            return this.isComponentDirectChildOfSiteSegment(parent) &&
                currentX <= this._utils.getMarginX(parent) &&
                component.layout.width > (this._config.MOBILE_WIDTH - 2*this._config.SITE_SEGMENT_PADDING_X) * 0.5;
        },

        //used once
        isComponentDirectChildOfSiteSegment: function(parent) {
            if (parent.componentType == this._virtualGroupHandler.MERGE_VIRTUAL_GROUP) {
                return this.isComponentDirectChildOfSiteSegment(parent.realParent);
            }

            return (this._utils.isSiteSegment(parent) || this._utils.isPageComponent(parent));
        },

        ensureContainerTightlyWrapsChildren: function(container, enforceShrinkEvenWithNoChildren) {

            //fix bug MOb-1321: is the container is the masterPage component itself (parent of the show on all pages) - don't do anything
            if (container.children) {
                return;
            }

            var components = container.components || container.children;
            if (!components || (!enforceShrinkEvenWithNoChildren && components.length==0)) {
                return;
            }

            var lowestChildBottom = 0;
            for (var i=0; i<components.length; i++) {
                lowestChildBottom = Math.max(lowestChildBottom, components[i].layout.y + components[i].layout.height);
            }

            var bottomMargin = container.componentType != this._virtualGroupHandler.MERGE_VIRTUAL_GROUP ? this._config.COMPONENT_MOBILE_MARGIN_Y: 0;
            container.layout.height = lowestChildBottom + bottomMargin;
            if (enforceShrinkEvenWithNoChildren) {
                container.layout.height = Math.max(container.layout.height, 50);
            }
        },

        ensureContainerWrapsChildren: function(container) {

            //fix bug MOb-1321: is the container is the masterPage component itself (parent of the show on all pages) - don't do anything
            if (container.children) {
                return;
            }

            var components = container.components || container.children;
            if (!components || components.length==0) {
                return;
            }

            var lowestChildBottom = 0;
            for (var i=0; i<components.length; i++) {
                lowestChildBottom = Math.max(lowestChildBottom, components[i].layout.y + components[i].layout.height);
            }

            var bottomMargin = !this._utils.isPageComponent(container) ? this._config.COMPONENT_MOBILE_MARGIN_Y: 0;
            container.layout.height = Math.max(container.layout.height, lowestChildBottom + bottomMargin);
        },

        _breakLineNeeded: function(currentComponent, container, currentX, currentY, allowedWidth) {
            if (!this._isRescaleComponentToFitReservedSpace(currentComponent) && this._isRowConflictingWithReservedSpace(container, currentY)) {
                var conflictingReservedSpace = this._getReservedSpaceConflictingWithRow(container, currentY);
                allowedWidth = this._getNonConflictingSpaceInRow(conflictingReservedSpace);
            }

            var marginX = this._utils.getMarginX(container);
            var currentComponentNeighbors = this._getComponentNeighborList(currentComponent, container);
            var componentNeighborsTotalWidth = this._getComponentNeighborsTotalWidth(currentComponentNeighbors, container);

            var isComponentFirstItemInNeighborGroup = currentComponentNeighbors[0] && currentComponentNeighbors[0].id == currentComponent.id;
            var doesAllComponentTrailingNeighborGroupFitRow =  this._doesComponentWidthFitInRow(componentNeighborsTotalWidth, currentX, allowedWidth-marginX);
            var doesComponentWidthFitInRow = this._doesComponentWidthFitInRow(currentComponent.layout.width, currentX, allowedWidth-marginX);

            return (!doesComponentWidthFitInRow || (isComponentFirstItemInNeighborGroup && !doesAllComponentTrailingNeighborGroupFitRow));
        },

        _doesComponentWidthFitInRow: function(componentWidth, currentX, allowedWidth) {
            return (currentX + componentWidth < allowedWidth);
        },

        //used once
        _getComponentNeighborsTotalWidth: function(componentNeighbors, container) {
            if (componentNeighbors.length==0) {
                return 0;
            }

            var isPagePaddingNeededOnEdges = this._utils.isSiteSegmentOrPage(container);

            var edgeWidth = isPagePaddingNeededOnEdges ? this._config.SITE_SEGMENT_PADDING_X: this._config.COMPONENT_MOBILE_MARGIN_X;
            var totalWidth = edgeWidth;
            for (var i=0; i<componentNeighbors.length; i++) {
                totalWidth += componentNeighbors[i].layout.width;
                if (i==componentNeighbors.length-1) {
                    totalWidth += edgeWidth;
                }
                else {
                    totalWidth += this._config.COMPONENT_MOBILE_MARGIN_X;
                }
            }

            return totalWidth;
        },

        //used once
        _getComponentNeighborList: function(component, parent) {
            var componentIdRelatedGroup = this._findComponentInGroups(component.id, parent.semanticGroups || []);
            var ret = [];
            for (var i=0;i<componentIdRelatedGroup.length; i++) {
                var neighbor = this._utils.getComponentFromArray(componentIdRelatedGroup[i], parent.components);
                ret.push(neighbor);
            }
            return ret;
        },

        //used once
        _findComponentInGroups: function(componentId, semanticGroups) {
            for (var i=0; i<semanticGroups.length; i++) {
                for (var j=0; j<semanticGroups.length; j++) {
                    if (componentId == semanticGroups[i][j]) {
                        return semanticGroups[i];
                    }
                }
            }
            return [];
        },

        /////////////////////////////////////////////////////////////////////////////////////
        // reserved space
        /////////////////////////////////////////////////////////////////////////////////////
        _isRescaleComponentToFitReservedSpace: function(component) {
            if  (this._config.COMPONENTS_NEED_RESCALING_TO_FIT_RESERVED_SPACE.contains(component.componentType)) {
                return true;
            }
            return false;
        },

        _isRowConflictingWithReservedSpace: function(container, currentY) {
            return (this._getReservedSpaceConflictingWithRow(container, currentY) !== null);
        },

        _getReservedSpaceConflictingWithRow: function(container, currentY) {
            var reservedSpaces = this._getReservedSpaces();
            for (var i=0; i<reservedSpaces.length; i++) {
                var curReservedSpace = reservedSpaces[i];
                if (container.id == curReservedSpace.containerId && currentY <  curReservedSpace.y + curReservedSpace.height) {
                    return curReservedSpace;
                }
            }
            return null;
        },

        //used once
        _getReservedSpaces: function() {
            return this._mobileOnlyComponentsHandler.getMobileOnlyComponentsReservedSpaces();
        },

        _getNonConflictingSpaceInRow: function(conflictingReservedSpace) {
            return (this._config.MOBILE_WIDTH - conflictingReservedSpace.width - this._config.SITE_SEGMENT_PADDING_X);
        }

    });
});
