define.Class('wysiwyg.editor.layoutalgorithms.LayoutAlgorithms', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.utilize(['wysiwyg.editor.layoutalgorithms.LayoutAlgoModules']);

    def.methods({
       initialize: function() {
           this._modules = new this.imports.LayoutAlgoModules(function(){
              this._conversionAlgorithm = this._modules.$conversionAlgorithm;
              this._mergeAlgorithm = this._modules.$mergeAlgorithm;
           }.bind(this));

           this._config = this._modules.$config;
           this._utils = this._modules.$utils;
           this._structuresComparer = this._modules.$structuresComparer;
           this._mobileOnlyComponentsHandler = this._modules.$mobileOnlyComponentsHandler;
       },
        

        /////////////////////////////////////////////////////////////////////////////////////
        // PUBLIC METHODS
        /////////////////////////////////////////////////////////////////////////////////////

        runMobileConversionAlgorithm: function(structure, deletedComponentIdList) {
            try {
                this._conversionAlgorithm.runMobileConversionAlgorithm(structure, deletedComponentIdList);
            }
            catch (err) {
                throw {type: "CONVERSION_ALGORITHM_FAILED", stack: err.stack};
            }
        },

        runMobileMergeAlgorithm: function(serializedWebsite, serializedMobileSite, componentIdsExplicitlyDeletedFromMobileSite, ignoreNotRecommendedComponents) {
            try {
                return this._mergeAlgorithm.runMobileMergeAlgorithm(serializedWebsite, serializedMobileSite, componentIdsExplicitlyDeletedFromMobileSite, ignoreNotRecommendedComponents);
            }
            catch (err) {
                throw {type: "MERGE_ALGORITHM_FAILED", stack: err.stack};
            }
        },

        registerClassNameToLayoutAlgo: function(params) {
            this._config.registerClassNameToLayoutAlgo(params);
        },

        getComponentsExistingInWebsiteButNotInMobile: function(serializedWebsite, serializedMobileSite) {
            return this._structuresComparer.getComponentsExistingInWebsiteButNotInMobile(serializedWebsite, serializedMobileSite);
        },

        getStructureComponentIds: function(component, filterFunction) {

            // backward compatibility:
            if (typeOf(filterFunction) == 'boolean' && filterFunction==true) {
                filterFunction = this._config.isMobileComponent.bind(this._config);
            }

            return this._utils.getStructureComponentIds(component, filterFunction);
        },

        filterComponentIdListFromNotReadyForMobile: function(componentIdList, websiteStructure) {
            this._utils.filterComponentIdList(componentIdList, websiteStructure, this._config.isNonMobileComponent.bind(this._config));
        },

        //only in use in SecondaryViewDeletedList, stateless
        getHiddenMobileOnlyComponentIds: function(structure){
            return this._mobileOnlyComponentsHandler.getHiddenMobileOnlyComponentIds(structure);
        },

        addMobileOnlyComponentToStructure: function(compId, structure) {
            this._mobileOnlyComponentsHandler.addMobileOnlyComponentIfNeeded(compId, structure);
        },

        isMobileOnlyComponent: function(compId) {
            return this._mobileOnlyComponentsHandler.isMobileOnlyComponent(compId);
        }
    });
});
