define.Class('wysiwyg.editor.layoutalgorithms.subprocesses.StructurePreprocessor', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        initialize: function(modules) {
            this._utils = modules.$utils;
            this._config = modules.$config;
            this._multiLayoutComponentPropertyHandler = modules.$multiLayoutComponentPropertyHandler;
            this._textLayoutCalculator = modules.$textLayoutCalculator;
            this._virtualGroupHandler = modules.$virtualGroupHandler;
        },

        preProcessStructure: function(structure, deletedComponentIdList, extraParams) {
            extraParams = extraParams || {};

            if (!extraParams.keepEmptyTextComponents) {
                this._removeEmptyTextComponentsFromStructure(structure);
            }

            this.setComponentsWithEffectiveLayout(structure);
            this._modifyComponentCharacteristicsToFitMobileLayout(structure);
            this._removeExplicitlyHiddenComponents(structure, deletedComponentIdList);
            this._removeNonMobileComponents(structure, extraParams);

            if (!extraParams.keepOutOfScreenComponents) {
                this._removeOutOfScreenComponentsFromStructure(structure);
            }

            this._reparentComponentsOverlayingContainers(structure);

            if (this._utils.isMasterPage(structure)) {
                this._handleNonHeaderOrFooterMasterPageComponents(structure);
            }

            this._removeComponentBehaviors(structure);

        },

        _removeComponentBehaviors: function(component){
            var children = component.children || component.components;
            if (!children) {
                return;
            }

            for (var i = 0; i < children.length; i++){
                var curChild = children[i];
                delete curChild.behaviors;
                this._removeComponentBehaviors(curChild);
            }
        },

        _removeEmptyTextComponentsFromStructure: function(component) {
            var children = component.children || component.components;
            if (!children) {
                return;
            }
            for (var i=children.length-1; i>=0; i--) {
                var curChild = children[i];
                if (this._utils.isTextComponent(curChild) && this._utils.getTextLength(curChild)===0) {
                    this._utils.removeComponentFromContainer(component, curChild);
                }
                else {
                    this._removeEmptyTextComponentsFromStructure(curChild);
                }
            }
        },

        setComponentsWithEffectiveLayout: function(component) {
            var children = component.components || component.children;
            if (!children) {
                return;
            }
            for (var i = 0; i < children.length; i++) {
                var curChild = children[i];
                this._setSingleComponentWithEffectiveLayout(curChild);
                this.setComponentsWithEffectiveLayout(curChild);
            }
        },

        //used once
        _setSingleComponentWithEffectiveLayout: function (component) {
            var compDesktopNode = W.Preview.getCompByID(component.id, Constants.ViewerTypesParams.TYPES.DESKTOP);
            if (!compDesktopNode) {
                return;
            }

            var compDesktopLogic = compDesktopNode.getLogic();
            component.layout.x = compDesktopLogic.getX();
            component.layout.y = compDesktopLogic.getY();
            component.layout.width = compDesktopLogic.getWidth();

            component.layout.height = compDesktopLogic.getPhysicalHeight();

            if (this._utils.isTextComponent(component)) {
                try {
                    var effectiveTextLayoutBorders = this._textLayoutCalculator.getTextOverallBorders(compDesktopLogic);
                    if (effectiveTextLayoutBorders) {
                        if (!isNaN(effectiveTextLayoutBorders.x) && !isNaN(effectiveTextLayoutBorders.y) && !isNaN(effectiveTextLayoutBorders.width) && !isNaN(effectiveTextLayoutBorders.height)) {
                            component.layout.x = effectiveTextLayoutBorders.x;
                            component.layout.y = effectiveTextLayoutBorders.y;
                            component.layout.width = effectiveTextLayoutBorders.width * 1.05;
                            component.layout.height = effectiveTextLayoutBorders.height;
                        }
                    }
                    else {
                        LOG.reportError(wixErrors.MOBILE_ALGO_EFFECTIVE_TEXT_CALCULATOR_RETURNED_NULL, '_setSingleComponentWithEffectiveLayout', '', compDesktopLogic.getViewNode().textContent);
                    }
                }
                catch (err) {
                    LOG.reportError(wixErrors.MOBILE_ALGO_EFFECTIVE_TEXT_CALCULATOR_FAILED, '_setSingleComponentWithEffectiveLayout', '', err.stack);
                }
            }
        },

        //used once
        _modifyComponentCharacteristicsToFitMobileLayout: function(component) {
            this._multiLayoutComponentPropertyHandler.modifyComponentProperties(component);

            var subComponents = component.components || component.children;
            if (subComponents) {
                for (var i=0; i<subComponents.length; i++) {
                    this._modifyComponentCharacteristicsToFitMobileLayout(subComponents[i]);
                }
            }
        },

        //used once
        _removeExplicitlyHiddenComponents: function (component, deletedComponentIdList) {

            if (!deletedComponentIdList || deletedComponentIdList.length==0) {
                return;
            }

            var children = component.components || component.children;
            if (!children) {
                return;
            }

            var i=0;
            while (i<children.length) {
                var currentComponent = children[i];
                if (deletedComponentIdList.contains(currentComponent.id)) {
                    if (this._utils.isContainer(currentComponent)) {
                        while (currentComponent.components.length>0) {
                            this._utils.reparentComponent(currentComponent.components[0], component, currentComponent);
                        }
                    }
                    children.splice(i,1);
                    continue;
                }
                this._removeExplicitlyHiddenComponents(currentComponent, deletedComponentIdList);
                i++;
            }
        },

        //used once
        _removeNonMobileComponents: function(component, extraParams) {

            var keepNotRecommendedMobileComponents = (extraParams.keepNotRecommendedMobileComponents == true);

            if (component.componentType == this._virtualGroupHandler.MERGE_VIRTUAL_GROUP) {
                return;
            }

            var children = component.components || component.children;
            if (!children) {
                return;
            }
            for (var i=children.length-1; i>=0; i--) {
                var curChild = children[i];
                if (this._config.isNonMobileComponent(curChild) || (!keepNotRecommendedMobileComponents && this._config.isNonMobileRecommendedComponent(curChild))) {
                    this._utils.removeComponentFromContainer(component, curChild);
                }
            }
            for (var i=0; i<children.length; i++) {
                this._removeNonMobileComponents(children[i], extraParams);
            }
        },

        //used once
        _removeOutOfScreenComponentsFromStructure: function(structure) {
            var curGlobalX = 0;
            var curGlobalY;
            if (!this._utils.isMasterPage(structure)) {
                var pagesContainerY = W.Preview.getCompByID("PAGES_CONTAINER", Constants.ViewerTypesParams.TYPES.DESKTOP).getLogic().getY();
                curGlobalY = pagesContainerY;
            }
            else {
                curGlobalY = 0;
            }
            this._removeOutOfScreenComponents(structure, curGlobalX, curGlobalY);
        },

        //used once
        _removeOutOfScreenComponents: function(component, curGlobalX, curGlobalY) {
            var children = component.components || component.children;
            if (!children) {
                return;
            }

            var i=0;
            while (i<children.length) {
                var curChild = children[i];

                var curChildBottom = curChild.layout.y + curChild.layout.height;
                var curChildRight = curChild.layout.x + curChild.layout.width;

                var isOutOfScreen = (curChildBottom + curGlobalY < 0) ||
                    (curChild.layout.x > 1500) ||
                    (curChildRight + curGlobalX < -500);

                if (isOutOfScreen) {
                    this._utils.removeComponentFromContainer(component, curChild);
                }
                else {
                    this._removeOutOfScreenComponents(curChild, curGlobalX + curChild.layout.x, curGlobalY + curChild.layout.y);
                    i++;
                }
            }
        },

        //used once
        _reparentComponentsOverlayingContainers: function(component) {
            var children = component.components || component.children;
            if (!children) {
                return;
            }
            var i=0;
            while (i<children.length) {
                var currentChild = children[i];
                var containerOverlayingChild = this._getContainerOverlayingChild(currentChild, children);
                if (containerOverlayingChild) {
                    this._utils.reparentComponent(currentChild, containerOverlayingChild, component);
                }
                i++;
            }

            for (i=0;i<children.length; i++) {
                this._reparentComponentsOverlayingContainers(children[i]);
            }

        },

        //used once
        _getContainerOverlayingChild: function(component, siblings) {
            if (this._utils.isSiteSegmentOrPage(component)) {
                return null;
            }
            for (var i=0;i<siblings.length; i++) {
                var curSibling = siblings[i];
                if (curSibling.id == component.id) {
                    continue;
                }
                if (!this._utils.isContainer(curSibling) || curSibling.id=="PAGES_CONTAINER") {
                    continue;
                }
                if (this._utils.getSurface(curSibling)<this._utils.getSurface(component)) {
                    continue;
                }
                if (this._utils.areComponentsOverlay(curSibling, component, 0.75)) {
                    return curSibling;
                }
            }
        },

        _handleNonHeaderOrFooterMasterPageComponents: function(masterPageStructure) {

            var headerComponent = this._utils.getComponentById('SITE_HEADER', masterPageStructure.children);
            var footerComponent = this._utils.getComponentById('SITE_FOOTER', masterPageStructure.children);
            var pagesContainerComponent = this._utils.getComponentById('PAGES_CONTAINER', masterPageStructure.children);

            var i=0;
            while (i<masterPageStructure.children.length) {
                var currentChild = masterPageStructure.children[i];
                if (currentChild== headerComponent || currentChild == footerComponent || currentChild == pagesContainerComponent) {
                    i++;
                    continue;
                }

                if (this._utils.areComponentsOverlay(currentChild, headerComponent)) {
                    this._utils.reparentComponent(currentChild, headerComponent, masterPageStructure);
                    continue;
                }
                else if (this._utils.areComponentsOverlay(currentChild, footerComponent)) {
                    this._utils.reparentComponent(currentChild, footerComponent, masterPageStructure);
                    continue;
                }

                else {
                    var siteSegmentToAttachComponent = this._isHeaderCloserToComponentThanFooter(currentChild, masterPageStructure)? headerComponent : footerComponent;
                    this._utils.reparentComponent(currentChild, siteSegmentToAttachComponent, masterPageStructure);
                    continue;
                }

            }
        },

        //used once
        _isHeaderCloserToComponentThanFooter: function(component, masterPageStructure) {
            var middleHeightOfComponent = component.layout.y + (component.layout.height/2);
            var headerComponent = this._utils.getComponentById('SITE_HEADER', masterPageStructure.children);
            var footerComponent = this._utils.getComponentById('SITE_FOOTER', masterPageStructure.children);
            var distanceFromHeader = Math.abs(middleHeightOfComponent - (headerComponent.layout.y + headerComponent.layout.height));
            var distanceFromFooter = Math.abs(middleHeightOfComponent - footerComponent.layout.y);
            return (distanceFromHeader<distanceFromFooter);
        }

    });
});
