define.component('wysiwyg.editor.components.panels.DocumentMediaPanel', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.inherits('wysiwyg.editor.components.panels.base.AutoPanel');

    def.resources(['W.Preview', 'W.UndoRedoManager', 'W.Utils']);

    def.binds(['_documentGalleryCallback', '_mediaGalleryCallback', '_docNameInputToDataHook', '_docNameDataToInputHook']);

    def.propertiesSchemaType('DocumentMediaProperties');

    def.dataTypes(['Image']);

    def.methods({
        initialize: function (compId, viewNode, args) {
            this.parent(compId, viewNode, args);
            this._galleryConfigName = args.galleryConfigName || "photos";
            this._htmlCharactersValidator = this._inputValidators.htmlCharactersValidator;
            this._previewComponent = args.previewComponent;
        },

        _docNameInputToDataHook: function (data) {
            return data;
        },

        _docNameDataToInputHook: function (linkRef) {
            var docNameToShow = this._translate('NO_DOCUMENT_SELECTED');
            if (!linkRef) {
                return docNameToShow;
            }

            var previewDataManager = this.resources.W.Preview.getPreviewManagers().Data;
            var linkDataItem = previewDataManager.getDataByQuery(linkRef);

            if (!linkDataItem || !linkDataItem.get) {
                return docNameToShow;
            }
            docNameToShow = linkDataItem.get('name') || '';

            return docNameToShow;
        },

        _createFields: function () {
            var panel = this;

            this.addInputGroupField(function (panel) {
                this.addLabel(this._translate('NO_DOCUMENT_SELECTED'), null, null, null, null, null, null, {'text-overflow': 'ellipsis', 'overflow': 'hidden', 'white-space': 'nowrap', 'width': '100%'})
                    .bindToField('link')
                    .bindHooks(panel._docNameInputToDataHook, panel._docNameDataToInputHook);


                this.addButtonField(null, this._translate('CHOOSE_DOCUMENT'), null, null, 'blueWithArrow', null, null, 'WEditorCommands.OpenMediaFrame', {
                    commandSource: 'panel',
                    galleryConfigID: 'documents',
                    publicMediaFile: 'file_icons',
                    i18nPrefix: 'document',
                    selectionType: 'single',
                    mediaType: 'document',
                    callback: panel._documentGalleryCallback
                });
            });

            this.addInputGroupField(function (panel) {
                this.addLabel(this._translate('DOC_PANEL_ICON'));
                this.addImageField(null, null, null, this._translate('LINK_TO_ICON'), panel._galleryConfigName, false, null, null, null, 'file_icons', 'single_icon', panel._mediaGalleryCallback, null, null, null, 'free')
                    .bindToDataItem(this._data);
            });

            this.addInputGroupField(function (panel) {
                this.addInputField(this._translate('DOC_PANEL_TITLE'), this._translate('DOC_PANEL_TITLE'), 0, 300, {validators: [panel._htmlCharactersValidator]}, null, null).bindToField('title');
                this.addCheckBoxField(this._translate('SHOW_DOCUMENT_TITLE')).bindToProperty('showTitle');
            });

            this.addStyleSelector();
            this.addAnimationButton();
        },

        _onAllSkinPartsReady: function(){
            this.parent();
            this.resources.W.Utils.preventMouseDownOn(this._skinParts.content) ;
        },

        _documentGalleryCallback: function (rawData) {
            this.resources.W.UndoRedoManager.startTransaction();
            this._previewComponent.documentGalleryCallback(rawData);
        },

        _mediaGalleryCallback: function (rawData) {
            this.resources.W.UndoRedoManager.startTransaction();
            this._previewComponent.mediaGalleryCallback(rawData);
        }
    });

});
