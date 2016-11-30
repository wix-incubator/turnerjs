define.experiment.Class('wysiwyg.editor.managers.serverfacade.ServerFacade.LazyProvision', function (classDefinition, strategy) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.methods({
        _getMetaSiteDataForClone: function () {
            var metaSiteData = this._getMetaSiteDto() || {};
            this._appendMultipleStructureConfig(metaSiteData);
            this._appendClientSpecMapServices(metaSiteData);
            return metaSiteData;
        },

        _appendClientSpecMapServices: function (metaSiteData) {
            var previewManagers = this.resources.W.Preview.getPreviewManagers();
            if (!(previewManagers && previewManagers.Viewer)) {
                return;
            }
            var appDataHandler = previewManagers.Viewer.getAppDataHandler();
            if (!appDataHandler) {
                return;
            }
            var clientSpecMap = appDataHandler.getAppsData();
            if (!clientSpecMap) {
                return;
            }
            var appTypeProjection = {
                wixapps:     [ "type", "applicationId", "appDefinitionId", "datastoreId", "state" ],
                appbuilder:  [ "type", "applicationId", "instanceId", "state" ],
                sitemembers: [ "type", "applicationId", "collectionType",  "smcollectionId" ],
                ecommerce:   [ "type", "applicationId", "appDefinitionId", "magentoStoreId", "state" ],
                tpa:         [ "type", "applicationId", "appDefinitionId", "instanceId", "demoMode" ]
            };
            metaSiteData.services = _.map(clientSpecMap, function (appDef) {
                var fields = appTypeProjection[appDef.type] || appTypeProjection.tpa;
                return _.pick(appDef, fields);
            });
        }
    });
});
