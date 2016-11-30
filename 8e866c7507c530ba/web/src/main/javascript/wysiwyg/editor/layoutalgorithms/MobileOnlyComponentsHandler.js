define.Class('wysiwyg.editor.layoutalgorithms.MobileOnlyComponentsHandler', function (classDefinition) {

    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.utilize([
        'wysiwyg.editor.layoutalgorithms.mobileonlycomponents.TinyMenuLayoutHandler',
        'wysiwyg.editor.layoutalgorithms.mobileonlycomponents.ExitMobileLayoutHandler',
        'wysiwyg.editor.layoutalgorithms.mobileonlycomponents.BackToTopLayoutHandler'
    ]);

    def.methods({

        initialize: function(modules) {
            this._utils = modules.$utils;
            this._config = modules.$config;
            this._modules = modules;
            this._mobileOnlyComponents = [
                new this.imports.TinyMenuLayoutHandler(modules),
                new this.imports.ExitMobileLayoutHandler(modules),
                new this.imports.BackToTopLayoutHandler(modules)
            ];
        },

        _getMobileOnlyComponentIds: function() {
            return this._mobileOnlyComponents.map(function(compHandler){return compHandler.getComponentId();});
        },

        _getMobileOnlyComponentHandler: function(compId) {
            return _.find(this._mobileOnlyComponents, function(obj){return obj.getComponentId()==compId;});
        },

        getMobileOnlyComponentsReservedSpaces: function() {
            var ret = [];
            for (var i=0; i<this._mobileOnlyComponents.length; i++) {
                var curReservedSpace = this._mobileOnlyComponents[i].getReservedSpace();
                if (curReservedSpace) {
                    ret.push(curReservedSpace);
                }
            }
            return ret;
        },

        _isOnHiddenListWhenNotExist: function(compId) {
            return this._getMobileOnlyComponentHandler(compId).isOnHiddenListWhenNotExist();
        },

        removeMobileOnlyComponentsFromComponentIdList: function (componentIdList) {
            var mobileOnlyComponentIds = this._getMobileOnlyComponentIds();
            for (var i = 0; i < mobileOnlyComponentIds.length; i++) {
                var curMobileOnlyComponentId = mobileOnlyComponentIds[i];
                if (componentIdList.contains(curMobileOnlyComponentId)) {
                    componentIdList.splice(componentIdList.indexOf(curMobileOnlyComponentId), 1);
                }
            }
        },

        addMobileOnlyComponentsOnConversion: function (structure) {
            for (var i=0; i<this._mobileOnlyComponents.length; i++) {
                var curComp = this._mobileOnlyComponents[i];
                if (curComp.isAddByDefault()) {
                    this.addMobileOnlyComponentIfNeeded(curComp.getComponentId(), structure);
                    curComp.createAdditionalStylesIfNeeded();
                }
            }
        },

        addMobileOnlyComponentIfNeeded: function(compId, structure) {
            var compHandler = this._getMobileOnlyComponentHandler(compId);

            var compContainerId = compHandler.getDefaultContainerId();
            if (compContainerId!=="SITE_STRUCTURE" && !this._utils.isComponentExistInStructure(compContainerId, structure)) {
                return false;
            }

            if (compHandler.existsInStructure(structure)) {
                return false;
            }
            return compHandler.addToStructure(structure);
        },

        addMobileOnlyComponentsOnMerge: function (hiddenList, mobileSiteStructure) {
            var addedMobileOnlyComponents = [];
            for (var i = 0; i < this._mobileOnlyComponents.length; i++) {
                var curCompId = this._mobileOnlyComponents[i].getComponentId();
                if (this._isOnHiddenListWhenNotExist(curCompId) && !hiddenList.contains(curCompId)) {
                    var wasAdded = this.addMobileOnlyComponentIfNeeded(curCompId, mobileSiteStructure);
                    if (wasAdded) {
                        addedMobileOnlyComponents.push(curCompId);
                    }
                }
            }
            return addedMobileOnlyComponents;
        },

        /*
        supports only singletons that are always on master page
         */
        getHiddenMobileOnlyComponentIds: function(structure) {
            var nonExistingMobileOnlyComponentIdsInStructure = this._mobileOnlyComponents.filter(function(compHandler){return !compHandler.existsInStructure(structure);}).map(function(compHandler){return compHandler.getComponentId();});
            var mobileOnlyCompIdsWithDefaultContainerInStructure = this._mobileOnlyComponents.filter(function(compHandler){return this._utils.isComponentExistInStructure(compHandler.getDefaultContainerId(), structure);}.bind(this)).map(function(compHandler){return compHandler.getComponentId();});
            var mobileOnlyComponentIdsThatCanBeOnHideList = this._mobileOnlyComponents.filter(function(compHandler){return compHandler.isOnHiddenListWhenNotExist();}).map(function(compHandler){return compHandler.getComponentId();});
            return _.intersection(nonExistingMobileOnlyComponentIdsInStructure, mobileOnlyComponentIdsThatCanBeOnHideList, mobileOnlyCompIdsWithDefaultContainerInStructure);
        },

        isMobileOnlyComponent: function(compId) {
            return !!(_.find(this._mobileOnlyComponents, function(compHandler) {
                return compHandler.getComponentId() === compId;
            }));
        }

    });
});
