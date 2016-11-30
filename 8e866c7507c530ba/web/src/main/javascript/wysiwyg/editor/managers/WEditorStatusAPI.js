/**
 * @class wysiwyg.editor.managers.WEditorStatusAPI
 */
define.Class('wysiwyg.editor.managers.WEditorStatusAPI', function (classDefinition) {
    /**@type  bootstrap.managers.classmanager.ClassDefinition*/
    var def = classDefinition;

    def.inherits('mobile.core.components.base.BaseComponent');

    def.resources(['W.Preview']);

    def.methods({
        initialize: function () {
//            this.parent();
        },

        getSaveInProcess: function () {
            return this._saveInProcess;
        },

        setSaveInProcess: function (boolValue) {
            this._saveInProcess = boolValue;
        },

        setSaveOverride: function (override) {
            this._saveOverride = override;
        },

        getSaveOverride: function () {
            return this._saveOverride;
        },

        setDocumentSaveSucceeded: function () {
            this._documentSaveSuccess = true;
        },

        getDocumentSaveSucceeded: function () {
            return (this._documentSaveSuccess ? true : false);
        },

        isPreviouslyPublished: function () {
            return (this._alreadyPublishedBefore || this.resources.W.Preview.getPreviewSite().window.rendererModel.published);
        },

        markSiteAsPublishedBefore: function () {
            this._alreadyPublishedBefore = true;
        }
    });

});

