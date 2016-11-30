//This file was auto generated when experiment TPA.New was promoted to feature (Sun Aug 05 17:46:56 IDT 2012)
/**@class  wysiwyg.editor.managers.serverfacade.WServerApiUrlsForApps*/
define.Class('wysiwyg.editor.managers.serverfacade.WServerApiUrlsForApps', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.serverfacade.WServerApiUrls');

    /**@lends wysiwyg.editor.managers.serverfacade.WServerApiUrlsForApps*/
    def.methods({
        initialize: function () {
            this._w_constants = Object.merge(this._w_constants, {
                'APPS_PROVISION_URL': '/appStore/provision/{0}',
                'APPS_PRE_SAVE_PROVISION_URL': '/appStore/pre-save-provision/{0}',
                'APPS_COMPLETE_PROVISION_URL': '/appStore/post-save-complete-provision',
                'APPS_DEMO_PRE_SAVE_PROVISION_URL': '/appStore/demo/pre-save-provision/{0}/{1}',
                'APPS_LOAD_DEFINITIONS': '/appStore/{0}',
                'APPS_REVOKE_PERMISSIONS': '/appStore/revoke',
                'APPS_GRANT_PERMISSIONS': '/appStore/grant',

                'APP_DEFINITION_ID_QUERY_PARAM_NAME': "appDefinitionId",
                'APPLICATION_ID': "applicationId",
                'ACCEPT_QUERY_PARAM_NAME': "accept",
                'ACCEPT_QUERY_PARAM_VAL': "json"
            });
        },

        getProvisionAppUrl: function (appDefinitionId) {
            var url = this._getUrlWithQueryParams(this._w_constants.APPS_PROVISION_URL, [appDefinitionId]); // adds session and metasite params
            return this._addJsonParam(url);
        },

        getPreSaveProvisionAppUrl: function (appDefinitionId) {
            var url = this._getUrl(this._w_constants.APPS_PRE_SAVE_PROVISION_URL, [appDefinitionId]);
            return this._addJsonParam(url);
        },

        getCompleteProvisionUrl: function () {
            var url = this._getUrlWithQueryParams(this._w_constants.APPS_COMPLETE_PROVISION_URL);  // adds session and metasite params
            return this._addJsonParam(url);
        },

        getLoadAppDefinitionsUrl: function (collectionType) {
            var url = this._getUrl(this._w_constants.APPS_LOAD_DEFINITIONS, [collectionType]);
            url = this._addAppDefinitionIdParam(url);
            return this._addJsonParam(url);
        },

        getPreSaveDemoProvisionUrl: function (appId) {
            return this._getDemoUrl(this._w_constants.APPS_DEMO_PRE_SAVE_PROVISION_URL, appId);
        },

        getRevokeAppsPermissionsUrl: function (appIds, context) {
            var url = this._getUrlWithQueryParams(this._w_constants.APPS_REVOKE_PERMISSIONS); // adds session and metasite params
            _.forEach(appIds, function(appId) {
                url = this._addQueryParamToUrl(url, this._w_constants.APPLICATION_ID, appId);
            }.bind(this));
            if (context) {
                url = this._addQueryParamToUrl(url, 'context', 'load');
            }
            return this._addJsonParam(url);
        },

        getGrantAppsPermissionsUrl: function (appId, context) {
            var url = this._getUrlWithQueryParams(this._w_constants.APPS_GRANT_PERMISSIONS); // adds session and metasite params
            url = this._addQueryParamToUrl(url, this._w_constants.APPLICATION_ID, appId);
            if (context) {
                url = this._addQueryParamToUrl(url, 'context', 'load');
            }
            return this._addJsonParam(url);
        },

        _getDemoUrl: function (state, appId) {
            var metaSiteId = W.Config.getEditorModelProperty('metaSiteId');
            var url = this._getUrl(state, [metaSiteId, appId], true);
            if (!W.Utils.isValidUrl(url)) {
                LOG.reportError(wixErrors.SERVER_INVALID_SERVICE_URL, 'ServerApiUrls', '_getDemoUrl', url);
            }
            return this._addJsonParam(url);
        },

        getLoadUserAppDefinitionIdsUrl: function () {
            var url = this._getUrl(this._w_constants.APPS_LOAD_DEFINITIONS, ["listForUser"]);
            return this._addJsonParam(url);
        },

        _getUrlBasePart: function () {
            var baseUrl = W.Config.getServiceTopologyProperty("appStoreUrl");
            if (baseUrl) {
                return this._cleanUpUrlEnding(baseUrl);
            } else {
                return undefined;
            }
        },

        _addJsonParam: function (url) {
            return this._addQueryParamToUrl(url, this._w_constants.ACCEPT_QUERY_PARAM_NAME, this._w_constants.ACCEPT_QUERY_PARAM_VAL);
        },

        _getExperimentsApps: function () {
            //add Experimental apps (in form of APP~NAME~GUID:[ON/OFF].
            var runningExperiments = window.editorModel && window.editorModel['runningApps'] || {};
            var SEP = "~";
            var apps = [];

            Object.each(runningExperiments, function (value, key) {
                if (value.toUpperCase() == "ON") {
                    var index = key.lastIndexOf(SEP);
                    var guidLocation = index + 1;
                    if (key.length > guidLocation || index > 0) {
                        var appDefinitionId = key.substr(guidLocation);
                        apps.push(appDefinitionId.trim());
                    }
                }
            }.bind(this));

            return apps;
        },

        _addAppDefinitionIdParam: function (url) {
            // add from query string
            var appDefinitionId = W.Utils.getQueryParam("appDefinitionId");
            if (appDefinitionId) {
                url = this._addQueryParamToUrl(url, this._w_constants.APP_DEFINITION_ID_QUERY_PARAM_NAME, appDefinitionId);
            }

            var experimentsApps = this._getExperimentsApps();
            for (var i = 0; i < experimentsApps.length; i++) {
                url = this._addQueryParamToUrl(url, this._w_constants.APP_DEFINITION_ID_QUERY_PARAM_NAME, experimentsApps[i]);
            }
            return url;
        }
    });
});
