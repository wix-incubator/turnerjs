define.Class('wysiwyg.editor.layoutalgorithms.StructuresComparer', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({

        initialize: function(modules) {
            this._config = modules.$config;
            this._utils = modules.$utils;
            this._virtualGroupHandler = modules.$virtualGroupHandler;
            this._mobileOnlyComponentsHandler = modules.$mobileOnlyComponentsHandler;
        },

        getComponentsExistingInWebsiteButNotInMobile: function(serializedWebsite, serializedMobileSite) {
            var componentsExistingInWebsiteButInMobile = {};
            componentsExistingInWebsiteButInMobile['masterPage'] = this._getComponentIdsAddedToWebStructure(serializedWebsite.masterPage, serializedMobileSite.masterPage, []);

            var mobilePages = _.values(serializedMobileSite.pages);
            var websitePages = _.values(serializedWebsite.pages);

            for (var i=0; i< mobilePages.length; i++) {
                var mobilePage = mobilePages[i];
                for (var j=0; j < websitePages.length;j++) {
                    var webPage = websitePages[j];
                    if (mobilePage.id == webPage.id) {
                        break;
                    }
                }
                componentsExistingInWebsiteButInMobile[mobilePage.id] = this._getComponentIdsAddedToWebStructure(webPage, mobilePage, []);
            }
            return componentsExistingInWebsiteButInMobile;
        },

        _getComponentIdsAddedToWebStructure: function(webStructure, mobileStructure, componentIdsExplicitlyDeletedFromMobileSite) {
            var webComponentIds = this._utils.getStructureComponentIds(webStructure, this._config.isMobileComponent.bind(this._config));

            var mobileComponentIds = this._utils.getStructureComponentIds(mobileStructure);
            var componentsAppearingInWebButNotInMobile =  _.difference(webComponentIds, mobileComponentIds);

            var componentIdsNewlyAddedToWeb =  _.difference(componentsAppearingInWebButNotInMobile, componentIdsExplicitlyDeletedFromMobileSite);
            return componentIdsNewlyAddedToWeb;

        },

        //used once
        _getAncestorContainerExistingInMobile: function(componentId, websiteStructure, mobileSiteStructure) {
            var componentIdToItsContainerIdMap = this._utils.getComponentIdToItsContainerIdMap(websiteStructure);
            var currentParentId = componentIdToItsContainerIdMap[componentId];
            var parent = this._utils.getComponentByIdFromStructure(currentParentId , mobileSiteStructure);
            while (!parent) {
                currentParentId = componentIdToItsContainerIdMap[currentParentId];
                parent = this._utils.getComponentByIdFromStructure(currentParentId , mobileSiteStructure);
            }
            return parent;

        },

        //used once
        _getPreviousComponentIdThatAlsoExistInMobile: function(websiteComponent, websiteStructure, componentId, mobileSiteStructure) {

            if (this._virtualGroupHandler.isVirtualGroup(websiteComponent)) {
                return this._getPreviousComponentIdThatAlsoExistInMobile(this._utils.getContainerOfComponent(websiteComponent.id, websiteStructure), websiteStructure, websiteComponent.id, mobileSiteStructure);
            }

            var componentIndexInOrder = websiteComponent.componentsOrder.indexOf(componentId);
            for (var i=componentIndexInOrder-1; i>=0; i--) {
                var curComponentId = websiteComponent.componentsOrder[i];

                if (curComponentId == 'PAGES_CONTAINER') {
                    continue;
                }

                var curComponent = this._utils.getComponentById(curComponentId, websiteComponent.components || websiteComponent.children);

                if (this._utils.getComponentByIdFromStructure(curComponentId, mobileSiteStructure)) {
                    return curComponentId;
                }

                else if (this._virtualGroupHandler.isVirtualGroup(curComponent)) {
                    for (var j=0; j<curComponent.components.length; j++) {
                        if (this._utils.getComponentByIdFromStructure(curComponent.componentsOrder[j], mobileSiteStructure)) {
                            return curComponent.componentsOrder[j];
                        }
                    }
                }

            }
            return null;
        },

        //used once
        _getComponentIdsDeletedFromWebStructure: function(webStructure, mobileStructure) {
            var webComponentIds = this._utils.getStructureComponentIds(webStructure, this._config.isMobileComponent.bind(this._config));
            var mobileComponentIds = this._utils.getStructureComponentIds(mobileStructure);
            var componentsNewlyDeletedFromWeb =  _.difference(mobileComponentIds, webComponentIds);
            this._mobileOnlyComponentsHandler.removeMobileOnlyComponentsFromComponentIdList(componentsNewlyDeletedFromWeb);
            return componentsNewlyDeletedFromWeb;
        }
    });
});
