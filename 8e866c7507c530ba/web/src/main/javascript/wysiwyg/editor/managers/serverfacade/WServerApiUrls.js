define.Class('wysiwyg.editor.managers.serverfacade.WServerApiUrls', function (classDefinition) {
    /**@type bootstrap.managers.classmanager.ClassDefinition */
    var def = classDefinition;

    def.inherits("core.editor.managers.serverfacade.ServerApiUrls");
    def.fields({_w_constants:{
        'PREVIEW_URL_PART':'/renderer/render/{0}/{1}',
        'PARTIALLY_SAVE_DOCUMENT_URL_PART':'/api/partially_update'
    }});
    def.methods({
        getSitePreviewUrl:function (siteId) {
            return this._getUrl(this._w_constants.PREVIEW_URL_PART, [this.resources.W.Config.getDocumentType(), siteId]);
        },

        getPartiallySaveDocumentUrl:function () {
            return this._getUrlWithQueryParams(this._w_constants.PARTIALLY_SAVE_DOCUMENT_URL_PART);
        }
    });
});