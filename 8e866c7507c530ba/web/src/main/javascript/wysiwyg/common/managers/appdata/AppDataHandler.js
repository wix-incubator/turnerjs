define.Class('wysiwyg.managers.appdata.AppDataHandler', function(classDefinition) {
    /** @type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    var originalSpecMap = null;


    def.methods({
        getOriginalAppsData: function () {
            return originalSpecMap;
        },
        getAppsData:function () {
            if (!window.rendererModel) {
                window.rendererModel = {};
            }
            if (!window.rendererModel.clientSpecMap) {
                window.rendererModel.clientSpecMap = {};
            }
            if (!originalSpecMap) {
                originalSpecMap = Object.clone(window.rendererModel.clientSpecMap);
            }
            return window.rendererModel.clientSpecMap;
        },

        registerAppData:function (newAppData) {
            this.getAppsData()[ newAppData.applicationId ] = newAppData;
        },

        getAppData:function (applicationId) {
            return this.getAppsData()[applicationId] || {};
        },

        getAppDataByAppDefinitionId:function (appDefinitionId) {
            return this.getAppDataByAppDefinitionIdOrNull(appDefinitionId) || {};
        },

        getAppDataByAppDefinitionIdOrNull: function (appDefinitionId) {
            var appsData = this.getAppsData();
            return _.find(appsData, function(value) {
                return value.appDefinitionId === appDefinitionId;
            });
        },

        getApplicationId: function(appDefinitionId) {
            var appsData = this.getAppsData();
            return _.findKey(appsData, function(value) {
                return value.appDefinitionId === appDefinitionId;
            });
        },

        getWidgetData:function (applicationId, widgetId) {
            var widgets = this.getAppData(applicationId).widgets || {};
            return widgets[ widgetId ] || {};
        },

        getSiteMembersData:function () {
            var filteredObj = Object.filter(this.getAppsData(), function (item) {
                return item && item.type && item.type.toLowerCase() == "sitemembers";
            });

            var valueArr = Object.values(filteredObj);
            if (valueArr && valueArr.length > 0) {
                return valueArr[0];
            } else {
                return null;
            }
        },

        getWidgetProperty:function (applicationId, widgetId, propName) {
            return this.getWidgetData(applicationId, widgetId)[propName];
        },

        getLargestApplicationId:function () {
            var appsData = this.getAppsData();
            var toInt = function(x) {
                return parseInt(x, 10);
            };

            return _(appsData).keys().map(toInt).filter().concat(0).max().value();
        }
    });
});