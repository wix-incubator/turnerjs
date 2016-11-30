define.Class("wysiwyg.editor.managers.serverfacade.WServerApiUrlsForSiteMembers", function(classDefinition) {
    var def = classDefinition;

    def.inherits('wysiwyg.editor.managers.serverfacade.WServerApiUrls');
    def.methods({
        initialize: function(compId, viewNode, args){
            this.parent(compId, viewNode, args);
            this._w_constants  = Object.merge(this._w_constants, {
                'SM_PROVISION_URL': '/api/lifecycle/provision/{0}',
                'SM_PRE_SAVE_PROVISION_URL': '/api/lifecycle/beforeMetaSiteSaveProvision',
                'SM_COMPLETE_PROVISION_URL': '/api/lifecycle/afterMetaSiteSaveProvision/{0}/{1}',

                'ACCEPT_JSONP_QUERY_PARAM_KEY': 'accept',
                'ACCEPT_JSONP_QUERY_PARAM_VALUE': 'jsonp'
            });
        },

        getProvisionUrl: function () {
            var metaSiteId = W.Config.getEditorModelProperty('metaSiteId');
            var url =  this._getUrl(this._w_constants.SM_PROVISION_URL, [metaSiteId]);
            url = this._addAcceptJSONPParam( url );
            return url;
        },

        getPreSaveProvisionUrl: function () {
            var url =  this._getUrl(this._w_constants.SM_PRE_SAVE_PROVISION_URL);
            url = this._addAcceptJSONPParam( url );
            return url;
        },

        getCompleteProvisionUrl: function (smCollectionGuid) {
            var metaSiteId = W.Config.getEditorModelProperty('metaSiteId');
            var url = this._getUrl(this._w_constants.SM_COMPLETE_PROVISION_URL, [metaSiteId, smCollectionGuid]);
            url = this._addAcceptJSONPParam( url );
            return url;
        },

        _getUrlBasePart: function () {
            var baseUrl = W.Config.getServiceTopologyProperty("siteMembersUrl");
            if (baseUrl) {
                return this._cleanUpUrlEnding(baseUrl);
            } else {
                return undefined;
            }
        },

        _addAcceptJSONPParam: function (url) {
            return this._addQueryParamToUrl(url, this._w_constants.ACCEPT_JSONP_QUERY_PARAM_KEY, this._w_constants.ACCEPT_JSONP_QUERY_PARAM_VALUE);
        }
    });
});