define.Class('wysiwyg.editor.components.addviamediagallery.DocumentMediaStrategy', function (def) {
    def.inherits('wysiwyg.editor.components.addviamediagallery.BaseStrategy');

    def.fields({
        compType: 'addDocumentMedia',
        compClass: 'wysiwyg.viewer.components.documentmedia.DocumentMedia'
    });

    def.utilize(['wysiwyg.editor.utils.InputValidators']);

    def.methods({
        extractMediaGalleryData: function (rawDocumentData) {
            var createDocumentLinkResult = this._createDocumentLink(rawDocumentData);
            var zeroWidthSpacesRemover = new this.imports.InputValidators().zeroWidthSpacesRemover;

            return {
                'link': '#' + createDocumentLinkResult.id,
                'title': zeroWidthSpacesRemover(rawDocumentData.title),
                'description': rawDocumentData.description || '',
                'uri': this._getThumbnailUri(rawDocumentData),
                'width': 60,
                'height': 60
            };
        },
        _getThumbnailUri: function (rawDocumentData) {
            var thumbnailUrl = rawDocumentData.thumbnailUrl;
            thumbnailUrl = thumbnailUrl.replace('media/', '');
            var thumbnailArray = thumbnailUrl.split('/');

            return thumbnailArray[thumbnailArray.length - 1];
        },
        computeLayout: function () {
            return {
                width: 60,
                height: 60
            };
        },
        _createDocumentLink: function (rawDocumentData) {
            var linkDataItem = this.resources.W.Data.createDataItem({
                    type: 'DocumentLink',
                    name: rawDocumentData.title,
                    docId: rawDocumentData.uri
                });

            var previewDataManager = this._getViewerDataManager();
            return previewDataManager.addDataItemWithUniqueId("", linkDataItem.getData());
        },
        _getViewerDataManager: function () {
            if (W.Config.env.$isEditorFrame) {
                return W.Preview.getPreviewManagers().Data;
            }
            return this.resources.W.Data;
        }
    });
}); 
